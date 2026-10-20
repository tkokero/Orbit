const {findProcesses,candidatesFor,matchesProcess}=require('./playtime.cjs');
const {spawn}=require('node:child_process');
class RunningGames{
 constructor({games,emit,find=findProcesses,clock=Date.now}){Object.assign(this,{games,emit,find,clock});this.sessions=new Map();this.busy=false;this.stopped=false;}
 async scan(){if(this.busy||this.stopped)return this.snapshot();this.busy=true;try{
  const candidates=this.games().filter(g=>g.kind==='game'&&g.installed&&!g.robloxPlaceId).map(game=>({game,candidates:candidatesFor(game)}));
  const rows=await this.find([...new Set(candidates.flatMap(c=>c.candidates.names))]);
  const live=new Map();for(const {game,candidates:expected}of candidates){const p=rows.find(row=>matchesProcess(row,expected));if(!p)continue;const previous=this.sessions.get(game.id);live.set(game.id,{id:game.id,title:game.title,pid:p.pid,name:p.name,path:p.path,started:p.started,since:previous?.pid===p.pid&&previous?.started===p.started?previous.since:Math.min(this.clock(),Date.parse(p.started)||this.clock())});}
  if(!this.stopped){this.sessions=live;this.emit(this.snapshot());}return this.snapshot();
 }finally{this.busy=false;}}
 snapshot(){return [...this.sessions.values()].map(({path,started,name,...s})=>({...s,seconds:Math.max(0,(this.clock()-s.since)/1000)}));}
 stop(){this.stopped=true;this.sessions.clear();}
 async focus(id){const s=this.sessions.get(id);if(!s)throw Error('This game is no longer running.');const rows=await this.find([s.name+'.exe']);if(!rows.some(r=>r.pid===s.pid&&r.started===s.started))throw Error('The game process has ended.');return focusProcess(s.pid);}
}
function focusProcess(pid){if(!Number.isSafeInteger(pid)||pid<=0)throw Error('Invalid process.');return new Promise((resolve,reject)=>{
 const script=`$ErrorActionPreference='Stop'; $targetId=[int]([Console]::In.ReadToEnd()); Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class OrbitFocus { [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h,int n); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); }'; $p=Get-Process -Id $targetId; $h=$p.MainWindowHandle; if($h -eq 0){throw 'No game window is available.'}; [OrbitFocus]::ShowWindowAsync($h,9)|Out-Null; if(-not [OrbitFocus]::SetForegroundWindow($h)){throw 'Windows did not allow focus. Use Alt+Tab to return to the game.'}`;
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,shell:false,stdio:['pipe','ignore','pipe']});let error='';const timer=setTimeout(()=>{child.kill();reject(Error('Could not focus the game.'));},8000);child.stderr.on('data',b=>error+=b);child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',code=>{clearTimeout(timer);code?reject(Error(error.slice(0,400)||'Could not focus the game.')):resolve(true);});child.stdin.on('error',()=>{});child.stdin.end(String(pid));
 });}
module.exports={RunningGames};
