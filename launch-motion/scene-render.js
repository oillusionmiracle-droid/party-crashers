// Party Crashers launch-film v2 scene director.
// Designed to sit on top of the motion-anything-style canvas helpers used by the
// self-contained preview: bg, mast, text, heading, pill, screenshot, poster,
// cursor, arrow, pin, bookmark, circle, rr, line, scaleAround, e, sm, mix, clamp.

export function makeSceneRender({ctx, C, spec, images, bg, mast, text, heading, pill, screenshot, poster, cursor, arrow, pin, bookmark, circle, rr, line, scaleAround, e, sm, mix, clamp, dotGrid}) {
  return {
    hook(t) {
      bg(C.cream);
      mast(t,false,'THE QUESTION EVERY WEEKEND STARTS WITH');
      const z=1+.010*Math.sin(Math.min(t,2.5)*1.8);
      scaleAround(960,520,z,()=>{
        text('WHAT’S',82,365,270,C.ink,{font:'Display',weight:400,type:'char-rise',start:0,time:t,stagger:.05,dur:.5});
        text('THE PLAN?',82,655,250,C.orange,{font:'Display',weight:400,type:'word-rise',start:.38,time:t,stagger:.085,dur:.5});
      });
      let p=e(t,.9,.55); pill('FRIDAY NIGHT?',98,835+28*(1-p),252,68,C.ink,C.cream);
      p=e(t,1.15,.55); pill('THIS WEEKEND?',373,835+28*(1-p),292,68,C.lime,C.ink);
      p=e(t,1.4,.55); pill('FREE?',688,835+28*(1-p),145,68,C.orange,C.cream);
      const scan=sm(t,2.48,.72);
      if(scan>0){
        ctx.save();ctx.translate(960,540);ctx.rotate(-.06*(1-scan));
        rr(-mix(300,1120,scan),-mix(40,690,scan),mix(600,2240,scan),mix(80,1380,scan),mix(40,0,scan),C.orange);
        ctx.restore();
      }
    },

    vibe(t) {
      bg(C.orange);
      mast(t,true,'THE CITY IS NOT SHORT OF THINGS TO DO');
      heading(spec.scenes[1].lines,92,285,145,t,C.cream,1.12);
      text('Find the ones that are yours.',98,624,34,C.cream,{alpha:e(t,.5),weight:400});

      const cats=spec.scenes[1].categories;
      const idx=Math.min(cats.length-1,Math.floor(Math.max(0,t-.15)/.36));
      const morph=e(t,1.72,.66);
      const sw=mix(1380,1060,morph), sh=mix(130,650,morph);
      const xx=mix(960,1010,morph), yy=mix(790,565,morph);

      rr(xx-sw/2,yy-sh/2,sw,sh,Math.min(64,sh/2),C.cream);
      ctx.save();ctx.beginPath();ctx.roundRect(xx-sw/2,yy-sh/2,sw,sh,64);ctx.clip();
      const phase=((Math.max(0,t-.15)/.36)%1);
      const dy=phase<.32?(1-e(phase,0,.32))*44:0;
      if(t<1.72) text(cats[idx],xx,yy+dy,48,C.ink,{align:'center'});
      else {
        const im=images['07-discover.webp'];
        ctx.drawImage(im,xx-sw/2,yy-sh/2,sw,sw*im.height/im.width);
      }
      ctx.restore();

      for(let i=0;i<cats.length;i++) rr(1410+i*58,930,42,6,3,i===idx?C.cream:'#ffffff48');
    },

    discover(t) {
      bg(C.cream);
      mast(t,false,'01 / PERSONALIZED DISCOVERY');
      dotGrid(90,200,780,650);

      const enter=e(t,0,.82);
      const px=mix(1125,1245,enter), py=mix(535,555,enter);
      const pw=mix(710,430,enter), ph=mix(770,932,enter);
      screenshot('07-discover.webp',px-pw/2,py-ph/2,pw,ph,{r:34,rotate:mix(0,-.035,enter)});

      heading(spec.scenes[2].lines,94,330,112,t,C.ink,1.12);
      text(spec.scenes[2].body,98,610,29,C.muted,{weight:400,alpha:e(t,.55)});

      ['FOR YOU','TODAY','WEEKEND','FREE'].forEach((label,i)=>{
        const p=e(t,.62+i*.18,.42);
        if(p>.02) pill(label,98+i*170,684+22*(1-p),i===0?145:155,62,i===0?C.orange:C.ink,C.cream);
      });

      let p=e(t,.8,.6);
      poster('trivia.webp',mix(1900,1702,p),mix(825,378,p),350,245,.12);
      p=e(t,1.22,.6);
      poster('moonshot.webp',mix(1950,1700,p),mix(850,694,p),360,270,-.08);

      const search=e(t,2.55,.72);
      if(search>0){
        screenshot('14-search-results.webp',px-pw/2,py-ph/2+55*(1-search),pw,ph,{r:34,rotate:-.035,scale:mix(.94,1,search),shadow:false});
        pill('TECH',774,252,150,65,C.ink,C.cream);
        cursor(920,292,clamp((t-2.72)/.45));
      }

      if(t>3.72){
        const a=e(t,3.72,.6);
        text('Search. Filter. Pick.',98,856,38,C.ink,{alpha:a});
        arrow(608,856,35,C.orange);
      }
    },

    map(t) {
      bg(C.ink);
      mast(t,true,'02 / LAGOS, ON YOUR TERMS');

      const en=e(t,0,.8), x=mix(1245,1350,en), sw=520, sh=895;
      const radius=130+430*sm(t,.25,1.7);
      circle(1310,541,radius,null,'#e0eb6820',2);
      circle(1310,541,radius*.68,null,'#e0eb681a',2);
      screenshot('08-map.webp',x-sw/2,110,sw,sh,{r:30,frame:'#403f34',rotate:mix(.06,.015,en)});

      heading(spec.scenes[3].lines,93,306,118,t,C.cream,1.08);
      text('Use your preferred area.',98,692,30,C.cream,{alpha:e(t,.6)});
      text('Or choose Nearby when you want it.',98,738,28,'#a2a390',{alpha:e(t,.82),weight:400});

      ['5 KM','15 KM','30 KM'].forEach((label,i)=>{
        const p=e(t,.55+i*.22,.45);
        pill(label,98+i*164,822+25*(1-p),140,62,i===1?C.lime:'#33332c',i===1?C.ink:C.cream);
      });

      pin(1012,352,38,C.lime);
      pin(1027,620,38,C.orange);
      text('Location is optional.',98,930,23,C.lime,{weight:400,alpha:e(t,1.4)});
    },

    details(t) {
      bg(C.cream);
      mast(t,false,'03 / KNOW BEFORE YOU GO');

      const en=e(t,0,.84), x=mix(1280,510,en), rot=mix(.015,-.025,en);
      screenshot('16-event-details-viewport.webp',x-221,91,442,958,{r:30,rotate:rot});

      heading(spec.scenes[4].lines,895,292,101,t,C.ink,1.08);
      text(spec.scenes[4].body,900,548,29,C.muted,{weight:400,alpha:e(t,.66)});

      spec.scenes[4].facts.forEach((label,i)=>{
        const p=e(t,.95+i*.36,.5);
        ctx.save();ctx.translate(0,26*(1-p));ctx.globalAlpha=p;
        rr(896,618+i*94,822,72,20,i===2?C.orange:'#E9E5DA');
        if(i===0){rr(925,639,28,28,5,null,C.ink,2);line(924,648,953,648,C.ink,2);}
        if(i===1) pin(940,748,26,C.ink);
        if(i===2) arrow(940,842,28,C.cream);
        text(label,980,654+i*94,27,i===2?C.cream:C.ink,{weight:i===2?700:400});
        ctx.restore();
      });

      if(t>2.05){
        const p=e(t,2.05,.42);
        circle(312,997,39*p,C.orange);
        bookmark(312,997,30,C.cream,p>.9?C.cream:null);
      }

      const saved=e(t,2.35,.52);
      pill('SAVE TO YOUR SHORTLIST',897,924+28*(1-saved),420,66,C.ink,C.cream);
      text('Registration continues on the organiser’s site.',900,1010,20,C.muted,{weight:400,alpha:e(t,2.65)});
    },

    host(t) {
      bg(C.orange);
      mast(t,true,'04 / PUT YOUR EVENT IN THE MIX');

      heading(spec.scenes[5].lines,94,318,108,t,C.cream,1.1);
      text('Post your event. Free.',98,604,36,C.cream,{alpha:e(t,.5)});
      text('Start with a flyer or fill it in yourself.',98,672,27,'#fff9',{weight:400,alpha:e(t,.72)});
      text('Flyer text becomes a draft. You review it.',98,716,27,'#fff9',{weight:400,alpha:e(t,.9)});

      const p=e(t,.04,.82), w=480, h=980;
      screenshot('09-post-event.webp',mix(1800,1180,p),77,w,h,{r:30,rotate:mix(.12,.025,p)});

      let q=e(t,.9,.48);
      pill('START WITH A FLYER',870,824+30*(1-q),360,66,C.ink,C.cream);
      arrow(1258,857,28,C.cream);
      q=e(t,1.42,.48);
      pill('OR CREATE MANUALLY',864,912+30*(1-q),395,66,C.cream,C.ink);

      cursor(1451,494,clamp((t-2.15)/.45),C.ink);
      text('OCR helps fill the draft — it does not auto-publish.',98,944,22,C.cream,{weight:400,alpha:e(t,2.45)});
    },

    outro(t) {
      bg(C.cream);
      mast(t,false,'THE PLAN DOESN’T HAVE TO STAY IN THE GROUP CHAT');

      const p=e(t,0,.86), logo=images['logo.webp'], size=mix(520,226,p);
      ctx.save();ctx.translate(mix(1530,960,p),mix(760,230,p));ctx.rotate(mix(.15,0,p));
      ctx.drawImage(logo,-size/2,-size/2,size,size);ctx.restore();

      const q=e(t,.52,.66);
      text('Lagos has plans.',960,478+42*(1-q),96,C.ink,{font:'Display',weight:400,align:'center',alpha:q});
      text('Find the ones that are yours.',960,620,78,C.orange,{font:'Display',weight:400,align:'center',type:'word-rise',time:t,start:.88,stagger:.055});

      const c=e(t,1.72,.62);
      rr(610,810,700*c,82,41,C.ink);
      if(c>.3){
        ctx.save();ctx.beginPath();ctx.roundRect(610,810,700*c,82,41);ctx.clip();
        text(spec.scenes[6].cta,960,851,29,C.cream,{align:'center'});
        arrow(1265,851,28,C.cream);ctx.restore();
      }

      text('Discover → check the details → save it → register with the organiser.',960,935,22,C.muted,{weight:400,align:'center',alpha:e(t,2.05)});
      text(spec.url,960,982,23,C.muted,{weight:400,align:'center',alpha:e(t,2.2)});

      const a=e(t,.15,.82);
      screenshot('07-discover.webp',mix(-440,55,a),mix(510,260,a),275,596,{r:24,rotate:-.12,shadow:true});
      screenshot('08-map.webp',mix(2040,1585,a),mix(510,260,a),275,596,{r:24,rotate:.12,shadow:true});
    }
  };
}
