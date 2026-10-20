export function safePushSubscription(value:any){
 if(!value||typeof value.endpoint!=='string'||value.endpoint.length>3000)throw new Error('Invalid push subscription');
 const u=new URL(value.endpoint);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)throw new Error('Invalid push endpoint');
 const allowed=u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='web.push.apple.com'||/^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname);
 if(!allowed)throw new Error('This browser push provider is not supported');
 if(!/^[A-Za-z0-9_-]{87}={0,2}$/.test(value.keys?.p256dh||'')||!/^[A-Za-z0-9_-]{22}={0,2}$/.test(value.keys?.auth||''))throw new Error('Invalid push encryption keys');
 return {endpoint:u.href,keys:{p256dh:value.keys.p256dh,auth:value.keys.auth}};
}
export async function endpointHash(endpoint:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(endpoint)))).map(n=>n.toString(16).padStart(2,'0')).join('')}
export function pushMatches(record:any,prefs:any,now=Date.now()){
 if(record.status!=='published'||!Number.isFinite(Date.parse(record.endDate))||Date.parse(record.endDate)<now)return false;
 const norm=(s:unknown)=>String(s||'').trim().toLowerCase();
 const topics=new Set([record.category,...(record.tags||[])].map(norm));
 const interests=Array.isArray(prefs?.interests)?prefs.interests:[];
 // An empty preference list must not become a subscription to every event.
 if(!interests.length||!interests.some((x:unknown)=>topics.has(norm(x))))return false;
 if(record.format!=='online'&&prefs.area&&prefs.area!=='Anywhere in Lagos'&&norm(record.area)!==norm(prefs.area))return false;
 if(norm(record.category)==='campus'&&prefs.campus&&!['None','Other'].includes(prefs.campus)&&!topics.has(norm(prefs.campus))&&!norm(record.venueName).includes(norm(prefs.campus)))return false;
 return true;
}
