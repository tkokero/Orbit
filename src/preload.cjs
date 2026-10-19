const { contextBridge, ipcRenderer } = require('electron');
const invoke = async (name, ...args) => { const result = await ipcRenderer.invoke(name, ...args); if (!result.ok) throw new Error(result.error); return result.data; };
contextBridge.exposeInMainWorld('orbit', {
  updateStatus:()=>invoke('updates:status'),checkUpdates:()=>invoke('updates:check'),installUpdate:()=>invoke('updates:install'),getUpdateInstaller:()=>invoke('updates:installer'),
  onUpdateStatus:callback=>{const listener=(_e,data)=>callback(data);ipcRenderer.on('updates:status',listener);return()=>ipcRenderer.removeListener('updates:status',listener);},
  robloxLibrary:()=>invoke('roblox:get'),saveRoblox:input=>invoke('roblox:save',input),removeRoblox:id=>invoke('roblox:remove',id),robloxMode:mode=>invoke('roblox:mode',mode),launchRoblox:(id,browser=false)=>invoke('roblox:launch',{id,browser}),robloxIcon:id=>invoke('roblox:icon',id),
  getSetup:()=>invoke('setup:get'),saveSetup:input=>invoke('setup:save',input),gameIcon:id=>invoke('game:icon',id),storeIcon:id=>invoke('store:icon',id),
  deals:country=>invoke('store:deals',country),openStore:id=>invoke('store:open',id),systemInfo:refresh=>invoke('system:info',refresh===true),checkSystem:id=>invoke('system:check',id),runInstaller:id=>invoke('installer:open',id),openInstallStore:source=>invoke('installer:store',source),
  friendActivity:id=>invoke('social:activity',id), friendImage:(id,gameId)=>invoke('social:image',{id,gameId}), getSocial:()=>invoke('social:get'), refreshSocial:()=>invoke('social:refresh'), connectSteamFriends:input=>invoke('social:connect-steam',input), disconnectSocial:()=>invoke('social:disconnect'), openSocialClient:provider=>invoke('social:open-client',provider), friendProfile:id=>invoke('social:profile',id),
  importTheme:()=>invoke('theme:import'), exportTheme:theme=>invoke('theme:export',theme),
  getSettings:()=>invoke('settings:get'), updateSettings:change=>invoke('settings:update',change), openData:()=>invoke('data:open'), openDownloads:source=>invoke('downloads:open',source),
  onInstallationUpdate:callback=>{const listener=(_e,data)=>callback(data);ipcRenderer.on('installation:update',listener);return()=>ipcRenderer.removeListener('installation:update',listener);},
  entryMenu: (id, point) => invoke('menu:entry', id, point), backgroundMenu: (input, point) => invoke('menu:background', input, point),
  copyTitle: id => invoke('game:copy-title', id), startTimer: id => invoke('playtime:start', id), stopTimer: id => invoke('playtime:stop', id), configureTimer: id => invoke('playtime:configure', id),
  onPlaytimeUpdate: callback => { const listener = (_e, data) => callback(data); ipcRenderer.on('playtime:update', listener); return () => ipcRenderer.removeListener('playtime:update', listener); },
  getLibrary: () => invoke('library:get'), preference: (id, value) => invoke('game:preference', id, value),
  repairImages: () => invoke('library:repair-images'),
  onLibraryUpdate: callback => { const listener = (_event, data) => callback(data); ipcRenderer.on('library:update', listener); return () => ipcRenderer.removeListener('library:update', listener); },
  play: id => invoke('game:action', id), folder: id => invoke('game:folder', id), locate: id => invoke('game:locate', id),
  details: id => invoke('game:details', id), hero: id => invoke('game:hero', id), repairImage: id => invoke('game:repair-image', id),
  achievementImage: (id, achievementId) => invoke('game:achievement-image', id, achievementId),
  add: input => invoke('game:add', input), importLibrary: () => invoke('library:import'), exportLibrary: () => invoke('library:export'),
  steamSync: input => invoke('steam:sync', input), steamConnect: () => invoke('steam:connect'), epicSync: () => invoke('epic:sync'),
  help: name => invoke('help:open', name), control: action => invoke('window:control', action)
});
