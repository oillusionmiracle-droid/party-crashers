import React from 'react';
/** Party Crashers navigation: bold cut-paper shapes, consistent 32px optical size. */
export function NavIcon({name,active=false}:{name:string;active?:boolean}){
 const paths:Record<string,React.ReactNode>={
 discover:<><path d="m18 3 3.8 7.2L30 13l-8.2 3.8L18 25l-3.8-8.2L6 13l8.2-2.8Z" fill="currentColor"/><path d="m7 23 1.3 2.7L11 27l-2.7 1.3L7 31l-1.3-2.7L3 27l2.7-1.3Z" fill="currentColor"/></>,
 map:<><path d="m3 10 8-4 10 4 8-4v22l-8 4-10-4-8 4Z" fill="currentColor" opacity=".22"/><path d="m3 10 8-4 10 4 8-4v22l-8 4-10-4-8 4Zm8-4v22m10-18v22"/><path d="M24 9c0 3-4 7-4 7s-4-4-4-7a4 4 0 1 1 8 0Z" fill="var(--bg)"/><circle cx="20" cy="9" r="1" fill="currentColor"/></>,
 post:<><path d="M6 6h20a2 2 0 0 1 2 2v6a4 4 0 0 0 0 8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a4 4 0 0 0 0-8V8a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".2"/><path d="M6 6h20a2 2 0 0 1 2 2v6a4 4 0 0 0 0 8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a4 4 0 0 0 0-8V8a2 2 0 0 1 2-2ZM16 12v12m-6-6h12"/></>,
 saved:<><path d="M8 4h16a2 2 0 0 1 2 2v25l-10-7L6 31V6a2 2 0 0 1 2-2Z" fill="currentColor" opacity={active?'.3':'.13'}/><path d="M8 4h16a2 2 0 0 1 2 2v25l-10-7L6 31V6a2 2 0 0 1 2-2Z"/><path d="m12 13 3 3 6-6"/></>,
 profile:<><rect x="3" y="3" width="26" height="28" rx="9" fill="currentColor" opacity=".16"/><rect x="3" y="3" width="26" height="28" rx="9"/><circle cx="16" cy="12" r="4" fill="currentColor"/><path d="M8 26a8 8 0 0 1 16 0"/></>};
 return <svg className="pc-nav-symbol" width="32" height="34" viewBox="0 0 32 36" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.discover}</svg>
}
