const {builtinEntries,modTools,minecraftApps}=require('./mod-tools.cjs');
const { installationProgress } = require('./library-monitor.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const { pathToFileURL } = require('node:url');
const { parseVdf } = require('./library.cjs');
const { readCatalogs, shortcutGames } = require('./catalogs.cjs');
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function list(p) { try { return await fs.readdir(p); } catch (e) { if (e.code === 'ENOENT' || e.code === 'ENOTDIR') return []; throw e; } }
async function json(p, fallback = null) { try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; } }
async function registry() {
  if (process.platform !== 'win32') return { steam: '', games: [] };
  const script = `$ErrorActionPreference='SilentlyContinue'; $s=(Get-ItemProperty 'HKCU:\\Software\\Valve\\Steam').SteamPath; $roots=@('HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'); $g=@(Get-ItemProperty $roots | Where-Object { $_.DisplayName -and ($_.DisplayName -match '^r2modman|^CurseForge' -or $_.Publisher -match 'GOG.com|Ubisoft|Electronic Arts|Blizzard' -or $_.PSChildName -match '^GOG|^Uplay Install') } | Select-Object DisplayName,InstallLocation,DisplayIcon,Publisher,PSChildName); $a=@(Get-StartApps | Where-Object { $_.Name -match '^Minecraft( Launcher| for Windows)?$' } | Select-Object Name,AppID); @{steam=$s;games=$g;apps=$a} | ConvertTo-Json -Depth 4 -Compress`;
  const { stdout } = await execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new(); ' + script], { windowsHide: true, timeout: 20000, maxBuffer: 4e6, encoding: 'utf8' });
  return JSON.parse(stdout.replace(/^\uFEFF/, '').trim() || '{}');
}
async function steamGames(root, warnings) {
  if (!root || !await exists(root)) return [];
  const libraries = new Set([root]);
  try {
    const config = parseVdf(await fs.readFile(path.join(root, 'steamapps/libraryfolders.vdf'), 'utf8')).libraryfolders || {};
    for (const [key, item] of Object.entries(config)) {
      if (/^\d+$/.test(key)) libraries.add(typeof item === 'string' ? item : item.path);
    }
  } catch (e) { if (e.code !== 'ENOENT') warnings.push(`Steam library folders: ${e.message}`); }
  const records = [];
  for (const library of libraries) {
    if (!library) continue;
    const folder = path.join(library, 'steamapps');
    if (!await exists(folder)) { warnings.push(`Steam drive unavailable: ${library}`); continue; }
    for (const name of await list(folder)) {
      if (!/^appmanifest_\d+\.acf$/.test(name)) continue;
      try {
        const app = parseVdf(await fs.readFile(path.join(folder, name), 'utf8')).AppState;
        if (!app?.appid || !app.name || app.appid === '228980') continue;
        const location = path.join(folder, 'common', app.installdir || '');
        const installed = Boolean((Number(app.StateFlags) & 4) && app.installdir && await exists(location));
        const art = path.join(root, 'appcache/librarycache', app.appid);
        const coverFile = path.join(art, 'library_600x900.jpg');
        const heroFile = path.join(art, 'library_hero.jpg');
        records.push({ id: `steam:${app.appid}`, appId: app.appid, title: app.name, source: 'Steam', installed,
          location, manifestFile: path.join(folder,name), installationProgress: installationProgress(app), origin: 'scan', lastPlayed: Number(app.LastPlayed || 0) * 1000, sizeBytes: Number(app.SizeOnDisk || 0),
          launch: `steam://rungameid/${app.appid}`, installUrl: `steam://install/${app.appid}`,
          cover: await exists(coverFile) ? pathToFileURL(coverFile).href : `https://cdn.akamai.steamstatic.com/steam/apps/${app.appid}/library_600x900.jpg`,
          hero: await exists(heroFile) ? pathToFileURL(heroFile).href : `https://cdn.akamai.steamstatic.com/steam/apps/${app.appid}/library_hero.jpg` });
      } catch (e) { warnings.push(`Steam ${name}: ${e.message}`); }
    }
  }
  return records;
}
async function epicGames(warnings, base = path.join(process.env.ProgramData || 'C:/ProgramData', 'Epic/EpicGamesLauncher/Data/Manifests')) {
  const result = [];
  for (const name of await list(base)) {
    if (!name.endsWith('.item')) continue;
    try {
      const g = await json(path.join(base, name));
      if (!g?.DisplayName || !g.AppName || (g.MainGameAppName && g.MainGameAppName !== g.AppName)) continue;
      const launchFile=String(g.LaunchExecutable||'').trim().replace(/^"|"$/g,'');
      const executable=g.InstallLocation&&launchFile?await require('./launch-routing.cjs').registeredTarget(g.InstallLocation,path.resolve(g.InstallLocation,launchFile)):null;
      const target = [g.CatalogNamespace, g.CatalogItemId, g.AppName].filter(Boolean).join(':');
      result.push({ id: `epic:${g.AppName}`, appId: g.AppName, title: g.DisplayName, source: 'Epic Games',
        origin: 'scan', installationProgress: g.bIsIncompleteInstall ? {phase:'Installing in Epic Games',percent:null} : null, installed: Boolean(!g.bIsIncompleteInstall && executable), gameExecutables:!g.bIsIncompleteInstall&&executable?[executable]:[], location: g.InstallLocation, sizeBytes:Number(g.InstallSize)||0,
        launch: `com.epicgames.launcher://apps/${encodeURIComponent(target)}?action=launch&silent=true`,
        installUrl: 'com.epicgames.launcher://library' });
    } catch (e) { warnings.push(`Epic ${name}: ${e.message}`); }
  }
  return result;
}
async function legendaryGames(warnings) {
  // Read catalog metadata only, never the authentication/session file.
  const roots = [path.join(os.homedir(), '.config/legendary'), path.join(process.env.APPDATA || os.homedir(), 'heroic/legendaryConfig/legendary')];
  const records = [];
  for (const root of roots) {
    const installed = await json(path.join(root, 'installed.json'), {});
    for (const name of await list(path.join(root, 'metadata'))) {
      if (!name.endsWith('.json')) continue;
      try {
        const g = await json(path.join(root, 'metadata', name));
        if (!g?.app_name || !g.app_title || g.metadata?.mainGameItem) continue;
        const local = installed[g.app_name];
        const images = g.metadata?.keyImages || [];
        const cover = images.find(x => /DieselGameBoxTall|OfferImageTall/i.test(x.type))?.url;
        const target = [g.metadata?.namespace, g.metadata?.id, g.app_name].filter(Boolean).join(':');
        records.push({ id: `epic:${g.app_name}`, appId: g.app_name, title: g.app_title, source: 'Epic Games',
          origin: 'catalog', installed: false, location: local?.install_path, cover: cover?.startsWith('https://') ? cover : undefined,
          launch: `com.epicgames.launcher://apps/${encodeURIComponent(target)}?action=launch&silent=true`, installUrl: 'com.epicgames.launcher://library' });
      } catch (e) { warnings.push(`Epic catalog ${name}: ${e.message}`); }
    }
  }
  return records;
}
async function registeredGames(games) {
  const records = [];
  for (const g of games || []) {
    if (!g.InstallLocation || !await exists(g.InstallLocation) || /launcher|connect|galaxy|redistributable|anti.?cheat|battle\.net|EA app/i.test(g.DisplayName)) continue;
    const source = /GOG/i.test(g.Publisher || g.PSChildName) ? 'GOG' : /Ubisoft/i.test(g.Publisher) ? 'Ubisoft Connect' : /Blizzard/i.test(g.Publisher) ? 'Battle.net' : 'EA';
    let executable = String(g.DisplayIcon || '').replace(/,\s*-?\d+$/, '').replace(/^"|"$/g, '');
    if (!/\.exe$/i.test(executable) || !await exists(executable)) executable = undefined;
    const ubisoftId = /^Uplay Install (\d+)$/.exec(g.PSChildName)?.[1];
    // DisplayIcon is not reliably a game's executable. Only protocol-backed games get one-click launch.
    records.push({ id: `registry:${source}:${g.PSChildName}`, title: g.DisplayName, source, installed: true, origin: 'scan', location: g.InstallLocation, sizeBytes:Number(g.InstallSize)||0,
      executable:!ubisoftId?await require('./launch-routing.cjs').registeredTarget(g.InstallLocation,g.DisplayIcon):undefined,launch: ubisoftId ? `uplay://launch/${ubisoftId}/0` : undefined,
      installUrl: source === 'GOG' ? 'https://www.gog.com/account' : source === 'EA' ? 'https://www.ea.com/ea-app' : source === 'Battle.net' ? 'https://battle.net/download' : 'https://ubisoftconnect.com/' });
  }
  return records;
}
async function discover() {
  const warnings = [];
  const shortcuts=shortcutGames().then(records=>({records}),error=>({error}));
  let reg;
  try { reg = await registry(); } catch (e) { warnings.push(`Windows registry: ${e.message}`); reg = {}; }
  const steam = reg.steam || path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Steam');
  const catalogsTask=readCatalogs(steam,shortcuts);
  const toolsTask=modTools(reg.games);
  const results = await Promise.allSettled([steamGames(steam, warnings), epicGames(warnings), legendaryGames(warnings), registeredGames(reg.games)]);
  const records = results.flatMap((r, i) => { if (r.status === 'fulfilled') return r.value; warnings.push(`${['Steam', 'Epic Games', 'Epic catalog', 'Other stores'][i]}: ${r.reason.message}`); return []; });
  const catalogs = await catalogsTask;
  const tools=await toolsTask;
  return { records: [...records, ...catalogs.records,...tools,...minecraftApps(reg.apps),...builtinEntries()], artwork: catalogs.artwork, statuses: catalogs.statuses,
    steamRoot: steam, warnings: [...warnings, ...catalogs.warnings], scannedAt: Date.now() };
}
module.exports = { discover, steamGames, epicGames, exists, json };
