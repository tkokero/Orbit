const {spawn}=require('node:child_process'),path=require('node:path');
// Game windows must be visible. windowsHide would hide a native game's first window.
function launchGameProcess(action){return new Promise((resolve,reject)=>{const child=spawn(action.value,action.args||[],{cwd:action.cwd||path.dirname(action.value),env:action.env?{...process.env,...action.env}:process.env,detached:true,stdio:'ignore',shell:false,windowsHide:false});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve(child);});});}
module.exports={launchGameProcess};
