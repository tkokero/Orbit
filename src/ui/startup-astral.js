/* Original finite canvas scenes. One bounded surface; no image downloads or particle DOM. */
(()=>{
 const durations={magnetar:4400,pulsar:4400,attractor:4800,void:4200};
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>1-(1-clamp(n))**3;
 function render(canvas,style,{reduced=false,duration=durations[style],controller=false}={}){
  if(!durations[style])return null;
  duration=Number.isFinite(duration)?Math.max(500,Math.min(8000,duration)):durations[style];
  const width=Math.max(1,Math.min(1000,innerWidth)),height=Math.max(1,Math.min(1000,Math.round(width*innerHeight/Math.max(1,innerWidth))));
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
  const vars=getComputedStyle(document.documentElement),color=(key,fallback)=>{const value=vars.getPropertyValue(key).trim();return /^#[a-f\d]{6}$/i.test(value)?value:fallback;};
  const accent=color('--accent','#8cc5ff'),cool=color('--cool','#b6b2f2'),warm=color('--warm','#edc48c');
  const stars=Array.from({length:96},(_,i)=>({a:i*2.399963,r:.2+((i*37)%79)/100,size:.6+i%3*.4}));
  const cx=width/2,cy=height*(controller?.43:.47),unit=Math.min(width,height),start=performance.now();
  let frame=0,stopped=false,frames=0,total=0;
  function line(points,color,alpha=1,lineWidth=1){ctx.globalAlpha=clamp(alpha);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function ellipse(rx,ry,rotation,color,alpha,lineWidth=1){ctx.globalAlpha=clamp(alpha);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,rotation,0,Math.PI*2);ctx.stroke();}
  function draw(progress){
   const began=performance.now(),p=clamp(progress),intro=ease(p/.23),resolve=ease((p-.67)/.27),motion=1-resolve;
   ctx.globalAlpha=1;ctx.fillStyle='#030408';ctx.fillRect(0,0,width,height);
   for(let i=0;i<stars.length;i++){
    const star=stars[i],pull=style==='void'?1-.88*ease(p/.7):style==='attractor'?1-.55*ease(p/.7):1;
    const angle=star.a+(style==='attractor'?p*1.7:style==='void'?p*.35:p*.08),r=unit*star.r*.67*pull;
    ctx.globalAlpha=(style==='void'?.22:.45)*intro*(1-resolve*.65);ctx.fillStyle=i%7?cool:warm;
    ctx.beginPath();ctx.arc(cx+Math.cos(angle)*r*1.35,cy+Math.sin(angle)*r,star.size,0,Math.PI*2);ctx.fill();
   }
   if(style==='magnetar'){
    // Twisted magnetic loops settle into a single, tilted orbit.
    for(let i=0;i<7;i++){
     const points=[],tilt=i*Math.PI/7+p*.45*motion;
     for(let j=0;j<=64;j++){const a=j*Math.PI/32,r=unit*(.12+.12*Math.sin(a)**2)*intro,localX=Math.cos(a)*r,localY=Math.sin(a)*r*.5;points.push([cx+localX*Math.cos(tilt)-localY*Math.sin(tilt),cy+localX*Math.sin(tilt)+localY*Math.cos(tilt)]);}
     line(points,i%2?cool:accent,.55*motion*intro,1.3);
    }
    ellipse(unit*.065*intro,unit*.065*intro,0,warm,.8*motion,2);
   }else if(style==='pulsar'){
    // Two broad, softly lit beams sweep steadily, without flashing.
    const a=p*Math.PI*1.5-.8;
    for(const side of [0,Math.PI]){const points=[[cx,cy]];for(let j=0;j<=12;j++){const angle=a+side-.13+j*.026;points.push([cx+Math.cos(angle)*unit*.38*intro,cy+Math.sin(angle)*unit*.38*intro]);}points.push([cx,cy]);ctx.globalAlpha=.12*intro*motion;ctx.fillStyle=accent;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.fill();line([[cx,cy],[cx+Math.cos(a+side)*unit*.38*intro,cy+Math.sin(a+side)*unit*.38*intro]],cool,.5*motion,1.6);}
    for(let i=0;i<3;i++)ellipse(unit*(.07+i*.045)*intro,unit*(.07+i*.045)*intro,0,accent,(.5-i*.12)*motion);
   }else if(style==='attractor'){
    for(let i=0;i<24;i++){
     const points=[];for(let j=0;j<=32;j++){const u=j/32,r=unit*(.025+.48*u)*intro,a=i*Math.PI/12+(1-u)**2*2.8+p*.65*motion;points.push([cx+Math.cos(a)*r*1.25,cy+Math.sin(a)*r*.68]);}
     line(points,i%3?accent:warm,.3*intro*motion,1+i%3*.3);
    }
    ellipse(unit*.065*intro,unit*.024*intro,-.3,cool,.75*motion,2);
   }else{
    // Void stays almost black: a thin event horizon, then the familiar mark.
    ellipse(unit*(.18-.11*ease(p/.7))*intro,unit*(.18-.11*ease(p/.7))*intro,0,cool,.25*motion,1);
    ellipse(unit*.078*intro,unit*.025*intro,-.42,accent,.3*intro*motion);
   }
   const core=unit*(.012*motion+.064*resolve)*intro;
   ctx.globalAlpha=style==='void'?resolve:Math.max(.6*intro*motion,resolve);ctx.fillStyle=style==='void'?'#030408':accent;ctx.beginPath();ctx.arc(cx,cy,Math.max(.1,core),0,Math.PI*2);ctx.fill();
   if(style==='void'&&resolve>0)ellipse(core,core,0,accent,resolve*.75,1.4);
   if(resolve>0){ellipse(unit*.107,unit*.034,-.42,cool,resolve,Math.max(1.8,unit*.004));ctx.globalAlpha=resolve;ctx.fillStyle=warm;ctx.beginPath();ctx.arc(cx+unit*.045,cy-unit*.076,unit*.009,0,Math.PI*2);ctx.fill();}
   if(!controller&&resolve>0){ctx.globalAlpha=resolve*.9;ctx.fillStyle='#e9edf5';ctx.font='600 '+Math.max(22,unit*.04)+'px "Nunito", "Trebuchet MS", sans-serif';ctx.textAlign='center';ctx.fillText('Orbit',cx,cy+unit*.19);}
   ctx.globalAlpha=1;frames++;total+=performance.now()-began;
  }
  const hide=()=>{if(document.hidden)stop();};
  function stop(){stopped=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hide);}
  function tick(now){if(stopped)return;const p=(now-start)/duration;draw(p);if(p<1)frame=requestAnimationFrame(tick);else stop();}
  draw(reduced?1:0);if(!reduced&&!document.hidden){frame=requestAnimationFrame(tick);document.addEventListener('visibilitychange',hide);}
  return {stop,release:stop,metrics:()=>({scene:style,frames,canvasWidth:width,canvasHeight:height,drawMeanMs:total/Math.max(1,frames)})};
 }
 function play(root,{style='void',reduced=false,duration=durations[style]}={}){
  root.querySelector('.startup-astral')?.remove();const canvas=document.createElement('canvas');canvas.className='startup-astral';canvas.setAttribute('aria-hidden','true');root.append(canvas);
  const scene=render(canvas,style,{reduced,duration});let released=false;
  return {stop:()=>scene?.stop(),release(){if(released)return;released=true;scene?.release();canvas.remove();}};
 }
 window.OrbitStartupAstral={render,play,durations};
})();
