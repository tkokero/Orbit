(function(root,factory){if(typeof module==='object')module.exports=factory();else root.OrbitPadNavigation=factory();})(globalThis,()=>{
 class Input{
  constructor(options={}){this.options={delay:280,interval:85,deadzone:.22,...options};this.command='';this.since=0;this.next=0;}
  consume(pad){this.command=pad.buttons?.[0]?.pressed?'activate':pad.buttons?.[1]?.pressed?'back':'';}
  read(pad,now){let command='',strength=1;const pressed=i=>pad.buttons?.[i]?.pressed;
   if(pressed(0))command='activate';else if(pressed(1))command='back';else if(pressed(12))command='up';else if(pressed(13))command='down';else if(pressed(14))command='left';else if(pressed(15))command='right';else{
    const x=Number(pad.axes?.[0])||0,y=Number(pad.axes?.[1])||0;strength=Math.max(Math.abs(x),Math.abs(y));const horizontal=['left','right'].includes(this.command),vertical=['up','down'].includes(this.command),threshold=(horizontal||vertical)?this.options.deadzone*.7:this.options.deadzone;
    if(strength>=threshold){const across=horizontal&&Math.abs(x)>.23&&Math.abs(x)>=Math.abs(y)-.15||!vertical&&Math.abs(x)>Math.abs(y)||vertical&&Math.abs(x)>Math.abs(y)+.15;command=across?x<0?'left':'right':y<0?'up':'down';}
   }
   if(!command){this.command='';return null;}
   if(command!==this.command){this.command=command;this.since=now;this.next=now+this.options.delay;return command;}
   if(['activate','back'].includes(command)||now<this.next)return null;
   this.next=now+this.options.interval*(strength>.75?1:1.5);return command;
  }
 }
 return {Input};
});
