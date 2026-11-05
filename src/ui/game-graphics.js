/* Compact, typed controls; config validation and change plans remain in the main process. */
(()=>{
 function label(field,value){return value===null?'Not set':field.options?.find(o=>o.value===value)?.label||String(value);}
 function row(field,choices,index){
  const chosen=Object.hasOwn(choices,field.id)?choices[field.id]:undefined;
  const help='graphics-help-'+index,id='graphics-choice-'+index,attributes=' id="'+id+'" aria-label="'+esc(field.label)+'. Current: '+esc(label(field,field.current))+'" aria-describedby="'+help+'"';
  const control=field.type==='number'
   ?'<input type="number" inputmode="numeric"'+attributes+' data-graphics-id="'+esc(field.id)+'" min="'+field.min+'" max="'+field.max+'" step="1" placeholder="Keep current" value="'+(chosen===undefined?'':chosen)+'">'
   :'<select'+attributes+' data-graphics-id="'+esc(field.id)+'"><option value="">Keep current</option>'+field.options.map(o=>'<option value="'+esc(JSON.stringify(o.value))+'"'+(chosen===o.value?' selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select>';
  return '<div class="graphics-setting"><span class="graphics-label"><label for="'+id+'">'+esc(field.label)+'</label>'+OrbitHelp.markup(field.label,field.detail)+'<span class="graphics-accessible-help" id="'+help+'">'+esc(field.detail)+'</span></span><span class="graphics-current"><small>Current</small>'+esc(label(field,field.current))+'</span><span class="graphics-new"><small>New</small>'+control+'</span></div>';
 }
 function render(fields,choices){
  const regular=fields.filter(f=>!f.advanced),advanced=fields.filter(f=>f.advanced);
  const heading='<div class="graphics-column-headings" aria-hidden="true"><span>Setting</span><span>Current</span><span>New value</span></div>';
  return heading+'<div class="graphics-settings">'+regular.map((f,i)=>row(f,choices,i)).join('')+'</div>'+(advanced.length?'<details class="graphics-advanced"><summary>Advanced</summary><div class="graphics-settings">'+advanced.map((f,i)=>row(f,choices,regular.length+i)).join('')+'</div></details>':'');
 }
 function read(root,fields){
  const choices={};
  for(const input of root.querySelectorAll('[data-graphics-id]')){
   const field=fields.find(f=>f.id===input.dataset.graphicsId);
   if(!field)throw Error('Choose an available graphics setting.');
   if(field.type==='number'&&!input.checkValidity())throw Error('Use a whole number from '+field.min+' to '+field.max+' for '+field.label+'.');
   if(input.value==='')continue;
   choices[field.id]=field.type==='number'?Number(input.value):JSON.parse(input.value);
  }
  return choices;
 }
 window.OrbitGraphicsEditor={render,read};
})();
