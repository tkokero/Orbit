const test=require('node:test'),assert=require('node:assert/strict');
const {mergeLibrary}=require('../src/library.cjs'),{allowed}=require('../src/ownership.cjs');
const history={id:'steam:3949040',appId:'3949040',title:'RV There Yet?',source:'Steam',origin:'local-history',installed:false,playtime:.2,playtimeKnown:true,lastPlayed:1234,launch:'steam://rungameid/3949040',installUrl:'steam://install/3949040'};
test('Steam play history alone does not add a game to the library or offer Install',()=>{assert.equal(allowed(history),false);assert.deepEqual(mergeLibrary([history]),[]);});
test('cached history and other-account metadata remain insufficient even with a cached installed flag',()=>{assert.equal(allowed({...history,installed:true}),false);assert.deepEqual(mergeLibrary([{...history,installed:true}]),[]);});
test('history enriches a matching installed copy without replacing its identity or installation data',()=>{
 const installed={...history,title:'Current title',origin:'scan',installed:true,sizeBytes:2048,manifestFile:'C:\\Steam\\steamapps\\appmanifest_3949040.acf',playtime:0};
 for(const rows of [[history,installed],[installed,history]]){const [game]=mergeLibrary(rows);assert.equal(game.title,'Current title');assert.equal(game.installed,true);assert.equal(game.playtime,.2);assert.equal(game.lastPlayed,1234);assert.equal(game.versions[0].origin,'scan');assert.equal(game.versions[0].sizeBytes,2048);}
});
test('a verified account library can show an uninstalled game and retain its local stats',()=>{
 const account={id:history.id,appId:history.appId,title:history.title,source:'Steam',origin:'steam-account',installed:false};
 for(const rows of [[history,account],[account,history]]){const [game]=mergeLibrary(rows);assert.equal(game.installed,false);assert.equal(game.playtime,.2);assert.equal(game.ownership.state,'account');assert.equal(game.versions[0].origin,'steam-account');}
});
test('manual and imported entries remain visible while matching history contributes only statistics',()=>{
 for(const origin of ['manual','import']){const explicit={...history,origin,playtime:0};for(const rows of [[history,explicit],[explicit,history]]){const [game]=mergeLibrary(rows);assert.equal(game.ownership.state,'added');assert.equal(game.playtime,.2);assert.equal(game.versions[0].origin,origin);}}
});
test('a different store or app ID cannot validate a history-only Steam entry',()=>{
 const other={id:'epic:rv',title:history.title,source:'Epic Games',origin:'import'};const games=mergeLibrary([history,other]);assert.equal(games.length,1);assert.deepEqual(games[0].sources,['Epic Games']);
 const confirmed={...history,id:'steam:1',appId:'1',title:'Different game',origin:'steam-account'};assert.equal(mergeLibrary([history,confirmed]).length,1);
});
