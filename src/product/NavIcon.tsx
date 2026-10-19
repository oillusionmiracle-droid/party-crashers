import React from 'react';
/** Unmodified MIT-licensed Tabler SVG assets, downloaded from tabler/tabler-icons. */
const files:Record<string,string>={discover:'compass',map:'map-2',post:'square-rounded-plus',saved:'bookmark',profile:'user-circle'};
export function NavIcon({name}:{name:string;active?:boolean}){const url=`url("/assets/icons/tabler/${files[name]||files.discover}.svg")`;return <span className="pc-nav-symbol" style={{maskImage:url,WebkitMaskImage:url}} aria-hidden="true"/>}
