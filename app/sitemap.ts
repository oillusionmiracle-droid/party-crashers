import type {MetadataRoute} from 'next';
import {initialEvents} from '../src/product/data';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const origin='https://party-crashers-seven.vercel.app';return ['','/events/','/terms/','/privacy/',...initialEvents.map(e=>'/events/'+e.id+'/')].map(path=>({url:origin+path}))}
