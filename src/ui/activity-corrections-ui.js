/* On-demand session actions. No polling, native windows or platform playtime changes. */
(()=>{
 const controllers=new WeakMap();
 const stamp=n=>new Date(n).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'});
 const precise=n=>{const value=Math.round(n),h=Math.floor(value/3600),m=Math.floor(value%3600/60),seconds=value%60;return [h?h+' h':'',m?m+' min':'',seconds?seconds+' s':''].filter(Boolean).join(' ')||'0 s';};
 const localValue=n=>{const d=new Date(n);return new Date(n-d.getTimezoneOffset()*60000).toISOString().slice(0,19);};
 const moreIcon='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>';
 function mount({root,sessions,data,refreshState,refresh}){
  const previous=controllers.get(root);previous?.abort.abort();
  const abort=new AbortController(),signal=abort.signal,byId=new Map(sessions.map(row=>[row.id,row]));
  const selected=new Set((refreshState?.selected??[...(previous?.selected||[])]).filter(id=>byId.has(id)&&!byId.get(id).running));
  const c={root,sessions,byId,abort,selected,selecting:Boolean(refreshState?.selecting??previous?.selecting),anchor:previous?.anchor||null,refresh,busy:false};controllers.set(root,c);
  const heading=root.querySelector('.activity-section-heading'),select=document.createElement('button');select.type='button';select.className='subtle-button';select.id='activity-select';select.textContent='Select';heading.append(select);
  const bar=document.createElement('div');bar.className='activity-selection';bar.setAttribute('role','group');bar.setAttribute('aria-label','Selected sessions');bar.innerHTML='<strong data-selected-count role="status"></strong><div class="settings-actions"><button type="button" class="subtle-button" data-session-merge data-orbit-icon="merge">Merge</button><button type="button" class="subtle-button" data-session-remove>Remove</button><button type="button" class="subtle-button" data-session-clear data-orbit-icon="close">Clear selection</button></div>';root.querySelector('.activity-timeline').insertBefore(bar,root.querySelector('.activity-list'));c.bar=bar;c.selectButton=select;
  if(data.undo){const undo=document.createElement('button');undo.type='button';undo.className='subtle-button';undo.id='activity-undo';undo.textContent=data.undo.label||'Undo session change';undo.title='Available until '+new Date(data.undo.expiresAt).toLocaleString();root.querySelector('.activity-topline .settings-actions').append(undo);undo.onclick=()=>attempt(async()=>{if(undo.disabled)return;undo.disabled=true;try{const view=capture(c);await window.orbit.undoHistory(data.undo.token);if(root.isConnected){await refresh({...view,selected:[],selecting:false});toast('Session change undone.');}}finally{if(undo.isConnected)undo.disabled=false;}});}
  select.onclick=()=>{c.selecting=!c.selecting;if(!c.selecting)selected.clear();decorate(root);};
  bar.querySelector('[data-session-merge]').onclick=()=>attempt(()=>review(c,'merge',chosen(c)));
  bar.querySelector('[data-session-remove]').onclick=()=>attempt(()=>review(c,'remove',chosen(c)));
  bar.querySelector('[data-session-clear]').onclick=()=>{selected.clear();decorate(root);};
  root.addEventListener('click',event=>{
   const article=event.target.closest('[data-session-id]');if(!article||!root.contains(article))return;
   if(event.target.closest('[data-session-more]')){const button=event.target.closest('[data-session-more]'),r=button.getBoundingClientRect();event.preventDefault();event.stopPropagation();attempt(()=>OrbitAppContext.open(button,{x:r.right,y:r.bottom}));return;}
   if(event.target.closest('[data-session-check]')||event.ctrlKey||event.metaKey||event.shiftKey||c.selecting&&!event.target.closest('button,a,input')){if(!event.target.closest('[data-session-check]'))event.preventDefault();event.stopPropagation();toggle(c,article.dataset.sessionId,event.shiftKey);}
  },{capture:true,signal});
  root.addEventListener('keydown',event=>{
   if(event.target.matches('input,textarea,select'))return;
   const article=event.target.closest('[data-session-id]');
   if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'&&(c.selecting||article)){event.preventDefault();event.stopPropagation();c.selecting=true;for(const row of sessions)if(!row.running)selected.add(row.id);decorate(root);}
   else if(event.key==='Escape'&&c.selecting){event.preventDefault();event.stopPropagation();c.selecting=false;selected.clear();decorate(root);select.focus({preventScroll:true});}
   else if((event.key===' '||event.key==='Enter')&&event.target===article){event.preventDefault();event.stopPropagation();toggle(c,article.dataset.sessionId,event.shiftKey);}
  },{signal});
  decorate(root);
 }
 function chosen(c){return c.sessions.filter(row=>c.selected.has(row.id));}
 function capture(c,focusSession){return {restore:true,scrollTop:document.querySelector('#modal-body').scrollTop,selected:[...c.selected],selecting:c.selecting,focusSession:focusSession||chosen(c)[0]?.id};}
 function toggle(c,id,range=false){const row=c.byId.get(id);if(!row||row.running)return;c.selecting=true;
  const visible=[...c.root.querySelectorAll('[data-session-id]')].map(node=>node.dataset.sessionId),a=visible.indexOf(c.anchor),b=visible.indexOf(id);
  if(range&&a>=0&&b>=0){for(const value of visible.slice(Math.min(a,b),Math.max(a,b)+1))if(!c.byId.get(value).running)c.selected.add(value);}
  else if(c.selected.has(id))c.selected.delete(id);else c.selected.add(id);
  c.anchor=id;decorate(c.root);
 }
 function decorate(root){const c=controllers.get(root);if(!c)return;
  for(const article of root.querySelectorAll('[data-session-id]')){
   const row=c.byId.get(article.dataset.sessionId);if(!row)continue;
   let check=article.querySelector('[data-session-check]');if(!check){check=document.createElement('input');check.type='checkbox';check.dataset.sessionCheck='';check.className='activity-session-check';article.prepend(check);}
   check.hidden=!c.selecting;check.checked=c.selected.has(row.id);check.disabled=row.running;check.setAttribute('aria-label',(row.running?'Session is still running':'Select '+row.title+' session'));
   article.classList.toggle('is-session-selected',c.selected.has(row.id));article.setAttribute('aria-label',row.title+' session'+(row.running?', playing now':''));
   if(!article.querySelector('[data-session-more]')){const more=document.createElement('button');more.type='button';more.className='icon-button activity-session-more';more.dataset.sessionMore='';more.setAttribute('aria-label','Session actions for '+row.title);more.innerHTML=moreIcon;article.append(more);}
   if(row.corrected&&!article.querySelector('[data-session-edited]')){const note=document.createElement('span');note.dataset.sessionEdited='';note.textContent=' · Edited';article.querySelector('.activity-session-copy small').append(note);}
  }
  c.selectButton.textContent=c.selecting?'Done':'Select';c.selectButton.setAttribute('aria-pressed',String(c.selecting));c.selectButton.disabled=!c.sessions.some(row=>!row.running);
  c.bar.hidden=!c.selected.size;c.bar.querySelector('[data-selected-count]').textContent=c.selected.size+' selected';
  const rows=chosen(c);c.bar.querySelector('[data-session-merge]').disabled=rows.length<2||new Set(rows.map(row=>row.gameId)).size!==1||rows.some(row=>row.running);
 }
 function menu(target){const article=target.closest('[data-session-id]'),root=article?.closest('#activity-body'),c=root&&controllers.get(root),row=c?.byId.get(article.dataset.sessionId);if(!row)return null;
  const rows=c.selected.has(row.id)?chosen(c):[row],one=rows.length===1,complete=rows.every(value=>!value.running);
  const item=(id,label,run,enabled=true)=>({id,label,run,enabled});
  return {label:one?row.title+' session':rows.length+' sessions',items:[item('session-edit','Edit times…',()=>review(c,'edit',rows),one&&complete),item('session-merge','Merge selected sessions…',()=>review(c,'merge',rows),rows.length>1&&complete&&new Set(rows.map(value=>value.gameId)).size===1),item('session-remove','Remove from history…',()=>review(c,'remove',rows),complete),{type:'separator'},item('session-select',c.selected.has(row.id)?'Deselect session':'Select session',()=>toggle(c,row.id),!row.running),item('session-game','View game details',()=>showDetails(row.gameId),state.games.some(game=>game.id===row.gameId))]};
 }
 function targets(rows){return rows.map(row=>({ids:row.sourceIds,revision:row.revision}));}
 function parseTime(value,original){const normalized=value.length===16?value+':00':value;if(normalized===localValue(original))return original;const n=new Date(value).getTime();if(!Number.isFinite(n)||localValue(n)!==normalized)throw Error('Choose a valid local date and time.');return n;}
 function editor(c,rows,view,values){const row=rows[0],start=values?.startedAt??row.startedAt,end=values?.endedAt??row.endedAt;
  modal('Edit session','<form id="activity-editor" class="activity-edit-form"><h3>'+esc(row.title)+'</h3><div class="activity-edit-fields"><label>Start<input type="datetime-local" id="session-start" required step="1" value="'+esc(localValue(start))+'"></label><label>End<input type="datetime-local" id="session-end" required step="1" value="'+esc(localValue(end))+'"></label></div><p class="small-note">Times use '+esc(Intl.DateTimeFormat().resolvedOptions().timeZone)+'. Changing times replaces this recording with the chosen duration. Platform playtime stays unchanged.</p><p class="activity-change-error" role="alert"></p><div class="desktop-tools-footer"><button type="button" class="subtle-button" data-session-cancel>Cancel</button><button type="submit" class="primary-button">Review change</button></div></form>');
  const form=document.querySelector('#activity-editor');form.querySelector('[data-session-cancel]').onclick=()=>attempt(()=>c.refresh(view));
  form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;try{const input={startedAt:parseTime(form.querySelector('#session-start').value,start),endedAt:parseTime(form.querySelector('#session-end').value,end)};await review(c,'edit',rows,input,view,form);}catch(error){if(form.isConnected)form.querySelector('[role=alert]').textContent=error.message;}finally{if(button.isConnected)button.disabled=false;}};
  form.querySelector('#session-start').focus({preventScroll:true});
 }
 async function review(c,action,rows,values,view,owner){
  view||=capture(c,rows[0]?.id);if(action==='edit'&&!values){editor(c,rows,view);return;}
  if(c.busy)return;c.busy=true;owner||=c.root;
  try{const result=await window.orbit.reviewHistory({action,targets:targets(rows),...values});if(!owner.isConnected)return;
   const heading=action==='edit'?'Review session times':action==='merge'?'Merge sessions':'Remove sessions';
   modal(heading,'<section class="activity-review" id="activity-review"><h3>'+esc(result.title)+'</h3><p>'+esc(action==='remove'?'Remove '+result.count+' selected session'+(result.count===1?'':'s')+' from Orbit history?':stamp(result.startedAt)+' – '+stamp(result.endedAt))+'</p><dl class="activity-change-summary"><div><dt>Recorded time</dt><dd>'+precise(result.secondsBefore)+' → '+precise(result.secondsAfter)+'</dd></div><div><dt>Recorded plays</dt><dd>'+result.timesPlayedBefore+' → '+result.timesPlayedAfter+'</dd></div>'+(result.showStreaks&&result.streaksBefore.current!==result.streaksAfter.current?'<div><dt>Current streak</dt><dd>'+result.streaksBefore.current+' → '+result.streaksAfter.current+' '+(result.streaksAfter.current===1?'day':'days')+'</dd></div>':'')+(result.showStreaks&&result.streaksBefore.best!==result.streaksAfter.best?'<div><dt>Best recorded</dt><dd>'+result.streaksBefore.best+' → '+result.streaksAfter.best+' '+(result.streaksAfter.best===1?'day':'days')+'</dd></div>':'')+'</dl><p class="small-note">'+(action==='merge'?'Gaps stay excluded from recorded time. The merged recordings count as one play. ':'')+'Only Orbit history changes. Game files and platform playtime stay unchanged. Undo is available for 7 days or until the next session change, including after restarting Orbit.</p><p class="activity-change-error" role="alert"></p><div class="desktop-tools-footer"><button type="button" class="subtle-button" data-session-cancel>Cancel</button>'+(action==='edit'?'<button type="button" class="subtle-button" data-session-back>Back</button>':'')+'<button type="button" class="primary-button" data-session-apply data-orbit-icon="check">'+(action==='remove'?'Remove sessions':action==='merge'?'Merge sessions':'Save times')+'</button></div></section>');
   const panel=document.querySelector('#activity-review');panel.querySelector('[data-session-cancel]').onclick=()=>attempt(()=>c.refresh(view));panel.querySelector('[data-session-back]')?.addEventListener('click',()=>editor(c,rows,view,values));
   panel.querySelector('[data-session-apply]').onclick=async()=>{const button=panel.querySelector('[data-session-apply]');if(button.disabled)return;button.disabled=true;try{await window.orbit.applyHistory(result.token);if(panel.isConnected){await c.refresh({...view,selected:[],selecting:false});toast(action==='edit'?'Session times saved.':action==='merge'?'Sessions merged.':'Sessions removed.');}}catch(error){if(panel.isConnected)panel.querySelector('[role=alert]').textContent=error.message;}finally{if(button.isConnected)button.disabled=false;}};
  }finally{c.busy=false;}
 }
 window.OrbitActivityCorrections={mount,decorate,menu};
})();
