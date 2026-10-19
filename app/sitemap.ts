import type {MetadataRoute} from 'next';
import {publicEvents} from '../src/server/events';
export const revalidate=300;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin='https://party-crashers-seven.vercel.app',events=await publicEvents();return [...['','/events/','/terms/','/privacy/'].map(path=>({url:origin+path})),...events.map(e=>({url:origin+'/events/'+encodeURIComponent(e.id)+'/',...(e.lastVerifiedAt?{lastModified:new Date(e.lastVerifiedAt)}:{})}))]}
