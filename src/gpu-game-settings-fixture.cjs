/* Isolated validation data. Never connects to the installed GPU app. */
module.exports=()=>{
 const apps=['Overwatch 2','Palworld'].map(game=>({game,displayName:game,isCreativeApp:false,opsSupported:true,optimizationProfiles:{ac:{currentState:'UNOPTIMIZED',availablePresets:['Performance','Balanced','Recommended','Quality']}}}));
 let calls=0,mode='ready',reads=0,canceled=0;const pending=new Set();
 return {setMode(value){mode=value;},get stats(){return {reads,canceled,pending:pending.size};},close(){for(const reject of pending){canceled++;reject(Error('NVIDIA App connection closed.'));}pending.clear();},async call(name,input){
  if(name==='nvapp_client_get_applications'){reads++;if(mode==='pending')await new Promise((_resolve,reject)=>pending.add(reject));if(mode==='error')throw Error('NVIDIA App took too long to respond. Try again, or open NVIDIA App to check its local access settings.');return {applications:input.game?apps.filter(a=>a.game===input.game):apps};}
  if(name!=='nvapp_client_set_game_optimization')throw Error('Unsupported fixture operation');calls++;return {success:true,message:'Sample NVIDIA preset applied to the isolated fixture.',fixtureCalls:calls};
 }};
};
