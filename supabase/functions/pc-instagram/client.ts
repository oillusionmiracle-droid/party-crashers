const VERSION='v26.0';
function https(value:unknown,hosts:RegExp){try{const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password&&hosts.test(u.hostname)?u.href:null}catch{return null}}
export function instagramPosts(payload:any){
 return (Array.isArray(payload.data)?payload.data:[]).slice(0,25).flatMap((p:any)=>{
  const permalink=https(p.permalink,/(^|\.)instagram\.com$/);
  if(!/^\d{1,30}$/.test(String(p.id))||!permalink)return [];
  const media=[...(p.media_type==='IMAGE'?[p]:[]),...(p.children?.data||[]).filter((m:any)=>m.media_type==='IMAGE')];
  return [{platform:'instagram',post_id:String(p.id),permalink,caption:typeof p.caption==='string'?p.caption.slice(0,10000):'',posted_at:Number.isFinite(Date.parse(p.timestamp))?new Date(p.timestamp).toISOString():null,media_urls:media.map((m:any)=>https(m.media_url,/(^|\.)(cdninstagram\.com|fbcdn\.net)$/)).filter(Boolean).slice(0,10),outgoing_urls:[]}];
 });
}
export async function readInstagram(token:string,request:typeof fetch=fetch){
 if(!token)throw new Error('missing_token');
 async function get(path:string,fields:string){
  const u=new URL('https://graph.instagram.com/'+VERSION+'/'+path);u.searchParams.set('fields',fields);u.searchParams.set('limit','25');
  const r=await request(u,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(15000)});
  const raw=await r.text();if(raw.length>2000000)throw new Error('response_too_large');
  let data:any;try{data=JSON.parse(raw)}catch{throw new Error('invalid_response')}
  if(!r.ok||data.error)throw new Error('instagram_http_'+r.status+'_code_'+(Number(data.error?.code)||0));return data;
 }
 const profile=await get('me','user_id,username');const id=String(profile.user_id||profile.id||'');if(!/^\d{1,30}$/.test(id))throw new Error('missing_account_id');
 const media=await get(id+'/media','id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}');
 return {username:String(profile.username||'').slice(0,100),accountId:id,posts:instagramPosts(media)};
}
