const test=require('node:test');const assert=require('node:assert/strict');const {parseExperience,experienceEntry,launchExperience,RobloxImages}=require('../src/roblox.cjs');
test('Roblox experience links retain the specific place and discard unrelated URL parameters',()=>{for(const url of ['https://www.roblox.com/games/1234/Example?tracking=remove','https://roblox.com/games/start?placeId=1234','001234'])assert.equal(parseExperience(url).url,'https://www.roblox.com/games/1234/');assert.equal(launchExperience({url:'https://www.roblox.com/games/1234/'},'app'),'roblox://placeId=1234');assert.equal(experienceEntry({title:'My game',url:'1234'}).title,'My game');});
test('Roblox links reject external hosts, secrets, scripts and unsupported short links',()=>{for(const url of ['https://www.roblox.com.evil.test/games/1234/','https://user:secret@www.roblox.com/games/1234/','javascript:alert(1)','roblox-player:arbitrary','https://www.roblox.com:444/games/1234/','https://www.roblox.com/share?code=123','0','-1'])assert.throws(()=>parseExperience(url));assert.throws(()=>experienceEntry({title:'',url:'1234'}));});
test('Roblox artwork resolves only a completed matching universe thumbnail',async()=>{let calls=0;const images=new RobloxImages(async url=>{calls++;return {ok:true,json:async()=>url.includes('/universe')?{universeId:55}:{data:[{targetId:55,state:'Completed',imageUrl:'https://tr.rbxcdn.com/fixture.png'}]}};});assert.equal(await images.icon('1234'),'https://tr.rbxcdn.com/fixture.png');await images.icon('1234');assert.equal(calls,2);const bad=new RobloxImages(async url=>({ok:true,json:async()=>url.includes('/universe')?{universeId:55}:{data:[{targetId:55,state:'Completed',imageUrl:'https://evil.test/a.png'}]}}));assert.equal(await bad.icon('1234'),null);});


test('saved Roblox places create a platform library without merging identical names or claiming installation',()=>{
 const {libraryEntries}=require('../src/roblox.cjs'),{mergeLibrary}=require('../src/library.cjs');
 assert.deepEqual(libraryEntries({games:[]}),[]);
 const saved={games:[{...experienceEntry({title:'Roblox',url:'1234'}),lastOpened:42},{...experienceEntry({title:'Roblox',url:'5678'})}]};
 const entries=libraryEntries(saved);assert.equal(entries.length,3);assert.equal(entries[0].title,'Roblox');const games=mergeLibrary(entries);assert.equal(games.length,3);assert.equal(games.filter(g=>g.robloxPlaceId).length,2);assert.equal(games.find(g=>g.robloxPlaceId==='1234').lastPlayed,42);assert.ok(games.every(g=>!g.installed));assert.ok(games.every(g=>!g.playtimeKnown));
 assert.equal(libraryEntries(saved,[{title:'Roblox',source:'Roblox'}]).length,2);assert.equal(mergeLibrary([...entries,{id:'steam:99',title:'Roblox',source:'Steam',appId:'99'}]).filter(g=>g.robloxPlaceId).length,2);
});

test('experience context actions omit shared-process tracking and desktop executable controls',()=>{
 const {entryMenu}=require('../src/context-menu.cjs');const menu=entryMenu({robloxPlaceId:'1234',favorite:false});assert.equal(menu[0].label,'Open game');assert.ok(menu.some(i=>i.id==='details'));assert.ok(!JSON.stringify(menu).includes('timer'));assert.ok(!menu.some(i=>i.id==='locate'));
});
