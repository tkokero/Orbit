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
    if(kind==='piano'){partial(2,.24,length*.55);partial(3,.07,length*.32);partial(4.01,.018,length*.18);}
    if(kind==='strings'){partial(2,.22,length*.92);partial(3,.08,length*.78);}
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
    case 'afterglow-encore': {
     // Original B-minor to D-major miniature: exposed piano, heartbeat, band lift, arrival.
     // Damped, slightly inharmonic piano strings and a short hammer attack are synthesized locally.
     filter.frequency.value=Math.min(10500,context.sampleRate*.45);lowCut.frequency.value=38;wet.gain.value=.19;
     const beat=.41,hz=n=>440*2**((n-69)/12),hammer=context.createBuffer(1,Math.ceil(context.sampleRate*.045),context.sampleRate);
     for(let i=0;i<hammer.length;i++)hammer.getChannelData(0)[i]=(random()*2-1)*Math.exp(-i/(context.sampleRate*.006));
     function piano(note,at,length,velocity=.14,pan=0){
      const t=start+at,f=hz(note),position=context.createStereoPanner();position.pan.value=pan;position.connect(bus);
      // Upper partials decay sooner; bass notes retain a quiet second string beating against the first.
      const partials=[1,.36,.16,.065,.026,.009];partials.forEach((level,i)=>{
       const osc=context.createOscillator(),gain=context.createGain(),life=Math.max(.12,length/(1+i*.43));
       osc.frequency.value=f*(i+1)*Math.sqrt(1+.00011*i*i);osc.detune.value=i%2?1.4:-.8;
       gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(velocity*level,t+.0035);gain.gain.exponentialRampToValueAtTime(velocity*level*.26,t+Math.min(.18,life*.3));gain.gain.exponentialRampToValueAtTime(.00001,t+life);
       osc.connect(gain);gain.connect(position);osc.start(t);osc.stop(t+life+.01);
      });
      const source=context.createBufferSource(),tone=context.createBiquadFilter(),strike=context.createGain();source.buffer=hammer;tone.type='bandpass';tone.frequency.value=Math.min(5500,f*3);tone.Q.value=.6;strike.gain.value=velocity*.15;source.connect(tone);tone.connect(strike);strike.connect(position);source.start(t);source.stop(t+.046);
     }
     function strings(notes,at,length,strength=.012){
      notes.forEach((note,i)=>{for(const side of [-1,1]){
       const t=start+at,osc=context.createOscillator(),gain=context.createGain(),tone=context.createBiquadFilter(),position=context.createStereoPanner();osc.type='sawtooth';osc.frequency.value=hz(note);osc.detune.value=side*4;position.pan.value=side*.52;tone.type='lowpass';tone.frequency.value=1250+i*190;tone.Q.value=.3;
       gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(strength,t+.34);gain.gain.setValueAtTime(strength*.85,t+length*.65);gain.gain.linearRampToValueAtTime(0,t+length);osc.connect(tone);tone.connect(gain);gain.connect(position);position.connect(bus);osc.start(t);osc.stop(t+length+.01);
      }});
     }
     // Bm9 / Gmaj9 / Em9 / A7sus4, A7 -> Dmaj9. Different harmony from Afterglow.
     const bars=[[47,54,61,62,66],[43,54,57,59,62],[40,55,59,62,66],[45,55,62,64,69]];
     bars.forEach((chord,bar)=>{
      const at=.055+bar*4*beat;piano(chord[0],at,1.65,.115,-.3);
      for(let i=1;i<5;i++){piano(chord[i],at+(i-1)*beat/2,1.3,.068+i*.003,-.22+i*.09);if(bar<3)piano(chord[5-i]+12,at+(i+3)*beat/2,.92,.048,.25);}
      if(bar>=2){strings(chord.slice(1),at,1.75);voice(hz(chord[0]-12),at,1.35,{strength:.065,attack:.018,pan:-.1});}
     });
     piano(61,6.18,.62,.082,.12); // suspended D resolves to C-sharp in the dominant.
     [[0,78],[1,81],[1.75,85],[2.5,83],[3.25,81],[4,78],[4.75,76],[5.5,74],[6.5,78],[7.5,81],[8,83],[8.75,86],[9.5,85],[10.25,83],[11,78],[12,81],[12.75,79],[13.5,76],[14.5,73],[15.5,76]].forEach(([tick,n],i)=>piano(n,.09+tick*beat,.95,i<7?.13:i<14?.165:.14,.12));
     // A restrained double pulse enters with the heartbeat; the fuller rhythm follows the sky cut.
     for(const at of [2.15,2.36,2.97,3.18])voice(68,at,.13,{to:46,strength:.055,attack:.006});
     for(let i=8;i<16;i++){
      const at=.055+i*beat;
      if(i%4===0||i%4===2)voice(120,at,.22,{to:47,strength:.16,attack:.003});
      if(i%4===1||i%4===3){air(at,.14,3100,1250,.12);voice(190,at,.085,{strength:.035,attack:.003});}
      air(at,.04,8500,6300,.019);if(i>=12)air(at+beat/2,.033,9200,6800,.014);
     }
     strings([54,61,64,69],6.67,1.18,.015);[38,50,57,61,64,66,74].forEach((n,i)=>piano(n,6.69+i*.023,1.12,i<2?.105:.083,(i-3)*.10));
     break;
    }
    case 'afterglow': {
     // Original short opening arrangement. Acoustic attack, sustained strings and band rhythm;
     // no glass chimes, pitch swoops, UI pings or recorded material from the reference songs.
     filter.frequency.value=Math.min(11500,context.sampleRate*.45);lowCut.frequency.value=42;wet.gain.value=.14;
     const beat=.375,hz=n=>440*2**((n-69)/12),pianoWave=context.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.48,.25,.13,.07,.04,.022,.01])),stringWave=context.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.38,.25,.15,.10,.07,.04,.02]));
     function piano(note,at,length,velocity=.17,pan=0){
      const t=start+at,osc=context.createOscillator(),gain=context.createGain(),tone=context.createBiquadFilter(),position=context.createStereoPanner();osc.setPeriodicWave(pianoWave);osc.frequency.value=hz(note);position.pan.value=pan;tone.type='lowpass';tone.frequency.setValueAtTime(2600+velocity*18000,t);tone.frequency.exponentialRampToValueAtTime(1100,t+length);tone.Q.value=.25;
      gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(velocity,t+.004);gain.gain.exponentialRampToValueAtTime(velocity*.36,t+.14);gain.gain.exponentialRampToValueAtTime(.0001,t+length);osc.connect(tone);tone.connect(gain);gain.connect(position);position.connect(bus);osc.start(t);osc.stop(t+length+.01);
     }
     function strings(notes,at,length){notes.forEach((note,i)=>{for(const side of [-1,1]){const t=start+at,osc=context.createOscillator(),gain=context.createGain(),position=context.createStereoPanner();osc.setPeriodicWave(stringWave);osc.frequency.value=hz(note);osc.detune.value=side*5;position.pan.value=side*.48;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.016,t+.22);gain.gain.setValueAtTime(.013,t+length*.68);gain.gain.linearRampToValueAtTime(0,t+length);osc.connect(gain);gain.connect(position);position.connect(bus);osc.start(t);osc.stop(t+length+.01);}});}
     const chords=[[49,56,63,64],[45,52,59,64],[47,54,61,66],[40,47,56,63]];
     chords.forEach((chord,bar)=>{const at=.045+bar*beat*4;piano(chord[0],at,1.5,.15,-.28);for(let i=1;i<4;i++){piano(chord[i],at+i*beat/2,1.1,.09,-.1+i*.1);if(bar<3)piano(chord[i]+12,at+(i+3)*beat/2,.75,.065,.2);}if(bar>0)strings(chord.slice(1),at,1.55);});
     // A wistful invitation, an ascending response, then a broad E-major arrival.
     [[0,76],[.5,80],[1,83],[2,78],[2.5,76],[3,75],[4,73],[5,76],[5.5,80],[6,78],[7,76],[8,78],[8.5,80],[9,83],[9.5,85],[10,83],[10.5,80],[11,78],[11.5,75],[12,76]].forEach(([tick,n],i)=>piano(n,.055+tick*beat,tick===12?1.5:.9,i%3===0?.20:.155,.10));
     for(let i=4;i<13;i++){const at=.04+i*beat;if(i%4===0||i%4===2)voice(135,at,.19,{to:50,strength:.14,attack:.003});if(i%4===1||i%4===3){air(at,.115,2700,1450,.11);voice(185,at,.075,{strength:.035,attack:.003});}air(at,.045,8800,6100,.023);if(i>=8)air(at+beat/2,.035,9200,6500,.018);}
     strings([64,68,71,78],4.55,1.55);[52,59,64,68,76].forEach((n,i)=>piano(n,4.56+i*.025,1.6,i<2?.12:.085,(i-2)*.11));
     break;
    }
    case 'magnetar':
     pad([130.81,196,293.66],0,3.8,.045);air(.1,2.7,300,1600,.045);chimes([392,523.25,783.99],2.8,.16,1.1,.07);break;
    case 'pulsar':
     pad([146.83,220,293.66],0,3.8,.04);chimes([587.33,880,587.33,880],.35,.58,.9,.055);chimes([440,659.25,880],2.9,.12,1,.065);break;
    case 'attractor':
     voice(98,.05,3.9,{to:65.41,strength:.07,attack:.5});air(.2,3.2,1300,300,.04);pad([130.81,196,261.63],3.1,1.4,.05);break;
    case 'void':
     pad([65.41,98,130.81],.05,3.5,.05);chimes([659.25,493.88,329.63],.3,.44,1.4,.04);
     voice(196,.65,3.1,{to:49,strength:.1,attack:.65});air(.8,2.9,2100,100,.1);
     voice(49,3.55,.38,{to:38,strength:.16,attack:.012});
     voice(58.27,4.3,1.8,{to:43.65,strength:.18,attack:.025});air(4.29,1.6,2100,180,.14);
     pad([116.54,174.61,261.63,349.23],4.33,2.1,.065);chimes([523.25,783.99,1046.5],4.4,.11,1.5,.085);break;
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
