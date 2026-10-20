/* Notifications only: do not cache authentication, API responses or app HTML. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?event.data.json():{}}catch{}
 const title=typeof data.title==='string'?data.title.slice(0,160):'Party Crashers';
 const body=typeof data.body==='string'?data.body.slice(0,300):'A new plan is waiting.';
 let target='/#discover';try{const url=new URL(data.url||target,self.location.origin);if(url.origin===self.location.origin)target=url.href}catch{}
 event.waitUntil(self.registration.showNotification(title,{body,icon:'/assets/brand/app-icon-192.png',badge:'/assets/brand/app-icon-192.png',tag:String(data.tag||'pc-new-event').slice(0,220),renotify:false,data:{url:target}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();let target=new URL('/#discover',self.location.origin);try{const candidate=new URL(event.notification.data?.url||target,self.location.origin);if(candidate.origin===self.location.origin)target=candidate}catch{}
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{for(const client of clients){if(new URL(client.url).origin===self.location.origin){await client.navigate(target.href);return client.focus()}}return self.clients.openWindow(target.href)}));
});
