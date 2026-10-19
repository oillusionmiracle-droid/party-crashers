import {PublicEventList} from '../../src/product/PublicEvents';
import {publicEvents} from '../../src/server/events';
export const revalidate=300;
export const metadata={title:'Events in Lagos',alternates:{canonical:'/events/'}};
export default async function Page(){return <PublicEventList events={await publicEvents()}/>}
