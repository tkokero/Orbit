const path=require('node:path').win32;
const {findProcesses}=require('./playtime.cjs');
class SteamVr{
 constructor({games,launch,find=findProcesses,wait=ms=>new Promise(r=>setTimeout(r,ms)),smoke=false}){Object.assign(this,{games,launch,find,wait,smoke});}
 tool(){return this.games().find(g=>g.kind==='tool'&&g.installed&&g.versions?.some(v=>v.source==='Steam'&&String(v.appId)==='250820'));}
 async status(){const tool=this.tool();if(this.smoke)return {available:!!tool,running:false,toolId:tool?.id,title:'SteamVR'};
  const rows=await this.find(['vrserver.exe']),locations=tool?.versions.filter(v=>v.installed&&v.location).map(v=>path.normalize(v.location).toLowerCase())||[];
  const running=rows.some(r=>r.name.toLowerCase()==='vrserver'&&(!r.path||locations.some(folder=>{const rel=path.relative(folder,path.normalize(r.path).toLowerCase());return rel&&!rel.startsWith('..')&&!path.isAbsolute(rel);})));return {available:!!tool,running,toolId:tool?.id,title:'SteamVR'};
 }
 async open(){const tool=this.tool();if(!tool)throw Error('Install SteamVR through Steam, then refresh Orbit.');if((await this.status()).running)return {message:'SteamVR is already running.'};return this.launch(tool.id);}
 async prepare(){if(this.preparing)return this.preparing;this.preparing=this.run().finally(()=>{this.preparing=null;});return this.preparing;}
 async run(){if((await this.status()).running)return;await this.open();if(this.smoke)return;const deadline=Date.now()+12000;for(let n=0;n<12&&Date.now()<deadline;n++){await this.wait(500);if((await this.status()).running)return;}throw Error('SteamVR has not started yet. Open it in Steam, or turn off Prepare SteamVR in this launch option and try again.');}
}
module.exports={SteamVr};
