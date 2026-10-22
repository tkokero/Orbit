/* Bounded, finite particle choreography for the secret intros. */
(()=>{
 function play(root,style,duration){
  const canvas=document.createElement('canvas');canvas.className='startup-cosmos';canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.remove();return {stop(){},release(){}};}
  let palette,light=false,paletteKey='';
  let frame=0,stopped=false,width=0,height=0,started=performance.now();
  const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  let seed=style==='singularity'?431:style==='bigbang'?1231:791;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const stars=Array.from({length:150},()=>({angle:random()*Math.PI*2,radius:.1+random()*.9,size:.55+random()*1.5,phase:random(),speed:.4+random()*.6}));
  const groups=Array.from({length:6},(_,band)=>stars.filter(star=>Math.min(2,Math.floor(star.phase*3))*2+Number(star.phase>.55)===band));
  const sprites=new Map();
  function sprite(color){const image=document.createElement('canvas');image.width=image.height=192;const painter=image.getContext('2d'),gradient=painter.createRadialGradient(96,96,0,96,96,96);gradient.addColorStop(0,color);gradient.addColorStop(.3,color);gradient.addColorStop(1,'transparent');painter.fillStyle=gradient;painter.fillRect(0,0,192,192);sprites.set(color,image);return image;}
  function updatePalette(){const theme=getComputedStyle(root),color=(name,fallback)=>theme.getPropertyValue(name).trim()||fallback,next={accent:color('--accent','#b9a0ef'),cool:color('--cool','#9dddeb'),warm:color('--warm','#ffd49c')},key=JSON.stringify(next)+theme.colorScheme;if(key===paletteKey)return;paletteKey=key;palette=next;light=theme.colorScheme==='light';for(const image of sprites.values())image.width=image.height=1;sprites.clear();for(const color of new Set(Object.values(palette)))sprite(color);}
  // Theme initialization follows boot playback on a cold launch.
  const themeObserver=new MutationObserver(updatePalette);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['style']});updatePalette();
  function size(){
   width=Math.max(1,root.clientWidth);height=Math.max(1,root.clientHeight);
   // The sharp central logo stays in CSS; the soft particle field needs fewer pixels.
   const scale=Math.min(devicePixelRatio||1,1,Math.sqrt(680000/(width*height)));
   canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);ctx.setTransform(scale,0,0,scale,0,0);ctx.lineCap='round';ctx.lineJoin='round';
  }
  function glow(x,y,radius,color,alpha){
   ctx.globalAlpha=alpha;ctx.drawImage(sprites.get(color),x-radius,y-radius,radius*2,radius*2);
  }
  function haze(x,y,rx,ry,angle,color,alpha){
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=alpha;ctx.drawImage(sprites.get(color),-rx,-ry,rx*2,ry*2);ctx.restore();
  }
  function gravity(p,cx,cy,reach){
   const gather=smooth(p/.36),collapse=smooth((p-.42)/.16),returning=smooth((p-.62)/.22),presence=smooth(p/.16)*(1-collapse)+returning*.4;
   const radius=(100+gather*45)*(1-collapse*.98)+returning*74;
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-.2);ctx.globalCompositeOperation=light?'source-over':'screen';
   // Light wraps above and below the dark center, then folds into the collapse.
   for(let lane=0;lane<4;lane++){
    ctx.strokeStyle=lane%2?palette.cool:palette.accent;ctx.globalAlpha=presence*(.5-lane*.07);ctx.lineWidth=lane===0?2.5:1;ctx.beginPath();
    for(let i=0;i<=84;i++){const angle=i/84*Math.PI*2,r=radius+lane*19+Math.sin(angle*3+p*9)*3,x=Math.cos(angle)*r,y=Math.sin(angle)*r*(.32+Math.sin(angle)**2*.5);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
   }
   for(let i=0;i<12;i++){const star=stars[i*7],angle=star.angle+p*(2+gather*5),r=radius+20+star.phase*65,x=Math.cos(angle)*r,y=Math.sin(angle)*r*.42;glow(x,y,6+star.size*4,i%2?palette.cool:palette.accent,presence*.45);}
   ctx.restore();
   // Two soft, tapered polar jets unfold from one sustained release of energy.
   const jets=smooth((p-.6)/.08)*(1-smooth((p-.76)/.18)),length=Math.min(reach*.75,380)*smooth((p-.6)/.25);
   if(jets>0){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.3);ctx.globalCompositeOperation=light?'source-over':'screen';
    for(const direction of [-1,1]){
     haze(0,direction*length*.5,18+jets*10,Math.max(1,length*.7),0,palette.cool,jets*.34);
     for(let strand=0;strand<3;strand++){ctx.globalAlpha=jets*(.6-strand*.13);ctx.strokeStyle=strand%2?palette.accent:palette.cool;ctx.lineWidth=1.4-strand*.3;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo((strand-1)*18,direction*length*.3,(strand-1)*9,direction*length*.72,(strand-1)*18,direction*length);ctx.stroke();}
     glow(0,direction*length,22,palette.cool,jets*.45);
    }ctx.restore();
   }
  }
  function eruption(p,cx,cy,reach){
   const grow=smooth(p/.5),charge=smooth(p/.18)*(1-smooth((p-.51)/.09)),blast=smooth((p-.55)/.38);
   ctx.globalCompositeOperation=light?'source-over':'screen';
   // Rounded magnetic loops climb off the stellar surface before it gives way.
   for(let i=0;i<12;i++){
    const angle=i*Math.PI/6+p*.6,r=32+grow*25,tip=r+18+grow*(24+Math.sin(i*2+p*4)*12),spread=.19;
    ctx.globalAlpha=charge*(.35+(i%3)*.12);ctx.strokeStyle=i%3?palette.warm:palette.accent;ctx.lineWidth=1.1+(i%3)*.45;ctx.beginPath();ctx.moveTo(cx+Math.cos(angle-spread)*r,cy+Math.sin(angle-spread)*r);ctx.quadraticCurveTo(cx+Math.cos(angle)*tip*1.25,cy+Math.sin(angle)*tip*1.25,cx+Math.cos(angle+spread)*r,cy+Math.sin(angle+spread)*r);ctx.stroke();
   }
   const remnant=smooth((p-.56)/.09)*(1-smooth((p-.87)/.13));
   if(remnant<=0)return;
   // Uneven shells roll out in lobes, with bright knots along their edges.
   for(let shell=0;shell<3;shell++){
    const wave=smooth((p-.55-shell*.035)/.39),base=60+wave*reach*(.66+shell*.14);ctx.strokeStyle=shell===1?palette.cool:palette.warm;ctx.globalAlpha=remnant*(.48-shell*.1);ctx.lineWidth=1.8-shell*.35;ctx.beginPath();
    for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,r=base*(1+Math.sin(a*7+shell+p*3)*.055+Math.sin(a*13-shell)*.018),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.68;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
   }
   for(let i=0;i<14;i++){
    const a=i*Math.PI/7+.14,r=65+blast*reach*(.4+(i%4)*.1),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.68;
    haze(x,y,18+blast*48,8+blast*20,a,i%3?palette.warm:palette.accent,remnant*.26);
    ctx.globalAlpha=remnant*.65;ctx.strokeStyle=i%2?palette.warm:palette.cool;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,2.5+(i%3)*1.5+blast*3,0,Math.PI*2);ctx.stroke();
   }
  }
  function creation(p,cx,cy,reach){
   const gather=smooth(p/.14)*(1-smooth((p-.6)/.05)),pull=smooth((p-.35)/.3),expand=smooth((p-.66)/.29);
   ctx.globalCompositeOperation=light?'source-over':'screen';
   // A carousel of little worlds spirals into one seed; nothing is spawned mid-frame.
   if(gather>0)for(let i=0;i<6;i++){
    const angle=i*Math.PI/3+p*2.1+pull*6,r=reach*(.32+(i%2)*.1)*(1-pull*.99),x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.62,color=i%3===0?palette.cool:i%3===1?palette.warm:palette.accent;
    glow(x,y,12+(1-pull)*15,color,gather*.38);ctx.globalAlpha=gather*.7;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(1,(5+i%3*2)*(1-pull)),0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=gather*.45;ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y,Math.max(1,22*(1-pull)),Math.max(1,8*(1-pull)),angle-.4,0,Math.PI*2);ctx.stroke();
   }
   const born=smooth((p-.67)/.07)*(1-smooth((p-.92)/.08)*.8);
   if(born<=0)return;
   // Six unfurling galaxy arms carry the explosion into a colorful new universe.
   for(let arm=0;arm<6;arm++){
    const color=arm%3===0?palette.cool:arm%3===1?palette.warm:palette.accent;ctx.strokeStyle=color;ctx.globalAlpha=born*.52;ctx.lineWidth=arm%2?1.3:2;ctx.beginPath();
    for(let i=0;i<=54;i++){const t=i/54,r=(12+t*reach*.83)*expand,angle=arm*Math.PI/3+t*2.4-expand*.8,x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.62;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);if(i%9===0){ctx.moveTo(x+2,y);ctx.arc(x,y,2,0,Math.PI*2);ctx.moveTo(x,y);}}ctx.stroke();
    const angle=arm*Math.PI/3+2.4-expand*.8,r=reach*.69*expand;haze(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r*.62,110,40,angle,color,born*.16);
   }
  }
  function bigBang(p,cx,cy,reach,fade){
   const pull=smooth((p-.38)/.265),blast=smooth((p-.65)/.25),settle=smooth((p-.85)/.13);
   ctx.globalCompositeOperation=light?'source-over':'screen';
   glow(cx,cy,Math.min(reach,510),palette.accent,fade*.12);
   creation(p,cx,cy,reach);
   // The same star field becomes comet trails, an inward spiral and ejected stardust.
   for(let band=0;band<groups.length;band++){
    ctx.globalAlpha=fade*(.36+Math.floor(band/2)*.18)*(1-settle*.6);
    ctx.strokeStyle=band%2?palette.cool:palette.accent;ctx.lineWidth=.8+Math.floor(band/2)*.45;ctx.beginPath();
    for(const star of groups[band]){
     let radius,angle,trail;
     if(p<.38){radius=reach*star.radius*(.8+Math.sin(p*5+star.phase*6)*.06);angle=star.angle+p*(.5+star.speed);trail=1+smooth((p-.08)/.12)*(1-smooth((p-.27)/.1))*(10+star.speed*55);}
     else if(p<.65){radius=reach*star.radius*(1-pull*.995);angle=star.angle+pull*pull*(6+star.speed*5);trail=3+pull*45;}
     else{radius=reach*star.radius*(.015+blast*1.65);angle=star.angle+6+blast*.15;trail=2+Math.sin(blast*Math.PI)**2*145;}
     const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*.72;
     ctx.moveTo(x,y);ctx.lineTo(cx+Math.cos(angle-(p>.38&&p<.65?.09:0))*Math.max(0,radius-trail),cy+Math.sin(angle-(p>.38&&p<.65?.09:0))*Math.max(0,radius-trail)*.72);
    }ctx.stroke();
   }
   const orbit=smooth((p-.24)/.1)*(1-smooth((p-.55)/.09));
   if(orbit>0){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.25);
    for(let i=0;i<5;i++){const radius=(83+i*13)*(1-pull*.94);ctx.globalAlpha=fade*orbit*(.5-i*.06);ctx.strokeStyle=i%2?palette.cool:palette.accent;ctx.lineWidth=i===0?2:1;ctx.beginPath();ctx.ellipse(0,0,Math.max(1,radius),Math.max(1,radius*.3),0,p*(9+i),p*(9+i)+Math.PI*1.45);ctx.stroke();}
    ctx.restore();
   }
   const impact=smooth((p-.65)/.045)*(1-smooth((p-.73)/.2));
   if(impact>0){
    glow(cx,cy,65+blast*reach*.8,palette.warm,impact*.34);
    for(let i=0;i<3;i++){const wave=smooth((p-.65-i*.025)/.27);if(wave<=0||wave>=1)continue;ctx.globalAlpha=(1-wave)*.65;ctx.strokeStyle=i===1?palette.accent:palette.warm;ctx.lineWidth=2.6-i*.65;ctx.beginPath();ctx.ellipse(cx,cy,Math.max(1,wave*reach*1.25),Math.max(1,wave*reach*.72),i*.12,0,Math.PI*2);ctx.stroke();}
    // Rounded sparks echo the opening bubbles without allocating another particle field.
    for(let i=0;i<18;i++){const star=stars[i],radius=45+blast*reach*(.45+star.radius*.6);ctx.globalAlpha=impact*.65;ctx.fillStyle=i%2?palette.warm:palette.cool;ctx.beginPath();ctx.arc(cx+Math.cos(star.angle)*radius,cy+Math.sin(star.angle)*radius*.72,1.5+star.size*1.7,0,Math.PI*2);ctx.fill();}
   }
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  function render(progress){
   const p=clamp(progress),cx=width/2,cy=height/2-12,reach=Math.hypot(width,height)*.56,fade=smooth(p*7)*(1-smooth((p-.86)/.14));
   ctx.clearRect(0,0,width,height);
   if(style==='bigbang'){bigBang(p,cx,cy,reach,fade);return;}
   const singular=style==='singularity',charge=smooth(p/.53),blast=smooth((p-.54)/.36);
   ctx.globalCompositeOperation=light?'source-over':'screen';
   glow(cx,cy,Math.min(reach,520)*(singular?.7:1+blast*.6),palette.accent,fade*(singular?.14:.13+blast*.14));
   if(singular)gravity(p,cx,cy,reach);else eruption(p,cx,cy,reach);
   const pull=smooth((p-.08)/.48),emerge=smooth((p-.6)/.35);
   for(let band=0;band<groups.length;band++){
    ctx.globalAlpha=fade*(.4+Math.floor(band/2)*.25)*(singular&&p>.58?emerge:1);
    ctx.strokeStyle=singular?(band%2?palette.accent:palette.cool):(band%2?palette.warm:palette.accent);ctx.lineWidth=.75+Math.floor(band/2)*.5;ctx.beginPath();
    for(const star of groups[band]){
    let radius,angle,trail;
    if(singular){radius=reach*star.radius*(1-pull*.98);angle=star.angle+charge*charge*(3+star.speed*6);trail=4+pull*35;if(p>.58){radius=reach*star.radius*(.12+emerge*.9);angle=star.angle+6+emerge*.25;trail=2+(1-emerge)*18;}}
    else{radius=reach*star.radius*(1-charge*.55+blast*1.7);angle=star.angle+charge*.18;trail=1+blast*(1-blast)*190;}
    const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*.72;
    ctx.moveTo(x,y);
    if(singular&&p<.58)ctx.lineTo(cx+Math.cos(angle-.06-p*.14)*(radius+trail),cy+Math.sin(angle-.06-p*.14)*(radius+trail)*.72);
    else ctx.lineTo(cx+Math.cos(angle)*(radius-trail),cy+Math.sin(angle)*(radius-trail)*.72);
    }ctx.stroke();
   }
   if(singular){
    // Tilted, nested accretion arcs accelerate into the event horizon.
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.25+charge*.18);
    const collapse=1-smooth((p-.42)/.15),arrival=smooth((p-.62)/.22),radius=90*collapse+57*arrival;
    for(let i=0;i<7;i++){
     ctx.globalAlpha=fade*(.55-i*.055)*(collapse+arrival*.5);ctx.strokeStyle=i%2?palette.cool:palette.accent;ctx.lineWidth=i===0?3:1;
     ctx.beginPath();ctx.ellipse(0,0,Math.max(1,radius+i*13),Math.max(1,(radius+i*13)*.29),0,charge*(4+i*.2),charge*(4+i*.2)+Math.PI*(1.15+i*.08));ctx.stroke();
    }
    ctx.restore();
    const ripple=smooth((p-.6)/.33);if(ripple>0&&ripple<1){ctx.globalAlpha=(1-ripple)*.5;ctx.strokeStyle=palette.accent;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,Math.max(1,ripple*reach),Math.max(1,ripple*reach*.64),-.18,0,Math.PI*2);ctx.stroke();}
   }else{
    const impact=smooth((p-.53)/.08)*(1-smooth((p-.65)/.29));
    glow(cx,cy,Math.max(1,80+blast*reach*.65),palette.warm,impact*.3);
    for(let i=0;i<3;i++){
     const wave=smooth((p-.54-i*.045)/(.36-i*.02));if(wave<=0||wave>=1)continue;
     ctx.globalAlpha=(1-wave)*.65;ctx.strokeStyle=i===1?palette.accent:palette.warm;ctx.lineWidth=3-i*.7;
     ctx.beginPath();ctx.ellipse(cx,cy,Math.max(1,wave*reach*1.1),Math.max(1,wave*reach*.72),i*.16,0,Math.PI*2);ctx.stroke();
    }
    // Ejected luminous debris travels across the viewport, rather than stopping at the logo.
    if(blast>0){for(let i=0;i<28;i++){const angle=i*Math.PI*2/28+.05,radius=60+blast*reach*(.55+(i%5)*.11);ctx.globalAlpha=impact*(.45+(i%3)*.1);ctx.fillStyle=i%2?palette.warm:palette.accent;const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*.7;ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.7,0,Math.PI*2);ctx.fill();}}
   }
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  function tick(now){if(stopped)return;if(document.hidden){stop();return;}render((now-started)/duration);if(now-started<duration)frame=requestAnimationFrame(tick);else stop();}
  function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);themeObserver.disconnect();window.removeEventListener('resize',size);document.removeEventListener('visibilitychange',hide);}
  const hide=()=>{if(document.hidden)stop();};
  size();render(0);window.addEventListener('resize',size);document.addEventListener('visibilitychange',hide);frame=requestAnimationFrame(tick);
  return {stop,release(){stop();canvas.width=canvas.height=1;canvas.remove();for(const image of sprites.values())image.width=image.height=1;sprites.clear();}};
 }
 window.OrbitStartupCosmos={play};
})();
