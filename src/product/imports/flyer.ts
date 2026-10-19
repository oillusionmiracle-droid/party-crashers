export type FlyerFields=Partial<Record<'title'|'date'|'time'|'endDate'|'endTime'|'venueName'|'address'|'area'|'registrationUrl'|'organizer'|'description'|'category'|'minPrice',string>>;
export function extractFlyerText(text:string):{fields:FlyerFields;warnings:string[]}{
 const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean),flat=lines.join(' '),fields:FlyerFields={},warnings:string[]=[];
 // Only full, explicit calendar dates: never infer a missing year from "this Friday".
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'];const d=flat.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s*(20\d{2})\b/i);
 const iso=flat.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);let date=d?`${d[3]}-${String(months.indexOf(d[2].toLowerCase())+1).padStart(2,'0')}-${d[1].padStart(2,'0')}`:iso?.[0];if(date&&Number.isFinite(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date)fields.date=date;else warnings.push('Confirm the full date, including its year.');
 const t=flat.match(/\b(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)\b/i);if(t&&Number(t[1])>=1&&Number(t[1])<=12)fields.time=String(Number(t[1])%12+(t[3].toUpperCase()==='PM'?12:0)).padStart(2,'0')+':'+(t[2]||'00');else warnings.push('Confirm the start time in Lagos time.');
 const title=lines.find(l=>/^event\s*:/i.test(l));if(title)fields.title=title.replace(/^event\s*:\s*/i,'').slice(0,120);
 const venue=lines.find(l=>/^(venue|location)\s*:/i.test(l));if(venue)fields.venueName=venue.replace(/^(venue|location)\s*:\s*/i,'').slice(0,160);
 const address=lines.find(l=>/^address\s*:/i.test(l));if(address)fields.address=address.replace(/^address\s*:\s*/i,'').slice(0,240);
 const host=lines.find(l=>/^(host|organizer|organiser)\s*:/i.test(l));if(host)fields.organizer=host.replace(/^(host|organizer|organiser)\s*:\s*/i,'').slice(0,100);
 const url=flat.match(/\bhttps:\/\/[^\s<>]+/i);if(url){try{fields.registrationUrl=new URL(url[0].replace(/[.,;)]+$/,'')).href}catch{}}
 for(const area of ['Yaba','Ikeja','Surulere','Lekki','Ajah','Ojo','Festac','Mainland'])if(new RegExp('\\b'+area+'\\b','i').test(flat)){fields.area=area;break}if(/victoria island/i.test(flat))fields.area='VI';
 const price=flat.match(/(?:₦|NGN|Naira)\s*([\d,]+)(?!\d)/i);if(price)fields.minPrice=price[1].replace(/,/g,'');
 warnings.push('Review the title, venue, ticket price and registration link before publishing.');return {fields,warnings};
}
