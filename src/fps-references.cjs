/* Curated publisher targets, checked 2026-10-19. Targets are not independent benchmarks. */
const profiles=[
 {id:'cyberpunk2077',match:/^cyberpunk 2077(?:\b|$)/i,name:'Cyberpunk 2077 · Update 2.0+',source:'CD PROJEKT RED',url:'https://support.cdprojektred.com/en/cyberpunk/pc/sp-technical/issue/1556/cyberpunk-2077-system-requirements',cpuShare:.25,anchors:[
  {resolution:'1080p',preset:'low',fps:30,cpu:'Core i7-6700',gpu:'GTX 1060',ram:12},
  {resolution:'1080p',preset:'high',fps:60,cpu:'Core i7-12700',gpu:'RTX 2060 SUPER',ram:16},
  {resolution:'4K',preset:'ultra',fps:60,cpu:'Core i9-12900',gpu:'RTX 3080',ram:20}
 ]},
 {id:'ghost-tsushima',match:/^ghost of tsushima(?:\b|$)/i,name:'Ghost of Tsushima Director’s Cut',source:'Nixxes / PlayStation',url:'https://blog.playstation.com/2024/04/17/ghost-of-tsushima-directors-cut-pc-cross-play-and-system-requirements-revealed/',cpuShare:.2,anchors:[
  {resolution:'720p',preset:'low',publisherPreset:'Very Low',fps:30,cpu:'Core i3-7100',gpu:'GTX 960',ram:8},
  {resolution:'1080p',preset:'medium',fps:60,cpu:'Core i5-8600',gpu:'RTX 2060',ram:16},
  {resolution:'1440p',preset:'high',fps:60,cpu:'Core i5-11400',gpu:'RTX 3070',ram:16},
  {resolution:'4K',preset:'high',fps:30,cpu:'Core i5-11400',gpu:'RTX 3070',ram:16},
  {resolution:'4K',preset:'ultra',publisherPreset:'Very High',fps:60,cpu:'Core i5-11400',gpu:'RTX 4080',ram:16}
 ]},
 {id:'ac-mirage',match:/^assassin.?s creed mirage(?:\b|$)/i,name:'Assassin’s Creed Mirage',source:'Ubisoft',url:'https://news.ubisoft.com/en-us/article/5HKZEQn6zdHlK4LpgfwVdp',cpuShare:.25,anchors:[
  {resolution:'1080p',preset:'low',fps:30,cpu:'Core i7-4790K',gpu:'GTX 1060',ram:8},
  {resolution:'1080p',preset:'high',fps:60,cpu:'Core i7-8700K',gpu:'GTX 1660 TI',ram:16},
  {resolution:'1440p',preset:'high',fps:60,cpu:'Core i7-9700K',gpu:'RTX 2070',ram:16},
  {resolution:'4K',preset:'ultra',fps:60,cpu:'Core i5-11600K',gpu:'RTX 3080',ram:16}
 ]}
];
function referenceFor(title){return profiles.find(p=>p.match.test(String(title||'').replace(/[®™]/g,'')))||null;}
module.exports={profiles,referenceFor};
