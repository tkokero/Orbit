const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async function({window,report,target,gameNews,game,appId,uiPreferences}){
 const old=gameNews.cache.get(appId);gameNews.cache.set(appId,{checkedAt:Date.now(),posts:[{id:'orbit-news-validation',title:'Steam news test',url:'https://store.steampowered.com/news/app/'+appId,summary:'Full news article',date:Date.now(),content:'[h1]Changes[/h1]\n'+('Article paragraph.\n\n'.repeat(160))+'Final paragraph.<script>window.__newsInjected=true</script>'}]});
 try{
  await window.webContents.executeJavaScript('window.__flowNewsGame='+JSON.stringify(game.id));const checks=await window.webContents.executeJavaScript(await fs.readFile(path.join(__dirname,'ui/flow-smoke.js'),'utf8'));report.checks.push(...checks);report.passed&&=checks.every(c=>c.passed);
  const capture=async(name,script)=>{await window.webContents.executeJavaScript('OrbitControllerFocus.cancel()');await window.webContents.executeJavaScript(script);await new Promise(r=>setTimeout(r,250));await fs.writeFile(path.join(target,name),(await window.webContents.capturePage()).toPNG());};
  await capture('desktop-privacy.png',"showSettings();document.querySelector('#tab-privacy').click();document.querySelector('.discord-disclosure').open=true;document.querySelector('.discord-settings').scrollIntoView({block:'start',behavior:'instant'})");
  await capture('desktop-launcher-symbols.png',"document.querySelector('#tab-libraries').click();document.querySelector('[data-install-store]').scrollIntoView({block:'center',behavior:'instant'})");
  await capture('desktop-startup-symbols.png',"document.querySelector('#tab-appearance').click();document.querySelector('#startup-choices').scrollIntoView({block:'center',behavior:'instant'})");
  await capture('controller-button-bindings.png',"closeModal();OrbitCouch.open();OrbitCouch.skipEntry();OrbitCouch.act('settings');document.querySelector('[data-settings-category=controls]').click();document.querySelector('.controller-binding-fields').scrollIntoView({block:'center',behavior:'instant'})");
  await capture('controller-launch-handoff.png',"OrbitGameHandoff.start(state.games.find(g=>g.installed).id)");
  await capture('controller-news-reader.png',"OrbitGameHandoff.dismiss();OrbitNewsReader.open({id:window.__flowNewsGame,postId:'orbit-news-validation'})");
  await window.webContents.executeJavaScript("document.querySelector('[data-news-back]').click();orbitFeatures.setCouch(false)");
  await uiPreferences.queue;const durable=JSON.parse(await fs.readFile(uiPreferences.file,'utf8'));report.checks.push({name:'native interface settings file retains controller preferences',passed:typeof durable.values['orbit-controller-input-v1']==='string'&&!('orbit-validation-persistence' in durable.values)});report.passed&&=report.checks.at(-1).passed;
  await window.webContents.session.clearStorageData({storages:['localstorage']});
  const loaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await loaded;
  for(let i=0;i<150;i++){if(await window.webContents.executeJavaScript('Boolean(window.orbitReady)'))break;await new Promise(r=>setTimeout(r,100));}
  const restored=await window.webContents.executeJavaScript("Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('orbit-')).map(k=>[k,localStorage.getItem(k)]))");
  for(const key of ['orbit-controller-input-v1','orbit-themes-v1','orbit-startup-style']){const expected=durable.values[key];if(expected!==undefined){const check={name:key+' recovers after browser storage is cleared and the renderer reloads',passed:restored[key]===expected};report.checks.push(check);report.passed&&=check.passed;}}
 }finally{if(old)gameNews.cache.set(appId,old);else gameNews.cache.delete(appId);}
};
