/* Developer tools are a source-only capability, never a packaged launch flag. */
function enabled({isPackaged,args=[]}){return isPackaged===false&&args.includes('--dev-debug');}
const ACTIONS=new Set(['devtools','reload-ui','replay-startup','scan-running','refresh-library','open-profile','clear-log','preview-update','clear-preview']);
function requireAccess(allowed){if(!allowed)throw Error('Developer tools are unavailable in this build.');}
function action(value,allowed){requireAccess(allowed);if(typeof value!=='string'||!ACTIONS.has(value))throw Error('Unknown developer action.');return value;}
class DebugLog{constructor(active=false,limit=200){this.active=active;this.limit=limit;this.rows=[];}record(type,event,{ms,ok,code}={}){if(!this.active)return;const row={at:Date.now(),type:String(type).replace(/[^a-z-]/gi,'').slice(0,30),event:String(event).replace(/[^a-z0-9:_/. -]/gi,'').slice(0,90)};if(Number.isFinite(ms))row.ms=Math.max(0,Math.round(ms));if(typeof ok==='boolean')row.ok=ok;if(typeof code==='number'&&Number.isFinite(code))row.code=code;this.rows.push(row);if(this.rows.length>this.limit)this.rows.splice(0,this.rows.length-this.limit);}snapshot(){return this.rows.map(r=>({...r}));}clear(){this.rows=[];}}
module.exports={enabled,requireAccess,action,DebugLog};
