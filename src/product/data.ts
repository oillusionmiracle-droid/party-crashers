import {EVENT_CATEGORIES} from '../../supabase/functions/_shared/taxonomy';
export type ThemeMode='system'|'light'|'dark';
export type Preferences={interests:string[];area:string;campus:string;complete:boolean};
export type EventRecord={id:string;title:string;description:string;category:string;tags:string[];startDate:string;endDate:string;timezone:string;format:'physical'|'online'|'hybrid';venueName:string;address:string;area:string;latitude:number|null;longitude:number|null;priceType:'free'|'paid'|'unknown';minPrice:number|null;currency:string;registrationUrl:string;sourceUrl:string;sourceName:string;organizerId:string;organizer:string;imageUrl:string;registrationDeadline:string|null;confidenceScore:number;firstDiscoveredAt:string;lastVerifiedAt:string|null;status:'published'|'draft';ownerId?:string;flyerData?:string;timeConfirmed:boolean;venueApproximate?:boolean;priceNote?:string;endTimeConfirmed?:boolean;imageCredit?:string;imageLabel?:string;categoryNeedsReview?:boolean;categoryEvidence?:string;coordinateSource?:string;sources?:{name:string;url:string}[]};
export const categories:string[]=[...EVENT_CATEGORIES];
export const areas=['Yaba','Ikeja','Surulere','VI','Lekki','Ajah','Ojo','Festac','Mainland','Anywhere in Lagos'];
export const campuses=['UNILAG','LASU','YABATECH','LASUSTECH','Pan-Atlantic','Other','None'];
export const defaultPreferences:Preferences={interests:[],area:'Anywhere in Lagos',campus:'None',complete:false};
export const initialEvents:EventRecord[]=[
{id:'moonshot-2026',title:'Moonshot by TechCabal',description:'Courage & Conviction — Building for a New World. A two-day gathering for African technology, business and the people building what comes next. Dates and venue are listed by the organizer. Check the official programme for opening times and ticket prices.',category:'Tech',tags:['Business','Startups','Conference'],startDate:'2026-10-28T00:00:00+01:00',endDate:'2026-10-29T23:59:00+01:00',timezone:'Africa/Lagos',format:'physical',venueName:'National Theatre',address:'National Theatre, Iganmu, Lagos',area:'Mainland',latitude:6.4777,longitude:3.3695,priceType:'unknown',minPrice:null,currency:'NGN',registrationUrl:'https://moonshot.techcabal.com/',sourceUrl:'https://moonshot.techcabal.com/',sourceName:'Moonshot / TechCabal',organizerId:'techcabal',organizer:'TechCabal',imageUrl:'/assets/moonshot.png',registrationDeadline:null,confidenceScore:0,firstDiscoveredAt:'2026-10-17T04:00:00+01:00',lastVerifiedAt:'2026-10-17T04:00:00+01:00',status:'published',timeConfirmed:false,venueApproximate:true},
{id:'artx-2026',title:'ART X Lagos 2026',description:'A New Chapter, A New Decade. ART X Lagos returns for its eleventh edition, bringing contemporary African art, cinema, music and conversations to the Federal Palace. Dates and venue are listed on the official tickets page. Confirm opening hours, access and ticket prices with the organizer.',category:'Art',tags:['Design','Music','Culture'],startDate:'2026-11-05T00:00:00+01:00',endDate:'2026-11-08T23:59:00+01:00',timezone:'Africa/Lagos',format:'physical',venueName:'Federal Palace',address:'Federal Palace, Ahmadu Bello Way, Victoria Island, Lagos',area:'VI',latitude:6.4276,longitude:3.4064,priceType:'unknown',minPrice:null,currency:'NGN',registrationUrl:'https://www.artxlagos.com/tickets',sourceUrl:'https://www.artxlagos.com/tickets',sourceName:'ART X Lagos',organizerId:'artx',organizer:'ART X Lagos',imageUrl:'',registrationDeadline:null,confidenceScore:0,firstDiscoveredAt:'2026-10-17T04:00:00+01:00',lastVerifiedAt:'2026-10-17T04:00:00+01:00',status:'published',timeConfirmed:false,venueApproximate:true}
];
export const interestCrop:Record<string,[number,number,number,number]>={Tech:[95,430,180,140],Business:[375,430,210,140],Music:[680,430,190,140],Parties:[100,695,185,142],Career:[390,695,195,142],Campus:[675,700,195,140],Faith:[95,945,190,158],Food:[380,955,210,145],Art:[675,950,190,150],Sports:[90,1220,205,155],Fashion:[385,1225,200,150],Gaming:[675,1220,195,155]};
export const areaCrop:Record<string,[number,number,number,number]>={Yaba:[110,528,270,163],Ikeja:[540,528,285,163],Surulere:[105,788,300,155],VI:[550,795,280,155],Lekki:[85,1045,330,153],Ojo:[535,1045,290,153],'Anywhere in Lagos':[110,1290,300,145]};
export const campusCrop:Record<string,[number,number,number,number]>={UNILAG:[45,520,405,240],LASU:[480,520,450,240],YABATECH:[45,800,415,250],LASUSTECH:[490,800,435,250],'Pan-Atlantic':[45,1085,440,220],Other:[570,1090,320,220],None:[75,1330,425,255]};
export function readLocal<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export function writeLocal(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value))}
export const dateLabel=(e:EventRecord)=>new Intl.DateTimeFormat('en-NG',{day:'numeric',month:'short',timeZone:'Africa/Lagos'}).format(new Date(e.startDate));
export const timeLabel=(e:EventRecord)=>e.timeConfirmed?new Intl.DateTimeFormat('en-NG',{hour:'numeric',minute:'2-digit',timeZone:'Africa/Lagos'}).format(new Date(e.startDate)):'Schedule on organizer site';
export const priceLabel=(e:EventRecord)=>e.priceNote|| (e.priceType==='free'?'Free':e.minPrice!=null?new Intl.NumberFormat('en-NG',{style:'currency',currency:e.currency,maximumFractionDigits:0}).format(e.minPrice):'Price on organizer site');
export function inFilter(e:EventRecord,filter:string,prefs:Preferences,now=new Date()):boolean{
 const start=new Date(e.startDate),end=new Date(e.endDate),dateStr=(d:Date)=>d.toLocaleDateString('en-CA',{timeZone:'Africa/Lagos'});
 if(filter==='Today')return dateStr(start)<=dateStr(now)&&dateStr(end)>=dateStr(now);
 if(filter==='Tonight')return dateStr(start)<=dateStr(now)&&dateStr(end)>=dateStr(now)&&(!e.timeConfirmed||Number(start.toLocaleString('en-GB',{hour:'2-digit',hour12:false,timeZone:'Africa/Lagos'}))>=17);
 if(filter==='Weekend'){const local=new Date(now.toLocaleString('en-US',{timeZone:'Africa/Lagos'}));const day=local.getDay();const saturday=new Date(local);saturday.setHours(0,0,0,0);saturday.setDate(local.getDate()+(day===0?-1:(6-day+7)%7));const sunday=new Date(saturday);sunday.setDate(saturday.getDate()+2);return start<sunday&&end>=saturday;}
 if(filter==='Free')return e.priceType==='free';
 if(filter==='Nearby')return prefs.area==='Anywhere in Lagos'||e.area===prefs.area||(prefs.area==='Yaba'&&e.area==='Mainland');
 if(filter==='Campus')return e.category==='Campus'||(prefs.campus!=='None'&&e.tags.includes(prefs.campus));
 if(filter==='For You')return !prefs.interests.length||matchesInterests(e,prefs);
 if(filter==='All')return true;
 return e.category===filter||e.tags.includes(filter);
}
// Approximate neighborhood centres are ranking hints, never advertised as venue pins.
const areaCentres:Record<string,[number,number]>={Yaba:[6.515,3.375],Ikeja:[6.6018,3.3515],Surulere:[6.496,3.354],VI:[6.428,3.421],Lekki:[6.447,3.472],Ajah:[6.469,3.565],Ojo:[6.461,3.183],Festac:[6.469,3.283],Mainland:[6.53,3.35]};
export function rankEvent(e:EventRecord,p:Preferences,position:[number,number]|null=null,now=Date.now()){
 const normalized=(s:string)=>s.trim().toLowerCase();
 const topics=new Set([e.category,...e.tags].map(normalized));
 const matches=new Set(p.interests.map(normalized).filter(i=>topics.has(i))).size;
 let score=matches?12+Math.min(matches-1,3)*3:0;
 if(p.campus!=='None'&&p.campus!=='Other'&&topics.has(normalized(p.campus)))score+=10;
 const centre=position||areaCentres[p.area];
 if(e.format!=='online'){
  if(centre&&Number.isFinite(e.latitude)&&Number.isFinite(e.longitude)){
   const km=distanceKm(centre,[e.latitude!,e.longitude!]);
   score+=12*Math.exp(-km/15);
  }else if(e.area===p.area&&p.area!=='Anywhere in Lagos')score+=8;
 }
 const days=Math.max(0,(Date.parse(e.startDate)-now)/86400000);
 score+=2/(1+days/7);
 return score;
}
export function safeUrl(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function distanceKm(a:[number,number],b:[number,number]){const r=Math.PI/180,dlat=(b[0]-a[0])*r,dlon=(b[1]-a[1])*r,x=Math.sin(dlat/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dlon/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
export function savedGroup(e:EventRecord,now=new Date()){const end=new Date(e.endDate);if(end<now)return 'Past';const days=(new Date(e.startDate).getTime()-now.getTime())/86400000;return days<=7?'This week':'Later'}
export function hasConflict(a:EventRecord,b:EventRecord){return a.timeConfirmed&&b.timeConfirmed&&new Date(a.startDate)<new Date(b.endDate)&&new Date(b.startDate)<new Date(a.endDate)}

// Generic festival photos do not represent an individual event.
export function eventVisual(e:EventRecord):EventRecord{
 if(e.id.startsWith('import-fringe-')&&(e.imageUrl.includes('Lagos-Fringe-Logo-')||e.imageLabel?.startsWith('Previous festival')||e.imageCredit?.startsWith('Previous Lagos Fringe')))
  return {...e,imageUrl:'',imageLabel:undefined,imageCredit:undefined};
 return e;
}
export function matchesInterests(e:EventRecord,p:Preferences){
 const topics=new Set([e.category,...e.tags].map(s=>s.trim().toLowerCase()));
 return p.interests.some(i=>topics.has(i.trim().toLowerCase()));
}
