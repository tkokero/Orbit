/* Reviewed local corrections. No platform totals, process controls or background timers. */
const {randomUUID,createHash}=require('node:crypto');
const {RecordedPlays,playKeys}=require('./recorded-plays.cjs');
const {launchStreaks}=require('./launch-streaks.cjs');
const {records}=require('./activity-records.cjs');
const DAY=86400000,copy=value=>structuredClone(value);
const intervals=row=>row.intervals||[[row.startedAt,row.endedAt]];
function union(values){const result=[];for(const span of values.map(v=>[...v]).sort((a,b)=>a[0]-b[0])){const last=result.at(-1);if(last&&span[0]<=last[1])last[1]=Math.max(last[1],span[1]);else result.push(span);}return result;}
const revision=rows=>createHash('sha256').update(JSON.stringify([...rows].sort((a,b)=>a.id.localeCompare(b.id)))).digest('hex');
function seconds(rows){const games=new Map();for(const row of rows){if(!games.has(row.gameId))games.set(row.gameId,[]);games.get(row.gameId).push(...intervals(row));}return [...games.values()].reduce((n,spans)=>n+union(spans).reduce((sum,[a,b])=>sum+(b-a)/1000,0),0);}
class ActivityCorrections{
 constructor(history){this.history=history;this.staged=new Map();this.lastUndo=null;}
 clear(){this.staged.clear();this.lastUndo=null;}
 undoInfo(){if(this.lastUndo?.expiresAt<=this.history.clock())this.lastUndo=null;return this.lastUndo?{token:this.lastUndo.token,label:this.lastUndo.recovered?'Restore last session change':'Undo session change',expiresAt:this.lastUndo.expiresAt}:null;}
 restore(value){
  this.lastUndo=null;const now=this.history.clock();
  try{
   if(value?.version!==1||typeof value.token!=='string'||!/^[a-f0-9-]{36}$/.test(value.token)||!Number.isSafeInteger(value.createdAt)||value.createdAt<0||value.createdAt>now+60000||value.expiresAt!==value.createdAt+7*DAY||value.expiresAt<=now||JSON.stringify(value).length>2*1024*1024)return;
   const decode=input=>{if(!Array.isArray(input)||input.length>1000)throw Error();const result=records(input,now);if(result.length!==input.length||new Set(result.map(r=>r.id)).size!==result.length||result.some((r,i)=>r.id.length>300||r.gameId.length>300||input[i].intervals&&!r.intervals||input[i].playKeys&&!r.playKeys))throw Error();return result;};
   const before=decode(value.before),after=decode(value.after);if(!before.length||after.length>1)return;
   this.lastUndo={token:value.token,before,after,createdAt:value.createdAt,expiresAt:value.expiresAt,recovered:true};
  }catch{/* A malformed optional recovery must not discard valid history. */}
 }
 saved(){if(!this.undoInfo())return undefined;const {token,before,after,createdAt,expiresAt}=this.lastUndo;return {version:1,token,before,after,createdAt,expiresAt};}
 resolve(input){
  const h=this.history;
  if(!input||!['edit','merge','remove'].includes(input.action)||!Array.isArray(input.targets)||!input.targets.length||input.targets.length>100)throw Error('Choose up to 100 recorded sessions.');
  const ids=new Set(),rows=[],byId=new Map(h.rows.map(row=>[row.id,row]));
  if(input.targets.reduce((n,target)=>n+(target?.ids?.length||0),0)>1000)throw Error('Choose fewer sessions at once.');
  for(const target of input.targets){
   if(!Array.isArray(target?.ids)||!target.ids.length||target.ids.length>1000||typeof target.revision!=='string')throw Error('Refresh Activity and select the sessions again.');
   const selected=target.ids.map(id=>{if(typeof id!=='string'||ids.has(id))throw Error('Choose each session once.');ids.add(id);const row=byId.get(id);if(!row)throw Error('These sessions changed. Refresh Activity and try again.');return row;});
   if(revision(selected)!==target.revision)throw Error('These sessions changed. Refresh Activity and try again.');
   rows.push(...selected);
  }
  if([...h.active.values()].some(row=>ids.has(row.id)))throw Error('Wait until the game session finishes before changing it.');
  rows.sort((a,b)=>a.startedAt-b.startedAt);
  const gameIds=new Set(rows.map(row=>row.gameId));let after=[];
  if(input.action==='edit'){
   if(input.targets.length!==1||gameIds.size!==1)throw Error('Edit one session at a time.');
   const {startedAt,endedAt}=input;
   if(!Number.isSafeInteger(startedAt)||!Number.isSafeInteger(endedAt)||startedAt<0||endedAt<=startedAt||endedAt>h.clock()||endedAt<h.clock()-180*DAY||endedAt-startedAt>180*DAY)throw Error('Choose a start before the end, within retained history and no later than now.');
   const keys=[...new Set(rows.flatMap(playKeys))];
   after=[{id:rows[0].id,gameId:rows[0].gameId,title:rows[0].title,startedAt,endedAt,launchAt:startedAt,playKeys:keys,corrected:true}];
  }else if(input.action==='merge'){
   if(input.targets.length<2||gameIds.size!==1)throw Error('Select at least two sessions of the same game to merge.');
   const spans=union(rows.flatMap(intervals));if(spans.length>128)throw Error('Merge fewer sessions at once.');
   const first=rows[0],startedAt=spans[0][0],endedAt=spans.at(-1)[1];
   after=[{id:first.id,gameId:first.gameId,title:first.title,startedAt,endedAt,launchAt:Math.min(...rows.map(r=>r.launchAt??r.startedAt)),intervals:spans,playKeys:[playKeys(first)[0]],corrected:true}];
  }
  if(JSON.stringify({before:rows,after}).length>2*1024*1024)throw Error('Choose fewer sessions to keep recovery available after restarting Orbit.');
  return {ids,rows,after,gameIds,next:[...h.rows.filter(row=>!ids.has(row.id)),...after].sort((a,b)=>a.startedAt-b.startedAt)};
 }
 preview(input){
  const plan=this.resolve(input),h=this.history,now=h.clock();
  for(const [token,item]of this.staged)if(item.expiresAt<=now)this.staged.delete(token);
  if(this.staged.size>=4)this.staged.delete(this.staged.keys().next().value);
  const token=randomUUID(),counts=RecordedPlays.read(h.counts().snapshot());counts.reconcile(h.rows,plan.next);
  this.staged.set(token,{input:copy(input),expiresAt:now+5*60000});
  const gameId=plan.gameIds.size===1?[...plan.gameIds][0]:undefined,scope=rows=>rows.filter(row=>!gameId||row.gameId===gameId);
  return {token,action:input.action,count:input.targets.length,title:gameId?plan.rows[0].title:'Selected games',startedAt:plan.after[0]?.startedAt??plan.rows[0].startedAt,endedAt:plan.after[0]?.endedAt??Math.max(...plan.rows.map(r=>r.endedAt)),secondsBefore:seconds(plan.rows),secondsAfter:seconds(plan.after),timesPlayedBefore:h.counts().count(gameId),timesPlayedAfter:counts.count(gameId),streaksBefore:launchStreaks(scope(h.rows),now),streaksAfter:launchStreaks(scope(plan.next),now),gapsExcluded:input.action==='merge',showStreaks:true};
 }
 async commit(next,affected,recovery){
  const h=this.history,old={rows:h.rows,plays:RecordedPlays.read(h.counts().snapshot()),resume:new Map(h.resumable),recovery:this.lastUndo};
  h.counts().reconcile(h.rows,next);h.rows=next;this.lastUndo=recovery;
  for(const [token,id]of h.resumable)if(affected.has(id))h.resumable.delete(token);
  try{await h.save();}catch(error){h.rows=old.rows;h.plays=old.plays;h.resumable=old.resume;this.lastUndo=old.recovery;throw error;}
 }
 async apply(token){
  const item=this.staged.get(token);if(!item||item.expiresAt<=this.history.clock())throw Error('This review expired. Review the change again.');
  const plan=this.resolve(item.input),before=copy(plan.rows),after=copy(plan.after);
  const createdAt=this.history.clock();await this.commit(plan.next,plan.ids,{token:randomUUID(),before,after,createdAt,expiresAt:createdAt+7*DAY});
  this.staged.clear();
  return {action:item.input.action,undo:this.undoInfo()};
 }
 async undo(token){
  const h=this.history,item=this.lastUndo;
  if(!this.undoInfo()||token!==item.token)throw Error('This change can no longer be undone.');
  const ids=new Set([...item.before,...item.after].map(row=>row.id)),current=h.rows.filter(row=>ids.has(row.id));
  if(revision(current)!==revision(item.after))throw Error('These sessions changed. Undo would overwrite newer history.');
  if([...h.active.values()].some(row=>ids.has(row.id)))throw Error('Wait until the game session finishes before undoing this change.');
  const next=[...h.rows.filter(row=>!ids.has(row.id)),...copy(item.before)].sort((a,b)=>a.startedAt-b.startedAt);
  if(next.length>1000||item.before.some(row=>row.endedAt<h.clock()-180*DAY))throw Error('Restoring would exceed retained history. Export or review the current recordings first.');
  await this.commit(next,ids,null);
  this.clear();return true;
 }
}
module.exports={ActivityCorrections,revision,union};
