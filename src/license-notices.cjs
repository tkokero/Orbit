const fs=require('node:fs/promises'),path=require('node:path'),{gunzipSync}=require('node:zlib');
async function readNotices(resources){try{return gunzipSync(await fs.readFile(path.join(resources,'chromium-notices.html.gz')),{maxOutputLength:64*1024*1024});}catch(error){if(error.code!=='ENOENT')throw error;return fs.readFile(path.join(resources,'..','LICENSES.chromium.html'));}}
module.exports={readNotices};
