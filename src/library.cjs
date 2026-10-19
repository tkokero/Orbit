const {windowsGameAction}=require('./mod-tools.cjs');
const { checkedDirectLaunch } = require('./game-launch.cjs');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const STORES = ['Steam', 'Epic Games', 'GOG', 'Ubisoft Connect', 'EA', 'Battle.net', 'Xbox', 'GRYPHLINK', 'Riot Games', 'HoYoPlay', 'Roblox', 'Minecraft', 'Standalone', 'Other'];
function classify(record) {
  if (record.kind === 'game' || record.kind === 'tool') return record.kind;
  if (/^(application|tool|software)$/i.test(record.appType || '')) return 'tool';
  return /^(r2modman|CurseForge|Prism Launcher|Modrinth App|SteamVR|Blender|DisplayFusion|Wallpaper Engine|Soundpad(?: Demo)?|Driver4VR|OVR (?:Toolkit|Advanced Settings)|OyasumiVR|Standable(?::.*)?|Space Calibrator|OpenVR.*|fpsVR|XSOverlay|TurnSignal|Desktop\+|LIV)$/i.test(record.title.trim()) ? 'tool' : 'game';
}
function normalizeTitle(title) {
  // Preserve edition names and sequel numbers: a remaster is not the original.
  return String(title).replace(/[™®©]/g, '').normalize('NFKC').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function parseVdf(text) {
  const tokens = [...text.matchAll(/"((?:\\.|[^"\\])*)"|([{}])|([^\s{}"]+)/g)]
    .map(m => m[1] !== undefined ? m[1].replace(/\\([\\"])/g, '$1') : m[2] || m[3]);
  let i = 0;
  function object(depth = 0) {
    if (depth > 40) throw new Error('VDF is nested too deeply.');
    const result = Object.create(null);
    while (i < tokens.length) {
      const key = tokens[i++];
      if (key === '}') break;
      const value = tokens[i++];
      if (value === undefined) break;
      result[key] = value === '{' ? object(depth + 1) : value;
    }
    return result;
  }
  return object();
}
function mergeLibrary(records, preferences = {}) {
  const steamTitles = new Map();
  for (const record of [...records].sort((a, b) => Number(a.installed) - Number(b.installed))) {
    if (record.source === 'Steam' && record.appId) steamTitles.set(record.appId, record.title);
  }
  const groups = new Map();
  for (const original of records) {
    const referenceId = original.equivalentSteamId || (original.source === 'Steam' && original.appId);
    const record = referenceId && steamTitles.has(referenceId) ? { ...original, title: steamTitles.get(referenceId) } : original;
    if (!record.title || !record.id) continue;
    const key = record.source==='Roblox'&&/^\d{1,20}$/.test(record.robloxPlaceId||'')?'roblox:experience:'+record.robloxPlaceId:normalizeTitle(record.title);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    const versions = groups.get(key);
    const same = versions.findIndex(r => r.id === record.id);
    if (same < 0) versions.push({ ...record });
    else {
      const previous = versions[same];
      const winner = record.installed && !previous.installed ? record : previous;
      const newestStats = (record.statsUpdatedAt || 0) > (previous.statsUpdatedAt || 0) ? record
        : (record.statsUpdatedAt || 0) < (previous.statsUpdatedAt || 0) ? previous
        : (record.achievements?.items?.length || 0) > (previous.achievements?.items?.length || 0) ? record : previous;
      versions[same] = { ...record, ...previous, ...winner, cover: winner.cover || previous.cover || record.cover,
        playtime: Math.max(record.playtime || 0, previous.playtime || 0),
        playtimeKnown: Boolean(record.playtimeKnown || previous.playtimeKnown),
        lastPlayed: Math.max(record.lastPlayed || 0, previous.lastPlayed || 0),
        achievements: newestStats.achievements || previous.achievements || record.achievements };
    }
  }
  return [...groups].map(([key, versions]) => {
    const id = crypto.createHash('sha256').update(key).digest('hex').slice(0, 20);
    const pref = preferences[id] || {};
    versions.sort((a, b) => Number(b.installed) - Number(a.installed)
      || Number(Boolean(b.launcherAvailable)) - Number(Boolean(a.launcherAvailable))
      || Number(b.id === pref.preferred) - Number(a.id === pref.preferred)
      || Number(Boolean(b.launch || b.executable)) - Number(Boolean(a.launch || a.executable))
      || STORES.indexOf(a.source) - STORES.indexOf(b.source));
    const chosen = versions[0];
    const statsVersion = versions.find(v => v.playtimeKnown || v.achievements);
    return { id, robloxPlaceId:chosen.robloxPlaceId, title: chosen.title, kind: pref.kind || (versions.some(v => classify(v) === 'tool') ? 'tool' : 'game'), installed: Boolean(chosen.installed), launcherAvailable: Boolean(chosen.launcherAvailable), directLaunchAvailable: Boolean(chosen.directLaunchAvailable), installationProgress: versions.find(v=>v.installationProgress)?.installationProgress || null, selected: chosen.id,
      versions, sources: [...new Set(versions.map(v => v.source))], cover: versions.find(v => v.cover)?.cover,
      hero: versions.find(v => v.hero)?.hero, favorite: Boolean(pref.favorite), hidden: Boolean(pref.hidden),
      lastPlayed: Math.max(0, ...versions.map(v => v.lastPlayed || 0)), lastOpened: pref.lastOpened || pref.lastPlayed || 0,
      playtime: Math.max(0, ...versions.map(v => v.playtime || 0)), playtimeKnown: Boolean(statsVersion?.playtimeKnown),
      playtimeRecent: statsVersion?.playtimeRecent ?? null, statsSource: statsVersion?.source,
      achievements: statsVersion?.achievements || null, statsUpdatedAt: statsVersion?.statsUpdatedAt,
      sizeBytes: Math.max(0, ...versions.map(v => v.sizeBytes || 0)), description: versions.find(v => v.description)?.description };
  }).sort((a, b) => a.title.localeCompare(b.title));
}
function safeUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Invalid link.');
  const url = new URL(value);
  if (!['steam:', 'com.epicgames.launcher:', 'goggalaxy:', 'uplay:', 'origin2:', 'battlenet:', 'https:'].includes(url.protocol))
    throw new Error('Use a supported store link or an HTTPS link.');
  if (url.username || url.password) throw new Error('Links cannot contain credentials.');
  // Steam also exposes destructive commands; accept launch/install/library only.
  if (url.protocol === 'steam:' && !/^(rungameid|install|nav|store)$/.test(url.hostname)) throw new Error('Unsupported Steam command.');
  return value;
}
function actionFor(version) {
  const windowsApp=windowsGameAction(version);if(windowsApp)return windowsApp;
  const direct=checkedDirectLaunch(version);if(direct)return direct;
  if (version.launcherAvailable && version.shortcut) {
    if (!path.isAbsolute(version.shortcut) || !/\.lnk$/i.test(version.shortcut) || !fs.existsSync(version.shortcut)) throw new Error('The original game shortcut is unavailable. Refresh the library.');
    return { type: 'shortcut', value: version.shortcut };
  }
  if (version.installed && version.launch) return { type: 'url', value: safeUrl(version.launch) };
  if (version.installed && version.executable) {
    if (!path.isAbsolute(version.executable) || !/\.exe$/i.test(version.executable) || !fs.existsSync(version.executable))
      throw new Error('The game executable is missing. Refresh your library or choose it again.');
    return { type: 'exe', value: version.executable };
  }
  if (version.installUrl) return { type: 'url', value: safeUrl(version.installUrl) };
  throw new Error('Add a launch or installation link in Sources, or open the game’s store client.');
}
function importRecords(data) {
  const rows = Array.isArray(data) ? data : data.games;
  if (!Array.isArray(rows) || rows.length > 20000) throw new Error('Expected a JSON array (maximum 20,000 games).');
  return rows.map((row, i) => {
    if (typeof row.title !== 'string' || !row.title.trim() || row.title.length > 300) throw new Error(`Game ${i + 1} needs a title.`);
    const source = STORES.includes(row.source) ? row.source : 'Other';
    const appId = String(row.appId || '').slice(0, 200);
    if (source === 'Steam' && !/^\d+$/.test(appId)) throw new Error(`Steam game “${row.title}” needs a numeric appId.`);
    const identity = appId || normalizeTitle(row.title);
    const id = source === 'Steam' ? `steam:${appId}` : source === 'Epic Games' && appId ? `epic:${appId}` : `import:${source}:${identity}`;
    return { id, title: row.title.trim(), source, appId, kind: ['game','tool'].includes(row.kind) ? row.kind : undefined, installed: false, origin: 'import',
      launch: source === 'Steam' ? `steam://rungameid/${appId}` : row.launchUrl ? safeUrl(row.launchUrl) : undefined,
      installUrl: source === 'Steam' ? `steam://install/${appId}` : row.installUrl ? safeUrl(row.installUrl) : undefined,
      cover: source === 'Steam' ? `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg` : undefined,
      hero: source === 'Steam' ? `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg` : undefined };
  });
}
module.exports = { STORES, classify, normalizeTitle, parseVdf, mergeLibrary, safeUrl, actionFor, importRecords };
