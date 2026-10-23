// Renders every synthesized sound of the web build to WAV files for Unity (assets/audio).
// The synth code itself is the source; each randomized sound gets 3 variants (name_1..3.wav).
// Run: node tools/export_audio.js   (needs dist/forest-duel.html)
const {chromium}=require(process.env.PW||'/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'assets/audio');fs.mkdirSync(OUT,{recursive:true});
function wav(samples,sr){const n=samples.length,b=Buffer.alloc(44+n*2);b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVE',8);b.write('fmt ',12);
  b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
  b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(samples[i]*32767))),44+i*2);return b}
(async()=>{
  const br=await chromium.launch();const p=await br.newPage();
  await p.goto('file://'+path.join(ROOT,'dist/forest-duel.html'));await p.waitForTimeout(500);
  const res=await p.evaluate(async()=>{
    const SR=44100,out={},A=DATA.audio;
    const noise=(()=>{const oc=new OfflineAudioContext(1,SR,SR),b=oc.createBuffer(1,SR,SR),d=b.getChannelData(0);for(let i=0;i<SR;i++)d[i]=Math.random()*2-1;return b})();
    SND.noise=noise;
    const trim=d=>{let e=d.length;while(e>1&&Math.abs(d[e-1])<1e-4)e--;return Array.from(d.subarray(0,Math.min(d.length,e+256)))};
    async function render(len,fn,noTrim){const oc=new OfflineAudioContext(1,Math.ceil(SR*len),SR);const keep=[SND.ac,SND.out];A_CTX=oc;A_OUT=oc.destination;SND.ac=oc;SND.out=oc.destination;try{fn(oc)}finally{A_CTX=null;A_OUT=null;SND.ac=keep[0];SND.out=keep[1]}
      const b=await oc.startRendering();return noTrim?Array.from(b.getChannelData(0)):trim(b.getChannelData(0))}
    for(const name in A.sfx)for(let v=1;v<=A.sfx[name].variants;v++)out[name+'_'+v]=await render(A.sfx[name].len||2,()=>synth(name));
    // background music: the menu arpeggio, 4 chords × 8 steps, one seamless loop
    const M=A.music;out.music=await render(M.chords.length*8*M.step,()=>{for(let s=0;s<M.chords.length*8;s++){const ch=M.chords[Math.floor(s/8)],i=s%8,f=ch[M.pattern[i]],t=s*M.step;
      tone(f*2,f*2,.22,'triangle',.016,t);if(i===0||i===4)tone(ch[0]/2,ch[0]/2,.5,'sine',.04,t)}},true);
    // continuous loops (rocket flight, wave, fence slide): same graph as loopStart()
    for(const k of['rocket','wave','fence']){const oc=new OfflineAudioContext(1,SR*3,SR);const keep={ac:SND.ac,out:SND.out,on:SND.on};SND.ac=oc;SND.out=oc.destination;SND.on=true;
      try{loopStart(k)}finally{SND.ac=keep.ac;SND.out=keep.out;SND.on=keep.on}out['loop_'+k]=Array.from((await oc.startRendering()).getChannelData(0))}
    return{out,SR};
  });
  for(const k in res.out)fs.writeFileSync(path.join(OUT,k+'.wav'),wav(res.out[k],res.SR));
  console.log('wrote',Object.keys(res.out).length,'files');await br.close();
})();
