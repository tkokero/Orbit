(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitDesktopLibraryModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const clamp=(value,min,max,fallback)=>typeof value==='number'&&Number.isFinite(value)?Math.round(Math.max(min,Math.min(max,value))):fallback;
  function preferences(input={}){return {layout:input?.layout==='banners'?'banners':'covers',size:clamp(input?.size,120,260,190),spacing:clamp(input?.spacing,8,32,20),pins:[...new Set((Array.isArray(input?.pins)?input.pins.slice(0,100):[]).filter(x=>typeof x==='string'&&x.length<=512&&/^(manual:|smart:)/.test(x)))].slice(0,70)};}
  class Selection{
    constructor(){this.ids=new Set();this.anchor=null;}
    reconcile(order){const allowed=new Set(order);for(const id of this.ids)if(!allowed.has(id))this.ids.delete(id);if(!allowed.has(this.anchor))this.anchor=null;}
    clear(){this.ids.clear();this.anchor=null;}
    choose(id,order,{range=false,additive=false}={}){
      if(!order.includes(id))return;
      if(range&&this.anchor&&order.includes(this.anchor)){
        if(!additive)this.ids.clear();const a=order.indexOf(this.anchor),b=order.indexOf(id);
        for(const selected of order.slice(Math.min(a,b),Math.max(a,b)+1))this.ids.add(selected);
      }else{if(this.ids.has(id))this.ids.delete(id);else this.ids.add(id);this.anchor=id;}
    }
  }
  return {preferences,Selection};
});
