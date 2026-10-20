import {publicUrl,limitedText} from './network.ts';
export const SOCIAL_QUERIES=[
'site:instagram.com/p/ Lagos (event OR concert OR tickets OR party) upcoming',
'site:facebook.com Lagos (event OR concert OR tickets) upcoming',
'(site:x.com OR site:twitter.com) Lagos (event OR concert OR tickets) upcoming'
];
export const X_QUERIES=[
'(Lagos OR Lekki OR Ikeja OR Yaba) (tickets OR concert OR festival OR meetup) -is:retweet lang:en',
'(Lagos OR Surulere OR UNILAG OR LASU) (party OR exhibition OR workshop OR conference) -is:retweet lang:en'
];
export function xLeads(payload:any){
 const media=new Map((payload.includes?.media||[]).filter((m:any)=>m.type==='photo'&&typeof m.url==='string'&&/^https:\/\/pbs\.twimg\.com\//.test(m.url)).map((m:any)=>[m.media_key,m.url]));
 return (Array.isArray(payload.data)?payload.data:[]).slice(0,10).flatMap((p:any)=>{
  if(!/^\d{1,25}$/.test(String(p.id))||typeof p.text!=='string')return [];
  const urls=(p.entities?.urls||[]).flatMap((u:any)=>{try{return [publicUrl(u.expanded_url).href]}catch{return []}}).slice(0,5);
  return [{post_id:String(p.id),permalink:'https://x.com/i/web/status/'+p.id,caption:p.text.slice(0,5000),posted_at:Number.isFinite(Date.parse(p.created_at))?new Date(p.created_at).toISOString():null,media_urls:(p.attachments?.media_keys||[]).map((k:string)=>media.get(k)).filter(Boolean).slice(0,4),outgoing_urls:urls}];
 });
}
export async function collectX(db:any,token:string,now:Date,request:typeof fetch=fetch){
 // Explicit switch prevents a newly added credential from silently incurring charges.
 if(!token)return {status:'needs X_BEARER_TOKEN',posts:[]};
 const quota=await db.rpc('pc_take_quota',{bucket_name:'x-search-daily',max_hits:2,window_seconds:86400});if(quota.error||!quota.data)return {status:'daily request cap reached',posts:[]};
 const u=new URL('https://api.x.com/2/tweets/search/recent');u.searchParams.set('query',X_QUERIES[Math.floor(+now/21600000)%X_QUERIES.length]);u.searchParams.set('max_results','10');u.searchParams.set('tweet.fields','created_at,entities,attachments');u.searchParams.set('expansions','attachments.media_keys');u.searchParams.set('media.fields','type,url');
 const r=await request(u,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('X search returned HTTP '+r.status);return {status:'success',posts:xLeads(JSON.parse(await limitedText(r,1000000)))};
}
