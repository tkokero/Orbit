/* MIT licensed. Shared by the renderer and main process; no dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.OrbitTheme=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  const fields=['background','surface','text','muted','accent','positive','warm','secondary'];
  const make=(id,name,...values)=>({id,name,colors:Object.fromEntries(fields.map((key,i)=>[key,values[i]]))});
  const builtins=[
    make('orbit','Orbit','#10141b','#19212c','#eef4fc','#a4b1c3','#8cc5ff','#a8e7c4','#edc48c','#b6b2f2'),
    make('dark','Dark','#090909','#171717','#eeeeee','#aaaaaa','#b9c0cc','#b7c9bd','#d0baa0','#b8b6cb'),
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
    const theme={schemaVersion:1,name:input.name.trim(),colors};
    if(input.image!=null){const i=input.image;if(typeof i!=='object'||typeof i.data!=='string'||i.data.length>1050000||!/^data:image\/webp;base64,UklGR[A-Za-z0-9+/]*={0,2}$/.test(i.data)||!/^#[0-9a-f]{6}$/i.test(i.accent)||!['auto','manual'].includes(i.mode))throw Error('Choose a supported theme image.');theme.image={data:i.data,accent:i.accent.toLowerCase(),mode:i.mode,opacity:Number.isFinite(i.opacity)?Math.min(70,Math.max(0,Math.round(i.opacity))):30};}
    return theme;
  }
  function luminance(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function ink(color){return contrast(color,'#000000')>contrast(color,'#ffffff')?'#000000':'#ffffff';}
  function effectiveAccent(theme){let color=theme.image?.mode==='auto'?theme.image.accent:theme.colors.accent;if(theme.image?.mode!=='auto')return color;const target=luminance(theme.colors.surface)>.4?0:255,base=color.slice(1).match(/../g).map(x=>parseInt(x,16));for(let step=0;step<=10;step++){const t=step/10,value='#'+base.map(x=>Math.round(x+(target-x)*t).toString(16).padStart(2,'0')).join('');if(contrast(value,theme.colors.surface)>=3)return value;}return color;}
  function mix(a,b,t){const x=a.slice(1).match(/../g),y=b.slice(1).match(/../g);return '#'+x.map((v,i)=>Math.round(parseInt(v,16)*(1-t)+parseInt(y[i],16)*t).toString(16).padStart(2,'0')).join('');}
  function readableMuted(c){
    const score=color=>Math.min(contrast(color,c.background),contrast(color,c.surface));
    if(score(c.muted)>=4.5)return c;
    const target=score(c.text)>=4.5?c.text:score('#ffffff')>score('#000000')?'#ffffff':'#000000';
    for(let step=1;step<=100;step++){const candidate=mix(c.muted,target,step/100);if(score(candidate)>=4.5){c.muted=candidate;return c;}}
    c.muted=target;return c;
  }
  function effectiveColors(theme){
    const c={...theme.colors,accent:effectiveAccent(theme)};
    if(!theme.image)return readableMuted(c);
    // Build image surfaces from the accent hue, rather than blending in the preset's blue.
    const rgb=c.accent.slice(1).match(/../g).map(v=>parseInt(v,16)),lo=Math.min(...rgb),hi=Math.max(...rgb);
    const hue=hi-lo<12?c.accent:'#'+rgb.map(v=>Math.round(40+(v-lo)/(hi-lo)*215).toString(16).padStart(2,'0')).join('');
    const light=luminance(theme.colors.background)>.4,neutral=light?'#ffffff':'#000000';
    c.background=mix(neutral,hue,light?.07:.11);
    c.surface=mix(neutral,hue,light?.13:.21);
    c.text=mix(light?'#101010':'#ffffff',hue,.06);
    c.muted=mix(light?'#404040':'#ffffff',hue,light?.12:.30);
    // Keep the saved manual accent exact, even when the photo changes.
    if(theme.image.mode==='auto'&&contrast(c.accent,c.surface)<3){
      for(let step=1;step<=10;step++){const candidate=mix(c.accent,light?'#000000':'#ffffff',step/10);if(contrast(candidate,c.surface)>=3){c.accent=candidate;break;}}
    }
    c.positive=c.accent;c.secondary=mix(c.accent,c.text,.18);
    return readableMuted(c);
  }
  function apply(theme,element){const c=effectiveColors(theme),style=element.style;style.setProperty('--theme-photo-surface',theme.image?'transparent':'var(--sidebar)');style.setProperty('--theme-background',theme.image?`linear-gradient(color-mix(in srgb, ${c.background}, transparent ${theme.image.opacity}%),color-mix(in srgb, ${c.background}, transparent ${theme.image.opacity}%)),url("${theme.image.data}")`:'linear-gradient(155deg,var(--ambient) 0,var(--bg) 440px)');for(const [field,variable]of Object.entries({background:'bg',surface:'panel',text:'text',muted:'muted',accent:'accent',positive:'green',warm:'warm',secondary:'cool'}))style.setProperty('--'+variable,c[field]);style.setProperty('--accent-ink',ink(c.accent));style.setProperty('--positive-ink',ink(c.positive));style.setProperty('--active-logo-filter',ink(c.accent)==='#ffffff'?'invert(1)':'invert(.12)');style.setProperty('--logo-filter',luminance(c.surface)>.4?'invert(.12)':'invert(1)');style.colorScheme=luminance(c.background)>.4?'light':'dark';}
  return{fields,builtins,validate,contrast,apply,effectiveAccent,effectiveColors};
});
