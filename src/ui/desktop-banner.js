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
  card.innerHTML='<h3>Desktop banner</h3><div class="banner-layout-options" role="group" aria-label="Desktop banner layout"><button type="button" data-banner-layout="overlay" aria-pressed="false"><span class="banner-layout-preview preview-overlay" aria-hidden="true"><i></i><b></b></span><span>Overlay</span></button><button type="button" data-banner-layout="split" aria-pressed="false"><span class="banner-layout-preview preview-split" aria-hidden="true"><i></i><b></b></span><span>Split</span></button></div><p class="small-note">Overlay puts controls over the artwork. Split keeps them beside it.</p>';
  card.querySelectorAll('[data-banner-layout]').forEach(button=>button.onclick=()=>set(button.dataset.bannerLayout));
  panel.prepend(card);paint();
 }
 const previous=showSettings;showSettings=function(...args){const result=previous.apply(this,args);mount();return result;};
 window.OrbitDesktopBanner={set,get layout(){return layout;}};paint();
})();
