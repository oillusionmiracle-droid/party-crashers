import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
import {SOURCE,normalize} from './normalize.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
function json(v:unknown,status=200){return new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}})}
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const token=req.headers.get('x-pc-collector-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(n=>n.toString(16).padStart(2,'0')).join('');
 const config=await db.from('pc_collector_config').select('token_hash,enabled').eq('id','techfeast').maybeSingle();
 if(config.error||!config.data?.enabled||config.data.token_hash!==hash)return json({error:'Unauthorized'},401);
 const run=await db.from('pc_import_runs').insert({source:'techfeast',status:'running'}).select('id').single();if(run.error)return json({error:'Collector unavailable'},503);
 let imported=0,skipped=0;
 try{
  const response=await fetch(SOURCE,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json','User-Agent':'PartyCrashersEventSync/1.0'}});
  if(!response.ok)throw new Error('Organizer feed returned HTTP '+response.status);
  // Cap bytes while streaming, including responses without Content-Length.
  const reader=response.body!.getReader();let size=0;const parts:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000){await reader.cancel();throw new Error('Organizer feed exceeded size limit')}parts.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}
  const feed=JSON.parse(new TextDecoder().decode(bytes));if(!Array.isArray(feed.events)||feed.events.length>50)throw new Error('Unexpected organizer feed');
  for(const event of feed.events){const record=normalize(event);if(!record){skipped++;continue}
   const old=await db.from('pc_events').select('owner_id,record').eq('id',record.id).maybeSingle();if(old.error)throw new Error('Event lookup failed');if(old.data?.owner_id){skipped++;continue}
   if(old.data?.record?.firstDiscoveredAt)record.firstDiscoveredAt=old.data.record.firstDiscoveredAt;
   const saved=await db.from('pc_events').upsert({id:record.id,owner_id:null,status:'published',start_date:record.startDate,location:`SRID=4326;POINT(${record.longitude} ${record.latitude})`,record},{onConflict:'id'});if(saved.error)throw new Error('Event save failed');imported++;
  }
  const finished=await db.from('pc_import_runs').update({status:'success',finished_at:new Date().toISOString(),imported,skipped}).eq('id',run.data.id);if(finished.error)throw new Error('Could not record sync status');
  return json({ok:true,imported,skipped,source:'techfeast'});
 }catch(error){const message=error instanceof Error?error.message.slice(0,200):'Import failed';await db.from('pc_import_runs').update({status:'failed',finished_at:new Date().toISOString(),imported,skipped,error:message}).eq('id',run.data.id);return json({error:'Import failed; existing events were preserved.'},502)}
});
