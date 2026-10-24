// =====================================================================
//  APP LOOP — glue between Flow, input, the fixed-step simulation and the views.
//  Unity: GameRunner MonoBehaviour (Update -> advance sim, then views read state).
// =====================================================================
function newMatch(seed,state){reset(seed);clearVis();if(typeof CAM!=='undefined'){CAM.t0=nowMs();CAM.pz=0}Flow.go(state||'battle')}
// one simulation tick: input state is copied into the sim before it steps
function simTick(dt){if(Input.aim!==null){G.P.tx=Input.aim;Input.aim=null}G.P.keyL=!!Input.held.moveLeft;G.P.keyR=!!Input.held.moveRight;step(dt)}
let last=performance.now();
// end of match: a 140 ms freeze, then ~3 s of slow motion while the camera closes in on the broken base (view clock only)
const ENDV={t0:0,g:null};
function endTimeScale(){if(G.state==='play'||RMOT){ENDV.g=null;return 1}const n=performance.now();if(ENDV.g!==G){ENDV.g=G;ENDV.t0=n;try{VIS.shake=1}catch(e){}}
  const C=DATA.fx.endSlowmo,r=(n-ENDV.t0)/1000;if(r<C.stopMs/1000)return 0;if(r<C.hold)return C.scale;if(r<C.hold+C.ramp)return C.scale+(1-C.scale)*(r-C.hold)/C.ramp;return 1}
function loop(now){
  const d=Math.min(.1,(now-last)/1000);last=now;requestAnimationFrame(loop);
  try{updateLoops()}catch(e){console.error(e)}
  try{
    if(Flow.running()&&!Clock.frozen){
      const ts=endTimeScale();updateVis(d*ts);
      advance(d*ts,simTick);
      if(Flow.state==='battle'&&G.state!=='play')Flow.go('result');
    }
    drainEvents();
  }catch(e){console.error(e)}
  try{if(Flow.inGame())draw()}catch(e){console.error(e);ctx.restore&&ctx.setTransform(1,0,0,1,0,0)}
  try{window.updateHud&&updateHud()}catch(e){console.error(e)}
}
requestAnimationFrame(loop);
