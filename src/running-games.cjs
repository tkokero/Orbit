const {findProcesses,candidatesFor,matchesProcess}=require('./playtime.cjs');
const {spawn}=require('node:child_process');
const activity=p=>['foreground','fullscreen','background','minimized','no-window'].includes(p.activity)?p.activity:'running';
const sameProcess=(a,b)=>a?.pid===b.pid&&(!a.started||!b.started||a.started===b.started);
class RunningGames{
 constructor({games,emit,find=findProcesses,clock=Date.now,configs=()=>({})}){Object.assign(this,{games,emit,find,clock,configs});this.sessions=new Map();this.lastRows=[];this.checkedAt=null;this.scanFailed=false;this.busy=false;this.stopped=false;}
 scan(){if(this.stopped)return Promise.resolve(this.snapshot());if(this.inflight)return this.inflight;this.inflight=this.scanNow().finally(()=>{this.inflight=null;});return this.inflight;}
 async scanNow(){if(this.stopped)return this.snapshot();this.busy=true;try{
  const candidates=this.games().filter(g=>g.kind==='game'&&g.installed&&!g.robloxPlaceId).map(game=>({game,candidates:candidatesFor(game,this.configs()[game.id])}));
  const rows=await this.find([...new Set(candidates.flatMap(c=>c.candidates.names))]);
  this.lastRows=rows;this.checkedAt=this.clock();this.scanFailed=false;
  const live=new Map(),claimed=new Set();for(const {game,candidates:expected}of candidates){const previous=this.sessions.get(game.id),p=rows.find(row=>!claimed.has(row.pid)&&sameProcess(previous,row)&&matchesProcess(row,expected))||rows.find(row=>!claimed.has(row.pid)&&matchesProcess(row,expected));if(!p)continue;claimed.add(p.pid);const same=sameProcess(previous,p);live.set(game.id,{id:game.id,title:game.title,pid:p.pid,name:p.name,path:p.path,started:p.started||(same?previous.started:null),activity:activity(p),since:same?previous.since:Math.min(this.clock(),Date.parse(p.started)||this.clock())});}

  if(!this.stopped){this.sessions=live;this.emit(this.snapshot());}return this.snapshot();
 }catch(error){this.scanFailed=true;throw error;}finally{this.busy=false;}}
 async diagnose(id){
  try{await this.scan();}catch{}const game=this.games().find(g=>g.id===id);if(!game)throw Error('Game not found.');
  const expected=candidatesFor(game,this.configs()[id]),names=new Set(expected.names.map(n=>n.toLowerCase()));
  const processes=this.lastRows.filter(p=>names.has((p.name+'.exe').toLowerCase())).map(p=>({pid:p.pid,name:p.name+'.exe',activity:activity(p),pathAvailable:Boolean(p.path),matched:matchesProcess(p,expected)}));
  const session=this.sessions.get(id);const supported=game.kind==='game'&&game.installed&&!game.robloxPlaceId;
  const status=this.scanFailed?'Scan unavailable':!supported?'Not monitored':session?'Running':!expected.names.length?'Executable needed':processes.length?'Different executable path':'Not detected';
  const note=this.scanFailed?'The latest scan failed. The results below are from the last successful scan. Try again; no sessions were ended by this failure.':!supported?'Automatic detection requires an installed game. Roblox experiences are tracked through the Roblox client.':session?'The game process is running. Switching windows or minimizing the game does not stop detection.':!expected.names.length?'Choose the actual game executable, rather than its launcher, to enable detection.':processes.length?'A process with the expected name was found, but its path could not be verified against this copy. Choose the actual game executable.':'No matching game process was found. If the game is open, choose its actual executable and check again.';
  return {id,title:game.title,status,note,checkedAt:this.checkedAt,stale:this.scanFailed,expectedNames:expected.names,processes};
 }
 snapshot(){return [...this.sessions.values()].map(({path,started,name,...s})=>({...s,processStarted:started,seconds:Math.max(0,(this.clock()-s.since)/1000)}));}
 stop(){this.stopped=true;this.sessions.clear();}
 async focus(id){const s=this.sessions.get(id);if(!s)throw Error('This game is no longer running.');const rows=await this.find([s.name+'.exe']);if(!rows.some(r=>sameProcess(s,r)&&matchesProcess(r,candidatesFor(this.games().find(g=>g.id===id)||{title:s.title,versions:[]},this.configs()[id]))))throw Error('The game process has ended.');return focusProcess(s.pid);}
}
function focusProcess(pid){if(!Number.isSafeInteger(pid)||pid<=0)throw Error('Invalid process.');return new Promise((resolve,reject)=>{
 const script=`$ErrorActionPreference='Stop'; $targetId=[int]([Console]::In.ReadToEnd()); Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class OrbitFocus { [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h,int n); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); }'; $p=Get-Process -Id $targetId; $h=$p.MainWindowHandle; if($h -eq 0){throw 'No game window is available.'}; [OrbitFocus]::ShowWindowAsync($h,9)|Out-Null; if(-not [OrbitFocus]::SetForegroundWindow($h)){throw 'Windows did not allow focus. Use Alt+Tab to return to the game.'}`;
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,shell:false,stdio:['pipe','ignore','pipe']});let error='';const timer=setTimeout(()=>{child.kill();reject(Error('Could not focus the game.'));},8000);child.stderr.on('data',b=>error+=b);child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',code=>{clearTimeout(timer);code?reject(Error(error.slice(0,400)||'Could not focus the game.')):resolve(true);});child.stdin.on('error',()=>{});child.stdin.end(String(pid));
 });}
module.exports={RunningGames};
