const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('./image-engine.cjs'),{pathToFileURL}=require('node:url');
function options(value={}){const fit=value.fit||'cover',x=value.x??50,y=value.y??50;if(!['cover','contain'].includes(fit)||![x,y].every(n=>Number.isInteger(n)&&n>=0&&n<=100))throw Error('Choose a valid crop position.');return {fit,x,y};}
const validKey=key=>/^[a-f0-9]{32}$/.test(key);
const HERO_SIZE=Object.freeze({width:1240,height:400});
class CustomArtwork{
 constructor(root){this.root=path.resolve(root);this.entries=Object.create(null);this.busy=false;}
 async load(){try{const data=JSON.parse(await fs.readFile(path.join(this.root,'index.json'),'utf8'));if(!data||data.version!==1||!data.entries||typeof data.entries!=='object')throw Error('Invalid custom artwork index.');for(const [id,entry]of Object.entries(data.entries).slice(0,30000)){if(!entry||typeof entry!=='object')continue;const kinds={};for(const kind of ['cover','hero'])if(entry[kind]&&validKey(entry[kind].key))try{kinds[kind]={key:entry[kind].key,...options(entry[kind]),...(entry[kind].ratioVersion===2?{ratioVersion:2}:{})};}catch{}this.entries[id]=kinds;}}catch(e){if(e.code!=='ENOENT'){this.unavailable=true;throw e;}}}
 file(key,source=false){if(!validKey(key))throw Error('Invalid artwork key.');return path.join(this.root,key+(source?'-source.webp':'-render.webp'));}
 info(id){return Object.fromEntries(['cover','hero'].filter(k=>this.entries[id]?.[k]).map(k=>{const a=this.entries[id][k];return [k,{...a,url:this.url(id,k),source:pathToFileURL(this.file(a.key,true)).href}];}));}
 url(id,kind){const a=this.entries[id]?.[kind];return a?pathToFileURL(this.file(a.key)).href+(kind==='hero'&&a.ratioVersion===2?'?ratio=2':''):null;}
 async save(){await fs.mkdir(this.root,{recursive:true});await fs.writeFile(path.join(this.root,'index.tmp'),JSON.stringify({version:1,entries:this.entries}));await fs.rename(path.join(this.root,'index.tmp'),path.join(this.root,'index.json'));}
 async exclusive(fn){if(this.unavailable)throw Error('Custom artwork needs index repair. Existing images are kept.');if(this.busy)throw Error('Another artwork operation is running.');this.busy=true;this.operation=Promise.resolve().then(fn);try{return await this.operation;}finally{this.busy=false;this.operation=null;}}
 async render(source,target,kind,crop){const size=kind==='cover'?{width:320,height:480}:HERO_SIZE;let image=sharp(source,{limitInputPixels:40e6,failOn:'error'});if(crop.fit==='cover'){const {width,height}=await image.metadata(),ratio=size.width/size.height;let w=width,h=height;if(width/height>ratio)w=Math.max(1,Math.floor(height*ratio));else h=Math.max(1,Math.floor(width/ratio));image=image.extract({left:Math.round((width-w)*crop.x/100),top:Math.round((height-h)*crop.y/100),width:w,height:h});}await image.resize({...size,fit:crop.fit==='cover'?'fill':'contain',background:'#10151e'}).flatten({background:'#10151e'}).webp({quality:82,effort:3}).toFile(target);}
 async set(id,kind,filename,crop={}){
  if(!['cover','hero'].includes(kind))throw Error('Choose cover or banner artwork.');
  return this.exclusive(async()=>{
   const selected=options(crop),old=this.entries[id]?.[kind],key=crypto.randomBytes(16).toString('hex'),source=this.file(key,true),target=this.file(key);
   try{
    await fs.mkdir(this.root,{recursive:true});
    if(filename){const stat=await fs.stat(filename);if(!stat.isFile()||stat.size>15e6)throw Error('Choose an image under 15 MB.');const bytes=await fs.readFile(filename),image=sharp(bytes,{limitInputPixels:40e6,failOn:'error'}),meta=await image.metadata();if(!['jpeg','png','webp'].includes(meta.format)||meta.pages>1)throw Error('Choose a still PNG, JPEG, or WebP image.');await image.rotate().resize({width:2400,height:1800,fit:'inside',withoutEnlargement:true}).flatten({background:'#10151e'}).webp({quality:85,effort:3}).toFile(source);}
    else{if(!old)throw Error('Choose custom artwork first.');await fs.copyFile(this.file(old.key,true),source);}
    await this.render(source,target,kind,selected);this.entries[id]||={};this.entries[id][kind]={key,...selected,...(kind==='hero'?{ratioVersion:2}:{})};
    try{await this.save();}catch(e){if(old)this.entries[id][kind]=old;else delete this.entries[id][kind];throw e;}
    if(old)for(const file of [this.file(old.key),this.file(old.key,true)])await fs.unlink(file).catch(()=>{});
    return this.info(id);
   }catch(e){for(const file of [source,target])await fs.unlink(file).catch(()=>{});throw e;}
  });
 }
 async reset(id,kind){if(!['cover','hero'].includes(kind))throw Error('Choose cover or banner artwork.');return this.exclusive(async()=>{const old=this.entries[id]?.[kind];if(!old)return this.info(id);delete this.entries[id][kind];try{await this.save();}catch(e){this.entries[id][kind]=old;throw e;}for(const file of [this.file(old.key),this.file(old.key,true)])await fs.unlink(file).catch(()=>{});return this.info(id);});}
}
module.exports={CustomArtwork,options,HERO_SIZE};
