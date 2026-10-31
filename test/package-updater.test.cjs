const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib'),yaml=require('yaml');
test('unpublished packages retain update configuration and complete license notices',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-package-update-'));t.after(()=>{assert(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep));return fs.rm(root,{recursive:true,force:true});});
 const notice=Buffer.from('Complete fixture license notice.');await fs.mkdir(path.join(root,'resources'));await fs.writeFile(path.join(root,'LICENSES.chromium.html'),notice);
 await require('../scripts/compact-package.cjs')({appOutDir:root,packager:{appInfo:{updaterCacheDirName:'orbit-game-launcher-updater'}}});
 const config=yaml.parse(await fs.readFile(path.join(root,'resources/app-update.yml'),'utf8'));
 assert.deepEqual(config,{provider:'generic',url:require('../src/release-config.cjs').FEED,updaterCacheDirName:'orbit-game-launcher-updater'});
 assert.deepEqual(zlib.gunzipSync(await fs.readFile(path.join(root,'resources/chromium-notices.html.gz'))),notice);
 await assert.rejects(fs.access(path.join(root,'LICENSES.chromium.html')),{code:'ENOENT'});
});
