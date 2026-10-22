const fs = require('node:fs/promises');
const path = require('node:path');
const { parseAppInfo } = require('./catalogs.cjs');
const { importRecords } = require('./library.cjs');
let steamWindow, inflight;
async function steamWebLibrary(session, steamRoot) {
  const response = await session.fetch(`https://store.steampowered.com/dynamicstore/userdata/?l=english&t=${Date.now()}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Steam library request returned ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data.rgOwnedApps) || !data.rgOwnedApps.length) return null;
  let metadata = new Map();
  try { metadata = parseAppInfo(await fs.readFile(path.join(steamRoot, 'appcache/appinfo.vdf'))); } catch {}
  const rows = [], unresolved = []; let index = 0;
  const ids = data.rgOwnedApps.filter(id => Number.isInteger(id) && id > 0);
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (index < ids.length) {
      const id = ids[index++]; let info = metadata.get(String(id));
      if (!info) {
        try {
          const details = await (await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&l=english`, { signal: AbortSignal.timeout(10000) })).json();
          info = details[id]?.data;
        } catch {}
      }
      if (info?.type && !/^(game|application|demo|mod)$/i.test(info.type)) continue;
      if (!info?.name) { unresolved.push(id); continue; }
      rows.push({ title: info.name, source: 'Steam', appId: id });
    }
  }));
  const records = importRecords(rows).map(r => ({ ...r, origin: 'steam-account', catalogNote: 'Owned app returned by your signed-in Steam account.' }));
  return { records, unresolved };
}
async function connectSteam({ parent, steamRoot, interactive = false, persistent = true }) {
  const { BrowserWindow, session } = require('electron');
  const partition=persistent?'persist:orbit-steam-account':'orbit-steam-account-ephemeral';
  const accountSession = session.fromPartition(partition);
  // Only query an existing Orbit sign-in automatically. Never read another app's cookies.
  const cookies = await accountSession.cookies.get({ domain: '.steampowered.com', name: 'steamLoginSecure' });
  if (!interactive && !cookies.length) return null;
  if (inflight) return inflight;
  inflight = (async () => {
    try { const existing = await steamWebLibrary(accountSession, steamRoot); if (existing) return existing; } catch (error) { if (!interactive) throw new Error('Steam account sync failed. Sign in again in Sources & settings.'); }
    if (!interactive) return null;
    return new Promise((resolve, reject) => {
      steamWindow = new BrowserWindow({ parent, width: 1040, height: 800, title: 'Connect Steam to Orbit', autoHideMenuBar: true,
        webPreferences: { partition, nodeIntegration: false, contextIsolation: true, sandbox: true } });
      accountSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
      steamWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      steamWindow.webContents.on('will-navigate', (event, url) => {
        const host = new URL(url).hostname;
        if (!['steamcommunity.com', 'steampowered.com'].some(d => host === d || host.endsWith('.' + d))) event.preventDefault();
      });
      let done = false, checking = false;
      const check = async () => {
        if (checking || done) return; checking = true;
        try {
          const result = await steamWebLibrary(accountSession, steamRoot);
          if (result) { done = true; resolve(result); steamWindow?.close(); }
        } catch {} finally { checking = false; }
      };
      steamWindow.webContents.on('did-finish-load', check);
      steamWindow.on('closed', () => { steamWindow = null; if (!done) reject(new Error('Steam sign-in was closed before the library could be imported.')); });
      steamWindow.loadURL('https://store.steampowered.com/login/?redir=account%2F').catch(() => { if (!done) reject(new Error('Steam sign-in could not be opened.')); });
    });
  })();
  try { return await inflight; } finally { inflight = null; }
}
module.exports = { connectSteam, steamWebLibrary };
