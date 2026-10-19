import 'server-only';
import type {EventRecord} from '../product/data';
const endpoint=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://aqwnluhpnqsrofmvtngp.supabase.co')+'/functions/v1/pc-api';
// Public, published records only. Server fetches use no privileged credentials.
export async function publicEvents():Promise<EventRecord[]>{const r=await fetch(endpoint,{next:{revalidate:300},signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('The event catalogue is temporarily unavailable');return (await r.json()).events||[]}
export async function publicEvent(id:string):Promise<EventRecord|null>{if(!/^[a-zA-Z0-9_-]{1,199}$/.test(id))return null;const r=await fetch(endpoint+'?id='+encodeURIComponent(id),{next:{revalidate:300},signal:AbortSignal.timeout(12000)});if(r.status===404)return null;if(!r.ok)throw new Error('The event could not be loaded');return (await r.json()).event||null}
