const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
const DAY=86400000;
const identity=s=>Number.isSafeInteger(s.pid)&&typeof s.processStarted==='string'&&Number.isFinite(Date.parse(s.processStarted))?s.id+':'+s.pid+':'+s.processStarted:null;
const spans=r=>r.intervals||[[r.startedAt,r.endedAt]];
const duration=(r,from=-Infinity,to=Infinity)=>spans(r).reduce((n,[a,b])=>n+Math.max(0,Math.min(b,to)-Math.max(a,from))/1000,0);
function combineNearby(rows,active){
 const groups=new Map();
 for(const r of [...rows].sort((a,b)=>a.startedAt-b.startedAt)){
  const list=groups.get(r.gameId)||[],previous=list.at(-1),part={...r,intervals:spans(r).map(v=>[...v]),running:active.has(r.id)};
  if(previous&&r.startedAt-previous.endedAt<=120000){
   previous.endedAt=Math.max(previous.endedAt,r.endedAt);previous.running ||=part.running;
   if(part.running||!active.has(previous.id))previous.id=r.id;
   const intervals=[...previous.intervals,...part.intervals].sort((a,b)=>a[0]-b[0]),merged=[];
   for(const span of intervals){const last=merged.at(-1);if(last&&span[0]<=last[1])last[1]=Math.max(last[1],span[1]);else merged.push(span);}
   previous.intervals=merged;
  }else list.push(part);
  groups.set(r.gameId,list);
 }
 return [...groups.values()].flat().sort((a,b)=>a.endedAt-b.endedAt||a.startedAt-b.startedAt);
}
class ActivityHistory{
 constructor(file,{clock=Date.now}={}){this.file=file;this.clock=clock;this.rows=[];this.active=new Map();this.saving=Promise.resolve();this.lastSaved=0;this.resumable=new Map();}
 async load(){try{const data=JSON.parse(await fs.readFile(this.file,'utf8'));if(data.version!==1||!Array.isArray(data.sessions))throw Error('Invalid session history.');this.rows=data.sessions.filter(r=>typeof r.id==='string'&&typeof r.gameId==='string'&&typeof r.title==='string'&&r.title.length<=300&&Number.isFinite(r.startedAt)&&Number.isFinite(r.endedAt)&&r.endedAt>=r.startedAt&&r.endedAt<=this.clock()+60000).map(r=>({id:r.id,gameId:r.gameId,title:r.title,startedAt:r.startedAt,endedAt:r.endedAt,...(Array.isArray(r.intervals)&&r.intervals.length<=128&&r.intervals.every((v,i)=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)&&v[0]>=r.startedAt&&v[1]>=v[0]&&v[1]<=r.endedAt&&(!i||v[0]>=r.intervals[i-1][1]))?{intervals:r.intervals}:{} )}));for(const c of data.resume||[]){if(typeof c.token==='string'&&c.token.length<300&&typeof c.rowId==='string'&&this.rows.some(r=>r.id===c.rowId))this.resumable.set(c.token,c.rowId);}this.prune();}catch(e){if(e.code!=='ENOENT')throw e;}}
 prune(){this.rows=this.rows.filter(r=>r.endedAt>=this.clock()-180*DAY).slice(-1000);}
 save(){this.lastSaved=this.clock();this.prune();const payload=JSON.stringify({version:1,sessions:this.rows,resume:[...this.resumable].map(([token,rowId])=>({token,rowId}))});this.saving=this.saving.catch(()=>{}).then(async()=>{await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.writeFile(this.file+'.tmp',payload);await fs.rename(this.file+'.tmp',this.file);});return this.saving;}
 async observe(sessions,enabled=true){const now=this.clock(),live=new Set();let changed=false,structural=false;
  for(const s of enabled?sessions:[]){if(typeof s.id!=='string'||typeof s.title!=='string')continue;const key=s.id+':'+s.pid+':'+s.since;live.add(key);let row=this.active.get(key);
   // Never count time before Orbit observed the process or across sleep/long gaps.
   if(row&&now-row.endedAt>60000){this.active.delete(key);row=null;}
   if(!row){const token=identity(s),old=token&&this.rows.find(r=>r.id===this.resumable.get(token));if(old&&now-old.endedAt<=180*DAY&&now>=old.endedAt&&spans(old).length<128){old.intervals=[...spans(old).map(v=>[...v]),[now,now]];row=old;this.active.set(key,row);structural=true;}if(token)this.resumable.delete(token);}
   if(!row){row={id:randomUUID(),gameId:s.id,title:s.title.slice(0,300),startedAt:now,endedAt:now};this.rows.push(row);this.active.set(key,row);structural=true;}
   row.endedAt=now;if(row.intervals)row.intervals[row.intervals.length-1][1]=now;const token=identity(s);if(token)this.resumable.set(token,row.id);changed=true;
  }
  for(const [key,row]of this.active)if(!live.has(key)){row.endedAt=Math.min(now,row.endedAt+30000);if(row.intervals)row.intervals[row.intervals.length-1][1]=row.endedAt;for(const [token,id]of this.resumable)if(id===row.id)this.resumable.delete(token);this.active.delete(key);changed=true;structural=true;}
  if(changed&&(structural||now-this.lastSaved>=60000))await this.save();
 }
 snapshot(gameId){const now=this.clock(),week=now-7*DAY,active=new Set([...this.active.values()].map(r=>r.id)),rows=combineNearby(this.rows.filter(r=>!gameId||r.gameId===gameId),active),seconds=r=>duration(r);const totals=new Map();let weekSeconds=0;for(const r of rows){const n=duration(r,week,now);weekSeconds+=n;if(n)totals.set(r.gameId,{id:r.gameId,title:r.title,seconds:n+(totals.get(r.gameId)?.seconds||0)});}return {enabled:true,weekSeconds,totalSeconds:rows.reduce((s,r)=>s+seconds(r),0),games:[...totals.values()].sort((a,b)=>b.seconds-a.seconds),sessions:rows.slice(-100).reverse().map(r=>({...r,seconds:seconds(r),running:r.running})),retentionDays:180};}
 async clear(){this.rows=[];this.active.clear();this.resumable.clear();await this.save();}
 async finish({restart=false}={}){if(restart){this.active.clear();await this.save();return;}await this.observe([],false);this.resumable.clear();await this.save();}
}
module.exports={ActivityHistory};
