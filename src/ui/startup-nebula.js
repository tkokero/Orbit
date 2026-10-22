/* Two cached gas/dust layers; only their drift and the stars are drawn per frame. */
(()=>{
 function play(root,style,duration){
  const canvas=document.createElement('canvas');canvas.className='startup-cosmos startup-nebula-field';canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.remove();return {stop(){},release(){}};}
  const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
  let seed=1907;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const lattice=Float32Array.from({length:4096},random),stars=Array.from({length:135},()=>({x:random(),y:random(),r:.45+random()*1.2,phase:random()*6.28}));
  const layers=[document.createElement('canvas'),document.createElement('canvas')];
  let width=1,height=1,frame=0,stopped=false,key='',light=false,palette,started;
  const at=(a,b)=>lattice[((b&63)<<6)+(a&63)];
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),sx=smooth(x-ix),sy=smooth(y-iy),a=at(ix,iy),b=at(ix+1,iy),c=at(ix,iy+1),d=at(ix+1,iy+1);return (a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy;}
  function fbm(x,y){let value=0,weight=.52;for(let i=0;i<5;i++){value+=noise(x,y)*weight;x=x*2.03+17;y=y*2.03+9;weight*=.48;}return value;}
  function color(value){const painter=layers[0].getContext('2d');painter.clearRect(0,0,1,1);painter.fillStyle=value;painter.fillRect(0,0,1,1);return painter.getImageData(0,0,1,1).data.slice(0,3);}
  function paint(){
   const theme=getComputedStyle(root),next=['--accent','--cool','--warm','--bg'].map(name=>theme.getPropertyValue(name).trim()),nextKey=next.join('|')+theme.colorScheme;if(nextKey===key)return;key=nextKey;light=theme.colorScheme==='light';
   for(const layer of layers){layer.width=384;layer.height=240;}
   palette=next.map(color);const gas=layers[0].getContext('2d').createImageData(384,240),dust=layers[1].getContext('2d').createImageData(384,240);
   // Domain-warped wisps and a dark, ragged dust lane echo star-forming nebulae.
   for(let y=0;y<240;y++)for(let x=0;x<384;x++){
    const u=x/384,v=y/240,warp=noise(u*4+3,v*4+9),n=fbm(u*7+warp*2,v*5+warp),ridge=fbm(u*11+18,v*8+6),axis=v-.52+Math.sin(u*5)*.17+(u-.5)*.35;
    const envelope=Math.exp(-axis*axis*13)*smooth(u*8)*smooth((1-u)*8)*smooth(v*9)*smooth((1-v)*9),density=Math.max(0,n-.22)*2.1*envelope;
    const mix=smooth((n-.28)*2.6),warm=smooth((ridge-.48)*4)*.65,offset=(y*384+x)*4,lane=axis+.055*Math.sin(u*17+warp*4),shadow=smooth((.075+ridge*.12-Math.abs(lane))/.08)*envelope;
    for(let c=0;c<3;c++){const base=palette[1][c]*(1-mix)+palette[0][c]*mix;gas.data[offset+c]=base*(1-warm)+palette[2][c]*warm;dust.data[offset+c]=palette[3][c]*.6+palette[0][c]*.04;}
    gas.data[offset+3]=Math.min(255,density*(light?170:245));dust.data[offset+3]=shadow*(light?100:210);
   }
   layers[0].getContext('2d').putImageData(gas,0,0);layers[1].getContext('2d').putImageData(dust,0,0);
  }
  function size(){width=Math.max(1,root.clientWidth);height=Math.max(1,root.clientHeight);const scale=Math.min(1,Math.sqrt(680000/(width*height)));canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);ctx.setTransform(scale,0,0,scale,0,0);}
  function render(p){
   const appear=smooth(p/.24),settle=smooth((p-.62)/.38),drift=smooth(p),w=width*1.36,h=height*1.38;
   ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=appear*(1-settle*.2);ctx.drawImage(layers[0],(width-w)/2+width*(.035-drift*.07),(height-h)/2+height*(drift*.045),w,h);
   ctx.globalAlpha=appear*.9;ctx.drawImage(layers[1],(width-w)/2-width*.02+drift*width*.055,(height-h)/2+height*.025-drift*height*.04,w,h);
   ctx.fillStyle=light?'#344360':'#eff6ff';
   for(const star of stars){ctx.globalAlpha=appear*(.28+Math.sin(star.phase+p*2)*.12)*(1-settle*.22);const x=star.x*width+(drift-.5)*star.r*8,y=star.y*height;ctx.fillRect(x,y,star.r,star.r);}
   // A few young stars catch the light as the clouds part. No flashing or strobing.
   for(let i=0;i<7;i++){const star=stars[i*17],x=star.x*width,y=star.y*height,shine=Math.sin(smooth((p-i*.025)/.8)*Math.PI);ctx.globalAlpha=appear*(.18+shine*.6);ctx.strokeStyle=i%2?'#eaf8ff':'#ffe9d1';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-4-shine*3,y);ctx.lineTo(x+4+shine*3,y);ctx.moveTo(x,y-6-shine*4);ctx.lineTo(x,y+6+shine*4);ctx.stroke();}
   ctx.globalAlpha=1;
  }
  function tick(now){if(stopped)return;if(document.hidden){stop();return;}const p=Math.min(1,(now-started)/duration);render(p);if(p<1)frame=requestAnimationFrame(tick);else stop();}
  function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',size);document.removeEventListener('visibilitychange',hide);}
  const hide=()=>{if(document.hidden)stop();},observer=new MutationObserver(paint);observer.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  paint();size();started=performance.now();render(0);window.addEventListener('resize',size);document.addEventListener('visibilitychange',hide);frame=requestAnimationFrame(tick);
  return {stop,release(){stop();canvas.remove();canvas.width=canvas.height=1;for(const layer of layers)layer.width=layer.height=1;}};
 }
 window.OrbitStartupNebula={play};
})();
