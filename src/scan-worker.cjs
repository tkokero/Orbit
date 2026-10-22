const { parentPort, workerData } = require('node:worker_threads');
const { discover, exists } = require('./discovery.cjs');
const { prepareArtwork, cacheCovers, cacheHero } = require('./artwork.cjs');
const {retainedRecords}=require('./mod-tools.cjs');
const { mergeLibrary } = require('./library.cjs');

(async () => {
  const started=performance.now(),timings={};
  const result = workerData.discovery || await discover();timings.discoveryMs=Math.round(performance.now()-started);
  const imported = await Promise.all(workerData.imports.map(async record => ({ ...record,
    installed: Boolean(record.executable && await exists(record.executable)) })));
  const remembered = retainedRecords(workerData.remembered).map(record => ({ ...record, installed: false, installationProgress: null, directLaunch: undefined, directLaunchAvailable: false, windowsAppId:undefined, launcherAvailable: false }));
  const raw=[...result.records,...imported,...remembered].filter(require('./ownership.cjs').allowed);
  const cached=new Map((workerData.cachedRecords||[]).map(r=>[r.id,r]));
  const records = workerData.offline?raw.map(r=>({...r,cover:cached.get(r.id)?.cover?.startsWith('file:')?cached.get(r.id).cover:r.cover?.startsWith('file:')?r.cover:undefined})):await prepareArtwork(raw, result.steamRoot, result.artwork);
  timings.prepareMs=Math.round(performance.now()-started)-timings.discoveryMs;
  const coverStatus = workerData.offline?{cached:true}:await cacheCovers(records, workerData.artworkFolder, () => {}, workerData.forceImages);
  const featured = mergeLibrary(records, workerData.preferences).filter(g => g.kind === 'game' && !g.hidden)
    .sort((a,b) => b.lastPlayed - a.lastPlayed)[0];
  const hero = featured && !workerData.offline ? await cacheHero(featured, workerData.artworkFolder, workerData.forceImages) : null;
  parentPort.postMessage({ ok: true, result: { records, coverStatus, featuredId: featured?.id, hero,
    timings:{...timings,totalMs:Math.round(performance.now()-started)},discovery:workerData.captureDiscovery?result:undefined, warnings: result.warnings, statuses: result.statuses, steamRoot: result.steamRoot, scannedAt: result.scannedAt } });
})().catch(error => parentPort.postMessage({ ok: false, error: error.message }));
