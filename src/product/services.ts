import type { EventRecord,Preferences } from './data';
export const clerkKey=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||'';
const databaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL||'';
const databaseKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
export const databaseReady=Boolean(databaseUrl);
export const mapboxToken=process.env.NEXT_PUBLIC_MAPBOX_TOKEN||'';
let tokenProvider:()=>Promise<string|null>=async()=>null;
export function setTokenProvider(fn:()=>Promise<string|null>){tokenProvider=fn}
async function api(body:Record<string,unknown>){if(!databaseReady)throw new Error('Cloud storage is not connected yet.');const token=await tokenProvider()||await (window as unknown as {Clerk?:{session?:{getToken:()=>Promise<string|null>}}}).Clerk?.session?.getToken();if(!token)throw new Error('Please sign in to continue.');const response=await fetch(databaseUrl+'/functions/v1/pc-api',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,...(databaseKey?{apikey:databaseKey}:{})},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error||'That request could not be completed.');return result}
export async function fetchEvents(near?:{lat:number;lon:number;km:number},signal?:AbortSignal){if(!databaseReady)return null;const response=await fetch(databaseUrl+'/functions/v1/pc-api'+(near?'?'+new URLSearchParams({lat:String(near.lat),lon:String(near.lon),km:String(near.km)}):''),{signal,headers:databaseKey?{apikey:databaseKey}:{}});const data=await response.json();if(!response.ok)throw new Error('Events could not load');return data.events as EventRecord[]}
export async function getProfile(_id:string){return (await api({action:'profile.get'})).profile as {preferences:Preferences;display_name:string}|null}
export async function syncPreferences(_id:string,prefs:Preferences,name:string){await api({action:'profile.save',preferences:prefs,name})}
export async function getSaved(_id:string){return (await api({action:'saved.list'})).ids as string[]}
export async function saveEvent(_id:string,eventId:string,on:boolean){await api({action:'saved.set',eventId,on})}
export async function publishEvent(_id:string,record:EventRecord){return (await api({action:'event.publish',record})).event as EventRecord}
export async function getFollows(_id:string){return (await api({action:'follow.list'})).ids as string[]}
export async function followOrganizer(_id:string,organizerId:string,on:boolean){await api({action:'follow.set',organizerId,on})}
export async function reportEvent(_id:string,eventId:string,reason:string){await api({action:'report',eventId,reason})}
export async function registrationClick(eventId:string){await api({action:'registration.click',eventId})}
export async function uploadPoster(_userId:string,file:File){const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Image could not be read.'));reader.readAsDataURL(file)});return (await api({action:'poster.upload',mime:file.type,base64})).url as string}

export async function feedHealth(){const r=await fetch(databaseUrl+'/functions/v1/pc-api?status=feed',{headers:databaseKey?{apikey:databaseKey}:{}});if(!r.ok)throw new Error('Source status unavailable');return (await r.json()).sources as {name:string;url:string;enabled:boolean;last_success_at:string|null;health:string}[]}
export async function adminAccess(){return (await api({action:'admin.access'})).allowed as boolean}
export async function adminQueue(){return api({action:'admin.queue'})}
export async function reviewCandidate(candidateId:string,decision:string,venue?:Record<string,unknown>){return api({action:'admin.review',candidateId,decision,venue})}
export async function toggleSource(sourceId:string,enabled:boolean){return api({action:'admin.source',sourceId,enabled})}

export async function submitEventLink(url:string,title:string){return api({action:'link.submit',url,title})}
export async function addWebSource(source:Record<string,unknown>){return api({action:'admin.source.add',...source})}
export async function reviewDiscoveredLink(linkId:string,decision:string,sourceId?:string){return api({action:'admin.link.review',linkId,decision,sourceId})}
export async function updateDiscoverySettings(settings:Record<string,boolean>){return api({action:'admin.discovery.settings',...settings})}

export async function updateSourceOptions(sourceId:string,autopublish:boolean,allowAi:boolean){return api({action:'admin.source.options',sourceId,autopublish,allowAi})}
