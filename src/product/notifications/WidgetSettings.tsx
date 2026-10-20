'use client';
import React,{useEffect,useState} from 'react';
import type {Preferences} from '../data';
export default function WidgetSettings({prefs}:{prefs:Preferences}){
 const [android,setAndroid]=useState(false),[downloadReady,setDownloadReady]=useState(false);
 useEffect(()=>{setAndroid(/Android/i.test(navigator.userAgent));const controller=new AbortController();fetch('/downloads/party-crashers-widget.apk',{method:'HEAD',signal:controller.signal}).then(r=>setDownloadReady(r.ok&&r.headers.get('content-type')!=='text/html')).catch(()=>{});return()=>controller.abort()},[]);
 const query=new URLSearchParams({area:prefs.area,interests:prefs.interests.join(',')}).toString();
 const setup=`intent://widget/setup?${query}#Intent;scheme=partycrashers;package=com.partycrashers.widgets;S.browser_fallback_url=${encodeURIComponent('https://party-crashers-seven.vercel.app/widgets/')};end`;
 return <section className="widget-settings"><h2>Your plans, on your home screen.</h2><p>Add an Android widget with upcoming events for your area and interests. Tap an event to open its details.</p>{downloadReady?<a className="outline-action" href="/downloads/party-crashers-widget.apk" download>Download Android widget · preview</a>:<p className="source-note">The Android companion download is being prepared. Check back here for the install link.</p>}{android&&<a className="text-link widget-open" href={setup}>Open widget setup ↗</a>}<p className="source-note">Install the companion first, then choose Add to home screen. Android controls background refresh timing; the widget has a Refresh button. It uses your selected area, without GPS access.</p><a className="text-link" href="/widgets/">Installation help ↗</a></section>
}
