const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseAppInfo, protoFields, steamDetails, epicCatalogRecords } = require('../src/catalogs.cjs');
const { mergeLibrary, actionFor } = require('../src/library.cjs');
const { steamArt } = require('../src/artwork.cjs');

test('Steam binary metadata parses v41 string references and rejects corruption', () => {
  const u32 = x => { const b = Buffer.alloc(4); b.writeUInt32LE(x); return b; };
  const strings = ['appinfo', 'common', 'name', 'type'];
  const body = Buffer.concat([Buffer.from([0]), u32(0), Buffer.from([0]), u32(1), Buffer.from([1]), u32(2), Buffer.from('Test Game\0'), Buffer.from([1]), u32(3), Buffer.from('Game\0'), Buffer.from([8, 8, 8])]);
  const entry = Buffer.concat([u32(123), u32(body.length + 60), Buffer.alloc(60), body, u32(0)]);
  const header = Buffer.alloc(16); header.writeUInt32LE(0x07564429); header.writeUInt32LE(1, 4); header.writeBigUInt64LE(BigInt(16 + entry.length), 8);
  const data = Buffer.concat([header, entry, u32(strings.length), ...strings.map(s => Buffer.from(s + '\0'))]);
  assert.equal(parseAppInfo(data).get('123').name, 'Test Game');
  assert.throws(() => parseAppInfo(data.subarray(0, 20)));
});
test('Epic browsing metadata does not become ownership without offline account evidence', () => {
  const catalog = [{ id: 'owned', title: 'Owned Game', namespace: 'n', categories: [{ path: 'games' }], releaseInfo: [{ appId: 'app1', platform: ['Windows'] }], mainGameItem: { id: '' } },
    { id: 'viewed', title: 'Just Viewed', categories: [{ path: 'games' }], releaseInfo: [{ appId: 'app2' }] },
    { id: 'dlc', title: 'An Addon', categories: [{ path: 'games' }], releaseInfo: [{ appId: 'app3' }], mainGameItem: { id: 'owned' } }];
  const games = epicCatalogRecords(catalog, new Set(['owned', 'dlc']));
  assert.equal(games.length, 1); assert.equal(games[0].appId, 'app1'); assert.equal(games[0].installed, false);
});
test('protobuf cache parser enforces boundaries', () => {
  assert.deepEqual(protoFields(Buffer.from([8, 123, 26, 3, 97, 98, 99])), [{ number: 1, value: 123 }, { number: 3, value: Buffer.from('abc') }]);
  assert.throws(() => protoFields(Buffer.from([26, 9, 97])));
});
test('achievement counts are retained while partial cached lists remain explicit', () => {
  const details = steamDetails([['achievements', { data: { nTotal: 51, nAchieved: 12, vecHighlight: [{ strID: 'one', strName: 'First', bAchieved: true, rtUnlocked: 123 }], vecUnachieved: [{ strID: 'one', bAchieved: false }, { strID: 'two', bAchieved: false }] } }]]);
  assert.equal(details.achievements.unlocked, 12); assert.equal(details.achievements.total, 51);
  assert.equal(details.achievements.items.length, 2); assert.equal(details.achievements.items[0].unlockedAt, 123000);
  assert.equal(details.achievements.partial, true); assert.equal(steamDetails([]).achievements, null);
});
test('new store timestamps override older Orbit launch timestamps', () => {
  const base = [{ id: 'steam:1', appId: '1', title: 'Game', source: 'Steam', installed: true, lastPlayed: 3000, playtime: 123, playtimeKnown: true }];
  const first = mergeLibrary(base)[0];
  const game = mergeLibrary(base, { [first.id]: { lastPlayed: 2000 } })[0];
  assert.equal(game.lastPlayed, 3000); assert.equal(game.playtimeKnown, true);
  const notPlayed = mergeLibrary(base, { [first.id]: { lastOpened: 9000 } })[0];
  assert.equal(notPlayed.lastPlayed, 3000); assert.equal(notPlayed.lastOpened, 9000);
  assert.equal(mergeLibrary([{ id: 'epic:1', title: 'Other', source: 'Epic Games' }])[0].playtimeKnown, false);
});
test('stats survive merging history with installed manifests', () => {
  const game = mergeLibrary([{ id: 'steam:1', appId: '1', title: 'Game', source: 'Steam', installed: true, sizeBytes: 500 },
    { id: 'steam:1', appId: '1', title: 'Game', source: 'Steam', installed: false, playtime: 600, playtimeKnown: true, achievements: { total: 5, unlocked: 2 }, statsUpdatedAt: 100 }])[0];
  assert.equal(game.installed, true); assert.equal(game.playtime, 600); assert.equal(game.sizeBytes, 500); assert.equal(game.achievements.unlocked, 2);
});
test('cross-store explicit Steam IDs resolve renamed games without fuzzy edition merging', () => {
  const games = mergeLibrary([{ id: 'steam:1', appId: '1', title: 'Old Name', source: 'Steam', installed: true },
    { id: 'ubisoft:2', equivalentSteamId: '1', title: 'New Name', source: 'Ubisoft Connect', installed: false }]);
  assert.equal(games.length, 1); assert.equal(games[0].selected, 'steam:1'); assert.equal(games[0].sources.length, 2);
});
test('hashed Steam artwork paths use the store asset CDN', () => {
  assert.equal(steamArt('1', { library_assets_full: { library_capsule: { image: { english: 'hash/library_capsule.jpg' } } } }, 'library_capsule'), 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1/hash/library_capsule.jpg');
});
test('launcher-only entries remain distinct from a verified installation', () => {
  const game = mergeLibrary([{ id: 'shortcut:1', title: 'Game', source: 'GRYPHLINK', installed: false, launcherAvailable: true }])[0];
  assert.equal(game.installed, false); assert.equal(game.launcherAvailable, true);
  assert.throws(() => actionFor({ launcherAvailable: true, shortcut: 'bad.cmd' }));
});
