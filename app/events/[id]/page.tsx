import {notFound} from 'next/navigation';
import {initialEvents} from '../../../src/product/data';
import {PublicEventDetail} from '../../../src/product/PublicEvents';
export function generateStaticParams(){return initialEvents.map(event=>({id:event.id}))}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,event=initialEvents.find(e=>e.id===id);if(!event)return {};return {title:event.title,description:event.description,alternates:{canonical:`/events/${id}/`},openGraph:{title:event.title,description:event.description,url:`/events/${id}/`,...(event.imageUrl?{images:[{url:event.imageUrl,alt:event.title}]}:{})}}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params,event=initialEvents.find(e=>e.id===id);if(!event)notFound();return <PublicEventDetail event={event}/>}
