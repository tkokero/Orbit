// Cached artwork needs no decoder. Load libvips only for an actual conversion.
let engine;
module.exports=(...args)=>{if(!engine){engine=require('sharp');engine.cache({memory:8,files:0,items:16});engine.concurrency(1);}return engine(...args);};
