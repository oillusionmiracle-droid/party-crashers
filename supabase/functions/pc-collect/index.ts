import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
import {SOURCES,parseSource,duplicateScore,validateRecord} from './adapters.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
function checked<T extends {error:any}>(r:T):T{if(r.error)throw new Error('Import database operation failed');return r}
async function fetchBody(url:string){const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json,text/html','User-Agent':'PartyCrashersEventSync/1.0'}});if(!response.ok)throw new Error('Organizer returned HTTP '+response.status);const reader=response.body!.getReader();let size=0,parts:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000){await reader.cancel();throw new Error('Source size limit exceeded')}parts.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}return new TextDecoder().decode(bytes)}
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);const token=req.headers.get('x-pc-collector-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(n=>n.toString(16).padStart(2,'0')).join('');const config=await db.from('pc_collector_config').select('token_hash,enabled').eq('id','techfeast').maybeSingle();if(config.error||!config.data?.enabled||config.data.token_hash!==hash)return json({error:'Unauthorized'},401);
 const owner=crypto.randomUUID(),now=new Date().toISOString();const lease=await db.from('pc_collector_config').update({lease_until:new Date(Date.now()+180000).toISOString(),lease_owner:owner}).eq('id','techfeast').lt('lease_until',now).select('id');if(lease.error)return json({error:'Collector unavailable'},503);if(!lease.data?.length)return json({ok:true,skipped:'Another import is running'});
 try{
 const sources=checked(await db.from('pc_sources').select('id,enabled,consecutive_failures'));const results=[];
 for(const source of SOURCES){const settings=sources.data?.find(s=>s.id===source.id);if(!settings?.enabled)continue;const run=checked(await db.from('pc_import_runs').insert({source:source.id,status:'running'}).select('id').single());let imported=0,skipped=0;
 try{
  checked(await db.from('pc_sources').update({last_attempt_at:now}).eq('id',source.id));const items=parseSource(source,await fetchBody(source.url));
  const catalog=checked(await db.from('pc_events').select('id,owner_id,status,record').limit(2000)).data||[];
  const links=checked(await db.from('pc_event_sources').select('*').eq('source_id',source.id)).data||[];
  const candidates=checked(await db.from('pc_import_candidates').select('id,status,record').eq('source_id',source.id)).data||[];const seen=new Set<string>();
  for(const item of items){seen.add(item.externalId);const link=links.find(l=>l.external_id===item.externalId);
   if(item.cancelled){if(link){checked(await db.from('pc_event_sources').update({status:'cancelled',last_seen_at:now}).eq('source_id',source.id).eq('external_id',item.externalId));const others=checked(await db.from('pc_event_sources').select('external_id').eq('event_id',link.event_id).eq('status','active'));if(!others.data?.length)checked(await db.from('pc_events').update({status:'archived'}).eq('id',link.event_id).is('owner_id',null));}skipped++;continue}
   let record=item.record;const candidate=candidates.find(c=>c.id===item.externalId);if(candidate?.status==='rejected'){skipped++;continue}
   if(candidate?.status==='approved'){record={...record,...Object.fromEntries(['venueName','address','area','latitude','longitude','coordinateSource','venueApproximate'].map(k=>[k,candidate.record[k]]))}}
   if(!validateRecord(record)||item.reason&&candidate?.status!=='approved'){
    if(!candidate)checked(await db.from('pc_import_candidates').insert({id:item.externalId,source_id:source.id,record,reason:item.reason||'Incomplete or invalid event fields'}));else if(candidate.status==='pending')checked(await db.from('pc_import_candidates').update({record,reason:item.reason||'Incomplete or invalid event fields',updated_at:now}).eq('id',item.externalId).eq('status','pending'));
    skipped++;continue;
   }
   const existing=catalog.find(e=>e.id===(link?.event_id||record.id))||catalog.find(e=>e.status==='published'&&!e.owner_id&&duplicateScore(record,e.record)>=.85);
   if(existing?.owner_id){skipped++;continue}const id=existing?.id||record.id;
   if(existing){const sameSource=existing.record.sourceName===record.sourceName;record={...(sameSource?record:existing.record),id,firstDiscoveredAt:existing.record.firstDiscoveredAt,lastVerifiedAt:now,sources:[...new Map([...(existing.record.sources||[{name:existing.record.sourceName,url:existing.record.sourceUrl}]),{name:item.record.sourceName,url:item.record.sourceUrl}].map(s=>[s.url,s])).values()]}}
   checked(await db.from('pc_events').upsert({id,owner_id:null,status:'published',start_date:record.startDate,location:`SRID=4326;POINT(${record.longitude} ${record.latitude})`,record},{onConflict:'id'}));checked(await db.from('pc_event_sources').upsert({source_id:source.id,external_id:item.externalId,event_id:id,status:'active',last_seen_at:now,missing_count:0},{onConflict:'source_id,external_id'}));
   const index=catalog.findIndex(e=>e.id===id);const row={id,owner_id:null,status:'published',record};if(index>=0)catalog[index]=row;else catalog.push(row);imported++;
  }
  // Absence is flagged for review, never interpreted as an explicit cancellation.
  for(const link of links.filter(l=>l.status==='active'&&!seen.has(l.external_id))){const missing=link.missing_count+1;checked(await db.from('pc_event_sources').update({missing_count:missing,status:missing>=2?'missing':'active'}).eq('source_id',source.id).eq('external_id',link.external_id));if(missing>=2&&!candidates.some(c=>c.id==='missing-'+link.external_id)){const old=catalog.find(e=>e.id===link.event_id);if(old)checked(await db.from('pc_import_candidates').upsert({id:'missing-'+link.external_id,source_id:source.id,record:old.record,reason:'Listing absent from two complete imports; confirm with organizer before removing',status:'pending'},{onConflict:'id',ignoreDuplicates:true}))}}
  checked(await db.from('pc_import_runs').update({status:'success',finished_at:new Date().toISOString(),imported,skipped}).eq('id',run.data.id));checked(await db.from('pc_sources').update({last_success_at:new Date().toISOString(),last_error:null,consecutive_failures:0}).eq('id',source.id));results.push({source:source.id,ok:true,imported,skipped});
 }catch(error){const message=error instanceof Error?error.message.slice(0,200):'Import failed';await db.from('pc_import_runs').update({status:'failed',finished_at:new Date().toISOString(),imported,skipped,error:message}).eq('id',run.data.id);await db.from('pc_sources').update({last_error:message,consecutive_failures:settings.consecutive_failures+1}).eq('id',source.id);results.push({source:source.id,ok:false})}
 }
 return json({ok:results.every(r=>r.ok),results});
 }catch{return json({error:'Collector unavailable'},503)}finally{await db.from('pc_collector_config').update({lease_until:new Date().toISOString(),lease_owner:null}).eq('id','techfeast').eq('lease_owner',owner)}
});
