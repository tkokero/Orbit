/* One notice per released version, displayed only after the startup cover leaves. */
(()=>{
 let ready=false,update=null,notice=null,revision=0,dismissed='';
 try{dismissed=localStorage.getItem('orbit-dismissed-update')||'';}catch{}
 function hide(){notice?.remove();notice=null;}
 function dismiss(){dismissed=update?.latest||'';try{if(!update?.debugPreview)localStorage.setItem('orbit-dismissed-update',dismissed);}catch{}hide();}
 function paint(){const show=ready&&!document.hidden&&update?.supported&&update.latest&&update.latest!==update.version&&update.latest!==dismissed&&['available','downloading','ready','error'].includes(update.phase);if(!show){hide();return;}
  if(!notice){notice=document.createElement('aside');notice.className='startup-update-notice';notice.setAttribute('aria-label','Orbit update available');notice.innerHTML='<div class="startup-update-copy" role="status" aria-live="polite"><strong data-update-title></strong><p data-update-message></p></div><button class="icon-button" data-update-dismiss aria-label="Dismiss update notice">×</button><div class="settings-actions"><button class="primary-button" data-update-view>View update</button><button class="subtle-button" data-update-later>Restart later</button></div>';document.body.append(notice);notice.querySelector('[data-update-dismiss]').onclick=dismiss;notice.querySelector('[data-update-view]').onclick=()=>attempt(async()=>{state.settings=await window.orbit.getSettings();showSettings();document.querySelector('#panel-general #update-version')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});notice.querySelector('[data-update-later]').onclick=()=>attempt(async()=>{const result=await window.orbit.postponeUpdate(60);receive(result);dismiss();});}
  notice.querySelector('[data-update-title]').textContent='Orbit '+update.latest+' is available';notice.querySelector('[data-update-message]').textContent=update.phase==='downloading'?'Downloading in the background · '+Math.max(0,Math.min(100,Math.round(update.percent||0)))+'%':update.message||'A newer version of Orbit is available.';notice.querySelector('[data-update-later]').hidden=!update.downloaded||update.phase==='restarting';
 }
 function receive(value){revision++;update=value;paint();}
 window.orbitDebug?.onPreview(async kind=>{if(kind==='update'){dismissed='';receive({supported:true,version:'dev',latest:'Developer preview',phase:'available',downloaded:false,debugPreview:true,message:'Developer preview only. No update will be downloaded or installed.'});}else{try{receive(await window.orbit.updateStatus());}catch{hide();}}});
 window.orbit.onUpdateStatus?.(receive);document.addEventListener('visibilitychange',paint);
 (async()=>{await (window.orbitBoot?.done||Promise.resolve());ready=true;paint();const own=revision;try{const value=await window.orbit.updateStatus?.();if(value&&own===revision)receive(value);}catch{}})();
})();
