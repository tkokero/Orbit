const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('./image-engine.cjs');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { readSteamMetadata } = require('./catalogs.cjs');
const { normalizeTitle } = require('./library.cjs');
const exists = async p => { try { await fs.access(p); return true; } catch { return false; } };
const isHttps = s => typeof s === 'string' && s.startsWith('https://');
function steamArt(id, info, key) {
  const entry = info?.library_assets_full?.[key];
  const relative = entry?.image?.english || Object.values(entry?.image || {})[0];
  return relative ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/${relative}` : undefined;
}
async function prepareArtwork(records, steamRoot, epicArtwork = []) {
  let metadata = new Map();
  try { metadata = await readSteamMetadata(steamRoot); } catch {}
  const byTitle = new Map([...metadata].map(([id, info]) => [normalizeTitle(info.name), { id, info }]));
  const epic = new Map(epicArtwork.map(a => [normalizeTitle(a.title), a]));
  return Promise.all(records.map(async record => {
    const explicitId = record.source === 'Steam' ? record.appId : record.equivalentSteamId;
    const match = explicitId ? { id: explicitId, info: metadata.get(explicitId) } : byTitle.get(normalizeTitle(record.title));
    const art = epic.get(normalizeTitle(record.title));
    const candidates = [];
    if (record.cover?.startsWith('file:') && await exists(fileURLToPath(record.cover))) candidates.push(record.cover);
    if (match?.id) {
      const remote = steamArt(match.id, match.info, 'library_capsule');
      const relativeName = remote && new URL(remote).pathname.split(`/apps/${match.id}/`)[1];
      for (const file of [relativeName, 'library_600x900.jpg', 'library_capsule.jpg'].filter(Boolean)) {
        const local = path.join(steamRoot, 'appcache/librarycache', match.id, file);
        if (await exists(local)) candidates.push(pathToFileURL(local).href);
      }
      candidates.push(remote);
    }
    candidates.push(art?.cover, record.cover);
    if (match?.id) {
      const base = `https://cdn.akamai.steamstatic.com/steam/apps/${match.id}/`;
      candidates.push(base + 'library_600x900.jpg');
      const header = match.info?.header_image?.english;
      if (header) candidates.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match.id}/${header}`);
      candidates.push(base + 'header.jpg');
    }
    const heroes = [];
    if (match?.id) {
      const remote = steamArt(match.id, match.info, 'library_hero');
      const relative = remote && new URL(remote).pathname.split(`/apps/${match.id}/`)[1];
      for (const name of [relative, 'library_hero.jpg'].filter(Boolean)) {
        const local = path.join(steamRoot, 'appcache/librarycache', match.id, name);
        if (await exists(local)) heroes.push(pathToFileURL(local).href);
      }
      heroes.push(remote);
    }
    heroes.push(record.hero, art?.hero);
    const root = record.location ? path.resolve(record.location) : null;
    const gameExecutables = root ? (match?.info?.launchExecutables || []).filter(e => /\.exe$/i.test(e))
      .map(e => path.resolve(root, e)).filter(e => e.toLowerCase().startsWith(root.toLowerCase() + path.sep)) : [];
    return { ...record, appType: record.appType || match?.info?.type, gameExecutables: record.gameExecutables || gameExecutables,
      coverCandidates: [...new Set(candidates.filter(x => typeof x === 'string' && /^(file:|https:)/.test(x)))],
      heroCandidates: [...new Set(heroes.filter(x => typeof x === 'string' && /^(file:|https:)/.test(x)))] };
  }));
}
const {ImageQueue,imageBytes}=require('./image-queue.cjs');
const imageJobs=new ImageQueue(2);
function downloadImage(url,folder,options={}){
 const key=JSON.stringify([url,path.resolve(folder),options.kind||'cover',Boolean(options.force),Boolean(options.offline)]);
 return imageJobs.run(key,()=>decodeImage(url,folder,options));
}
async function decodeImage(url, folder, { kind = 'cover', force = false, offline = false } = {}) {
  if (typeof url !== 'string' || !/^(file:|https:)/.test(url)) return null;
  try {
    const local = url.startsWith('file:') ? fileURLToPath(url) : null;
    if (local && !force && path.dirname(local) === path.resolve(folder) && local.endsWith(`-${kind}.webp`)) return url;
    const stat = local ? await fs.stat(local) : null;
    if(stat?.size>15e6)return null;
    const key = `${url}:${stat?.mtimeMs || ''}:${stat?.size || ''}:${kind}:v3`;
    const target = path.join(folder, crypto.createHash('sha256').update(key).digest('hex').slice(0, 28) + `-${kind}.webp`);
    if (!force && await exists(target)) return pathToFileURL(target).href;
    let bytes;
    if (local) bytes = await fs.readFile(local);
    else {
      if(offline)return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/') || Number(response.headers.get('content-length')) > 15e6) {await response.body?.cancel();return null;}
      bytes = await imageBytes(response);
    }
    if (!bytes.length || bytes.length > 15e6) return null;
    const size = kind === 'hero' ? { width: 1200, height: 450 } : kind === 'article' ? { width: 1400, height: 8000 } : kind === 'news' ? { width: 640, height: 360 } : kind === 'icon' ? { width: 64, height: 64 } : { width: 320, height: 480 };
    const output = await sharp(bytes, { limitInputPixels: 40e6, failOn: 'error' }).rotate()
      .resize({ ...size, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#12171e' }).webp({ quality: 80, effort: 3 }).toBuffer();
    const temp = target + '.' + crypto.randomUUID() + '.tmp';
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(temp, output); await fs.rename(temp, target);
    return pathToFileURL(target).href;
  } catch { return null; }
}
const officialSites = { VALORANT: 'https://playvalorant.com/en-us/', Roblox: 'https://www.roblox.com/' };
async function officialImage(title) {
  if (!officialSites[title]) return null;
  try {
    const html = await (await fetch(officialSites[title], { signal: AbortSignal.timeout(12000) })).text();
    for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
      if (!/(?:property|name)=["']og:image["']/i.test(match[0])) continue;
      const image = /content=["']([^"']+)["']/i.exec(match[0])?.[1]?.replace(/&amp;/g, '&');
      if (isHttps(image)) return image;
    }
  } catch {}
  return null;
}
async function searchSteamCover(title, folder) {
  try {
    const url = new URL('https://store.steampowered.com/api/storesearch/');
    url.search = new URLSearchParams({ term: title.replace(/[™®©]/g, ''), l: 'english', cc: 'US' });
    const data = await (await fetch(url, { signal: AbortSignal.timeout(9000) })).json();
    const match = data.items?.find(item => normalizeTitle(item.name) === normalizeTitle(title));
    if (!match?.id) return null;
    for (const candidate of [`https://cdn.akamai.steamstatic.com/steam/apps/${match.id}/library_600x900.jpg`, match.tiny_image]) {
      if (candidate) { const cover = await downloadImage(candidate, folder); if (cover) return cover; }
    }
  } catch {}
  return null;
}
async function cacheCovers(records, folder, onProgress = () => {}, force = false) {
  await fs.mkdir(folder, { recursive: true });
  const failureFile=path.join(folder,'missing-covers.json');let failures={};
  if(!force)try{failures=JSON.parse(await fs.readFile(failureFile,'utf8'));if(!failures||typeof failures!=='object'||Array.isArray(failures))failures={};}catch{}
  const now=Date.now(),retryAfter=10*60*1000;
  const grouped = new Map();
  for (const g of records) { const key = normalizeTitle(g.title); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(g); }
  const groups = [...grouped.values()]; let index = 0, finished = 0;
  const missing = [];
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (index < groups.length) {
      const versions = groups[index++]; const candidates = [...new Set(versions.flatMap(v => v.coverCandidates || [v.cover]).filter(Boolean))]
        .sort((a,b) => Number(b.startsWith('file:')) - Number(a.startsWith('file:')));
      const failureKey=crypto.createHash('sha256').update(JSON.stringify([normalizeTitle(versions[0].title),candidates])).digest('hex');
      const skipRemote=!force&&Number.isFinite(failures[failureKey])&&now-failures[failureKey]>=0&&now-failures[failureKey]<retryAfter;
      let cover;
      for (const candidate of candidates.filter(c=>!skipRemote||c.startsWith('file:'))) { cover = await downloadImage(candidate, folder, { force }); if (cover) break; }
      if (!cover&&!skipRemote) { const official = await officialImage(versions[0].title); if (official) cover = await downloadImage(official, folder); }
      if (!cover&&!skipRemote) cover = await searchSteamCover(versions[0].title, folder);
      if (cover) {delete failures[failureKey];versions.forEach(v => { v.cover = cover; });}
      else { versions.forEach(v => { v.cover = undefined; }); missing.push(versions[0].title);if(!skipRemote)failures[failureKey]=Date.now(); }
      onProgress(++finished, groups.length);
    }
  }));
  const recent=Object.fromEntries(Object.entries(failures).filter(([,time])=>Number.isFinite(time)&&Date.now()-time<retryAfter).slice(-2048));
  const temp=failureFile+'.'+crypto.randomUUID()+'.tmp';try{await fs.writeFile(temp,JSON.stringify(recent));await fs.rename(temp,failureFile);}catch{await fs.unlink(temp).catch(()=>{});}
  return { total: groups.length, available: groups.length - missing.length, missing };
}
async function cacheHero(game, folder, force = false) {
  const candidates = [...new Set(game.versions.flatMap(v => v.heroCandidates || [v.hero]).filter(Boolean))];
  for (const candidate of candidates) {
    const hero = await downloadImage(candidate, folder, { kind: 'hero', force });
    if (hero) return hero;
  }
  return null;
}
module.exports = { steamArt, prepareArtwork, cacheCovers, cacheHero, downloadImage };
