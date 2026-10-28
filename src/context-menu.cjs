const modSupport=require('./ui/mod-support.js');
const {nativePlaytime}=require('./playtime.cjs');
function collectionMenu(options){
 const selected=new Set(options.selectedCollections||[]);
 return options.collections?.length?{label:'Collections',submenu:options.collections.map(name=>({label:name,type:'checkbox',checked:selected.has(name),command:{action:'collection',name}}))}:null;
}
function entryMenu(game,tools=[],options={}){
 const collections=collectionMenu(options);
 if(game.robloxPlaceId)return [...(collections?[collections]:[]),{id:'shortcut',label:'Create desktop shortcut'},{id:'artwork',label:'Customize artwork…'},{type:'separator'},{id:'copy-title',label:'Copy title'},{id:'hide',label:game.hidden?'Restore to library':'Hide from library'}];
 tools=modSupport.filter(game,tools);
 const items=options.running?[{id:'return',label:'Return to game'}]:[];
 if(options.running)items.push({id:'close-game',label:'Close game…'});
 if(items.length)items.push({type:'separator'});if(collections)items.push(collections);
 if(game.versions.length>1)items.push({label:'Preferred copy',submenu:game.versions.map(v=>({label:v.source+' ('+(v.installed?'installed':v.launcherAvailable?'launcher':'not installed')+')',type:'radio',checked:v.id===game.selected,command:{action:'prefer',versionId:v.id},enabled:true}))});
 items.push({id:'launch-settings',label:'Launch settings…'});
 items.push({label:'Files & installation',submenu:[{id:'folder',label:game.installed?'Open game folder':'Open launcher folder',enabled:game.versions.some(v=>(v.installed||v.launcherAvailable)&&v.location)},{id:'locate',label:'Locate executable…'},{id:'shortcut',label:'Create desktop shortcut',enabled:Boolean(game.installed||game.launcherAvailable||game.directLaunchAvailable)},...(game.kind==='game'?[{id:'detection',label:'Check detection…'}]:[]),...(game.installed?[{type:'separator'},{id:'uninstall',label:'Uninstall…'}]:[])]});
 items.push({label:'Artwork & organization',submenu:[{id:'artwork',label:'Customize artwork…'},{id:'repair',label:'Find replacement cover'},{id:'move',label:game.kind==='tool'?'Move to Games':'Move to Tools'}]});
 if(game.kind==='game'&&tools.length)items.push({label:'Mod tools',submenu:tools.map(tool=>({label:tool.title+(tool.installed?'':' · Get'),command:{action:'open-tool',toolId:tool.id}}))});
 if(game.kind==='game'&&!nativePlaytime(game)){const running=['running','paused','waiting'].includes(game.tracking?.state);items.push({label:'Local playtime',submenu:[{id:running?'stop-timer':'start-timer',label:running?'Stop timer':'Start manual timer'},{id:'track-executable',label:'Choose game executable…'}]});}
 items.push({type:'separator'},{id:'copy-title',label:'Copy title'},{id:'hide',label:game.hidden?'Restore to library':'Hide from library'});
 return items;
}
function backgroundMenu(){return [{id:'manage-collections',label:'Manage collections…'},{id:'hidden-games',label:'Show hidden games'},{type:'separator'},{id:'library-health',label:'Check library…'},{id:'cleanup',label:'Review library cleanup…'},{id:'export-table',label:'Export library table…'}];}
function templateFor(items,select){return items.map(item=>{if(item.type==='separator')return {type:'separator'};const {command,...options}=item;if(item.submenu)return {...options,submenu:templateFor(item.submenu,select)};return {...options,click:()=>select(command||{action:item.id})};});}
module.exports={entryMenu,backgroundMenu,templateFor};
