/* Shared clip commands. Only an explicit confirmation can request file removal. */
(()=>{
 const pending=new Set(),item=(id,label,run,enabled=true)=>({id,label,run,enabled});
 const title=clip=>clip.gameTitle||clip.source||'Recording';
 function release(name){const videos=[...document.querySelectorAll('video[data-recording-name]')].filter(v=>v.dataset.recordingName===name);return videos.map(video=>{const state={video,src:video.getAttribute('src'),time:video.currentTime,playing:!video.paused};video.pause();video.removeAttribute('src');video.load();return state;});}
 function restore(rows){for(const {video,src,time,playing}of rows)if(src&&video.isConnected){video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(time))video.currentTime=Math.min(time,video.duration||time);if(playing)void video.play().catch(()=>{});},{once:true});video.src=src;video.load();}}
 async function remove(clip){
  if(!clip?.name||pending.has(clip.name))return false;
  const dialog=document.createElement('dialog');dialog.className='installation-dialog clip-delete-dialog';dialog.setAttribute('aria-labelledby','clip-delete-title');dialog.innerHTML='<div class="modal-header"><h2 id="clip-delete-title">Delete clip?</h2></div><div class="installation-body"><strong>'+esc(title(clip))+'</strong><p>Move this recording and its details to the Recycle Bin? You can restore them from Windows.</p><p role="alert" data-clip-delete-error hidden></p></div><div class="installation-footer"><button type="button" class="subtle-button" data-clip-delete-cancel>Cancel</button><button type="button" class="primary-button" data-clip-delete-confirm>Delete clip</button></div>';
  const origin=document.activeElement;let working=false,settled=false;
  return new Promise(resolve=>{
   const finish=value=>{if(settled||working)return;settled=true;dismissDialog(dialog,()=>{dialog.remove();if(value)window.dispatchEvent(new CustomEvent('orbit:clip-deleted',{detail:{name:clip.name}}));else if(origin?.isConnected)origin.focus({preventScroll:true});resolve(value);});};
   dialog.querySelector('[data-clip-delete-cancel]').onclick=()=>finish(false);
   dialog.querySelector('[data-clip-delete-confirm]').onclick=async()=>{if(working)return;working=true;pending.add(clip.name);let released=[];const confirm=dialog.querySelector('[data-clip-delete-confirm]'),cancel=dialog.querySelector('[data-clip-delete-cancel]'),error=dialog.querySelector('[data-clip-delete-error]');confirm.disabled=cancel.disabled=true;confirm.textContent='Deleting…';error.hidden=true;
    try{released=release(clip.name);const result=await orbit.deleteClip({name:clip.name,confirmed:true});pending.delete(clip.name);if(result.warning)toast(result.warning,true);working=false;finish(true);}
    catch(e){pending.delete(clip.name);restore(released);working=false;confirm.disabled=cancel.disabled=false;confirm.textContent='Delete clip';error.textContent=e.message;error.hidden=false;cancel.focus({preventScroll:true});}
   };
   dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});bindDialogDismiss(dialog,()=>finish(false));document.body.append(dialog);dialog.showModal();OrbitFX.open(dialog);dialog.querySelector('[data-clip-delete-cancel]').focus({preventScroll:true});
  });
 }
 function menu(clip,{play,video}={}){if(!clip)return null;return {label:title(clip),items:[...(video?[item(video.paused?'clip-play':'clip-pause',video.paused?'Play':'Pause',()=>video.paused?video.play():video.pause()),item('clip-mute',video.muted?'Unmute':'Mute',()=>{video.muted=!video.muted;})]:[item('clip-play','Play clip',play)]),item('clip-file','Show file',()=>orbit.revealClip(clip.name)),item('clip-copy-title','Copy clip title',()=>orbit.copyText(title(clip))),{type:'separator'},{...item('clip-delete','Delete clip…',()=>remove(clip)),danger:true}]};}
 window.OrbitClipActions={remove,menu,pending:name=>pending.has(name)};
})();
