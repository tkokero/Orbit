// Steam appinfo layout: https://github.com/SteamDatabase/SteamAppInfo#appinfovdf
const fs=require('node:fs/promises'),path=require('node:path');
const {parse}=require('./ui/launch-args.js');
function appInfo(buffer,appId){
 const magic=buffer.readUInt32LE(0);if(![0x07564427,0x07564428,0x07564429].includes(magic))throw Error('Unsupported Steam cache version.');
 let pos=magic===0x07564429?16:8,strings=null;
 const z=(state)=>{const end=buffer.indexOf(0,state.pos);if(end<0||end>=state.end)throw Error('Invalid Steam cache string.');const value=buffer.toString('utf8',state.pos,end);state.pos=end+1;return value;};
 if(magic===0x07564429){const offset=Number(buffer.readBigUInt64LE(8));if(!Number.isSafeInteger(offset)||offset<16||offset+4>buffer.length)throw Error('Invalid Steam string table.');const count=buffer.readUInt32LE(offset);if(count>1000000)throw Error('Steam string table is too large.');const state={pos:offset+4,end:buffer.length};strings=[];for(let i=0;i<count;i++)strings.push(z(state));}
 while(pos+8<=buffer.length){const id=buffer.readUInt32LE(pos);if(!id)return null;const size=buffer.readUInt32LE(pos+4),end=pos+8+size,start=pos+(magic===0x07564427?48:68);if(end>buffer.length||end<start)throw Error('Invalid Steam record.');if(String(id)!==String(appId)){pos=end;continue;}
  const state={pos:start,end};let nodes=0;
  function object(depth=0){if(depth>32)throw Error('Steam cache is nested too deeply.');const out=Object.create(null);while(state.pos<end){if(++nodes>100000)throw Error('Steam record is too large.');const type=buffer[state.pos++];if(type===8||type===11)return out;let key;if(strings){if(state.pos+4>end)throw Error('Invalid Steam key.');key=strings[buffer.readUInt32LE(state.pos)];state.pos+=4;if(key===undefined)throw Error('Invalid Steam key.');}else key=z(state);
   if(type===0)out[key]=object(depth+1);else if(type===1)out[key]=z(state);else if([2,3,4,6].includes(type)){if(state.pos+4>end)throw Error('Invalid Steam value.');out[key]=type===3?buffer.readFloatLE(state.pos):buffer.readUInt32LE(state.pos);state.pos+=4;}else if(type===7||type===10){if(state.pos+8>end)throw Error('Invalid Steam value.');out[key]=String(buffer.readBigUInt64LE(state.pos));state.pos+=8;}else throw Error('Unsupported Steam value.');
  }throw Error('Unfinished Steam record.');}return object();
 }return null;
}
function modeRows(info){const launch=(info?.appinfo||info)?.config?.launch;return Object.entries(launch||{}).filter(([id,row])=>/^\d+$/.test(id)&&row&&typeof row==='object'&&(!row.config?.oslist||String(row.config.oslist).split(',').some(os=>os.trim()==='windows'))).slice(0,24).map(([id,row])=>({id,label:String(row.description||row.description_loc?.english||row.type||'Play').slice(0,160),executable:row.executable,args:parse(String(row.arguments||'')),workingDir:row.workingdir||''}));}
async function resolveMode(version,mode){
 if(typeof mode.executable!=='string'||!version.location)return null;
 const root=await fs.realpath(version.location),file=path.resolve(root,mode.executable.replaceAll('\\',path.sep));
 const real=await fs.realpath(file).catch(()=>null);if(!real||!inside(root,real)||!/[.]exe$/i.test(real)||/^(?:unins.*|setup|installer|update|updater|crashreport.*)[.]exe$/i.test(path.basename(real)))return null;
 const cwd=await fs.realpath(path.resolve(root,String(mode.workingDir||'.').replaceAll('\\',path.sep))).catch(()=>null);if(!cwd||(cwd!==root&&!inside(root,cwd))||!(await fs.stat(real)).isFile()||!(await fs.stat(cwd)).isDirectory())return null;
 return {...mode,executable:real,cwd};
}
function inside(root,file){const rel=path.relative(root,file);return rel&&!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel);}
class SteamModes{
 constructor(){this.cache=new Map();}
 async get(version,root){if(version.source!=='Steam'||!version.installed||!root||!version.location)return [];
  try{const file=path.join(root,'appcache/appinfo.vdf'),stat=await fs.stat(file);if(stat.size>64*1024*1024)return [];const key=String(version.appId||/^steam:\/\/rungameid\/(\d+)$/.exec(version.launch||'')?.[1]);const stamp=file+':'+stat.mtimeMs+':'+stat.size;let cached=this.cache.get(key);if(cached?.stamp!==stamp){cached={stamp,rows:modeRows(appInfo(await fs.readFile(file),key))};if(this.cache.size>=32)this.cache.delete(this.cache.keys().next().value);this.cache.set(key,cached);}return (await Promise.all(cached.rows.map(row=>resolveMode(version,row)))).filter(Boolean);
  }catch{return [];}
 }
}
module.exports={appInfo,modeRows,resolveMode,SteamModes};
