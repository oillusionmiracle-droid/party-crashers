'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {MapPin,NavigationArrow,ArrowUpRight} from '@phosphor-icons/react';
import type {EventRecord,Preferences} from './data';
import {areas,dateLabel,priceLabel,distanceKm} from './data';
import {mapboxToken} from './services';
import 'leaflet/dist/leaflet.css';
const centers:Record<string,[number,number]>={Yaba:[6.506,3.379],Ikeja:[6.601,3.35],Surulere:[6.501,3.35],VI:[6.432,3.425],Lekki:[6.448,3.473],Ajah:[6.469,3.575],Ojo:[6.458,3.187],Festac:[6.469,3.283],Mainland:[6.51,3.36],'Lagos Island':[6.4489,3.3965],'Anywhere in Lagos':[6.51,3.385]};
export default function MapView({events,onOpen,prefs,dark,position,radius,setRadius,onLocate,onClearLocation,locating}:{position:[number,number]|null;radius:number;setRadius:(n:number)=>void;onLocate:()=>void;onClearLocation:()=>void;locating:boolean;events:EventRecord[];onOpen:(e:EventRecord)=>void;prefs:Preferences;dark:boolean;notify:(s:string)=>void}){
 const container=useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState<EventRecord[]>([]),[area,setArea]=useState(prefs.area),[status,setStatus]=useState('Loading street map…'),[expanded,setExpanded]=useState(false),[free,setFree]=useState(false),[provider,setProvider]=useState('');
 const filtered=useMemo(()=>events.filter(e=>e.status==='published'&&Number.isFinite(e.latitude)&&Number.isFinite(e.longitude)&&new Date(e.endDate)>=new Date()&&(!free||e.priceType==='free')&&(position?distanceKm(position,[e.latitude!,e.longitude!])<=radius:area==='Anywhere in Lagos'||e.area===area)),[events,free,area,position,radius]);
 useEffect(()=>{let disposed=false;let map:import('leaflet').Map|undefined;let observer:ResizeObserver|undefined;let timer:ReturnType<typeof setTimeout>|undefined;setStatus('Loading street map…');setSelected([]);setExpanded(false);
 async function start(){try{
  const L=await import('leaflet');if(disposed||!container.current)return;
  map=L.map(container.current,{zoomControl:false,preferCanvas:true}).setView(position||centers[area]||centers['Anywhere in Lagos'],area==='Anywhere in Lagos'?11:12);
  L.control.zoom({position:'topright'}).addTo(map);
  let fallback=false;let tiles:import('leaflet').TileLayer;
  const osm=()=>L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  function watch(layer:import('leaflet').TileLayer){let loaded=false;layer.on('tileload',()=>{loaded=true;if(!disposed){setStatus('');if(timer)clearTimeout(timer)}});layer.on('tileerror',()=>{if(!loaded)recover()});layer.addTo(map!);}
  function recover(){if(disposed)return;if(mapboxToken&&!fallback){fallback=true;map!.removeLayer(tiles);tiles=osm();setProvider('OpenStreetMap');setStatus('Loading street map…');watch(tiles)}else setStatus('Street tiles are unavailable. Check your connection, then retry. Event pins remain available.');}
  tiles=mapboxToken?L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/${dark?'dark-v11':'streets-v12'}/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(mapboxToken)}`,{maxZoom:19,attribution:'&copy; Mapbox &copy; OpenStreetMap'}):osm();setProvider(mapboxToken?'Mapbox':'OpenStreetMap');watch(tiles);timer=setTimeout(recover,12000);
  const groups=new Map<string,EventRecord[]>();for(const e of filtered){const key=`${e.latitude!.toFixed(4)},${e.longitude!.toFixed(4)}`;groups.set(key,[...(groups.get(key)||[]),e]);}
  const choose=(group:EventRecord[])=>{setSelected(group);setExpanded(false);map?.panTo([group[0].latitude!,group[0].longitude!],{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});};
  for(const group of groups.values()){
   const icon=L.divIcon({className:'event-map-marker',html:`<span>${group.length>1?group.length:'•'}</span>`,iconSize:[40,40],iconAnchor:[20,40]});
   L.marker([group[0].latitude!,group[0].longitude!],{icon,title:group.length>1?`${group.length} events at ${group[0].venueName}`:group[0].title,keyboard:true}).addTo(map).on('click',()=>choose(group));
  }
  if(position)L.circleMarker(position,{radius:7,color:'#fff',weight:3,fillColor:'#2778f5',fillOpacity:1}).addTo(map).bindTooltip('Your location');
  map.on('click',(event:import('leaflet').LeafletMouseEvent)=>{const near=filtered.filter(e=>distanceKm([event.latlng.lat,event.latlng.lng],[e.latitude!,e.longitude!])<=3);setSelected(near);if(!near.length)setStatus('No listed events within 3 km of this point. Try an orange pin.');else setStatus('');});
  observer=new ResizeObserver(()=>map?.invalidateSize());observer.observe(container.current);map.invalidateSize();
 }catch{if(!disposed)setStatus('The street map could not start. Reload to retry.');}}
 start();return()=>{disposed=true;if(timer)clearTimeout(timer);observer?.disconnect();map?.remove()};
 },[dark,filtered,area,position]);
 return <section className="map-view"><div className="map-toolbar"><label><span className="sr-only">Choose an area</span><select value={area} onChange={e=>{onClearLocation();setArea(e.target.value)}}>{[...new Set([...areas,...events.map(e=>e.area)])].map(a=><option key={a}>{a}</option>)}</select></label><button className={`filter-chip ${free?'selected':''}`} aria-pressed={free} onClick={()=>setFree(!free)}>Free</button><button className="icon-button" onClick={onLocate} disabled={locating} aria-label="Use my location"><NavigationArrow size={22}/></button>{position&&<label className="map-radius"><span className="sr-only">Search radius</span><select value={radius} onChange={e=>setRadius(Number(e.target.value))}>{[5,15,30,100].map(k=><option key={k} value={k}>{k} km</option>)}</select></label>}</div><div className="live-map" ref={container} aria-label="Interactive Lagos street map. Tap an orange pin to see events."/>{status&&<div className="map-status" role="status">{status}</div>}<div className={`map-bottom-sheet ${expanded?'expanded':''}`}><button className="sheet-handle" aria-label={expanded?'Collapse events':'Expand events'} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}><span/></button><div className="section-row"><h2>{selected.length?`${selected.length} ${selected.length===1?'event':'events'} here`:`${filtered.length} events on the map`}</h2></div><p className="subtle">Tap a pin or an area to explore. Venue pins are approximate.</p>{(selected.length?selected:filtered).map(e=><button className="map-list-item" key={e.id} onClick={()=>onOpen(e)}><span className="map-list-icon"><MapPin size={24} weight="duotone"/></span><span><b>{e.title}</b><small>{e.venueName} · {dateLabel(e)}<br/>{priceLabel(e)}{position&&` · ~${distanceKm(position,[e.latitude!,e.longitude!]).toFixed(1)} km`}</small></span><ArrowUpRight size={21}/></button>)}{!filtered.length&&<p className="empty-message">No mapped events match. Try another area or turn off Free.</p>}{selected.length>0&&<button className="text-link" onClick={()=>setSelected([])}>Show all mapped events</button>}<span className="map-provider">{provider} · Location is optional</span></div></section>
}
