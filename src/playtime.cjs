const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');

const LAUNCHERS = /^(minecraftlauncher|curseforge|r2modman|overwolflauncher|overwolf|prismlauncher|modrinthapp|steam|steamwebhelper|epicgameslauncher|launcher|gryphlink|riotclientservices|riotclientux|ubisoftconnect|upc|battle\.net|eadesktop|ealauncher|gamelauncher|launch|unins\d*|uninstall|setup|update|updater|crashreportclient|easyanticheat(?:_eos)?|unitycrashhandler\d*)\.exe$/i;
const KNOWN = [
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
  const names = [...new Set([...(config.executables?.length ? [] : KNOWN.find(([pattern]) => pattern.test(game.title))?.[1] || []),
    ...executables.map(p => path.win32.basename(p))].filter(safeGameExe))];
  return { executables, names };
}
function matchesProcess(process, candidates) {
  if (!candidates.names.some(n => n.toLowerCase() === (process.name + '.exe').toLowerCase())) return false;
  const namedFallback = candidates.names.some(n => !candidates.executables.some(p => path.win32.basename(p).toLowerCase() === n.toLowerCase()) && n.toLowerCase() === (process.name + '.exe').toLowerCase());
  return namedFallback || Boolean(process.path && candidates.executables.some(p => key(p) === key(process.path)));
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
    const script = `[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new(); $ErrorActionPreference='SilentlyContinue'; $names=ConvertFrom-Json -InputObject ([Console]::In.ReadToEnd()); $rows=@(Get-Process -Name $names -ErrorAction SilentlyContinue | ForEach-Object { [pscustomobject]@{pid=$_.Id;name=$_.ProcessName;path=$_.Path;started=$_.StartTime.ToUniversalTime().ToString('o')} }); ConvertTo-Json -InputObject $rows -Compress`;
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
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }

class PlaytimeTracker {
  constructor(file, onUpdate = () => {}, options = {}) {
    this.file = file; this.onUpdate = onUpdate; this.ledger = new PlaytimeLedger(); this.configs = {}; this.pending = new Map();
    this.find = options.find || findProcesses; this.isAlive = options.isAlive || alive;
    this.saving = Promise.resolve(); this.stopped = false; this.lookupBusy = false; this.lastSaved = 0; this.resumeSessions = [];
  }
  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.file, 'utf8'));
      for (const [id, total] of Object.entries(data.totals || {})) if (Number.isFinite(total.seconds) && total.seconds >= 0) this.ledger.totals[id] = { seconds: total.seconds, since: total.since || Date.now(), lastPlayed: total.lastPlayed || 0 };
      for (const [id, config] of Object.entries(data.configs || {})) this.configs[id] = { executables: (config.executables || []).filter(p => path.win32.isAbsolute(p) && safeGameExe(p)) };
      this.resumeSessions = Array.isArray(data.sessions) ? data.sessions.filter(s => s.mode === 'automatic') : [];
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
      sessions: [...this.ledger.sessions].map(([id, s]) => ({ id, mode: s.mode, pid: s.pid, path: s.path, started: s.started })), savedAt: Date.now() });
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
    if (!this.timer && (this.pending.size || this.ledger.sessions.size)) this.timer = setInterval(() => this.tick().catch(() => {}), 5000);
    if (this.timer && !this.pending.size && !this.ledger.sessions.size) { clearInterval(this.timer); this.timer = null; }
  }
  async start(game, info) {
    if (this.stopped || nativePlaytime(game) || game.kind !== 'game') return false;
    this.pending.delete(game.id);
    if (this.ledger.start(game.id, info)) { await this.save(); this.emit(); this.ensureTimer(); }
    return true;
  }
  async manual(game) { return this.start(game, { mode: 'manual' }); }
  async stop(id) { this.pending.delete(id); this.ledger.stop(id); await this.save(); this.emit(); this.ensureTimer(); }
  async configure(game, executable) {
    if (!path.win32.isAbsolute(executable) || !safeGameExe(executable)) throw new Error('Choose the game executable, not its store launcher.');
    this.configs[game.id] = { executables: [executable] }; await this.save();
    return this.watch(game);
  }
  async watch(game) {
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
  async shutdown() {
    this.stopped = true; clearInterval(this.timer); this.timer = null; this.pending.clear();
    for (const id of [...this.ledger.sessions.keys()]) this.ledger.stop(id);
    await this.save();
  }
}
module.exports = { PlaytimeLedger, PlaytimeTracker, candidatesFor, matchesProcess, safeGameExe, nativePlaytime, findProcesses };
