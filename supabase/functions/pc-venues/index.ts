import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
import {endpointHash} from '../_shared/push.ts';
import {resolveVenue} from '../_shared/venues.ts';
import {locate} from '../pc-collect/adapters.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const json=(d:unknown,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json'}});
const check=(r:any)=>{if(r.error)throw new Error('Venue lookup failed');return r.data};
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const token=req.headers.get('x-pc-collector-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
 const config=await db.from('pc_collector_config').select('token_hash,enabled').eq('id','venue-lookup').maybeSingle();
 if(config.error||!config.data?.enabled||config.data.token_hash!==await endpointHash(token))return json({error:'Unauthorized'},401);
 const owner=crypto.randomUUID(),now=new Date();
 const lease=check(await db.from('pc_collector_config').update({lease_owner:owner,lease_until:new Date(+now+90000).toISOString()}).eq('id','venue-lookup').lt('lease_until',now.toISOString()).select('id'));if(!lease?.length)return json({ok:true,busy:true});
 let located=0;
 try{
  for(const table of ['pc_import_candidates','pc_events']){
   const rows=check(await db.from(table).select('id,record').eq('status',table==='pc_events'?'published':'pending').is('record->>latitude',null).order('record->>venueLookupAt',{ascending:true,nullsFirst:true}).limit(20))||[];
   const item=rows.find((r:any)=>r.record.format!=='online'&&(!r.record.venueLookupAt||Date.now()-Date.parse(r.record.venueLookupAt)>86400000));if(!item)continue;
   const record=await resolveVenue(db,locate(item.record));record.venueLookupAt=new Date().toISOString();
   const patch:any={record};if(table==='pc_events'&&Number.isFinite(record.latitude)&&Number.isFinite(record.longitude))patch.location=`SRID=4326;POINT(${record.longitude} ${record.latitude})`;
   check(await db.from(table).update(patch).eq('id',item.id).eq('record',JSON.stringify(item.record)).eq('status',table==='pc_events'?'published':'pending'));
   if(Number.isFinite(record.latitude))located++;
  }
  return json({ok:true,located});
 }catch{return json({error:'Venue lookup temporarily unavailable'},503)}finally{await db.from('pc_collector_config').update({lease_owner:null,lease_until:new Date().toISOString()}).eq('id','venue-lookup').eq('lease_owner',owner)}
});
