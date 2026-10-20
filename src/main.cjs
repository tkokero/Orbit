const { app, BrowserWindow, ipcMain, dialog, shell, Menu, clipboard, powerMonitor, safeStorage, Notification, net } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { Worker } = require('node:worker_threads');
const { exists } = require('./discovery.cjs');
const {retainedRecords}=require('./mod-tools.cjs');
const {OrbitUpdater,INSTALLER}=require('./updater.cjs');
let updates,exitPreparation,updatingRestart=false;
const { mergeLibrary, importRecords, actionFor, STORES, parseVdf } = require('./library.cjs');
const { cacheCovers, cacheHero, downloadImage } = require('./artwork.cjs');
const { connectSteam } = require('./accounts.cjs');
const { PlaytimeTracker, nativePlaytime } = require('./playtime.cjs');
const { entryMenu, backgroundMenu, templateFor } = require('./context-menu.cjs');
const { LibraryMonitor, watchFolders, installationProgress } = require('./library-monitor.cjs');
const {SteamFriends,SocialCredentials,providers,socialClientUrl,friendProfileUrl}=require('./social.cjs');
const {libraryEntries:robloxLibraryEntries,experienceEntry,launchExperience,RobloxImages}=require('./roblox.cjs');
const robloxImages=new RobloxImages();
const {openInstaller,storeDestination}=require('./installers.cjs');
const {StoreService}=require('./store-service.cjs');
const {DownloadEstimator}=require('./download-estimator.cjs');
const {estimateHardware,referenceFor}=require('./hardware-fps.cjs');
const storeService=new StoreService(),downloadEstimator=new DownloadEstimator();
let social, socialVault, steamFriendHint='';
let tracker, discoveredRunning = false, monitor, rescanTimer;
const { validate:validateTheme } = require('./ui/themes.js');
const {readCache,writeCache}=require('./library-cache.cjs');
const {SaveBackups}=require('./save-backups.cjs');
const {diagnose}=require('./launch-health.cjs');
let saveBackups,cachedLibrary=false,initialLibrary=true;
const offline=()=>Boolean(store?.settings?.offlineMode)||!net.isOnline();
const libraryTools=require('./library-tools.cjs');
const {RunningGames}=require('./running-games.cjs');
let runningGames,runningTimer,stagedBackup,cleanupPreview=[];
const activeNotifications=new Set();
const settingsDefaults={offlineMode:false,downloadNotifications:true,autoDiscover:true,startMinimized:false,minimizeOnPlay:false,closeToTray:true,autoLoadFriends:true,refreshFriends:true,autoUpdates:true,restartForUpdates:true};
const {attachTray}=require('./tray.cjs');
let tray;
const smoke = process.argv.includes('--smoke-test');
const primaryInstance=smoke||app.requestSingleInstanceLock();
if(!primaryInstance)app.quit();
app.on('second-instance',()=>{if(window&&!window.isDestroyed()){if(window.isMinimized())window.restore();window.show();window.focus();}});
if (smoke) app.setPath('userData', path.join(app.getPath('temp'), 'orbit-smoke-test'));
let window, store, records = [], scanWarnings = [], scannedAt = 0, scanning, connections = [], coverStatus = {}, steamRoot, accountSynced = false;
let mergedCache = null;
const heroCache = new Map();
const defaults = () => ({ version: 1, preferences: {}, imports: [], remembered: [], steamId: '', settings:{...settingsDefaults} });
const dataPath = () => path.join(app.getPath('userData'), 'library.json');
let saving = Promise.resolve();
async function save() {
  const payload = JSON.stringify(store, null, 2);
  saving = saving.catch(() => {}).then(async () => {
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    await fs.writeFile(dataPath() + '.tmp', payload, 'utf8');
    await fs.rename(dataPath() + '.tmp', dataPath());
  });
  return saving;
}
function library() { const games = mergedCache ||= mergeLibrary([...records,...robloxLibraryEntries(store.roblox,records)], store.preferences); return tracker ? games.map(g => g.robloxPlaceId?g:tracker.decorate(g)) : games; }
function snapshot() {
  const games = library();
  return { games: games.map(g => ({ id: g.id, title: g.title, robloxPlaceId:g.robloxPlaceId, kind: g.kind, installed: g.installed, launcherAvailable: g.launcherAvailable, directLaunchAvailable:g.directLaunchAvailable, installationProgress:g.installationProgress,
    sizeBytes:g.sizeBytes,selected: g.selected, sources: g.sources, collections:store.preferences[g.id]?.collections||[], cover: g.cover, hero: heroCache.get(g.id), favorite: g.favorite, hidden: g.hidden,
    lastPlayed: g.lastPlayed, playtime: g.playtime, playtimeKnown: g.playtimeKnown, storePlaytimeKnown: g.storePlaytimeKnown, localPlaytime: g.localPlaytime, statsSource: g.statsSource, tracking: g.tracking,
    achievements: g.achievements ? { total: g.achievements.total, unlocked: g.achievements.unlocked } : null,
    versions: g.versions.map(v => ({ id: v.id, source: v.source, installed: v.installed, launcherAvailable: v.launcherAvailable })) })),
    offline:offline(),cached:cachedLibrary, settings: settingsSnapshot(), warnings: scanWarnings, scannedAt, steamId: store.steamId, connections, coverStatus,
    sources: STORES.map(name => ({ name, games: games.filter(g => g.sources.includes(name)).length })) };
}
function scanInWorker(forceImages,discovery) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'scan-worker.cjs'), { workerData: {
      imports: store.imports, remembered: store.remembered, preferences: store.preferences,
      offline:offline(),cachedRecords:records,artworkFolder: path.join(app.getPath('userData'), 'artwork'), forceImages,discovery,captureDiscovery:!smoke&&!accountSynced
    } });
    let delivered = false;
    worker.once('message', async message => {
      delivered = true;
      await worker.terminate();
      if (message.ok) resolve(message.result); else reject(new Error(message.error));
    });
    worker.once('error', reject);
    worker.once('exit', code => { if (!delivered) reject(new Error(`Library scan stopped (${code}).`)); });
  });
}
async function refresh(forceImages = false) {
  if (scanning) return scanning;
  scanning = (async () => {
    let result = await scanInWorker(forceImages);
    steamRoot = result.steamRoot;
    if (!smoke && !offline() && !accountSynced) {
      accountSynced = true;
      store.steamConnected = false;
      try { const account = await connectSteam({ parent: window, steamRoot }); if (account) { upsert(account.records); store.steamConnected = true; store.steamUnresolved = account.unresolved.length; result = await scanInWorker(forceImages,result.discovery); } }
      catch (e) { result.warnings.push(e.message); }
    }
    const memory = retainedRecords(store.remembered).map(g => ({ ...g, installed: false }));
    records = result.records;cachedLibrary=false;
    for(const r of records)if(r.origin==='scan')r.installationProgress=downloadEstimator.observe(r.id,r.installationProgress);
    mergedCache = null;
    coverStatus = result.coverStatus;
    if(!offline())heroCache.clear();
    if (result.featuredId&&result.hero) heroCache.set(result.featuredId, result.hero);
    connections = result.statuses;
    if (store.steamConnected) {
      const steam = connections.find(c => c.source === 'Steam');
      if (steam) steam.status = `Steam web account connected${store.steamUnresolved ? ` · ${store.steamUnresolved} titles need metadata` : ''}; local history also included`;
    }
    for (const source of ['EA', 'Battle.net', 'GOG', 'Xbox']) {
      const found = records.filter(g => g.source === source);
      connections.push({ source, count: new Set(found.map(g => g.id)).size, status: found.length ? 'Local installations connected; full online library is not connected' : 'No local library data found; online account is not connected' });
    }
    // Keep titles when uninstalled, but never persist an installation claim.
    const known = new Map(memory.map(g => [g.id, g]));
    for (const g of records.filter(g => g.origin !== 'manual' && g.origin !== 'import')) {
      const { coverCandidates, heroCandidates, description, ...small } = g;
      known.set(g.id, { ...small, installed: false, achievements: g.achievements ? { ...g.achievements, items: [], partial: g.achievements.total > 0 } : undefined });
    }
    store.remembered = [...known.values()];
    scanWarnings = result.warnings;
    scannedAt = result.scannedAt;
    await save();
    if(!smoke){const file=path.join(app.getPath('userData'),'library-cache.json');await writeCache(file,{records,scannedAt,steamRoot,hero:[...heroCache]});}
    await configureMonitor();
    for (const g of library()) if (nativePlaytime(g) || g.kind !== 'game') { if (tracker.ledger.sessions.has(g.id) || tracker.pending.has(g.id)) await tracker.stop(g.id); }
    if (!smoke && !discoveredRunning) { discoveredRunning = true; tracker.discoverRunning(library()).catch(() => {}); }
    return snapshot();
  })();
  try { return await scanning; } finally { scanning = null; }
}
function handle(name, fn) {
  ipcMain.handle(name, async (event, ...args) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new Error('Untrusted caller.');
    try {
      if(offline()&&['steam:connect','steam:sync','epic:sync','social:connect-steam','store:deals','system:check','library:repair-images','game:repair-image','updates:check'].includes(name))throw Error('This feature needs a connection. Turn off Offline mode in Settings when you are ready.');
      if(offline()&&['social:refresh'].includes(name))return {ok:true,data:socialSnapshot()};
      if(offline()&&['store:icon','roblox:icon','social:image','game:achievement-image'].includes(name))return {ok:true,data:null};
      return { ok: true, data: await fn(...args) };
    }
    catch (e) { return { ok: false, error: e.message || 'Something went wrong.' }; }
  });
}
function gameById(id) {
  const game = library().find(g => g.id === id);
  if (!game) throw new Error('Game no longer found. Refresh your library.');
  return game;
}
function upsert(items) {
  const byId = new Map(store.imports.map(g => [g.id, g]));
  for (const g of items) byId.set(g.id, { ...byId.get(g.id), ...g });
  store.imports = [...byId.values()];
}
function popup(items, point = {}) {
  return new Promise(resolve => {
    let selected = null;
    const menu = Menu.buildFromTemplate(templateFor(items, command => { selected = command; }));
    menu.popup({ window, x: Math.max(0, Math.round(Number(point.x) || 0)), y: Math.max(0, Math.round(Number(point.y) || 0)), callback: () => resolve(selected) });
  });
}
function settingsSnapshot(){return {...settingsDefaults,...store.settings,launchAtLogin:!smoke&&app.isPackaged?app.getLoginItemSettings({path:process.execPath,args:['--startup']}).openAtLogin:false,startupAvailable:!smoke&&app.isPackaged};}
async function configureMonitor(){
  monitor?.close();if(smoke||!store.settings.autoDiscover){clearTimeout(rescanTimer);rescanTimer=null;return;}
  monitor ||= new LibraryMonitor(async events=>{
    let rescan=false,changed=false;
    for(const event of events){
      if(!/^appmanifest_\d+\.acf$/i.test(event.name)){rescan=true;continue;}
      const id='steam:'+event.name.match(/\d+/)[0],filename=path.join(event.folder,event.name);
      try{const appState=parseVdf(await fs.readFile(filename,'utf8')).AppState;
        const matches=records.filter(r=>r.id===id);if(!matches.length){rescan=true;continue;}if(!matches.some(r=>r.origin==='scan'))rescan=true;
        const progress=downloadEstimator.observe(id,installationProgress(appState));
        const installed=Boolean(Number(appState.StateFlags)&4)&&Boolean(appState.installdir)&&await exists(path.join(event.folder,'common',appState.installdir));
        if(matches.some(r=>libraryTools.completedDownload(r.installationProgress,progress,appState,installed))&&store.settings.downloadNotifications&&!smoke&&Notification.isSupported()){
          const title=matches[0].title,n=new Notification({title:'Ready to play',body:title+' has finished installing. Click to open Orbit.'});activeNotifications.add(n);
          n.on('click',()=>{if(window&&!window.isDestroyed()){window.show();window.focus();window.webContents.send('download:complete',{id,title});}});n.on('close',()=>activeNotifications.delete(n));n.show();
        }
        for(const r of matches){if(r.origin==='scan'&&r.installed!==installed)rescan=true;r.installationProgress=progress;}changed=true;
      }catch{rescan=true;}
    }
    if(changed){mergedCache=null;if(window&&!window.isDestroyed())window.webContents.send('installation:update',library().map(g=>({id:g.id,installationProgress:g.installationProgress})));}
    if(rescan&&!rescanTimer)rescanTimer=setTimeout(()=>{rescanTimer=null;refresh().then(data=>{if(window&&!window.isDestroyed())window.webContents.send('library:update',data);}).catch(()=>{});},6000);
  });
  monitor.start(await watchFolders(steamRoot,parseVdf));
}
function socialSnapshot(){const steam=social.snapshot();return {...steam,providers:providers(steam),steamIdHint:steam.steamId||store.steamId||steamFriendHint||'',secureStorageAvailable:safeStorage.isEncryptionAvailable()};}
function publishRoblox(){mergedCache=null;if(window&&!window.isDestroyed())window.webContents.send('library:update',snapshot());}
async function openRobloxExperience({id,browser=false}={}){
 const entry=store.roblox?.games.find(g=>g.id===String(id));if(!entry)throw new Error('Save this experience first.');const mode=browser?'browser':store.roblox.mode,url=launchExperience(entry,mode);
 if(!smoke)try{await shell.openExternal(url);}catch{await shell.openExternal(launchExperience(entry,'browser'));}
 entry.lastOpened=Date.now();await save();publishRoblox();
 return {message:mode==='app'?'Opening '+entry.title+' in Roblox. If it does not start, use Open page.':'Opening '+entry.title+' on Roblox. Choose Play on its page to join.'};
}
async function prepareExit(){
 if(!exitPreparation)exitPreparation=(async()=>{monitor?.close();clearTimeout(rescanTimer);social?.disconnect();await tracker?.shutdown();await saving;})();
 return exitPreparation;
}
function setupHandlers() {
  handle('updates:status',()=>updates.snapshot());
  handle('updates:check',()=>updates.check());
  handle('updates:install',()=>updates.restart());
  handle('updates:installer',()=>shell.openExternal(INSTALLER));
  handle('roblox:get',()=>store.roblox||{mode:'browser',games:[]});
  handle('roblox:save',async input=>{const entry=experienceEntry(input);store.roblox ||= {mode:'browser',games:[]};const old=store.roblox.games.find(g=>g.id===entry.id);if(!old&&store.roblox.games.length>=64)throw new Error('You can save up to 64 Roblox experiences.');store.roblox.games=store.roblox.games.filter(g=>g.id!==entry.id);store.roblox.games.push({...entry,lastOpened:old?.lastOpened||0});await save();publishRoblox();return store.roblox;});
  handle('roblox:remove',async id=>{store.roblox ||= {mode:'browser',games:[]};store.roblox.games=store.roblox.games.filter(g=>g.id!==String(id));await save();publishRoblox();return store.roblox;});
  handle('roblox:mode',async mode=>{if(!['browser','app'].includes(mode))throw new Error('Invalid Roblox launch method.');store.roblox ||= {mode:'browser',games:[]};store.roblox.mode=mode;await save();publishRoblox();return store.roblox;});
  handle('roblox:launch',openRobloxExperience);
  handle('roblox:icon',async id=>{const entry=store.roblox?.games.find(g=>g.id===String(id));if(!entry)return null;const image=await robloxImages.icon(entry.placeId);return image?downloadImage(image,path.join(app.getPath('userData'),'roblox-artwork'),{kind:'icon'}):null;});
  handle('setup:get',()=>store.setup||{step:0,status:'new'});
  handle('setup:save',async input=>{if(!Number.isInteger(input?.step)||input.step<0||input.step>5||!['started','later','complete'].includes(input.status))throw new Error('Invalid setup state.');store.setup={step:input.step,status:input.status};await save();return store.setup;});
  handle('game:icon',async id=>{const game=gameById(id);if(game.cover&&(!offline()||game.cover.startsWith('file:'))){const image=await downloadImage(game.cover,path.join(app.getPath('userData'),'artwork'),{kind:'icon'});if(image)return image;}const executable=game.versions.find(v=>v.executable)?.executable;if(executable&&await exists(executable))try{return (await app.getFileIcon(executable,{size:'small'})).toDataURL();}catch{}return null;});
  handle('store:icon',async id=>{const image=storeService.dealImages.get(String(id));return image?downloadImage(image,path.join(app.getPath('userData'),'store-artwork'),{kind:'icon'}):null;});
  handle('store:deals',country=>storeService.deals(country));
  handle('store:open',async id=>{if(!/^\d+$/.test(String(id)))throw new Error('Invalid Steam game.');if(!smoke)await shell.openExternal('https://store.steampowered.com/app/'+id+'/');});
  handle('fps:source',async id=>{const reference=referenceFor(gameById(id).title);if(!reference)throw new Error('No publisher FPS reference for this game.');if(!smoke)await shell.openExternal(reference.url);return true;});
  handle('fps:hardware',async id=>{const game=gameById(id);if(game.kind!=='game')throw new Error('Choose a game to estimate.');const location=game.versions.find(v=>v.installed)?.location,version=game.versions.find(v=>v.source==='Steam'||v.equivalentSteamId),appId=version?.appId||version?.equivalentSteamId;const [pc,requirements]=await Promise.all([storeService.system(location),!offline()&&appId?storeService.check(appId,location).catch(()=>null):Promise.resolve(null)]);return estimateHardware(game,pc,requirements);});

  handle('system:info',refresh=>storeService.system(undefined,refresh===true));
  handle('system:check',id=>{const game=gameById(id),version=game.versions.find(v=>v.source==='Steam'||v.equivalentSteamId);return storeService.check(version?.appId||version?.equivalentSteamId,game.versions.find(v=>v.installed)?.location);});
  handle('installer:open',id=>openInstaller({dialog,shell,parent:window,title:id?gameById(id).title:null,smoke}));
  handle('installer:store',async source=>{const url=storeDestination(source);if(!smoke)await shell.openExternal(url);});
  handle('social:get',async()=>{if(!steamFriendHint&&steamRoot)try{const users=parseVdf(await fs.readFile(path.join(steamRoot,'config/loginusers.vdf'),'utf8')).users||{};steamFriendHint=Object.entries(users).filter(([id])=>/^\d{17}$/.test(id)).sort((a,b)=>Number(b[1].MostRecent||0)-Number(a[1].MostRecent||0)||Number(b[1].Timestamp||0)-Number(a[1].Timestamp||0))[0]?.[0]||'';}catch{}return socialSnapshot();});
  handle('social:refresh',async()=>{await social.refresh();return socialSnapshot();});
  handle('social:connect-steam',async input=>{
    const candidate=new SteamFriends();candidate.configure(String(input?.steamId||''),String(input?.apiKey||''));
    const tested=await candidate.refresh();if(tested.error)throw new Error(tested.error);
    if(input?.remember===true)await socialVault.save(candidate.steamId,candidate.key);else await socialVault.clear();
    social.disconnect();social=candidate;social.saved=input?.remember===true;store.steamId=candidate.steamId;await save();return socialSnapshot();
  });
  handle('social:disconnect',async()=>{await socialVault.clear();social.disconnect();return socialSnapshot();});
  handle('social:open-client',async provider=>{const url=socialClientUrl(provider);if(!smoke)await shell.openExternal(url);return {message:provider==='steam'?'Steam Friends & Chat opened. Use the menu next to your name to change status.':provider==='epic'?'Epic Games opened. Use your profile menu to manage status.':'Discord opened. Use your profile menu to change status.',route:smoke?url:undefined};});
  handle('social:activity',id=>social.activity(id));
  handle('social:image',async ({id,gameId}={})=>{const friend=social.people.find(p=>p.id===id);if(!friend)return null;const url=gameId?(await social.activity(id)).games.find(g=>g.id===gameId)?.icon:friend.avatar;return url?downloadImage(url,path.join(app.getPath('userData'),'friend-avatars'),{kind:'icon'}):null;});
  handle('social:profile',async id=>{const friend=social.people.find(p=>p.id===id);if(!friend)throw new Error('Friend is not in the connected list.');if(!smoke)await shell.openExternal(friendProfileUrl(friend));});
  handle('theme:import',async()=>{const chosen=await dialog.showOpenDialog(window,{title:'Import Orbit theme',properties:['openFile'],filters:[{name:'Orbit theme JSON',extensions:['json']}]});if(chosen.canceled)return null;const file=chosen.filePaths[0];if((await fs.stat(file)).size>32768)throw new Error('Theme files must be under 32 KB.');return validateTheme(JSON.parse(await fs.readFile(file,'utf8')));});
  handle('theme:export',async input=>{const theme=validateTheme(input);const chosen=await dialog.showSaveDialog(window,{title:'Export Orbit theme',defaultPath:'orbit-theme.json',filters:[{name:'JSON',extensions:['json']}]});if(chosen.canceled)return null;await fs.writeFile(chosen.filePath,JSON.stringify(theme,null,2));return true;});
  handle('settings:get',()=>settingsSnapshot());
  handle('settings:update',async change=>{
    if(typeof change?.launchAtLogin==='boolean'){
      if(smoke||!app.isPackaged)throw new Error('Startup is available in the packaged Windows app.');
      app.setLoginItemSettings({openAtLogin:change.launchAtLogin,path:process.execPath,args:['--startup']});
    }
    for(const key of Object.keys(settingsDefaults))if(typeof change?.[key]==='boolean')store.settings[key]=change[key];
    await save();if(typeof change?.autoDiscover==='boolean')await configureMonitor();if('autoUpdates' in change||'restartForUpdates' in change||'offlineMode' in change){if(offline())updates.stop();else updates.settingsChanged();}return settingsSnapshot();
  });
  handle('sessions:get',async()=>{if(smoke)return [];return runningGames.scan();});
  handle('sessions:focus',id=>smoke?true:runningGames.focus(id));
  handle('collections:get',()=>store.collections||[]);
  handle('collections:save',async input=>{
    const name=String(input?.name||'').trim();if(!name||name.length>40)throw Error('Use a collection name under 40 characters.');
    store.collections||=['Playing','Backlog','Finished'];
    if(input.remove){store.collections=store.collections.filter(x=>x!==name);for(const p of Object.values(store.preferences))if(p.collections)p.collections=p.collections.filter(x=>x!==name);}
    else if(!store.collections.includes(name)){if(store.collections.length>=50)throw Error('You can create up to 50 collections.');store.collections.push(name);}
    mergedCache=null;await save();return store.collections;
  });
  handle('collections:assign',async({id,names})=>{gameById(id);if(!Array.isArray(names)||names.some(n=>!store.collections?.includes(n)))throw Error('Choose an existing collection.');store.preferences[id]={...store.preferences[id],collections:[...new Set(names)]};mergedCache=null;await save();return snapshot();});
  handle('profile:get',id=>libraryTools.profile(store.preferences[gameById(id).id]?.profile));
  handle('profile:save',async({id,value})=>{gameById(id);const p=libraryTools.profile(value);if(p.tools.some(t=>t===id||gameById(t).kind!=='tool'))throw Error('Choose supporting tools only.');store.preferences[id]={...store.preferences[id],profile:p};await save();return p;});
  handle('profile:choose',async()=>{const r=await dialog.showOpenDialog(window,{title:'Choose preferred executable',properties:['openFile'],filters:[{name:'Executable',extensions:['exe']}]});return r.canceled?null:r.filePaths[0];});
  handle('backup:export',async ui=>{await tracker.save();const data=libraryTools.backup(store,tracker.ledger,ui,tracker.configs);const r=await dialog.showSaveDialog(window,{title:'Back up Orbit',defaultPath:'Orbit-Backup.json',filters:[{name:'Orbit backup',extensions:['json']}]});if(r.canceled)return null;await fs.writeFile(r.filePath,JSON.stringify(data,null,2));return true;});
  handle('backup:preview',async()=>{const r=await dialog.showOpenDialog(window,{title:'Restore Orbit backup',properties:['openFile'],filters:[{name:'Orbit backup',extensions:['json']}]});if(r.canceled)return null;if((await fs.stat(r.filePaths[0])).size>20e6)throw Error('Backup must be under 20 MB.');stagedBackup=libraryTools.validateBackup(JSON.parse(await fs.readFile(r.filePaths[0],'utf8')));return {savedAt:stagedBackup.savedAt,games:stagedBackup.imports.length,preferences:Object.keys(stagedBackup.preferences).length,collections:stagedBackup.collections.length,hours:Object.values(stagedBackup.playtime.totals).reduce((a,t)=>a+t.seconds/3600,0)};});
  handle('backup:restore',async ui=>{
    if(!stagedBackup)throw Error('Choose a backup first.');if(tracker.ledger.sessions.size||runningGames?.sessions.size)throw Error('Close running games and stop manual timers before restoring.');
    const data=stagedBackup;stagedBackup=null;
    await fs.writeFile(path.join(app.getPath('userData'),'before-restore-'+Date.now()+'.json'),JSON.stringify(libraryTools.backup(store,tracker.ledger,ui,tracker.configs),null,2));
    for(const r of data.imports)if(r.executable)r.installed=await exists(r.executable);
    store.preferences=data.preferences;store.imports=data.imports;store.collections=data.collections;store.roblox=data.roblox;store.settings={...settingsDefaults,...data.settings};
    tracker.ledger.totals=data.playtime.totals;tracker.configs=data.playtime.configs;await tracker.save();await save();mergedCache=null;updates?.settingsChanged();
    return {ui:data.ui,library:await refresh()};
  });
  handle('cleanup:preview',async()=>cleanupPreview=await libraryTools.inspectLibrary(library(),exists));
  handle('cleanup:apply',async ids=>{if(!Array.isArray(ids))throw Error('Choose entries to hide.');const allowed=new Set(cleanupPreview.filter(x=>x.action==='hide').map(x=>x.id));if(ids.some(id=>!allowed.has(id)))throw Error('Run a cleanup preview first.');for(const id of ids)store.preferences[id]={...store.preferences[id],hidden:true};cleanupPreview=[];mergedCache=null;await save();return snapshot();});
  handle('data:open',()=>shell.openPath(app.getPath('userData')));
  handle('downloads:open',source=>{const urls={'Steam':'steam://nav/downloads','Epic Games':'com.epicgames.launcher://library'};if(!urls[source])throw new Error('Open this game’s launcher to see installation progress.');return shell.openExternal(urls[source]);});
  handle('menu:entry', (id, point) => popup(entryMenu(gameById(id),library().filter(g=>g.kind==='tool'&&/r2modman|CurseForge/i.test(g.title))), point));
  handle('menu:background', (input, point) => popup(backgroundMenu(input?.section, Boolean(input?.list)), point));
  handle('game:copy-title', id => clipboard.writeText(gameById(id).title));
  handle('playtime:start', async id => { await tracker.manual(gameById(id)); return snapshot(); });
  handle('playtime:stop', async id => { gameById(id); await tracker.stop(id); return snapshot(); });
  handle('playtime:configure', async id => {
    const game = gameById(id);
    if (nativePlaytime(game) || game.kind !== 'game') throw new Error('This item does not need a local timer.');
    const result = await dialog.showOpenDialog(window, { title: 'Choose the game executable for playtime tracking', properties: ['openFile'], filters: [{ name: 'Game executable', extensions: ['exe'] }] });
    if (result.canceled) return null;
    await tracker.configure(game, result.filePaths[0]); return snapshot();
  });
  handle('library:get',async()=>{
    if(initialLibrary&&cachedLibrary){initialLibrary=false;setTimeout(()=>refresh().then(data=>{if(window&&!window.isDestroyed())window.webContents.send('library:update',data);}).catch(()=>{}),2500);return snapshot();}
    initialLibrary=false;return refresh();
  });
  handle('launch:diagnose',id=>diagnose(gameById(id),store.preferences[id]?.profile,exists));
  handle('saves:list',id=>{gameById(id);return saveBackups.list(id);});
  handle('saves:folder',async id=>{gameById(id);const r=await dialog.showOpenDialog(window,{title:'Choose this game’s save folder',properties:['openDirectory']});if(r.canceled)return null;return saveBackups.setFolder(id,r.filePaths[0]);});
  handle('saves:backup',async id=>{gameById(id);if(!smoke)await runningGames.scan();if(runningGames.sessions.has(id)||tracker.ledger.sessions.has(id))throw Error('Close the game and stop its timer before backing up saves.');return saveBackups.create(id);});
  handle('saves:preview',({id,key})=>{gameById(id);return saveBackups.preview(id,key);});
  handle('saves:restore',async({id,token,overwriteNewer,closed})=>{gameById(id);if(closed!==true)throw Error('Confirm the game is closed before restoring.');if(!smoke)await runningGames.scan();if(runningGames.sessions.has(id)||tracker.ledger.sessions.has(id))throw Error('Close the game and stop its timer before restoring saves.');return saveBackups.restore(id,token,overwriteNewer===true);});
  handle('library:repair-images', () => refresh(true));
  handle('game:details', id => gameById(id));
  handle('game:achievement-image', async (id, achievementId) => {
    const item = gameById(id).achievements?.items?.find(a => a.id === achievementId);
    return item?.image ? downloadImage(item.image, path.join(app.getPath('userData'), 'artwork'), { kind: 'icon' }) : null;
  });
  handle('game:hero', async id => {
    if(offline())return heroCache.get(id)||null;
    if (!heroCache.has(id)) heroCache.set(id, await cacheHero(gameById(id), path.join(app.getPath('userData'), 'artwork')));
    return heroCache.get(id);
  });
  handle('game:repair-image', async id => {
    const game = gameById(id), folder = path.join(app.getPath('userData'), 'artwork');
    await cacheCovers(game.versions, folder, () => {}, true);
    const cover = game.versions.find(v => v.cover)?.cover;
    const repaired = cover ? `${cover}?v=${Date.now()}` : undefined;
    for (const record of records) if (game.versions.some(v => v.id === record.id)) record.cover = repaired;
    mergedCache = null;
    return repaired || null;
  });
  handle('steam:connect', async () => {
    const account = await connectSteam({ parent: window, steamRoot, interactive: true });
    if (!account) throw new Error('Steam did not return an owned library.');
    upsert(account.records); store.steamConnected = true; store.steamUnresolved = account.unresolved.length; return refresh();
  });
  handle('game:preference', async (id, change) => {
    const game = gameById(id);
    const safe = {};
    for (const key of ['favorite', 'hidden']) if (typeof change?.[key] === 'boolean') safe[key] = change[key];
    if (['game','tool'].includes(change?.kind)) safe.kind = change.kind;
    if (typeof change?.preferred === 'string' && game.versions.some(v => v.id === change.preferred)) safe.preferred = change.preferred;
    store.preferences[id] = { ...store.preferences[id], ...safe };
    mergedCache = null;
    if (safe.kind === 'tool') await tracker.stop(id);
    await save(); return snapshot();
  });
  async function launchEntry(id,withTools=true) {
    const game = gameById(id), base = game.versions[0], profile=libraryTools.profile(store.preferences[id]?.profile);
    const version=profile.executable?{...base,installed:true,executable:profile.executable,location:path.dirname(profile.executable),launch:undefined,directLaunch:undefined,shortcut:undefined,windowsAppId:undefined,launcherAvailable:false}:base;
    if(version.robloxPlaceId)return openRobloxExperience({id:version.robloxPlaceId});
    if (version.installed && !version.launch && !version.executable && !version.directLaunch && !version.windowsAppId) throw new Error('Choose this game’s executable using “Locate executable” first.');
    // Recheck availability in case a drive disappeared since scanning.
    if (version.installed && version.location && !await exists(version.location)) throw new Error('The game drive or folder is unavailable. Reconnect it and refresh.');
    const action = actionFor(version);
    if(profile.args.length){if(action.type!=='exe')throw Error('Custom arguments need a preferred executable. Store launches use their client settings.');action.args=[...(action.args||[]),...profile.args];}
    if(withTools&&!smoke&&(version.installed||version.directLaunchAvailable))for(const tool of profile.tools){if(gameById(tool).kind!=='tool')throw Error('A supporting tool is no longer available. Update launch settings.');await launchEntry(tool,false);}
    if (!smoke) {
      if(action.type==='windows-app')await new Promise((resolve,reject)=>{const child=spawn(path.join(process.env.SystemRoot||'C:/Windows','explorer.exe'),['shell:AppsFolder\\'+action.value],{detached:true,stdio:'ignore',shell:false});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});});
      else if (action.type === 'url') await shell.openExternal(action.value);
      else if (action.type === 'shortcut') { const error = await shell.openPath(action.value); if (error) throw new Error(error); }
      else await new Promise((resolve, reject) => {
        const child = spawn(action.value, action.args || [], { cwd: path.dirname(action.value), detached: true, stdio: 'ignore', shell: false });
        child.once('error', reject); child.once('spawn', () => { child.unref(); resolve(); });
      });
    }
    if ((version.installed || version.launcherAvailable) && !smoke) { store.preferences[id] = { ...store.preferences[id], lastOpened: Date.now() }; await save(); tracker.watch(profile.executable?{...game,versions:[version]}:game).catch(() => {}); if(store.settings.minimizeOnPlay)window.minimize(); }
    return { message: version.installed || version.launcherAvailable ? `Opening ${game.title} via ${version.source}` : `Opening ${version.source} to install ${game.title}`, controller:profile.controller, action: smoke ? action : undefined };
  }
  handle('game:action', id=>launchEntry(id));
  handle('game:folder', async id => {
    const game = gameById(id), location = game.versions.find(v => (v.installed || v.launcherAvailable) && v.location)?.location;
    if (!location || !await exists(location)) throw new Error('No available installation folder.');
    const error = await shell.openPath(location); if (error) throw new Error(error);
  });
  handle('game:locate', async id => {
    const game = gameById(id), version = game.versions[0];
    const selected = await dialog.showOpenDialog(window, { title: `Choose ${game.title} executable`, properties: ['openFile'], filters: [{ name: 'Game executable', extensions: ['exe'] }] });
    if (selected.canceled) return null;
    const executable = selected.filePaths[0];
    if (!/\.exe$/i.test(executable)) throw new Error('Choose an .exe file.');
    upsert([{ ...version, id: `custom:${version.id}`, origin: 'manual', launch: undefined, directLaunch:undefined, directLaunchAvailable:false, windowsAppId:undefined, executable, location: path.dirname(executable), installed: true }]);
    store.preferences[id] = { ...store.preferences[id], preferred: `custom:${version.id}` };
    return refresh();
  });
  handle('game:add', async input => {
    if (typeof input?.title !== 'string' || !input.title.trim() || input.title.length > 300) throw new Error('Enter a game title.');
    const result = await dialog.showOpenDialog(window, { title: 'Choose game executable', properties: ['openFile'], filters: [{ name: 'Game executable', extensions: ['exe'] }] });
    if (result.canceled) return null;
    const executable = result.filePaths[0];
    if (!/\.exe$/i.test(executable)) throw new Error('Choose an .exe file.');
    const source = STORES.includes(input.source) ? input.source : 'Other';
    upsert([{ id: `manual:${executable.toLowerCase()}`, title: input.title.trim(), source, kind: ['game','tool'].includes(input.kind) ? input.kind : undefined, executable,
      location: path.dirname(executable), installed: true, origin: 'manual' }]);
    return refresh();
  });
  handle('library:import', async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Import a game library', properties: ['openFile'], filters: [{ name: 'Game library JSON', extensions: ['json'] }] });
    if (result.canceled) return null;
    const stat = await fs.stat(result.filePaths[0]); if (stat.size > 20e6) throw new Error('Library file must be under 20 MB.');
    const imported = importRecords(JSON.parse(await fs.readFile(result.filePaths[0], 'utf8')));
    upsert(imported); return refresh();
  });
  handle('library:export', async () => {
    const result = await dialog.showSaveDialog(window, { title: 'Export game catalog', defaultPath: 'orbit-library.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (result.canceled) return null;
    const games = library().flatMap(g => g.versions.map(v => ({ title: g.title, source: v.source, appId: v.appId, launchUrl: v.launch, installUrl: v.installUrl })));
    await fs.writeFile(result.filePath, JSON.stringify({ games }, null, 2)); return 'Library exported.';
  });
  handle('steam:sync', async ({ steamId, apiKey } = {}) => {
    if (!/^\d{17}$/.test(steamId || '') || !/^[a-f\d]{32}$/i.test(apiKey || '')) throw new Error('Enter a 17-digit SteamID64 and a 32-character Steam Web API key.');
    const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
    url.search = new URLSearchParams({ key: apiKey, steamid: steamId, include_appinfo: 'true', include_played_free_games: 'true' });
    let response;
    try { response = await fetch(url, { signal: AbortSignal.timeout(25000) }); }
    catch { throw new Error('Could not reach Steam. Check your internet connection and try again.'); }
    if (!response.ok) throw new Error(`Steam returned ${response.status}. Check your API key.`);
    const payload = await response.json();
    if (!Array.isArray(payload.response?.games)) throw new Error('Steam did not return a library. Set Game details to Public in Steam privacy settings, then try again.');
    const games = importRecords(payload.response.games.map(g => ({ title: g.name, source: 'Steam', appId: g.appid })));
    games.forEach((g, i) => { g.playtime = payload.response.games[i].playtime_forever || 0; g.playtimeKnown = true; g.playtimeRecent = payload.response.games[i].playtime_2weeks ?? null; g.lastPlayed = Number(payload.response.games[i].rtime_last_played || 0) * 1000; g.statsSource = 'Steam API'; });
    upsert(games); store.steamId = steamId; return refresh(); // API key is deliberately not persisted.
  });
  handle('epic:sync', async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Choose your signed-in Legendary executable', properties: ['openFile'], filters: [{ name: 'Legendary executable', extensions: ['exe'] }] });
    if (result.canceled) return null;
    const executable = result.filePaths[0];
    if (!/^legendary(?:[-\w.]*)?\.exe$/i.test(path.basename(executable))) throw new Error('Choose legendary.exe from the official Legendary release.');
    let stdout;
    try { ({ stdout } = await promisify(execFile)(executable, ['list', '--json'], { windowsHide: true, timeout: 120000, maxBuffer: 30e6 })); }
    catch { throw new Error('Legendary could not fetch your Epic library. Run “legendary auth” to sign in, then try again.'); }
    let entries;
    try { entries = JSON.parse(stdout); } catch { throw new Error('Legendary did not return a JSON library. Update Legendary and try again.'); }
    if (!Array.isArray(entries)) throw new Error('Unexpected Legendary library format.');
    const rows = entries.filter(g => !g.metadata?.mainGameItem).map(g => ({ title: g.app_title, source: 'Epic Games', appId: g.app_name,
      launchUrl: `com.epicgames.launcher://apps/${encodeURIComponent([g.metadata?.namespace, g.metadata?.id, g.app_name].filter(Boolean).join(':'))}?action=launch&silent=true`,
      installUrl: 'com.epicgames.launcher://library' }));
    upsert(importRecords(rows)); return refresh();
  });
  const links = { steamKey: 'https://steamcommunity.com/dev/apikey', steamPrivacy: 'https://steamcommunity.com/my/edit/settings', legendary: 'https://github.com/legendary-gl/legendary#quickstart' };
  handle('help:open', name => { if (!links[name]) throw new Error('Unknown help link.'); return shell.openExternal(links[name]); });
  handle('window:control', action => { if (action === 'minimize') window.minimize(); if (action === 'maximize') window.isMaximized() ? window.unmaximize() : window.maximize(); if (action === 'close') window.close(); });
}
app.whenReady().then(async () => {
  if(!primaryInstance)return;
  if(process.platform==='win32')app.setAppUserModelId('io.github.tkokero.orbit');
  store = defaults();
  try {
    const loaded = smoke ? defaults() : JSON.parse(await fs.readFile(dataPath(), 'utf8'));
    if (!Array.isArray(loaded.imports) || !Array.isArray(loaded.remembered) || !loaded.preferences || typeof loaded.preferences !== 'object') throw new Error('Invalid library data.');
    store = { ...store, ...loaded, remembered:retainedRecords(loaded.remembered),settings:{...settingsDefaults,...loaded.settings} };
  } catch (e) {
    if (e.code !== 'ENOENT') { await fs.copyFile(dataPath(), dataPath() + '.backup-' + Date.now()).catch(() => {}); scanWarnings.push('The library file could not be read; a backup was kept.'); }
  }
  social=new SteamFriends();socialVault=new SocialCredentials(path.join(app.getPath('userData'),'social-credentials.json'),safeStorage);
  if(!smoke){const credential=await socialVault.load();if(credential)social.configure(credential.steamId,credential.key,true);}
  tracker = new PlaytimeTracker(path.join(app.getPath('userData'), 'playtime.json'), updates => { if (window && !window.isDestroyed()) window.webContents.send('playtime:update', updates); });
  store.collections||=['Playing','Backlog','Finished'];
  runningGames=new RunningGames({games:()=>library().map(g=>{const p=store.preferences[g.id]?.profile;return p?.executable?{...g,installed:true,versions:[{executable:p.executable}]}:g;}),emit:data=>{if(window&&!window.isDestroyed())window.webContents.send('sessions:update',data);}});
  if(!smoke){runningTimer=setInterval(()=>{if((window?.isVisible()&&!window.isMinimized())||runningGames.sessions.size)runningGames.scan().catch(()=>{});},15000);runningTimer.unref();}
  await tracker.load();
  saveBackups=new SaveBackups(path.join(app.getPath('userData'),'save-backups'));await saveBackups.load().catch(()=>scanWarnings.push('Save backup index could not be read. Existing backup files were kept.'));
  if(!smoke)try{const data=await readCache(path.join(app.getPath('userData'),'library-cache.json'));records=data.records;scannedAt=data.scannedAt||0;steamRoot=data.steamRoot;for(const [id,hero]of data.hero)heroCache.set(id,hero);cachedLibrary=records.length>0;}catch{}

  powerMonitor.on('suspend', () => tracker.suspend().catch(() => {}));
  powerMonitor.on('resume', () => tracker.resume());
  const updateSupport=!smoke&&app.isPackaged&&process.platform==='win32'&&await exists(path.join(process.resourcesPath,'app-update.yml'));
  updates=new OrbitUpdater({driver:updateSupport?require('electron-updater').autoUpdater:null,version:app.getVersion(),settings:()=>({...store.settings,autoUpdates:store.settings.autoUpdates&&!offline()}),beforeRestart:async()=>{await tracker.save();await saving;updatingRestart=true;},restartFailed:()=>{updatingRestart=false;},notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('updates:status',data);}});
  window = new BrowserWindow({ width: 1440, height: 960, minWidth: 940, minHeight: 680, show: false,
    icon:path.join(__dirname,'assets/orbit.png'),title: 'Orbit • Your games, together', backgroundColor: '#10151e', frame: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  if(!smoke){try{tray=attachTray({app,window,icon:path.join(__dirname,'assets/tray.png'),keepRunning:()=>store.settings.closeToTray!==false,isQuitting:()=>quitting||updatingRestart});}catch(error){console.error('System tray unavailable:',error.message);}}
  window.once('ready-to-show',()=>{if(smoke)return;if(process.argv.includes('--startup')&&store.settings.startMinimized){if(!tray){window.minimize();window.showInactive();}}else window.show();});
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  setupHandlers();
  const visualReady=smoke?new Promise(resolve=>window.once('ready-to-show',resolve)):null;
  await window.loadFile(path.join(__dirname, 'ui/index.html'));
  if(!smoke&&!offline())updates.start();
  if (smoke) {
    try {
      await visualReady;window.webContents.setBackgroundThrottling(false);
      const target=process.env.ORBIT_SMOKE_DIR||app.getPath('temp');await fs.mkdir(target,{recursive:true});await window.webContents.capturePage();await new Promise(r=>setTimeout(r,1050));await fs.writeFile(path.join(target,'orbit-startup.png'),(await window.webContents.capturePage()).toPNG());
      if(process.argv.includes('--visual-smoke'))window.showInactive();
      for (let i = 0; i < 150; i++) {
        if (await window.webContents.executeJavaScript('Boolean(window.orbitReady)')) break;
        await new Promise(r => setTimeout(r, 200));
      }
      const report = await window.webContents.executeJavaScript('window.runSmokeTests()');
      // Exercise real backup and restore IPC against the isolated smoke profile.
      const testBackup=path.join(target,'test-backup.json'),originalSave=dialog.showSaveDialog,originalOpen=dialog.showOpenDialog;
      await fs.mkdir(target,{recursive:true});
      try{
        dialog.showSaveDialog=async()=>({canceled:false,filePath:testBackup});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[testBackup]});
        const checks=await window.webContents.executeJavaScript(`(async()=>{
          const checks=[],check=(name,passed)=>checks.push({name,passed:Boolean(passed)}),g=state.games.find(g=>g.kind==='game'&&!g.robloxPlaceId);
          const ui=Object.fromEntries(['orbit-themes-v1','orbit-motion'].flatMap(k=>localStorage.getItem(k)?[[k,localStorage.getItem(k)]]:[]));
          check('full backup exports through real IPC',await window.orbit.backup(ui));
          const before=await window.orbit.collections();await window.orbit.saveCollection({name:'Smoke restore check'});
          if(g){await window.orbit.assignCollections({id:g.id,names:['Smoke restore check']});await window.orbit.saveLaunchProfile({id:g.id,value:{args:['--literal=a b'],controller:'couch',tools:[]}});check('launch profile and membership persist through IPC',(await window.orbit.launchProfile(g.id)).args[0]==='--literal=a b'&&(await window.orbit.details(g.id)).collections.includes('Smoke restore check'));}
          const preview=await window.orbit.previewRestore();check('backup restore preview contains settings and local hours',Number.isFinite(preview.hours)&&Number.isFinite(preview.preferences));
          const restored=await window.orbit.restore(ui);absorb(restored.library);check('backup restores original collections without test entries',JSON.stringify(await window.orbit.collections())===JSON.stringify(before));
          check('cleanup scans real library without changing files',Array.isArray(await window.orbit.cleanup()));
          await window.orbit.updateSettings({offlineMode:true});const local=await window.orbit.getLibrary();check('offline library keeps local games available',local.offline&&local.games.length>0);let blocked=false;try{await window.orbit.deals('US');}catch{blocked=true;}check('offline mode blocks online store requests',blocked);await window.orbit.updateSettings({offlineMode:false});absorb(await window.orbit.getLibrary());

          return checks;
        })()`);
        report.checks.push(...checks);report.passed&&=checks.every(c=>c.passed);
      }finally{dialog.showSaveDialog=originalSave;dialog.showOpenDialog=originalOpen;await fs.unlink(testBackup).catch(()=>{});}

      await new Promise(r => setTimeout(r, 2000));
      await window.webContents.executeJavaScript("motionEnabled=false;document.documentElement.classList.add('motion-off');document.getAnimations().forEach(a=>a.cancel());");
      await fs.mkdir(target, { recursive: true });
      await window.webContents.executeJavaScript("state.featured=state.games.filter(g=>g.storePlaytimeKnown&&g.lastPlayed).sort((a,b)=>b.lastPlayed-a.lastPlayed)[0]?.id||state.featured;render();");
      await new Promise(r=>setTimeout(r,400));
      await fs.writeFile(path.join(target, 'orbit-preview.png'), (await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript("state.list=true;render();document.querySelector('#game-grid').scrollIntoView({block:'start'});");await new Promise(r=>setTimeout(r,1500));
      await fs.writeFile(path.join(target,'orbit-list.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript("state.list=false;render();document.querySelector('#main-scroll').scrollTop=0;");

      await window.webContents.executeJavaScript("window.orbitFeatures.quickSearch();");await new Promise(r=>setTimeout(r,400));
      await fs.writeFile(path.join(target,'orbit-quick-launch.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript("closeModal();document.querySelector('#main-scroll').scrollTop=0;document.querySelector('#controller-view').click();document.querySelector('#main-scroll').scrollTop=0;");await new Promise(r=>setTimeout(r,400));
      await fs.writeFile(path.join(target,'orbit-controller-view.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript("document.querySelector('#controller-view').click();document.querySelector('#main-scroll').scrollTop=0;");

      await window.webContents.executeJavaScript(`document.querySelector('#downloads details')?.setAttribute('open','');document.querySelector('#steam-deals').open=true;`);
      await new Promise(r=>setTimeout(r,3500));
      await window.webContents.executeJavaScript(`document.querySelector('.library-utilities').scrollIntoView({block:'start'});`);
      await new Promise(r=>setTimeout(r,300));
      await fs.writeFile(path.join(target,'orbit-utilities.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript(`document.querySelector('#steam-deals').scrollIntoView({block:'start'});`);
      await new Promise(r=>setTimeout(r,5000));
      await fs.writeFile(path.join(target,'orbit-deals.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript(`document.querySelector('#downloads details')?.removeAttribute('open');document.querySelector('#steam-deals').open=false;document.querySelector('.content').scrollTop=0;`);

      const sample = library().find(g => g.title === 'Geometry Dash') || library().find(g => g.achievements?.total);
      if (sample) { await window.webContents.executeJavaScript(`showDetails(${JSON.stringify(sample.id)})`); await new Promise(r => setTimeout(r, 700)); await fs.writeFile(path.join(target, 'orbit-game-details.png'), (await window.webContents.capturePage()).toPNG()); }
      if(sample){
        await window.webContents.executeJavaScript("document.querySelector('[data-fps-estimate]')?.click();true");
        for(let i=0;i<85;i++){if(await window.webContents.executeJavaScript("!document.querySelector('[data-fps-estimate]')?.disabled"))break;await new Promise(r=>setTimeout(r,200));}
        const fpsReady=await window.webContents.executeJavaScript("document.querySelectorAll('[data-fps-kind=estimated]').length===16");report.checks.push({name:'hardware FPS button populates all sixteen cells through real IPC',passed:fpsReady});report.passed &&=fpsReady;
        await window.webContents.executeJavaScript("document.querySelector('.fps-panel')?.scrollIntoView({block:'center'});true");
        await fs.writeFile(path.join(target,'orbit-fps-estimates.png'),(await window.webContents.capturePage()).toPNG());
      }
      await fs.writeFile(path.join(target, 'smoke-report.json'), JSON.stringify({ ...report, entries: library().length, games: library().filter(g => g.kind === 'game').length, tools: library().filter(g => g.kind === 'tool').length,
        summaryPayloadBytes: Buffer.byteLength(JSON.stringify(snapshot())), installed: library().filter(g => g.installed).length,
        launcherReady: library().filter(g => g.launcherAvailable).length, playtimeAvailable: library().filter(g => g.playtimeKnown).length,
        achievementsAvailable: library().filter(g => g.achievements !== null).length, coverStatus, connections, warnings: scanWarnings }, null, 2));
      app.exit(report.passed ? 0 : 1);
    } catch (e) { console.error(e); app.exit(1); }
  }
});
app.on('window-all-closed', () => app.quit());

let quitting = false;
app.on('before-quit', event => { if (quitting) return; quitting = true; if(!tracker)return; event.preventDefault(); clearInterval(runningTimer);runningGames?.stop();updates?.stop();prepareExit().catch(console.error).finally(() => app.quit()); });
