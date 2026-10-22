/* Release rendered library artwork in the tray; retain the library data and view. */
(()=>{
 let suspended=false;window.orbitMemory={suspended:()=>suspended,trim:()=>window.orbit.releaseImageCache?.()};
 if(new URLSearchParams(location.search).get('resume')==='1')window.orbitBoot.done.then(async()=>{const view=localStorage.getItem('orbit-resume-workspace');if(['store','downloads','friends','tools'].includes(view))await window.orbitShell.activate(view);requestAnimationFrame(()=>{const main=document.querySelector('main');if(main)main.scrollTop=Number(localStorage.getItem('orbit-resume-scroll'))||0;});});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){suspended=true;document.documentElement.classList.add('renderer-suspended');releaseLibraryImages();friendsUI.leave();window.OrbitIcons?.release(document.querySelector('#workspace-page'));
   const modal=document.querySelector('#modal-body');unobserve(modal);window.OrbitIcons?.release(modal);modal.querySelectorAll('img[src]').forEach(img=>{img.dataset.src=img.getAttribute('src');img.removeAttribute('src');});
  }

  else if(suspended){suspended=false;document.documentElement.classList.remove('renderer-suspended');render();window.OrbitIcons?.observe(document.querySelector('#workspace-page'));if(document.querySelector('#modal').open)observeImages(document.querySelector('#modal-body'));}
 });
})();
