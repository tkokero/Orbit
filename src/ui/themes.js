/* MIT licensed. Shared by the renderer and main process; no dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.OrbitTheme=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  const fields=['background','surface','text','muted','accent','positive','warm','secondary'];
  const make=(id,name,...values)=>({id,name,colors:Object.fromEntries(fields.map((key,i)=>[key,values[i]]))});
  const builtins=[
    make('orbit','Orbit','#111019','#1d1826','#f0edf9','#b7aac7','#c4b5fd','#bbebcf','#ffccaa','#a9c6f0'),
    make('midnight','Midnight','#0b1220','#151f32','#edf3ff','#9aaecb','#8baeff','#91dfc6','#f1c499','#a9a2f0'),
    make('ocean','Ocean','#081a20','#112b35','#e7f8fb','#99bcc5','#6fdce4','#ade4c7','#f5d29b','#89bbf2'),
    make('evergreen','Evergreen','#0e1915','#192c23','#edf7ef','#a0bcac','#95d5a3','#9ce0cf','#ecc499','#b8b5e8'),
    make('rose','Roseberry','#1d101c','#301e2e','#fceef9','#c5a4bf','#f3a8d3','#bce4ca','#f3c5a3','#c1b8f2'),
    make('ember','Ember','#1c1210','#30211b','#fff2e9','#c7ac9d','#ffb18b','#c2dbaa','#f3d18f','#a8cbdc'),
    make('sunflower','Sunflower','#19180e','#2a291b','#faf6e8','#bab69a','#ead78c','#b3d6a8','#f4b08b','#a5cadb'),
    make('plum','Plum','#180e23','#291c39','#f7ecff','#bba3cf','#cf9df3','#a5e0cb','#f1bfaa','#9cbdf1'),
    make('glacier','Glacier','#0e171f','#1b2936','#ecf5ff','#a4bbcb','#b4d9f3','#a5e3d3','#ead0b7','#b6b7f0'),
    make('graphite','Graphite','#141414','#252525','#f1f1f1','#b2b2b2','#d1d1d1','#b4d6be','#e4c3a9','#b3c6dd'),
    make('latte','Latte','#f3eadf','#fffbf5','#3d2b25','#786355','#946548','#527e60','#9b6741','#6e719c'),
    make('cloud','Cloud','#eef1f9','#ffffff','#23314c','#596982','#617ac4','#38795e','#99683e','#7d68ad'),
    make('candy','Candyfloss','#f7eaf3','#fff8fd','#48283e','#825e78','#a84f90','#3f7f6b','#a16a41','#6d6eb8'),
    make('peach','Peach Tea','#fff0e7','#fffbf6','#4c3029','#886858','#b76543','#4d805f','#a47a30','#7f6eac')
  ];
  function validate(input){
    if(!input||input.schemaVersion!==1||typeof input.name!=='string'||!input.name.trim()||input.name.length>60||!input.colors||typeof input.colors!=='object')throw new Error('Choose an Orbit theme JSON file (schemaVersion 1).');
    const colors={};for(const key of fields){const color=input.colors[key];if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Theme colors must use six-digit hex values.');colors[key]=color.toLowerCase();}
    return {schemaVersion:1,name:input.name.trim(),colors};
  }
  function luminance(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function ink(color){return contrast(color,'#000000')>contrast(color,'#ffffff')?'#000000':'#ffffff';}
  function apply(theme,element){const c=theme.colors,style=element.style;for(const [field,variable]of Object.entries({background:'bg',surface:'panel',text:'text',muted:'muted',accent:'accent',positive:'green',warm:'warm',secondary:'cool'}))style.setProperty('--'+variable,c[field]);style.setProperty('--accent-ink',ink(c.accent));style.setProperty('--positive-ink',ink(c.positive));style.setProperty('--active-logo-filter',ink(c.accent)==='#ffffff'?'invert(1)':'invert(.12)');style.setProperty('--logo-filter',luminance(c.surface)>.4?'invert(.12)':'invert(1)');style.colorScheme=luminance(c.background)>.4?'light':'dark';}
  return{fields,builtins,validate,contrast,apply};
});
