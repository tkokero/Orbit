(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitLaunchRecovery=factory();})(globalThis,()=>{
 function classify(message=''){
  const m=String(message);
  if(/SteamVR/i.test(m))return {title:'SteamVR needs attention',detail:'Open SteamVR, or turn off its preparation step in this launch option.',locate:false,settings:true,runtime:true,primary:'runtime'};
  if(/EACCES|EPERM|access.*denied|permission/i.test(m))return {title:'Windows blocked access',detail:'Check the executable’s permissions or open the original launcher. Orbit will not request administrator access automatically.',locate:false,settings:true,primary:'settings'};
  if(/launch mode|launch option|launch settings|Arguments|starting folder requires/i.test(m))return {title:'Review this launch option',detail:'Choose an available launch mode or correct the saved target and arguments.',locate:false,settings:true,primary:'settings'};
  if(/(?:launcher|client).*(?:unavailable|missing|not found|could not|not installed|not running)|Steam.*required|(?:Epic Games|Ubisoft Connect|Battle\.net|GOG Galaxy|EA app).*(?:unavailable|missing|not found|not installed)/i.test(m))return {title:'The launcher is unavailable',detail:'Open or install the original launcher and sign in, then try again.',locate:false,settings:true,primary:'launcher'};
  if(/starting folder|game drive|drive or folder|reconnect/i.test(m))return {title:'The game folder is unavailable',detail:'Reconnect its drive or update the launch folder, then try again.',locate:true,settings:true,primary:'settings'};
  if(/ENOENT|executable.*(?:missing|unavailable|moved)|Choose.*executable|not found/i.test(m))return {title:'The executable could not be found',detail:'Locate the game’s current executable, then try again.',locate:true,settings:true,primary:'locate'};
  return {title:'The launch did not complete',detail:'Review the launch settings or open the original launcher, then try again.',locate:false,settings:true,primary:'settings'};
 }
 return {classify};
});
