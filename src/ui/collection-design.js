(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitCollectionDesign=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const icons={folder:'Folder',gamepad:'Controller',favorites:'Star',library:'Library',activity:'Activity',downloads:'Download',home:'Home',tune:'Tools'};
 const colors={accent:'Theme accent',green:'Green',cool:'Blue',warm:'Warm',text:'Neutral'};
 const key=name=>'manual:'+encodeURIComponent(name);
 function style(input={}){if(!input||typeof input!=='object'||Array.isArray(input)||!Object.hasOwn(icons,input.icon)||!Object.hasOwn(colors,input.color))throw Error('Choose a collection icon and color.');return {icon:input.icon,color:input.color};}
 function styles(input){const out=Object.create(null);if(!input||typeof input!=='object'||Array.isArray(input))return out;
  for(const [key,value]of Object.entries(input).slice(0,100)){if(!/^(manual:|smart:)/.test(key)||key.length>512)continue;try{out[key]=style(value);}catch{}}
  return out;
 }
 return {icons,colors,key,style,styles};
});
