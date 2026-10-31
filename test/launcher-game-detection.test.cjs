const test=require('node:test'),assert=require('node:assert/strict');
const {RunningGames}=require('../src/running-games.cjs');
const {mergeLibrary}=require('../src/library.cjs');
const {candidatesFor,matchesProcess}=require('../src/playtime.cjs');
const shortcut={id:'shortcut:endfield',title:'Arknights: Endfield',source:'GRYPHLINK',origin:'shortcut',installed:false,launcherAvailable:true,shortcutGameTarget:true,launcherExecutable:'C:\\GRYPHLINK\\Launcher.exe',gameExecutables:['C:\\GRYPHLINK\\Endfield.exe']};
const processRow={pid:47,name:'Endfield',path:null,started:'2026-10-28T12:00:00Z',activity:'foreground'};
test('Endfield is detected through its launcher without claiming an installation or ownership',async()=>{
 const game=mergeLibrary([shortcut])[0],original=JSON.stringify(game);let rows=[processRow];
 const running=new RunningGames({games:()=>[game],find:async names=>{assert.ok(names.includes('Endfield.exe'));assert.ok(!names.some(n=>/launcher|gryphlink/i.test(n)));return rows;},emit:()=>{}});
 assert.equal((await running.scan())[0].id,game.id);assert.equal((await running.diagnose(game.id)).status,'Running');
 assert.equal(JSON.stringify(game),original);assert.equal(game.installed,false);assert.equal(game.versions[0].ownershipVerified,false);
 rows=[];assert.deepEqual(await running.scan(),[]);running.stop();
});
test('another selected store copy cannot suppress a linked launcher game',async()=>{
 const records=[shortcut,{id:'steam:4732690',appId:'4732690',title:shortcut.title,source:'Steam',origin:'steam-account',installed:false}],id=mergeLibrary(records)[0].id;
 const game=mergeLibrary(records,{[id]:{preferred:'steam:4732690'}})[0];assert.equal(game.launcherAvailable,false);
 const running=new RunningGames({games:()=>[game],find:async()=>[processRow],emit:()=>{}});assert.equal((await running.scan()).length,1);running.stop();
});
test('a running launcher alone, unlinked store entries and unrelated protected processes do not count',async()=>{
 const game=mergeLibrary([shortcut])[0],unlinked={...game,id:'unlinked',versions:[],launcherAvailable:false};let rows=[{pid:2,name:'Launcher',path:'C:\\GRYPHLINK\\Launcher.exe'}];
 const running=new RunningGames({games:()=>[game,unlinked],find:async()=>rows,emit:()=>{}});assert.deepEqual(await running.scan(),[]);
 rows=[processRow];assert.deepEqual((await running.scan()).map(s=>s.id),[game.id]);
 const expected=candidatesFor(game);assert.equal(matchesProcess({name:'Endfield',path:'D:\\Unrelated\\Endfield.exe'},expected),false);assert.equal(matchesProcess({name:'OtherGame',path:null},expected),false);
 running.stop();
});
test('a linked unknown launcher explains that its game executable is needed',async()=>{
 const game={id:'unknown',title:'Unknown',kind:'game',installed:false,versions:[{launcherAvailable:true,launcherExecutable:'C:\\Client\\Launcher.exe'}]};
 const running=new RunningGames({games:()=>[game],find:async()=>[],emit:()=>{}});assert.equal((await running.diagnose(game.id)).status,'Executable needed');running.stop();
});
