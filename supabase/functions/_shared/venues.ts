// Only named POIs are accepted: a city/street centroid is not a venue pin.
const normalize=(s:unknown)=>String(s||'').toLowerCase().replace(/\(venue\s*\d+\)/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export function photonVenue(record:any,features:any[]){
 const name=normalize(record.venueName);if(name.length<4)return null;
 const matches=features.filter(f=>{const p=f.properties||{},c=f.geometry?.coordinates;return Array.isArray(c)&&Number.isFinite(c[0])&&Number.isFinite(c[1])&&c[1]>=6.2&&c[1]<=6.9&&c[0]>=2.7&&c[0]<=4.2&&normalize(p.name)===name&&p.osm_key!=='place'&&p.osm_key!=='highway'&&p.osm_id&&p.osm_type;});
 if(!matches.length)return null;const first=matches[0];if(matches.some(f=>Math.abs(f.geometry.coordinates[0]-first.geometry.coordinates[0])>.001||Math.abs(f.geometry.coordinates[1]-first.geometry.coordinates[1])>.001))return null;
 const p=first.properties,[longitude,latitude]=first.geometry.coordinates,type=({N:'node',W:'way',R:'relation'} as any)[p.osm_type];if(!type)return null;
 return {latitude,longitude,address:[p.housenumber,p.street,p.district,p.city,p.state].filter(Boolean).join(', ')||record.address||'',coordinateSource:`https://www.openstreetmap.org/${type}/${p.osm_id}`,venueResolution:'OpenStreetMap venue match',venueApproximate:true};
}
export async function resolveVenue(db:any,record:any){
 if(record.format==='online')return {...record,latitude:null,longitude:null};
 if(Number.isFinite(record.latitude)&&Number.isFinite(record.longitude))return record;
 const key=normalize(record.venueName)+'|'+normalize(record.area);if(key.length<5)return record;
 const cached=await db.from('pc_venue_cache').select('result').eq('key',key).gt('expires_at',new Date().toISOString()).maybeSingle();if(cached.data)return {...record,...cached.data.result};
 // Application-wide cap, not a per-instance throttle; low-volume cached lookup only.
 const quota=await db.rpc('pc_take_quota',{bucket_name:'venue-geocoder',max_hits:4,window_seconds:60});if(quota.error||!quota.data)return record;
 try{const u=new URL('https://photon.komoot.io/api/');u.searchParams.set('q',String(record.venueName)+' Lagos Nigeria');u.searchParams.set('limit','5');u.searchParams.set('bbox','2.7,6.2,4.2,6.9');
 const r=await fetch(u,{headers:{'User-Agent':'PartyCrashers/1.0 (https://party-crashers-seven.vercel.app)'},redirect:'error',signal:AbortSignal.timeout(5000)});if(!r.ok)return record;const data=await r.json();const result=photonVenue(record,data.features||[])||{};
 await db.from('pc_venue_cache').upsert({key,result,expires_at:new Date(Date.now()+(Object.keys(result).length?30:1)*86400000).toISOString()});return {...record,...result};
 }catch{return record}
}
