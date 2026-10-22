const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL, fileURLToPath } = require('node:url');
const sharp = require('sharp');
const { classify, mergeLibrary } = require('../src/library.cjs');
const { cacheCovers, downloadImage } = require('../src/artwork.cjs');

test('application metadata and known VR utilities become Tools', () => {
  for (const title of ['SteamVR','OVR Toolkit','Wallpaper Engine','Blender','Standable: Full Body Estimation','Soundpad Demo']) assert.equal(classify({ title }), 'tool');
  assert.equal(classify({title:'Utility from Steam',appType:'Application'}),'tool');
  assert.equal(classify({title:'VRChat',appType:'Game'}),'game');
  assert.equal(classify({title:'Hollow Knight',appType:'Game'}),'game');
});
test('explicit user classification persists across scans', () => {
  const row={id:'steam:1',title:'A Utility',appType:'Application',source:'Steam'};
  const first=mergeLibrary([row])[0];assert.equal(first.kind,'tool');
  assert.equal(mergeLibrary([row],{[first.id]:{kind:'game'}})[0].kind,'game');
});
test('compact remembered stats do not erase detailed live achievements', () => {
  const base={id:'steam:1',title:'Game',source:'Steam',statsUpdatedAt:100};
  const game=mergeLibrary([{...base,achievements:{total:3,unlocked:1,items:[{id:'first'}]}},{...base,achievements:{total:3,unlocked:1,items:[]}}])[0];
  assert.equal(game.achievements.items.length,1);
});
test('image cache validates bytes, falls back from corrupt art, and repairs damaged thumbnails', async t => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-images-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const folder=path.join(root,'cache');await fs.mkdir(folder);
  const good=path.join(root,'portrait.png'),bad=path.join(root,'bad.jpg');
  await sharp({create:{width:600,height:900,channels:3,background:'#224466'}}).png().toFile(good);
  await fs.writeFile(bad,'not an image');
  assert.equal(await downloadImage(pathToFileURL(bad).href,folder),null);
  const rows=[{id:'1',title:'Fixture',coverCandidates:[pathToFileURL(bad).href,pathToFileURL(good).href]}];
  const report=await cacheCovers(rows,folder);assert.equal(report.available,1);
  const metadata=await sharp(fileURLToPath(rows[0].cover)).metadata();assert.equal(metadata.format,'webp');assert.equal(metadata.width,320);assert.equal(metadata.height,480);
  const file=fileURLToPath(rows[0].cover),before=(await fs.stat(file)).mtimeMs;
  await cacheCovers(rows,folder);assert.equal((await fs.stat(file)).mtimeMs,before);
  await fs.writeFile(file,'damaged cache');await cacheCovers(rows,folder,()=>{},true);
  assert.equal((await sharp(fileURLToPath(rows[0].cover)).metadata()).format,'webp');
});

test('fresh installs create the friend avatar cache and reuse compact icons',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-friend-icons-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const original=path.join(root,'avatar.png'),folder=path.join(root,'new-profile','friend-avatars');
 await sharp({create:{width:184,height:184,channels:3,background:'#8f70ca'}}).png().toFile(original);
 const url=await downloadImage(pathToFileURL(original).href,folder,{kind:'icon'});assert.ok(url,'first download must succeed without a pre-existing cache directory');
 const file=fileURLToPath(url),metadata=await sharp(file).metadata();assert.equal(metadata.width,64);assert.equal(metadata.height,64);
 const first=(await fs.stat(file)).mtimeMs;assert.equal(await downloadImage(pathToFileURL(original).href,folder,{kind:'icon'}),url);assert.equal((await fs.stat(file)).mtimeMs,first);
});


test('missing artwork backs off remote retries but local recovery and repair bypass it',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-retry-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;return new Response('',{status:404});};t.after(()=>{global.fetch=original;});
 const folder=path.join(root,'cache'),local=path.join(root,'later.png');
 const rows=()=>[{id:'retry',title:'Offline fixture',coverCandidates:[pathToFileURL(local).href,'https://assets.example.invalid/art.png']}];
 assert.equal((await cacheCovers(rows(),folder)).available,0);const initial=calls;assert.ok(initial>0);
 await cacheCovers(rows(),folder);assert.equal(calls,initial,'repeat refresh does not repeat failed network requests');
 await cacheCovers(rows(),folder,()=>{},true);assert.ok(calls>initial,'explicit repair retries immediately');const afterRepair=calls;
 await sharp({create:{width:40,height:60,channels:3,background:'#224466'}}).png().toFile(local);
 assert.equal((await cacheCovers(rows(),folder)).available,1);assert.equal(calls,afterRepair,'a newly available local cover works during remote backoff');
 await fs.unlink(local);await cacheCovers(rows(),folder);const failedAgain=calls;
 const failureFile=path.join(folder,'missing-covers.json'),entries=JSON.parse(await fs.readFile(failureFile,'utf8'));for(const key of Object.keys(entries))entries[key]=Date.now()-11*60*1000;await fs.writeFile(failureFile,JSON.stringify(entries));
 await cacheCovers(rows(),folder);assert.ok(calls>failedAgain,'expired failures retry');
});


test('concurrent thumbnail requests share one conversion and keep both library covers',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-shared-art-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));const file=path.join(root,'shared.png'),folder=path.join(root,'cache');await sharp({create:{width:40,height:60,channels:3,background:'#334455'}}).png().toFile(file);const url=pathToFileURL(file).href;
 const first=downloadImage(url,folder),second=downloadImage(url,folder);assert.strictEqual(first,second);const [a,b]=await Promise.all([first,second]);assert.ok(a);assert.equal(a,b);
 const rows=[{id:'one',title:'First game',coverCandidates:[url]},{id:'two',title:'Second game',coverCandidates:[url]}];assert.equal((await cacheCovers(rows,folder,()=>{},true)).available,2);
});
