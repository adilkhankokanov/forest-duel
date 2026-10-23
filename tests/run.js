// Runs the JSON test suites against the pure simulation in Node (no browser, no DOM).
// Usage: node tests/run.js [suite.json ...]      (default: every tests/*.json)
//        node tests/run.js --update              (rewrite "expect" from the current code — only after an intended change)
// Each test: initial state (seed + level) + input sequence -> expected summary.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src');
// simulation modules only — the same set a Unity port translates to C#
const SIM=['core/data.js','core/rng.js','core/dmath.js','core/events.js','core/flow.js','core/clock.js','data/config.js','data/meta.js',
  'sim/noise.js','sim/state.js','sim/helpers.js','sim/sim.js'];
function loadSim(){
  const data={};for(const f of fs.readdirSync(path.join(SRC,'data')))if(f.endsWith('.json'))data[f.slice(0,-5)]=JSON.parse(fs.readFileSync(path.join(SRC,'data',f),'utf8'));
  let code=SIM.map(f=>fs.readFileSync(path.join(SRC,'js',f),'utf8')).join('\n').replace('__DATA__',JSON.stringify(data));
  // view-side names the sim modules mention but never need here
  code=`const W=${data.layout.ref.w},H=${data.layout.ref.h},CX=W/2;\n`+code;
  code+=`
  const Input={held:{},aim:null};
  const aimX=px=>{const n=clamp((px-CX)/(W/2),-1,1);return clamp(n*(1+DATA.input.aim.edgeGain),-1,1)*CFG.cannon.xLimit};
  function simTick(dt){if(Input.aim!==null){G.P.tx=Input.aim;Input.aim=null}G.P.keyL=!!Input.held.moveLeft;G.P.keyR=!!Input.held.moveRight;step(dt)}
  function stateHash(){const j=JSON.stringify(snapshot());let h=0x811c9dc5;for(let i=0;i<j.length;i++){h^=j.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
  function stateSummary(){const alive=G.trees.filter(t=>!t.dead).length,s=x=>({hp:+x.hp.toFixed(3),gold:x.gold,lvl:x.lvl,x:+x.x.toFixed(4),dmgMul:+x.dmgMul.toFixed(4),rateMul:+x.rateMul.toFixed(4)});
    return{time:+G.time.toFixed(4),state:G.state,P:s(G.P),E:s(G.E),units:G.units.length,unitsP:G.units.filter(u=>u.side==='p').length,trees:alive,fences:G.fences.length,rockets:G.rockets.length,hash:stateHash()}}
  globalThis.snapAt=(seed,n)=>{CUR_ARENA=0;reset(seed);for(let i=0;i<n;i++){simTick(CFG.sim.dt);EVQ.length=0}return snapshot()};
  globalThis.runTest=t=>{CUR_ARENA=t.level||0;META.equip=Object.assign({},META_CFG.defaults.equip,t.equip||{});Input.held={};Input.aim=null;reset(t.seed);
    const inputs=(t.inputs||[]).slice().sort((a,b)=>a.at-b.at);let k=0;
    for(let i=0;i<t.steps;i++){
      while(k<inputs.length&&inputs[k].at===i){const e=inputs[k++];
        if(e.action==='aim')Input.aim=aimX(e.value);else if(e.action==='moveLeft'||e.action==='moveRight')Input.held[e.action]=e.value!==false}
      if(t.roundTripAt===i)restore(JSON.parse(JSON.stringify(snapshot())));
      simTick(CFG.sim.dt);EVQ.length=0}
    return stateSummary()};`;
  const ctx={console,Math,JSON,Map,Set,Object,Array,Number,String,Uint8Array,localStorage:{getItem:()=>null,setItem:()=>{}},window:{}};
  vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'sim-bundle.js'});return ctx;
}
// compare: numbers within tol (default 1e-6 relative to the test's "tol"), everything else exact
function diff(exp,got,tol,pre='',out=[]){
  if(typeof exp==='number'){if(typeof got!=='number'||Math.abs(exp-got)>tol)out.push(`${pre}: expected ${exp}, got ${got}`);return out}
  if(exp&&typeof exp==='object'){for(const k in exp)diff(exp[k],got?got[k]:undefined,tol,pre?pre+'.'+k:k,out);return out}
  if(exp!==got)out.push(`${pre}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(got)}`);return out;
}
module.exports={loadSim};
if(require.main===module){
const args=process.argv.slice(2),update=args.includes('--update');
const files=args.filter(a=>!a.startsWith('--')).length?args.filter(a=>!a.startsWith('--')):fs.readdirSync(__dirname).filter(f=>f.endsWith('.json')).map(f=>path.join(__dirname,f));
let fail=0,total=0;
for(const f of files){
  const suite=JSON.parse(fs.readFileSync(f,'utf8'));
  for(const t of suite.tests){total++;const sim=loadSim(),got=JSON.parse(JSON.stringify(sim.runTest(t)));
    if(update){t.expect=got;console.log('updated',t.name);continue}
    const exp=Object.assign({},t.expect);if(suite.ignoreHash)delete exp.hash;
    const d=diff(exp,got,t.tol??suite.tol??1e-6);
    if(d.length){fail++;console.log('FAIL',path.basename(f),t.name,'\n  '+d.slice(0,8).join('\n  '))}else console.log('ok  ',path.basename(f),t.name)}
  if(update)fs.writeFileSync(f,JSON.stringify(suite,null,1)+'\n');
}
console.log(update?'expectations rewritten':`${total-fail}/${total} passed`);process.exit(fail?1:0);
}
