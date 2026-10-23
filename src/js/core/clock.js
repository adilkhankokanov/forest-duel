// =====================================================================
//  CLOCK — fixed 60 Hz simulation step with an accumulator.
//  Unity: same loop in Update() (or FixedUpdate with fixedDeltaTime = 1/60).
// =====================================================================
// frozen: real time no longer advances the match (debug bridge / reference screenshots)
const Clock={acc:0,frozen:false};
// render clock for looping visual anims; follows match time while frozen so captures are repeatable
const nowMs=()=>Clock.frozen&&G?G.time*1000:performance.now();
function resetClock(){Clock.acc=0}
// advances the simulation by real time; returns the number of fixed steps taken
function advance(realDt,stepFn){
  Clock.acc+=realDt;let n=0;const dt=CFG.sim.dt;
  while(Clock.acc>=dt&&n<CFG.sim.maxSteps){stepFn(dt);Clock.acc-=dt;n++}
  if(n===CFG.sim.maxSteps)Clock.acc=0;
  return n;
}
