const fs=require('node:fs');
function readLowMemory(file){try{if(fs.statSync(file).size>1024)return true;const value=JSON.parse(fs.readFileSync(file,'utf8'));return value.lowMemoryRendering!==false;}catch(error){return error.code==='ENOENT'?false:true;}}
module.exports={readLowMemory};
