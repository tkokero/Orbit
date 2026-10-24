(function(root){
 function parse(text){
  const args=[];let token='',quoted=false,started=false;
  for(let i=0;i<text.length;i++){
   const c=text[i];
   if(c==='\\'){
    let count=1;while(text[i+1]==='\\'){count++;i++;}
    if(text[i+1]==='"'){token+='\\'.repeat(Math.floor(count/2));i++;if(count%2)token+='"';else quoted=!quoted;}
    else token+='\\'.repeat(count);
    started=true;
   }else if(c==='"'){quoted=!quoted;started=true;}
   else if(/\s/.test(c)&&!quoted){if(started){args.push(token);token='';started=false;}}
   else{token+=c;started=true;}
  }
  if(quoted)throw Error('Close the double quote in your launch options.');
  if(started)args.push(token);
  return args;
 }
 function format(args){return args.map(arg=>!arg||/[\s"]/.test(arg)?'"'+arg.replace(/(\\*)"/g,'$1$1\\"').replace(/(\\+)$/,'$1$1')+'"':arg).join(' ');}
 const api={parse,format};if(typeof module==='object')module.exports=api;else root.OrbitLaunchArgs=api;
})(globalThis);
