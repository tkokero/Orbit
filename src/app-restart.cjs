function restartArguments({packaged,appPath,debug=false}){return [...(!packaged?[appPath]:[]),'--restart-orbit',...(debug?['--dev-debug']:[])];}
class AppRestart{
 constructor({app,args,canRestart,prepare,setRestarting,clear}){Object.assign(this,{app,args,canRestart,prepare,setRestarting,clear});}
 restart(){if(!this.pending)this.pending=this.run().finally(()=>{this.pending=null;});return this.pending;}
 async run(){
  if(!await this.canRestart())throw Error('Finish the current Orbit operation before restarting.');
  let marked=false;
  try{this.setRestarting(true);marked=true;await this.prepare();this.app.relaunch({args:this.args});this.app.quit();}
  catch(error){if(marked){this.setRestarting(false);await this.clear().catch(()=>{});}throw error;}
 }
}
module.exports={AppRestart,restartArguments};
