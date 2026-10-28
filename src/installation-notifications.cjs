/* Native Windows content only. No overlay window, network artwork request, or game launch. */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{fileURLToPath,pathToFileURL}=require('node:url');
const {ImageQueue}=require('./image-queue.cjs');
const clean=(value,max=160)=>Array.from(String(value??'').toWellFormed().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g,'').replace(/\s+/g,' ').trim()).slice(0,max).join('');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function localFile(value){try{if(typeof value!=='string')return null;if(value.startsWith('file:')){const url=new URL(value);if(url.hostname&&url.hostname!=='localhost')return null;return fileURLToPath(url);}return path.isAbsolute(value)&&!/^[\\/]{2}/.test(value)?value:null;}catch{return null;}}
const localUri=value=>{const file=localFile(value);return file?pathToFileURL(file).href:null;};
function content({id,title,source='Steam',updated=false,icon,hero}={}){
 const titleText=clean(title)||'Game',provider=clean(source,40),message=updated?'Update complete':'Ready to play',tag='done'+crypto.createHash('sha256').update(String(id)).digest('hex').slice(0,12);
 const logo=localUri(icon),art=localUri(hero);
 const toastXml='<toast duration="short"><visual><binding template="ToastGeneric">'+(art?'<image placement="hero" src="'+escape(art)+'" alt=""/>':'')+(logo?'<image placement="appLogoOverride" hint-crop="none" src="'+escape(logo)+'" alt="Orbit"/>':'')+'<text hint-maxLines="2">'+escape(titleText)+'</text><text>'+escape(message)+'</text>'+(provider?'<text placement="attribution">'+escape(provider)+'</text>':'')+'</binding></visual><actions><action content="View game" arguments="0" activationType="foreground"/></actions></toast>';
 return {title:titleText,body:message+(provider?' · '+provider:''),id:tag,groupId:'orbit-installs',timeoutType:'default',toastXml};
}
async function artwork(candidates,folder){
 for(const value of [...new Set(candidates||[])].slice(0,6)){
  const file=localFile(value);if(!file)continue;
  try{
   const stat=await fs.stat(file);if(!stat.isFile()||stat.size>15e6)continue;
   const key=crypto.createHash('sha256').update(file+':'+stat.mtimeMs+':'+stat.size+':toast-v1').digest('hex').slice(0,24),target=path.join(folder,'hero-'+key+'.png');
   try{await fs.access(target);return target;}catch{}
   const image=require('./image-engine.cjs')(file,{limitInputPixels:20e6,animated:false}),info=await image.metadata();
   // Portrait/square art stays out of the landscape slot; never stretch a cover.
   const sideways=[5,6,7,8].includes(info.orientation),width=sideways?info.height:info.width,height=sideways?info.width:info.height;
   if(!width||!height||width/height<1.6||width<200)continue;
   const bytes=await image.rotate().resize(728,360,{fit:'cover',withoutEnlargement:true}).png().toBuffer();
   await fs.mkdir(folder,{recursive:true});await fs.writeFile(target,bytes);
   const rows=[];for(const name of await fs.readdir(folder))if(/^hero-[a-f0-9]{24}\.png$/.test(name)){const entry=path.join(folder,name);rows.push({file:entry,at:(await fs.stat(entry)).mtimeMs});}
   rows.sort((a,b)=>b.at-a.at);for(const row of rows.slice(24))if(row.file!==target)await fs.unlink(row.file).catch(()=>{});
   return target;
  }catch{}
 }
 return null;
}
class InstallationNotifications{
 constructor({Notification,folder,enabled=()=>true,getGame,getIcon=()=>null,getArtwork=()=>[],openGame,prepareArtwork=artwork,clock=Date.now,platform=process.platform,log=()=>{}}){Object.assign(this,{Notification,folder,enabled,getGame,getIcon,getArtwork,openGame,prepareArtwork,clock,platform,log});this.recent=new Map();this.active=new Map();this.pending=new Set();this.artworkQueue=new ImageQueue(1);}
 async show(input){
  if(!this.enabled()||!this.Notification.isSupported()||!input?.id)return false;
  const game=this.getGame(input.id);if(!game||game.hidden)return false;const id=String(input.id),now=this.clock(),last=this.recent.get(id);
  if(this.pending.has(id)||last!==undefined&&now-last<60000)return false;
  this.pending.add(id);
  try{
   const icon=this.getIcon(),hero=await this.artworkQueue.run(id,()=>this.enabled()?this.prepareArtwork(this.getArtwork(game),this.folder):null).catch(()=>null);
   if(!this.enabled()||!this.getGame(id)||this.getGame(id).hidden)return false;
   const details={id:game.id||id,title:game.title||input.title,source:input.source||'Steam',updated:input.updated===true},options=content({...details,icon:icon?.file,hero});
   if(this.platform!=='win32')delete options.toastXml;if(icon?.image)options.icon=icon.image;
   this.recent.delete(id);this.recent.set(id,now);while(this.recent.size>64)this.recent.delete(this.recent.keys().next().value);
   this.deliver(details,options,false);return true;
  }finally{this.pending.delete(id);}
 }
 deliver(details,options,fallback){
  let notification;try{notification=new this.Notification(options);}catch(error){if(!fallback){const plain={...options};delete plain.toastXml;return this.deliver(details,plain,true);}this.log(error);return;}
  const previous=this.active.get(options.id);if(previous)try{previous.close();}catch{}
  this.active.set(options.id,notification);
  while(this.active.size>32){const [key,old]=this.active.entries().next().value;this.active.delete(key);try{old.close();}catch{}}
  let activated=false;
  const remove=()=>{if(this.active.get(options.id)===notification)this.active.delete(options.id);};
  const activate=()=>{if(activated)return;activated=true;Promise.resolve().then(()=>this.openGame(details)).catch(this.log);remove();};
  notification.on('click',activate);notification.on('action',event=>{if(event?.actionIndex===0)activate();});
  // Timeout moves a toast into Notification Center. Keep its click handler alive there.
  notification.on('close',event=>{if(event?.reason!=='timedOut')remove();});
  notification.on('failed',(_event,error)=>{remove();if(!fallback&&this.enabled()&&!/settings prevent|0x803e0201|-2143420143/i.test(String(error))){const plain={...options};delete plain.toastXml;this.deliver(details,plain,true);}else this.log(error);});
  try{notification.show();}catch(error){remove();if(!fallback&&this.enabled()){const plain={...options};delete plain.toastXml;this.deliver(details,plain,true);}else this.log(error);}
 }
}
module.exports={InstallationNotifications,content,artwork,localFile};
