import type { Metadata, Viewport } from 'next';
const origin='https://party-crashers-seven.vercel.app';
export const metadata: Metadata = {
 metadataBase:new URL(origin),title:{default:'Party Crashers — Events in Lagos',template:'%s — Party Crashers'},
 description:'Discover events in Lagos, save your plans and share what you are hosting. Explore tech, art, music, campus gatherings and more.',
 alternates:{canonical:'/'},manifest:'/site.webmanifest',icons:{icon:'/favicon.ico',apple:'/assets/brand/app-icon-180.png'},
 openGraph:{type:'website',locale:'en_NG',url:origin,siteName:'Party Crashers',title:'Party Crashers — Events in Lagos',description:'Find your next event in Lagos.',images:[{url:'/assets/brand/app-tile.png',alt:'Party Crashers location pin with sunglasses'}]},
 twitter:{card:'summary',title:'Party Crashers — Events in Lagos',description:'Find your next event in Lagos.',images:['/assets/brand/app-icon-512.png']},
 robots:{index:true,follow:true}
};
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#090B0D'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{margin:0}}>{children}</body></html>}
