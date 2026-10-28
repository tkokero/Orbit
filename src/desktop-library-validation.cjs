/* Runs only from the isolated, hidden packaged smoke profile. */
module.exports=async function({window}){
  return window.webContents.executeJavaScript(`(async()=>{
    const checks=[],check=(name,passed)=>checks.push({name,passed:Boolean(passed)});
    closeModal();const ids=state.games.slice(0,2).map(g=>g.id),before=structuredClone(state.games.find(g=>g.id===ids[0]));
    let result=await orbit.bulkLibrary({ids,action:'favorite',value:!before.favorite});
    check('packaged bulk IPC updates all selected favorites',result.token&&ids.every(id=>result.library.games.find(g=>g.id===id).favorite===!before.favorite));
    let rejected=false;try{await orbit.bulkLibrary({ids:[ids[0],'not-an-entry'],action:'hidden',value:true});}catch{rejected=true;}
    check('packaged bulk IPC rejects unknown entries',rejected);
    let restored=await orbit.undoLibrary(result.token);
    check('packaged Undo restores previous favorites and preserves other fields',restored.library.games.find(g=>g.id===ids[0]).favorite===before.favorite&&restored.library.games.find(g=>g.id===ids[0]).hidden===before.hidden);
    const names=await orbit.collections();if(names.length){
      result=await orbit.bulkLibrary({ids,action:'collection-add',value:names[0]});
      check('packaged collection batch uses real saved collections',ids.every(id=>result.library.games.find(g=>g.id===id).collections.includes(names[0])));
      if(result.token)restored=await orbit.undoLibrary(result.token);
    }
    result=await orbit.bulkLibrary({ids,action:'tag-add',value:'Bulk validation'});
    check('packaged tag batch updates selected entries',ids.every(id=>result.library.games.find(g=>g.id===id).tags.includes('Bulk validation')));
    if(result.token)restored=await orbit.undoLibrary(result.token);
    result=await orbit.bulkLibrary({ids,action:'hidden',value:!before.hidden});
    check('packaged hide batch is reversible',ids.every(id=>result.library.games.find(g=>g.id===id).hidden===!before.hidden));
    if(result.token)restored=await orbit.undoLibrary(result.token);
    check('packaged Undo restores tags, collections and visibility',JSON.stringify(restored.library.games.find(g=>g.id===ids[0]).tags)===JSON.stringify(before.tags)&&JSON.stringify(restored.library.games.find(g=>g.id===ids[0]).collections)===JSON.stringify(before.collections)&&restored.library.games.find(g=>g.id===ids[0]).hidden===before.hidden);
    const collection='Validation collection',newName='Renamed validation collection';
    await orbit.saveCollection({name:collection});
    await orbit.assignCollections({id:ids[0],names:[...new Set([...before.collections,collection])]});
    const changed=await orbit.editCollection({key:'manual:'+encodeURIComponent(collection),renameTo:newName,style:{icon:'gamepad',color:'green'}});
    const key='manual:'+encodeURIComponent(newName),member=changed.library.games.find(g=>g.id===ids[0]);
    check('packaged collection rename preserves game membership',member.collections.includes(newName)&&!member.collections.includes(collection)&&before.collections.every(c=>member.collections.includes(c)));
    const detail=await orbit.collectionDetails();check('packaged collection icons and colors persist through native IPC',detail.styles[key].icon==='gamepad'&&detail.styles[key].color==='green');
    await orbit.saveCollection({name:newName,remove:true});await orbit.assignCollections({id:ids[0],names:before.collections});
    orbitFeatures.setCouch(false);await orbitShell.activate('library');OrbitCollectionUI.clearFilters();
    orbitCare.setFilters({tag:'Validation missing tag',hours:'under10'});state.source='Steam';state.search='validation missing search';render();
    check('packaged filter chips represent all active constraints',document.querySelectorAll('[data-remove-filter]').length===4&&filtered().length===0);
    document.querySelector('#empty-action').click();
    check('packaged empty-results action clears every filtering layer',!state.search&&!state.source&&!document.querySelector('#collection-filter').value&&Object.values(orbitCare.getFilters()).every(v=>!v||v==='any')&&filtered().length>0);
    return checks;
  })()`);
};
