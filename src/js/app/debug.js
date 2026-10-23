// =====================================================================
//  DEBUG BRIDGE + URL PARAMS — for parity checks between the web build and Unity.
//  window.__game: getState, setState, setSeed, step, input, pause, resume, runTest
//  URL: ?seed=N  ?level=N (arena index)  ?state=<json | base64 json>  ?frame=N (run N steps, then freeze)
// =====================================================================
// short state summary used by the JSON tests (same fields in the Unity runner)
function stateSummary(){
  const alive=G.trees.filter(t=>!t.dead).length,s=x=>({hp:+x.hp.toFixed(3),gold:x.gold,lvl:x.lvl,x:+x.x.toFixed(4),dmgMul:+x.dmgMul.toFixed(4),rateMul:+x.rateMul.toFixed(4)});
  return{time:+G.time.toFixed(4),state:G.state,P:s(G.P),E:s(G.E),units:G.units.length,unitsP:G.units.filter(u=>u.side==='p').length,
    trees:alive,fences:G.fences.length,rockets:G.rockets.length,hash:stateHash()};
}
// FNV-1a over the canonical state JSON (web-only exact parity check)
function stateHash(){const j=JSON.stringify(snapshot());let h=0x811c9dc5;for(let i=0;i<j.length;i++){h^=j.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
function stepN(n){for(let i=0;i<n;i++){simTick(CFG.sim.dt);EVQ.length=0}}
// a test: {seed, level, steps, inputs:[{at, action, value}], checkpoint?:{at}} -> summary
function runTest(t){
  CUR_ARENA=t.level||0;META.equip=Object.assign({},META_CFG.defaults.equip,t.equip||{});newMatch(t.seed);Clock.frozen=true;
  const inputs=(t.inputs||[]).slice().sort((a,b)=>a.at-b.at);let k=0;
  for(let i=0;i<t.steps;i++){
    while(k<inputs.length&&inputs[k].at===i){const e=inputs[k++];testInput(e.action,e.value)}
    if(t.roundTripAt===i){const snap=JSON.parse(JSON.stringify(snapshot()));restore(snap)}
    simTick(CFG.sim.dt);EVQ.length=0;
  }
  return stateSummary();
}
// test inputs act on the simulation directly (aim takes a screen x in reference px, like a tap)
function testInput(name,v){
  if(name==='aim'){Input.aim=aimX(v);return}
  if(name==='moveLeft'||name==='moveRight'){Input.held[name]=v!==false;return}
  action(name,v);
}
window.__game={
  getState:()=>JSON.parse(JSON.stringify(Object.assign(snapshot(),{flow:Flow.state}))),
  setState:d=>{const o=typeof d==='string'?JSON.parse(d):d;restore(o);clearVis();Flow.go(o.flow&&o.flow!=='menu'?o.flow:'battle');return stateSummary()},
  setSeed:n=>{newMatch(n>>>0);return G.seed},
  step:n=>{stepN(n||1);return stateSummary()},
  input:(name,v)=>action(name,v),
  pause:()=>{Clock.frozen=true},
  resume:()=>{Clock.frozen=false;resetClock()},
  summary:stateSummary,
  runTest
};
// --- URL params ---
(()=>{
  const q=new URLSearchParams(location.search);if(!['seed','level','state','frame'].some(k=>q.has(k)))return;
  if(q.has('level'))CUR_ARENA=clamp(parseInt(q.get('level'))||0,0,ARENAS.length-1);
  if(q.has('state')){let s=q.get('state');try{if(!/^\s*\{/.test(s))s=atob(s);__game.setState(JSON.parse(s))}catch(e){console.error('bad ?state',e);newMatch()}}
  else newMatch(q.has('seed')?(parseInt(q.get('seed'))>>>0):undefined);
  if(q.has('frame')){Clock.frozen=true;stepN(parseInt(q.get('frame'))||0)}
})();
