/* Desktop visibility is independent of themes, library filters, and Controller. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitDesktopMenuModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const key='orbit-desktop-menus-v1';
 const sections=Object.freeze([
  {id:'hero',label:'Featured banner',group:'Library',target:'#hero'},
  {id:'recents',label:'Recents',group:'Library',target:'#recent-games'},
  {id:'news',label:'What’s new',group:'Library',target:'#news-shelf'},
  {id:'platforms',label:'Platforms',group:'Sidebar',target:'#source-navigation'},
  {id:'activity',label:'Activity',group:'Sidebar',target:'#activity-open'},
  {id:'storage',label:'Storage',group:'Sidebar',target:'#game-storage-open'}
 ].map(Object.freeze));
 function preferences(input){return Object.fromEntries(sections.map(({id})=>[id,input&&typeof input==='object'&&!Array.isArray(input)&&Object.hasOwn(input,id)&&typeof input[id]==='boolean'?input[id]:true]));}
 function read(storage){try{return preferences(JSON.parse(storage.getItem(key)));}catch{return preferences();}}
 function update(storage,current,id,value){if(!sections.some(s=>s.id===id)||typeof value!=='boolean')return preferences(current);const next=preferences({...preferences(current),[id]:value});storage.setItem(key,JSON.stringify(next));return next;}
 function reset(storage){const next=preferences();storage.setItem(key,JSON.stringify(next));return next;}
 return {key,sections,preferences,read,update,reset};
});
