/* Compact totals for confirmed observations; no paths, titles, polling or platform estimates. */
const MAX_GAMES=100000,RECENT=16;
const playKey=row=>row.playKeys?.[0]||(Number.isFinite(row.launchAt)&&row.launchAt>=0&&row.launchAt<=row.startedAt?'launch:'+row.launchAt:'session:'+require('node:crypto').createHash('sha256').update(row.id).digest('hex'));
const playKeys=row=>row.playKeys||[playKey(row)];
class RecordedPlays{
 constructor(){this.games=new Map();}
 static read(input){
  if(!Array.isArray(input)||input.length>MAX_GAMES)throw Error('Invalid recorded play totals.');
  const result=new RecordedPlays();
  for(const row of input){
   if(typeof row?.gameId!=='string'||!row.gameId||row.gameId.length>300||result.games.has(row.gameId)||!Number.isSafeInteger(row.count)||row.count<0||!Array.isArray(row.recent)||row.recent.length>RECENT||row.recent.length>row.count||row.recent.some(key=>typeof key!=='string'||key.length>350||!key.startsWith('launch:')&&!key.startsWith('session:'))||new Set(row.recent).size!==row.recent.length)throw Error('Invalid recorded play totals.');
   result.games.set(row.gameId,{count:row.count,recent:[...row.recent]});
  }
  return result;
 }
 static seed(rows){const result=new RecordedPlays(),seen=new Set();for(const row of rows)for(const key of playKeys(row)){const identity=JSON.stringify([row.gameId,key]);if(seen.has(identity))continue;seen.add(identity);result.record(row.gameId,key);}return result;}
 reconcile(before,after){
  const keys=rows=>{const groups=new Map();for(const row of rows){if(!groups.has(row.gameId))groups.set(row.gameId,new Set());for(const key of playKeys(row))groups.get(row.gameId).add(key);}return groups;},old=keys(before),next=keys(after);
  for(const id of new Set([...old.keys(),...next.keys()])){
   const was=old.get(id)||new Set(),now=next.get(id)||new Set(),game=this.games.get(id);
   if(!game)continue;
   game.count=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,game.count+now.size-was.size));
   game.recent=game.recent.filter(key=>!was.has(key)||now.has(key));
   for(const key of now)if(!was.has(key)){game.recent=game.recent.filter(value=>value!==key);game.recent.push(key);}
   game.recent=game.recent.slice(-Math.min(RECENT,game.count));if(!game.count)game.recent=[];
  }
 }
 record(gameId,key,alreadyCounted=false){
  let game=this.games.get(gameId);const wasTracked=Boolean(game);
  if(!game){if(this.games.size>=MAX_GAMES)return;game={count:0,recent:[]};this.games.set(gameId,game);}
  if((!alreadyCounted||!wasTracked)&&!game.recent.includes(key))game.count=Math.min(Number.MAX_SAFE_INTEGER,game.count+1);
  game.recent=game.recent.filter(value=>value!==key);game.recent.push(key);if(game.recent.length>RECENT)game.recent.shift();
 }
 count(gameId){if(gameId)return this.games.get(gameId)?.count??(this.games.size>=MAX_GAMES?null:0);let total=0;for(const game of this.games.values())total=Math.min(Number.MAX_SAFE_INTEGER,total+game.count);return total;}
 snapshot(){return [...this.games].map(([gameId,game])=>({gameId,count:game.count,recent:[...game.recent]}));}
}
module.exports={RecordedPlays,playKey,playKeys};
