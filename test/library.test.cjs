const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { normalizeTitle, parseVdf, mergeLibrary, actionFor, safeUrl, importRecords } = require('../src/library.cjs');
const { steamGames, epicGames } = require('../src/discovery.cjs');
test('duplicates merge across stores and installed wins over preferred uninstalled store', () => {
  const records = [{ id: 'steam:1', title: 'Control®', source: 'Steam', installed: false }, { id: 'epic:control', title: 'Control', source: 'Epic Games', installed: true }];
  const first = mergeLibrary(records)[0];
  const games = mergeLibrary(records, { [first.id]: { preferred: 'steam:1' } });
  assert.equal(games.length, 1); assert.equal(games[0].selected, 'epic:control'); assert.deepEqual(games[0].sources, ['Epic Games', 'Steam']);
});
test('remasters, editions, sequels, demos, and non-Latin titles stay distinct', () => {
  const titles = ['Control', 'Control Ultimate Edition', 'Control 2', 'Control Demo', 'Control Remastered', '游戏一', '游戏二'];
  assert.equal(mergeLibrary(titles.map((title, i) => ({ id: String(i + 1), title, source: 'Steam' }))).length, titles.length);
  assert.equal(normalizeTitle('Hot Dogs, Horseshoes & Hand Grenades'), normalizeTitle('HOT DOGS: HORSESHOES AND HAND GRENADES™'));
});
test('same store ID and repeated drives collapse to one copy without losing installed status', () => {
  for (const records of [[false, true], [true, false]]) {
    const game = mergeLibrary(records.map(installed => ({ id: 'steam:123', title: 'Game', source: 'Steam', installed })))[0];
    assert.equal(game.versions.length, 1); assert.equal(game.installed, true);
  }
});
test('preference breaks installed ties and keeps stable identity', () => {
  const records = ['Steam', 'Epic Games'].map(source => ({ id: source, title: 'Game', source, installed: true }));
  const first = mergeLibrary(records)[0];
  const updated = mergeLibrary(records.reverse(), { [first.id]: { preferred: 'Epic Games', favorite: true } })[0];
  assert.equal(updated.id, first.id); assert.equal(updated.selected, 'Epic Games'); assert.equal(updated.favorite, true);
});
test('VDF nested data and escaped paths parse without prototype mutation', () => {
  const parsed = parseVdf('"libraryfolders" { "0" { "path" "D:\\\\SteamLibrary" "apps" { "123" "45" } } "__proto__" "x" }');
  assert.equal(parsed.libraryfolders['0'].path, 'D:\\SteamLibrary'); assert.equal(parsed.libraryfolders['0'].apps['123'], '45');
  assert.equal(Object.getPrototypeOf(parsed), null);
});
test('imports validate and cannot claim an installed game or executable', () => {
  const row = importRecords([{ title: 'Portal 2', source: 'Steam', appId: 620, installed: true, executable: 'C:/bad.exe' }])[0];
  assert.equal(row.id, 'steam:620'); assert.equal(row.installed, false); assert.equal(row.executable, undefined);
  assert.equal(actionFor(row).value, 'steam://install/620');
  assert.throws(() => importRecords([{ title: 'X', source: 'Steam', appId: 'bad' }]));
  assert.throws(() => importRecords([{ title: 'X', launchUrl: 'file:///C:/bad.exe' }]));
  assert.throws(() => importRecords({}));
});
test('launch actions use correct installed or uninstalled route and reject dangerous protocols', () => {
  assert.deepEqual(actionFor({ installed: true, launch: 'steam://rungameid/620', installUrl: 'steam://install/620' }), { type: 'url', value: 'steam://rungameid/620' });
  for (const link of ['javascript:alert(1)', 'file:///C:/bad.exe', 'powershell:run', 'steam://uninstall/620', 'steam://exit', 'https://user:pass@example.com']) assert.throws(() => safeUrl(link));
  assert.throws(() => actionFor({ installed: true, executable: 'missing.exe' }));
});
test('Steam scans secondary libraries and requires fully installed state plus existing folder', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'orbit-steam-')); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const second = path.join(root, 'secondary');
  await fs.mkdir(path.join(root, 'steamapps'), { recursive: true }); await fs.mkdir(path.join(second, 'steamapps/common/Game'), { recursive: true });
  await fs.writeFile(path.join(root, 'steamapps/libraryfolders.vdf'), `"libraryfolders" { "0" { "path" "${second.replaceAll('\\', '\\\\')}" } }`);
  await fs.writeFile(path.join(second, 'steamapps/appmanifest_123.acf'), '"AppState" { "appid" "123" "name" "Game" "installdir" "Game" "StateFlags" "4" }');
  await fs.writeFile(path.join(second, 'steamapps/appmanifest_456.acf'), '"AppState" { "appid" "456" "name" "Download" "installdir" "Game" "StateFlags" "1024" }');
  const rows = await steamGames(root, []); assert.equal(rows.length, 2); assert.equal(rows.find(r => r.appId === '123').installed, true); assert.equal(rows.find(r => r.appId === '456').installed, false);
  await fs.rm(path.join(second, 'steamapps/common/Game'), { recursive: true }); assert.equal((await steamGames(root, [])).some(g => g.installed), false);
});
test('Epic validates the executable, excludes DLC, and ignores incomplete installations', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'orbit-epic-')); t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, 'game.exe'), 'fixture');
  for (const [i, extra] of [{}, { bIsIncompleteInstall: true }, { MainGameAppName: 'base' }].entries()) {
    await fs.writeFile(path.join(root, `${i}.item`), JSON.stringify({ DisplayName: `Game ${i}`, AppName: `app${i}`, InstallLocation: root, LaunchExecutable: 'game.exe', CatalogNamespace: 'namespace', CatalogItemId: 'item', ...extra }));
  }
  const rows = await epicGames([], root); assert.equal(rows.length, 2); assert.equal(rows[0].installed, true); assert.equal(rows[1].installed, false);
  assert.match(rows[0].launch, /namespace%3Aitem%3Aapp0/);
});
