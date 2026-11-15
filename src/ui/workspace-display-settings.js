/* The optional library's display choices belong in the shared Settings popup. */
window.OrbitWorkspaceDisplaySettings={
 mount(host,prefs,save){
  let section=host.querySelector('#workspace-library-settings');
  if(!section){section=document.createElement('section');section.id='workspace-library-settings';section.innerHTML='<h3>Library cards</h3><div class="workspace-library-controls"><label>Artwork<select data-ws-pref="art" aria-label="Library artwork"><option value="covers">Covers</option><option value="banners">Banners</option><option value="list">List</option></select></label>'+[['size','Card size',130,240,10],['spacing','Spacing',8,28,4]].map(([key,label,min,max,step])=>'<label><span>'+label+'<output data-workspace-display="'+key+'"></output></span><input type="range" data-ws-pref="'+key+'" aria-label="'+label+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>').join('')+'</div>';host.append(section);
   section.oninput=e=>{const key=e.target.dataset.wsPref;if(key==='size'||key==='spacing')section.querySelector('[data-workspace-display="'+key+'"]').textContent=e.target.value+'px';};
   section.onchange=e=>{const key=e.target.dataset.wsPref;if(key)save({[key]:key==='art'?e.target.value:Number(e.target.value)});};
  }
  section.hidden=prefs.mode!=='workspace';for(const input of section.querySelectorAll('[data-ws-pref]'))input.value=String(prefs[input.dataset.wsPref]);for(const output of section.querySelectorAll('[data-workspace-display]'))output.textContent=prefs[output.dataset.workspaceDisplay]+'px';
 }
};
