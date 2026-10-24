/* Mirror interface choices to the profile file; localStorage remains the fast UI cache. */
(()=>{if(!window.orbit?.saveUiPreference)return;const originalSet=Storage.prototype.setItem,originalRemove=Storage.prototype.removeItem;let reported=false;
 const persist=(key,value)=>{if(!/^orbit-[a-z0-9-]+$/.test(key))return;window.orbit.saveUiPreference({key,value}).catch(()=>{if(!reported){reported=true;window.toast?.('Settings could not be backed up. Your current choices remain in this window.',true);}});};
 Storage.prototype.setItem=function(key,value){const text=String(value),old=this.getItem(key);originalSet.call(this,key,text);if(this===localStorage&&old!==text)persist(String(key),text);};
 Storage.prototype.removeItem=function(key){const old=this.getItem(key);originalRemove.call(this,key);if(this===localStorage&&old!==null)persist(String(key),null);};
})();
