/* Local Easter eggs. Never read passwords, chats, or arbitrary editable fields. */
(()=>{
 const sequence=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
 const phrases={'kokeroisgoatkero':'goatkero','super duper dark':'void','orbitmagnetar':'magnetar','orbitpulsar':'pulsar','orbitattractor':'attractor'},maxLength=Math.max(...Object.keys(phrases).map(p=>p.length));
 let index=0,last=0,typed='',lastTyped=0;
 const blocked=e=>e.isComposing||e.repeat||e.ctrlKey||e.altKey||e.metaKey||document.body.classList.contains('booting');
 function goat(){
  typed='';index=0;
  try{localStorage.setItem('orbit-startup-style','goatkero');OrbitStartup.unlock('goatkero');toast('Goatkero unlocked.');window.orbitStartupSettings?.preview('goatkero');}catch{toast('Could not open the startup preview.',true);}
 }
 const controller=()=>Boolean(document.documentElement?.classList.contains('couch-mode'));
 function allowed(id){return ['magnetar','pulsar','attractor'].includes(id)?controller()&&!window.OrbitControllerEntry?.active:id==='void'?!controller():true;}
 function reveal(id){
  typed='';index=0;
  if(id==='goatkero')return goat();
  try{if(id==='void'){OrbitStartup.unlock(id);toast('Void unlocked.');window.orbitStartupSettings?.preview(id);}else{const entry=window.OrbitControllerEntry;if(!entry)return;entry.unlock(id);toast(entry.scenes.find(s=>s.id===id).name+' unlocked.');entry.play(id);}}catch{toast('Could not open the startup preview.',true);}
 }
 window.addEventListener('input',e=>{
  const input=e.target;if(e.isComposing||document.body.classList.contains('booting')||!input.matches?.('input[type=search],input#search'))return;
  const id=phrases[input.value.toLowerCase()];if(!id||!allowed(id))return;
  input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));reveal(id);
 });
 window.addEventListener('keydown',e=>{
  if(blocked(e))return;
  if(e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable=false])')){typed='';index=0;return;}
  const now=performance.now(),key=e.key.length===1?e.key.toLowerCase():e.key;
  if(now-lastTyped>4000)typed='';lastTyped=now;
  if(/^[a-z ]$/.test(key))typed=(typed+key).slice(-maxLength);else if(key==='Backspace')typed=typed.slice(0,-1);else typed='';
  if(key===' '&&!controller()&&'super duper dark'.startsWith(typed))e.preventDefault();
  const match=Object.keys(phrases).find(phrase=>typed.endsWith(phrase)&&allowed(phrases[phrase]));
  if(match){e.preventDefault();reveal(phrases[match]);return;}
  if(now-last>4000)index=0;last=now;
  index=key===sequence[index]?index+1:key===sequence[0]?1:0;
  if(index===sequence.length){index=0;e.preventDefault();try{for(const id of ['singularity','supernova','bigbang'])OrbitStartup.unlock(id);toast('Cosmic secrets unlocked.');window.orbitStartupSettings?.preview('bigbang');}catch{toast('Could not open the startup preview.',true);}}
 });
})();
