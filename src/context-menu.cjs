const modSupport=require('./ui/mod-support.js');
const {nativePlaytime}=require('./playtime.cjs');
function collectionMenu(options){
 const selected=new Set(options.selectedCollections||[]);
 return options.collections?.length?{label:'Collections',submenu:options.collections.map(name=>({label:name,type:'checkbox',checked:selected.has(name),command:{action:'collection',name}}))}:null;
}
function entryMenu(game,tools=[],options={}){
 const collections=collectionMenu(options);
 if(game.robloxPlaceId)return [{id:'play',label:'Open game'},{id:'details',label:'Details'},{id:'favorite',label:'Favorite',type:'checkbox',checked:Boolean(game.favorite)},...(collections?[collections]:[]),{type:'separator'},{id:'shortcut',label:'Create desktop shortcut'},{id:'copy-title',label:'Copy title'},{id:'hide',label:game.hidden?'Restore to library':'Hide from library'}];
 tools=modSupport.filter(game,tools);
 const selected=game.versions[0]||{};
 const launchable=Boolean(selected.windowsAppId||selected.directLaunch||selected.installed&&(selected.launch||selected.executable)||selected.launcherAvailable&&selected.shortcut||!selected.installed&&selected.installUrl);
 const primary=selected.installed?game.kind==='tool'?'Open':'Play':game.directLaunchAvailable?'Play':game.launcherAvailable?(game.launchRoute?.mode==='game'?'Play':'Open launcher'):'Install';
 const items=[options.running?{id:'return',label:'Return to game'}:{id:'play',label:primary,enabled:launchable},{id:'details',label:'Details'},{id:'favorite',label:'Favorite',type:'checkbox',checked:Boolean(game.favorite)}];
 items.push({type:'separator'});if(collections)items.push(collections);
 if(game.versions.length>1)items.push({label:'Preferred copy',submenu:game.versions.map(v=>({label:v.source+' ('+(v.installed?'installed':v.launcherAvailable?'launcher':'not installed')+')',type:'radio',checked:v.id===game.selected,command:{action:'prefer',versionId:v.id},enabled:true}))});
 const manage=[{id:'launch-settings',label:'Launch settings…'},...(game.kind==='game'?[{id:'detection',label:'Check detection…'}]:[]),{type:'separator'},{id:'folder',label:game.installed?'Open folder':'Open launcher folder',enabled:game.versions.some(v=>(v.installed||v.launcherAvailable)&&v.location)},{id:'locate',label:'Locate executable…'},{id:'shortcut',label:'Create desktop shortcut',enabled:Boolean(game.installed||game.launcherAvailable||game.directLaunchAvailable)},{type:'separator'},{id:'artwork',label:'Customize artwork…'},{id:'repair',label:'Repair image'},{id:'move',label:game.kind==='tool'?'Move to Games':'Move to Tools'}];
 items.push({label:'Manage',submenu:manage});
 if(game.kind==='game'&&tools.length)items.push({label:'Mod tools',submenu:tools.map(tool=>({label:tool.title+(tool.installed?'':' · Get'),command:{action:'open-tool',toolId:tool.id}}))});
 if(game.kind==='game'&&!nativePlaytime(game)){const running=['running','paused','waiting'].includes(game.tracking?.state);items.push({label:'Local playtime',submenu:[{id:running?'stop-timer':'start-timer',label:running?'Stop timer':'Start manual timer'},{id:'track-executable',label:'Choose game executable…'}]});}
 items.push({type:'separator'},{id:'copy-title',label:'Copy title'},{id:'hide',label:game.hidden?'Restore to library':'Hide from library'});
 return items;
}
function backgroundMenu(section,list){return [{id:'add',label:section==='tools'?'Add tool…':'Add game…'},{id:'refresh',label:'Refresh'},{type:'separator'},{id:'grid',label:'Grid view',type:'radio',checked:!list},{id:'list',label:'List view',type:'radio',checked:Boolean(list)},{type:'separator'},{id:'settings',label:'Settings'}];}
function templateFor(items,select){return items.map(item=>{if(item.type==='separator')return {type:'separator'};const {command,...options}=item;if(item.submenu)return {...options,submenu:templateFor(item.submenu,select)};return {...options,click:()=>select(command||{action:item.id})};});}
module.exports={entryMenu,backgroundMenu,templateFor};
