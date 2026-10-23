// =====================================================================
//  SOUND — synthesized with Web Audio, starts on first tap (M = mute)
// =====================================================================
const SND={ac:null,on:true,last:{}};
// iOS: the ringer switch mutes Web Audio unless the page plays as "media".
// A silent looping <audio> started from a tap switches the session to playback.
function unlockIOS(){
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  if(SND.tag)return;
  try{const n=800,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
    w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
    const a=document.createElement('audio');a.src=URL.createObjectURL(new Blob([b],{type:'audio/wav'}));a.loop=true;a.setAttribute('playsinline','');a.volume=.01;
    const p=a.play();p&&p.catch&&p.catch(()=>{});SND.tag=a}catch(e){}
}
function audioInit(){
  unlockIOS();
  if(SND.ac){if(SND.ac.state!=='running')SND.ac.resume();
    if(!SND.primed){try{const o=SND.ac.createBufferSource();o.buffer=SND.ac.createBuffer(1,1,22050);o.connect(SND.ac.destination);o.start(0);SND.primed=true}catch(e){}}
    return}
  try{const ac=new(window.AudioContext||window.webkitAudioContext)();SND.ac=ac;
    SND.out=ac.createGain();SND.out.gain.value=AUD.mixer.masterGain;setTimeout(prerender,50);
    // softer, less 8-bit: gentle top-end roll-off plus a short room reverb
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=AUD.mixer.lowpassHz;lp.Q.value=AUD.mixer.lowpassQ;
    const comp=ac.createDynamicsCompressor();SND.out.connect(lp);lp.connect(comp);comp.connect(ac.destination);
    const n=ac.sampleRate,b=ac.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;SND.noise=b;
  }catch(e){SND.ac=null}
}
let A_CTX=null,A_OUT=null;
function tone(f0,f1,dur,type,vol,delay=0){
  const ac=A_CTX||SND.ac,t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(A_OUT||SND.out);o.start(t);o.stop(t+dur+.02);
}
function hiss(dur,vol,f0,f1,kind='lowpass',delay=0){
  const ac=A_CTX||SND.ac,t=ac.currentTime+delay,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=SND.noise;s.playbackRate.value=.6+Math.random()*.8;f.type=kind;f.Q.value=1.2;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(A_OUT||SND.out);s.start(t,Math.random()*.5);s.stop(t+dur+.02);
}
// cartoon voice: a buzzy source through two vowel formants, with a pitch glide and a little vibrato
const VOW={a:[850,1250],i:[320,2300],o:[520,900],u:[350,800],e:[550,1900]};
function voice(f0,f1,dur,vow,vol,delay=0){
  const ac=A_CTX||SND.ac,t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain(),vib=ac.createOscillator(),vg=ac.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  vib.frequency.value=18;vg.gain.value=f0*.04;vib.connect(vg);vg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  const[F1,F2]=VOW[vow];for(const[F,k]of[[F1,1],[F2,.6]]){const b=ac.createBiquadFilter();b.type='bandpass';b.frequency.value=F*(f0/450);b.Q.value=6;const bg=ac.createGain();bg.gain.value=k;o.connect(b);b.connect(bg);bg.connect(g)}
  g.connect(A_OUT||SND.out);o.start(t);vib.start(t);o.stop(t+dur+.02);vib.stop(t+dur+.02);
}
function distort(amount){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=(1+amount)*x/(1+amount*Math.abs(x))}return c}
// Frequent sounds are rendered once into small audio buffers (a few variants each) and then played as a
// single buffer node; everything goes through a voice limit so big fights can't flood the audio thread.
const AUD=DATA.audio,PRE=AUD.prerender,BUF={};let ACTIVE=0;const MAX_VOICES=AUD.maxVoices;
async function prerender(){
  if(!SND.ac||SND.pre)return;SND.pre=true;const sr=SND.ac.sampleRate;
  for(const name of PRE){BUF[name]=[];
    for(let v=0;v<3;v++){try{const oc=new OfflineAudioContext(1,Math.ceil(sr*.7),sr);A_CTX=oc;A_OUT=oc.destination;synth(name);A_CTX=null;A_OUT=null;
      BUF[name].push(await oc.startRendering())}catch(e){A_CTX=null;A_OUT=null}}}
}
function sfx(name,gap=.03){
  if(!SND.ac||!SND.on||Flow.paused())return;
  const now=SND.ac.currentTime;if(now-(SND.last[name]||0)<gap)return;SND.last[name]=now;
  const big=AUD.alwaysPlay.includes(name);
  if(ACTIVE>=MAX_VOICES&&!big)return;
  ACTIVE++;setTimeout(()=>ACTIVE--,name in BUF?AUD.voiceHoldMs.prerendered:AUD.voiceHoldMs.live);
  const bs=BUF[name];
  if(bs&&bs.length){const src=SND.ac.createBufferSource();src.buffer=bs[Math.floor(Math.random()*bs.length)];src.playbackRate.value=.96+Math.random()*.08;src.connect(SND.out);src.start();return}
  if(PRE.includes(name))return; // not rendered yet: skip rather than build a live graph
  synth(name);
}
function synth(name){
  const r=()=>1+Math.random()*.12-.06;
  switch(name){
    case'shot':hiss(.06,.06,6000*r(),1800,'bandpass');tone(900*r(),320,.04,'triangle',.022);break;
    case'treeHit':tone(260*r(),180,.05,'triangle',.06);break;
    case'tree':hiss(.22,.18,1800,300,'bandpass');tone(140,70,.18,'triangle',.12);break;
    case'goldTree':hiss(.22,.16,1800,300,'bandpass');[880,1175,1568].forEach((f,i)=>tone(f,f,.18,'triangle',.09,i*.05));break;
    case'flaskHit':hiss(.035,.14,2600*r(),1900,'bandpass');tone(1150*r(),1000,.05,'triangle',.035);tone(380,230,.045,'sine',.05);break;
    case'flask':hiss(.14,.32,7000,1600,'highpass');hiss(.07,.22,1600,500,'bandpass');tone(260,110,.07,'sine',.07);
      for(let i=0;i<16;i++){const f=3000+Math.random()*5500;hiss(.012+Math.random()*.03,.06+Math.random()*.09,f,f*.75,'bandpass',.02+Math.random()*.38)}break;
    case'upgrade':[523,659,784].forEach((f,i)=>tone(f,f*1.01,.16,'triangle',.05,i*.06));break;
    case'level':[523,659,784,1047,1319].forEach((f,i)=>{tone(f,f,.22,'triangle',.11,i*.07);tone(f*2,f*2,.08,'sine',.04,i*.07)});
      [1047,1319,1568].forEach(f=>tone(f,f*1.005,.6,'triangle',.07,.38));for(let i=0;i<6;i++){const f=2500+Math.random()*2500;tone(f,f,.06,'sine',.035,.4+i*.06)}break;
    case'unitDie':voice(560*r(),240,.16,'o',.09);break;
    case'hup':{const p=380+Math.random()*260;voice(p,p*1.5,.12,Math.random()<.5?'u':'i',.07);break}
    case'hya':{const p=440+Math.random()*240;voice(p*1.2,p*.8,.11,Math.random()<.5?'a':'e',.06);hiss(.04,.03,3500,1500,'bandpass');break}
    case'tankSpawn':{const ac=SND.ac,t=ac.currentTime,o=ac.createOscillator(),ws=ac.createWaveShaper(),g=ac.createGain(),lp=ac.createBiquadFilter();
      o.type='sawtooth';o.frequency.setValueAtTime(38,t);o.frequency.linearRampToValueAtTime(95,t+.45);o.frequency.linearRampToValueAtTime(55,t+1);
      ws.curve=distort(30);lp.type='lowpass';lp.frequency.value=700;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32,t+.06);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);
      o.connect(ws);ws.connect(lp);lp.connect(g);g.connect(SND.out);o.start(t);o.stop(t+1.15);
      tone(140,40,.35,'sine',.3);hiss(.18,.2,5000,1200,'bandpass',.02);hiss(.12,.14,3000,900,'bandpass',.3);
      tone(110,108,.5,'square',.06,.5);tone(147,145,.5,'square',.05,.5);break}
    case'giantDie':tone(160,40,.4,'triangle',.12);hiss(.35,.15,900,100);break;
    case'hitBase':tone(110*r(),60,.12,'sine',.12);hiss(.08,.05,600,200);break;
    case'squad':[392,494,587].forEach((f,i)=>tone(f,f,.1,'triangle',.05,i*.04));break;
    case'giant':tone(90,140,.35,'triangle',.12);tone(180,280,.35,'triangle',.04);break;
    case'wave':hiss(.7,.22,300,2400,'bandpass');tone(120,240,.5,'sine',.08);break;
    case'fence':tone(90,60,.2,'triangle',.1);hiss(.15,.12,500,150);break;
    case'rocket':hiss(.9,.18,400,2200,'bandpass');tone(200,600,.8,'triangle',.04);break;
    case'boom':tone(120,30,.6,'sine',.3);hiss(.7,.35,1500,80);break;
    case'tankShot':tone(180,60,.14,'triangle',.09);hiss(.1,.1,2000,400);break;
    case'blast':tone(140,40,.3,'sine',.18);hiss(.3,.18,2200,120);break;
    case'bugle':{const N=[[392,0,.13],[523,.14,.13],[659,.28,.13],[784,.42,.5]];
      for(const[f,d,l]of N){tone(f,f*1.003,l,'sawtooth',.07,d);tone(f,f,l,'triangle',.09,d);tone(f*2,f*2,l*.8,'sine',.025,d)}break}
    case'bigBoom':tone(90,22,1.1,'sine',.45);tone(55,20,1.3,'triangle',.25);hiss(1.3,.5,2600,60);hiss(.25,.35,9000,2500,'highpass');
      for(let i=0;i<6;i++)hiss(.12,.12,1500+Math.random()*2000,300,'bandpass',.15+Math.random()*.5);break;
    case'pop':hiss(.2,.15,2500,400);tone(300,80,.15,'triangle',.06);break;
    case'whoosh':hiss(.26,.16,600,3800,'bandpass',0);hiss(.2,.07,1800,700,'bandpass',.08);break; // tab change: rising then falling air sweep
    case'roll':tone(620,520,.07,'triangle',.06);tone(1240,1040,.05,'sine',.02);break; // opponent search tick
    case'rush':[0,.32].forEach(d=>{tone(220,220,.28,'triangle',.12,d);tone(277,277,.28,'triangle',.08,d)});break;
    case'win':[523,659,784,1047,1319].forEach((f,i)=>tone(f,f,.3,'triangle',.13,i*.11));break;
    case'lose':[392,349,311,262].forEach((f,i)=>tone(f,f*.98,.35,'triangle',.13,i*.16));break;
  }
}

// haptics: Android uses vibrate(); iPhone Safari has no vibrate, but toggling a native "switch" checkbox gives a tap
const HAPTIC={sw:null};
function haptic(kind){
  if(typeof META!=='undefined'&&!META.settings.vib)return;
  const pat={tap:18,flask:[25,30,35],rocket:[70,40,110,40,60],banner:[40,40,40,40,90]}[kind]||20;
  try{if(navigator.vibrate&&navigator.vibrate(pat))return}catch(e){}
  try{if(!HAPTIC.sw){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');
      l.appendChild(i);l.style.cssText='position:fixed;left:-99px;top:0;opacity:0;pointer-events:none';document.body.appendChild(l);HAPTIC.sw=l}
    const n=Array.isArray(pat)?Math.ceil(pat.length/2):1;for(let k=0;k<n;k++)setTimeout(()=>HAPTIC.sw.click(),k*90)}catch(e){}
}

// continuous sounds while rockets fly, waves roll and fences slide
const LOOPS=new Map();
function loopStart(kind){
  if(!SND.ac||!SND.on)return null;const ac=SND.ac,t=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.connect(SND.out);
  const nodes=[],s=ac.createBufferSource();s.buffer=SND.noise;s.loop=true;const f=ac.createBiquadFilter();
  if(kind==='rocket'){f.type='bandpass';f.frequency.value=1100;f.Q.value=.7}else if(kind==='wave'){f.type='lowpass';f.frequency.value=520}else{f.type='bandpass';f.frequency.value=320;f.Q.value=1.4}
  s.connect(f);f.connect(g);s.start();nodes.push(s);
  if(kind!=='wave'){const o=ac.createOscillator(),og=ac.createGain();o.type='sawtooth';o.frequency.value=kind==='rocket'?85:48;og.gain.value=kind==='rocket'?.18:.3;o.connect(og);og.connect(g);o.start();nodes.push(o);
    if(kind==='rocket')o.frequency.linearRampToValueAtTime(150,t+3)}
  else{const o=ac.createOscillator(),og=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();o.type='sine';o.frequency.value=70;og.gain.value=.5;
    lfo.frequency.value=1.6;lg.gain.value=180;lfo.connect(lg);lg.connect(f.frequency);o.connect(og);og.connect(g);o.start();lfo.start();nodes.push(o,lfo)}
  g.gain.exponentialRampToValueAtTime(AUD.loops[kind].gain,t+.15);
  return{stop(){try{const n=ac.currentTime;g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(Math.max(.0001,g.gain.value),n);g.gain.exponentialRampToValueAtTime(.0001,n+.25);nodes.forEach(x=>x.stop(n+.3))}catch(e){}}};
}
function updateLoops(){
  const want=new Map();
  if(Flow.state==='battle'&&G.state==='play'&&SND.on){G.rockets.forEach(r=>want.set(r,'rocket'));G.waves.forEach(w=>want.set(w,'wave'));G.fences.forEach(f=>{if(Math.abs(f.tz-f.z)>.01)want.set(f,'fence')})}
  for(const[o,k]of want)if(!LOOPS.has(o)){const l=loopStart(k);if(l)LOOPS.set(o,l)}
  for(const[o,l]of LOOPS)if(!want.has(o)){l.stop();LOOPS.delete(o)}
}
