/* Derived on demand from retained, process-observed history. No extra tracking or writes. */
const DAY=86400000;
function localDay(time){
 const d=new Date(time);
 return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY;
}
function launchStreaks(rows,now=Date.now()){
 const today=localDay(now),days=[...new Set(rows.map(r=>Number.isFinite(r.launchAt)&&r.launchAt>=0&&r.launchAt<=r.startedAt?r.launchAt:r.startedAt).filter(time=>Number.isFinite(time)&&time>=now-180*DAY&&time<=now).map(localDay))].sort((a,b)=>a-b);
 let run=0,best=0,previous=null;
 for(const day of days){run=previous===day-1?run+1:1;best=Math.max(best,run);previous=day;}
 return {current:previous!==null&&previous>=today-1?run:0,best};
}
module.exports={launchStreaks};
