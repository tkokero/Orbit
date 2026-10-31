(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitPopupSize=api;})(globalThis,()=>{
 const defaults={width:100,height:100},minimum=20,maximum=200;
 const clamp=value=>Math.max(minimum,Math.min(maximum,value));
 function normalize(value={}){return {...Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,typeof value?.[key]==='number'&&Number.isFinite(value[key])?Math.round(clamp(value[key])):fallback])),...(value?.fixedHeight===true?{fixedHeight:true}:{}),...(['auto','manual'].includes(value?.mode)?{mode:value.mode}:{}),...(Number.isFinite(value?.baseWidth)?{baseWidth:Math.max(320,Math.min(1280,Math.round(value.baseWidth)))}:{})};}
 function resize(start,dx,dy){return {width:dx?clamp((start.width+dx*2)/start.baseWidth*100):start.size.width,height:dy?clamp((start.height+dy*2)/start.baseHeight*100):start.size.height};}
 const validKind=key=>typeof key==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(key);
 function read(value={}){const sizes={};for(const [key,size]of Object.entries(value?.sizes&&typeof value.sizes==='object'?value.sizes:{}).slice(0,64))if(validKind(key))sizes[key]=normalize(size);return {version:2,shared:value?.shared!==false,common:normalize(value?.common||value),sizes};}
 function forKind(state,kind='settings'){return normalize(state.shared?state.common:state.sizes[kind]||defaults);}
 function automatic(state,kind='settings'){const size=forKind(state,kind);if(size.mode)return size.mode==='auto';if(!state.shared&&Object.hasOwn(state.sizes,kind))return false;return size.width===100&&size.height===100&&!size.fixedHeight;}
 function preset(kind){return {width:({settings:1120,'game-details':1120,'launch-mode':960,news:1040,activity:960,'menu-search-orbit':880,'menu-release-notes':840,'menu-steamvr':720,confirmation:420,'game-actions':500,choices:400,keyboard:560,installation:720,storage:960})[kind]||720};}
 function withSize(state,kind,value){const next=read(state);if(next.shared)next.common=normalize(value);else if(validKind(kind))next.sizes[kind]=normalize(value);return next;}
 function sharing(state,shared,kind='settings'){const next=read(state),wasAuto=automatic(next,kind),current=forKind(next,kind);if(shared&&!next.shared){next.common=current;if(!wasAuto&&current.width===100&&current.height===100&&!current.fixedHeight)next.common.mode='manual';}if(!shared&&next.shared&&validKind(kind)&&!Object.hasOwn(next.sizes,kind))next.sizes[kind]={...current,...(wasAuto?{mode:'auto'}:{})};next.shared=Boolean(shared);return next;}
 return {defaults,minimum,maximum,key:'orbit-popup-size-v1',normalize,resize,read,forKind,withSize,sharing,automatic,preset};
});
