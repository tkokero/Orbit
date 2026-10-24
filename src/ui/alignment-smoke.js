(async()=>{
 const checks=[],check=(name,passed)=>checks.push({name,passed:Boolean(passed)}),wait=ms=>new Promise(r=>setTimeout(r,ms));
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitFeatures.setCouch(false);await orbitShell.activate('library');
 const secret=localStorage.getItem('orbit-secret-startups');for(const id of ['singularity','supernova','bigbang'])OrbitStartup.unlock(id);showSettings();document.querySelector('#tab-appearance').click();await wait(80);
 const theme=OrbitTheme.builtins.find(t=>t.id===window.__alignmentTheme);OrbitTheme.apply(theme,document.documentElement);
 const cards=[...document.querySelectorAll('.startup-choice')],fits=cards.every(card=>{const icon=card.querySelector('.startup-choice-icon').getBoundingClientRect(),label=card.querySelector('strong').getBoundingClientRect(),r=card.getBoundingClientRect();return icon.right+10<=label.left&&icon.bottom<=r.bottom-10&&label.right<=r.right-10&&label.top>=r.top&&label.bottom<=r.bottom-10;});
 check('startup cards keep icons and labels in separate, unclipped tracks',fits&&cards.length===10);
 check('startup icons reset legacy rotation and inherited dark-on-dark ink',cards.filter(c=>!c.disabled).every(c=>{const e=c.querySelector('.startup-choice-icon'),style=getComputedStyle(e),r=e.getBoundingClientRect();return style.transform==='none'&&e.offsetWidth===64&&e.offsetHeight===64&&style.color!==style.backgroundColor;}));
 check('custom video uses the same compact card footprint',Math.abs(cards.at(-1).offsetWidth-cards[0].offsetWidth)<2&&cards[0].offsetHeight<=120);
 window.OrbitControllerFocus.cancel();document.querySelector('#startup-choices').scrollIntoView({block:'center',behavior:'instant'});await wait(30);window.__alignmentCapture='startup';
 return checks;
})()
