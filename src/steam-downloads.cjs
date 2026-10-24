// Steam's current callback groups rows by client. Older clients return flat rows.
const number=value=>Number.isFinite(Number(value))&&Number(value)>=0?Number(value):0;
function normalizeSnapshot(raw={}){
 raw=raw||{};
 const local=row=>row?.remote_client_id==null||String(row.remote_client_id)==='0';
 const groups=Array.isArray(raw.items)?raw.items:[],rows=groups.filter(local).flatMap(row=>Array.isArray(row?.item_data)?row.item_data:[row]);
 const overview=(Array.isArray(raw.overview)?raw.overview.find(local):local(raw.overview)?raw.overview:null)||{};
 const progress=(row,index)=>{const types=row.update_type_info||[];return types.reduce((sum,type)=>sum+number(type.progress?.[2]?.[index]),0);};
 const result=new Map();
 for(const row of rows){const appid=Number(row?.appid);if(!Number.isInteger(appid)||appid<=0||result.has(appid))continue;
  const current=appid===Number(overview.update_appid),paused=Boolean(row.paused||overview.paused),active=!paused&&!row.completed&&Boolean(row.active||current&&overview.update_state!=='None');
  const downloaded=row.downloaded_bytes!=null?number(row.downloaded_bytes):progress(row,'bytes_in_progress');const total=row.total_bytes!=null?number(row.total_bytes):progress(row,'bytes_total');
  const network=current?overview.progress?.[2]:null;const done=network?number(network.bytes_in_progress):downloaded,target=network?number(network.bytes_total):total;
  result.set(appid,{appid,active,paused,completed:Boolean(row.completed),queue_index:Number.isInteger(row.queue_index)?row.queue_index:-1,downloaded_bytes:done,total_bytes:target,percent:target>0?Math.min(100,done/target*100):null,rate:active&&current?number(overview.update_network_bytes_per_second):0,diskRate:active&&current?number(overview.update_disc_bytes_per_second):0,etaSeconds:active&&current&&overview.overall_estimated_time_remaining_sec>=0?overview.overall_estimated_time_remaining_sec:null});
 }
 const items=[...result.values()].sort((a,b)=>Number(b.active)-Number(a.active)||(a.queue_index>=0?a.queue_index:1e9)-(b.queue_index>=0?b.queue_index:1e9)||Number(a.paused)-Number(b.paused)||a.appid-b.appid);
 return {items,overview:{paused:Boolean(overview.paused),update_appid:number(overview.update_appid),rate:number(overview.update_network_bytes_per_second)},move:raw.move?.appid?raw.move:null};
}
function libraryTransfers(snapshot,games){const lookup=new Map();for(const g of games)for(const v of g.versions||[])if(v.source==='Steam')lookup.set(Number(v.appId),{game:g,version:v});return snapshot.items.filter(r=>!r.completed).map(r=>{const found=lookup.get(r.appid),game=found?.game;return {id:game?.id||'steam:'+r.appid,versionId:found?.version.id||'steam:'+r.appid,appId:r.appid,title:game?.title||'Steam app '+r.appid,source:'Steam',hero:game?.hero||null,progress:{phase:r.paused?'Paused · Download':r.active?'Download':r.queue_index>=0?'Queued · Download':'Scheduled · Download',active:r.active,percent:r.percent,done:r.downloaded_bytes,total:r.total_bytes,bytesPerSecond:r.rate,etaSeconds:r.etaSeconds,queueIndex:r.queue_index}};});}
module.exports={normalizeSnapshot,libraryTransfers};
