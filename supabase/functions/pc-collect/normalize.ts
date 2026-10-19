// Trusted organizer adapter. No user-supplied crawl URLs or social account scraping.
export const SOURCE='https://thetechfeast.com/wp-json/tribe/events/v1/events?per_page=50';
function plain(v:unknown){return String(v||'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&amp;/g,'&').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim()}
function sourceUrl(v:unknown){try{const u=new URL(String(v));return u.protocol==='https:'&&u.hostname==='thetechfeast.com'?u.href:''}catch{return ''}}
export function normalize(event:any,now=new Date()){
 const title=plain(event.title).slice(0,120),venue=event.venue||{};
 const start=new Date(String(event.utc_start_date||'').replace(' ','T')+'Z'),end=new Date(String(event.utc_end_date||'').replace(' ','T')+'Z');
 const source=sourceUrl(event.url),image=sourceUrl(event.image?.sizes?.large?.url||event.image?.url);
 // Incomplete, past, cancelled, or non-Lagos records never enter the live feed.
 if(event.status!=='publish'||!title||!source||!image||!Number.isFinite(+start)||!Number.isFinite(+end)||end<start||end<now||!/^Nigeria$/i.test(plain(venue.country))||!/lagos/i.test(plain(venue.province||venue.state))||!/victoria island/i.test(plain(venue.address))||!plain(venue.venue))return null;
 const amounts=(event.cost_details?.values||[]).map(Number).filter((v:number)=>Number.isFinite(v)&&v>=0);const free=amounts.length>0&&amounts.every((v:number)=>v===0),mixed=amounts.includes(0)&&amounts.some((v:number)=>v>0);
 const id='import-techfeast-'+String(event.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);if(id==='import-techfeast-')return null;
 return {id,title,description:plain(event.description).slice(0,500),category:'Tech',tags:['Tech','Business','Career'],startDate:start.toISOString(),endDate:end.toISOString(),timezone:'Africa/Lagos',format:'physical',venueName:plain(venue.venue).slice(0,160),address:[plain(venue.address),'Lagos','Nigeria'].join(', '),area:'VI',latitude:6.432,longitude:3.425,venueApproximate:true,priceType:free?'free':mixed?'unknown':amounts.length?'paid':'unknown',minPrice:free?0:!mixed&&amounts.length?Math.min(...amounts):null,priceNote:mixed?'Free exhibition options · paid passes':'',currency:'NGN',registrationUrl:source,sourceUrl:source,sourceName:'TECHFEAST official event feed',organizerId:'organizer-techfeast',organizer:'TECHFEAST',imageUrl:image,registrationDeadline:null,confidenceScore:0,firstDiscoveredAt:now.toISOString(),lastVerifiedAt:now.toISOString(),status:'published',timeConfirmed:true};
}
