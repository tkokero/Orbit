(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitPopupSize=api;})(globalThis,()=>{
 const defaults={width:100,height:100},minimum=20,maximum=200;
 const clamp=value=>Math.max(minimum,Math.min(maximum,value));
 function normalize(value={}){return {...Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,typeof value?.[key]==='number'&&Number.isFinite(value[key])?Math.round(clamp(value[key])):fallback])),...(value?.fixedHeight===true?{fixedHeight:true}:{})};}
 function resize(start,dx,dy){return {width:dx?clamp((start.width+dx*2)/start.baseWidth*100):start.size.width,height:dy?clamp((start.height+dy*2)/start.baseHeight*100):start.size.height};}
 const validKind=key=>typeof key==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(key);
 function read(value={}){const sizes={};for(const [key,size]of Object.entries(value?.sizes&&typeof value.sizes==='object'?value.sizes:{}).slice(0,64))if(validKind(key))sizes[key]=normalize(size);return {version:2,shared:value?.shared!==false,common:normalize(value?.common||value),sizes};}
 function forKind(state,kind='settings'){return normalize(state.shared?state.common:state.sizes[kind]||state.common);}
 function withSize(state,kind,value){const next=read(state);if(next.shared)next.common=normalize(value);else if(validKind(kind))next.sizes[kind]=normalize(value);return next;}
 function sharing(state,shared,kind='settings'){const next=read(state);if(shared&&!next.shared)next.common=forKind(next,kind);next.shared=Boolean(shared);return next;}
 return {defaults,minimum,maximum,key:'orbit-popup-size-v1',normalize,resize,read,forKind,withSize,sharing};
});
