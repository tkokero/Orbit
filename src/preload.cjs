const { contextBridge, ipcRenderer, webFrame } = require('electron');
const invoke = async (name, ...args) => { const result = await ipcRenderer.invoke(name, ...args); if (!result.ok) throw new Error(result.error); return result.data; };
let memoryReleaseTimer,lastMemoryRelease=0;
function requestImageRelease(){clearTimeout(memoryReleaseTimer);memoryReleaseTimer=setTimeout(()=>{lastMemoryRelease=Date.now();webFrame.clearCache();},Math.max(650,5000-(Date.now()-lastMemoryRelease)));}
try{const allowed=k=>/^orbit-[a-z0-9-]{1,70}$/.test(k)&&!/^orbit-(dev|update-preview)/.test(k),keys=Object.keys(localStorage).filter(allowed),legacy=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),saved=ipcRenderer.sendSync('ui:bootstrap',legacy);if(saved&&typeof saved==='object'){for(const key of keys)if(!(key in saved))localStorage.removeItem(key);for(const [key,value]of Object.entries(saved))if(allowed(key)&&typeof value==='string')localStorage.setItem(key,value);}}catch{}
contextBridge.exposeInMainWorld('orbit', {
  saveUiPreference:change=>invoke('ui:save',change),
  releaseImageCache:requestImageRelease,
  clips:()=>invoke('clips:get'),clipSources:()=>invoke('clips:sources'),startClips:input=>invoke('clips:start',input),stopClips:()=>invoke('clips:stop'),saveClip:()=>invoke('clips:save'),chooseClipsFolder:()=>invoke('clips:folder'),openClip:name=>invoke('clips:open',name),revealClip:name=>invoke('clips:reveal',name),onClips:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('clips:status',fn);return()=>ipcRenderer.removeListener('clips:status',fn);},
  discordContext:input=>invoke('discord:context',input),discordPresence:()=>invoke('discord:get'),saveDiscordPresence:input=>invoke('discord:save',input),openDiscordPortal:()=>invoke('discord:portal'),onDiscordPresence:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('discord:update',fn);return()=>ipcRenderer.removeListener('discord:update',fn);},
  chooseUpcomingImage:()=>invoke('calendar:choose-image'),upcomingGames:()=>invoke('calendar:get'),saveUpcoming:input=>invoke('calendar:save',input),removeUpcoming:id=>invoke('calendar:remove',id),upcomingImage:id=>invoke('calendar:image',id),openUpcoming:id=>invoke('calendar:open',id),onUpcoming:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('calendar:update',fn);return()=>ipcRenderer.removeListener('calendar:update',fn);},
  diagnoseLaunch:id=>invoke('launch:diagnose',id),saveBackups:id=>invoke('saves:list',id),chooseSaveFolder:id=>invoke('saves:folder',id),backupSaves:id=>invoke('saves:backup',id),previewSaves:input=>invoke('saves:preview',input),restoreSaves:input=>invoke('saves:restore',input),
  accessibility:()=>invoke('accessibility:get'),saveAccessibility:input=>invoke('accessibility:save',input),customArtwork:id=>invoke('artwork:get',id),setArtwork:input=>invoke('artwork:set',input),resetArtwork:input=>invoke('artwork:reset',input),recaps:id=>invoke('recaps:get',id),onRecap:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('recaps:ready',fn);return()=>ipcRenderer.removeListener('recaps:ready',fn);},
  wishlist:country=>invoke('wishlist:get',country),saveWishlist:input=>invoke('wishlist:save',input),removeWishlist:id=>invoke('wishlist:remove',id),openWishlist:id=>invoke('wishlist:open',id),checkWishlist:input=>invoke('wishlist:check',input),previewReport:input=>invoke('report:preview',input),exportReport:token=>invoke('report:export',token),exportTable:input=>invoke('catalog:export',input),
  downloads:()=>invoke('downloads:list'),clearDownloads:()=>invoke('downloads:clear'),saveTags:input=>invoke('tags:save',input),loadMetadata:id=>invoke('metadata:load',id),saveBackupSchedule:input=>invoke('saves:schedule',input),onBackupStatus:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('saves:status',fn);return()=>ipcRenderer.removeListener('saves:status',fn);},
  smartCollections:()=>invoke('smart:get'),saveSmartCollection:input=>invoke('smart:save',input),gameStorage:refresh=>invoke('storage:list',refresh),measureStorage:id=>invoke('storage:measure',id),cancelStorage:()=>invoke('storage:cancel'),storageAction:input=>invoke('storage:action',input),newsShelf:()=>invoke('news:shelf'),newsImage:input=>invoke('news:image',input),gameNews:input=>invoke('news:get',input),openNews:input=>invoke('news:open',input),openNewsExternal:input=>invoke('news:external',input),newsArticleImage:input=>invoke('news:article-image',input),
  storageUsage:()=>invoke('storage:usage'),cleanImageCache:()=>invoke('storage:clean'),openLicenses:()=>invoke('licenses:open'),
  history:id=>invoke('history:get',id),personal:id=>invoke('personal:get',id),savePersonal:input=>invoke('personal:save',input),libraryHealth:()=>invoke('library:health'),privacySummary:()=>invoke('privacy:summary'),clearPrivateData:input=>invoke('privacy:clear',input),postponeUpdate:minutes=>invoke('updates:postpone',minutes),releaseNotes:()=>invoke('updates:notes'),reportIssue:()=>invoke('support:issue'),
  configureDetection:id=>invoke('sessions:configure',id),detectionReport:id=>invoke('sessions:diagnose',id),sessions:()=>invoke('sessions:get'),focusGame:id=>invoke('sessions:focus',id),closeGame:input=>invoke('sessions:close',input),launchChoices:id=>invoke('launch:choices',id),
  onSessions:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('sessions:update',fn);return()=>ipcRenderer.removeListener('sessions:update',fn);},
  onDownloadComplete:callback=>{const fn=(_e,data)=>callback(data);ipcRenderer.on('download:complete',fn);return()=>ipcRenderer.removeListener('download:complete',fn);},
  collections:()=>invoke('collections:get'),saveCollection:input=>invoke('collections:save',input),assignCollections:input=>invoke('collections:assign',input),
  launchProfile:id=>invoke('profile:get',id),saveLaunchProfile:input=>invoke('profile:save',input),chooseLaunchExecutable:()=>invoke('profile:choose'),
  backup:ui=>invoke('backup:export',ui),previewRestore:()=>invoke('backup:preview'),restore:ui=>invoke('backup:restore',ui),cleanup:()=>invoke('cleanup:preview'),applyCleanup:ids=>invoke('cleanup:apply',ids),
  updateStatus:()=>invoke('updates:status'),checkUpdates:()=>invoke('updates:check'),installUpdate:()=>invoke('updates:install'),getUpdateInstaller:()=>invoke('updates:installer'),
  onUpdateStatus:callback=>{const listener=(_e,data)=>callback(data);ipcRenderer.on('updates:status',listener);return()=>ipcRenderer.removeListener('updates:status',listener);},
  robloxLibrary:()=>invoke('roblox:get'),saveRoblox:input=>invoke('roblox:save',input),removeRoblox:id=>invoke('roblox:remove',id),robloxMode:mode=>invoke('roblox:mode',mode),launchRoblox:(id,browser=false)=>invoke('roblox:launch',{id,browser}),robloxIcon:id=>invoke('roblox:icon',id),
  getSetup:()=>invoke('setup:get'),saveSetup:input=>invoke('setup:save',input),gameIcon:id=>invoke('game:icon',id),storeIcon:id=>invoke('store:icon',id),
  openFpsSource:id=>invoke('fps:source',id),runFpsEstimate:id=>invoke('fps:hardware',id),
  deals:country=>invoke('store:deals',country),openStore:id=>invoke('store:open',id),systemInfo:refresh=>invoke('system:info',refresh===true),checkSystem:id=>invoke('system:check',id),addSteamFolder:()=>invoke('steam:folder-add'),steamFolderSpace:()=>invoke('steam:folder-space'),steamQueue:()=>invoke('steam:queue'),steamBridge:input=>invoke('steam:bridge',input),startSteamBridge:()=>invoke('steam:bridge-start'),steamControl:input=>invoke('steam:control',input),runInstaller:id=>invoke('installer:open',id),confirmInstaller:input=>invoke('installer:run',input),installChoices:id=>invoke('install:choices',id),installStore:input=>invoke('install:store',input),uninstallChoices:id=>invoke('uninstall:choices',id),uninstallGame:input=>invoke('uninstall:run',input),startInstallerDownload:url=>invoke('downloads:start',url),cancelInstallerDownload:id=>invoke('downloads:cancel',id),downloadedInstaller:id=>invoke('downloads:installer',id),onDownloadsChanged:callback=>{const listener=()=>callback();ipcRenderer.on('downloads:changed',listener);return()=>ipcRenderer.removeListener('downloads:changed',listener);},openInstallStore:source=>invoke('installer:store',source),
  friendActivity:id=>invoke('social:activity',id), friendImage:(id,gameId)=>invoke('social:image',{id,gameId}), getSocial:()=>invoke('social:get'), refreshSocial:()=>invoke('social:refresh'), connectSteamFriends:input=>invoke('social:connect-steam',input), disconnectSocial:()=>invoke('social:disconnect'), openSocialClient:provider=>invoke('social:open-client',provider), friendProfile:id=>invoke('social:profile',id),
  startupVideo:()=>invoke('intro:get'),chooseStartupVideo:()=>invoke('intro:choose'),saveStartupVideo:input=>invoke('intro:save',input),discardStartupVideo:token=>invoke('intro:discard',token),removeStartupVideo:()=>invoke('intro:remove'),
  getFont:()=>invoke('font:get'),chooseFont:()=>invoke('font:choose'),saveFont:font=>invoke('font:save',font),chooseThemeImage:()=>invoke('theme:image'),importTheme:()=>invoke('theme:import'), exportTheme:theme=>invoke('theme:export',theme),
  getSettings:()=>invoke('settings:get'), updateSettings:change=>invoke('settings:update',change), openData:()=>invoke('data:open'), openDownloads:source=>invoke('downloads:open',source),
  onInstallationUpdate:callback=>{const listener=(_e,data)=>callback(data);ipcRenderer.on('installation:update',listener);return()=>ipcRenderer.removeListener('installation:update',listener);},
  entryMenu: (id, point) => invoke('menu:entry', id, point), backgroundMenu: (input, point) => invoke('menu:background', input, point),
  createShortcut:id=>invoke('game:shortcut',id),
  copyTitle: id => invoke('game:copy-title', id), startTimer: id => invoke('playtime:start', id), stopTimer: id => invoke('playtime:stop', id), configureTimer: id => invoke('playtime:configure', id),
  onPlaytimeUpdate: callback => { const listener = (_e, data) => callback(data); ipcRenderer.on('playtime:update', listener); return () => ipcRenderer.removeListener('playtime:update', listener); },
  getLibrary: () => invoke('library:get'), preference: (id, value) => invoke('game:preference', id, value),
  repairImages: () => invoke('library:repair-images'),
  onLibraryUpdate: callback => { const listener = (_event, data) => callback(data); ipcRenderer.on('library:update', listener); return () => ipcRenderer.removeListener('library:update', listener); },
  play: (id,mode,context) => invoke('game:action', id,mode,context), folder: id => invoke('game:folder', id), locate: id => invoke('game:locate', id),
  details: id => invoke('game:details', id), hero: id => invoke('game:hero', id), repairImage: id => invoke('game:repair-image', id),
  achievementImage: (id, achievementId) => invoke('game:achievement-image', id, achievementId),
  add: input => invoke('game:add', input), importLibrary: () => invoke('library:import'), exportLibrary: () => invoke('library:export'),
  steamSync: input => invoke('steam:sync', input), steamConnect: () => invoke('steam:connect'), epicSync: () => invoke('epic:sync'),
  help: name => invoke('help:open', name), control: action => invoke('window:control', action)
});

// Clear only unused renderer resources after a sustained hidden period.
// No periodic GC, disk-cache deletion, or process-priority changes.
document.addEventListener('visibilitychange',()=>{
 clearTimeout(memoryReleaseTimer);
 if(document.hidden)requestImageRelease();
});

if(process.argv.includes('--orbit-dev-debug')&&ipcRenderer.sendSync('debug:capability')===true)contextBridge.exposeInMainWorld('orbitDebug',{snapshot:()=>invoke('debug:snapshot'),action:name=>invoke('debug:action',name),copy:()=>invoke('debug:copy'),onPreview:callback=>{const fn=(_e,kind)=>callback(kind);ipcRenderer.on('debug:preview',fn);return()=>ipcRenderer.removeListener('debug:preview',fn);}});

contextBridge.exposeInMainWorld('orbitClipsEnabled',ipcRenderer.sendSync('clips:capability')===true);

contextBridge.exposeInMainWorld('orbitCouchNative',{fullscreen:value=>invoke('couch:fullscreen',value),watch:id=>invoke('couch:watch',id),cancelHandoff:id=>invoke('couch:handoff-cancel',id),switchHandoff:id=>invoke('couch:handoff-switch',id),onHandoff:fn=>ipcRenderer.on('couch:handoff',(_event,data)=>fn(data)),onReturn:fn=>ipcRenderer.on('couch:return',(_event,id)=>fn(id))});
