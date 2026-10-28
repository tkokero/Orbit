if(process.argv.includes('--orbit-recorder')){if(require('electron').app.isPackaged)process.exit(1);require('./clips-worker.cjs');}else{
const accessibility=require('./accessibility.cjs'),{CustomArtwork}=require('./custom-artwork.cjs'),{SessionRecaps}=require('./session-recaps.cjs');let customArtwork;const recaps=new SessionRecaps();
const wishlist=require('./wishlist.cjs'),portableReports=require('./portable-reports.cjs');let checkingWishlist=false;const stagedDiagnostics=new Map();
const {BackupScheduler}=require('./backup-scheduler.cjs'),{DownloadCenter}=require('./download-center.cjs'),libraryFilters=require('./ui/library-filters.js');
let backupScheduler,downloadCenter;
const collectionState=require('./collection-state.cjs'),collectionRules=require('./ui/smart-collections.js');
const {StorageManager}=require('./storage-manager.cjs');
const {BulkLibrary}=require('./library-bulk.cjs');
const bulkLibrary=new BulkLibrary({store:()=>store,games:()=>library(),save:()=>save(),invalidate:()=>{mergedCache=null;}});
const {GameNews,steamId:newsSteamId}=require('./game-news.cjs');
const gameNews=new GameNews();let gameStorage,releaseCalendar;
const newsArticle=post=>require('./news-content.cjs').article(post.content||post.summary,{baseUrl:post.url});
const {ReleaseCalendar}=require('./release-calendar.cjs');
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, clipboard, powerMonitor, safeStorage, Notification, net, session, desktopCapturer, globalShortcut } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { Worker } = require('node:worker_threads');
const { exists } = require('./discovery.cjs');
const {retainedRecords}=require('./mod-tools.cjs');
const {OrbitUpdater,installerDestination}=require('./updater.cjs');
const {UpdateRestart,readyForUpdate,backgroundRestart}=require('./update-restart.cjs');
let updates,exitPreparation,updatingRestart=false,updateRestart,updateLaunch={resume:false,background:false};
const { mergeLibrary, compactRecords, importRecords, actionFor, STORES, parseVdf } = require('./library.cjs');
const { cacheCovers, cacheHero, downloadImage } = require('./artwork.cjs');
const { connectSteam } = require('./accounts.cjs');
const { PlaytimeTracker, nativePlaytime } = require('./playtime.cjs');
const { entryMenu, backgroundMenu, templateFor } = require('./context-menu.cjs');
const { LibraryMonitor, watchFolders, installationProgress } = require('./library-monitor.cjs');
const {SteamFriends,SocialCredentials,providers,socialClientUrl,friendProfileUrl}=require('./social.cjs');
const {developmentFriendsEnabled,DiscordSdkBridge,DiscordFriends,combinedFriends}=require('./social-discord.cjs');
const {DiscordReadOnlyBridge}=require('./discord-friends-ipc.cjs');
let discordFriends;
const {libraryEntries:robloxLibraryEntries,experienceEntry,launchExperience,RobloxImages}=require('./roblox.cjs');
const robloxImages=new RobloxImages();
const {storeDestination}=require('./installers.cjs');
const {InstallationManager,installerUrl,installerName}=require('./installation-manager.cjs');let installations;let clips;
const {SteamBridge}=require('./steam-bridge.cjs');const steamBridge=new SteamBridge({root:()=>steamRoot});
const {StoreService}=require('./store-service.cjs');
const {DownloadEstimator}=require('./download-estimator.cjs');
const {estimateHardware,referenceFor}=require('./hardware-fps.cjs');
const storeService=new StoreService(),downloadEstimator=new DownloadEstimator();
let social, socialVault, steamFriendHint='',accountRevision=0;
let tracker, monitor, rescanTimer;
const { validate:validateTheme } = require('./ui/themes.js');
const {readCache,writeCache}=require('./library-cache.cjs');
const {SaveBackups}=require('./save-backups.cjs');
const {diagnose,healthReport}=require('./launch-health.cjs');
const {ActivityHistory}=require('./activity-history.cjs');
const {personal}=require('./personal.cjs');
let history,lastCachePrune=0;
const {cacheUsage,trimImageCaches}=require('./cache-storage.cjs');
const {readNotices}=require('./license-notices.cjs');
const imageReferences=()=>[...records.flatMap(r=>[r.cover,r.hero]),...heroCache.values()];
let saveBackups,cachedLibrary=false,initialLibrary=true;
const offline=()=>Boolean(store?.settings?.offlineMode)||!net.isOnline();
const libraryTools=require('./library-tools.cjs');
const {RunningGames}=require('./running-games.cjs');
let themeIcon;let discordPresence,discordSleeping=false,startupMedia,uiPreferences;const profilePreferences=require('./profile-preferences.cjs');
let runningGames,runningTimer,handoffProbe,handoffProbeBusy=false,stagedBackup,cleanupPreview=[],controllerHandoff=null,scheduleRunningPoll=null,couchFullscreenBefore=null;
let installationNotifications;
function installationNotices(){
 return installationNotifications||=new (require('./installation-notifications.cjs').InstallationNotifications)({Notification,folder:path.join(app.getPath('userData'),'notification-artwork'),enabled:()=>!smoke&&store.settings.downloadNotifications===true,getGame:id=>library().find(g=>g.id===id||g.versions?.some(v=>v.id===id)),getIcon:()=>{const icon=themeIcon?.startupIcon;return icon?{image:icon.image,file:icon.ico.replace(/\.ico$/,'.png')}:null;},getArtwork:g=>[g.hero,heroCache.get(g.id),...(g.versions||[]).flatMap(v=>v.heroCandidates||[])],openGame:async({id})=>{const w=await openMainWindow();if(w.isDestroyed())return;if(w.isMinimized())w.restore();w.show();w.focus();await w.webContents.executeJavaScript('window.orbitTrayActions.run('+JSON.stringify({type:'details',id})+')');},log:error=>console.error('Installation notification:',String(error?.message||error||'Unavailable'))});
}
const settingsDefaults={confirmGameClose:true,confirmForceClose:true,lowMemoryRendering:false,offlineMode:false,downloadNotifications:true,autoDiscover:true,startMinimized:false,minimizeOnPlay:false,closeToTray:true,autoLoadFriends:true,refreshFriends:true,autoUpdates:true,restartForUpdates:true,sessionRecaps:true,recordHistory:true,localPlaytime:true,rememberAccounts:true,autoConnectAccounts:true};
const {attachTray}=require('./tray.cjs');
let tray,windowCreating,windowLayout,windowSleeping=false,windowBootstrapCached=false;
let manualRestart;
const {idleRenderer}=require('./renderer-idle.cjs');
const shortcuts=require('./desktop-shortcuts.cjs');
const smoke = process.argv.includes('--smoke-test');
const {LoginStartup,STARTUP_NAME,backgroundInstance,startupWindowAction,desktopLaunch,migrateDesktopStartup,startupQuery}=require('./login-startup.cjs');
let desktopStartupMigrated=false;
const loginStartup=new LoginStartup({app,smoke});
const backgroundChecks=smoke&&!process.argv.includes('--interactive-checks');
const checkWindows=[];
if(backgroundChecks)app.on('browser-window-created',(_event,w)=>checkWindows.push({window:w,state:require('./background-checks.cjs').protectWindow(w)}));
const devDebug=require('./dev-debug.cjs'),debugEnabled=devDebug.enabled({isPackaged:app.isPackaged,args:process.argv}),debugLog=new devDebug.DebugLog(debugEnabled);
if(debugEnabled&&!smoke){const profile=path.join(app.getPath('appData'),'Orbit-Dev');require('node:fs').mkdirSync(profile,{recursive:true});app.setPath('userData',profile);}
const memorySmoke=smoke&&process.argv.includes('--memory-smoke');
const renderingFile=()=>path.join(app.getPath('userData'),'rendering.json');
const lowMemoryApplied=smoke?!process.argv.includes('--hardware-rendering'):require('./rendering-mode.cjs').readLowMemory(renderingFile());
if(lowMemoryApplied)app.disableHardwareAcceleration();
let shortcutRequest;try{shortcutRequest=shortcuts.parseRequest(process.argv);}catch(error){shortcutRequest={requested:true,error:error.message};}
let launchReadyResolve;const launchReady=new Promise(resolve=>launchReadyResolve=resolve);
let lastShortcutResult;
const primaryInstance=smoke||app.requestSingleInstanceLock();
if(!primaryInstance)app.quit();
app.on('second-instance',(_event,args)=>{if(backgroundInstance(args))return;let request;try{request=shortcuts.parseRequest(args);}catch(error){dialog.showErrorBox('Invalid game shortcut',error.message);return;}if(request.requested){dispatchShortcut(request.id).catch(error=>dialog.showErrorBox('Could not launch game',error.message+'\nOpen Orbit to repair this entry.'));return;}openMainWindow().then(async w=>{if(desktopLaunch(args)){await uiPreferences?.set('orbit-couch','off');await w.webContents.executeJavaScript("localStorage.setItem('orbit-couch','off');window.orbitFeatures?.setCouch(false)");}if(w.isMinimized())w.restore();w.show();w.focus();}).catch(console.error);});
if (smoke) app.setPath('userData',process.argv.includes('--fresh-profile-smoke')?path.join(process.env.ORBIT_SMOKE_DIR||app.getPath('temp'),'fresh-profile'):path.join(app.getPath('temp'),'orbit-smoke-test'));
let window, store, records = [], scanWarnings = [], scannedAt = 0, scanning, connections = [], coverStatus = {}, steamRoot, accountSynced = false;
let mergedCache = null;
const heroCache = new Map();
const defaults = () => ({ version: 1, preferences: {}, imports: [], remembered: [], steamId: '', settings:{...settingsDefaults,...(debugEnabled?{autoConnectAccounts:false,autoLoadFriends:false,autoUpdates:false,restartForUpdates:false}:{})} });
const dataPath = () => path.join(app.getPath('userData'), 'library.json');
let saving = Promise.resolve();
async function save() {
  discordPresence?.setSessions((runningGames?.snapshot()||[]).map(row=>({...row,hidden:store.preferences[row.id]?.hidden===true})));
  const payload = JSON.stringify(store, null, 2);
  saving = saving.catch(() => {}).then(async () => {
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    await profilePreferences.writeJson(dataPath(),JSON.parse(payload),d=>Array.isArray(d.imports)&&Array.isArray(d.remembered)&&d.preferences&&typeof d.preferences==='object');
  });
  return saving;
}
function baseLibrary(){return mergedCache ||= mergeLibrary([...records,...robloxLibraryEntries(store.roblox,records)],store.preferences);}
function library(){return baseLibrary().map(game=>{const g=tracker&&!game.robloxPlaceId?tracker.decorate(game):game;if(!customArtwork?.entries[g.id])return g;return {...g,cover:customArtwork.url(g.id,'cover')||g.cover,hero:customArtwork.url(g.id,'hero')||g.hero};});}

function snapshot() {
  const games = library();
  return { games: games.map(g => ({ id: g.id, title: g.title,newsSupported:Boolean(newsSteamId(g)),ownership:g.ownership,launchRoute:g.launchRoute,selectedInstalled:g.selectedInstalled,robloxPlaceId:g.robloxPlaceId, kind: g.kind, installed: g.installed, launcherAvailable: g.launcherAvailable, directLaunchAvailable:g.directLaunchAvailable, installationProgress:g.installationProgress,
    addedAt:store.addedAt?.[g.id]||null,sizeBytes:g.sizeBytes,selected: g.selected, sources: g.sources, collections:store.preferences[g.id]?.collections||[], aliases:store.preferences[g.id]?.aliases||[],tags:store.preferences[g.id]?.tags||[],metadata:store.preferences[g.id]?.metadata||null, cover: g.cover, hero: customArtwork?.url(g.id,'hero')||heroCache.get(g.id), favorite: g.favorite, hidden: g.hidden,
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
      offline:offline(),cachedRecords:records,artworkFolder: path.join(app.getPath('userData'), 'artwork'), forceImages,discovery,captureDiscovery:!smoke&&!accountSynced&&store.settings.autoConnectAccounts
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
    if (!smoke && !offline() && !accountSynced && store.settings.autoConnectAccounts && store.settings.rememberAccounts) {
      accountSynced = true;
      store.steamConnected = false;
      try { const revision=accountRevision,account = await connectSteam({ parent: window, persistent:store.settings.rememberAccounts, steamRoot }); if (account&&revision===accountRevision) { upsert(account.records); store.steamConnected = true; store.steamUnresolved = account.unresolved.length; result = await scanInWorker(forceImages,result.discovery); } }
      catch (e) { result.warnings.push(e.message); }
    }
    const memory = retainedRecords(store.remembered).map(g => ({ ...g, installed: false }));
    records = result.records;cachedLibrary=false;
    for(const r of records)if(r.origin==='scan')r.installationProgress=downloadEstimator.observe(r.id,r.installationProgress);
    mergedCache = null;
    collectionState.observeAdded(store,library());
    coverStatus = result.coverStatus;
    if(!offline())heroCache.clear();
    if (result.featuredId&&result.hero) heroCache.set(result.featuredId, result.hero);
    connections = result.statuses;
    if (store.steamConnected) {
      const steam = connections.find(c => c.source === 'Steam');
      if (steam) steam.status = `Steam web account connected${store.steamUnresolved ? ` · ${store.steamUnresolved} titles need metadata` : ''}; local play stats retained for confirmed games`;
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
    if(downloadCenter?.observe(library()))store.downloadHistory=downloadCenter.history;
    await save();
    if(!smoke){const file=path.join(app.getPath('userData'),'library-cache.json');await writeCache(file,{records,scannedAt,steamRoot,hero:[...heroCache]});}
    await configureMonitor();
    if(!smoke&&Date.now()-lastCachePrune>6*60*60*1000){lastCachePrune=Date.now();const task=setTimeout(()=>trimImageCaches(app.getPath('userData'),imageReferences()).catch(()=>{}),5000);task.unref();}
    await tracker.resumeAfterUpdate(library(),{final:true});
    for (const g of library()) if (nativePlaytime(g) || g.kind !== 'game') { if (tracker.ledger.sessions.has(g.id) || tracker.pending.has(g.id)) await tracker.stop(g.id); }
    if(!smoke)runningGames?.scan().catch(()=>{});
    return snapshot();
  })();
  try { return await scanning; } finally { scanning = null; }
}
function handle(name, fn) {
  ipcMain.handle(name, async (event, ...args) => {
    if (!window||window.isDestroyed()||event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new Error('Untrusted caller.');
    const debugStarted=debugEnabled?performance.now():0;let debugFailed=false;
    try {
      if(name.startsWith('clips:'))devDebug.requireAccess(debugEnabled||smoke);
      if(offline()&&['steam:connect','steam:sync','epic:sync','social:connect-steam','social:connect-discord','store:deals','system:check','library:repair-images','game:repair-image','updates:check'].includes(name))throw Error('This feature needs a connection. Turn off Offline mode in Settings when you are ready.');
      if(offline()&&['social:refresh'].includes(name))return {ok:true,data:socialSnapshot()};
      if(offline()&&['store:icon','roblox:icon','social:image','game:achievement-image'].includes(name))return {ok:true,data:null};
      return { ok: true, data: await fn(...args) };
    }
    catch (e) { debugFailed=true;return { ok: false, error: e.message || 'Something went wrong.' }; }
    finally{if(debugEnabled&&!name.startsWith('debug:'))debugLog.record('ipc',name,{ms:performance.now()-debugStarted,ok:!debugFailed});}
  });
}
async function runDesktopValidation(report,target){
  window.webContents.setBackgroundThrottling(false);window.show();window.focus();
  await window.webContents.executeJavaScript("Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[]})");
  const checks=await window.webContents.executeJavaScript(await fs.readFile(path.join(__dirname,'ui','desktop-smoke.js'),'utf8'));
  report.checks.push(...checks);report.passed&&=checks.every(c=>c.passed);report.desktopPerformance=await window.webContents.executeJavaScript('window.__desktopSmokeMetrics');
  const capture=async(name,script)=>{await window.webContents.executeJavaScript(script);await new Promise(r=>setTimeout(r,350));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,200));await fs.writeFile(path.join(target,name),(await window.webContents.capturePage()).toPNG());};
  for(const [width,height]of [[2559,1439],[1920,1080],[1280,800],[940,720]]){
    window.setSize(width,height);
    await capture('desktop-library-'+width+'.png',"document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitFeatures.setCouch(false);orbitShell.activate('library');document.querySelector('#main-scroll').scrollTop=0");
    const layoutChecks=await window.webContents.executeJavaScript(`(()=>{const main=document.querySelector('#main-scroll').getBoundingClientRect(),content=document.querySelector('#library-panel').getBoundingClientRect(),toolbar=document.querySelector('main>.toolbar').getBoundingClientRect(),card=document.querySelector('.game-grid:not(.list) .cover-wrap');return [{name:'desktop content and header center at ${width}px',passed:Math.abs(content.left+content.width/2-main.left-main.width/2)<2&&Math.abs(toolbar.left-content.left)<1&&Math.abs(toolbar.width-content.width)<1},{name:'larger game artwork fits at ${width}px',passed:(!card||card.offsetWidth>=175)&&document.querySelector('#library-panel').scrollWidth<=content.width+1}];})()`);report.checks.push(...layoutChecks);report.passed&&=layoutChecks.every(c=>c.passed);
    if(width===1920){await capture('desktop-library-covers.png',"document.querySelector('.library-collections').scrollIntoView({block:'start',behavior:'instant'})");await capture('desktop-news-crops.png',"document.querySelector('#news-shelf').scrollIntoView({block:'start',behavior:'instant'})");}
    await capture('desktop-settings-'+width+'.png','showSettings()');
    const check=await window.webContents.executeJavaScript(`(()=>{const d=document.querySelector('#modal'),rect=d.getBoundingClientRect();return {name:'desktop settings center and fit ${width}px without horizontal overflow',passed:Math.abs(rect.left+rect.width/2-innerWidth/2)<2&&d.scrollWidth<=d.clientWidth+1&&document.querySelector('#modal-body').scrollWidth<=document.querySelector('#modal-body').clientWidth+1};})()`);report.checks.push(check);report.passed&&=check.passed;
  }
  window.setSize(1440,960);
  await capture('desktop-launch-settings.png',"orbitFeatures.editProfile(state.games.find(g=>g.installed&&g.kind==='game'))");
  await capture('desktop-launch-dropdown.png',"document.querySelector('#profile-mode').nextElementSibling.click()");
  await capture('desktop-storage.png',"OrbitDesktop.closeSelect();closeModal();orbitExtras.storage()");
  const storageBannerCheck=await window.webContents.executeJavaScript(`(()=>{const art=[...document.querySelectorAll('.storage-game-art')].slice(0,4);return {name:'storage banners have a consistent compact footprint',passed:art.length>0&&art.every(figure=>Math.abs(figure.offsetWidth-128)<1&&Math.abs(figure.offsetHeight-72)<1)};})()`);report.checks.push(storageBannerCheck);report.passed&&=storageBannerCheck.passed;
  await capture('desktop-game-details.png',"showDetails(state.games.find(g=>g.installed&&g.kind==='game').id)");
  await capture('desktop-game-options.png',"document.querySelector('.simple-game-options>summary').click();document.querySelector('.simple-game-options').scrollIntoView({block:'start',behavior:'instant'})");
  await capture('desktop-add-game.png',"showAdd()");
  await capture('desktop-appearance-editor.png',"showSettings();document.querySelector('#tab-appearance').click();document.querySelector('#theme-editor').open=true;document.querySelector('#theme-editor').scrollIntoView({block:'start',behavior:'instant'})");
  await capture('desktop-downloads.png',"closeModal();orbitShell.activate('downloads')");
  for(const [width,height]of [[1920,1080],[940,720]]){window.setSize(width,height);await capture('desktop-downloads-'+width+'.png',"document.querySelector('#main-scroll').scrollTop=0");const check=await window.webContents.executeJavaScript(`(()=>{const page=document.querySelector('#workspace-page'),rows=[...page.querySelectorAll('.download-center-row')];return {name:'download artwork cards fit ${width}px without clipping controls',passed:page.scrollWidth<=page.clientWidth+1&&rows.length>0&&rows.every(row=>{const r=row.getBoundingClientRect(),action=row.querySelector('[data-transfer-actions]').getBoundingClientRect();return action.right<=r.right+1&&row.scrollWidth<=row.clientWidth+1;})};})()`);report.checks.push(check);report.passed&&=check.passed;}window.setSize(1440,960);
  await capture('desktop-friends.png',"orbitShell.activate('friends')");
  await capture('desktop-radar.png',"orbitShell.activate('store')");
  for(const workspace of ['downloads','friends','store']){await window.webContents.executeJavaScript('orbitShell.activate('+JSON.stringify(workspace)+')');await new Promise(r=>setTimeout(r,150));const check=await window.webContents.executeJavaScript(`(()=>{const main=document.querySelector('#main-scroll').getBoundingClientRect(),content=[...document.querySelectorAll('main>.content')].find(el=>!el.hidden&&el.offsetWidth)?.getBoundingClientRect();return {name:'desktop ${workspace} centers in the available canvas',passed:Boolean(content)&&Math.abs(content.left+content.width/2-main.left-main.width/2)<2};})()`);report.checks.push(check);report.passed&&=check.passed;}
  for(const theme of ['cloud','dark']){await capture('desktop-theme-'+theme+'.png',"(()=>{const t=allThemes().find(t=>t.id==="+JSON.stringify(theme)+");if(t)OrbitTheme.apply(t,document.documentElement);orbitShell.activate('library');})()");}
  await window.webContents.executeJavaScript("OrbitTheme.apply(selectedTheme(),document.documentElement);orbitShell.activate('library');orbitFeatures.setCouch(true);orbitFeatures.editProfile(state.games.find(g=>g.installed&&g.kind==='game'))");await new Promise(r=>setTimeout(r,450));await fs.writeFile(path.join(target,'controller-launch-settings.png'),(await window.webContents.capturePage()).toPNG());
  await window.webContents.executeJavaScript("document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitFeatures.setCouch(false)");
}
async function runFlowValidation(report,target){const game=library().find(g=>newsSteamId(g));return require('./flow-validation.cjs')({window,report,target,gameNews,game,appId:newsSteamId(game),uiPreferences});}
async function runControllerValidation(report,target){
      window.webContents.setBackgroundThrottling(false);window.show();window.focus();
      await window.webContents.executeJavaScript("Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[]})");
      const couchChecks=await window.webContents.executeJavaScript(await fs.readFile(path.join(__dirname,'ui','controller-smoke.js'),'utf8'));report.checks.push(...couchChecks);report.passed&&=couchChecks.every(c=>c.passed);report.controllerPerformance=await window.webContents.executeJavaScript('window.__controllerSmokeMetrics');report.gpuFeatures=app.getGPUFeatureStatus();
      for(const [name,script] of [["orbit-controller-home.png", "OrbitCouch.act('home')"], ["orbit-controller-library.png", "OrbitCouch.act('library')"], ["orbit-controller-settings.png", "OrbitCouch.act('settings');document.querySelector('[data-settings-category=controls]')?.click()"], ["orbit-controller-sound.png", "document.querySelector('[data-settings-category=sound]').click()"], ["orbit-controller-sidebar.png", "OrbitCouch.act('home');OrbitCouch.openMenu()"], ["orbit-controller-game-page.png", "OrbitCouch.closeMenu();OrbitCouchGame.show(OrbitCouch.selectedId)"], ["orbit-controller-activity.png", "document.querySelector('[data-game-tab=activity]').click()"], ["orbit-controller-controls.png", "document.querySelector('[data-game-tab=controls]').click()"], ["orbit-controller-context.png", "document.querySelectorAll('dialog[open]').forEach(d=>d.close());OrbitCouchGame.menu(OrbitCouch.selectedId)"], ["orbit-controller-downloads.png", "document.querySelectorAll('dialog[open]').forEach(d=>d.close());(()=>{const games=state.games.filter(g=>g.installed);OrbitControllerPages.previewDownloads({items:games.slice(0,3).map((g,i)=>({id:g.id,versionId:g.versions?.[0]?.id,title:g.title,source:'Steam',appId:10+i,progress:{phase:i?'Queued':'Download',active:!i,percent:i?0:23.4,done:i?0:1024**3,total:4*1024**3,bytesPerSecond:i?0:5*1024**2}})),native:[],rate:5*1024**2});})()"], ["orbit-controller-download-play.png", "OrbitCouch.act('download-play')"], ["orbit-controller-shuffle.png", "OrbitCouch.act('shuffle')"], ["orbit-controller-shelves.png", "OrbitCouch.act('shelves')"], ["orbit-controller-guest.png", "OrbitCouch.act('guest')"], ["orbit-controller-display.png", "OrbitCouch.act('fullscreen')"], ["orbit-controller-wheel.png", "OrbitCouch.act('wheel')"]]){await window.webContents.executeJavaScript(script);await new Promise(r=>setTimeout(r,450));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,400));await fs.writeFile(path.join(target,name),(await window.webContents.capturePage()).toPNG());}
      await window.webContents.executeJavaScript('document.querySelectorAll("dialog[open]").forEach(d=>d.close());OrbitCouch.act("home");window.__arrivalSound=localStorage.getItem("orbit-startup-sound");localStorage.setItem("orbit-startup-sound","off")');
      for(const scene of ['relay','bloom','jump']){await window.webContents.executeJavaScript('OrbitCouch.previewEntry('+JSON.stringify(scene)+')');await new Promise(r=>setTimeout(r,1100));await fs.writeFile(path.join(target,'orbit-controller-arrival-'+scene+'.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('OrbitCouch.skipEntry()');await new Promise(r=>setTimeout(r,220));}
      await window.webContents.executeJavaScript('if(window.__arrivalSound===null)localStorage.removeItem("orbit-startup-sound");else localStorage.setItem("orbit-startup-sound",window.__arrivalSound)');
      await window.webContents.executeJavaScript('document.querySelectorAll("dialog[open]").forEach(d=>d.close());orbitFeatures.setCouch(false);if(window.__restoreControllerSound)OrbitControllerSound.save(window.__restoreControllerSound)');
}
function gameById(id) {
  const game = library().find(g => g.id === id);
  if (!game) throw new Error('Game no longer found. Refresh your library.');
  return {...game,versions:game.versions.map(v=>({...v,launchRoute:require('./launch-routing.cjs').route(v)})),notes:store.preferences[id]?.notes||'',aliases:store.preferences[id]?.aliases||[],tags:store.preferences[id]?.tags||[],metadata:store.preferences[id]?.metadata||null};
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
function settingsSnapshot(){return {...settingsDefaults,...store.settings,renderingRestartRequired:store.settings.lowMemoryRendering!==lowMemoryApplied,interfaceRecovery:uiPreferences?.recovery?.message||'',...loginStartup.snapshot(store.settings)};}
async function configureMonitor(){
  monitor?.close();if(smoke||!store.settings.autoDiscover){clearTimeout(rescanTimer);rescanTimer=null;return;}
  monitor ||= new LibraryMonitor(async events=>{
    let rescan=false,changed=false;
    for(const event of events){
      if(!/^appmanifest_\d+\.acf$/i.test(event.name)){rescan=true;continue;}
      const id='steam:'+event.name.match(/\d+/)[0],filename=path.join(event.folder,event.name);
      try{const appState=parseVdf(await fs.readFile(filename,'utf8')).AppState;
        const matches=records.filter(r=>r.id===id&&(!r.manifestFile||path.resolve(r.manifestFile).toLowerCase()===path.resolve(filename).toLowerCase()));if(!matches.length){rescan=true;continue;}if(!matches.some(r=>r.origin==='scan'))rescan=true;
        const progress=downloadEstimator.observe(id,installationProgress(appState));
        const installed=Boolean(Number(appState.StateFlags)&4)&&Boolean(appState.installdir)&&await exists(path.join(event.folder,'common',appState.installdir));
        const completed=matches.some(r=>libraryTools.completedDownload(r.installationProgress,progress,appState,installed));if(completed&&downloadCenter?.confirm(id)){store.downloadHistory=downloadCenter.history;save().catch(()=>{});}
        if(completed&&store.settings.downloadNotifications&&!smoke)void installationNotices().show({id,title:matches[0].title,source:'Steam',updated:matches.some(r=>r.installed)}).catch(error=>console.error('Installation notification:',error.message));
        for(const r of matches){if(r.origin==='scan'){if(r.installed!==installed)rescan=true;r.installed=installed;}r.installationProgress=progress;}changed=true;
      }catch{rescan=true;}
    }
    if(changed){mergedCache=null;if(downloadCenter?.observe(library())){store.downloadHistory=downloadCenter.history;save().catch(()=>{});}if(window&&!window.isDestroyed())window.webContents.send('installation:update',library().map(g=>({id:g.id,installationProgress:g.installationProgress})));}
    if(rescan&&!rescanTimer)rescanTimer=setTimeout(()=>{rescanTimer=null;refresh().then(data=>{if(window&&!window.isDestroyed())window.webContents.send('library:update',data);}).catch(()=>{});},6000);
  });
  monitor.start(await watchFolders(steamRoot,parseVdf));
}
function socialSnapshot(){const steam=social.snapshot(),discord=discordFriends?.snapshot();return {...combinedFriends(steam,discord),providers:providers(steam,discord),steamIdHint:steam.steamId||store.steamId||steamFriendHint||'',secureStorageAvailable:safeStorage.isEncryptionAvailable()};}
function publishRoblox(){mergedCache=null;if(window&&!window.isDestroyed())window.webContents.send('library:update',snapshot());}
async function openRobloxExperience({id,browser=false}={}){
 const entry=store.roblox?.games.find(g=>g.id===String(id));if(!entry)throw new Error('Save this experience first.');const mode=browser?'browser':store.roblox.mode,url=launchExperience(entry,mode);
 if(!smoke)try{await shell.openExternal(url);}catch{await shell.openExternal(launchExperience(entry,'browser'));}
 entry.lastOpened=Date.now();await save();publishRoblox();
 return {action:smoke?{type:'url',value:url}:undefined,message:mode==='app'?'Opening '+entry.title+' in Roblox. If it does not start, use Open page.':'Opening '+entry.title+' on Roblox. Choose Play on its page to join.'};
}
async function prepareExit(){
 if(!exitPreparation)exitPreparation=(async()=>{if(backgroundChecks){const states=checkWindows.map(({window:w,state})=>({...state,visible:!w.isDestroyed()&&w.isVisible(),focusedNow:!w.isDestroyed()&&w.isFocused()})),passed=states.every(s=>!s.shown&&!s.focused&&!s.visible&&!s.focusedNow),target=process.env.ORBIT_SMOKE_DIR||app.getPath('temp');await fs.mkdir(target,{recursive:true});await fs.writeFile(path.join(target,'background-checks.json'),JSON.stringify({passed,offscreen:true,windows:states},null,2));if(!passed)throw Error('Background validation activated a native window.');}backupScheduler?.stop();releaseCalendar?.stop();await clips?.stop();await installations?.stop();gameStorage?.cancel();await discordPresence?.stop();await customArtwork?.operation?.catch(()=>{});await startupMedia?.close();await saveBackups?.operation?.catch(()=>{});monitor?.close();clearTimeout(rescanTimer);social?.disconnect();discordFriends?.stop();await tracker?.shutdown({restart:updatingRestart});await history?.finish({restart:true});await saving;await uiPreferences?.queue;})();
 return exitPreparation;
}
async function restartOrbit(){
 const {AppRestart,restartArguments}=require('./app-restart.cjs');
 manualRestart||=new AppRestart({app,args:restartArguments({packaged:app.isPackaged,appPath:app.getAppPath(),debug:debugEnabled}),canRestart:async()=>!quitting&&!updatingRestart&&!clips?.child&&!clips?.saving&&![...(installations?.jobs?.values()||[])].some(job=>job.phase==='Downloading')&&await readyForUpdate({window,customArtwork,startupMedia,saveBackups,backupScheduler}),prepare:async()=>{await saving;await uiPreferences?.queue;await save();await tracker.checkpoint();await updateRestart.save(false);},setRestarting:value=>{if(value&&(quitting||updatingRestart))throw Error('Orbit is already restarting.');updatingRestart=value;},clear:()=>updateRestart.clear()});
 try{await manualRestart.restart();}catch(error){dialog.showErrorBox('Could not restart Orbit',error.message);}
}
  const steamModes=new (require('./steam-modes.cjs').SteamModes)();
  async function launchEntry(id,withTools=true,modeId,controller=false) {
    const game = gameById(id), base = game.versions[0], profile=libraryTools.profile(store.preferences[id]?.profile);
    const version=profile.executable?{...base,installed:true,executable:profile.executable,location:path.dirname(profile.executable),launch:undefined,directLaunch:undefined,shortcut:undefined,windowsAppId:undefined,launcherAvailable:false}:base;
    if(version.robloxPlaceId)return openRobloxExperience({id:version.robloxPlaceId});
    if (version.installed && !version.launch && !version.executable && !version.directLaunch && !version.windowsAppId) throw new Error('Choose this game’s executable using “Locate executable” first.');
    // Recheck availability in case a drive disappeared since scanning.
    if (version.installed && version.location && !await exists(version.location)) throw new Error('The game drive or folder is unavailable. Reconnect it and refresh.');
    let selectedMode=null;
    const requestedMode=modeId??profile.launchChoice;
    if(!profile.executable&&requestedMode&&requestedMode!=='ask'&&requestedMode!=='steam'){
      selectedMode=(await steamModes.get(version,steamRoot)).find(m=>version.id+':'+m.id===requestedMode);
      if(!selectedMode)throw Error('This launch mode is no longer available. Open Launch settings and choose Ask each time.');
    }
    const steamAction=selectedMode?null:await require('./steam-launch.cjs').steamAction(version,profile.args,steamRoot,exists);
    const action = selectedMode?{type:'exe',value:selectedMode.executable,args:selectedMode.args,cwd:selectedMode.cwd,env:{SteamAppId:String(version.appId),SteamGameId:String(version.appId)}}:steamAction || actionFor(version);
    if(profile.args.length&&!steamAction){if(action.type!=='exe')throw Error('Launch options need a Steam game or an executable launch.');action.args=[...(action.args||[]),...profile.args];}
    if(withTools&&!smoke&&(version.installed||version.directLaunchAvailable))for(const tool of profile.tools){if(gameById(tool).kind!=='tool')throw Error('A supporting tool is no longer available. Update launch settings.');await launchEntry(tool,false,undefined,controller);}
    if (!smoke) {
      if(selectedMode){
        const steam=steamRoot&&path.join(steamRoot,'steam.exe');if(!steam||!await exists(steam))throw Error('Steam is required for this game. Refresh the library.');
        const active=await require('./playtime.cjs').findProcesses(['steam.exe']);
        if(!active.length){await new Promise((resolve,reject)=>{const child=spawn(steam,['-silent'],{detached:true,stdio:'ignore',shell:false,windowsHide:true});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});});await new Promise(r=>setTimeout(r,2000));}
        if(require('./playtime.cjs').safeGameExe(selectedMode.executable)){const previous=tracker.configs[id]?.executables||[];tracker.configs[id]={executables:[...new Set([...previous,selectedMode.executable])].slice(-12)};await tracker.save();}
      }
      if(action.type==='windows-app')await new Promise((resolve,reject)=>{const child=spawn(path.join(process.env.SystemRoot||'C:/Windows','explorer.exe'),['shell:AppsFolder\\'+action.value],{detached:true,stdio:'ignore',shell:false});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});});
      else if (action.type === 'url') await shell.openExternal(action.value);
      else if (action.type === 'shortcut') { const error = await shell.openPath(action.value); if (error) throw new Error(error); }
      else await require('./game-process.cjs').launchGameProcess(action);
    }
    if ((version.installed || version.launcherAvailable) && !smoke) { store.preferences[id] = { ...store.preferences[id], lastOpened: Date.now() }; await save(); if(!shortcutRequest.requested&&store.settings.localPlaytime)tracker.watch(profile.executable?{...game,versions:[version]}:game).catch(() => {}); if(store.settings.minimizeOnPlay&&!controller)window?.minimize(); }
    return { message: version.installed || version.launcherAvailable ? `Opening ${game.title} via ${version.source}` : `Opening ${version.source} to install ${game.title}`, controller:profile.controller, action: smoke ? action : undefined };
  }
async function dispatchShortcut(id){
  await launchReady;
  if(!library().some(g=>g.id===id)){
    const discovered=await require('./discovery.cjs').discover();
    const imported=await Promise.all(store.imports.map(async r=>({...r,installed:Boolean(r.executable&&await exists(r.executable))})));
    records=[...discovered.records,...imported,...store.remembered.map(r=>({...r,installed:false}))];mergedCache=null;
  }
  const game=gameById(id),p=store.preferences[id]?.profile;
  if(!game.robloxPlaceId&&!game.installed&&!game.launcherAvailable&&!game.directLaunchAvailable&&!p?.executable)throw Error('No installed copy is available. Open Orbit to install or locate the game.');
  lastShortcutResult=await launchEntry(id);return lastShortcutResult;
}
async function createDesktopShortcut(id){
  if(process.platform!=='win32')throw Error('Desktop shortcuts are currently available on Windows.');
  const g=gameById(id),p=store.preferences[id]?.profile;
  if(!g.robloxPlaceId&&!g.installed&&!g.launcherAvailable&&!g.directLaunchAvailable&&!p?.executable)throw Error('Install this game or locate its executable first.');
  let icon=g.versions.flatMap(v=>[...(v.gameExecutables||[]),v.executable]).find(file=>file&&require('node:fs').existsSync(file));
  if(!icon)try{
    let source=g.cover;
    if(g.robloxPlaceId&&!offline()&&!smoke){const url=await robloxImages.icon(g.robloxPlaceId);if(url)source=await downloadImage(url,path.join(app.getPath('userData'),'roblox-artwork'),{kind:'icon'});}
    if(source?.startsWith('file:')){
      const folder=path.join(app.getPath('userData'),'shortcut-icons');await fs.mkdir(folder,{recursive:true});
      const png=await require('sharp')(require('node:url').fileURLToPath(source)).resize(64,64,{fit:'cover'}).png().toBuffer();
      icon=path.join(folder,require('node:crypto').createHash('sha256').update(id).digest('hex')+'.ico');await fs.writeFile(icon,shortcuts.pngIcon(png));
    }
  }catch{}
  const options=shortcuts.shortcutOptions({id,title:g.title,executable:process.execPath,appPath:app.getAppPath(),packaged:app.isPackaged,icon:icon||process.execPath});
  return shortcuts.createShortcut({folder:smoke?path.join(process.env.ORBIT_SMOKE_DIR||app.getPath('temp'),'shortcuts'):app.getPath('desktop'),tempFolder:path.join(app.getPath('userData'),'shortcut-temp'),options,title:g.title,write:shell.writeShortcutLink,read:shell.readShortcutLink});
}
function debugSnapshot(){devDebug.requireAccess(debugEnabled);return {build:app.getVersion(),profile:smoke?'Isolated test profile':'Orbit-Dev',platform:process.platform,versions:{electron:process.versions.electron,node:process.versions.node,chrome:process.versions.chrome},uptimeSeconds:Math.floor(process.uptime()),mainMemory:process.memoryUsage(),processes:app.getAppMetrics().map(p=>({type:p.type,pid:p.pid,cpu:p.cpu?.percentCPUUsage||0,workingSetKB:p.memory?.workingSetSize,privateKB:p.memory?.privateBytes})),runtime:{offline:offline(),rendererSleeping:windowSleeping,softwareRendering:lowMemoryApplied,scanning:Boolean(scanning),cachedLibrary,entries:library().length,runningGames:runningGames?.sessions.size||0,trackingTimers:tracker?.ledger.sessions.size||0,updater:updates?.snapshot().phase||'starting',discord:discordPresence?.snapshot().status.phase||'disabled',calendarEntries:releaseCalendar?.snapshot().games.length||0},logs:debugLog.snapshot()};}
function setupHandlers() {
  ipcMain.on('ui:bootstrap',(event,legacy)=>{if(window&&!window.isDestroyed()&&event.sender===window.webContents&&event.senderFrame===window.webContents.mainFrame){try{event.returnValue=uiPreferences.bootstrap(legacy);themeIcon?.update(uiPreferences.state.values).catch(error=>console.error('Theme icon:',error.message));}catch(error){uiPreferences.recovery={message:error.message};event.returnValue=null;}}else event.returnValue=null;});
  handle('ui:save',async({key,value})=>{const persisted=uiPreferences.set(key,value);if(['orbit-themes-v1','orbit-super-dark','orbit-app-icon-v1'].includes(key))themeIcon?.update(uiPreferences.state.values).catch(error=>console.error('Theme icon:',error.message));await persisted;return true;});
  const editing=require('./ui-editing.cjs');
  handle('ui:edit',action=>editing.edit(window.webContents,action));
  handle('ui:copy-text',value=>editing.copyText(clipboard,value));
  handle('ui:copy-image',point=>editing.copyImage(window.webContents,point,window.getContentBounds()));
  handle('ui:open-link',async value=>{const url=editing.webLink(value);if(!smoke)await shell.openExternal(url);return true;});

  ipcMain.on('clips:capability',event=>{event.returnValue=Boolean((debugEnabled||smoke)&&window&&!window.isDestroyed()&&event.sender===window.webContents&&event.senderFrame===window.webContents.mainFrame);});
  ipcMain.on('debug:capability',event=>{event.returnValue=Boolean(debugEnabled&&window&&!window.isDestroyed()&&event.sender===window.webContents&&event.senderFrame===window.webContents.mainFrame);});
  handle('debug:snapshot',()=>debugSnapshot());
  handle('debug:copy',()=>{const report=debugSnapshot();clipboard.writeText(JSON.stringify(report,null,2));return true;});
  handle('debug:action',async value=>{const name=devDebug.action(value,debugEnabled);debugLog.record('action',name);
    if(name==='devtools')window.webContents.openDevTools({mode:'detach'});
    if(name==='reload-ui'||name==='replay-startup'){const current=window;setTimeout(()=>{if(!current.isDestroyed())current.loadFile(path.join(__dirname,'ui/index.html'),name==='replay-startup'?{query:{'debug-intro':'1'}}:{}).catch(()=>{});},50).unref();}
    if(name==='scan-running')await runningGames.scan();
    if(name==='refresh-library')await refresh(false);
    if(name==='open-profile')await shell.openPath(app.getPath('userData'));
    if(name==='clear-log')debugLog.clear();
    if(name==='preview-update'||name==='clear-preview')window.webContents.send('debug:preview',name==='preview-update'?'update':'clear');
    return true;
  });

  handle('updates:status',()=>updates.snapshot());
  handle('updates:check',()=>updates.check());
  handle('updates:install',()=>updates.restart());
  handle('updates:postpone',minutes=>updates.postpone(minutes));
  handle('support:issue',async()=>{const url='https://github.com/tkokero/Orbit/issues/new';if(!smoke)await shell.openExternal(url);return true;});
  handle('updates:notes',()=>({current:require('./release-notes.json'),available:updates.snapshot()}));
  handle('updates:installer',async()=>{if(!smoke)await shell.openExternal(await installerDestination((url,options)=>net.fetch(url,options)));return true;});
  handle('roblox:get',()=>store.roblox||{mode:'browser',games:[]});
  handle('roblox:save',async input=>{const entry=experienceEntry(input);store.roblox ||= {mode:'browser',games:[]};const old=store.roblox.games.find(g=>g.id===entry.id);if(!old&&store.roblox.games.length>=64)throw new Error('You can save up to 64 Roblox experiences.');store.roblox.games=store.roblox.games.filter(g=>g.id!==entry.id);store.roblox.games.push({...entry,lastOpened:old?.lastOpened||0});await save();publishRoblox();return store.roblox;});
  handle('roblox:remove',async id=>{store.roblox ||= {mode:'browser',games:[]};store.roblox.games=store.roblox.games.filter(g=>g.id!==String(id));await save();publishRoblox();return store.roblox;});
  handle('roblox:mode',async mode=>{if(!['browser','app'].includes(mode))throw new Error('Invalid Roblox launch method.');store.roblox ||= {mode:'browser',games:[]};store.roblox.mode=mode;await save();publishRoblox();return store.roblox;});
  handle('roblox:launch',openRobloxExperience);
  handle('roblox:icon',async id=>{const entry=store.roblox?.games.find(g=>g.id===String(id));if(!entry)return null;const image=await robloxImages.icon(entry.placeId);return image?downloadImage(image,path.join(app.getPath('userData'),'roblox-artwork'),{kind:'icon'}):null;});
  handle('setup:get',()=>store.setup||{step:0,status:'new'});
  handle('setup:save',async input=>{if(!Number.isInteger(input?.step)||input.step<0||input.step>5||!['started','later','complete'].includes(input.status))throw new Error('Invalid setup state.');store.setup={step:input.step,status:input.status,...(input.schemaVersion===2?{schemaVersion:2}:{})};await save();return store.setup;});
  handle('game:icon',async id=>{const game=gameById(id);if(game.cover&&(!offline()||game.cover.startsWith('file:'))){const image=await downloadImage(game.cover,path.join(app.getPath('userData'),'artwork'),{kind:'icon'});if(image)return image;}const executable=game.versions.find(v=>v.executable)?.executable;if(executable&&await exists(executable))try{return (await app.getFileIcon(executable,{size:'small'})).toDataURL();}catch{}return null;});
  handle('store:icon',async id=>{const image=storeService.dealImages.get(String(id));return image?downloadImage(image,path.join(app.getPath('userData'),'store-artwork'),{kind:'icon'}):null;});
  handle('store:deals',country=>storeService.deals(country));
  handle('store:open',async id=>{if(!/^\d+$/.test(String(id)))throw new Error('Invalid Steam game.');if(!smoke)await shell.openExternal('https://store.steampowered.com/app/'+id+'/');});
  handle('fps:source',async id=>{const reference=referenceFor(gameById(id).title);if(!reference)throw new Error('No publisher FPS reference for this game.');if(!smoke)await shell.openExternal(reference.url);return true;});
  handle('fps:hardware',async id=>{const game=gameById(id);if(game.kind!=='game')throw new Error('Choose a game to estimate.');const location=game.versions.find(v=>v.installed)?.location,version=game.versions.find(v=>v.source==='Steam'||v.equivalentSteamId),appId=version?.appId||version?.equivalentSteamId;const [pc,requirements]=await Promise.all([storeService.system(location),!offline()&&appId?storeService.check(appId,location).catch(()=>null):Promise.resolve(null)]);return estimateHardware(game,pc,requirements);});

  handle('system:info',refresh=>storeService.system(undefined,refresh===true));
  handle('system:check',id=>{const game=gameById(id),version=game.versions.find(v=>v.source==='Steam'||v.equivalentSteamId);return storeService.check(version?.appId||version?.equivalentSteamId,game.versions.find(v=>v.installed)?.location);});
  handle('installer:open',async id=>{if(id)gameById(id);const selected=await dialog.showOpenDialog(window,{title:'Choose game installer',properties:['openFile'],filters:[{name:'Windows installers',extensions:['exe','msi']}]});return selected.canceled?null:installations.stageFile(selected.filePaths[0]);});
  handle('clips:get',async()=>({status:clips.snapshot(),items:await clips.list()}));
  handle('clips:sources',()=>smoke?[]:clips.sources());
  handle('clips:start',input=>{if(smoke)throw Error('Capture is disabled in smoke tests.');return clips.start(input);});
  handle('clips:stop',()=>clips.stop());handle('clips:save',()=>clips.save());
  handle('clips:folder',async()=>{if(clips.child)throw Error('Stop clipping before changing its folder.');const result=await dialog.showOpenDialog(window,{title:'Choose clips folder',properties:['openDirectory','createDirectory']});if(result.canceled)return clips.snapshot();clips.folder=path.resolve(result.filePaths[0]);store.clipsFolder=clips.folder;await save();return clips.snapshot();});
  handle('clips:open',async name=>{const file=await clips.file(name);if(!smoke){const error=await shell.openPath(file);if(error)throw Error(error);}return true;});
  handle('clips:reveal',async name=>{if(name){const file=await clips.file(name);if(!smoke)shell.showItemInFolder(file);}else if(!smoke){const error=await shell.openPath(clips.folder);if(error)throw Error(error);}return true;});
  handle('steam:folder-space',async()=>smoke?[{index:0,available:true,free:120*1024**3,total:1000*1024**3},{index:1,available:true,free:450*1024**3,total:2000*1024**3},{index:2,available:true,free:70*1024**3,total:500*1024**3}]:require('./folder-space.cjs').folderSpace(await steamBridge.request('folders')));
  handle('steam:queue',()=>smoke?{items:[],overview:{}}:steamBridge.request('snapshot'));
  handle('steam:settings',()=>{if(!smoke)return shell.openExternal('steam://open/settings');return true;});
  handle('steam:bridge',async input=>{if(smoke)return {connected:false,message:'Experimental controls are isolated in smoke tests.',apps:[]};try{const [folders,downloads]=await Promise.all([input?.folders===false?Promise.resolve([]):steamBridge.request('folders'),steamBridge.request('snapshot')]);return {connected:true,folders,downloads,apps:baseLibrary().flatMap(g=>g.versions.filter(v=>v.source==='Steam'&&/^\d+$/.test(String(v.appId))).map(v=>({gameId:g.id,versionId:v.id,appId:Number(v.appId),title:g.title,installed:v.installed}))) };}catch(e){return {connected:false,message:e.message,apps:[]};}});
  handle('steam:bridge-start',async()=>{if(smoke)return false;await runningGames.scan();if(runningGames.scanFailed||runningGames.sessions.size)throw Error('Close running games before restarting Steam.');const exe=steamRoot&&path.join(steamRoot,'steam.exe');if(!exe||!await exists(exe))throw Error('Steam could not be located.');await promisify(execFile)(exe,['-shutdown'],{windowsHide:true,timeout:10000}).catch(e=>{if(e.code!=='ETIMEDOUT')throw e;});let ended=false;for(let i=0;i<20;i++){const {stdout}=await promisify(execFile)('tasklist.exe',['/FI','IMAGENAME eq steam.exe','/FO','CSV','/NH'],{windowsHide:true});if(!/"steam.exe"/i.test(stdout)){ended=true;break;}await new Promise(r=>setTimeout(r,500));}if(!ended)throw Error('Steam did not exit gracefully. It was not force-closed.');const child=spawn(exe,['-silent','-cef-enable-debugging','-cef-remote-debugging-address=127.0.0.1'],{detached:true,stdio:'ignore',windowsHide:true});await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();for(let i=0;i<25;i++){try{await steamBridge.trusted();return true;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Steam started, but its experimental bridge is not ready. Try Refresh.');});
  handle('steam:folder-add',async()=>{if(smoke)return false;const selected=await dialog.showOpenDialog(window,{title:'Choose Steam library folder',properties:['openDirectory','createDirectory']});if(selected.canceled)return false;const location=selected.filePaths[0],stat=await fs.lstat(location);if(!stat.isDirectory()||stat.isSymbolicLink()||path.parse(location).root===location)throw Error('Choose a dedicated Steam library folder, not a drive root or link.');await steamBridge.request('addFolder',{path:location});return true;});
  handle('steam:control',async input=>{if(smoke)throw Error('Steam mutations are disabled in smoke tests.');const allowed=['pause','resume','queue','up','down','unschedule','priority','pauseAll','resumeAll','move','cancelMove','uninstall','install','bandwidth'];if(!input||!allowed.includes(input.action))throw Error('Unknown Steam control.');const appId=input.appId,game=appId?baseLibrary().find(g=>g.versions.some(v=>v.source==='Steam'&&Number(v.appId)===appId)):null;if(appId&&!game)throw Error('Choose a Steam game in your library.');if(['install','move','uninstall'].includes(input.action)){if(input.confirmed!==true)throw Error('Confirm this Steam operation first.');await runningGames.scan();if(runningGames.scanFailed||runningGames.sessions.has(game?.id))throw Error('Close this game before changing its installation.');if(input.action!=='uninstall'){const folders=await steamBridge.request('folders');if(!folders.some(f=>f.nFolderIndex===input.folder&&f.bIsMounted!==false))throw Error('This Steam library folder is no longer available.');}}const result=await steamBridge.control(input.action,input);if(result.downloads){steamDownloadCache=result.downloads;steamDownloadAt=Date.now();}if(window&&!window.isDestroyed())window.webContents.send('downloads:changed');return result;});
  handle('installer:run',input=>installations.installFile(input?.token,input?.confirmed));
  handle('install:choices',id=>{const game=id?gameById(id):null;return {title:game?.title||'Install a game',launchable:Boolean(id&&store.preferences[id]?.profile?.executable),choices:(game?.versions||[]).filter(v=>!v.installed&&v.installUrl).map(v=>({id:v.id,label:v.source}))};});
  handle('install:store',async({id,versionId})=>{const game=gameById(id),version=game.versions.find(v=>v.id===versionId&&!v.installed&&v.installUrl);if(!version)throw Error('This installation choice changed. Open the menu again.');const url=require('./library.cjs').safeUrl(version.installUrl);if(!smoke)await shell.openExternal(url);return {message:'Install request sent to '+version.source+'. Complete setup there.'};});
  handle('uninstall:choices',id=>installations.removals(gameById(id)));
  handle('uninstall:run',async input=>{const staged=installations.take(input?.token,'remove'),game=gameById(staged.gameId);if(!smoke){await runningGames.scan();if(runningGames.scanFailed)throw Error('Could not check running games. Try again before uninstalling.');const location=staged.choices.find(c=>c.id===input.choice)?.location;const shared=library().filter(g=>g.versions.some(v=>v.installed&&v.location&&v.location.toLowerCase()===location?.toLowerCase()));if(shared.some(g=>runningGames.sessions.has(g.id)))throw Error('Close the game before uninstalling it.');}return installations.remove(input,game);});
  handle('downloads:start',async value=>{if(offline())throw Error('Go online to download an installer.');installerUrl(value);const selected=await dialog.showSaveDialog(window,{title:'Save game installer',defaultPath:path.join(app.getPath('downloads'),installerName(value)),filters:[{name:'Installer',extensions:[path.extname(new URL(value).pathname).slice(1)]}]});if(selected.canceled)return null;return installations.download(value,selected.filePath);});
  handle('downloads:cancel',id=>installations.cancel(id));
  handle('downloads:installer',id=>installations.downloadedFile(id));
  handle('installer:store',async source=>{const url=storeDestination(source);if(!smoke)await shell.openExternal(url);});
  handle('social:get',async()=>{if(!smoke&&store.settings.rememberAccounts&&!offline())await discordFriends?.resume();if(store.settings.autoConnectAccounts&&!steamFriendHint&&steamRoot)try{const users=parseVdf(await fs.readFile(path.join(steamRoot,'config/loginusers.vdf'),'utf8')).users||{};steamFriendHint=Object.entries(users).filter(([id])=>/^\d{17}$/.test(id)).sort((a,b)=>Number(b[1].MostRecent||0)-Number(a[1].MostRecent||0)||Number(b[1].Timestamp||0)-Number(a[1].Timestamp||0))[0]?.[0]||'';}catch{}return socialSnapshot();});
  handle('social:refresh',async()=>{await Promise.all([social.refresh(),discordFriends?.refresh()]);return socialSnapshot();});
  handle('social:connect-discord',async input=>{if(smoke)throw Error('Interactive account linking is disabled during background checks.');await discordFriends.connect({remember:input?.remember===true&&store.settings.rememberAccounts});return socialSnapshot();});
  handle('social:connect-steam',async input=>{
    const revision=accountRevision,candidate=new SteamFriends();candidate.configure(String(input?.steamId||''),String(input?.apiKey||''));
    const tested=await candidate.refresh();if(revision!==accountRevision){candidate.disconnect();throw Error('Account connection was cancelled.');}if(tested.error)throw new Error(tested.error);
    if(input?.remember===true&&store.settings.rememberAccounts)await socialVault.save(candidate.steamId,candidate.key);else await socialVault.clear();
    social.disconnect();social=candidate;social.saved=input?.remember===true&&store.settings.rememberAccounts;store.steamId=candidate.steamId;await save();return socialSnapshot();
  });
  handle('social:disconnect',async(provider='steam')=>{if(provider==='discord')await discordFriends.disconnect();else if(provider==='steam'){await socialVault.clear();social.disconnect();}else throw Error('Unknown social platform.');return socialSnapshot();});
  handle('social:open-client',async provider=>{const url=socialClientUrl(provider);if(!smoke)await shell.openExternal(url);return {message:provider==='steam'?'Steam Friends & Chat opened. Use the menu next to your name to change status.':provider==='epic'?'Epic Games opened. Use your profile menu to manage status.':'Discord opened. Use your profile menu to change status.',route:smoke?url:undefined};});
  handle('social:activity',id=>String(id).startsWith('discord:')?{games:[],unavailable:true}:social.activity(id));
  handle('social:image',async ({id,gameId}={})=>{const friend=[...social.people,...(discordFriends?.people||[])].find(p=>p.id===id);if(!friend)return null;if(gameId&&friend.platform!=='Steam')return null;const url=gameId?(await social.activity(id)).games.find(g=>g.id===gameId)?.icon:friend.avatar;return url?downloadImage(url,path.join(app.getPath('userData'),'friend-avatars'),{kind:'icon'}):null;});
  handle('social:profile',async id=>{const friend=[...social.people,...(discordFriends?.people||[])].find(p=>p.id===id);if(!friend)throw new Error('Friend is not in the connected list.');if(!smoke)await shell.openExternal(friendProfileUrl(friend));});
  startupMedia=new (require('./startup-media.cjs').StartupMedia)(path.join(app.getPath('userData'),'startup-videos'));
  handle('intro:get',()=>startupMedia.get());
  handle('intro:choose',async()=>{const selected=await dialog.showOpenDialog(window,{title:'Choose startup video',properties:['openFile'],filters:[{name:'Startup video',extensions:['mp4','webm']}]});return selected.canceled?null:startupMedia.stage(selected.filePaths[0]);});
  handle('intro:save',input=>startupMedia.commit(input));
  handle('intro:discard',token=>startupMedia.discard(token));
  handle('intro:remove',()=>startupMedia.remove());
  const fontStore=new (require('./custom-font.cjs').FontStore)(path.join(app.getPath('userData'),'custom-font.json'));
  handle('font:get',()=>fontStore.load());
  handle('font:choose',async()=>{const chosen=await dialog.showOpenDialog(window,{title:'Choose interface font',properties:['openFile'],filters:[{name:'Fonts',extensions:['ttf','otf','woff','woff2']}]});if(chosen.canceled)return null;return require('./custom-font.cjs').prepareFont(chosen.filePaths[0]);});
  handle('font:save',font=>fontStore.save(font));
  handle('theme:image',async()=>{const chosen=await dialog.showOpenDialog(window,{title:'Choose theme background',properties:['openFile'],filters:[{name:'Still images',extensions:['png','jpg','jpeg','webp']}]});if(chosen.canceled)return null;return require('./theme-image.cjs').prepareThemeImage(chosen.filePaths[0]);});
  handle('theme:import',async()=>{const chosen=await dialog.showOpenDialog(window,{title:'Import Orbit theme',properties:['openFile'],filters:[{name:'Orbit theme JSON',extensions:['json']}]});if(chosen.canceled)return null;const file=chosen.filePaths[0];if((await fs.stat(file)).size>2*1024*1024)throw new Error('Theme files must be under 2 MB.');const theme=validateTheme(JSON.parse(await fs.readFile(file,'utf8')));if(theme.image){const normalized=await require('./theme-image.cjs').prepareThemeImage(Buffer.from(theme.image.data.split(',')[1],'base64'));theme.image={...normalized,mode:theme.image.mode,opacity:theme.image.opacity};}return theme;});
  handle('theme:export',async input=>{const theme=validateTheme(input);const chosen=await dialog.showSaveDialog(window,{title:'Export Orbit theme',defaultPath:'orbit-theme.json',filters:[{name:'JSON',extensions:['json']}]});if(chosen.canceled)return null;await fs.writeFile(chosen.filePath,JSON.stringify(theme,null,2));return true;});
  handle('discord:get',()=>discordPresence.snapshot());
  handle('discord:context',input=>{const value=require('./discord-presence.cjs').context(input);value.visible=Boolean(window?.isVisible()&&!window?.isMinimized());discordPresence.setContext(value);return true;});
  handle('discord:save',async input=>{const next=require('./discord-presence.cjs').config({...store.discord,...input});store.discord=next;await discordPresence.configure(next,smoke||offline()||discordSleeping);await save();return discordPresence.snapshot();});
  handle('discord:portal',()=>{if(!smoke)return shell.openExternal('https://discord.com/developers/applications');return true;});
  handle('settings:get',()=>settingsSnapshot());
  handle('settings:update',async change=>{
    if(typeof change?.launchAtLogin==='boolean'){
      loginStartup.set(change.launchAtLogin);
      store.settings.launchAtLogin=change.launchAtLogin;
    }
    if(typeof change?.lowMemoryRendering==='boolean')await fs.writeFile(renderingFile(),JSON.stringify({lowMemoryRendering:change.lowMemoryRendering}));
    for(const key of Object.keys(settingsDefaults))if(typeof change?.[key]==='boolean')store.settings[key]=change[key];
    if(change?.recordHistory===false){await history.finish();recaps.clear();}
    if(change?.localPlaytime===false){for(const id of new Set([...tracker.ledger.sessions.keys(),...tracker.pending.keys()]))await tracker.stop(id);}
    if(change?.offlineMode===true)discordFriends?.pause();
    if(change?.offlineMode===false&&store.settings.rememberAccounts)discordFriends?.resume().catch(()=>{});
    if(change?.rememberAccounts===false){accountRevision++;await socialVault.clear();social.saved=false;await discordFriends?.forget();store.steamConnected=false;const partition=session.fromPartition('persist:orbit-steam-account');await partition.clearStorageData();await partition.clearCache();}
    if(change?.autoConnectAccounts===true)accountSynced=false;
    await save();if('offlineMode' in change)await discordPresence?.configure(store.discord,smoke||offline()||discordSleeping);if(typeof change?.autoDiscover==='boolean')await configureMonitor();if('autoUpdates' in change||'restartForUpdates' in change||'offlineMode' in change){if(offline())updates.stop();else updates.settingsChanged();}return settingsSnapshot();
  });
  handle('history:get',id=>{if(id)gameById(id);return {...history.snapshot(id),enabled:store.settings.recordHistory};});
  handle('personal:get',id=>{const g=gameById(id);return {notes:g.notes,aliases:g.aliases};});
  handle('personal:save',async({id,value})=>{gameById(id);const data=personal(value);store.preferences[id]={...store.preferences[id],...data};await save();return data;});
  handle('library:health',()=>healthReport(library(),store.preferences,exists));
  const wishlistSnapshot=country=>{if(!wishlist.REGIONS[country])throw Error('Choose a supported region.');return {country,currency:wishlist.REGIONS[country],entries:(store.wishlist||[]).map(item=>{const p=wishlist.cachedPrice(store.wishlistPrices?.[item.id+':'+country],country);return {...item,price:p||null,targetMet:wishlist.targetMet(item,p)};})};};
  handle('wishlist:get',country=>wishlistSnapshot(country));
  handle('wishlist:save',async input=>{const item=wishlist.entry(input),rows=store.wishlist||[];if(!rows.some(r=>r.id===item.id)&&rows.length>=100)throw Error('You can save up to 100 entries.');store.wishlist=[...rows.filter(r=>r.id!==item.id),item];await save();return item;});
  handle('wishlist:remove',async id=>{store.wishlist=(store.wishlist||[]).filter(r=>r.id!==id);for(const key of Object.keys(store.wishlistPrices||{}))if(key.startsWith(id+':'))delete store.wishlistPrices[key];await save();return true;});
  handle('wishlist:open',async id=>{const item=store.wishlist?.find(r=>r.id===id);if(!item)throw Error('Wishlist entry no longer exists.');const url=wishlist.entry(item).url;if(!smoke)await shell.openExternal(url);return true;});
  handle('wishlist:check',async({country,ids})=>{if(offline())throw Error('Go online to check prices.');if(checkingWishlist)throw Error('A price check is already running.');if(!wishlist.REGIONS[country]||!Array.isArray(ids)||ids.length>10)throw Error('Choose up to 10 wishlist entries.');const rows=(store.wishlist||[]).filter(r=>ids.includes(r.id)&&r.appId);let index=0;const errors=[];checkingWishlist=true;try{await Promise.all(Array.from({length:Math.min(2,rows.length)},async()=>{while(index<rows.length){const item=rows[index++];try{const p=await storeService.price(item.appId,country);if(store.wishlist.some(r=>r.id===item.id)){store.wishlistPrices||={};store.wishlistPrices[item.id+':'+country]=p;}}catch{errors.push(item.id);}}}));await save();return {...wishlistSnapshot(country),errors};}finally{checkingWishlist=false;}});
  handle('report:preview',async input=>{const games=library(),health=await healthReport(games,store.preferences,exists),report=portableReports.diagnostics({version:app.getVersion(),platform:process.platform,arch:process.arch,games,health,settings:store.settings,includeTitles:input?.includeTitles===true}),token=require('node:crypto').randomUUID();if(stagedDiagnostics.size>=4)stagedDiagnostics.delete(stagedDiagnostics.keys().next().value);stagedDiagnostics.set(token,JSON.stringify(report,null,2));return {token,report};});
  handle('report:export',async token=>{const data=stagedDiagnostics.get(token);if(!data)throw Error('Preview the report again before saving.');const r=await dialog.showSaveDialog(window,{title:'Save troubleshooting report',defaultPath:'Orbit-Diagnostics.json',filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return false;await fs.writeFile(r.filePath,data);return true;});
  handle('catalog:export',async input=>{const data=portableReports.catalog(snapshot().games,{hidden:input?.hidden===true}),r=await dialog.showSaveDialog(window,{title:'Export library table',defaultPath:'Orbit-Library.csv',filters:[{name:'CSV',extensions:['csv']}]});if(r.canceled)return false;await fs.writeFile(r.filePath,data,'utf8');return true;});
  handle('accessibility:get',()=>accessibility.validate(store.accessibility||{}));
  handle('accessibility:save',async value=>{const data=accessibility.validate(value);store.accessibility=data;await save();window.webContents.setZoomFactor(data.scale);return data;});
  handle('artwork:get',id=>{gameById(id);return customArtwork.info(id);});
  handle('artwork:set',async({id,kind,choose,crop})=>{gameById(id);let filename;if(choose){const result=await dialog.showOpenDialog(window,{title:'Choose custom artwork',properties:['openFile'],filters:[{name:'Images',extensions:['png','jpg','jpeg','webp']}]});if(result.canceled)return null;filename=result.filePaths[0];}const art=await customArtwork.set(id,kind,filename,crop);return {art,library:snapshot()};});
  handle('artwork:reset',async({id,kind})=>{gameById(id);const art=await customArtwork.reset(id,kind);return {art,library:snapshot()};});
  handle('recaps:get',id=>{if(id)gameById(id);return {enabled:store.settings.recordHistory,items:recaps.list(history,library(),id=>backupScheduler.snapshot(id),id)};});
  let steamDownloadCache=null,steamDownloadPending=null,steamDownloadAt=0;
  handle('downloads:list',async()=>{const games=baseLibrary(),data=downloadCenter.snapshot(games);if(!smoke&&steamRoot){if(Date.now()-steamDownloadAt>1000&&!steamDownloadPending){steamDownloadPending=steamBridge.request('snapshot').then(result=>{steamDownloadCache=result;steamDownloadAt=Date.now();if(window&&!window.isDestroyed())window.webContents.send('downloads:changed');},()=>{steamDownloadCache=null;steamDownloadAt=Date.now()+29000;}).finally(()=>steamDownloadPending=null);}if(steamDownloadCache){const transfers=require('./steam-downloads.cjs').libraryTransfers(steamDownloadCache,games);data.items=[...transfers,...data.items.filter(r=>r.source!=='Steam')];data.rate=data.items.reduce((n,r)=>n+(r.progress.bytesPerSecond||0),0);}}return {...data,native:installations.snapshot()};});
  handle('downloads:clear',async()=>{downloadCenter.clear();await installations.clear();store.downloadHistory=[];await save();return true;});
  handle('tags:save',async({id,tags})=>{gameById(id);store.preferences[id]={...store.preferences[id],tags:libraryFilters.tags(tags)};await save();return snapshot();});
  handle('metadata:load',async id=>{const game=gameById(id),appId=newsSteamId(game);if(!appId)throw Error('No supported store match for this game.');if(offline())throw Error('Go online to load store metadata.');const metadata=await storeService.metadata(appId);store.preferences[id]={...store.preferences[id],metadata};await save();return snapshot();});
  handle('saves:schedule',async({id,value})=>{if(gameById(id).kind!=='game')throw Error('Choose a game.');const result=await saveBackups.setSchedule(id,value);if(!result.schedule.afterExit)backupScheduler.cancel(id);return result;});
  handle('storage:usage',()=>cacheUsage(app.getPath('userData')));
  handle('storage:clean',async()=>{if(scanning)await scanning;return trimImageCaches(app.getPath('userData'),imageReferences(),{removeUnused:true});});
  handle('licenses:open',async()=>{
    const document=await readNotices(process.resourcesPath);if(smoke)return {available:document.length>0};
    const folder=await fs.mkdtemp(path.join(app.getPath('temp'),'orbit-licenses-')),file=path.join(folder,'licenses.html');await fs.writeFile(file,document);
    const viewer=new BrowserWindow({parent:window,width:980,height:760,title:'Orbit · Third-party licenses',show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,javascript:false}});
    viewer.webContents.setWindowOpenHandler(()=>({action:'deny'}));viewer.webContents.on('will-navigate',event=>event.preventDefault());
    viewer.webContents.on('before-input-event',(_event,input)=>{if(input.key==='Escape')viewer.close();});
    viewer.on('closed',()=>fs.unlink(file).then(()=>fs.rmdir(folder)).catch(()=>{}));viewer.once('ready-to-show',()=>viewer.show());
    try{await viewer.loadFile(file);}catch(error){viewer.destroy();throw error;}return {available:true};
  });
  handle('privacy:summary',()=>({history:history.rows.length,notes:Object.values(store.preferences).filter(p=>p.notes).length,localHours:Object.keys(tracker.ledger.totals).length,savedFriends:social.saved||Boolean(discordFriends?.saved),webLibrary:Boolean(store.steamConnected),rememberAccounts:store.settings.rememberAccounts}));
  handle('privacy:clear',async({kind,confirmed}={})=>{
    if(confirmed!==true||!['history','notes','hours','accounts'].includes(kind))throw Error('Choose and confirm what to clear.');
    if(kind==='history'){await history.clear();recaps.clear();}
    if(kind==='notes')for(const p of Object.values(store.preferences)){delete p.notes;delete p.aliases;}
    if(kind==='hours'){for(const id of new Set([...tracker.ledger.sessions.keys(),...tracker.pending.keys()]))await tracker.stop(id);tracker.ledger.totals=Object.create(null);await tracker.save();}
    if(kind==='accounts'){
      accountRevision++;
      store.settings.autoConnectAccounts=false;store.settings.rememberAccounts=false;accountSynced=true;
      social.disconnect();await socialVault.clear();await discordFriends?.disconnect();store.steamId='';steamFriendHint='';store.steamConnected=false;
      for(const partition of ['persist:orbit-steam-account','orbit-steam-account-ephemeral']){const accountSession=session.fromPartition(partition);await accountSession.clearStorageData();await accountSession.clearCache();}
      const avatars=path.resolve(app.getPath('userData'),'friend-avatars');if(path.dirname(avatars)!==path.resolve(app.getPath('userData')))throw Error('Invalid cache path.');await fs.rm(avatars,{recursive:true,force:true});
    }
    mergedCache=null;await save();return snapshot();
  });
  handle('couch:fullscreen',value=>{if(value!==undefined&&typeof value!=='boolean')throw Error('Invalid fullscreen request.');if(smoke)return false;if(value===true){if(couchFullscreenBefore===null)couchFullscreenBefore=window.isFullScreen();window.setFullScreen(true);}else if(value===false){if(couchFullscreenBefore!==null)window.setFullScreen(couchFullscreenBefore);couchFullscreenBefore=null;}else window.setFullScreen(!window.isFullScreen());return true;});
  handle('couch:watch',id=>{if(id===null)controllerHandoff?.cancel();else gameById(id);return true;});
  handle('couch:handoff-cancel',id=>{controllerHandoff?.browse(id);return true;});
  handle('couch:handoff-switch',id=>{if(controllerHandoff?.current?.id!==id)throw Error('This launch is no longer waiting.');return controllerHandoff.switch();});
  handle('sessions:get',async()=>{if(smoke)return [];return runningGames.scan();});
  handle('sessions:configure',async id=>{const game=gameById(id);if(game.kind!=='game'||!game.installed)throw Error('Choose an installed game.');const result=await dialog.showOpenDialog(window,{title:'Choose the actual game executable for detection',properties:['openFile'],filters:[{name:'Game executable',extensions:['exe']}]});if(result.canceled)return false;const executable=result.filePaths[0];if(!require('./playtime.cjs').safeGameExe(executable)||!path.win32.isAbsolute(executable)||!await exists(executable))throw Error('Choose an existing game executable, not a launcher.');tracker.configs[id]={executables:[executable]};await tracker.save();await runningGames.scan();return true;});
  handle('sessions:diagnose',id=>{gameById(id);return runningGames.diagnose(id);});
  handle('sessions:focus',id=>smoke?true:runningGames.focus(id));
  handle('sessions:close',async({id,force=false,confirmed=false}={})=>{
    gameById(id);if(typeof force!=='boolean')throw Error('Invalid close request.');
    if(store.settings[force?'confirmForceClose':'confirmGameClose']!==false&&confirmed!==true)throw Error('Confirm closing this game in Orbit first.');
    if(smoke)return {status:'cancelled'};
    const result=await runningGames.close(id,force);setTimeout(()=>runningGames.scan().catch(()=>{}),1200).unref();return result;
  });
  handle('smart:get',()=>[...collectionRules.builtins,...(store.smartCollections||[])]);
  handle('smart:save',async input=>{collectionState.saveSmart(store,input);await save();return [...collectionRules.builtins,...store.smartCollections];});
  handle('storage:list',refresh=>gameStorage.list(refresh===true));
  handle('storage:measure',id=>gameStorage.measureRow(id));
  handle('storage:cancel',()=>gameStorage.cancel());
  handle('storage:action',async({id,action})=>{const row=gameStorage.row(id);if(action==='folder'){if(!await exists(row.location))throw Error('Folder unavailable.');if(!smoke){const error=await shell.openPath(row.location);if(error)throw Error(error);}}else if(action==='manage'){const {managementRoute}=require('./storage-manager.cjs');if(!smoke)await shell.openExternal(managementRoute(row).url);}else throw Error('Unknown storage action.');return true;});
  const releaseArtwork=new (require('./release-artwork.cjs').ReleaseArtwork)({folder:path.join(app.getPath('userData'),'release-artwork'),offline,download:downloadImage});const releaseArtworkReady=releaseArtwork.load();
  handle('calendar:get',()=>smoke?{...require('./upcoming-calendar.cjs').range(Date.now()),games:[],checkedAt:Date.now(),stale:false,partial:false,offline:false}:releaseCalendar.get());
  handle('calendar:open',id=>{const game=releaseCalendar.find(id);if(!game?.url)throw Error('This release has no link.');if(!smoke)return shell.openExternal(game.url);return true;});
  handle('calendar:save',input=>releaseCalendar.saveCustom(input));
  handle('calendar:remove',id=>releaseCalendar.removeCustom(String(id)));
  handle('calendar:image',async id=>{await releaseArtworkReady;return releaseArtwork.image(releaseCalendar.find(String(id)));});
  handle('calendar:choose-image',async()=>{const chosen=await dialog.showOpenDialog(window,{title:'Choose release preview',properties:['openFile'],filters:[{name:'Images',extensions:['png','jpg','jpeg','webp']}]});if(chosen.canceled)return null;return require('./release-artwork.cjs').choosePreview(chosen.filePaths[0]);});
  handle('news:shelf',async()=>{
    const chosen=library().filter(g=>g.kind==='game'&&!g.hidden&&newsSteamId(g)).sort((a,b)=>(b.lastPlayed||0)-(a.lastPlayed||0)||Number(b.favorite)-Number(a.favorite)||Number(b.installed)-Number(a.installed)).filter((g,i,all)=>all.findIndex(other=>newsSteamId(other)===newsSteamId(g))===i).slice(0,8);
    let cursor=0;const posts=[];await Promise.all([0,1].map(async()=>{while(cursor<chosen.length){const game=chosen[cursor++];try{const data=await gameNews.get(newsSteamId(game),{offline:offline()});for(const post of data.posts.slice(0,2))posts.push({...post,content:undefined,gameId:game.id,gameTitle:game.title,stale:data.stale});}catch{}}}));
    return {posts:posts.sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,12),offline:offline()};
  });
  handle('news:image',async({id,postId})=>{const appId=newsSteamId(gameById(id)),post=gameNews.post(appId,postId);if(!post)return null;const image=post.banner||'https://cdn.akamai.steamstatic.com/steam/apps/'+appId+'/header.jpg';if(offline())return null;return downloadImage(image,path.join(app.getPath('userData'),'artwork'),{kind:'news'});});
  handle('news:get',async({id,refresh})=>{const appId=newsSteamId(gameById(id));if(!appId)return {supported:false,posts:[]};const data=await gameNews.get(appId,{offline:offline(),refresh:refresh===true});return {supported:true,...data,posts:data.posts.map(({content,...post})=>post)};});
  handle('news:open',async({id,postId})=>{const game=gameById(id),post=gameNews.post(newsSteamId(game),postId);if(!post)throw Error('Refresh game news first.');const article=newsArticle(post);return {...post,content:undefined,gameTitle:game.title,article:{html:article.html}};});
  handle('news:external',async({id,postId})=>{const post=gameNews.post(newsSteamId(gameById(id)),postId);if(!post)throw Error('Refresh game news first.');if(!smoke)await shell.openExternal(post.url);return true;});
  handle('news:link',async({id,postId,index})=>{const post=gameNews.post(newsSteamId(gameById(id)),postId);if(!post||!Number.isInteger(index)||index<0)throw Error('This article link is no longer available.');const url=newsArticle(post).links[index];if(!url)throw Error('This article link is not supported.');if(!smoke)await shell.openExternal(url);return true;});
  handle('news:article-image',async({id,postId,index})=>{const post=gameNews.post(newsSteamId(gameById(id)),postId);if(!post||!Number.isInteger(index)||index<0)return null;const image=newsArticle(post).images[index];return image?downloadImage(image,path.join(app.getPath('userData'),'artwork'),{kind:'article',offline:offline()}):null;});
  handle('library:bulk',async input=>({...await bulkLibrary.update(input),library:snapshot()}));
  handle('library:undo',async token=>({...await bulkLibrary.restore(token),library:snapshot()}));
  handle('collections:details',()=>({collections:store.collections||[],styles:require('./ui/collection-design.js').styles(store.collectionStyles)}));
  let collectionEdits=Promise.resolve();
  handle('collections:edit',input=>{const result=collectionEdits.then(async()=>{
    const before={collections:store.collections,preferences:store.preferences,collectionStyles:store.collectionStyles},prepared=collectionState.edit(store,input);
    Object.assign(store,{collections:prepared.collections,preferences:prepared.preferences,collectionStyles:prepared.collectionStyles});mergedCache=null;
    try{await save();}catch(error){
      if(store.collections===prepared.collections)store.collections=before.collections;
      if(store.collectionStyles===prepared.collectionStyles)store.collectionStyles=before.collectionStyles;
      for(const [id,pref]of Object.entries(prepared.preferences))if(store.preferences[id]===pref){if(Object.hasOwn(before.preferences,id))store.preferences[id]=before.preferences[id];else delete store.preferences[id];}
      mergedCache=null;throw error;
    }
    return {collections:store.collections,styles:store.collectionStyles,renamed:prepared.renamed,library:snapshot()};
  });collectionEdits=result.catch(()=>{});return result;});
  handle('collections:get',()=>store.collections||[]);
  handle('collections:save',async input=>{
    const name=String(input?.name||'').trim();if(!name||name.length>40)throw Error('Use a collection name under 40 characters.');
    store.collections||=['Playing','Backlog','Finished'];
    if(input.remove){if(store.collectionStyles)delete store.collectionStyles[require('./ui/collection-design.js').key(name)];store.collections=store.collections.filter(x=>x!==name);for(const p of Object.values(store.preferences))if(p.collections)p.collections=p.collections.filter(x=>x!==name);}
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
    store.preferences=data.preferences;store.imports=data.imports;store.collections=data.collections;store.collectionStyles=data.collectionStyles;store.wishlist=data.wishlist;store.accessibility=data.accessibility;window.webContents.setZoomFactor(data.accessibility.scale);store.wishlistPrices={};store.smartCollections=data.smartCollections;store.addedAt=data.addedAt;store.addedTrackingInitialized=data.addedTrackingInitialized;store.roblox=data.roblox;store.settings={...settingsDefaults,...data.settings};
    tracker.ledger.totals=data.playtime.totals;tracker.configs=data.playtime.configs;await tracker.save();await save();mergedCache=null;updates?.settingsChanged();
    return {ui:data.ui,library:await refresh()};
  });
  handle('cleanup:preview',async()=>cleanupPreview=await libraryTools.inspectLibrary(library(),exists));
  handle('cleanup:apply',async ids=>{if(!Array.isArray(ids))throw Error('Choose entries to hide.');const allowed=new Set(cleanupPreview.filter(x=>x.action==='hide').map(x=>x.id));if(ids.some(id=>!allowed.has(id)))throw Error('Run a cleanup preview first.');for(const id of ids)store.preferences[id]={...store.preferences[id],hidden:true};cleanupPreview=[];mergedCache=null;await save();return snapshot();});
  handle('data:open',()=>shell.openPath(app.getPath('userData')));
  handle('downloads:open',source=>{const urls={'Steam':'steam://nav/downloads','Epic Games':'com.epicgames.launcher://library'};if(!urls[source])throw new Error('Open this game’s launcher to see installation progress.');return shell.openExternal(urls[source]);});
  handle('menu:entry', (id, point) => popup(entryMenu(gameById(id),library().filter(g=>g.kind==='tool'&&/r2modman|CurseForge/i.test(g.title)),{running:runningGames.sessions.has(id),collections:store.collections||[],selectedCollections:store.preferences[id]?.collections||[]}), point));
  handle('menu:background', (input, point) => popup(backgroundMenu(input?.section, Boolean(input?.list)), point));
  handle('menu:items', input=>input?.id?entryMenu(gameById(input.id),library().filter(g=>g.kind==='tool'&&/r2modman|CurseForge/i.test(g.title)),{running:runningGames.sessions.has(input.id),collections:store.collections||[],selectedCollections:store.preferences[input.id]?.collections||[]}):backgroundMenu(input?.section,Boolean(input?.list)));
  handle('game:shortcut',createDesktopShortcut);
  handle('game:copy-title', id => clipboard.writeText(gameById(id).title));
  handle('playtime:start', async id => {if(!store.settings.localPlaytime)throw Error('Enable local playtime in Privacy settings first.'); await tracker.manual(gameById(id)); return snapshot(); });
  handle('playtime:stop', async id => { gameById(id); await tracker.stop(id,{suppress:true}); return snapshot(); });
  handle('playtime:configure', async id => {if(!store.settings.localPlaytime)throw Error('Enable local playtime in Privacy settings first.');
    const game = gameById(id);
    if (nativePlaytime(game) || game.kind !== 'game') throw new Error('This item does not need a local timer.');
    const result = await dialog.showOpenDialog(window, { title: 'Choose the game executable for playtime tracking', properties: ['openFile'], filters: [{ name: 'Game executable', extensions: ['exe'] }] });
    if (result.canceled) return null;
    await tracker.configure(game, result.filePaths[0]); return snapshot();
  });
  handle('library:get',async()=>{
    if(windowBootstrapCached){windowBootstrapCached=false;return snapshot();}
    if(initialLibrary&&cachedLibrary){initialLibrary=false;setTimeout(()=>refresh().then(data=>{if(window&&!window.isDestroyed())window.webContents.send('library:update',data);}).catch(()=>{}),2500);return snapshot();}
    initialLibrary=false;return refresh();
  });
  handle('launch:diagnose',id=>diagnose(gameById(id),store.preferences[id]?.profile,exists));
  handle('saves:list',id=>{gameById(id);return {...saveBackups.list(id),status:backupScheduler.snapshot(id)};});
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
    gameById(id);const custom=customArtwork.url(id,'hero');if(custom)return custom;
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
    const revision=accountRevision,account = await connectSteam({ parent: window, persistent:store.settings.rememberAccounts, steamRoot, interactive: true });
    if(revision!==accountRevision)throw Error('Account connection was cancelled.');
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
  handle('launch:choices',async id=>{
    const game=gameById(id),profile=libraryTools.profile(store.preferences[id]?.profile),version=game.versions[0];
    const modes=profile.executable?[]:await steamModes.get(version,steamRoot);
    return {title:game.title,selected:profile.launchChoice,choices:modes.map(m=>({id:version.id+':'+m.id,label:m.label})),ask:profile.launchChoice==='ask'&&modes.length>1};
  });
  handle('game:action',async(id,modeId,context)=>{if(modeId!==undefined&&(typeof modeId!=='string'||modeId.length>2048))throw Error('Invalid launch mode.');const g=gameById(id),controller=context?.controller===true&&store.preferences[id]?.profile?.controller!=='desktop'&&(g.installed||g.directLaunchAvailable||g.launcherAvailable);if(controller)controllerHandoff.begin(id);try{const result=await launchEntry(id,true,modeId,controller);if(controller)scheduleRunningPoll?.(200);return {...result,controllerHandoff:controller};}catch(error){if(controller)controllerHandoff.cancel(id);throw error;}});
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
    const revision=accountRevision;
    if (!/^\d{17}$/.test(steamId || '') || !/^[a-f\d]{32}$/i.test(apiKey || '')) throw new Error('Enter a 17-digit SteamID64 and a 32-character Steam Web API key.');
    const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
    url.search = new URLSearchParams({ key: apiKey, steamid: steamId, include_appinfo: 'true', include_played_free_games: 'true' });
    let response;
    try { response = await fetch(url, { signal: AbortSignal.timeout(25000) }); }
    catch { throw new Error('Could not reach Steam. Check your internet connection and try again.'); }
    if (!response.ok) throw new Error(`Steam returned ${response.status}. Check your API key.`);
    const payload = await response.json();
    if (!Array.isArray(payload.response?.games)) throw new Error('Steam did not return a library. Set Game details to Public in Steam privacy settings, then try again.');
    const games = importRecords(payload.response.games.map(g => ({ title: g.name, source: 'Steam', appId: g.appid }))).map(r=>({...r,origin:'steam-account'}));
    games.forEach((g, i) => { g.playtime = payload.response.games[i].playtime_forever || 0; g.playtimeKnown = true; g.playtimeRecent = payload.response.games[i].playtime_2weeks ?? null; g.lastPlayed = Number(payload.response.games[i].rtime_last_played || 0) * 1000; g.statsSource = 'Steam API'; });
    if(revision!==accountRevision)throw Error('Account connection was cancelled.');
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
async function openMainWindow(){
 if(window&&!window.isDestroyed())return window;
 if(windowCreating)return (await windowCreating).current;
 windowCreating=buildMainWindow().finally(()=>{windowCreating=null;});return (await windowCreating).current;
}
async function buildMainWindow(){
 const restored=windowSleeping;windowSleeping=false;if(restored)windowBootstrapCached=true;
  window = new BrowserWindow({ width: 1440, height: 960, ...(windowLayout?.bounds||{}), minWidth: 940, minHeight: 680, show: false,
    icon:themeIcon?.startupIcon?.image||path.join(__dirname,'assets/orbit.png'),title: 'Orbit • Your games, together', backgroundColor: '#10151e', frame: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true,...(backgroundChecks?{offscreen:true,backgroundThrottling:false}:{}),devTools:debugEnabled,additionalArguments:debugEnabled?['--orbit-dev-debug']:[] } });
  const current=window;
  for(const event of ['show','hide','minimize','restore'])current.on(event,()=>discordPresence?.setContext({visible:current.isVisible()&&!current.isMinimized()}));
  if(smoke)current.webContents.on('console-message',event=>console.error(event.message));
  if(debugEnabled){debugLog.record('lifecycle','renderer-created');current.webContents.on('console-message',()=>debugLog.record('renderer','console-event'));current.webContents.on('render-process-gone',()=>debugLog.record('lifecycle','renderer-exited'));}
  current.on('closed',()=>{if(window===current)window=null;});
  current.webContents.on('did-finish-load',()=>{current.webContents.setZoomFactor(store.accessibility.scale);if(clips?.child)current.webContents.send('clips:status',clips.snapshot());});
  if(!smoke){try{if(!tray)tray=attachTray({app,window,restart:restartOrbit,ensureWindow:()=>openMainWindow(),games:()=>library(),navigate:async command=>{const w=await openMainWindow();if(w.isMinimized())w.restore();w.show();w.focus();await w.webContents.executeJavaScript('window.orbitTrayActions.run('+JSON.stringify(command)+')');},icon:path.join(__dirname,'assets/tray.png'),keepRunning:()=>store.settings.closeToTray!==false,isQuitting:()=>quitting||updatingRestart});else tray.bindWindow(current);}catch(error){console.error('System tray unavailable:',error.message);}}
  themeIcon?.apply(current,tray);
  if((!smoke&&tray)||memorySmoke)idleRenderer(current,{delay:memorySmoke?300:2000,canSleep:async()=>{if(quitting||updatingRestart||controllerHandoff?.current||customArtwork?.busy||startupMedia?.busy||saveBackups?.busy)return false;return current.webContents.executeJavaScript(`(()=>{if(!window.orbitReady||document.querySelector('#orbit-boot')||document.querySelector('dialog[open]'))return false;localStorage.setItem('orbit-resume-workspace',window.orbitShell?.current()||'library');localStorage.setItem('orbit-resume-scroll',String(document.querySelector('main')?.scrollTop||0));return true;})()`);},beforeSleep:()=>{windowLayout={bounds:current.getNormalBounds(),maximized:current.isMaximized()};windowSleeping=true;}});
  window.once('ready-to-show',()=>{if(smoke)return;if(restored){if(windowLayout?.maximized)current.maximize();current.show();return;}if(process.argv.includes('--background'))return;if(updateLaunch.background){current.showInactive();return;}const action=startupWindowAction({args:process.argv,startMinimized:store.settings.startMinimized,trayAvailable:Boolean(tray)});if(action==='minimized'){current.minimize();current.showInactive();}else if(action==='show')current.show();});
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  const visualReady=smoke?new Promise(resolve=>backgroundChecks?window.webContents.once('did-finish-load',resolve):window.once('ready-to-show',resolve)):null;
  const query=startupQuery({args:process.argv,restored,updateResume:updateLaunch.resume,migrated:desktopStartupMigrated});
  await current.loadFile(path.join(__dirname, 'ui/index.html'),{query});
  return {current,visualReady};

}

app.whenReady().then(async () => {
  if(!primaryInstance)return;
  const loginLaunch=process.argv.includes('--startup');
  const startupCache=smoke?Promise.resolve(null):readCache(path.join(app.getPath('userData'),'library-cache.json')).catch(()=>null);
  if(process.platform==='win32')app.setAppUserModelId(STARTUP_NAME);
  updateRestart=new UpdateRestart(path.join(app.getPath('userData'),'update-restart.json'));
  updateLaunch=await updateRestart.consume(!smoke&&(process.argv.includes('--updated')||process.argv.includes('--restart-orbit')));
  store = defaults();
  try {
    const recovered = smoke?{data:defaults()}:await profilePreferences.readJson(dataPath(),d=>Array.isArray(d.imports)&&Array.isArray(d.remembered)&&d.preferences&&typeof d.preferences==='object');const loaded=recovered.data;if(recovered.recovered)scanWarnings.push('Settings recovered from the previous saved copy.');
    if (!Array.isArray(loaded.imports) || !Array.isArray(loaded.remembered) || !loaded.preferences || typeof loaded.preferences !== 'object') throw new Error('Invalid library data.');
    store = { ...store, ...loaded, remembered:retainedRecords(loaded.remembered),settings:{...settingsDefaults,...loaded.settings} };
  } catch (e) {
    if (e.code !== 'ENOENT') { await fs.copyFile(dataPath(), dataPath() + '.backup-' + Date.now()).catch(() => {}); scanWarnings.push('The library file could not be read; a backup was kept.'); }
  }
  if(!smoke&&app.isPackaged&&migrateDesktopStartup(store,app.getVersion())){desktopStartupMigrated=true;await save();}
  if(loginStartup.available)try{const startup=loginStartup.reconcile(store.settings.launchAtLogin);if(typeof store.settings.launchAtLogin!=='boolean')store.settings.launchAtLogin=startup.launchAtLogin;}catch{scanWarnings.push('Windows startup needs attention. Check Launch at login in Settings.');}
  uiPreferences=await new profilePreferences.UiPreferences(path.join(app.getPath('userData'),'ui-preferences.json')).load().catch(error=>{scanWarnings.push('Interface settings need recovery; existing files were kept.');const p=new profilePreferences.UiPreferences(path.join(app.getPath('userData'),'ui-preferences-recovered.json'));p.recovery={message:'Saved interface settings need recovery. Original files are kept in your data folder.'};return p;});
  themeIcon=new (require('./theme-icon.cjs').ThemeIcon)({folder:path.join(app.getPath('userData'),'theme-icons'),nativeImage:require('electron').nativeImage,appId:STARTUP_NAME,window:()=>window,tray:()=>tray,taskbar:process.platform==='win32'&&app.isPackaged&&!smoke&&!debugEnabled?new (require('./windows-taskbar-icon.cjs').TaskbarIcon)({folder:path.join(app.getPath('appData'),'Microsoft/Internet Explorer/Quick Launch/User Pinned/TaskBar'),folders:[app.getPath('desktop'),path.join(app.getPath('appData'),'Microsoft/Windows/Start Menu/Programs')],backupFolder:path.join(app.getPath('userData'),'taskbar-shortcut-backups'),iconFolder:path.join(app.getPath('userData'),'theme-icons'),executable:process.execPath,appId:STARTUP_NAME,read:file=>shell.readShortcutLink(file),write:(file,operation,options)=>shell.writeShortcutLink(file,operation,options)}):null});await themeIcon.update(uiPreferences.state.values).catch(error=>console.error('Theme icon:',error.message));
  store.settings.lowMemoryRendering=lowMemoryApplied;
  try{store.discord=require('./discord-presence.cjs').config(store.discord||{});}catch{store.discord={...require('./discord-presence.cjs').DEFAULTS};}
  discordPresence=new (require('./discord-presence.cjs').DiscordPresence)({notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('discord:update',data);}});
  await discordPresence.configure(store.discord,smoke||shortcutRequest.requested||offline());

  store.collectionStyles=require('./ui/collection-design.js').styles(store.collectionStyles);
  try{store.smartCollections=collectionState.smartDefinitions(store.smartCollections||[]);}catch{store.smartCollections=[];scanWarnings.push('Saved smart collections could not be read.');}store.addedAt=collectionState.addedDates(store.addedAt);
  try{store.wishlist=wishlist.validate(store.wishlist||[]);}catch{store.wishlist=[];scanWarnings.push('Saved wishlist could not be read.');}
  try{store.accessibility=accessibility.validate(store.accessibility||{});}catch{store.accessibility=accessibility.validate({});}
  const startupReads=[],startupRead=promise=>startupReads.push(Promise.resolve(promise).then(()=>({status:'fulfilled'}),reason=>({status:'rejected',reason})));
  releaseCalendar=new ReleaseCalendar({file:path.join(app.getPath('userData'),'upcoming-calendar.json'),offline,notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('calendar:update',data);}});startupRead(releaseCalendar.load().then(()=>{if(!smoke)releaseCalendar.start();}));
  customArtwork=new CustomArtwork(path.join(app.getPath('userData'),'custom-artwork'));startupRead(customArtwork.load().catch(()=>scanWarnings.push('Custom artwork index could not be read. Images were kept.')));
  installations=new InstallationManager({smoke,stateFile:path.join(app.getPath('userData'),'installer-downloads.json'),fetchImpl:(url,options)=>net.fetch(url,options),openFile:file=>shell.openPath(file),openExternal:url=>shell.openExternal(url),emit:()=>{if(window&&!window.isDestroyed())window.webContents.send('downloads:changed');}});startupRead(installations.load().catch(()=>scanWarnings.push('Installer download history could not be read. Downloaded files were kept.')));
  if(debugEnabled||smoke)clips=new (require('./clips.cjs').Clips)({app,desktopCapturer,globalShortcut,folder:smoke?path.join(app.getPath('userData'),'test-clips'):path.resolve(typeof store.clipsFolder==='string'&&path.isAbsolute(store.clipsFolder)?store.clipsFolder:path.join(app.getPath('videos'),'Orbit Clips')),root:path.join(app.getPath('userData'),'clips-buffer'),notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('clips:status',data);tray?.updateClips?.(data,()=>clips.save().catch(()=>{}),()=>clips.stop().catch(()=>{}));}});
  gameStorage=new StorageManager({games:()=>baseLibrary(),preferences:()=>store.preferences});
  discordFriends=new DiscordFriends(new DiscordReadOnlyBridge(new DiscordSdkBridge({directory:app.isPackaged?path.join(process.resourcesPath,'app.asar.unpacked/src/native/discord'):path.join(__dirname,'native/discord'),userData:app.getPath('userData'),allowUnverified:developmentFriendsEnabled(app.getVersion())})));
  if(!smoke&&store.settings.rememberAccounts&&store.settings.autoLoadFriends&&!offline()){const resume=()=>{if(!quitting&&store.settings.rememberAccounts&&store.settings.autoLoadFriends&&!offline()&&!discordFriends.snapshot().connected)discordFriends.resume().catch(()=>{});};if(loginLaunch)setTimeout(resume,5000).unref();else resume();}
  if(!store.settings.rememberAccounts)await discordFriends.forget();
  social=new SteamFriends();socialVault=new SocialCredentials(path.join(app.getPath('userData'),'social-credentials.json'),safeStorage);
  if(!smoke&&store.settings.rememberAccounts)startupRead(socialVault.load().then(credential=>{if(credential)social.configure(credential.steamId,credential.key,true);}));
  tracker = new PlaytimeTracker(path.join(app.getPath('userData'), 'playtime.json'), updates => { if (window && !window.isDestroyed()) window.webContents.send('playtime:update', updates); },{enabled:()=>store.settings.localPlaytime!==false});
  store.collections||=['Playing','Backlog','Finished'];
  history=new ActivityHistory(path.join(app.getPath('userData'),'activity-history.json'));startupRead(history.load().catch(async()=>{try{await fs.copyFile(history.file,history.file+'.backup-'+Date.now());scanWarnings.push('Session history could not be read. A recovery copy was kept.');}catch{store.settings.recordHistory=false;scanWarnings.push('History could not be read or backed up. Recording is paused.');}}));
  const startupResults=await Promise.all(startupReads);for(const result of startupResults)if(result.status==='rejected')throw result.reason;
  runningGames=new RunningGames({configs:()=>tracker.configs,games:()=>library().map(g=>{const p=store.preferences[g.id]?.profile;return p?.executable?{...g,installed:true,versions:[{executable:p.executable}]}:g;}),emit:data=>{controllerHandoff?.observe(data);discordPresence?.setSessions(data.map(row=>({...row,hidden:store.preferences[row.id]?.hidden===true})));discordPresence?.configure(store.discord,smoke||offline()||discordSleeping).catch(()=>{});if(store.settings.localPlaytime)tracker.observeRunning(library(),[...runningGames.sessions.values()]).catch(()=>{});backupScheduler?.observe(data);history.observe(data,store.settings.recordHistory).catch(()=>{});const ended=recaps.observe(history,library(),store.settings.recordHistory);if(store.settings.sessionRecaps&&window&&!window.isDestroyed())for(const item of ended)window.webContents.send('recaps:ready',item);if(window&&!window.isDestroyed())window.webContents.send('sessions:update',data);}});
  downloadCenter=new DownloadCenter({history:store.downloadHistory});
  controllerHandoff=new (require('./controller-handoff.cjs').ControllerHandoff)({focus:id=>{if(smoke)return Promise.resolve();window?.focus();return runningGames.focus(id);},notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('couch:handoff',data);},hold:()=>{if(smoke||!window||window.isDestroyed())return;window.setAlwaysOnTop(true,'screen-saver');window.setFullScreen(true);window.restore();window.show();window.focus();},release:()=>{if(!smoke&&window&&!window.isDestroyed())window.setAlwaysOnTop(false);},transition:async()=>{if(!smoke&&window&&!window.isDestroyed())await window.webContents.executeJavaScript('window.OrbitGameHandoff?.depart()');},hide:()=>{if(!smoke)window?.minimize();},restore:id=>{if(smoke)return;openMainWindow().then(w=>{w.setAlwaysOnTop(false);w.restore();w.setFullScreen(true);w.show();w.focus();w.webContents.send('couch:return',id);}).catch(()=>{});}});
  if(!smoke){const poll=async()=>{if(quitting)return;try{await runningGames.scan();}catch{}if(!quitting)scheduleRunningPoll(controllerHandoff.current?(controllerHandoff.current.handed?5000:750):(window?.isVisible()&&!window.isMinimized())||runningGames.sessions.size?15000:30000);};scheduleRunningPoll=ms=>{clearTimeout(runningTimer);runningTimer=setTimeout(poll,ms);runningTimer.unref();};scheduleRunningPoll(loginLaunch?5000:1000);
   // Signal 0 only probes existence. A native scan confirms exit and identity before returning.
   handoffProbe=setInterval(async()=>{const s=controllerHandoff.current;if(quitting||handoffProbeBusy||!s?.handed||!Number.isSafeInteger(s.pid))return;try{process.kill(s.pid,0);return;}catch(error){if(error.code!=='ESRCH')return;}handoffProbeBusy=true;try{await runningGames.scan();}catch{}finally{handoffProbeBusy=false;}},250);handoffProbe.unref();
  }
  await tracker.load({updated:updateLaunch.resume});
  saveBackups=new SaveBackups(path.join(app.getPath('userData'),'save-backups'));await saveBackups.load().catch(()=>scanWarnings.push('Save backup index could not be read. Existing backup files were kept.'));
  backupScheduler=new BackupScheduler({backups:saveBackups,checkClosed:async id=>{await runningGames.scan();return !runningGames.sessions.has(id)&&!tracker.ledger.sessions.has(id)&&!tracker.pending.has(id);},notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('saves:status',data);}});
  if(!smoke)try{const data=await startupCache;if(data){records=compactRecords(data.records);mergedCache=null;scannedAt=data.scannedAt||0;steamRoot=data.steamRoot;for(const [id,hero]of data.hero)heroCache.set(id,hero);cachedLibrary=records.length>0;}}catch{}
  await tracker.resumeAfterUpdate(library());

  downloadCenter.observe(library());
  powerMonitor.on('suspend', () => {discordSleeping=true;discordPresence?.configure(store.discord,true).catch(()=>{});recaps.suspend();history.finish().catch(()=>{});tracker.suspend().catch(() => {});});
  powerMonitor.on('resume', () => {discordSleeping=false;discordPresence?.configure(store.discord,smoke||offline()).catch(()=>{});runningGames?.scan().catch(()=>{});tracker.resume();});
  launchReadyResolve();
  if(shortcutRequest.requested){
    try{if(shortcutRequest.error)throw Error(shortcutRequest.error);const result=await dispatchShortcut(shortcutRequest.id);if(smoke){const out=process.env.ORBIT_SMOKE_DIR||app.getPath('temp');await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'shortcut-launch.json'),JSON.stringify({passed:true,windowCreated:Boolean(window),result},null,2));}await tracker.shutdown();await saving;app.exit(0);}catch(error){if(smoke)console.error(error.message);else dialog.showErrorBox('Could not launch game',error.message+'\nOpen Orbit to repair or recreate this shortcut.');await tracker.shutdown();app.exit(1);}return;
  }
  const updateSupport=!smoke&&app.isPackaged&&process.platform==='win32'&&await exists(path.join(process.resourcesPath,'app-update.yml'));
  updates=new OrbitUpdater({driver:updateSupport?require('electron-updater').autoUpdater:null,version:app.getVersion(),settings:()=>({...store.settings,autoUpdates:store.settings.autoUpdates&&!offline()}),canRestart:async()=>{if(quitting||updatingRestart||manualRestart?.pending)return false;if(!smoke)await runningGames.scan().catch(()=>{});if(clips?.child)return false;return readyForUpdate({window,customArtwork,startupMedia,saveBackups,backupScheduler});},beforeRestart:async({automatic})=>{if(quitting||updatingRestart||manualRestart?.pending)throw Error('Orbit is already restarting.');updatingRestart=true;await tracker.checkpoint();await history.finish({restart:true});await saving;await updateRestart.save(backgroundRestart({automatic,window,playing:runningGames.sessions.size>0||tracker.ledger.sessions.size>0}));},restartFailed:()=>{if(quitting||manualRestart?.pending)return;updatingRestart=false;updateRestart.clear().catch(console.error);},notify:data=>{if(window&&!window.isDestroyed())window.webContents.send('updates:status',data);}});
  setupHandlers();
  const {visualReady}=await buildMainWindow();
  if(!smoke&&!offline())updates.start();
  if(memorySmoke){
    if(backgroundChecks){console.error('Memory lifecycle validation requires an explicit --interactive-checks run when no game is in use.');await prepareExit();app.exit(1);return;}
    const wait=ms=>new Promise(r=>setTimeout(r,ms)),metrics=async()=>{const rows=app.getAppMetrics(),ids=rows.map(r=>r.pid),query=ids.map(id=>'IDProcess = '+id).join(' OR ');let privateWorkingSetKB=null;try{const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',`$n=(Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Filter "${query}" | Measure-Object WorkingSetPrivate -Sum).Sum; [Console]::Write([math]::Round($n/1024))`],{windowsHide:true,timeout:10000});privateWorkingSetKB=Number(stdout.trim());}catch{}return {privateWorkingSetKB,privateKB:rows.reduce((n,r)=>n+(r.memory?.privateBytes||0),0),workingSetKB:rows.reduce((n,r)=>n+(r.memory?.workingSetSize||0),0),renderers:rows.filter(r=>r.type==='Tab').length,processes:rows.map(r=>({type:r.type,privateKB:r.memory?.privateBytes,workingSetKB:r.memory?.workingSetSize})),main:process.memoryUsage()};};
    try{
      for(let i=0;i<200;i++){if(await window.webContents.executeJavaScript('Boolean(window.orbitReady)&&!document.querySelector("#orbit-boot")'))break;await wait(100);}
      await window.webContents.executeJavaScript('document.querySelectorAll("dialog[open]").forEach(d=>d.close())');window.show();await wait(1000);
      const visible=await metrics(),oldWindow=window;oldWindow.hide();for(let i=0;i<100&&!oldWindow.isDestroyed();i++)await wait(100);if(!oldWindow.isDestroyed())throw Error('Hidden renderer did not unload');await wait(1000);const trayMemory=await metrics();if(trayMemory.renderers)throw Error('Renderer remains alive');if(tracker.stopped)throw Error('Tracker stopped in tray');
      const restored=await openMainWindow();for(let i=0;i<100;i++){if(await restored.webContents.executeJavaScript('Boolean(window.orbitReady)&&!document.querySelector("#orbit-boot")'))break;await wait(100);}restored.show();await wait(300);
      const interactive=await restored.webContents.executeJavaScript('(async()=>{const b=document.querySelector("#game-grid [data-game]");if(!b)return false;b.click();await new Promise(r=>setTimeout(r,300));const result=document.querySelector("#modal").open;closeModal();return result;})()');if(!interactive)throw Error('Restored library is not interactive');
      const report={passed:true,visible,tray:trayMemory,restored:await metrics(),backgroundTrackingAlive:!tracker.stopped,restoredLibraryClickable:interactive};const out=process.env.ORBIT_SMOKE_DIR||app.getPath('temp');await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'memory-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await prepareExit();app.exit(0);
    }catch(error){console.error(error);await prepareExit();app.exit(1);}return;
  }
  if (smoke) {
    try {
      await visualReady;window.webContents.setBackgroundThrottling(false);await window.webContents.executeJavaScript("Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[]});window.orbitFeatures?.setCouch(false)");
      if(process.argv.includes('--couch-focus-test')){await new Promise(r=>setTimeout(r,2000));const debug=await window.webContents.executeJavaScript(`(()=>{state.games=[{id:'a',title:'Alpha',kind:'game',installed:true,versions:[]},{id:'b',title:'Beta',kind:'game',installed:true,versions:[]}];OrbitCouch.open();const home=document.querySelector('#couch-home'),cards=home.querySelectorAll('.couch-row [data-couch-play]');cards[0]?.focus();const before=document.activeElement.outerHTML.slice(0,250);const moved=OrbitCouch.navigate(1,0);return {before,moved,after:document.activeElement.outerHTML.slice(0,250),selected:home.querySelectorAll('.couch-selected').length,title:home.querySelector('h1').textContent,expected:cards[1]?.querySelector('strong').textContent,open:[...document.querySelectorAll('dialog[open]')].map(d=>d.id),enabled:document.documentElement.className};})()`);console.log(JSON.stringify(debug));app.exit(0);return;}

      const target=process.env.ORBIT_SMOKE_DIR||app.getPath('temp');await fs.mkdir(target,{recursive:true});if(backgroundChecks)await new Promise(r=>setTimeout(r,1000));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,1050));await fs.writeFile(path.join(target,'orbit-startup.png'),(await window.webContents.capturePage()).toPNG());
      if(process.argv.includes('--visual-smoke'))window.showInactive();
      for (let i = 0; i < 150; i++) {
        if (await window.webContents.executeJavaScript('Boolean(window.orbitReady)')) break;
        await new Promise(r => setTimeout(r, 200));
      }
      if(process.argv.includes('--popup-scale-smoke')){const report=await require('./popup-scale-validation.cjs')({window,target,uiPreferences});await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--popup-smoke')){const report=await require('./popup-validation.cjs')({window,target});await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--interaction-smoke')){const report=await require('./interaction-validation.cjs')({window,target});await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--readability-smoke')){const report=await require('./readability-validation.cjs')({window,target});await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--alignment-smoke')){const report=await require('./alignment-validation.cjs')({window,target});await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--desktop-smoke')){const report={passed:true,checks:[]};await runDesktopValidation(report,target);await fs.writeFile(path.join(target,'desktop-report.json'),JSON.stringify(report,null,2));await prepareExit();app.exit(report.passed?0:1);return;}
      if(process.argv.includes('--controller-smoke')){const report={passed:true,checks:[]};await runControllerValidation(report,target);await runFlowValidation(report,target);await fs.writeFile(path.join(target,'controller-report.json'),JSON.stringify(report,null,2));await prepareExit();app.exit(report.passed?0:1);return;}
      const report = await window.webContents.executeJavaScript('window.runSmokeTests()');
      const shortcutSample=library().find(g=>g.installed&&g.kind==='game');
      if(shortcutSample){
        const result=await window.webContents.executeJavaScript('window.orbit.createShortcut('+JSON.stringify(shortcutSample.id)+')'),link=shell.readShortcutLink(result.path);
        report.checks.push({name:'Windows desktop shortcut is written and readable with the saved game identifier',passed:link.args.includes(shortcuts.launchArgument(shortcutSample.id))&&path.resolve(link.target).toLowerCase()===path.resolve(process.execPath).toLowerCase()});
        const visible=window.isVisible();lastShortcutResult=undefined;app.emit('second-instance',{},[process.execPath,shortcuts.launchArgument(shortcutSample.id)]);for(let i=0;i<100&&!lastShortcutResult;i++)await new Promise(r=>setTimeout(r,50));
        report.checks.push({name:'shortcut dispatch reuses running Orbit without showing its main window',passed:Boolean(lastShortcutResult?.action)&&window.isVisible()===visible});
      }
      const originalRoblox=store.roblox;try{
        const entry=experienceEntry({title:'Shortcut test experience',url:'https://www.roblox.com/games/12345/'});store.roblox={mode:'app',games:[entry]};mergedCache=null;
        const game=library().find(g=>g.robloxPlaceId),result=await createDesktopShortcut(game.id);const launch=await dispatchShortcut(game.id);
        report.checks.push({name:'saved experience shortcut preserves its specific place and direct-app launch mode',passed:shell.readShortcutLink(result.path).args.includes(shortcuts.launchArgument(game.id))&&launch.action?.value==='roblox://placeId=12345'});
      }finally{store.roblox=originalRoblox;mergedCache=null;await save();}
      report.passed&&=report.checks.every(c=>c.passed);
      // Exercise real backup and restore IPC against the isolated smoke profile.
      const testBackup=path.join(target,'test-backup.json'),originalSave=dialog.showSaveDialog,originalOpen=dialog.showOpenDialog;
      await fs.mkdir(target,{recursive:true});
      try{
        const testInstaller=path.join(target,'test-installer.msi');await fs.writeFile(testInstaller,'isolated fixture, never executed');const testArtwork=path.join(target,'selected-artwork.png');await require('sharp')({create:{width:600,height:800,channels:3,background:'#5787a9'}}).png().toFile(testArtwork);const testSaves=path.join(target,'selected-saves');await fs.mkdir(testSaves,{recursive:true});await fs.writeFile(path.join(testSaves,'save.dat'),'Orbit isolated save test');dialog.showSaveDialog=async()=>({canceled:false,filePath:testBackup});dialog.showOpenDialog=async(_parent,options)=>({canceled:false,filePaths:[options?.title==='Choose game installer'?testInstaller:['Choose custom artwork','Choose theme background','Choose release preview'].includes(options?.title)?testArtwork:options?.properties?.includes('openDirectory')?testSaves:testBackup]});
        const checks=await window.webContents.executeJavaScript(`(async()=>{
          const checks=[],check=(name,passed)=>checks.push({name,passed:Boolean(passed)}),g=state.games.find(g=>g.kind==='game'&&!g.robloxPlaceId);
          check('developer capability matches the native source-only gate',Boolean(window.orbitDebug)===${debugEnabled});
          if(window.orbitDebug){const debugData=await window.orbitDebug.snapshot();check('developer diagnostics expose counts and process metrics without account data',Array.isArray(debugData.processes)&&debugData.profile==='Isolated test profile'&&!('steamId' in debugData));const beforePreview=await window.orbit.updateStatus();await window.orbitDebug.action('preview-update');await new Promise(r=>setTimeout(r,40));check('developer update simulation shows a preview without changing the updater',Boolean(document.querySelector('.startup-update-notice'))&&JSON.stringify(beforePreview)===JSON.stringify(await window.orbit.updateStatus()));await window.orbitDebug.action('clear-preview');let denied=false;try{await window.orbitDebug.action('install-update');}catch{denied=true;}check('developer actions reject unlisted commands',denied);}
          const ui=Object.fromEntries(['orbit-themes-v1','orbit-motion'].flatMap(k=>localStorage.getItem(k)?[[k,localStorage.getItem(k)]]:[]));
          const wallpaper=await window.orbit.chooseThemeImage();check('theme image picker normalizes an isolated image through real IPC',wallpaper.data.startsWith('data:image/webp;base64,')&&wallpaper.mode==='auto');const imageTheme={schemaVersion:1,name:'Smoke image',colors:OrbitTheme.builtins[0].colors,image:wallpaper};check('theme export includes portable background image through real IPC',await window.orbit.exportTheme(imageTheme));const importedTheme=await window.orbit.importTheme();check('theme import preserves background and automatic accent mode',importedTheme.image.data.startsWith('data:image/webp;base64,')&&importedTheme.image.mode==='auto');
          const releasePreview=await window.orbit.chooseUpcomingImage();check('release preview picker prepares bounded local game artwork through IPC',releasePreview.startsWith('data:image/webp;base64,')&&releasePreview.length<350000);
          const releaseDate=new Date().toLocaleDateString('en-CA'),releaseSaved=await window.orbit.saveUpcoming({title:'Isolated preview check',date:releaseDate,platforms:'Test',image:releasePreview});const releaseEntry=releaseSaved.customReleases.find(g=>g.title==='Isolated preview check');check('custom release saves its preview and date through IPC',Boolean(releaseEntry)&&releaseEntry.image===releasePreview);
          check('custom release preview renders without a remote request',await window.orbit.upcomingImage(releaseEntry.id)===releasePreview);const releaseRemoved=await window.orbit.removeUpcoming(releaseEntry.id);check('custom release removal updates the saved calendar',!releaseRemoved.customReleases.some(g=>g.id===releaseEntry.id));
          const discordBefore=await window.orbit.discordPresence();check('Discord Rich Presence defaults to opt-in without a bundled account token',!discordBefore.config.enabled&&discordBefore.config.clientId==='1562367343601123348');
          const discordSaved=await window.orbit.saveDiscordPresence({enabled:false,clientId:'123456789012345678',showNames:false,showElapsed:false});const discordRead=await window.orbit.discordPresence();check('Discord bundled identity and privacy choices persist through actual IPC without connecting',discordRead.config.clientId==='1562367343601123348'&&!discordRead.config.showNames&&!discordRead.config.showElapsed&&discordSaved.status.phase==='disabled');await window.orbit.saveDiscordPresence(discordBefore.config);
          const migratedDiscord=await window.orbit.saveDiscordPresence({enabled:false,clientId:'legacy-custom-id'});check('Discord uses the bundled Orbit application without user ID setup',migratedDiscord.config.clientId==='1562367343601123348');await window.orbit.saveDiscordPresence(discordBefore.config);
          const smart=await window.orbit.smartCollections();check('smart collections expose built-in metadata filters',smart.some(d=>d.id==='unplayed'));
          const custom=await window.orbit.saveSmartCollection({name:'Smoke smart',rule:OrbitCollections.rule({status:'installed'})});check('custom smart rules persist through IPC',custom.some(d=>d.name==='Smoke smart'));
          const installationStorage=await window.orbit.gameStorage();check('storage lists detected drives and trusted installation folders',Array.isArray(installationStorage.drives)&&Array.isArray(installationStorage.installations)&&installationStorage.installations.every(r=>typeof r.id==='string'&&r.bytes!==undefined));
          await window.orbitExtras.storage();check('storage view opens in actual app',Boolean(document.querySelector('#game-storage [data-storage-rows]')));check('storage bounds rendered installations to forty rows',document.querySelectorAll('.storage-entry').length<=40);check('storage exposes search, ordering and known-size summary',Boolean(document.querySelector('#game-storage [name=query]'))&&Boolean(document.querySelector('#game-storage [name=sort]'))&&Boolean(document.querySelector('[data-storage-known]')));const storageSearch=document.querySelector('#game-storage [name=query]');storageSearch.value='this game does not exist xyz';storageSearch.dispatchEvent(new Event('input'));check('storage search filters installations without a new folder scan',!document.querySelector('.storage-entry')&&Boolean(document.querySelector('#game-storage .management-empty')));closeModal();
          await OrbitSteam.panel();check('experimental Steam access stays opt-in and has an explicit supported fallback',Boolean(document.querySelector('[data-enable-bridge]'))&&Boolean(document.querySelector('[data-open-steam-downloads]')));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));
          await OrbitInstall.install();check('hybrid install menu offers local files and native downloads',Boolean(document.querySelector('#installation-dialog[open] [data-local-install]'))&&Boolean(document.querySelector('[data-url-install]')));document.querySelector('[data-url-install]').click();check('installer download form stays inside Orbit',Boolean(document.querySelector('#installer-url'))&&Boolean(document.querySelector('#installation-dialog [data-orbit-help]')));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));
          await OrbitInstall.fromFile();check('local installer confirmation uses Orbit rather than a system message box',document.querySelector('#installation-dialog [data-run-file]')&&document.querySelector('.installation-summary').textContent.includes('test-installer.msi'));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));const stagedFile=await window.orbit.runInstaller();check('the approved installer crosses real IPC without executing in smoke mode',(await window.orbit.confirmInstaller({token:stagedFile.token,confirmed:true})).message.includes('Setup opened'));let staleFile=false;try{await window.orbit.confirmInstaller({token:stagedFile.token,confirmed:true});}catch{staleFile=true;}check('installer approval tokens cannot be replayed',staleFile);
          showAdd();await document.querySelector('#add-installer').onclick();check('Add game uses the same installer confirmation as Settings and Downloads',Boolean(document.querySelector('#installation-dialog[open] [data-run-file]')));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));closeModal();
          const removalGame=state.games.find(x=>x.installed&&!x.robloxPlaceId);if(removalGame){await OrbitInstall.uninstall(removalGame.id);check('uninstall chooser lists installed copies and explains its handler',Boolean(document.querySelector('#installation-dialog[open] [name=remove-copy]'))&&Boolean(document.querySelector('[data-removal-summary]')));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));}

          await window.orbitExtras.smartEditor();check('smart rule editor opens in actual app',Boolean(document.querySelector('#smart-form')));closeModal();
          if(g){await window.orbit.updateSettings({offlineMode:true});const news=await window.orbit.gameNews({id:g.id});check('offline game news avoids network fetching',!news.supported||news.offline===true);await window.orbit.updateSettings({offlineMode:false});}
          check('full backup exports through real IPC',await window.orbit.backup(ui));
          const before=await window.orbit.collections();await window.orbit.saveCollection({name:'Smoke restore check'});
          if(g){await window.orbit.assignCollections({id:g.id,names:['Smoke restore check']});await window.orbit.saveLaunchProfile({id:g.id,value:{args:['--literal=a b'],controller:'couch',tools:[]}});check('launch profile and membership persist through IPC',(await window.orbit.launchProfile(g.id)).args[0]==='--literal=a b'&&(await window.orbit.details(g.id)).collections.includes('Smoke restore check'));await window.orbitFeatures.editProfile(g);check('launch options show plain text and round-trip saved arguments',document.querySelector('#profile-args').value===OrbitLaunchArgs.format(['--literal=a b']));document.querySelector('#profile-args').value='-windowed -name "hello world"';document.querySelector('#launch-profile').requestSubmit();await new Promise(r=>setTimeout(r,250));check('plain-text launch options save through the actual form',JSON.stringify((await window.orbit.launchProfile(g.id)).args)===JSON.stringify(['-windowed','-name','hello world']));closeModal();const modes=await window.orbit.launchChoices(g.id);check('launch modes IPC returns validated choices',Array.isArray(modes.choices)&&typeof modes.ask==='boolean');window.orbitFeatures.chooseLaunch(g.id,{title:g.title,choices:[{id:'example:0',label:'Desktop'},{id:'example:1',label:'VR'}]});check('Orbit launch chooser offers modes and optional remembered selection',document.querySelectorAll('#mode-picker input[name=mode]').length===3&&!document.querySelector('#mode-picker select')&&!document.querySelector('#mode-remember').checked);check('reused launch dialog replays one bubbly entrance or respects reduced motion',allowMotion()?document.querySelector('#modal').getAnimations().filter(a=>a.id==='orbit-dialog-open').length===1:document.querySelector('#modal').getAnimations().filter(a=>a.id==='orbit-dialog-open').length===0);document.querySelectorAll('#mode-picker input[name=mode]')[1].click();check('launch cards preserve single radio selection',document.querySelectorAll('#mode-picker input[name=mode]:checked').length===1&&document.querySelector('#mode-picker input[name=mode]:checked').value==='example:1');document.querySelector('#mode-cancel').click();check('close-game smoke IPC never stops real games',(await window.orbit.closeGame({id:g.id,confirmed:true})).status==='cancelled');
            const closeSettings=await window.orbit.getSettings();await window.orbit.updateSettings({confirmGameClose:true,confirmForceClose:true});
            let unconfirmedClose=false;try{await window.orbit.closeGame({id:g.id,force:true});}catch{unconfirmedClose=true;}check('force closing requires Orbit confirmation while the warning is enabled',unconfirmedClose);
            const cancelledClose=window.orbitFeatures.closeGame(g.id,true);for(let wait=0;wait<40&&!document.querySelector('.game-close-dialog[open]');wait++)await new Promise(r=>setTimeout(r,20));
            check('force-close warning uses a themed Orbit dialog with Cancel focused',Boolean(document.querySelector('.game-close-dialog[open]'))&&document.activeElement?.id==='game-close-cancel');
            document.querySelector('#game-close-remember').checked=true;document.querySelector('#game-close-cancel').click();await cancelledClose;
            check('cancelling does not save the do-not-show-again choice',(await window.orbit.getSettings()).confirmForceClose===true);
            const confirmedClose=window.orbitFeatures.closeGame(g.id,true);for(let wait=0;wait<40&&!document.querySelector('.game-close-dialog[open]');wait++)await new Promise(r=>setTimeout(r,20));
            document.querySelector('#game-close-remember').checked=true;document.querySelector('#game-close-form').requestSubmit();await confirmedClose;
            const rememberedClose=await window.orbit.getSettings();check('force-close preference persists independently of normal close',rememberedClose.confirmForceClose===false&&rememberedClose.confirmGameClose===true);
            await window.orbitFeatures.closeGame(g.id,true);check('disabled warning skips the dialog without affecting normal-close confirmation',!document.querySelector('.game-close-dialog')&&(await window.orbit.getSettings()).confirmGameClose===true);
            await window.orbit.updateSettings({confirmGameClose:closeSettings.confirmGameClose,confirmForceClose:closeSettings.confirmForceClose});
            showSettings();check('General settings expose separate close-warning switches',Boolean(document.querySelector('#panel-general [data-setting=confirmGameClose]'))&&Boolean(document.querySelector('#panel-general [data-setting=confirmForceClose]')));closeModal();
}
          const preview=await window.orbit.previewRestore();check('backup restore preview contains settings and local hours',Number.isFinite(preview.hours)&&Number.isFinite(preview.preferences));
          const restored=await window.orbit.restore(ui);absorb(restored.library);check('backup restores original collections without test entries',JSON.stringify(await window.orbit.collections())===JSON.stringify(before));check('backup retains smart collection rules',(await window.orbit.smartCollections()).some(d=>d.name==='Smoke smart'));await window.orbit.saveSmartCollection({id:custom.find(d=>d.name==='Smoke smart').id,remove:true});
          check('cleanup scans real library without changing files',Array.isArray(await window.orbit.cleanup()));
          await window.orbit.updateSettings({offlineMode:true});const local=await window.orbit.getLibrary();check('offline library keeps local games available',local.offline&&local.games.length>0);let blocked=false;try{await window.orbit.deals('US');}catch{blocked=true;}check('offline mode blocks online store requests',blocked);await window.orbit.updateSettings({offlineMode:false});absorb(await window.orbit.getLibrary());

          if(g){
            const original=await window.orbit.personal(g.id);await window.orbit.savePersonal({id:g.id,value:{notes:'Smoke notes <literal> and controls',aliases:['Smoke alias']}});
            const detail=await window.orbit.details(g.id);check('notes and aliases persist through real IPC',detail.notes.includes('<literal>')&&detail.aliases.includes('Smoke alias'));
            absorb(await window.orbit.getLibrary());state.search='Smoke alias';check('saved aliases match real library search',filtered().some(x=>x.id===g.id));state.search='';render();
            await window.orbit.savePersonal({id:g.id,value:original});
          }
          const beforeHours=(await window.orbit.getLibrary()).games.filter(x=>x.storePlaytimeKnown).map(x=>[x.id,x.playtime]);
          await window.orbit.clearPrivateData({kind:'history',confirmed:true});check('confirmed history clearing removes only local history',(await window.orbit.history()).sessions.length===0);
          await window.orbit.clearPrivateData({kind:'hours',confirmed:true});const afterHours=(await window.orbit.getLibrary()).games.filter(x=>x.storePlaytimeKnown).map(x=>[x.id,x.playtime]);check('resetting local hours preserves platform hours',JSON.stringify(beforeHours)===JSON.stringify(afterHours));
          if(g){await window.orbit.savePersonal({id:g.id,value:{notes:'Delete only test notes',aliases:['Delete alias']}});await window.orbit.clearPrivateData({kind:'notes',confirmed:true});const cleared=await window.orbit.personal(g.id);check('confirmed note clearing also clears alternate names',cleared.notes===''&&cleared.aliases.length===0);}
          await window.orbit.clearPrivateData({kind:'accounts',confirmed:true});check('forgetting Orbit accounts disables automatic reconnection',(await window.orbit.getSettings()).autoConnectAccounts===false);
          absorb(await window.orbit.getLibrary());
          const health=await window.orbit.libraryHealth();check('library health provides actionable local reports',Number.isInteger(health.checked)&&Array.isArray(health.issues));
          const history=await window.orbit.history();check('local history returns bounded sessions and weekly summary',Array.isArray(history.sessions)&&history.sessions.length<=100&&Number.isFinite(history.weekSeconds));
          const storage=await window.orbit.storageUsage();check('storage reports only recognized cached images',Number.isFinite(storage.bytes)&&Number.isInteger(storage.files));
          const cleaned=await window.orbit.cleanImageCache();check('cache cleanup keeps current library artwork',Number.isFinite(cleaned.freedBytes)&&(await window.orbit.getLibrary()).games.length===state.games.length);
          check('third-party notices are available offline',(await window.orbit.openLicenses()).available);
          const downloads=await window.orbit.downloads();check('download center provides all observed transfers and bounded history',Array.isArray(downloads.items)&&downloads.history.length<=50);
          await window.orbitCare.downloads();check('download center opens in actual app',Boolean(document.querySelector('#download-center [data-download-items]')));const downloadRoot=document.querySelector('#download-center'),downloadSearch=downloadRoot.querySelector('[name=query]'),fixture={items:Array.from({length:95},(_,i)=>({id:state.games[0].id,versionId:'transfer-'+i,title:'Test game '+i,source:'Steam',appId:1091500,progress:{phase:'Download',percent:20,done:200,total:1000}})),native:[{id:'fixture-ready',name:'Ready installer.exe',host:'publisher.test',phase:'Ready to install',done:100,total:100},{id:'fixture-active',name:'Downloading installer.msi',host:'publisher.test',phase:'Downloading',done:40,total:100,rate:10}],history:[],rate:0};window.orbitCare.paintDownloads(downloadRoot,fixture);check('downloads paginate large queues',downloadRoot.querySelectorAll('.download-center-row').length===40);const hasNativeCancel=Boolean(downloadRoot.querySelector('[data-native-cancel]'));const nativeFilter=downloadRoot.querySelector('[name=status]');nativeFilter.value='ready';nativeFilter.dispatchEvent(new Event('change'));check('native downloads expose install and cancellation controls',hasNativeCancel&&Boolean(downloadRoot.querySelector('[data-native-install]')));nativeFilter.value='';nativeFilter.dispatchEvent(new Event('change'));const firstTransfer=downloadRoot.querySelector('.download-center-row');window.orbitCare.paintDownloads(downloadRoot,fixture);check('progress updates retain controls and thumbnail elements',downloadSearch===downloadRoot.querySelector('[name=query]')&&firstTransfer===downloadRoot.querySelector('.download-center-row'));downloadSearch.value='Test game 94';downloadSearch.dispatchEvent(new Event('input'));check('downloads search preserves keyboard focus and filters the queue',downloadRoot.querySelectorAll('.download-center-row').length+downloadRoot.querySelectorAll('[data-download-banner]:not([hidden])').length===1);downloadSearch.value='';downloadSearch.dispatchEvent(new Event('input'));downloadRoot.querySelector('[data-transfer]').click();for(let i=0;i<60&&!document.querySelector('[data-game-connect],[data-client-controls]');i++)await new Promise(r=>setTimeout(r,20));check('launcher download controls use an Orbit popup',Boolean(document.querySelector('#installation-dialog[open] [data-client-controls],#installation-dialog[open] [data-game-connect]')));OrbitInstall.close();await new Promise(r=>setTimeout(r,300));closeModal();
          window.orbitCare.filterEditor();check('advanced filters expose tags and unknown-data choices',document.querySelectorAll('#advanced-filter-form select').length===6);closeModal();
          if(g){
            const originalTags=(await window.orbit.details(g.id)).tags;absorb(await window.orbit.saveTags({id:g.id,tags:['Smoke tag']}));check('personal tags persist and are searchable',OrbitSearch.matches(state.games.find(x=>x.id===g.id),'Smoke tag'));await window.orbit.saveTags({id:g.id,tags:originalTags});
            await window.orbit.chooseSaveFolder(g.id);const schedule=await window.orbit.saveBackupSchedule({id:g.id,value:{afterExit:true,keep:3}});check('automatic backup policies persist through real IPC',schedule.schedule.afterExit&&schedule.schedule.keep===3);
            await window.orbit.stopTimer(g.id);const snapshot=await window.orbit.backupSaves(g.id);check('save backup captures only the isolated selected folder',snapshot.backups.some(b=>b.count===1&&!b.automatic));
            await showDetails(g.id);document.querySelector('[data-save-backups]').click();await new Promise(r=>setTimeout(r,100));check('automatic backup controls appear in real save panel',Boolean(document.querySelector('#backup-schedule')));closeModal();await window.orbit.saveBackupSchedule({id:g.id,value:{afterExit:false,keep:3}});
          }
          const wish=await window.orbit.saveWishlist({title:'Smoke wishlist entry',url:'https://store.steampowered.com/app/10/',target:{amount:1000,currency:'USD'}});check('wishlist entries and targets persist through real IPC',(await window.orbit.wishlist('US')).entries.some(r=>r.id===wish.id&&r.target.amount===1000));
          await window.orbitPlus.wishes();check('wishlist opens in actual app',Boolean(document.querySelector('#wishlist-check')));closeModal();await window.orbit.removeWishlist(wish.id);check('wishlist removal is scoped to saved links',!(await window.orbit.wishlist('US')).entries.some(r=>r.id===wish.id));
          const report=await window.orbit.previewReport({includeTitles:false});check('diagnostic preview omits titles and personal information',!report.report.titles&&!JSON.stringify(report.report).includes('apiKey'));check('reviewed diagnostic report exports through real IPC',await window.orbit.exportReport(report.token));let stale=false;try{await window.orbit.exportReport('invalid-token');}catch{stale=true;}check('report export requires a valid preview token',stale);
          check('readable library table exports through real IPC',await window.orbit.exportTable({hidden:false}));
          await window.orbitPlus.report();check('diagnostic preview opens before sharing',Boolean(document.querySelector('.report-json'))&&!document.querySelector('#report-titles').checked);closeModal();
          const oldAccess=await window.orbit.accessibility();const largeAccess=await window.orbit.saveAccessibility({scale:1.25,contrast:true,focus:true});check('accessibility settings persist through real IPC',(await window.orbit.accessibility()).scale===1.25&&largeAccess.contrast);await window.orbit.saveAccessibility(oldAccess);
          check('session recaps return observed sessions without invented achievements',Array.isArray((await window.orbit.recaps()).items));await window.orbitPolish.sessionRecaps();check('recap view opens in actual app',Boolean(document.querySelector('#session-recaps')));closeModal();
          if(g){const custom=await window.orbit.setArtwork({id:g.id,kind:'cover',choose:true,crop:{fit:'cover',x:25,y:75}});check('custom artwork imports the isolated selected image',Boolean(custom.art.cover.url)&&custom.library.games.find(x=>x.id===g.id).cover===custom.art.cover.url);const cropped=await window.orbit.setArtwork({id:g.id,kind:'cover',choose:false,crop:{fit:'contain',x:50,y:50}});check('custom crop settings persist through real IPC',cropped.art.cover.fit==='contain');const original=await window.orbit.resetArtwork({id:g.id,kind:'cover'});check('restoring artwork removes only the custom override',!original.art.cover&&original.library.games.find(x=>x.id===g.id).cover!==cropped.art.cover.url);await window.orbitPolish.artwork(await window.orbit.details(g.id));check('artwork editor opens in actual app',document.querySelectorAll('[data-art-choose]').length===2);closeModal();}
          check('one workspace bar contains five distinct destinations',document.querySelectorAll('#workspace-tabs [data-workspace]').length===5);
          check('library does not duplicate installation progress',document.querySelector('#downloads').hidden&&!document.querySelector('#downloads details'));
          await window.orbitShell.activate('downloads');check('Downloads opens as a dedicated workspace',Boolean(document.querySelector('#downloads-workspace #download-center'))&&document.querySelector('#library-panel').hidden);
          await window.orbitShell.activate('store');check('Store contains deals and wishlist entry point',Boolean(document.querySelector('#store-workspace #steam-deals'))&&!document.querySelector('#store-workspace').hidden);await new Promise(r=>setTimeout(r,100));check('Radar provides thirty-one release-calendar dates',document.querySelectorAll('#release-calendar [data-release-date]').length===31);await window.orbitShell.activate('library');
          check('automatic Minecraft entries require ownership evidence',!(await window.orbit.getLibrary()).games.some(r=>r.sources.includes('Minecraft')&&r.ownership?.state==='unverified'));
          check('startup video defaults to no local file',await window.orbit.startupVideo()===null);let introRejected=false;try{await window.orbit.saveStartupVideo({token:'../unselected',name:'bad'});}catch{introRejected=true;}check('startup video save requires a native picker token',introRejected);showSettings();document.querySelector('#tab-appearance').click();check('six standard startup scenes and custom video controls are packaged',['bubbles','startrail','constellation','warp','eclipse','nebula'].every(id=>document.querySelector('[data-startup-choice="'+id+'"]'))&&Boolean(document.querySelector('#startup-video-choose')));
          check('startup choices omit redundant descriptions',!document.querySelector('.startup-choice small'));const startupVolume=document.querySelector('#startup-sound-volume'),beforeVolume=startupVolume.value;startupVolume.value=startupVolume.max;startupVolume.dispatchEvent(new Event('input'));check('startup volume fills the complete track at maximum',startupVolume.style.getPropertyValue('--range-progress')==='100%'&&document.querySelector('#startup-sound-value').value===startupVolume.value+'%');check('volume slider is not inset inside text-field padding',getComputedStyle(startupVolume).paddingLeft==='0px'&&getComputedStyle(startupVolume).paddingRight==='0px'&&getComputedStyle(startupVolume).borderLeftWidth==='0px');startupVolume.value=startupVolume.min;startupVolume.dispatchEvent(new Event('input'));check('startup volume fill clears completely at minimum',startupVolume.style.getPropertyValue('--range-progress')==='0%');startupVolume.value=beforeVolume;startupVolume.dispatchEvent(new Event('input')); 
          const startupHelp=document.querySelector('.startup-settings h3 .info-button');startupHelp.click();check('info opens above the active settings dialog with accessible text',startupHelp.getAttribute('aria-expanded')==='true'&&document.querySelector('#orbit-help').matches(':popover-open')&&document.querySelector('#orbit-help').parentElement.id==='modal'&&document.querySelector('#orbit-help').textContent.includes('1080p'));
          OrbitHelp.close();check('info dismisses without changing settings',startupHelp.getAttribute('aria-expanded')==='false'&&document.querySelector('#modal').open);
          startupHelp.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));await new Promise(r=>setTimeout(r,220));check('hover reveals help without clicking',document.querySelector('#orbit-help').matches(':popover-open')&&startupHelp.getAttribute('aria-describedby')==='orbit-help');OrbitHelp.close();
          OrbitStartup.unlock('bigbang');check('the new secret can be unlocked and selected',Boolean(document.querySelector('[data-startup-choice=bigbang]'))&&OrbitStartup.duration('bigbang')===7600&&OrbitStartup.duration('nebula')===3200);closeModal();
          await window.orbitTour.start();check('walkthrough highlights real controls',document.querySelector('#workspace-library').getAttribute('aria-describedby')==='tour-description');const guideOrb=document.querySelector('.tour-orb'),guideNext=document.querySelector('#tour-next').getBoundingClientRect();check('walkthrough has a visible atom guide',!guideOrb.hidden&&Boolean(guideOrb.querySelector('ellipse')));await window.orbitTour.next();const nextGuidePosition=document.querySelector('#tour-next').getBoundingClientRect();check('walkthrough keeps Next in place while highlighting the next control',guideOrb===document.querySelector('.tour-orb')&&document.querySelector('#hero').getAttribute('aria-describedby')==='tour-description'&&Math.abs(guideNext.x-nextGuidePosition.x)<1&&Math.abs(guideNext.y-nextGuidePosition.y)<1);await window.orbitTour.finish();check('walkthrough releases its motion when closed',guideOrb.hidden&&guideOrb.getAnimations({subtree:true}).length===0);
          const privacy=await window.orbit.privacySummary();check('privacy exposes counts without secrets',Number.isInteger(privacy.notes)&&!('apiKey' in privacy));
          let rejected=false;try{await window.orbit.clearPrivateData({kind:'notes'});}catch{rejected=true;}check('clearing data requires explicit confirmation',rejected);
          const notes=await window.orbit.releaseNotes();check('release notes identify the current build',notes.current.version===notes.available.version);
          await window.orbitCompanion.health();check('health review opens in actual app',Boolean(document.querySelector('#health-body .care-summary')));closeModal();
          await window.orbitCompanion.activity();check('activity view opens in actual app',Boolean(document.querySelector('#activity-body .care-summary')));closeModal();
          showSettings();document.querySelector('#tab-privacy').click();check('privacy settings are reachable in actual app',!document.querySelector('#panel-privacy').hidden&&Boolean(document.querySelector('[data-setting=recordHistory]')));closeModal();
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

      await window.webContents.executeJavaScript(`window.orbitShell.activate('downloads')`);
      await new Promise(r=>setTimeout(r,3500));
      await window.webContents.executeJavaScript(`document.querySelector('#downloads-workspace').scrollIntoView({block:'start'});`);
      await new Promise(r=>setTimeout(r,300));
      await fs.writeFile(path.join(target,'orbit-utilities.png'),(await window.webContents.capturePage()).toPNG());
      window.show();window.focus();
      await window.webContents.executeJavaScript(`(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});const root=document.querySelector('#download-center');window.orbitCare.paintDownloads(root,{items:[{id:state.games[0].id,versionId:'paused-fixture',title:'Queued game',source:'Steam',appId:620,progress:{phase:'Queued · Download',active:false,done:0,total:1024**3,percent:0,queueIndex:1}},{id:state.games.find(g=>g.title==='Cyberpunk 2077')?.id||state.games[0].id,versionId:'active-fixture',title:'Cyberpunk 2077',source:'Steam',appId:1091500,progress:{phase:'Download',active:true,done:15*1024**3,total:60*1024**3,percent:25,bytesPerSecond:12*1024**2,etaSeconds:1800,queueIndex:0}}],native:[],history:[],rate:12*1024**2});})()`);await new Promise(r=>setTimeout(r,900));for(let i=0;i<50;i++){if(await window.webContents.executeJavaScript("(()=>{const img=document.querySelector('[data-download-banner] img');return !img||img.complete;})()"))break;await new Promise(r=>setTimeout(r,100));}
      const downloadBannerChecks=await window.webContents.executeJavaScript(`(()=>{const banner=document.querySelector('[data-download-banner]');return [{name:'active download receives a banner above the queue',passed:!banner.hidden&&banner.querySelector('h2').textContent==='Cyberpunk 2077'&&banner.compareDocumentPosition(document.querySelector('[data-download-items]'))&Node.DOCUMENT_POSITION_FOLLOWING},{name:'featured transfer is not duplicated in the queue',passed:document.querySelectorAll('.download-center-row').length===1&&!document.querySelector('[data-transfer-key=client-active-fixture]')},{name:'download banner shows real percentage and throughput',passed:banner.querySelector('progress').value===25&&banner.querySelector('[data-banner-rate]').textContent.includes('/s')}];})()`);report.checks.push(...downloadBannerChecks);report.passed&&=downloadBannerChecks.every(c=>c.passed);
      await fs.writeFile(path.join(target,'orbit-downloads-active.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));");
      await window.webContents.executeJavaScript(`window.orbitShell.activate('store').then(()=>{document.querySelector('#steam-deals').open=true;document.querySelector('#steam-deals').scrollIntoView({block:'start'});});`);
      await new Promise(r=>setTimeout(r,5000));
      await fs.writeFile(path.join(target,'orbit-deals.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript(`window.orbitShell.activate('library');document.querySelector('#steam-deals').open=false;document.querySelector('#main-scroll').scrollTop=0;`);

      const sample = library().find(g => g.title === 'Geometry Dash') || library().find(g => g.achievements?.total);
      if (sample) { await window.webContents.executeJavaScript(`showDetails(${JSON.stringify(sample.id)})`); await new Promise(r => setTimeout(r, 700)); await fs.writeFile(path.join(target, 'orbit-game-details.png'), (await window.webContents.capturePage()).toPNG()); }
      if(sample){
        await window.webContents.executeJavaScript("document.querySelector('[data-desktop-shortcut]')?.scrollIntoView({block:'center'});true");
        await fs.writeFile(path.join(target,'orbit-shortcut-controls.png'),(await window.webContents.capturePage()).toPNG());
        await window.webContents.executeJavaScript("document.querySelector('[data-fps-estimate]')?.click();true");
        for(let i=0;i<85;i++){if(await window.webContents.executeJavaScript("!document.querySelector('[data-fps-estimate]')?.disabled"))break;await new Promise(r=>setTimeout(r,200));}
        const fpsReady=await window.webContents.executeJavaScript("document.querySelectorAll('[data-fps-kind=estimated]').length===16");report.checks.push({name:'hardware FPS button populates all sixteen cells through real IPC',passed:fpsReady});report.passed &&=fpsReady;
        await window.webContents.executeJavaScript("document.querySelector('.fps-panel')?.scrollIntoView({block:'center'});true");
        await fs.writeFile(path.join(target,'orbit-fps-estimates.png'),(await window.webContents.capturePage()).toPNG());
      }
      for(const [name,script]of [
        ['orbit-health.png','window.orbitCompanion.health()'],
        ['orbit-activity.png','window.orbitCompanion.activity()'],
        ['orbit-privacy.png',"showSettings();document.querySelector('#tab-privacy').click()"]
      ]){await window.webContents.executeJavaScript(script);await window.webContents.capturePage();await new Promise(r=>setTimeout(r,220));await fs.writeFile(path.join(target,name),(await window.webContents.capturePage()).toPNG());}
      await window.webContents.executeJavaScript('closeModal();window.orbitExtras.storage()');await new Promise(r=>setTimeout(r,400));await fs.writeFile(path.join(target,'orbit-storage.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript('closeModal();OrbitInstall.install()');await new Promise(r=>setTimeout(r,400));await fs.writeFile(path.join(target,'orbit-install-menu.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,300));
      await window.webContents.executeJavaScript("OrbitSteam.panel({connected:true,folders:[{nFolderIndex:0,strFolderPath:'C:\\\\SteamLibrary',bIsDefaultFolder:true},{nFolderIndex:1,strFolderPath:'D:\\\\SteamLibrary'}],apps:[{gameId:'fixture',versionId:'steam:123',appId:1091500,title:'Cyberpunk 2077',installed:true}],downloads:{items:[{appid:1091500,active:true,paused:false,queue_index:0,downloaded_bytes:1024**3,total_bytes:4*1024**3,percent:25,rate:6*1024**2,etaSeconds:400}]}})");await new Promise(r=>setTimeout(r,320));await fs.writeFile(path.join(target,'orbit-steam-controls.png'),(await window.webContents.capturePage()).toPNG());
      const bridgeMenus=await window.webContents.executeJavaScript("Boolean(document.querySelector('[data-add-library]'))&&Boolean(document.querySelector('.steam-transfer[data-state=active] .steam-transfer-art'))&&document.querySelectorAll('[data-queue-action]').length>=1&&document.querySelectorAll('[data-move-folder] option').length===2&&Boolean(document.querySelector('[data-bandwidth]'))");report.checks.push({name:'Steam panel includes folders, moves, queue controls and bandwidth controls',passed:bridgeMenus});report.passed&&=bridgeMenus;
      const steamCardChecks=await window.webContents.executeJavaScript(`(()=>{const d=document.querySelector('#installation-dialog'),row=d.querySelector('.steam-transfer');return [{name:'Steam has one branded header with connection status',passed:d.querySelector('#installation-title').textContent==='Steam'&&Boolean(d.querySelector('.steam-header-brand'))&&!d.querySelector('.steam-overview')},{name:'Steam download cards show real state and percentage',passed:row.dataset.state==='active'&&row.querySelector('[data-queue-percent]').textContent==='25%'&&row.querySelector('[data-queue-app]').dataset.queueAction==='pause'},{name:'Steam queue overflow is a compact accessible menu control',passed:row.querySelector('[data-steam-more]').getAttribute('aria-haspopup')==='menu'&&row.querySelector('[data-steam-more]').getBoundingClientRect().width<=40}];})()`);report.checks.push(...steamCardChecks);report.passed&&=steamCardChecks.every(c=>c.passed);await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,300));
      await window.webContents.executeJavaScript(`OrbitSteam.game({title:'Cyberpunk 2077',appId:1091500,versionId:'steam:1091500',progress:{phase:'Paused · Download',active:false}},{connected:true,downloads:{items:[{appid:620,active:true,paused:false,queue_index:0},{appid:1091500,active:false,paused:true,queue_index:1,downloaded_bytes:1024**3,total_bytes:4*1024**3,percent:25}]}})`);await new Promise(r=>setTimeout(r,350));
      const gameDownloadChecks=await window.webContents.executeJavaScript(`(()=>{const d=document.querySelector('#installation-dialog');return [{name:'game download controls retain the selected title and progress',passed:d.querySelector('#installation-title').textContent==='Cyberpunk 2077 · Download'&&d.querySelector('[data-game-banner] h2').textContent==='Cyberpunk 2077'&&d.querySelector('progress').value===25},{name:'paused game exposes its own start and queue actions',passed:Boolean(d.querySelector('[data-game-action=resume]'))&&Boolean(d.querySelector('[data-game-action=priority]'))&&Boolean(d.querySelector('[data-game-action=unschedule]'))},{name:'game download controls exclude other games and global Steam settings',passed:!d.querySelector('.steam-queue,[data-move-app],[data-global],[data-bandwidth],[data-add-library]')&&!d.textContent.includes('Portal 2')}];})()`);report.checks.push(...gameDownloadChecks);report.passed&&=gameDownloadChecks.every(c=>c.passed);
      const liveBannerChecks=await window.webContents.executeJavaScript(`(()=>{const h=document.querySelector('[data-game-banner]'),controls=h.querySelector('[data-banner-actions]').innerHTML+' ',item={key:'game-1091500',appId:1091500,title:'Cyberpunk 2077',active:false,paused:true,done:1024**3,total:4*1024**3,percent:25.1};OrbitDownloadHero.render(h,item,controls);const p=h.querySelector('progress'),image=h.querySelector('img'),button=h.querySelector('[data-game-action=resume]');button.focus();OrbitDownloadHero.render(h,{...item,done:1.1*1024**3,percent:25.2},controls);return [{name:'visible banner advances real fractional progress without replacing its bar',passed:h.querySelector('progress')===p&&p.value===25.2&&h.querySelector('[data-banner-percent]').textContent==='25.2%'},{name:'live progress preserves artwork, action buttons and keyboard focus',passed:h.querySelector('img')===image&&h.querySelector('[data-game-action=resume]')===button&&document.activeElement===button}];})()`);report.checks.push(...liveBannerChecks);report.passed&&=liveBannerChecks.every(c=>c.passed);
      await fs.writeFile(path.join(target,'orbit-game-download.png'),(await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript(`document.querySelector('[data-game-action=resume]').click()`);await new Promise(r=>setTimeout(r,150));const scopedError=await window.webContents.executeJavaScript(`Boolean(document.querySelector('[data-game-banner]'))&&!document.querySelector('.installation-error').hidden&&document.querySelector('.installation-error').textContent.includes('disabled in smoke tests')`);report.checks.push({name:'a failed game action stays in its own menu and reports the failure',passed:scopedError});report.passed&&=scopedError;for(let i=0;i<30;i++){if(await window.webContents.executeJavaScript(`document.querySelector('[data-game-banner] [data-banner-state]').textContent==='Not queued'`))break;await new Promise(r=>setTimeout(r,100));}const autoRefresh=await window.webContents.executeJavaScript(`document.querySelector('[data-game-banner] [data-banner-state]').textContent==='Not queued'`);report.checks.push({name:'open game downloads automatically refresh through real queue IPC',passed:autoRefresh});report.passed&&=autoRefresh;await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,300));
      const folderChecks=await window.webContents.executeJavaScript(`(async()=>{const d=OrbitInstall.show('ARC Raiders · Install','<div class="installation-summary"><div><strong>Steam in the background</strong></div></div><label class="steam-folder-label">Library folder<select data-target-folder><option value="0">C: Steam · Default</option><option value="1">F: SteamLibrary</option><option value="2">D: SteamLibrary</option></select></label>','<button class="primary-button">Install</button>');OrbitSteam.folderCards(d);await new Promise(r=>setTimeout(r,100));const buttons=d.querySelectorAll('[role=radio]'),select=d.querySelector('[data-target-folder]');buttons[1].click();const checks=[{name:'library folder cards show available drive capacity',passed:d.querySelector('[data-folder-space]').textContent.includes('120 GB')&&Boolean(d.querySelector('.steam-folder-copy progress'))},{name:'Steam folders use themed cards instead of a native dropdown',passed:select.hidden&&buttons.length===3&&select.value==='1'&&buttons[1].getAttribute('aria-checked')==='true'}];buttons[1].focus();buttons[1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));checks.push({name:'Steam folder cards support arrow navigation and preserve the chosen folder',passed:select.value==='2'&&buttons[2].getAttribute('aria-checked')==='true'});return checks;})()`);report.checks.push(...folderChecks);report.passed&&=folderChecks.every(c=>c.passed);await new Promise(r=>setTimeout(r,350));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,200));await fs.writeFile(path.join(target,'orbit-install-folder-cards.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,250));
      await runControllerValidation(report,target);await runFlowValidation(report,target);
      await runDesktopValidation(report,target);
      const colorControls=await window.webContents.executeJavaScript(`(()=>{showSettings();document.querySelector('#tab-appearance').click();document.querySelector('#theme-editor').open=true;const hex=document.querySelector('#theme-hex-accent'),picker=document.querySelector('#theme-color-accent'),swatch=document.querySelector('#theme-swatch-accent');hex.value='#49ba8e';hex.dispatchEvent(new Event('input',{bubbles:true}));const checks=[{name:'hex colors update the picker, swatch and live theme',passed:picker.value==='#49ba8e'&&document.documentElement.style.getPropertyValue('--accent')==='#49ba8e'&&swatch.style.backgroundColor==='rgb(73, 186, 142)'}];picker.value='#cc4488';picker.dispatchEvent(new Event('input',{bubbles:true}));checks.push({name:'native color changes synchronize the displayed hex code',passed:hex.value==='#CC4488'});hex.value='#badhex';hex.dispatchEvent(new Event('input',{bubbles:true}));checks.push({name:'invalid hex codes cannot be saved',passed:!hex.checkValidity()&&picker.value==='#cc4488'});fillThemeEditor();discardThemePreview();OrbitTheme.apply({...selectedTheme(),image:{data:'data:image/webp;base64,UklGRg==',accent:'#aabbcc',mode:'auto',opacity:40}},document.documentElement);checks.push({name:'custom image spans the shell behind a transparent sidebar',passed:getComputedStyle(document.querySelector('.app-shell')).backgroundImage.includes('data:image')&&getComputedStyle(document.querySelector('.sidebar')).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(document.querySelector('main')).backgroundImage==='none'});OrbitTheme.apply(selectedTheme(),document.documentElement);document.querySelector('.theme-color-fields').scrollIntoView({block:'center'});return checks;})()`);report.checks.push(...colorControls);report.passed&&=colorControls.every(c=>c.passed);await new Promise(r=>setTimeout(r,400));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,250));await fs.writeFile(path.join(target,'orbit-theme-colors.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('closeModal()');await new Promise(r=>setTimeout(r,250));
      const settingsNavigation=await window.webContents.executeJavaScript(`(()=>{try{showSettings();const p=document.querySelector('#panel-general'),input=document.querySelector('.settings-search input'),results=document.querySelector('#settings-search-results');const query=value=>{input.value=value;input.dispatchEvent(new Event('input'));};const checks=[{name:'settings groups playing controls under a clear header',passed:p.querySelector('[data-setting="confirmGameClose"]').closest('.settings-group').querySelector('h2').textContent==='Library & playing'}];query('force');checks.push({name:'settings search finds individual controls',passed:results.textContent.includes('Confirm before force closing games')});query('Playful motion');checks.push({name:'settings search includes other categories',passed:results.textContent.includes('Appearance')});results.querySelector('button').click();checks.push({name:'selecting a search result opens its category and focuses the setting',passed:!document.querySelector('#panel-appearance').hidden&&document.activeElement.textContent.includes('Playful motion')&&!input.value});query('zzzz-no-such-setting');checks.push({name:'settings search explains empty results',passed:results.textContent.includes('No settings found')});query('');document.querySelector('#tab-general').click();return checks;}catch(e){console.error(e.stack);return [{name:'settings navigation: '+e.message,passed:false}];}})()`);report.checks.push(...settingsNavigation);report.passed&&=settingsNavigation.every(c=>c.passed);await new Promise(r=>setTimeout(r,400));await window.webContents.capturePage();await new Promise(r=>setTimeout(r,250));await fs.writeFile(path.join(target,'orbit-settings-navigation.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('closeModal()');await new Promise(r=>setTimeout(r,250));
      await window.webContents.executeJavaScript('OrbitClips.open()');await new Promise(r=>setTimeout(r,300));
      const clipMenus=await window.webContents.executeJavaScript(`(async()=>{const d=document.querySelector('[data-clips-view]'),s=(await window.orbit.clips()).status;let blocked=false;try{await window.orbit.startClips({sourceId:'screen:0:0',audio:false});}catch(e){blocked=e.message.includes('disabled in smoke tests');}return [{name:'clip prototype starts off and offers source, quality and replay duration choices',passed:s.phase==='off'&&Boolean(d.querySelector('[data-clip-source]'))&&d.querySelectorAll('[data-clip-seconds] option').length===2&&d.querySelectorAll('[data-clip-height] option').length===2},{name:'clip capture requires an explicit source and defaults to video only',passed:d.querySelector('[data-clip-source]').value===''&&!d.querySelector('[data-clip-audio]').checked&&d.querySelector('[data-clip-save]').disabled},{name:'clip prototype exposes save and stop shortcuts without capturing in smoke tests',passed:blocked&&d.querySelector('[data-clip-shortcuts]').textContent.includes('F8')&&d.querySelector('[data-clip-shortcuts]').textContent.includes('F9')}];})()`);report.checks.push(...clipMenus);report.passed&&=clipMenus.every(c=>c.passed);await window.webContents.capturePage();await new Promise(r=>setTimeout(r,450));await fs.writeFile(path.join(target,'orbit-clips.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,300));
      // Capture the actual chooser in several themes and a narrow viewport.
      const menuBounds=window.getBounds(),minimumSize=window.getMinimumSize();
      const captureMenu=async(name)=>{
        await new Promise(r=>setTimeout(r,320));
        const rect=await window.webContents.executeJavaScript("(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return {x:Math.ceil(r.x),y:Math.ceil(r.y),width:Math.floor(r.width),height:Math.floor(r.height)};})()");
        await fs.writeFile(path.join(target,name),(await window.webContents.capturePage(rect)).toPNG());
      };
      for(const theme of ['orbit','dark','latte']){
        await window.webContents.executeJavaScript(`OrbitTheme.apply(OrbitTheme.builtins.find(t=>t.id===${JSON.stringify(theme)}),document.documentElement);window.orbitFeatures.chooseLaunch('smoke-menu',{title:'PEAK',choices:[{id:'example:0',label:'PEAK using DX12'},{id:'example:1',label:'PEAK using DX11'},{id:'example:2',label:'PEAK using Vulkan'}]});true`);
        await captureMenu('orbit-launch-modes-'+theme+'.png');
      }
      window.setMinimumSize(360,480);window.setSize(540,720);
      await captureMenu('orbit-launch-modes-narrow.png');
      const menuChecks=await window.webContents.executeJavaScript(`(()=>{const dialog=document.querySelector('#modal'),cards=[...document.querySelectorAll('.launch-mode-card')],root=dialog.getBoundingClientRect();return [{name:'launch cards remain visible and within narrow dialog bounds',passed:cards.length===4&&cards.every(c=>{const r=c.getBoundingClientRect();return r.width>0&&r.left>=root.left&&r.right<=root.right;})},{name:'launch chooser and footer do not overflow horizontally',passed:dialog.scrollWidth<=dialog.clientWidth},{name:'launch actions stay visible at narrow window sizes',passed:document.querySelector('.launch-mode-footer').getBoundingClientRect().bottom<=root.bottom-12}];})()`);
      report.checks.push(...menuChecks);report.passed&&=menuChecks.every(c=>c.passed);
      await window.webContents.executeJavaScript('closeModal();OrbitTheme.apply(selectedTheme(),document.documentElement);window.orbitExtras.storage()');await captureMenu('orbit-storage-narrow.png');
      let responsive=await window.webContents.executeJavaScript("(()=>{const d=document.querySelector('#modal');return d.scrollWidth<=d.clientWidth&&d.querySelector('#modal-body').scrollWidth<=d.querySelector('#modal-body').clientWidth;})()");report.checks.push({name:'storage controls and rows fit narrow windows',passed:responsive});report.passed&&=responsive;
      await window.webContents.executeJavaScript('closeModal();OrbitInstall.uninstall(state.games.find(g=>g.installed&&!g.robloxPlaceId).id)');await new Promise(r=>setTimeout(r,320));await fs.writeFile(path.join(target,'orbit-uninstall-narrow.png'),(await window.webContents.capturePage()).toPNG());
      responsive=await window.webContents.executeJavaScript("(()=>{const d=document.querySelector('#installation-dialog');return d.scrollWidth<=d.clientWidth&&d.querySelector('.installation-footer').getBoundingClientRect().bottom<=d.getBoundingClientRect().bottom;})()");report.checks.push({name:'uninstall choices and actions fit narrow windows',passed:responsive});report.passed&&=responsive;
      await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,300));
      await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,250));await window.webContents.executeJavaScript('OrbitClips.open()');await new Promise(r=>setTimeout(r,250));const clipFits=await window.webContents.executeJavaScript(`(()=>{const d=document.querySelector('#installation-dialog');return d.scrollWidth<=d.clientWidth&&d.querySelector('[data-clips-view]').scrollWidth<=d.querySelector('.installation-body').clientWidth;})()`);report.checks.push({name:'clipping controls fit a narrow window without horizontal overflow',passed:clipFits});report.passed&&=clipFits;await fs.writeFile(path.join(target,'orbit-clips-narrow.png'),(await window.webContents.capturePage()).toPNG());await window.webContents.executeJavaScript('OrbitInstall.close()');await new Promise(r=>setTimeout(r,250));
      window.setMinimumSize(...minimumSize);window.setBounds(menuBounds);
      await window.webContents.executeJavaScript("closeModal();OrbitTheme.apply(selectedTheme(),document.documentElement);showSettings();document.querySelector('#tab-appearance').click();document.querySelector('#startup-sound-enabled').checked=true;document.querySelector('#startup-sound-enabled').dispatchEvent(new Event('change'));document.querySelector('#startup-sound-volume').value=document.querySelector('#startup-sound-volume').max;document.querySelector('#startup-sound-volume').dispatchEvent(new Event('input'));document.querySelector('.startup-audio-controls').scrollIntoView({block:'center'});true");
      await new Promise(r=>setTimeout(r,320));
      const volumeRect=await window.webContents.executeJavaScript("(()=>{const r=document.querySelector('.startup-audio-controls').getBoundingClientRect();return {x:Math.ceil(r.x),y:Math.ceil(r.y),width:Math.floor(r.width),height:Math.floor(r.height)};})()");
      await fs.writeFile(path.join(target,'orbit-startup-volume-max.png'),(await window.webContents.capturePage(volumeRect)).toPNG());
      await window.webContents.executeJavaScript("closeModal();window._closeWarningPreview=window.orbitFeatures.closeGame(state.games.find(g=>g.kind==='game'&&!g.robloxPlaceId).id,true);true");
      for(let attempt=0;attempt<40;attempt++){if(await window.webContents.executeJavaScript("Boolean(document.querySelector('.game-close-dialog[open]'))"))break;await new Promise(r=>setTimeout(r,30));}
      await new Promise(r=>setTimeout(r,320));
      const closeRect=await window.webContents.executeJavaScript("(()=>{const r=document.querySelector('.game-close-dialog').getBoundingClientRect();return {x:Math.ceil(r.x),y:Math.ceil(r.y),width:Math.floor(r.width),height:Math.floor(r.height)};})()");
      await fs.writeFile(path.join(target,'orbit-force-close-warning.png'),(await window.webContents.capturePage(closeRect)).toPNG());
      await window.webContents.executeJavaScript("document.querySelector('#game-close-cancel').click();window._closeWarningPreview.then(()=>{delete window._closeWarningPreview;});true");
      window.setSize(540,720);await window.webContents.executeJavaScript('showSettings()');await new Promise(r=>setTimeout(r,400));const settingsNarrow=await window.webContents.executeJavaScript(`(()=>{const d=document.querySelector('#modal'),p=document.querySelector('#panel-general'),input=document.querySelector('.settings-search input');const checks=[{name:'settings fits narrow windows without horizontal overflow',passed:d.scrollWidth<=d.clientWidth&&p.scrollWidth<=p.clientWidth}];input.value='force';input.dispatchEvent(new Event('input'));checks.push({name:'settings search remains usable in a narrow window',passed:document.querySelector('#settings-search-results button').getBoundingClientRect().width>100});input.value='';input.dispatchEvent(new Event('input'));return checks;})()`);report.checks.push(...settingsNarrow);report.passed&&=settingsNarrow.every(c=>c.passed);await window.webContents.capturePage();await new Promise(r=>setTimeout(r,400));await fs.writeFile(path.join(target,'orbit-settings-narrow.png'),(await window.webContents.capturePage()).toPNG());
      const libraryBatchChecks=await require('./desktop-library-validation.cjs')({window});report.checks.push(...libraryBatchChecks);report.passed&&=libraryBatchChecks.every(c=>c.passed);
      await fs.writeFile(path.join(target, 'smoke-report.json'), JSON.stringify({ ...report, entries: library().length, games: library().filter(g => g.kind === 'game').length, tools: library().filter(g => g.kind === 'tool').length,
        summaryPayloadBytes: Buffer.byteLength(JSON.stringify(snapshot())), installed: library().filter(g => g.installed).length,
        launcherReady: library().filter(g => g.launcherAvailable).length, playtimeAvailable: library().filter(g => g.playtimeKnown).length,
        achievementsAvailable: library().filter(g => g.achievements !== null).length, coverStatus, connections, warnings: scanWarnings }, null, 2));
      await prepareExit();app.exit(report.passed ? 0 : 1);
    } catch (e) { console.error(e); app.exit(1); }
  }
});
app.on('window-all-closed', () => {if(((!tray||store?.settings?.closeToTray===false)&&!memorySmoke)||quitting)app.quit();});

let quitting = false;
app.on('before-quit', event => { if (quitting) return; quitting = true; if(!tracker)return; event.preventDefault(); clearTimeout(runningTimer);clearInterval(handoffProbe);controllerHandoff?.cancel();installations?.stop();gameStorage?.cancel();backupScheduler?.stop();runningGames?.stop();updates?.stop();prepareExit().catch(console.error).finally(() => app.quit()); });

}
