/* Renderer menus use the same theme and controls as Orbit, without activating native windows. */
(()=>{
 let active=null;
 const symbol=item=>{const value=(item.id||item.label||'').toLowerCase();return /profile|friend|connect/.test(value)?'connection':/copy/.test(value)?'file':/preview/.test(value)?'play':/undo|back/.test(value)?'back':/news|article|headline/.test(value)?'news':/folder|files|collection/.test(value)?'folder':/artwork/.test(value)?'appearance':/repair|detection|health/.test(value)?'repair':/shortcut/.test(value)?'desktop':/playtime|timer/.test(value)?'activity':/hide|hidden/.test(value)?'hide':/return/.test(value)?'play':/close|uninstall|cleanup/.test(value)?'remove':/copy|export/.test(value)?'file':'tune';};
 function open(items,point={},label='Library actions'){
  active?.();const previous=document.activeElement,menus=[];let resolve,finished=false;
  const owner=previous?.closest('dialog[open]')||[...document.querySelectorAll('dialog:modal')].at(-1)||document.body;
  const result=new Promise(r=>resolve=r);
  function removeFrom(index){for(const row of menus.splice(index)){row.parent?.setAttribute('aria-expanded','false');row.menu.remove();}}
  function close(command=null,restore=true){if(finished)return;finished=true;removeFrom(0);document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',keyboard,true);window.removeEventListener('resize',cancel);window.removeEventListener('blur',cancel);if(active===cancel)active=null;if(restore&&previous?.isConnected)previous.focus({preventScroll:true});resolve(command);}
  const cancel=()=>close(),outside=e=>{if(!menus.some(row=>row.menu.contains(e.target)))close(null,false);};active=cancel;
  function place(menu,x,y){const padding=10;menu.style.left=Math.max(padding,Math.min(innerWidth-menu.offsetWidth-padding,x))+'px';menu.style.top=Math.max(padding,Math.min(innerHeight-menu.offsetHeight-padding,y))+'px';}
  function draw(choices,x,y,depth=0,parent=null){
   removeFrom(depth);const menu=document.createElement('div');menu.className='orbit-context-menu';menu.setAttribute('popover','manual');menu.setAttribute('role','menu');menu.setAttribute('aria-label',depth?parent.textContent.trim():label);
   if(!depth){const heading=document.createElement('div');heading.className='orbit-context-heading';heading.textContent=label;menu.append(heading);}
   choices.forEach(item=>{
    if(item.type==='separator'){const line=document.createElement('hr');line.setAttribute('role','separator');menu.append(line);return;}
    const b=document.createElement('button');b.type='button';b.className='orbit-context-item';b.disabled=item.enabled===false;
    b.setAttribute('role',item.type==='checkbox'?'menuitemcheckbox':item.type==='radio'?'menuitemradio':'menuitem');if(['checkbox','radio'].includes(item.type))b.setAttribute('aria-checked',String(Boolean(item.checked)));
    const glyph=document.createElement('span');glyph.className='orbit-context-symbol';glyph.setAttribute('aria-hidden','true');glyph.innerHTML=window.OrbitControllerArt?.icon(item.checked?'check':symbol(item))||'';
    const text=document.createElement('span');text.className='orbit-context-label';text.textContent=item.label;b.append(glyph,text);
    if(item.submenu){b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-expanded','false');const arrow=document.createElement('span');arrow.className='orbit-context-arrow';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');b.append(arrow);}
    b.onclick=()=>{if(!item.submenu){close(item.command||{action:item.id});return;}const r=b.getBoundingClientRect();const sub=draw(item.submenu,r.right+7,r.top,depth+1,b);b.setAttribute('aria-expanded','true');if(sub.getBoundingClientRect().left<r.right){place(sub,r.left-sub.offsetWidth-7,r.top);}sub.querySelector('button:not(:disabled)')?.focus({preventScroll:true});};
    menu.append(b);
   });
   owner.append(menu);menus.push({menu,parent});menu.showPopover();place(menu,x,y);return menu;
  }
  function keyboard(e){const row=menus.find(r=>r.menu.contains(document.activeElement))||menus.at(-1);if(!row)return;const buttons=[...row.menu.querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();}else if(e.key==='ArrowRight'){const b=document.activeElement;if(b?.hasAttribute('aria-haspopup')){e.preventDefault();e.stopPropagation();b.click();}}else if(e.key==='ArrowLeft'&&row.parent){e.preventDefault();e.stopPropagation();const parent=row.parent;removeFrom(menus.indexOf(row));parent.focus({preventScroll:true});}else if(e.key==='Tab'){e.stopPropagation();close();}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}}
  const menu=draw(items,Number(point.x)||12,Number(point.y)||12);menu.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',keyboard,true);window.addEventListener('resize',cancel);window.addEventListener('blur',cancel);
  return result;
 }
 window.OrbitContextMenu={open,close:()=>active?.()};
})();
