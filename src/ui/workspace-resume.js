/* A fresh process uses saved choices; a sleeping renderer uses its exact checkpoint. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitWorkspaceResume=api;})(globalThis,()=>{
 function plan({checkpoint,current,restored=false,remember=true}){
  const valid=['library','store','downloads','friends','tools'].includes(checkpoint);
  if(!valid||!restored&&!remember)return {workspace:null,scroll:false};
  const external=['store','downloads'].includes(checkpoint),workspace=restored||external?checkpoint:null;
  return {workspace,scroll:Boolean(workspace||checkpoint===current)};
 }
 return {plan};
});
