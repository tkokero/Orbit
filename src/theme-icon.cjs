const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const Theme=require('./ui/themes.js'),{themes}=require('./profile-preferences.cjs'),{pngIcon}=require('./desktop-shortcuts.cjs');
const Icon=require('./ui/app-icon-preferences.js');
function palette(values={}){
 const saved=themes(values['orbit-themes-v1']),theme=[...Theme.builtins,...saved.custom].find(t=>t.id===saved.active)||Theme.builtins[0];
 const colors=Theme.effectiveColors(theme);
 if(theme.id==='dark'&&values['orbit-super-dark']==='on')Object.assign(colors,{background:'#000000',surface:'#070707',accent:'#929292',secondary:'#999999',warm:'#aaa49c'});
 return colors;
}
const svg=Icon.svg;
class ThemeIcon{
 constructor({folder,nativeImage,appId,executable=process.execPath,platform=process.platform,window=()=>null,tray=()=>null,taskbar=null,render=async data=>require('./image-engine.cjs')(Buffer.from(data)).png().toBuffer()}){Object.assign(this,{folder,nativeImage,appId,executable,platform,window,tray,taskbar,render});this.revision=0;}
 apply(window=this.window(),tray=this.tray()){
  if(!this.current)return;
  const windowIcon=this.platform==='win32'?this.startupIcon:this.current;
  if(window&&!window.isDestroyed()&&windowIcon){window.setIcon(windowIcon.image);if(this.platform==='win32')window.setAppDetails({appId:this.appId,appIconPath:windowIcon.ico,appIconIndex:0,relaunchCommand:'"'+this.executable+'"',relaunchDisplayName:'Orbit'});}
  tray?.setImage(windowIcon.image.resize({width:20,height:20}));
  tray?.setTheme?.(this.menuColors||this.current.colors);
 }
 async update(values){
  this.menuColors=palette(values);
  const colors=Icon.palette(values,this.menuColors),key=crypto.createHash('sha256').update(JSON.stringify(colors)).digest('hex').slice(0,20),ticket=++this.revision;
  if(this.current?.key===key){this.apply();await this.syncStartupIcon();return this.current;}
  await fs.mkdir(this.folder,{recursive:true});const stem=path.join(this.folder,'theme-'+key),ico=stem+'.ico',file=stem+'.png';
  let png;try{png=await fs.readFile(file);await fs.access(ico);}catch{png=await this.render(svg(colors));await fs.writeFile(file,png);await fs.writeFile(ico,pngIcon(png,256));}
  if(ticket!==this.revision)return null;
  const image=this.nativeImage.createFromBuffer(png);if(image.isEmpty())throw Error('Theme icon could not be created.');
  this.current={key,image,ico,colors};this.startupIcon||=this.current;this.apply();await this.syncStartupIcon();if(ticket!==this.revision)return this.current;
  // Bound generated resources; never touch the user's images or shortcuts.
  const entries=await fs.readdir(this.folder),groups=[];for(const name of entries)if(/^theme-[a-f0-9]{20}\.ico$/.test(name)){const item=path.join(this.folder,name);groups.push({stem:item.slice(0,-4),mtime:(await fs.stat(item)).mtimeMs});}
  const protectedStems=new Set([stem,this.startupIcon.ico.slice(0,-4)]);let remaining=4-protectedStems.size;
  groups.sort((a,b)=>b.mtime-a.mtime);for(const old of groups)if(!protectedStems.has(old.stem)){if(remaining-->0)continue;for(const ext of ['.ico','.png'])await fs.unlink(old.stem+ext).catch(()=>{});}
  return this.current;
 }
 async syncStartupIcon(){
  // Windows keeps the process's taskbar artwork until the next full app launch.
  if(!this.taskbar||this.taskbarKey===this.startupIcon.key)return;
  if(!this.startupSync)this.startupSync=this.taskbar.sync(this.startupIcon.ico).then(()=>{this.taskbarKey=this.startupIcon.key;}).finally(()=>{this.startupSync=null;});
  await this.startupSync;
 }
}
module.exports={ThemeIcon,palette,svg};
