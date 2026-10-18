import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/'},sitemap:'https://party-crashers-seven.vercel.app/sitemap.xml'}}
