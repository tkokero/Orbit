const { discover } = require('../src/discovery.cjs');
const { mergeLibrary } = require('../src/library.cjs');
discover().then(result => {
  const games = mergeLibrary(result.records);
  console.log(JSON.stringify({ total: games.length, installed: games.filter(g => g.installed).length,
    sources: [...new Set(games.flatMap(g => g.sources))], duplicatesCollapsed: result.records.length - games.length,
    warnings: result.warnings, games: games.map(g => ({ title: g.title, installed: g.installed, sources: g.sources })) }, null, 2));
}).catch(e => { console.error(e); process.exitCode = 1; });
