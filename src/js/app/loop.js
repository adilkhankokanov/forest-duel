// =====================================================================
//  APP LOOP — glue between Flow, input, the fixed-step simulation and the views.
//  Unity: GameRunner MonoBehaviour (Update -> advance sim, then views read state).
// =====================================================================
function newMatch(seed,state){reset(seed);clearVis();Flow.go(state||'battle')}
// one simulation tick: input state is copied into the sim before it steps
function simTick(dt){if(Input.aim!==null){G.P.tx=Input.aim;Input.aim=null}G.P.keyL=!!Input.held.moveLeft;G.P.keyR=!!Input.held.moveRight;step(dt)}
let last=performance.now();
function loop(now){
  const d=Math.min(.1,(now-last)/1000);last=now;requestAnimationFrame(loop);
  try{updateLoops()}catch(e){console.error(e)}
  try{
    if(Flow.running()&&!Clock.frozen){
      updateVis(d);
      advance(d,simTick);
      if(Flow.state==='battle'&&G.state!=='play')Flow.go('result');
    }
    drainEvents();
  }catch(e){console.error(e)}
  try{if(Flow.inGame())draw()}catch(e){console.error(e);ctx.restore&&ctx.setTransform(1,0,0,1,0,0)}
  try{window.updateHud&&updateHud()}catch(e){console.error(e)}
}
requestAnimationFrame(loop);
