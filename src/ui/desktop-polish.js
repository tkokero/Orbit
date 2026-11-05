/* Keep the existing refresh status, count and page actions in one footer. */
(()=>{
 const status=document.querySelector('#friends-updated'),footer=document.querySelector('#friends-pagination');if(!status||!footer)return;
 const anchor=document.createComment('Friends refresh status');status.before(anchor);
 function place(){if(document.documentElement.classList.contains('couch-mode'))anchor.after(status);else footer.insertBefore(status,footer.querySelector(':scope>div'));}
 window.addEventListener('orbit:couch',place);place();
})();
