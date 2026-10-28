/* Overlapping space-console notes with a rounded strike, airy swell and natural decay. */
(()=>{
 const enabled=()=>{try{return localStorage.getItem('orbit-startup-sound')==='on';}catch{return false;}};
 const volume=()=>{try{const n=localStorage.getItem('orbit-startup-volume');return n===null?12:Math.max(0,Math.min(30,Number(n)||0));}catch{return 12;}};
 let activeStop=()=>{};
 function play(style,{durationMs}={}){
  activeStop();
  if(!enabled()||!volume()||document.hidden||style==='custom')return()=>{};
  let context,timer,master,closed=false;
  const duration=(durationMs||window.OrbitStartup?.duration?.(style)||(style==='singularity'?5200:style==='supernova'?5400:1750))/1000;
  const hide=()=>{if(document.hidden)stop();};
  const close=()=>{const ending=context;context=null;try{master?.disconnect();master=null;ending?.close().catch(()=>{});}catch{}};
  function stop(){
   if(closed)return;closed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',hide);if(activeStop===stop)activeStop=()=>{};
   try{const now=context.currentTime;master.gain.cancelAndHoldAtTime(now);master.gain.linearRampToValueAtTime(0,now+.09);setTimeout(close,110);}catch{close();}
  }
  try{
   context=new AudioContext();
   const start=context.currentTime+.025,bus=context.createGain(),reverb=context.createConvolver(),wet=context.createGain(),lowCut=context.createBiquadFilter(),filter=context.createBiquadFilter();
   master=context.createGain();master.gain.value=0;master.connect(context.destination);master.gain.setValueAtTime(0,start);master.gain.linearRampToValueAtTime(volume()/100,start+.065);
   // A diffuse room joins the notes into one phrase. No discrete echo or frequency modulation.
   filter.type='lowpass';filter.frequency.value=4800;filter.Q.value=.4;lowCut.type='highpass';lowCut.frequency.value=65;lowCut.Q.value=.5;bus.connect(filter);filter.connect(lowCut);lowCut.connect(master);
   const impulse=context.createBuffer(2,Math.ceil(context.sampleRate*.55),context.sampleRate);let seed=8171;
   const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   for(let channel=0;channel<2;channel++){const samples=impulse.getChannelData(channel);for(let i=0;i<samples.length;i++)samples[i]=(random()*2-1)*Math.pow(1-i/samples.length,3)*.6;}
   reverb.buffer=impulse;wet.gain.value=.2;filter.connect(reverb);reverb.connect(wet);wet.connect(master);
   function voice(hz,at,length,{to=hz,strength=.1,attack=.065,pan=0,kind='sine',detune=0}={}){
    const t=start+at,position=context.createStereoPanner();position.pan.value=pan;position.connect(bus);
    // A short rounded strike and independent overtone decays suggest a soft mallet, not a synth siren.
    function partial(ratio,level,life){
     const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.detune.value=detune;
     oscillator.frequency.setValueAtTime(hz*ratio,t);
     if(to!==hz)oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,to)*ratio,t+length*.75);
     const envelope=new Float32Array(257),rise=Math.min(attack,life*.28)/life;
     for(let i=0;i<envelope.length;i++){
      const p=i/(envelope.length-1),decay=Math.max(0,(p-rise)/(1-rise));
      envelope[i]=strength*level*(p<rise?(1-Math.cos(Math.PI*p/rise))*.5:Math.exp(-3.2*decay)*Math.pow(1-decay,.6));
     }
     gain.gain.setValueCurveAtTime(envelope,t,life);oscillator.connect(gain);gain.connect(position);
     oscillator.start(t);oscillator.stop(t+life+.01);
    }
    partial(1,1,length);
    if(kind==='glass'){partial(2.003,.12,length*.57);partial(3.997,.025,length*.31);}
   }
   function pad(notes,at,length,strength=.045){notes.forEach((hz,i)=>voice(hz,at,length,{strength,attack:.22,pan:(i%2?1:-1)*.42,detune:i%2?2:-2}));}
   function chimes(notes,at,spacing,length=.95,strength=.09){notes.forEach((hz,i)=>voice(hz,at+i*spacing,length,{kind:'glass',strength,attack:.055,pan:i%2?.5:-.5}));}
   function air(at,length,from,to,strength=.06){
    const rate=Math.min(24000,context.sampleRate),noise=context.createBuffer(1,Math.ceil(rate*length),rate),samples=noise.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=random()*2-1;
    const source=context.createBufferSource(),band=context.createBiquadFilter(),gain=context.createGain(),t=start+at;
    source.buffer=noise;band.type='bandpass';band.Q.value=.65;band.frequency.setValueAtTime(from,t);band.frequency.exponentialRampToValueAtTime(to,t+length);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(strength*.65,t+length*.42);gain.gain.exponentialRampToValueAtTime(.0001,t+length);
    source.connect(band);band.connect(gain);gain.connect(bus);source.start(t);source.stop(t+length);
   }
   switch(style){
    case 'magnetar':
     pad([130.81,196,293.66],0,3.8,.045);air(.1,2.7,300,1600,.045);chimes([392,523.25,783.99],2.8,.16,1.1,.07);break;
    case 'pulsar':
     pad([146.83,220,293.66],0,3.8,.04);chimes([587.33,880,587.33,880],.35,.58,.9,.055);chimes([440,659.25,880],2.9,.12,1,.065);break;
    case 'attractor':
     voice(98,.05,3.9,{to:65.41,strength:.07,attack:.5});air(.2,3.2,1300,300,.04);pad([130.81,196,261.63],3.1,1.4,.05);break;
    case 'void':
     air(.1,2.8,600,180,.025);voice(261.63,2.85,1.1,{kind:'glass',strength:.035,attack:.2});break;
    case 'goatkero':
     pad([130.81,196,293.66],0,3.6,.035);
     voice(392,.05,.75,{to:98,strength:.085,attack:.06,pan:-.35});
     voice(98,1.1,.55,{to:293.66,strength:.12,attack:.04});
     voice(174.61,1.95,.36,{to:130.81,strength:.1,kind:'glass'});
     voice(196,2.3,.4,{to:146.83,strength:.09,kind:'glass'});
     chimes([523.25,659.25,783.99,1046.5],3.05,.1,1.3,.085);
     pad([130.81,196,261.63],3.2,2.1,.045);
     voice(130.81,4.4,.65,{to:65.41,strength:.065,attack:.08});break;
    case 'startrail':
     pad([110,165,247],0,1.55);air(0,1.25,500,2200,.065);
     chimes([493.88,659.25,987.77],.27,.14,1.05,.095);voice(82.41,.48,.9,{to:73.42,strength:.11,attack:.1});break;
    case 'constellation':
     pad([146.83,220,293.66],0,1.65,.04);air(.02,1.2,1500,900,.04);
     chimes([587.33,880,1174.66,1760],.13,.14,1.06,.085);voice(73.42,.44,.85,{strength:.09,attack:.12});break;
    case 'warp':
     pad([98,146.83,196],0,1.6,.045);air(.02,1.2,220,3000,.11);
     voice(73.42,.05,.85,{to:110,strength:.08,attack:.2});
     chimes([440,659.25,880],.52,.085,.95,.1);voice(73.42,.54,.9,{to:55,strength:.12,attack:.08});break;
    case 'eclipse':
     pad([130.81,196,261.63],0,1.65,.05);air(0,1.35,1200,350,.055);
     chimes([392,523.25,783.99],.32,.17,1.05,.085);voice(65.41,.6,.95,{strength:.1,attack:.15});break;
    case 'nebula':
     pad([130.81,196,293.66],0,3,.045);air(.08,2.6,380,1400,.05);
     chimes([523.25,659.25,987.77,1318.51],.18,.24,1.35,.085);
     voice(87.31,.82,1.5,{to:65.41,strength:.1,attack:.18});break;
    case 'singularity':
     pad([82.41,123.47,164.81],0,3.1,.045);chimes([987.77,739.99,493.88],.2,.35,1.5,.07);
     voice(196,.55,2.35,{to:65.41,strength:.07,attack:.7,pan:-.25});air(.35,2.5,2400,180,.1);
     voice(233.08,2.05,1.55,{strength:.025,attack:.5,pan:.2});
     // The notes fall into the collapse, then open into one joined arrival chord.
     voice(65.41,3.05,1.8,{to:58.27,strength:.14,attack:.1});pad([116.54,174.61,261.63],3.08,1.95,.065);
     chimes([523.25,783.99,1046.5],3.16,.12,1.45,.105);air(3.04,1.7,180,1700,.085);break;
    case 'supernova':
     pad([98,146.83,196],0,3.2,.045);air(.15,3.05,160,2800,.1);
     chimes([261.63,392,523.25,783.99],.55,.36,1.4,.075);voice(98,.3,2.6,{to:196,strength:.07,attack:.8});
     voice(392,2.2,1.5,{strength:.026,attack:.5,pan:-.2});
     voice(73.42,3.15,1.7,{to:49,strength:.15,attack:.09});pad([130.81,196,261.63,329.63],3.17,2,.065);
     chimes([783.99,1046.5,1567.98],3.19,.11,1.55,.11);air(3.15,1.8,2400,380,.13);break;
    case 'bigbang':
     // One connected phrase follows the small beginnings, inward pull and final bloom.
     pad([130.81,196,293.66],0,3.4,.04);
     chimes([523.25,783.99,1046.5],.12,.18,1.3,.08);air(.45,2.05,450,1800,.045);
     chimes([1174.66,880,587.33],1.8,.28,1.65,.065);
     pad([98,146.83,196],2.55,2.7,.04);voice(196,2.8,2.1,{to:65.41,strength:.065,attack:.65});
     air(2.8,2.15,2200,180,.075);
     voice(65.41,4.97,1.9,{to:49,strength:.145,attack:.1});air(4.96,2,1900,320,.1);
     pad([130.81,196,261.63,329.63],4.98,2.35,.06);
     chimes([523.25,783.99,1046.5,1567.98],5.03,.14,1.7,.095);
     voice(659.25,6.1,1.25,{kind:'glass',strength:.04,attack:.09,pan:.3});break;
    default:
     pad([130.81,196,293.66],0,1.65,.05);air(.02,1.2,450,1700,.065);
     chimes([523.25,783.99,1046.5],.12,.15,1.12,.105);
     voice(87.31,.34,.98,{to:65.41,strength:.12,attack:.09});
   }
   // Natural tail fades before the scene ends, including the longer secret sequences.
   master.gain.setValueAtTime(volume()/100,start+duration-.28);master.gain.linearRampToValueAtTime(0,start+duration);
   document.addEventListener('visibilitychange',hide);activeStop=stop;context.resume().catch(stop);timer=setTimeout(stop,(duration+.04)*1000);
   return stop;
  }catch{stop();return()=>{};}
 }
 window.OrbitStartupAudio={play,enabled,volume};
})();
