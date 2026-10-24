const test=require('node:test'),assert=require('node:assert/strict');
const {steamAction}=require('../src/steam-launch.cjs');
const {parse,format}=require('../src/ui/launch-args.js');
const {diagnose}=require('../src/launch-health.cjs');
const game={source:'Steam',installed:true,launch:'steam://rungameid/730'};
test('Steam uses silent client launch and forwards literal game arguments after the app ID',async()=>{
 const args=['-windowed','a b','& calc.exe','-silent'];
 const action=await steamAction(game,args,'C:/Steam',async()=>true);
 assert.equal(action.type,'exe');assert.match(action.value,/steam\.exe$/);
 assert.deepEqual(action.args,['-silent','-applaunch','730',...args]);
 assert.deepEqual(args,['-windowed','a b','& calc.exe','-silent']);
});
test('Steam routing preserves installs and executable overrides and fails clearly for unavailable options',async()=>{
 for(const v of [{...game,installed:false},{...game,source:'Other'},{...game,launch:undefined},{...game,launch:'steam://rungameid/730/extra'}])assert.equal(await steamAction(v,[],'C:/Steam',async()=>true),null);
 assert.equal(await steamAction(game,[],undefined,async()=>false),null);
 await assert.rejects(steamAction(game,['-windowed'],'C:/Steam',async()=>false),/Refresh the library/);
});
test('Launch options parse quotes, Windows paths, empty values and literal shell characters',()=>{
 assert.deepEqual(parse('-windowed -name "hello world" C:\\Games\\test & echo'),['-windowed','-name','hello world','C:\\Games\\test','&','echo']);
 assert.deepEqual(parse('   '),[]);assert.deepEqual(parse('""'),['']);
 assert.throws(()=>parse('"unfinished'),/Close the double quote/);
 const args=['','hello world','C:\\Games\\','a"b','C:\\a b\\','a\\"b','-windowed'];
 assert.deepEqual(parse(format(args)),args);
});
test('Steam arguments do not incorrectly require a direct executable in detection help',async()=>{
 const report=await diagnose({id:'g',title:'Game',versions:[game]},{args:['-windowed']},async()=>true);
 assert.equal(report.issues.some(i=>i.kind==='arguments'),false);
});
