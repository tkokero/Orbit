/* One on-demand explanation; no observers, polling or background work. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.OrbitHelp=api;api.install(document,window);}})(globalThis,function(){
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
 let dismiss=()=>{};
 function markup(label,text){return '<button type="button" class="info-button" data-orbit-help="'+escape(text)+'" aria-label="About '+escape(label)+'" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>';}
 function install(document,window){
  let panel,active,escapeDialog,openTimer,closeTimer,focusFrame,pinned=false,returningFocus=false;
  const cancelTimers=()=>{clearTimeout(openTimer);clearTimeout(closeTimer);window.cancelAnimationFrame(focusFrame);};
  function reset(){if(active){active.setAttribute('aria-expanded','false');active.removeAttribute('aria-describedby');active=null;}}
  function close(){cancelTimers();pinned=false;try{if(panel?.matches(':popover-open'))panel.hidePopover();}catch{}reset();}
  dismiss=close;
  function show(button,pin=false){
   cancelTimers();if(!button.isConnected||button.disabled)return;
   if(active===button&&panel?.matches(':popover-open')){pinned=pinned||pin;return;}close();
   if(!panel?.isConnected){panel=document.createElement('div');panel.id='orbit-help';panel.className='info-popover';panel.setAttribute('popover','auto');panel.setAttribute('role','tooltip');panel.addEventListener('toggle',event=>{if(event.target===panel&&event.newState==='closed'&&!panel.matches(':popover-open')){clearTimeout(closeTimer);pinned=false;reset();}});panel.addEventListener('pointerenter',cancelTimers);panel.addEventListener('pointerleave',scheduleClose);}
   const parent=button.closest('dialog[open]')||document.body;if(panel.parentNode!==parent)parent.append(panel);
   panel.textContent=button.dataset.orbitHelp;panel.style.width=Math.min(320,window.innerWidth-24)+'px';
   panel.showPopover();active=button;pinned=pin;button.setAttribute('aria-expanded','true');button.setAttribute('aria-describedby',panel.id);
   const target=button.getBoundingClientRect(),box=panel.getBoundingClientRect(),left=Math.max(12,Math.min(window.innerWidth-box.width-12,target.left+target.width/2-box.width/2));
   panel.style.left=left+'px';panel.style.top=Math.max(12,Math.min(window.innerHeight-box.height-12,target.bottom+8+box.height>window.innerHeight-12?target.top-box.height-8:target.bottom+8))+'px';
  }
  function scheduleClose(){clearTimeout(openTimer);clearTimeout(closeTimer);if(!pinned)closeTimer=setTimeout(close,180);}
  document.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const button=event.target.closest?.('[data-orbit-help]');if(!button||button.contains(event.relatedTarget))return;cancelTimers();openTimer=setTimeout(()=>show(button),140);});
  document.addEventListener('pointerout',event=>{const button=event.target.closest?.('[data-orbit-help]');if(!button||button.contains(event.relatedTarget)||panel?.contains(event.relatedTarget))return;scheduleClose();});
  document.addEventListener('click',event=>{const button=event.target.closest?.('[data-orbit-help]');if(!button)return;event.preventDefault();event.stopPropagation();if(active===button&&pinned)close();else show(button,true);});
  document.addEventListener('focusin',event=>{const button=event.target.closest?.('[data-orbit-help]');if(button){if(!returningFocus){cancelTimers();focusFrame=window.requestAnimationFrame(()=>{if(document.activeElement===button)show(button);});}return;}if(!panel?.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;escapeDialog=null;if(panel?.matches(':popover-open')){const button=active;escapeDialog=panel.closest('dialog[open]');event.preventDefault();event.stopImmediatePropagation();close();returningFocus=true;button?.focus({preventScroll:true});returningFocus=false;}},true);
  document.addEventListener('cancel',event=>{if(event.target===escapeDialog){event.preventDefault();event.stopImmediatePropagation();escapeDialog=null;}},true);
  document.addEventListener('close',close,true);document.addEventListener('scroll',event=>{if(active&&!panel?.contains(event.target))close();},true);window.addEventListener('resize',close);
 }
 return {markup,install,close:()=>dismiss()};
});
