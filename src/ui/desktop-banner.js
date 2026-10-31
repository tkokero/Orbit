/* Desktop library banner preference. Artwork and game actions stay shared. */
(()=>{
 const key='orbit-desktop-banner',root=document.documentElement;
 let layout='split';
 try{if(localStorage.getItem(key)==='overlay')layout='overlay';}catch{}
 function paint(){
  root.dataset.desktopBanner=layout;
  document.querySelectorAll('[data-banner-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.bannerLayout===layout)));
 }
 function set(value){
  if(!['overlay','split'].includes(value))return;
  layout=value;paint();
  try{localStorage.setItem(key,layout);}catch{window.toast?.('Banner layout could not be saved.',true);}
 }
 function mount(){
  const panel=document.querySelector('#panel-appearance');if(!panel||panel.querySelector('.desktop-banner-setting'))return;
  const card=document.createElement('section');card.className='setting-card desktop-banner-setting';
  const art='<svg viewBox="0 0 300 112" preserveAspectRatio="xMidYMid slice"><rect width="300" height="112" fill="var(--raised)"/><path d="M0 90 70 35l55 55 74-75 101 97H0Z" fill="var(--secondary)" opacity=".35"/><circle cx="224" cy="45" r="30" fill="var(--accent)"/><ellipse cx="224" cy="45" rx="53" ry="9" transform="rotate(-24 224 45)" stroke="var(--text)" stroke-width="3" fill="none" opacity=".7"/><circle cx="118" cy="21" r="2" fill="var(--text)"/></svg>';
  const preview=mode=>'<span class="banner-layout-preview preview-'+mode+'" aria-hidden="true"><span class="banner-sample-art">'+art+'</span><span class="banner-sample-copy"><strong>Game title</strong><span class="banner-sample-actions"><span class="banner-sample-play">Play</span><span class="banner-sample-details">Details</span></span></span></span>';
  card.innerHTML='<h3>Desktop banner</h3><div class="banner-layout-options" role="group" aria-label="Desktop banner layout">'+[['overlay','Overlay','Controls over artwork'],['split','Split','Artwork beside controls']].map(([mode,name,note])=>'<button type="button" data-banner-layout="'+mode+'" aria-pressed="false">'+preview(mode)+'<span class="banner-layout-caption"><strong>'+name+'</strong><small>'+note+'</small></span></button>').join('')+'</div>';
  const hero=document.querySelector('#hero'),source=hero?.querySelector('#hero-image[src]')?.getAttribute('src');if(source&&!['portrait','square'].includes(hero.dataset.artShape))for(const node of card.querySelectorAll('.banner-sample-art')){const image=document.createElement('img');image.alt='';image.src=source;image.onerror=()=>image.remove();node.append(image);}
  card.querySelectorAll('[data-banner-layout]').forEach(button=>button.onclick=()=>set(button.dataset.bannerLayout));
  panel.prepend(card);paint();
 }
 const previous=showSettings;showSettings=function(...args){const result=previous.apply(this,args);mount();return result;};
 window.OrbitDesktopBanner={set,get layout(){return layout;}};paint();
})();
