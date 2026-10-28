/* Article requests stay inside one dismissible reader, including retry and recovery. */
(()=>{
 let reader=null,revision=0,closeReader=null;
 async function open(input){
  closeReader?.();const own=++revision,previous=document.activeElement,dialog=document.createElement('dialog');reader=dialog;
  dialog.className='orbit-news-reader';dialog.setAttribute('aria-label','Game news');
  dialog.innerHTML='<header><button class="subtle-button" data-orbit-icon="back" data-news-back>Back</button><button class="subtle-button" data-orbit-icon="external" data-news-browser>Open in browser</button></header><article data-controller-scroll tabindex="0"></article>';
  document.body.append(dialog);const article=dialog.querySelector('article'),jobs=[];let active=0,loading=false,cleaned=false;
  const current=()=>own===revision&&reader===dialog&&dialog.isConnected&&dialog.open;
  function unavailable(img){if(!img.isConnected)return;img.hidden=true;const caption=img.closest('figure')?.querySelector('figcaption');if(caption)caption.hidden=false;}
  function drain(){while(active<2&&jobs.length&&current()){const img=jobs.shift();active++;window.orbit.newsArticleImage({...input,index:Number(img.dataset.articleImage)}).then(src=>{if(src&&img.isConnected&&current()){img.onerror=()=>unavailable(img);img.onload=()=>img.closest('figure')?.classList.add('news-image-ready');img.src=src;}else unavailable(img);}).catch(()=>unavailable(img)).finally(()=>{active--;drain();});}
  }
  const images=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;images.unobserve(e.target);const img=e.target.querySelector('[data-article-image]');if(img)jobs.push(img);}drain();},{root:article,rootMargin:'250px'});
  const cleanup=()=>{if(cleaned)return;cleaned=true;jobs.length=0;images.disconnect();dialog.remove();const restore=reader===dialog;if(restore){reader=null;closeReader=null;}if(restore&&previous?.isConnected){if(window.OrbitControllerFocus)window.OrbitControllerFocus.focus(previous);else previous.focus({preventScroll:true});}};
  const close=()=>{if(reader!==dialog)return;revision++;dialog.close();cleanup();};closeReader=close;
  bindDialogDismiss(dialog,close);
  dialog.oncancel=e=>{e.preventDefault();close();};dialog.querySelector('[data-news-back]').onclick=close;dialog.querySelector('[data-news-browser]').onclick=()=>attempt(()=>window.orbit.openNewsExternal(input));dialog.addEventListener('close',cleanup,{once:true});
  dialog.addEventListener('click',e=>{const link=e.target.closest('[data-article-link]');if(!link)return;e.preventDefault();attempt(()=>window.orbit.openNewsLink({...input,index:Number(link.dataset.articleLink)}));});
  async function load(){
   if(loading||!current())return;loading=true;const retryFocused=document.activeElement?.matches('[data-news-retry]');jobs.length=0;images.disconnect();article.setAttribute('aria-busy','true');article.innerHTML='<div class="news-reader-state"><span class="news-reader-state-icon" aria-hidden="true">'+(window.OrbitControllerArt?.icon('news')||'')+'</span><p role="status">Loading article…</p></div>';
   try{
    const post=await window.orbit.openNews(input);if(!current())return;
    dialog.setAttribute('aria-label',post.title);article.innerHTML=`<div class="news-article-heading"><small>${esc(post.gameTitle)}${post.date?' · '+new Date(post.date).toLocaleDateString():''}</small><h1>${esc(post.title)}</h1></div><div class="news-article-content">${post.article?.html||esc(post.summary||'This announcement has no article text. Open it in your browser for more details.')}</div>`;
    dialog.querySelectorAll('[data-article-image]').forEach(img=>images.observe(img.closest('figure')));
   }catch(error){
    if(!current())return;article.innerHTML='<section class="news-reader-state news-reader-error" aria-label="Article unavailable"><span class="news-reader-state-icon" aria-hidden="true">'+(window.OrbitControllerArt?.icon('news')||'')+'</span><h1>Couldn’t load article</h1><p data-news-error role="status"></p><button class="primary-button" data-news-retry data-orbit-icon="refresh">Retry</button></section>';
    article.querySelector('[data-news-error]').textContent=error?.message||'Check your connection and try again.';article.querySelector('[data-news-retry]').onclick=()=>void load();window.OrbitDesktop?.enhance(article);
   }finally{loading=false;if(current()){article.setAttribute('aria-busy','false');if(retryFocused)(article.querySelector('[data-news-retry]')||dialog.querySelector('[data-news-back]')).focus({preventScroll:true});}}
  }
  dialog.showModal();dialog.querySelector('button').focus({preventScroll:true});await load();
 }
 window.OrbitNewsReader={open};
})();
