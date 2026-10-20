/* Offline workload heuristics. Scores are model weights, not measured benchmark ratings. */
const {gb}=require('./store-service.cjs');
const {referenceFor}=require('./fps-references.cjs');
const {RESOLUTIONS,PRESETS}=require('./fps-estimates.cjs');
const GPU={
 'RTX 5090':12,'RTX 5080':7.2,'RTX 5070 TI':6.5,'RTX 5070':5.3,'RTX 5060 TI':3.8,'RTX 5060':3.2,
 'RTX 4090':10,'RTX 4080 SUPER':7,'RTX 4080':6.7,'RTX 4070 TI SUPER':6,'RTX 4070 TI':5.7,'RTX 4070 SUPER':5.2,'RTX 4070':4.5,'RTX 4060 TI':3.4,'RTX 4060':2.7,
 'RTX 3090':5.8,'RTX 3080 TI':5.6,'RTX 3080':5.2,'RTX 3070 TI':4.1,'RTX 3070':3.8,'RTX 3060 TI':3.3,'RTX 3060':2.6,'RTX 3050':1.7,
 'RTX 2080 TI':3.7,'RTX 2080 SUPER':3.2,'RTX 2080':3,'RTX 2070 SUPER':2.8,'RTX 2070':2.5,'RTX 2060 SUPER':2.3,'RTX 2060':2,
 'GTX 1080 TI':2.7,'GTX 1080':2.1,'GTX 1070 TI':1.9,'GTX 1070':1.7,'GTX 1060':1,'GTX 1050 TI':.65,'GTX 1050':.5,'GTX 970':1,'GTX 960':.65,'GTX 750 TI':.35,'GTX 1660 TI':1.5,'GTX 1660 SUPER':1.45,'GTX 1660':1.3,'GTX 1650':.8,
 'RX 9070 XT':6.7,'RX 9070':6,'RX 9060 XT':3.8,'RX 7900 XTX':7.2,'RX 7900 XT':6.2,'RX 7900 GRE':5.5,'RX 7800 XT':5,'RX 7700 XT':4.2,'RX 7600 XT':2.7,'RX 7600':2.5,
 'RX 6950 XT':5.8,'RX 6900 XT':5.5,'RX 6800 XT':5.1,'RX 6800':4.5,'RX 6750 XT':3.7,'RX 6700 XT':3.5,'RX 6650 XT':2.7,'RX 6600 XT':2.5,'RX 6600':2.2,'RX 6500 XT':.8,
 'RX 5700 XT':2.5,'RX 5700':2.2,'RX 5600 XT':1.9,'RX 580':1.1,'RX 570':.95,'RX 480':1,'RX 470':.85,
 'ARC B580':2.9,'ARC B570':2.5,'ARC A770':2.4,'ARC A750':2.2,'ARC A580':1.8,'ARC A380':.6,'RADEON 780M':.65,'RADEON 680M':.5,'IRIS XE':.35,'UHD GRAPHICS':.18
};
const GPU_RULES=Object.entries(GPU).sort((a,b)=>b[0].length-a[0].length).map(([name,score])=>({pattern:new RegExp('(?:^| )'+name+'(?: |$)'),score}));
const normalize=value=>String(value||'').toUpperCase().replace(/GEFORCE|NVIDIA|AMD|INTEL|\(R\)|\(TM\)/g,'').replace(/[^A-Z0-9]+/g,' ').replace(/(RTX|GTX|RX|RYZEN)\s*(\d)/g,'$1 $2').replace(/(\d)(TI|SUPER)\b/g,'$1 $2').trim();
function gpuScore(value){const text=normalize(value);for(const {pattern,score}of GPU_RULES){if(pattern.test(text))return {score:score*(/LAPTOP|MOBILE|MAX Q/.test(text)?.72:1),matched:true};}return {score:/INTEGRATED|UHD|IRIS|VEGA|RADEON.*GRAPHICS/.test(text)?.25:1,matched:false};}
function cpuScore(value){const text=normalize(value);let m=text.match(/(?:CORE )?I([3579]) ?(\d{4,5})/);if(m){const gen=Number(m[2].slice(0,m[2].length===5?2:1));return {score:Math.max(.4,.7+gen*.1+(Number(m[1])-3)*.13)*(/\d[UHY]\b/.test(text)?.8:1),matched:true};}m=text.match(/RYZEN ([3579]) (\d{4})/);if(m)return {score:.7+Number(m[2][0])*.2+(Number(m[1])-3)*.1,matched:true};if(/CORE ULTRA/.test(text))return {score:2.3,matched:true};return {score:/CELERON|PENTIUM|ATHLON/.test(text)?.6:1.6,matched:false};}
function workload(title,requirements){
 const row=(section,key)=>requirements?.[section]?.find(r=>r.key===key)?.required||'';
 const recommendedGPU=row('recommended','gpu'),recommendedCPU=row('recommended','cpu'),g=gpuScore(recommendedGPU),c=cpuScore(recommendedCPU),ram=gb(row('recommended','ram'));
 if(recommendedGPU&&g.matched)return {gpu:g.score,cpu:recommendedCPU?c.score:1.7,ram:Number.isFinite(ram)?Math.max(4,ram):16,basis:'Published recommended hardware',uncertainty:/vrchat|vr\b/i.test(title)?.75:.5};
 if(/geometry dash|stardew|terraria|undertale|among us|balatro/i.test(title))return {gpu:.3,cpu:.7,ram:4,basis:'Lightweight game profile',uncertainty:.6};
 if(/valorant|counter.strike|rocket league|league of legends|dota 2/i.test(title))return {gpu:.9,cpu:1.2,ram:8,basis:'Competitive game profile',uncertainty:.55};
 if(/vrchat|steamvr|vr\b/i.test(title))return {gpu:2.4,cpu:2.3,ram:16,basis:'VR workload profile; desktop-resolution approximation',uncertainty:.75};
 if(/minecraft|roblox/i.test(title))return {gpu:.8,cpu:1.6,ram:8,basis:'Unmodified sandbox game profile',uncertainty:.7};
 return {gpu:2.4,cpu:1.8,ram:16,basis:'Generic 3D game profile; requirements unavailable or unrecognized',uncertainty:.75};
}
function estimateHardware(game,pc,requirements=null){
 const cards=(Array.isArray(pc?.gpu)?pc.gpu:[]).filter(g=>typeof g==='string'&&g.trim()).map(name=>({name,...gpuScore(name)})).sort((a,b)=>b.score-a.score),gpu=cards[0],cpu=cpuScore(pc?.cpu),profile=workload(game?.title||'',requirements),reference=referenceFor(game?.title);
 const usable=Boolean(gpu&&pc?.cpu&&Number.isFinite(pc.ramGB)&&pc.ramGB>0),unsupported=requirements?.windows===false;
 const distance=(anchor,r,p)=>{const resolution=RESOLUTIONS.find(x=>x.id===anchor.resolution),quality=PRESETS.find(x=>x.id===anchor.preset);return Math.abs(Math.log((r.width*r.height)/(resolution.width*resolution.height)))+.9*Math.abs(Math.log(p.cost/quality.cost));};
 const rows=RESOLUTIONS.map(r=>({resolution:r.id,width:r.width,height:r.height,cells:PRESETS.map(p=>{
  if(!usable||unsupported)return {preset:p.id,kind:'unavailable'};
  let center,width,basis='fallback';
  if(reference){
   const anchor=[...reference.anchors].sort((a,b)=>distance(a,r,p)-distance(b,r,p))[0],resolution=RESOLUTIONS.find(x=>x.id===anchor.resolution),quality=PRESETS.find(x=>x.id===anchor.preset),gpuRatio=gpu.score/gpuScore(anchor.gpu).score,cpuRatio=cpu.score/cpuScore(anchor.cpu).score;
   const pixelRatio=(r.width*r.height)/(resolution.width*resolution.height),work=pixelRatio**.9*(p.cost/quality.cost),memory=Math.min(1,pc.ramGB/anchor.ram);
   const fixed=reference.cpuShare/(cpuRatio**.65),render=(1-reference.cpuShare)*work/(gpuRatio**.85);
   center=anchor.fps/(fixed+render)*memory;
   width=Math.min(.75,.3+Math.abs(Math.log2(gpuRatio))*.05+Math.abs(Math.log2(cpuRatio))*.06+distance(anchor,r,p)*.03+(!gpu.matched||!cpu.matched ? .15 : 0));basis='publisher-model';
  }else{
   const pixels=r.width*r.height/(1920*1080),memory=Math.min(1,pc.ramGB/profile.ram),gpuLimit=60*(gpu.score/profile.gpu)**.85/(pixels**.85*p.cost),cpuLimit=100*(cpu.score/profile.cpu)**.65;
   center=Math.min(gpuLimit,cpuLimit)*memory;width=Math.min(.85,profile.uncertainty+(!gpu.matched ? .1 : 0)+(!cpu.matched ? .1 : 0));
  }
  const low=Math.max(1,Math.floor(center*(1-width)/5)*5),high=Math.max(low+1,Math.ceil(center*(1+width)/5)*5);
  return {preset:p.id,kind:'estimated',low,high,confidence:reference?'Low':'Very low',basis};
 })}));
 // Prevent independently chosen reference tiers from implying higher FPS at a harder setting.
 for(let i=rows.length-1;i>=0;i--)for(let j=PRESETS.length-1;j>=0;j--){const cell=rows[i].cells[j];if(cell.kind!=='estimated')continue;for(const next of [rows[i+1]?.cells[j],rows[i].cells[j+1]])if(next?.kind==='estimated'){cell.low=Math.max(cell.low,next.low);cell.high=Math.max(cell.high,next.high);}}
 const caveat=reference?'Uses publisher FPS targets and nearby settings, scaled with approximate hardware weights and CPU/GPU frame-time costs. These are modeled ranges, not measurements on your PC.':'Fallback heuristic: recommended hardware is assumed to target 60 FPS at 1080p High. No game-specific FPS reference is available; treat this as a very rough guide.';
 return {rows,status:unsupported?'platform-unsupported':usable?'hardware-estimate':'hardware-unavailable',basis:unsupported?'No Windows version is listed':reference?'Publisher FPS targets + hardware model':profile.basis,confidence:reference?'Low':'Very low',reference:reference?{name:reference.name,source:reference.source,url:reference.url,checkedAt:'2026-10-19'}:null,gpu:gpu?.name||'',cpu:pc?.cpu||'',ramGB:pc?.ramGB,generatedAt:Date.now(),assumptions:'Modeled estimates, not benchmark results. '+caveat+' Native rendering; ray tracing, upscaling, and frame generation off. Fastest detected GPU assumed. Engine caps, mods, VR headset resolution, laptop power, scenes, and drivers may change actual FPS substantially.'};
}
module.exports={estimateHardware,gpuScore,cpuScore,workload,referenceFor};
