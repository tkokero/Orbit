const fs=require('node:fs/promises'),path=require('node:path'),{gzipSync}=require('node:zlib');
async function compactPackage(context){
 const root=path.resolve(context.appOutDir),source=path.join(root,'LICENSES.chromium.html');
 // Preserve every notice byte. The app provides an offline viewer for this gzip.
 const bytes=await fs.readFile(source),target=path.join(root,'resources','chromium-notices.html.gz');
 if(path.dirname(source)!==root||!target.startsWith(root+path.sep))throw Error('Invalid package path.');
 await fs.writeFile(target,gzipSync(bytes,{level:9}));await fs.unlink(source);
}
module.exports=compactPackage;
