const test=require('node:test'),assert=require('node:assert/strict');
const {entryMenu,templateFor}=require('../src/context-menu.cjs');
const game={id:'example',title:'Example',kind:'game',installed:true,selected:'v1',storePlaytimeKnown:true,versions:[{id:'v1',source:'Steam',installed:true,launch:'steam://rungameid/1',location:'C:\\Games\\Example'}]};

test('a detected game offers Return to game without sending another launch request',()=>{
 const items=entryMenu(game,[],{running:true});assert.equal(items[0].id,'return');assert.equal(items.some(i=>i.id==='play'),false);
 assert.equal(entryMenu(game)[0].id,'play');
});
test('collection membership appears as checked choices with explicit commands',()=>{
 const submenu=entryMenu(game,[],{collections:['Playing','A & B'],selectedCollections:['Playing']}).find(i=>i.label==='Collections').submenu;
 assert.equal(submenu[0].checked,true);assert.equal(submenu[1].checked,false);
 let command;templateFor(submenu,value=>command=value)[1].click();assert.deepEqual(command,{action:'collection',name:'A & B'});
});
test('secondary actions stay reachable under Manage and unavailable folders remain disabled',()=>{
 const items=entryMenu({...game,installed:false,versions:[{id:'v1',source:'Steam',installUrl:'steam://install/1'}]});
 const manage=items.find(i=>i.label==='Manage').submenu;
 for(const id of ['launch-settings','detection','folder','locate','shortcut','artwork','repair','move'])assert.ok(manage.some(i=>i.id===id),id);
 assert.equal(manage.find(i=>i.id==='folder').enabled,false);assert.equal(items.some(i=>i.id==='repair'),false);
});
test('Roblox experiences retain collection shortcuts without offering process-specific actions',()=>{
 const items=entryMenu({...game,robloxPlaceId:'123'},[],{collections:['Playing']});
 assert.equal(items[0].label,'Open game');assert.ok(items.some(i=>i.label==='Collections'));assert.ok(!items.some(i=>i.label==='Local playtime'||i.id==='return'));
});

test('only running games offer a close action',()=>{assert.ok(entryMenu(game,[],{running:true}).some(i=>i.id==='close-game'));assert.ok(!entryMenu(game).some(i=>i.id==='close-game'));});
