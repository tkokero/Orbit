(()=>{
 const api=window.orbitWatch,$=s=>document.querySelector(s);let data={},hover=null;
 const text=(selector,value)=>{const n=$(selector);if(n.textContent!==String(value))n.textContent=String(value);};
 function clock(){const t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});text('#clock',t);text('#toolbar-clock',t);}
 function update(next){
  data=next;document.body.classList.toggle('toolbar-mode',next.watch?.style!=='watch');document.body.classList.toggle('has-panels',!!next.panels?.length);
  const c=next.theme||{};for(const k of ['background','surface','text','muted','accent'])if(/^#[a-f\d]{6}$/i.test(c[k]))document.documentElement.style.setProperty('--'+(k==='background'?'bg':k),c[k]);
  if(/^#[a-f\d]{6}$/i.test(c.accent)){const rgb=c.accent.slice(1).match(/../g).map(v=>parseInt(v,16)),light=rgb.reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);document.documentElement.style.setProperty('--ink',light>145?'#10141b':'#fff');}
  const s=next.telemetry?.stats||{},fps=s.appFps==null?'—':Math.round(s.appFps),gpu=s.gpuMs==null?'—':s.gpuMs.toFixed(1);
  text('#fps',fps);text('#toolbar-fps',fps);text('#gpu',gpu);text('#toolbar-gpu',gpu);text('#toolbar-pointer',next.interaction?'Done':'Interact');
  const hand=next.telemetry?.devices?.find(d=>d.role===(next.watch?.anchor==='wrist-right'?'RightHand':'LeftHand')),battery=hand?.battery==null?'—':hand.battery+'%';text('#battery',battery);text('#toolbar-battery',battery);
  $('#panels').setAttribute('aria-pressed',String(next.capturesVisible!==false));text('#toolbar-visibility',next.capturesVisible===false?'Show panels':'Hide panels');
  for(const selector of ['#pointer','#toolbar-pointer'])$(selector).setAttribute('aria-pressed',String(!!next.interaction));
  text('#hint','');text('#toolbar-hint','');
  const rail=$('#toolbar-panels'),ids=new Set((next.panels||[]).map(p=>String(p.id)));
  rail.querySelectorAll('[data-panel]').forEach(b=>{if(!ids.has(b.dataset.panel))b.remove();});rail.querySelector('.no-panels')?.remove();
  for(const p of next.panels||[]){let b=rail.querySelector('[data-panel="'+p.id+'"]');if(!b){b=document.createElement('button');b.dataset.panel=p.id;const img=document.createElement('img');img.alt='';const title=document.createElement('span');b.append(img,title);b.onclick=()=>tool({type:'panel-focus',panelId:data.focusedPanel===p.id?0:p.id});rail.append(b);}b.setAttribute('aria-pressed',String(next.focusedPanel===p.id));b.title=p.name;b.querySelector('span').textContent=p.name;const img=b.querySelector('img');if(p.preview&&/^data:image\/(jpeg|png);base64,/.test(p.preview)&&img.getAttribute('src')!==p.preview)img.src=p.preview;}
  const active=next.panels?.find(p=>p.id===(next.selectedPanel||next.focusedPanel))||next.panels?.[0];
  for(const id of ['smaller','larger','recenter','keyboard','hide','close'])$('#quick-'+id).disabled=!active||(id==='keyboard'&&!active.control);
  text('#quick-hide',active?.visible===false?'Show screen':'Hide screen');
  clock();
 }
 async function tool(input){try{update(await api.tool(input));}catch(e){text('#hint',e.message);text('#toolbar-hint',e.message);}}
 document.querySelectorAll('[data-action]').forEach(b=>{b.onclick=()=>tool({type:'media',action:b.dataset.action});if(!b.querySelector('svg')){const svg=document.querySelector('.media [data-action="'+b.dataset.action+'"] svg');if(svg)b.replaceChildren(svg.cloneNode(true));}});
 for(const id of ['panels','toolbar-visibility'])$('#'+id).onclick=()=>tool({type:'panels-visible',enabled:data.capturesVisible===false});
 for(const id of ['dashboard','toolbar-orbit'])$('#'+id).onclick=()=>tool({type:'dashboard'});$('#toolbar-add').onclick=()=>tool({type:'dashboard',section:'panels',sources:true});
 for(const id of ['pointer','toolbar-pointer'])$('#'+id).onclick=()=>tool({type:'interaction',enabled:!data.interaction});
 const selected=()=>data.panels?.find(p=>p.id===(data.selectedPanel||data.focusedPanel))||data.panels?.[0];
 $('#toolbar-more').onclick=()=>{const open=document.body.classList.toggle('tools-open');$('#toolbar-more').setAttribute('aria-expanded',String(open));};
 $('#quick-performance').onclick=()=>tool({type:'dashboard',section:'performance'});$('#quick-sources').onclick=()=>tool({type:'dashboard',section:'tools'});
 for(const [id,delta]of [['smaller',-.1],['larger',.1]])$('#quick-'+id).onclick=()=>{const p=selected();if(p)tool({type:'placement',panelId:p.id,width:(p.width||1.1)+delta});};
 $('#quick-recenter').onclick=()=>{const p=selected();if(p)tool({type:'placement',panelId:p.id,recenter:true});};
 $('#quick-keyboard').onclick=()=>{const p=selected();if(p)tool({type:'capture-type',panelId:p.id});};
 $('#quick-hide').onclick=()=>{const p=selected();if(p)tool({type:'panel-visible',panelId:p.id,visible:p.visible===false});};
 $('#quick-close').onclick=()=>{const p=selected();if(p)tool({type:'capture-close',panelId:p.id});};
 api.onError?.(message=>{text('#hint',message);text('#toolbar-hint',message);});api.onUpdate(update);api.onPointer(p=>{const b=document.elementFromPoint(p.x,p.y)?.closest('button');if(hover!==b){hover?.classList.remove('is-hover');hover=b;b?.classList.add('is-hover');}b?.classList.toggle('is-pressed',p.type==='down');if(p.type==='click'&&b&&!b.disabled)b.click();});
 const ready=api.data().then(update);setInterval(clock,30000);window.OrbitWatch={ready,snapshot:()=>({style:data.watch?.style,fps:$('#fps').textContent,gpu:$('#gpu').textContent,battery:$('#battery').textContent,controls:!!data.interaction,panels:(data.panels||[]).length})};
})();
