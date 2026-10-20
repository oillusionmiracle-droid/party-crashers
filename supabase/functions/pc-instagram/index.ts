import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
import {endpointHash} from '../_shared/push.ts';
import {readInstagram} from './client.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const json=(data:unknown,status=200)=>Response.json(data,{status});
const checked=(r:any)=>{if(r.error)throw new Error('database_error');return r.data};
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const token=req.headers.get('x-pc-collector-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
 const config=await db.from('pc_collector_config').select('token_hash,enabled').eq('id','instagram-sync').maybeSingle();
 if(config.error||!config.data?.enabled||config.data.token_hash!==await endpointHash(token))return json({error:'Unauthorized'},401);
 const owner=crypto.randomUUID(),now=new Date().toISOString();
 const lease=checked(await db.from('pc_collector_config').update({lease_owner:owner,lease_until:new Date(Date.now()+90000).toISOString()}).eq('id','instagram-sync').lt('lease_until',now).select('id'));if(!lease?.length)return json({ok:true,busy:true});
 try{
  const result=await readInstagram(Deno.env.get('INSTAGRAM_ACCESS_TOKEN')||'');
  if(result.posts.length)checked(await db.from('pc_social_posts').upsert(result.posts,{onConflict:'platform,post_id'}));
  checked(await db.from('pc_social_posts').delete().eq('platform','instagram').lt('discovered_at',new Date(Date.now()-30*86400000).toISOString()));
  checked(await db.from('pc_instagram_status').upsert({id:'main',status:'connected',username:result.username,last_attempt_at:now,last_success_at:now,posts_read:result.posts.length,error:null}));
  return json({ok:true,username:result.username,postsRead:result.posts.length});
 }catch(e){const reason=e instanceof Error&&/^(missing_token|instagram_http_\d+_code_\d+|missing_account_id|response_too_large|invalid_response|database_error)$/.test(e.message)?e.message:'connection_failed';await db.from('pc_instagram_status').upsert({id:'main',status:'error',last_attempt_at:now,error:reason});return json({ok:false,error:reason},503)}
 finally{await db.from('pc_collector_config').update({lease_owner:null,lease_until:new Date().toISOString()}).eq('id','instagram-sync').eq('lease_owner',owner)}
});
