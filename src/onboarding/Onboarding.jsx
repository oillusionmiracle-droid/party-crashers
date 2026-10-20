import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { onboardingScreens } from './screens';
import { Artwork } from './Artwork';
import './onboarding.css';

function useReducedMotion() {
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const sync = () => setReduce(mq.matches); mq.addEventListener('change', sync); return () => mq.removeEventListener('change', sync); }, []);
  return reduce;
}

export function KineticHeadline({ parts, id }) {
  return <h1 id={id} className="headline" tabIndex={-1} aria-label={parts.map(p => p.text).join(' ')}>
    {parts.map((part, i) => <span className={`headline-line ${part.accent ? 'accent' : ''}`} key={i} aria-hidden="true">
      <span className="line-words">{part.text.split(' ').map((word, j) => <span className="word" key={j}>{word}{j < part.text.split(' ').length - 1 ? '\u00a0' : ''}</span>)}</span>
    </span>)}
  </h1>;
}

export function ProgressDots({ total, current, onSelect, disabled }) {
  return <ol className="progress-dots" aria-label={`Onboarding progress: step ${current + 1} of ${total}`}>
    {Array.from({ length: total }, (_, i) => <li key={i} aria-current={i === current ? 'step' : undefined}><button className={`progress-dot ${i === current ? 'is-active' : ''}`} onClick={() => onSelect?.(i)} disabled={disabled} aria-label={`Go to introduction ${i + 1}`} aria-current={i === current ? 'step' : undefined} /></li>)}
  </ol>;
}

function Arrow() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

/** Drop-in onboarding. onComplete('start'|'browse') is the only app integration. */
export function Onboarding({ screens = onboardingScreens, onComplete = () => {}, initialIndex = 0 }) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, screens.length - 1)));
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const root = useRef(null), active = useRef(index), locked = useRef(false), animation = useRef(null), entry = useRef(null), gesture = useRef(null);
  const reduce = useReducedMotion();
  const [request, setRequest] = useState(null);
  const warmed = useRef(new Map());
  const transitionContexts = useRef([]);

  async function warm(i) {
    if (!warmed.current.has(i)) warmed.current.set(i, new Promise(resolve => {
      const image = new Image(); const timer = setTimeout(() => resolve(false), 5000); image.onload = () => { clearTimeout(timer); resolve(true); }; image.onerror = () => { clearTimeout(timer); resolve(false); }; image.src = screens[i].image;
    }));
    return warmed.current.get(i);
  }
  useEffect(() => { let alive = true; warm(index).then(ok => { if (alive) { setImageError(!ok); setReady(true); } }); return () => { alive = false; }; }, [screens]);
  useEffect(() => { if (index + 1 < screens.length) warm(index + 1); }, [index, screens]);

  // All GSAP work belongs to a scoped context and is reverted on unmount.
  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const panels = root.current.querySelectorAll('.onboarding-screen');
      gsap.set(panels, { xPercent: 0, autoAlpha: 0 }); gsap.set(panels[active.current], { autoAlpha: 1 });
      entry.current = enter(panels[active.current], screens[active.current], reduce);
    }, root);
    return () => { animation.current?.kill(); entry.current?.kill(); transitionContexts.current.reverse().forEach(c => c.revert()); transitionContexts.current = []; ctx.revert(); };
  }, [ready, reduce, screens]);

  useLayoutEffect(() => {
    if (!request || !ready) return;
    const next = request.to, old = active.current;
    if (next === old) { locked.current = false; setBusy(false); return; }
    const panels = root.current.querySelectorAll('.onboarding-screen'), outgoing = panels[old], incoming = panels[next];
    const direction = next > old ? 1 : -1;
    entry.current?.kill();
    const ctx = gsap.context(() => {
      gsap.set(incoming, { autoAlpha: 1, zIndex: 2 }); gsap.set(outgoing, { zIndex: 1 });
      const duration = reduce ? 0 : .56;
      const tl = gsap.timeline({ onComplete: () => {
        gsap.set(outgoing, { autoAlpha: 0, xPercent: 0 });
        gsap.set(outgoing.querySelectorAll('.artwork,.screen-copy,.screen-controls'), { clearProps: 'transform,opacity' });
        active.current = next; setIndex(next); locked.current = false; setBusy(false);
        incoming.querySelector('.headline')?.focus({ preventScroll: true });
      }});
      if (!reduce) {
        tl.fromTo(incoming, { xPercent: direction * 100 }, { xPercent: 0, duration, ease: 'power3.inOut' }, 0)
          .to(outgoing, { xPercent: -direction * 100, duration, ease: 'power3.inOut' }, 0)
          .fromTo(incoming.querySelector('.artwork'), { xPercent: -direction * 55 }, { xPercent: 0, duration, ease: 'power3.inOut' }, 0)
          .to(outgoing.querySelector('.artwork'), { xPercent: direction * 55, duration, ease: 'power3.inOut' }, 0);
      }
      tl.add(() => { entry.current = enter(incoming, screens[next], reduce); }, reduce ? 0 : .14);
      animation.current = tl;
    }, root);
    transitionContexts.current.push(ctx);
    return () => { animation.current?.kill(); };
  }, [request, ready, reduce, screens]);

  async function go(to) {
    if (locked.current || to < 0 || to >= screens.length || to === active.current) return;
    locked.current = true; setBusy(true);
    const ok = await warm(to); setImageError(!ok);
    setRequest({ to, nonce: Date.now() });
  }
  function primary() { if (locked.current) return; index === screens.length - 1 ? onComplete('start') : go(index + 1); }
  function press(event, scale) { if (!reduce) gsap.to(event.currentTarget, { scale, duration: .12, ease: 'power2.out', overwrite: true }); }
  function keyboard(e) { if (e.target instanceof HTMLButtonElement || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); } }

  return <main className="onboarding-shell"><header className="intro-header"><a className="intro-brand" href="#discover" onClick={e => { e.preventDefault(); if (!locked.current) onComplete('browse'); }} aria-label="Party Crashers home"><img src="/assets/brand/pin-colour.png" alt="" width="44" height="48"/><span>party<br/><em>crashers</em></span></a><span className="intro-city">Made for Lagos.</span><button className="intro-skip" disabled={busy} onClick={() => onComplete('browse')}>Browse events <Arrow /></button></header><div className="onboarding" ref={root} onKeyDown={keyboard} tabIndex={-1} aria-label="Welcome to Party Crashers" aria-busy={busy}
    onPointerDown={e => { if (e.target.closest('button,a')) return; gesture.current = { x: e.clientX, y: e.clientY }; }}
    onPointerUp={e => { if (!gesture.current) return; const dx = e.clientX - gesture.current.x, dy = e.clientY - gesture.current.y; gesture.current = null; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1)); }}
    onPointerCancel={() => { gesture.current = null; }}>
    {!ready && <div className="loading" role="status">Loading the introduction…</div>}
    {imageError && <p className="image-warning" role="alert">Artwork could not load. You can still continue.</p>}
    {screens.map((screen, i) => <section key={screen.id} className={`onboarding-screen screen-${screen.id} align-${screen.alignment}`} data-screen={screen.id} aria-hidden={index !== i} inert={index !== i ? true : undefined} style={{ visibility: 'hidden' }} aria-labelledby={`headline-${screen.id}`}>
      <div className="intro-visual" style={{'--art-colour':screen.artColor}}><Artwork screen={screen} /><div className="intro-art-caption"><span>{screen.caption}</span><span aria-hidden="true">{String(i+1).padStart(2,'0')} / {String(screens.length).padStart(2,'0')}</span></div></div>
      <div className="screen-copy">
        <p className="intro-eyebrow"><span>{String(i + 1).padStart(2, '0')}</span>{screen.label}</p>
        <KineticHeadline parts={screen.headlineParts} id={`headline-${screen.id}`} />
        {screen.body && <p className="supporting-copy">{screen.body}</p>}
      </div>
      <footer className="screen-controls">
        <div className="intro-progress-row"><ProgressDots total={screens.length} current={i} onSelect={go} disabled={busy}/><span>{String(i+1).padStart(2,'0')} / {String(screens.length).padStart(2,'0')}</span></div>
        <div className="intro-actions">{i > 0 && <button className="intro-back" disabled={busy} onClick={() => go(i - 1)} aria-label="Previous introduction"><Arrow /></button>}
        <button className={`next-button ${i === 0 || i === screens.length - 1 ? 'wide' : 'compact'}`} disabled={busy} onClick={primary} onPointerDown={e => press(e, .97)} onPointerUp={e => press(e, 1)} onPointerCancel={e => press(e, 1)} onPointerLeave={e => press(e, 1)} aria-label={i === screens.length - 1 ? screen.buttonLabel : `Next: step ${i + 2} of ${screens.length}`}>
          <span className="button-label">{screen.buttonLabel}</span><Arrow />
        </button>
        </div><button className="secondary-action" disabled={busy} onClick={() => onComplete(screen.secondaryAction.action)}>{screen.secondaryAction.label}</button>
        <p className="intro-reassurance">Browse freely. Sign in to save your plans.</p>
      </footer>
    </section>)}
    <span className="sr-only" role="status" aria-live="polite">{ready ? `Step ${index + 1} of ${screens.length}: ${screens[index].headlineParts.map(p => p.text).join(' ')}` : ''}</span>
  </div></main>;
}

function enter(panel, screen, reduced) {
  const words = panel.querySelectorAll('.word'), body = panel.querySelector('.supporting-copy'), dots = panel.querySelectorAll('.progress-dot'), activeDot = panel.querySelector('.progress-dot.is-active'), buttons = panel.querySelectorAll('.next-button,.secondary-action');
  const tl = gsap.timeline();
  if (reduced) { gsap.set([words, body, dots, buttons, ...panel.querySelectorAll('.art-piece,.road-sign,.poster-label')].filter(Boolean).flat(), { clearProps: 'all' }); return tl; }
  gsap.set(words, { willChange: 'transform' });
  tl.fromTo(panel.querySelector('.intro-eyebrow'), {opacity:0}, {opacity:1,duration:.2}, 0);
  const lineGap = screen.choreography === 'nearby' ? .18 : .14;
  panel.querySelectorAll('.headline-line').forEach((line, i) => {
    const sideways = screen.choreography === 'worlds' || (screen.choreography === 'host' && i === 1);
    tl.fromTo(line.querySelectorAll('.word'), { xPercent: sideways ? -108 : 0, yPercent: sideways ? 0 : 115, scale: screen.choreography === 'entry' ? 1.025 : 1 }, { xPercent: 0, yPercent: 0, scale: 1, stagger: .045, duration: .46, ease: 'power3.out', clearProps: 'willChange' }, i * lineGap);
  });
  const headlineEnd = tl.duration();
  if (body) tl.fromTo(body, { autoAlpha: 0, x: screen.choreography === 'nearby' ? -7 : 0, y: screen.choreography === 'nearby' ? 0 : 7 }, { autoAlpha: 1, x: 0, y: 0, duration: .32, ease: 'power2.out' }, headlineEnd + .12);
  const artStart = headlineEnd + .06;
  if (screen.artLayout === 'scene') tl.fromTo(panel.querySelector('.artwork'), {clipPath:'inset(0 10% 0 0)',scale:.985}, {clipPath:'inset(0 0% 0 0)',scale:1,duration:.5,ease:'power3.out'}, artStart);
  if (screen.choreography === 'discover') tl.fromTo(panel.querySelector('.artwork'), { scale: 1.007, y: 2 }, { scale: 1, y: 0, duration: .75, ease: 'power2.out' }, 0);
  if (screen.artLayout !== 'scene' && screen.choreography === 'nearby') panel.querySelectorAll('.road-sign').forEach((sign, i) => tl.fromTo(sign, { x: Number(sign.dataset.direction) * 15, opacity: 0 }, { x: 0, opacity: 1, duration: .34, ease: 'power2.out' }, artStart + i * .10));
  if (screen.artLayout !== 'scene' && screen.choreography === 'worlds') tl.fromTo(panel.querySelectorAll('.art-world'), { clipPath: 'inset(0 100% 0 0)', opacity: .5 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, stagger: .10, duration: .40, ease: 'power2.out' }, artStart);
  if (screen.artLayout !== 'scene' && screen.choreography === 'entry') {
    tl.fromTo(panel.querySelector('.art-phone'), { scale: .96 }, { scale: 1, duration: .42, ease: 'power2.out' }, artStart)
      .fromTo(panel.querySelector('.scan-light'), { y: 0, opacity: 0 }, { y: 61, keyframes: { opacity: [0, .95, .95, 0] }, duration: .65, ease: 'none' }, artStart + .38)
      .fromTo(panel.querySelector('.entrance-light'), { opacity: .18 }, { opacity: .7, duration: 2.3, repeat: 1, yoyo: true, ease: 'sine.inOut' }, artStart);
  }
  if (screen.artLayout !== 'scene' && screen.choreography === 'host') {
    tl.fromTo(panel.querySelectorAll('.art-poster,.poster-label'), { x: -6, y: 9, scale: .975, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: .38, ease: 'power2.out' }, artStart)
      .fromTo(panel.querySelector('.art-pin'), { scale: .65, opacity: 0 }, { scale: 1, opacity: 1, duration: .28, ease: 'power3.out' }, artStart + .32);
  }
  tl.fromTo(dots, { opacity: .45 }, { opacity: 1, duration: .18 }, headlineEnd + .25)
    .fromTo(activeDot, { scaleX: .65 }, { scaleX: 1, duration: .25, ease: 'power2.out' }, headlineEnd + .25)
    .fromTo(buttons, { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .25, stagger: .055, ease: 'power2.out' }, Math.max(headlineEnd + .38, artStart + ({ worlds: .95, entry: 1.08, host: .65, nearby: .58 }[screen.choreography] || .45)));
  return tl;
}
