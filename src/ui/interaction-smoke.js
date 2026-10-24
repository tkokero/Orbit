(async()=>{
 const checks=[],check=(name,value)=>checks.push({name,passed:Boolean(value),...(!value?{active:document.activeElement.outerHTML.slice(0,300),manager:OrbitController.snapshot()}: {})}),wait=ms=>new Promise(r=>setTimeout(r,ms)),F=OrbitControllerFocus;
 const pad=(button=-1)=>({index:0,id:'DualSense Wireless Controller',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===button}))});let time=performance.now();
 function press(button){OrbitController.feed([pad()],time+=20);OrbitController.feed([pad(button)],time+=20);OrbitController.feed([pad()],time+=20);}
 const original=OrbitController.config;OrbitController.saveConfig({...original,swap:false,bindings:OrbitControllerCore.bindings()});OrbitController.feed([pad()],time);
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());OrbitCouch.open();OrbitCouch.skipEntry();OrbitCouch.act('settings');await wait(160);document.querySelector('[data-settings-category=controls]').click();await wait(20);
 let panel=document.querySelector('[data-couch-settings-panel]'),form=panel.querySelector('[data-controller-config]');F.focus(document.querySelector('[data-settings-category=controls]'));press(15);
 check('right from Controller enters the deadzone setting',document.activeElement===form.elements.deadzone);
 const deadzone=Number(form.elements.deadzone.value);press(14);check('left adjusts the slider without leaving the setting',document.activeElement===form.elements.deadzone&&Number(form.elements.deadzone.value)<deadzone);
 press(13);check('down from deadzone reaches initial repeat delay',document.activeElement===form.elements.delay);
 const delay=Number(form.elements.delay.value);press(15);check('right adjusts a number without focusing a utility button',document.activeElement===form.elements.delay&&Number(form.elements.delay.value)===delay+10);
 press(13);check('down from initial delay reaches repeat interval',document.activeElement===form.elements.interval);press(13);check('down reaches Swap Select / Back',document.activeElement===form.elements.swap);
 press(13);check('down enters the first binding',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-confirm']);const bindingColumns=getComputedStyle(form.querySelector('.controller-binding-fields>div')).gridTemplateColumns.split(' ').length;if(bindingColumns>1){press(15);check('right reaches the Back binding in the same row',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-back']);press(13);check('down keeps the right binding column',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-wheel']);press(13);}else{for(const key of ['back','menu','wheel','previous','next']){press(13);check('narrow settings reaches binding '+key,document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-'+key]);}}
 check('settings reaches Next tab in reading order',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-next']);press(13);check('down reaches Reset after the bindings',document.activeElement.matches('[data-reset-bindings]'));press(12);check('up from a full-width row retains the binding column',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-next']);
 press(1);check('Circle returns to the active category without leaving Settings',document.activeElement.matches('[data-settings-category=controls]')&&OrbitCouch.route==='settings');press(15);check('right returns to the remembered setting',document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-next']);
 press(0);await wait(30);check('Cross opens a controller binding dropdown',document.querySelector('.controller-select[open]'));press(1);await wait(30);check('Circle closes the dropdown and restores its trigger',!document.querySelector('.controller-select[open]')&&document.activeElement.closest('label')?.querySelector('select')===form.elements['binding-next']);
 for(const name of ['appearance','startup','sound','library','window','connections','privacy','updates','performance']){
  document.querySelector('[data-settings-category='+name+']').click();await wait(name==='privacy'?120:25);panel=document.querySelector('[data-couch-settings-panel]');const primary=F.controls(panel).filter(e=>!e.matches('.info-button'));let safe=true;
  for(const input of primary){F.focus(input);press(13);safe&&=panel.contains(document.activeElement);F.focus(input);press(12);safe&&=panel.contains(document.activeElement);}
  check(name+' up/down stays inside its settings content',primary.length>0&&safe);
 }
 document.querySelector('[data-settings-category=privacy]').click();await wait(120);panel=document.querySelector('[data-couch-settings-panel]');const summary=panel.querySelector('summary');F.focus(summary);press(0);await wait(20);check('Cross expands Discord visibility and game choices',summary.parentElement.open);press(13);check('down reaches the first expanded Discord option',document.activeElement.name==='showNames');
 document.querySelector('[data-settings-category=controls]').click();await wait(30);F.focus(document.querySelector('[name=delay]'));window.__interactionCapture='settings';
 window.__interactionChecks=checks;
 window.__interactionPress=press;
 window.__interactionOriginal=original;
 return checks;
})()
