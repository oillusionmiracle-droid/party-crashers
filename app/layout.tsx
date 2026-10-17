import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = { title: 'Party Crashers — Lagos is outside', description: 'Find events worth showing up for in Lagos.', manifest:'/site.webmanifest', icons:{icon:'/favicon.ico',apple:'/assets/brand/app-icon-180.png'} };
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#090B0D'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{margin:0}}>{children}</body></html>}
