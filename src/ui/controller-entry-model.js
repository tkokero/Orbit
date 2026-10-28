/* Saved unlocks are independent of the selected startup and shared sound preferences. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitControllerEntryModel=api;})(typeof window==='object'?window:globalThis,()=>{
 const regular=[{id:'relay',name:'Orbital Relay'},{id:'bloom',name:'Nebula Bloom'},{id:'jump',name:'Starfold'}];
 const secret=[{id:'magnetar',name:'Magnetar'},{id:'pulsar',name:'Pulsar'},{id:'attractor',name:'Great Attractor'}];
 const key='orbit-controller-secrets-v1';
 function unlocked(storage){try{const value=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(value)?[...new Set(value.filter(id=>secret.some(s=>s.id===id)))]:[];}catch{return [];}}
 function scenes(storage){const found=unlocked(storage);return [...regular,...secret.filter(s=>found.includes(s.id))];}
 function unlock(storage,id){if(!secret.some(s=>s.id===id))return false;const found=unlocked(storage);if(found.includes(id))return false;storage.setItem(key,JSON.stringify([...found,id]));return true;}
 function selected(storage){const id=storage.getItem('orbit-controller-startup-v1');return scenes(storage).some(s=>s.id===id)?id:'relay';}
 return {regular,secret,unlocked,scenes,unlock,selected};
});
