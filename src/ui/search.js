/* Shared by library and quick launch; indexes are built only when entries change. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitSearch=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 function index(game){const names=[game.title,...(game.aliases||[]),...(game.versions||[]).map(v=>v.title).filter(Boolean)];return {compact:names.map(n=>normalize(n).replaceAll(' ','')),text:normalize([...names,...(game.sources||[]),...(game.collections||[]),...(game.tags||[]),...(game.metadata?.genres||[])].join(' ')),short:names.map(n=>normalize(n).split(' ').map(w=>/^\d+$/.test(w)?w:w[0]||'').join(''))};}
 function matcher(query){const q=normalize(query);if(!q)return()=>true;const words=q.split(' '),compact=q.replaceAll(' ','');return game=>{const data=game.searchIndex||index(game);return words.every(word=>data.text.includes(word))||data.short.some(s=>s===compact)||data.compact.some(s=>s.includes(compact));};}
 function matches(game,query){return matcher(query)(game);}
 return {normalize,index,matches,matcher};
});
