const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');

const LAUNCHERS = /^(minecraftlauncher|curseforge|r2modman|overwolflauncher|overwolf|prismlauncher|modrinthapp|steam|steamwebhelper|epicgameslauncher|launcher|gryphlink|riotclientservices|riotclientux|ubisoftconnect|upc|battle\.net|eadesktop|ealauncher|gamelauncher|launch|unins\d*|uninstall|setup|update|updater|crashreportclient|easyanticheat(?:_eos)?|unitycrashhandler\d*|eaanticheat\.gameservicelauncher|start_protected_game|eac_launcher)\.exe$/i;
const KNOWN = [
  [/^VRChat$/i,['VRChat.exe']],
  [/^Apex Legends(?:[™®])?$/i,['r5apex.exe','r5apex_dx12.exe']],
  [/^Minecraft for Windows$/i,['Minecraft.Windows.exe']],
  [/arknights.*endfield/i, ['Endfield.exe']], [/^valorant$/i, ['VALORANT-Win64-Shipping.exe']],
  [/^roblox$/i, ['RobloxPlayerBeta.exe', 'RobloxPlayer.exe']], [/genshin impact/i, ['GenshinImpact.exe']],
  [/^fortnite$/i, ['FortniteClient-Win64-Shipping.exe']], [/^fall guys$/i, ['FallGuys_client_game.exe', 'FallGuys_client.exe']],
  [/farming simulator 22/i, ['FarmingSimulator2022Game.exe', 'FarmingSimulator2022.exe']],
  [/^fallout 3/i, ['Fallout3.exe']], [/assassin.*syndicate/i, ['ACS.exe']], [/^uno$/i, ['UNO.exe']],
  [/^roller champions/i, ['RollerChampions.exe']], [/^brawlhalla$/i, ['Brawlhalla.exe']]
];
const key = p => String(p || '').replaceAll('/', '\\').toLowerCase();
function safeGameExe(p) { return typeof p === 'string' && /\.exe$/i.test(p) && !LAUNCHERS.test(path.win32.basename(p)); }
function nativePlaytime(game) { return Boolean(game.storePlaytimeKnown ?? game.playtimeKnown); }
function candidatesFor(game, config = {}) {
  const executables = [...new Set([...(config.executables || []), ...game.versions.flatMap(v => [
    ...(v.gameExecutables || []), v.executable, v.launcherAvailable ? v.launcherExecutable : null
  ])].filter(p => p && path.win32.isAbsolute(p) && safeGameExe(p)))];
  const knownNames=KNOWN.find(([pattern])=>pattern.test(game.title))?.[1]||[];
  // Linking a protected game must retain its canonical-name fallback when Windows hides its path.
  // An explicit choice still limits detection to that executable, rather than every known variant.
  const trustedNames=config.executables?.length?knownNames.filter(n=>config.executables.some(p=>path.win32.basename(p).toLowerCase()===n.toLowerCase())):knownNames;
  const names = [...new Set([...trustedNames,
    ...executables.map(p => path.win32.basename(p))].filter(safeGameExe))];
  return { executables, names, trustedNames };
}
function matchesProcess(process, candidates) {
  if (!candidates.names.some(n => n.toLowerCase() === (process.name + '.exe').toLowerCase())) return false;
  const namedFallback = candidates.names.some(n => !candidates.executables.some(p => path.win32.basename(p).toLowerCase() === n.toLowerCase()) && n.toLowerCase() === (process.name + '.exe').toLowerCase());
  return namedFallback || (!process.path&&candidates.trustedNames?.some(n=>n.toLowerCase()===(process.name+'.exe').toLowerCase())) || Boolean(process.path && candidates.executables.some(p => key(p) === key(process.path)));
}

class PlaytimeLedger {
  constructor(totals = {}, clock = () => performance.now()) { this.totals = { ...totals }; this.sessions = new Map(); this.clock = clock; this.suspended = false; }
  start(id, info = {}) {
    if (this.sessions.has(id)) return false;
    this.totals[id] ||= { seconds: 0, since: Date.now() };
    this.totals[id].lastPlayed = Date.now();
    this.sessions.set(id, { ...info, tick: this.clock() }); return true;
  }
  advance(id) {
    const session = this.sessions.get(id); if (!session) return;
    const now = this.clock();
    if (!this.suspended) this.totals[id].seconds += Math.max(0, Math.min(45, (now - session.tick) / 1000));
    session.tick = now;
  }
  total(id) {
    const session = this.sessions.get(id);
    return (this.totals[id]?.seconds || 0) + (session && !this.suspended ? Math.max(0, Math.min(45, (this.clock() - session.tick) / 1000)) : 0);
  }
  stop(id) { this.advance(id); return this.sessions.delete(id); }
  suspend() { for (const id of this.sessions.keys()) this.advance(id); this.suspended = true; }
  resume() { for (const session of this.sessions.values()) session.tick = this.clock(); this.suspended = false; }
}

function findProcesses(names) {
  if (!names.length || process.platform !== 'win32') return Promise.resolve([]);
  const requested = [...new Set(names.map(n => n.replace(/\.exe$/i, '')))];
  return new Promise((resolve, reject) => {
    // Names travel through stdin as JSON, never as executable shell text.
    const script = require('./windows-process.cjs').processScript;
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    let output = '', error = '', settled = false;
    const finish = (err, data) => { if (settled) return; settled = true; clearTimeout(timer); err ? reject(err) : resolve(data); };
    const timer = setTimeout(() => { child.kill(); finish(new Error('Game process lookup timed out.')); }, 7000);
    child.on('error', e => finish(e)); child.stdout.on('data', b => { output += b.toString(); if (output.length > 1e6) { child.kill(); finish(new Error('Game process response too large.')); } });
    child.stderr.on('data', b => { error += b.toString(); });
    child.on('close', code => { if (code) return finish(new Error(error || 'Game process lookup failed.')); try { finish(null, JSON.parse(output.trim() || '[]')); } catch { finish(new Error('Invalid game process response.')); } });
    child.stdin.on('error', () => {}); child.stdin.end(JSON.stringify(requested));
  });
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch(e) { return e.code==='EPERM'; } }

class PlaytimeTracker {
  constructor(file, onUpdate = () => {}, options = {}) {
    this.file = file; this.onUpdate = onUpdate; this.ledger = new PlaytimeLedger(); this.configs = {}; this.pending = new Map();this.suppressed=new Map();this.lastDetected=new Map();
    this.find = options.find || findProcesses; this.isAlive = options.isAlive || alive;this.enabled=options.enabled||(()=>true);
    this.saving = Promise.resolve(); this.stopped = false; this.lookupBusy = false; this.lastSaved = 0; this.resumeSessions = [];
  }
  async load({updated=false}={}) {
    try {
      const data = JSON.parse(await fs.readFile(this.file, 'utf8'));
      for (const [id, total] of Object.entries(data.totals || {})) if (Number.isFinite(total.seconds) && total.seconds >= 0) this.ledger.totals[id] = { seconds: total.seconds, since: total.since || Date.now(), lastPlayed: total.lastPlayed || 0 };
      for (const [id, config] of Object.entries(data.configs || {})) this.configs[id] = { executables: (config.executables || []).filter(p => path.win32.isAbsolute(p) && safeGameExe(p)) };
      const age=Date.now()-data.updateRestartAt;
      this.resumeSessions = updated&&Number.isFinite(data.updateRestartAt)&&age>=0&&age<=15*60*1000&&Array.isArray(data.sessions)?data.sessions.filter(s=>s&&s.mode==='manual'&&typeof s.id==='string'&&this.ledger.totals[s.id]):[];
    } catch (e) { if (e.code !== 'ENOENT') await fs.copyFile(this.file, this.file + '.backup-' + Date.now()).catch(() => {}); }
  }
  decorate(game) {
    const known = Boolean(game.playtimeKnown), total = this.ledger.total(game.id), session = this.ledger.sessions.get(game.id);
    const tracking = { state: session ? (this.ledger.suspended ? 'paused' : 'running') : this.pending.has(game.id) ? 'waiting' : 'idle',
      mode: session?.mode, seconds: total, since: this.ledger.totals[game.id]?.since, configured: Boolean(this.configs[game.id]?.executables?.length) };
    return { ...game, storePlaytimeKnown: known, tracking,
      ...(!known && this.ledger.totals[game.id] ? { playtime: total / 60, playtimeKnown: true, playtimeRecent: null, statsSource: 'Orbit (local)', localPlaytime: true, lastPlayed: Math.max(game.lastPlayed || 0, this.ledger.totals[game.id].lastPlayed || 0) } : {}) };
  }
  save() {
    const payload = JSON.stringify({ version: 1, totals: this.ledger.totals, configs: this.configs,
      sessions: [...this.ledger.sessions].map(([id, s]) => ({ id, mode: s.mode, pid: s.pid, path: s.path, started: s.started,detected:s.detected })), savedAt: Date.now(),...(this.updateRestartAt?{updateRestartAt:this.updateRestartAt}:{}) });
    this.lastSaved = Date.now();
    this.saving = this.saving.catch(() => {}).then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true }); await fs.writeFile(this.file + '.tmp', payload); await fs.rename(this.file + '.tmp', this.file);
    }); return this.saving;
  }
  emit() {
    const ids = new Set([...Object.keys(this.ledger.totals), ...this.pending.keys()]);
    this.onUpdate([...ids].map(id => ({ id, seconds: this.ledger.total(id), since: this.ledger.totals[id]?.since,
      state: this.ledger.sessions.has(id) ? (this.ledger.suspended ? 'paused' : 'running') : this.pending.has(id) ? 'waiting' : 'idle', mode: this.ledger.sessions.get(id)?.mode })));
  }
  ensureTimer() {
    if(this.stopped){clearInterval(this.timer);this.timer=null;return;}
    if (!this.timer && (this.pending.size || this.ledger.sessions.size)) this.timer = setInterval(() => this.tick().catch(() => {}), 5000);
    if (this.timer && !this.pending.size && !this.ledger.sessions.size) { clearInterval(this.timer); this.timer = null; }
  }
  async start(game, info) {
    if (this.stopped || !this.enabled() || nativePlaytime(game) || game.kind !== 'game') return false;
    this.pending.delete(game.id);
    if (this.ledger.start(game.id, info)) { await this.save(); this.emit(); this.ensureTimer(); }
    return true;
  }
  async manual(game) { this.suppressed.delete(game.id);return this.start(game, { mode: 'manual' }); }
  async stop(id,{suppress=false}={}) { if(suppress)this.suppressed.set(id,this.lastDetected.get(id)||this.ledger.sessions.get(id)||true);this.pending.delete(id); this.ledger.stop(id); await this.save(); this.emit(); this.ensureTimer(); }
  async configure(game, executable) {
    if (!path.win32.isAbsolute(executable) || !safeGameExe(executable)) throw new Error('Choose the game executable, not its store launcher.');
    this.configs[game.id] = { executables: [executable] }; await this.save();
    return this.watch(game);
  }
  async watch(game) {
    this.suppressed.delete(game.id);
    if (this.stopped || nativePlaytime(game) || game.kind !== 'game' || this.ledger.sessions.has(game.id)) return;
    const candidates = candidatesFor(game, this.configs[game.id]);
    if (!candidates.names.length) { this.emit(); return; }
    this.pending.set(game.id, { game, candidates, deadline: Date.now() + 10 * 60 * 1000 });
    this.emit(); this.ensureTimer(); await this.lookup();
  }
  async lookup() {
    if (this.lookupBusy || this.stopped || this.ledger.suspended || !this.pending.size) return;
    this.lookupBusy = true;
    try {
      const rows = await this.find([...new Set([...this.pending.values()].flatMap(p => p.candidates.names))]);
      if (this.stopped) return;
      for (const [id, pending] of this.pending) {
        const found = rows.find(p => matchesProcess(p, pending.candidates));
        if (found) await this.start(pending.game, { mode: 'automatic', pid: found.pid, path: found.path, started: found.started });
        else if (Date.now() > pending.deadline) { this.pending.delete(id); this.emit(); }
      }
    } finally { this.lookupBusy = false; this.ensureTimer(); }
  }
  observeRunning(games,detected){this.observing=(this.observing||Promise.resolve()).catch(()=>{}).then(()=>this.applyDetected(games,detected));return this.observing;}
  async applyDetected(games,detected){
    if(this.stopped||!this.enabled()||this.ledger.suspended)return;
    const byId=new Map(games.map(g=>[g.id,g])),live=new Map(detected.map(s=>[s.id,s]));this.lastDetected=live;for(const id of this.suppressed.keys())if(!live.has(id))this.suppressed.delete(id);
    for(const [id,session]of [...this.ledger.sessions])if(session.mode==='automatic'&&session.detected&&!live.has(id))await this.stop(id);
    for(const row of detected){const blocked=this.suppressed.get(row.id);if(blocked){if(blocked===true||blocked.pid==null){this.suppressed.set(row.id,row);continue;}if(blocked.pid===row.pid&&blocked.started===row.started)continue;this.suppressed.delete(row.id);}const game=byId.get(row.id);if(!game||nativePlaytime(game)||game.kind!=='game')continue;const session=this.ledger.sessions.get(row.id);if(session?.mode==='manual')continue;
      if(session&&(session.pid!==row.pid||session.started!==row.started))await this.stop(row.id);
      const current=this.ledger.sessions.get(row.id);if(current){current.detected=true;continue;}
      await this.start(game,{mode:'automatic',detected:true,pid:row.pid,path:row.path,started:row.started});
    }
  }
  async discoverRunning(games) {
    const eligible = games.filter(g => g.kind === 'game' && !nativePlaytime(g));
    const candidates = eligible.map(game => ({ game, candidates: candidatesFor(game, this.configs[game.id]) }));
    const names = [...new Set(candidates.flatMap(c => c.candidates.names))];
    if (!names.length) return;
    try {
      const rows = await this.find(names);
      for (const { game, candidates: expected } of candidates) {
        const found = rows.find(p => matchesProcess(p, expected));
        if (found) await this.start(game, { mode: 'automatic', pid: found.pid, path: found.path, started: found.started });
      }
    } catch {} finally { this.resumeSessions = []; }
  }
  async tick() {
    if (this.stopped) return;
    let changed = false;
    for (const [id, s] of this.ledger.sessions) {
      this.ledger.advance(id);
      if (s.mode === 'automatic' && !this.isAlive(s.pid)) { this.ledger.stop(id); changed = true; }
    }
    if (changed || this.ledger.sessions.size && Date.now() - this.lastSaved >= 30000) { await this.save(); this.emit(); }
    await this.lookup(); this.ensureTimer();
  }
  async suspend() { this.ledger.suspend(); await this.save(); this.emit(); }
  resume() { this.ledger.resume(); this.emit(); }
  async checkpoint(){await this.observing;for(const id of this.ledger.sessions.keys())this.ledger.advance(id);await this.save();}
  async resumeAfterUpdate(games,{final=false}={}){
    if(!this.resumeSessions.length)return;
    const byId=new Map(games.map(game=>[game.id,game])),pending=this.resumeSessions;this.resumeSessions=[];
    for(const row of pending){const game=byId.get(row.id);if(game)await this.manual(game);else if(!final)this.resumeSessions.push(row);}
  }
  async shutdown({restart=false}={}) {
    this.stopped = true; clearInterval(this.timer); this.timer = null; this.pending.clear();
    await this.observing?.catch(()=>{});
    for (const [id,session] of [...this.ledger.sessions]) {if(restart&&session.mode==='manual')this.ledger.advance(id);else this.ledger.stop(id);}
    this.updateRestartAt=restart?Date.now():null;
    await this.save();
  }
}
module.exports = { PlaytimeLedger, PlaytimeTracker, candidatesFor, matchesProcess, safeGameExe, nativePlaytime, findProcesses };
