const {toolName}=require('./mod-tools.cjs');
const { riotLaunch } = require('./game-launch.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const YAML = require('yaml');
const { parseVdf } = require('./library.cjs');
const exists = async p => { try { await fs.access(p); return true; } catch { return false; } };
const names = async p => { try { return await fs.readdir(p); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } };

// Steam appinfo versions 39–41; skip hashes and access tokens, retaining only app metadata.
function parseAppInfo(buffer) {
  const version = buffer.readUInt32LE(0) & 255;
  if ((buffer.readUInt32LE(0) >>> 8) !== 0x075644 || version < 39 || version > 41) throw new Error('Unsupported Steam appinfo version.');
  let pos = 8, strings;
  function need(n) { if (pos + n > buffer.length) throw new Error('Truncated Steam metadata.'); }
  function u32() { need(4); const n = buffer.readUInt32LE(pos); pos += 4; return n; }
  function str() { const end = buffer.indexOf(0, pos); if (end < 0) throw new Error('Unterminated Steam string.'); const s = buffer.toString('utf8', pos, end); pos = end + 1; return s; }
  if (version >= 41) {
    need(8); const offset = Number(buffer.readBigUInt64LE(pos)); pos += 8; const resume = pos; pos = offset;
    const count = u32(); if (count > 1000000) throw new Error('Invalid Steam string table.');
    strings = Array.from({ length: count }, str); pos = resume;
  }
  function object(depth = 0) {
    if (depth > 50) throw new Error('Steam metadata depth exceeded.');
    const out = Object.create(null);
    while (pos < buffer.length) {
      const type = buffer[pos++]; if (type === 8 || type === 11) return out;
      const key = strings ? strings[u32()] : str();
      if (key === undefined) throw new Error('Invalid Steam string reference.');
      if (type === 0) out[key] = object(depth + 1);
      else if (type === 1) out[key] = str();
      else if (type === 2 || type === 3 || type === 4 || type === 6) { need(4); out[key] = buffer.readUInt32LE(pos); pos += 4; }
      else if (type === 7 || type === 10) { need(8); pos += 8; }
      else throw new Error(`Unsupported Steam metadata type ${type}.`);
    }
    throw new Error('Truncated Steam object.');
  }
  const apps = new Map();
  while (pos + 4 <= buffer.length) {
    const id = u32(); if (!id) break;
    const size = u32(), end = pos + size;
    if (end > buffer.length || size < 40) throw new Error('Invalid Steam metadata length.');
    pos += version >= 40 ? 60 : 40;
    const data = object(); const app = data.appinfo || data;
    if (app.common?.name) apps.set(String(id), { ...app.common,
      launchExecutables: Object.values(app.config?.launch || {}).filter(l => l?.executable && (!l.config?.oslist || /windows/i.test(l.config.oslist))).map(l => l.executable) });
    pos = end;
  }
  return apps;
}
let metadataCache;
async function readSteamMetadata(root){
 const filename=path.join(root,'appcache/appinfo.vdf'),stat=await fs.stat(filename),key=`${filename}:${stat.size}:${stat.mtimeMs}`;
 if(metadataCache?.key!==key){const pending=fs.readFile(filename).then(parseAppInfo);metadataCache={key,pending};pending.catch(()=>{if(metadataCache?.pending===pending)metadataCache=null;});}
 return metadataCache.pending;
}
async function steamCatalog(root) {
  const loginPath = path.join(root, 'config/loginusers.vdf');
  if (!await exists(loginPath)) return { records: [], status: 'No local account found' };
  const users = parseVdf(await fs.readFile(loginPath, 'utf8')).users || {};
  const user = Object.entries(users).sort((a, b) => Number(b[1].timestamp || b[1].Timestamp || 0) - Number(a[1].timestamp || a[1].Timestamp || 0))[0];
  if (!user) return { records: [], status: 'No local account found' };
  const accountId = String(BigInt(user[0]) - 76561197960265728n);
  const local = parseVdf(await fs.readFile(path.join(root, 'userdata', accountId, 'config/localconfig.vdf'), 'utf8')).UserLocalConfigStore;
  const steam = local?.Software?.valve?.Steam || local?.Software?.Valve?.Steam;
  const history = steam?.apps || {};
  const metadata = await readSteamMetadata(root);
  const records = [];
  // History is useful offline, but isn't a current ownership assertion (refunds/shared games exist).
  for (const [id, activity] of Object.entries(history)) {
    const info = metadata.get(id); if (!info || !/^(game|application|demo|mod)$/i.test(info.type || '')) continue;
    if (!Number(activity.Playtime || activity.playtime || 0) && !Number(activity.LastPlayed || activity.lastplayed || 0)) continue;
    const art = path.join(root, 'appcache/librarycache', id, 'library_600x900.jpg');
    let details = {}, updatedAt;
    const cacheFile = path.join(root, 'userdata', accountId, 'config/librarycache', `${id}.json`);
    if (await exists(cacheFile)) {
      try { const rows = JSON.parse(await fs.readFile(cacheFile, 'utf8')); details = steamDetails(rows); updatedAt = (await fs.stat(cacheFile)).mtimeMs; } catch {}
    }
    records.push({ id: `steam:${id}`, appId: id, title: info.name, appType: info.type, source: 'Steam', installed: false, origin: 'local-history',
      catalogNote: 'Steam local play history. Current ownership is not verified; shared, refunded, and removed games can remain here.',
      playtime: Number(activity.Playtime || activity.playtime || 0), playtimeKnown: true,
      playtimeRecent: activity.Playtime2w != null ? Number(activity.Playtime2w) : null,
      statsSource: 'Steam local account cache', statsUpdatedAt: updatedAt, ...details,
      lastPlayed: Number(activity.LastPlayed || activity.lastplayed || 0) * 1000,
      launch: `steam://rungameid/${id}`, installUrl: `steam://install/${id}`,
      cover: await exists(art) ? pathToFileURL(art).href : `https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_600x900.jpg`,
      hero: `https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_hero.jpg` });
  }
  return { records, steamId: user[0], status: `${records.length} local history entries · account sign-in needed for complete ownership sync` };
}
function steamDetails(rows) {
  const sections = Object.fromEntries(rows.filter(x => Array.isArray(x) && x.length === 2));
  const data = sections.achievements?.data;
  const description = sections.descriptions?.data?.strSnippet;
  let achievements = null;
  if (data && Number.isInteger(data.nTotal) && Number.isInteger(data.nAchieved)) {
    const list = new Map();
    for (const a of [...(data.vecHighlight || []), ...(data.vecUnachieved || []), ...(data.vecAchievedHidden || [])]) {
      if (!a.strID) continue;
      const previous = list.get(a.strID);
      if (previous?.unlocked && !a.bAchieved) continue;
      list.set(a.strID, { id: a.strID, name: a.strName || (a.bHidden ? 'Hidden achievement' : a.strID),
        description: a.strDescription || '', unlocked: Boolean(a.bAchieved), unlockedAt: Number(a.rtUnlocked || 0) * 1000,
        image: a.strImage?.startsWith('https://') ? a.strImage : undefined,
        rarity: Number.isFinite(a.flAchieved) ? a.flAchieved : null,
        current: Number.isFinite(a.flCurrentProgress) ? a.flCurrentProgress : null, maximum: Number.isFinite(a.flMaxProgress) ? a.flMaxProgress : null });
    }
    achievements = { total: data.nTotal, unlocked: data.nAchieved, items: [...list.values()].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.unlockedAt - a.unlockedAt), partial: list.size < data.nTotal };
  }
  return { achievements, description };
}
function epicCatalogRecords(catalog, ownedIdentifiers) {
  return catalog.filter(g => g.title && g.releaseInfo?.length && !g.mainGameItem?.id
    && g.categories?.some(c => c.path === 'games') && ownedIdentifiers.has(g.id)).flatMap(g => {
    const release = g.releaseInfo.find(r => r.platform?.includes('Windows')) || g.releaseInfo[0];
    if (!release?.appId) return [];
    const images = g.keyImages || [];
    const cover = images.find(i => /DieselGameBoxTall|OfferImageTall/i.test(i.type))?.url || images[0]?.url;
    const hero = images.find(i => /DieselGameBox$|OfferImageWide/i.test(i.type))?.url;
    return [{ id: `epic:${release.appId}`, appId: release.appId, title: g.title.replace(/\?$/, ''), source: 'Epic Games', installed: false,
      origin: 'offline-entitlement', catalogNote: 'Epic offline account catalog. Sign in to refresh the complete online library.', cover, hero,
      launch: `com.epicgames.launcher://apps/${encodeURIComponent(`${g.namespace}:${g.id}:${release.appId}`)}?action=launch&silent=true`,
      installUrl: 'com.epicgames.launcher://store/library' }];
  });
}
async function epicCatalog() {
  const file = path.join(process.env.ProgramData || 'C:/ProgramData', 'Epic/EpicGamesLauncher/Data/Catalog/catcache.bin');
  if (!await exists(file)) return { records: [], artwork: [], status: 'No local Epic catalog found' };
  const content = await fs.readFile(file, 'utf8');
  const catalog = JSON.parse(content.trim().startsWith('[') ? content : Buffer.from(content.trim(), 'base64').toString('utf8'));
  if (!Array.isArray(catalog)) throw new Error('Unrecognized Epic catalog format.');
  const accountFolder = path.join(process.env.LOCALAPPDATA, 'EpicGamesLauncher/Saved/Data');
  const owned = new Set();
  for (const name of await names(accountFolder)) {
    if (!/^OC_[a-f0-9]+\.dat$/i.test(name)) continue;
    const data = await fs.readFile(path.join(accountFolder, name));
    for (const game of catalog) if (game.id && data.includes(Buffer.from(game.id))) owned.add(game.id);
  }
  const records = epicCatalogRecords(catalog, owned);
  // Catalog-only entries supply artwork; they are never added as owned games.
  const artwork = catalog.filter(g => g.title).map(g => ({ title: g.title.replace(/\?$/, ''),
    cover: g.keyImages?.find(i => /DieselGameBoxTall|OfferImageTall/i.test(i.type))?.url || g.keyImages?.[0]?.url,
    hero: g.keyImages?.find(i => /DieselGameBox$|OfferImageWide/i.test(i.type))?.url }));
  return { records, artwork, status: `${records.length} offline account entries · sign-in needed for complete online sync` };
}
function protoFields(buffer) {
  let pos = 0; const fields = [];
  function varint() { let n = 0, shift = 0; while (pos < buffer.length && shift < 53) { const b = buffer[pos++]; n += (b & 127) * 2 ** shift; if (!(b & 128)) return n; shift += 7; } throw new Error('Malformed cache varint.'); }
  while (pos < buffer.length) {
    const tag = varint(), wire = tag & 7, number = Math.floor(tag / 8); let value;
    if (wire === 0) value = varint();
    else if (wire === 2) { const length = varint(); if (pos + length > buffer.length) throw new Error('Truncated cache record.'); value = buffer.subarray(pos, pos + length); pos += length; }
    else if (wire === 1 || wire === 5) { const length = wire === 1 ? 8 : 4; if (pos + length > buffer.length) throw new Error('Truncated cache field.'); pos += length; continue; }
    else throw new Error('Unsupported cache format.');
    fields.push({ number, value });
  }
  return fields;
}
async function ubisoftCatalog() {
  const file = path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Ubisoft/Ubisoft Game Launcher/cache/configuration/configurations');
  if (!await exists(file)) return { records: [], status: 'No cached Ubisoft library' };
  const records = [];
  for (const item of protoFields(await fs.readFile(file)).filter(f => f.number === 1 && Buffer.isBuffer(f.value))) {
    const fields = protoFields(item.value), id = fields.find(f => f.number === 1)?.value, yaml = fields.find(f => f.number === 3)?.value;
    if (!id || !Buffer.isBuffer(yaml)) continue;
    const data = YAML.parse(yaml.toString('utf8')), root = data?.root, loc = data?.localizations?.default || {};
    if (!root?.name || !root.start_game || root.is_ulc === 'yes') continue;
    const resolve = value => loc[value] || value;
    const art = value => value ? 'https://ubistatic3-a.akamaihd.net/orbit/uplay_launcher_3_0/assets/' + resolve(value) : undefined;
    records.push({ id: `ubisoft:${id}`, appId: String(id), equivalentSteamId: String(root.start_game?.steam?.steam_app_id || ''), title: resolve(root.name), source: 'Ubisoft Connect', origin: 'local-catalog', installed: false,
      catalogNote: 'Ubisoft local library cache. Availability is checked by Ubisoft Connect when opened.',
      cover: art(root.thumb_image || root.icon_image), hero: art(root.background_image), launch: `uplay://launch/${id}/0`, installUrl: `uplay://install/${id}` });
  }
  return { records, status: `${records.length} cached library entries · refresh in Ubisoft Connect` };
}
async function shortcutGames() {
  if (process.platform !== 'win32') return [];
  const script = `[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new(); $s=New-Object -ComObject WScript.Shell; $dirs=@("$env:ProgramData\\Microsoft\\Windows\\Start Menu\\Programs","$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs","$env:USERPROFILE\\Desktop","$env:PUBLIC\\Desktop"); $r=@(Get-ChildItem $dirs -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.BaseName -match 'Endfield|Arknights|VALORANT|League of Legends|Genshin|Star Rail|Zenless|Minecraft|Roblox Player|^Roblox$|Wuthering|Tower of Fantasy|Honkai|Warframe|Path of Exile|r2modman|CurseForge|Prism Launcher|Modrinth App' -and $_.BaseName -notmatch 'Uninstall|Studio' } | ForEach-Object { $l=$s.CreateShortcut($_.FullName); [pscustomobject]@{title=$_.BaseName;shortcut=$_.FullName;target=$l.TargetPath;workingDirectory=$l.WorkingDirectory;arguments=$l.Arguments;icon=$l.IconLocation} }); ConvertTo-Json -InputObject $r -Compress`;
  const { stdout } = await execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, timeout: 25000, maxBuffer: 4e6 });
  const entries = JSON.parse(stdout.trim() || '[]'), records = [];
  for (const g of entries) {
    if (!g.target || !/\.exe$/i.test(g.target) || !await exists(g.target)) continue;
    const tool=toolName(g.title)||(/^Minecraft Launcher$/i.test(g.title)||/MinecraftLauncher\.exe$/i.test(g.target)?'Minecraft Launcher':null);
    const title = tool || (/^Minecraft(?: Launcher)?$/i.test(g.title)?'Minecraft':null) || (/endfield/i.test(g.title) ? 'Arknights: Endfield' : /^Roblox/i.test(g.title) ? 'Roblox' : g.title);
    const source = /GRYPH/i.test(g.target) ? 'GRYPHLINK' : /Riot/i.test(g.target) ? 'Riot Games' : /minecraft/i.test(g.title) ? 'Minecraft' : /roblox/i.test(g.title) ? 'Roblox' : /genshin|honkai|star rail|zenless/i.test(g.title) ? 'HoYoPlay' : 'Standalone';
    const gameExecutable=require('./playtime.cjs').safeGameExe(g.target)&&!/launcher|hoyoplay|gryphlink|riotclient|eadesktop|galaxyclient|ubisoftconnect/i.test(path.basename(g.target));
    // A client shortcut is not an installation or entitlement; a real game executable is an installed copy.
    records.push({ id: `shortcut:${source}:${title}`, title, source, origin: 'shortcut', installed: Boolean(tool||gameExecutable),executable:gameExecutable?g.target:undefined,kind:tool?'tool':undefined, launcherAvailable: true,
      shortcutGameTarget:gameExecutable||/--launch-product=|--launch-game(?:=|\s)|--game(?:-id)?(?:=|\s)|-applaunch\s/i.test(g.arguments||''),shortcut: g.shortcut, launcherExecutable: g.target, location: path.dirname(g.target), iconFile: g.icon?.replace(/,\s*-?\d+$/, ''),
      catalogNote: 'Game-specific shortcut detected. Opens the original launcher, which checks installation and updates.',
      ...await riotLaunch(title,g.target,path.join(process.env.ProgramData || 'C:/ProgramData','Riot Games/RiotClientInstalls.json')) });
  }
  return records;
}
async function readCatalogs(steamRoot,shortcuts) {
  const statuses = [], warnings = [], records = [], artwork = [];
  const readers = [['Steam', () => steamCatalog(steamRoot)], ['Epic Games', epicCatalog], ['Ubisoft Connect', ubisoftCatalog], ['Standalone launchers', async () => {const found=shortcuts?await shortcuts:{records:await shortcutGames()};if(found.error)throw found.error;return {records:found.records,status:'Game-specific launcher shortcuts detected'}; }]];
  const results=await Promise.allSettled(readers.map(([,read])=>read()));
  for (let i=0;i<readers.length;i++) {
    const [source]=readers[i],entry=results[i];
    try { if(entry.status==='rejected')throw entry.reason;const result = entry.value; records.push(...result.records); artwork.push(...(result.artwork || [])); statuses.push({ source, status: result.status, count: result.records.length }); }
    catch (e) { statuses.push({ source, status: `Could not read local catalog: ${e.message}`, count: 0 }); warnings.push(`${source} catalog: ${e.message}`); }
  }
  return { records, artwork, statuses, warnings };
}
module.exports = { readSteamMetadata, parseAppInfo, steamDetails, steamCatalog, epicCatalogRecords, epicCatalog, protoFields, ubisoftCatalog, shortcutGames, readCatalogs };
