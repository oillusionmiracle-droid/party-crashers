import React, { useId } from 'react';

// The clean illustration is split with SVG masks: animated pieces are actually
// removed from the stationary layer, so no duplicate sign / phone / poster remains.
// Coordinates use the original 941 × 1672 portrait artboard.
const worlds = [
  '0,401 295,508 341,703 0,599',
  '295,470 670,468 632,696 535,762 400,766 341,703',
  '670,477 941,444 941,666 632,702',
  '0,599 341,703 400,766 246,868 0,800',
  '632,702 941,666 941,817 661,893 535,762',
  '753,865 941,817 941,1179 827,1112 773,1013',
];
const phone = '443,849 594,869 578,1208 390,1181';
const poster = '703,406 864,346 894,738 713,800';
const pin = '801,1030 840,1030 842,1081 818,1108 795,1081';

export function Artwork({ screen }) {
  const uid = useId().replaceAll(':', '');
  const regions = screen.choreography === 'worlds'
    ? worlds.map((points, i) => ({ points, type: 'world', i }))
    : screen.choreography === 'entry' ? [{ points: phone, type: 'phone', i: 0 }]
    : screen.choreography === 'host' ? [{ points: poster, type: 'poster', i: 0 }, { points: pin, type: 'pin', i: 1 }] : [];
  return <div className="artwork" aria-hidden="true">
    <svg className="illustration" viewBox="0 0 941 1672" preserveAspectRatio="xMidYMid slice">
      <defs>
        <mask id={`${uid}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672">
          <rect width="941" height="1672" fill="white" />
          {regions.map(r => <polygon key={r.i} points={r.points} fill="black" />)}
        </mask>
        {regions.map(r => <clipPath key={r.i} id={`${uid}-${r.i}`}><polygon points={r.points} /></clipPath>)}
      </defs>
      <image href={screen.image} width="941" height="1672" mask={regions.length ? `url(#${uid}-base)` : undefined} />
      {regions.map(r => <g key={r.i} className={`art-piece art-${r.type}`} style={{ transformOrigin: r.type === 'pin' ? '818px 1108px' : r.type === 'poster' ? '780px 600px' : r.type === 'phone' ? '490px 1040px' : '470px 650px' }}>
        <image href={screen.image} width="941" height="1672" clipPath={`url(#${uid}-${r.i})`} />
      </g>)}
      {screen.choreography === 'nearby' && <g className="road-signs" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="43" fill="#f7f5de">
        {[{ name: screen.roadSignLabels[0], y: 0, direction: 'left', x: 1 }, { name: screen.roadSignLabels[1], y: 94, direction: 'left', x: 1 }, { name: screen.roadSignLabels[2], y: 188, direction: 'right', x: -1 }].map(s => <g key={s.name} className="road-sign" data-direction={s.x}>
          <g transform={`translate(596 ${552 + s.y}) skewY(-17)`}>
            <rect x="0" y="0" width="246" height="80" rx="7" fill="#084b39" stroke="#c2d1b2" strokeWidth="4" />
            <rect x="8" y="8" width="230" height="64" rx="3" fill="none" stroke="#ffffff35" />
            <text x={s.direction === 'left' ? 89 : 21} y="54">{s.name}</text>
            <path transform={s.direction === 'left' ? 'translate(26 22)' : 'translate(211 58) rotate(180)'} d="M20 0 0 18 20 36V25H46V11H20Z" fill="#f7f5de" />
            <circle cx="12" cy="12" r="3" fill="#e1b66c" /><circle cx="234" cy="68" r="3" fill="#e1b66c" />
          </g>
        </g>)}
      </g>}
      {screen.choreography === 'entry' && <>
        <defs><clipPath id={`${uid}-qr`}><polygon points="462,1070 534,1082 523,1163 449,1150" /></clipPath></defs>
        <g clipPath={`url(#${uid}-qr)`}><path className="scan-light" d="M435 1080L548 1094" stroke="#a6ffe7" strokeWidth="5" opacity="0" /></g>
        <ellipse className="entrance-light" cx="830" cy="674" rx="68" ry="143" fill="#ff9d3438" />
      </>}
      {screen.choreography === 'host' && <text className="poster-label" transform="translate(747 467) rotate(-21)" fontFamily="Outfit, sans-serif" fontWeight="900" fontSize="27" fill="white">{screen.posterTitle[0]}<tspan x="0" dy="29" fill="#ffdf55">{screen.posterTitle[1]}</tspan></text>}
    </svg>
  </div>;
}
