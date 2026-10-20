import * as service from '../services';
export function pushSupported(){return typeof window!=='undefined'&&window.isSecureContext&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window}
export function applicationServerKey(value:string){const str=atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'='));return Uint8Array.from(str,c=>c.charCodeAt(0))}
export async function currentSubscription(){if(!pushSupported())return null;const registration=await navigator.serviceWorker.getRegistration('/');return await registration?.pushManager.getSubscription()||null}
export async function stopPush(){const subscription=await currentSubscription();if(!subscription)return;let removed=false;try{await service.unsubscribePush(subscription.endpoint);removed=true}finally{const unsubscribed=await subscription.unsubscribe();if(!removed&&!unsubscribed)throw new Error('Could not stop notifications. Check your connection and retry.')}}
