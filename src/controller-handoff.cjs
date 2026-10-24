/* A process is not a ready game window. Keep the launcher visible until both exist. */
class ControllerHandoff {
 constructor({clock=Date.now,focus,notify=()=>{},restore=()=>{},hide=()=>{},hold=()=>{},release=()=>{},transition=async()=>{},grace=600,readyFor=1000,timeout=90000}={}){Object.assign(this,{clock,focus,notify,restore,hide,hold,release,transition,grace,readyFor,timeout});this.current=null;this.serial=0;}
 begin(id){this.cancel();const state={id,token:++this.serial,started:this.clock(),seen:false,handed:false,missing:null,phase:'starting',attempted:false,readySince:null};this.current=state;this.hold();this.publish(state);return state.token;}
 publish(state,phase=state.phase,message=''){if(this.current!==state||state.sent&&state.phase===phase&&state.message===message)return;state.phase=phase;state.message=message;state.sent=true;this.notify({id:state.id,phase,message});}
 cancel(id){if(!id||this.current?.id===id){this.current=null;this.serial++;this.release();}}
 browse(id){if(this.current?.id===id){this.current.attempted=true;this.release();}}
 async switch(state=this.current){if(!state||state!==this.current||state.switching||!state.seen)return false;state.switching=true;state.attempted=true;try{this.publish(state,'transition');await this.transition();if(state!==this.current)return false;this.release();await this.focus(state.id);if(state!==this.current)return false;state.handed=true;this.hide();this.publish(state,'playing');return true;}catch(error){if(state===this.current){this.hold();this.publish(state,'ready','Select Switch to game, or use Alt+Tab if Windows blocks the switch.');}return false;}finally{state.switching=false;}}
 observe(rows){const s=this.current;if(!s)return;const row=rows.find(r=>r.id===s.id);if(row){s.seen=true;s.missing=null;s.pid=row.pid;if(!s.handed){if(['foreground','fullscreen','background','minimized'].includes(row.activity)){
   const identity=String(row.pid||'')+':'+String(row.processStarted||'');if(s.windowIdentity!==identity){s.windowIdentity=identity;s.readySince=this.clock();}s.readySince??=this.clock();if(!s.attempted&&this.clock()-s.readySince>=this.readyFor)this.switch(s);
  }else{s.readySince=null;s.windowIdentity=null;if(s.phase!=='timeout')this.publish(s,'waiting');}}}
  else if(s.seen){s.readySince=null;s.windowIdentity=null;s.missing??=this.clock();if(this.clock()-s.missing>=this.grace&&!s.switching){this.current=null;this.serial++;this.release();this.restore(s.id);return;}}
  if(!s.handed&&this.clock()-s.started>=this.timeout&&!['ready','timeout','transition'].includes(s.phase)){this.release();this.publish(s,'timeout');}
 }
}
module.exports={ControllerHandoff};
