/* NVIDIA's installed public MCP bridge. Only game discovery and per-game presets. */
const fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
const {StringDecoder}=require('node:string_decoder');
const READ='nvapp_client_get_applications',SET='nvapp_client_set_game_optimization';
class NvidiaAppError extends Error{constructor(message,code){super(message);this.code=code;}}
function payload(result){
 if(result?.isError){const value=result.structuredContent,detail=value?.error||value;throw new NvidiaAppError(String(detail?.message||result.content?.find(c=>c.type==='text')?.text||'NVIDIA App rejected the request.').slice(0,1200),detail?.code||'nvidia_error');}
 if(result?.structuredContent&&typeof result.structuredContent==='object')return result.structuredContent;
 for(const item of result?.content||[])if(item.type==='text')try{return JSON.parse(item.text);}catch{}
 return {message:result?.content?.filter(c=>c.type==='text').map(c=>c.text).join('\n').slice(0,1200)||'NVIDIA returned no confirmation. Check NVIDIA App.'};
}
class NvidiaApp{
 constructor({programFiles=process.env.ProgramFiles||'C:/Program Files',spawnProcess=spawn,timeout}={}){this.bridge=path.join(programFiles,'NVIDIA Corporation/NVIDIA App/McpServer/NvAppMcpServer.exe');this.spawnProcess=spawnProcess;this.timeout=timeout??8000;this.discoveryTimeout=timeout??40000;this.writeTimeout=timeout??45000;this.clients=new Set();}
 async available(){try{return (await fs.stat(this.bridge)).isFile();}catch{return false;}}
 close(){for(const client of this.clients)if(!client.writing)client.stop();}
 async call(name,args){
  if(![READ,SET].includes(name))throw new NvidiaAppError('This NVIDIA operation is not supported.','unsupported_operation');
  if(!await this.available())throw new NvidiaAppError('Install or update NVIDIA App to use its game presets.','app_missing');
  const deadline=Date.now()+(name===SET?this.writeTimeout:args.game?this.timeout:this.discoveryTimeout);
  const child=this.spawnProcess(this.bridge,[],{windowsHide:true,stdio:['pipe','pipe','pipe']}),pending=new Map(),decoder=new StringDecoder('utf8');let sequence=0,buffer='',bytes=0,finished=false;
  const rejectAll=error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();};
  const client={writing:false,stop:()=>{if(finished)return;finished=true;rejectAll(new NvidiaAppError('NVIDIA App connection closed.','connection_closed'));child.stdin.end();child.kill();this.clients.delete(client);}};this.clients.add(client);
  child.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes>8*1024*1024){rejectAll(new NvidiaAppError('NVIDIA App returned too much data.','response_limit'));client.stop();return;}buffer+=decoder.write(chunk);let i;while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+1);let message;try{message=JSON.parse(line);}catch{continue;}const p=pending.get(message.id);if(!p)continue;pending.delete(message.id);clearTimeout(p.timer);if(message.error)p.reject(new NvidiaAppError(String(message.error.message||'NVIDIA App request failed.').slice(0,1200),message.error.code));else p.resolve(message.result);}});
  child.stderr.resume();child.on('error',()=>rejectAll(new NvidiaAppError('Could not connect to NVIDIA App.','connection_failed')));child.stdin.on('error',()=>rejectAll(new NvidiaAppError('NVIDIA App connection closed.','connection_closed')));child.on('exit',()=>rejectAll(new NvidiaAppError('NVIDIA App is unavailable. Check that its local access is enabled in NVIDIA App Settings.','service_unavailable')));
  const request=(method,params)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new NvidiaAppError(name===SET&&client.writing?'NVIDIA did not confirm this change. Check NVIDIA App before retrying.':'NVIDIA App took too long to respond. Try again, or open NVIDIA App to check its local access settings.',name===SET&&client.writing?'change_unconfirmed':'timeout'));},Math.max(1,deadline-Date.now()));pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
  try{
   await request('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'Orbit',version:'0.2.8'}});child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
   const result=await request('tools/list',{}),tool=result?.tools?.find(t=>t.name===name);
   if(!tool||name===READ&&tool.annotations?.readOnlyHint!==true)throw new NvidiaAppError('This NVIDIA App version does not expose the required game operation.','tool_unavailable');
   if(args.preset&&!tool.inputSchema?.properties?.preset?.enum?.includes(args.preset))throw new NvidiaAppError('NVIDIA App does not support this preset.','preset_unavailable');
   client.writing=name===SET;return payload(await request('tools/call',{name,arguments:args}));
  }finally{client.writing=false;client.stop();}
 }
}
module.exports={NvidiaApp,NvidiaAppError,READ,SET,payload};
