import {notFound} from 'next/navigation';
import {publicEvent} from '../../../src/server/events';
import {PublicEventDetail} from '../../../src/product/PublicEvents';
export const revalidate=300;
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,event=await publicEvent(id);if(!event)return {title:'Event unavailable',robots:{index:false}};return {title:event.title,description:event.description,alternates:{canonical:`/events/${id}/`},openGraph:{title:event.title,description:event.description,url:`/events/${id}/`,...(event.imageUrl?{images:[{url:event.imageUrl,alt:event.title}]}:{})}}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params,event=await publicEvent(id);if(!event)notFound();return <PublicEventDetail event={event}/>}
