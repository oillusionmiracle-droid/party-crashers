import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
import webpush from 'npm:web-push@3.6.7';
import {endpointHash,pushMatches,safePushSubscription} from '../_shared/push.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const check=(r:any)=>{if(r.error)throw new Error('Push storage operation failed');return r.data};
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const token=req.headers.get('x-pc-collector-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
 const config=await db.from('pc_collector_config').select('token_hash,enabled').eq('id','push-delivery').maybeSingle();
 if(config.error||!config.data?.enabled||config.data.token_hash!==await endpointHash(token))return json({error:'Unauthorized'},401);
 const owner=crypto.randomUUID(),now=new Date();
 const lease=check(await db.from('pc_collector_config').update({lease_owner:owner,lease_until:new Date(+now+90000).toISOString()}).eq('id','push-delivery').lt('lease_until',now.toISOString()).select('id'));if(!lease?.length)return json({ok:true,busy:true});
 let sent=0,skipped=0,failed=0;
 try{
  let keys=check(await db.rpc('pc_read_push_keys'));if(!keys){const pair=webpush.generateVAPIDKeys();check(await db.rpc('pc_initialize_push_keys',{pub:pair.publicKey,priv:pair.privateKey}));keys=check(await db.rpc('pc_read_push_keys'));}
  const body=await req.json().catch(()=>({}));if(body.initializeOnly){
   // Exercise encryption in the actual Edge runtime without sending a notification.
   const recipient=webpush.generateVAPIDKeys();const auth=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   const details=webpush.generateRequestDetails({endpoint:'https://fcm.googleapis.com/fcm/send/pc-encryption-self-test',keys:{p256dh:recipient.publicKey,auth}},'{"title":"Encryption self-test"}',{vapidDetails:{subject:'https://party-crashers-seven.vercel.app/privacy/',publicKey:keys.publicKey,privateKey:keys.privateKey},TTL:60,contentEncoding:'aes128gcm'});
   return json({ok:true,keysReady:Boolean(keys?.publicKey),encryptionReady:details.body.length>0});
  }
  const jobs=check(await db.from('pc_push_jobs').select('*').eq('status','pending').lte('available_at',now.toISOString()).order('created_at').limit(25))||[];
  const deadline=Date.now()+45000;
  for(const job of jobs){if(Date.now()>deadline)break;
   const subscription=check(await db.from('pc_push_subscriptions').select('*').eq('endpoint_hash',job.endpoint_hash).maybeSingle());
   const event=job.event_id?check(await db.from('pc_events').select('record,status').eq('id',job.event_id).maybeSingle()):null;
   if(!subscription?.enabled||(job.kind==='new-event'&&(!event||!pushMatches({...event.record,status:event.status},subscription.preferences)))){
    check(await db.from('pc_push_jobs').update({status:'skipped',finished_at:new Date().toISOString()}).eq('id',job.id));skipped++;continue;
   }
   const payload=job.kind==='test'?{title:'Party Crashers notifications are on',body:'New events matching your interests and area will appear here.',url:'/#profile',tag:'pc-test'}:{title:event.record.title,body:`${event.record.category} · ${event.record.area} · ${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Africa/Lagos'}).format(new Date(event.record.startDate))}`,url:'/#event/'+encodeURIComponent(job.event_id),tag:'pc-event-'+job.event_id};
   try{
    // Endpoint allowlist prevents push subscriptions being used for arbitrary server requests.
    const sub=safePushSubscription(subscription.subscription);
    const details=webpush.generateRequestDetails(sub,JSON.stringify(payload),{vapidDetails:{subject:'https://party-crashers-seven.vercel.app/privacy/',publicKey:keys.publicKey,privateKey:keys.privateKey},TTL:Math.max(60,Math.min(21600,job.kind==='test'?300:Math.floor((Date.parse(event.record.endDate)-Date.now())/1000))),urgency:'normal',contentEncoding:'aes128gcm'});
    const response=await fetch(details.endpoint,{method:'POST',headers:details.headers,body:new Uint8Array(details.body),redirect:'error',signal:AbortSignal.timeout(7000)});
    if(response.status===404||response.status===410){check(await db.from('pc_push_subscriptions').delete().eq('endpoint_hash',job.endpoint_hash));skipped++;continue;}
    if(!response.ok)throw {statusCode:response.status};
    check(await db.from('pc_push_jobs').update({status:'sent',attempts:job.attempts+1,finished_at:new Date().toISOString(),error_code:null}).eq('id',job.id));sent++;
   }catch(error:any){const attempts=job.attempts+1;check(await db.from('pc_push_jobs').update({attempts,status:attempts>=4?'failed':'pending',available_at:new Date(Date.now()+Math.min(3600,60*2**attempts)*1000).toISOString(),error_code:String(Number(error?.statusCode)||'delivery-failed')}).eq('id',job.id));failed++;}
  }
  check(await db.from('pc_push_jobs').delete().neq('status','pending').lt('created_at',new Date(Date.now()-30*86400000).toISOString()));
  return json({ok:true,sent,skipped,failed});
 }catch{return json({error:'Push delivery unavailable'},503)}finally{await db.from('pc_collector_config').update({lease_owner:null,lease_until:new Date().toISOString()}).eq('id','push-delivery').eq('lease_owner',owner);}
});
