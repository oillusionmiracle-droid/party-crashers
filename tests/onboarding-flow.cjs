const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
require('esbuild').buildSync({entryPoints:['src/onboarding/Onboarding.jsx'],outfile:'.sites-runtime/intro-flow.cjs',platform:'node',format:'cjs',bundle:true,external:['react','react-dom','gsap'],loader:{'.css':'empty'},jsx:'automatic'});
const {Window}=await import('happy-dom');const w=new Window({url:'https://party-crashers-seven.vercel.app/#onboarding'});
for(const k of ['document','navigator','HTMLElement','HTMLButtonElement','Event','MouseEvent'])global[k]=w[k];global.window=w;global.getComputedStyle=w.getComputedStyle.bind(w);global.matchMedia=w.matchMedia=()=>({matches:process.env.PC_MOTION!=='full',addEventListener(){},removeEventListener(){}});global.Image=class {set src(v){queueMicrotask(()=>this.onload?.())}};global.IS_REACT_ACT_ENVIRONMENT=true;
if(w.SVGTransformList)w.SVGTransformList.prototype.consolidate=()=>({matrix:{a:1,b:0,c:0,d:1,e:0,f:0}});
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{gsap}=require('gsap');const {Onboarding}=require(path.resolve('.sites-runtime/intro-flow.cjs'));const host=w.document.createElement('div');w.document.body.append(host);const root=createRoot(host);let completed='';
const tick=async()=>{await act(async()=>{await new Promise(r=>setTimeout(r,25));gsap.globalTimeline.time(gsap.globalTimeline.time()+4);await Promise.resolve()})};
await act(async()=>root.render(React.createElement(Onboarding,{onComplete:x=>completed=x})));await tick();
const current=()=>w.document.querySelector('section[aria-hidden="false"]');assert.equal(current().dataset.screen,'discover');assert.equal(current().querySelectorAll('.progress-dot').length,5);
for(const id of ['nearby','more','entry','host']){await act(async()=>current().querySelector('.next-button').click());await tick();assert.equal(current().dataset.screen,id);assert.equal(current().querySelectorAll('.progress-dot[aria-current="step"]').length,1)}
await act(async()=>current().querySelector('.intro-back').click());await tick();assert.equal(current().dataset.screen,'entry');
await act(async()=>current().querySelector('[aria-label="Go to introduction 5"]').click());await tick();assert.equal(current().dataset.screen,'host');
await act(async()=>current().querySelector('.next-button').click());assert.equal(completed,'start');await act(async()=>w.document.querySelector('.intro-skip').click());assert.equal(completed,'browse');
assert.equal(w.document.querySelectorAll('section[inert]').length,4);await act(async()=>root.unmount());gsap.ticker.sleep();console.log('PASS: all five steps, back, progress navigation, motion preference, completion, browse and inactive-panel accessibility');
})().catch(e=>{console.error(e);process.exitCode=1});
