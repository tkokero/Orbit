/* On-demand metadata search. Unknown formats are located, never edited or executed. */
const fs=require('node:fs/promises'),path=require('node:path');
const skip=/^(?:engine|content|binaries|plugins|node_modules|cache|caches|logs?|screenshots?|movies|videos|textures|shaders|backups?|\.git|cef.*)$/i;
const wanted=name=>/^(?:PROFSAVE(?:_profile)?|GameUserSettings\.ini)$/i.test(name)||/^(?:(?:riotlocalmachine|user|client|engine|config|settings)(?:[_ .-].*)?|.*(?:graphics?|video|display|render|quality).*)\.(?:ini|cfg|conf|json|xml|txt|yaml|yml|wtf)$/i.test(name)||/^settings_v\d+\.ini$/i.test(name);
const inside=(base,file)=>{const rel=path.relative(base,file);return rel===''||rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel);};
function namesFor(game){
 const title=String(game.title||'').replace(/[®™]/g,'').replace(/[<>:"/\\|?*]/g,' ').replace(/\s+/g,' ').trim();
 const values=[title,title.replace(/[ '\-:]/g,''),title.replaceAll(' ','_'),...(game.versions||[]).flatMap(v=>[v.location&&path.basename(v.location),v.executable&&path.basename(v.executable).replace(/(?:-Win64-Shipping)?\.exe$/i,'')])];
 const aliases={'overwatch 2':['Overwatch'],palworld:['Pal'],satisfactory:['FactoryGame'],'contractors vr':['Contractors_UE4_22']};values.push(...aliases[title.toLowerCase()]||[]);
 return [...new Set(values.filter(n=>typeof n==='string'&&n.length>=3&&n.length<=80&&!/[<>:"/\\|?*]/.test(n)&&n!=='.'&&n!=='..'))].slice(0,12);
}
class GameConfigSearch{
 constructor({documents,local,localLow,roaming,savedGames,clock=Date.now,maxDirectories=96,maxEntries=4000,maxFiles=64}={}){Object.assign(this,{documents,local,localLow,roaming,savedGames,clock,maxDirectories,maxEntries,maxFiles});this.cache=new Map();}
 async quickVideo(game){
  this.quickRoots??=new Map();const names=new Set(namesFor(game).map(n=>n.toLowerCase())),bases=[];
  const list=async folder=>{try{const rows=[],stat=await fs.lstat(folder);if(!stat.isDirectory()||stat.isSymbolicLink())return rows;for await(const entry of await fs.opendir(folder)){rows.push(entry);if(rows.length===1024)break;}return rows;}catch{return [];}};
  for(const base of [this.documents,this.local,this.savedGames].filter(Boolean)){
   let entry=this.quickRoots.get(base);if(!entry||this.clock()-entry.at>=60000){entry={at:this.clock(),rows:list(base)};this.quickRoots.set(base,entry);}
   for(const row of await entry.rows)if(row.isDirectory()&&!row.isSymbolicLink()&&names.has(row.name.toLowerCase()))bases.push(path.join(base,row.name));
  }
  for(const v of (game.versions||[]).filter(v=>v.installed&&v.location).slice(0,2))if(path.isAbsolute(v.location)&&path.parse(v.location).root!==path.resolve(v.location))bases.push(v.location);
  const files=[];let scannedFolders=0;
  for(const base of [...new Set(bases)].slice(0,12))for(const leaf of ['', 'local','cfg']){
   const folder=path.join(base,leaf),rows=await list(folder);scannedFolders++;
   for(const row of rows)if(row.isFile()&&!row.isSymbolicLink()&&wanted(row.name)&&/\.(?:txt|cfg|ini|conf)$/i.test(row.name)&&!/(?:credential|password|token|login|auth)/i.test(row.name)){
    const file=path.join(folder,row.name);try{const stat=await fs.lstat(file);if(stat.nlink>1||stat.size>1024*1024)continue;files.push({path:file,name:row.name,modified:stat.mtimeMs,size:stat.size,root:base});if(files.length===8)return {files,scannedFolders,skipped:0,limited:true};}catch{}
   }
  }
  return {files,scannedFolders,skipped:0,limited:false};
 }
 async find(game,{refresh=false}={}){
  const names=namesFor(game),roots=[],common=[this.documents,this.local,this.localLow,this.roaming,this.savedGames].filter(Boolean).map(p=>path.resolve(p));
  const add=file=>{if(!file||!path.isAbsolute(file))return;const value=path.resolve(file);if(common.includes(value)||path.parse(value).root===value||[process.env.ProgramFiles,process.env['ProgramFiles(x86)'],process.env.SystemRoot].filter(Boolean).some(p=>path.resolve(p)===value))return;if(!roots.includes(value))roots.push(value);};
  for(const v of (game.versions||[]).filter(v=>v.installed).slice(0,4)){add(v.location);if(v.executable)add(path.dirname(v.executable));}
  for(const base of common)for(const name of names)add(path.join(base,name));
  if(/^apex legends$/i.test(String(game.title).replace(/[®™]/g,''))&&this.savedGames)add(path.join(this.savedGames,'Respawn','Apex'));
  if(/^mirror'?s edge.*catalyst$/i.test(game.title)&&this.documents)add(path.join(this.documents,'Mirrors Edge Catalyst'));
  // Unity products can be nested beneath a company directory. Inspect names only.
  if(this.localLow)try{for(const company of (await fs.readdir(this.localLow,{withFileTypes:true})).slice(0,48))if(company.isDirectory()&&!company.isSymbolicLink()&&!skip.test(company.name))for(const name of names.slice(0,4))add(path.join(this.localLow,company.name,name));}catch{}
  const signature=JSON.stringify(roots),cached=this.cache.get(game.id);if(!refresh&&cached?.signature===signature&&this.clock()-cached.at<60000)return cached.result;
  const queue=roots.slice(0,256).map(root=>({root,folder:root,depth:0})),seen=new Set(),files=[];let visited=0,entries=0,skipped=0,limited=false;
  while(queue.length){
   if(visited>=this.maxDirectories||entries>=this.maxEntries||files.length>=this.maxFiles){limited=true;break;}
   const item=queue.shift();if(seen.has(item.folder)||!inside(item.root,item.folder))continue;seen.add(item.folder);
   let stat,rows=[];try{stat=await fs.lstat(item.folder);if(!stat.isDirectory()||stat.isSymbolicLink())continue;const directory=await fs.opendir(item.folder);for await(const row of directory){rows.push(row);if(rows.length>this.maxEntries-entries){limited=true;break;}}}catch(error){if(error.code!=='ENOENT'&&error.code!=='ENOTDIR')skipped++;continue;}
   visited++;rows.sort((a,b)=>Number(/config|settings|saved|local|profile/i.test(b.name))-Number(/config|settings|saved|local|profile/i.test(a.name)));
   for(const row of rows){
    if(entries++>=this.maxEntries||files.length>=this.maxFiles){limited=true;break;}
    if(row.isSymbolicLink())continue;const file=path.join(item.folder,row.name);
    if(row.isDirectory()){if(item.depth<4&&!skip.test(row.name)&&!/(?:credential|password|token|auth|account)/i.test(row.name))queue.push({...item,folder:file,depth:item.depth+1});continue;}
    if(!row.isFile()||!wanted(row.name)||/credential|password|token|login|auth/i.test(row.name))continue;
    try{const s=await fs.lstat(file);if(s.isSymbolicLink()||s.nlink>1||s.size>1024*1024)continue;files.push({path:file,name:row.name,modified:s.mtimeMs,size:s.size,root:item.root});}catch{skipped++;}
   }
  }
  const result={files,scannedFolders:visited,skipped,limited};if(this.cache.size>=32)this.cache.delete(this.cache.keys().next().value);this.cache.set(game.id,{at:this.clock(),signature,result});return result;
 }
}
module.exports={GameConfigSearch,wanted,namesFor,inside};
