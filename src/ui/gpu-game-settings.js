/* Vendor presets use the installed app; they are never presented as per-setting data. */
(()=>{
 let dispose=null;
 function cancel(){dispose?.();dispose=null;}
 function nav(installed,active='game'){
  return '<nav class="graphics-source" aria-label="Graphics source"><button type="button" data-graphics-source="game"'+(active==='game'?' aria-current="page"':'')+'>Game settings</button>'+(installed.nvidia?'<button type="button" data-graphics-source="nvidia"'+(active==='nvidia'?' aria-current="page"':'')+'>NVIDIA App</button>':'')+(installed.amd?'<button type="button" data-graphics-source="amd"'+(active==='amd'?' aria-current="page"':'')+'>AMD Software</button>':'')+'<span class="graphics-experimental">Experimental</span></nav>';
 }
 function bind(root,game){for(const b of root.querySelectorAll('[data-graphics-source]'))b.onclick=()=>{if(b.getAttribute('aria-current'))return;attempt(()=>b.dataset.graphicsSource==='game'?OrbitGameOptimization.open(game):open(game,b.dataset.graphicsSource));};}
 function status(state){return ({UNOPTIMIZED:'Not optimized',OPTIMIZED:'Optimized',DISABLED:'Unavailable'})[state]||'Status unavailable';}
 async function open(game,provider='nvidia'){
  modal(game.title+' · '+(provider==='amd'?'AMD Software':'NVIDIA App'),'<div class="game-optimization" id="gpu-game-optimization" data-popup-loading="true"><p role="status">Connecting to '+(provider==='amd'?'AMD Software':'NVIDIA App')+'…</p></div>');
  const root=document.querySelector('#gpu-game-optimization');let plan=null,busy=false,revision=0,reviewing=false,slowTimer;
  dispose=()=>{revision++;clearTimeout(slowTimer);orbit.gpuSettingsCancel?.().catch(()=>{});};
  const installed=await orbit.gpuSettingsInstalled();if(!root.isConnected)return;
  root.innerHTML=nav(installed,provider)+'<div data-gpu-content></div><p data-gpu-error role="alert"></p><div class="optimization-footer"><button class="subtle-button" data-gpu-back>Game settings</button><span></span><button class="subtle-button" data-gpu-open>Open '+(provider==='amd'?'AMD Software':'NVIDIA App')+'</button><button class="primary-button" data-orbit-icon="check" data-gpu-review hidden disabled>Review preset</button><button class="primary-button" data-gpu-apply hidden disabled>Apply NVIDIA preset</button></div>';bind(root,game);
  const content=root.querySelector('[data-gpu-content]'),error=root.querySelector('[data-gpu-error]'),review=root.querySelector('[data-gpu-review]'),apply=root.querySelector('[data-gpu-apply]');
  function lock(value){busy=value;for(const b of root.querySelectorAll('button,select,input'))b.disabled=value;review.disabled=value||!plan;apply.disabled=value||!plan;}
  const back=root.querySelector('[data-gpu-back]');back.hidden=true;
  root.querySelector('[data-gpu-open]').onclick=()=>attempt(()=>orbit.gpuSettingsOpen(provider));back.onclick=()=>{if(busy||!reviewing)return;reviewing=false;root.classList.remove('gpu-reviewing');root.querySelector('[data-gpu-preset]').disabled=false;review.hidden=false;apply.hidden=true;back.hidden=true;root.querySelector('[data-gpu-preset]').focus();};
  if(provider==='amd'){
   content.innerHTML='<p>Per-game settings open in AMD Software.</p><p class="small-note">Gaming → Games → '+esc(game.title)+'</p>';delete root.dataset.popupLoading;return;
  }
  async function load(refresh=false){
   const request=++revision;plan=null;reviewing=false;back.hidden=true;review.hidden=true;apply.hidden=true;error.textContent='';content.innerHTML='<p role="status" data-gpu-loading>Checking NVIDIA App…</p><button type="button" class="subtle-button" data-gpu-stop>Stop checking</button>';
   clearTimeout(slowTimer);slowTimer=setTimeout(()=>{if(root.isConnected&&request===revision)root.querySelector('[data-gpu-loading]').textContent='NVIDIA’s first game scan can take up to 40 seconds.';},6000);
   root.querySelector('[data-gpu-stop]').onclick=()=>{revision++;clearTimeout(slowTimer);orbit.gpuSettingsCancel?.().catch(()=>{});content.innerHTML='<p>Check stopped. Your settings are unchanged.</p><button type="button" class="subtle-button" data-gpu-retry>Try again</button>';root.querySelector('[data-gpu-retry]').onclick=()=>load();delete root.dataset.popupLoading;};
   try{
    const data=await orbit.gpuSettingsGame({id:game.id,refresh:refresh===true});if(!root.isConnected||request!==revision)return;
    const app=data.nvidia;
    if(!app){content.innerHTML='<p>'+esc(data.note||'NVIDIA App is not installed.')+'</p><button class="subtle-button" data-gpu-retry>Check again</button>';root.querySelector('[data-gpu-retry]').onclick=()=>load(true);return;}
    content.innerHTML='<div class="gpu-status"><strong>NVIDIA preset</strong><span>'+esc(status(app.currentState))+'</span></div>'+(app.reason?'<p role="status">'+esc(app.reason)+'</p>':'<label class="gpu-preset-field"><select data-gpu-preset aria-label="NVIDIA preset">'+app.presets.map(p=>'<option value="'+esc(p)+'">'+esc(p==='Revert'?'Revert to NVIDIA defaults':p)+'</option>').join('')+'</select></label><details class="optimization-guidance"><summary>About NVIDIA presets</summary><p>NVIDIA manages the individual values. Open NVIDIA App for the full settings comparison.</p></details><div data-gpu-plan></div>');
    if(app.reason)return;const select=root.querySelector('[data-gpu-preset]'),preview=root.querySelector('[data-gpu-plan]');select.value=app.presets.includes(data.preferredPreset)?data.preferredPreset:app.presets.includes('Recommended')?'Recommended':app.presets[0];review.hidden=false;
    select.onchange=()=>{revision++;plan=null;error.textContent='';preview.replaceChildren();review.disabled=false;};
    review.disabled=false;review.onclick=async()=>{
     if(busy)return;const current=++revision;review.disabled=true;select.disabled=true;error.textContent='';preview.innerHTML='<p role="status">Checking this preset…</p>';
     try{
      plan=await orbit.gpuSettingsPreview({id:game.id,preset:select.value});if(!root.isConnected||current!==revision)return;
      reviewing=true;root.classList.add('gpu-reviewing');back.hidden=false;back.textContent='Edit preset';preview.innerHTML='<div class="gpu-review"><strong>'+esc(plan.preset==='Revert'?'Revert to NVIDIA defaults':plan.preset+' preset')+'</strong><p>'+esc(plan.notice)+'</p></div>';select.disabled=true;review.hidden=true;apply.hidden=false;apply.disabled=false;apply.focus({preventScroll:true});
     }catch(e){if(root.isConnected&&current===revision){plan=null;preview.replaceChildren();error.textContent=e.message;}}finally{if(root.isConnected&&current===revision){review.disabled=false;select.disabled=reviewing;}}
    };
    apply.onclick=async()=>{if(!plan||busy)return;lock(true);try{const result=await orbit.gpuSettingsApply({id:game.id,token:plan.token});if(!root.isConnected)return;plan=null;reviewing=false;back.hidden=true;content.innerHTML='<p role="status">'+esc(result.message)+'</p>'+(result.confirmed?'':'<p class="small-note">The change is not independently confirmed. Check NVIDIA App before retrying.</p>');review.hidden=true;apply.hidden=true;}catch(e){if(root.isConnected){plan=null;reviewing=false;back.hidden=true;error.textContent=e.message;review.hidden=true;apply.hidden=true;}}finally{if(root.isConnected)lock(false);}};
   }catch(e){if(root.isConnected&&request===revision){content.innerHTML='<button class="subtle-button" data-gpu-retry>Try again</button>';root.querySelector('[data-gpu-retry]').onclick=()=>load(true);error.textContent=e.message;}}finally{if(request===revision){clearTimeout(slowTimer);if(root.isConnected)delete root.dataset.popupLoading;}}
  }
  await load();
 }
 window.OrbitGpuSettings={nav,bind,open,cancel};
})();
