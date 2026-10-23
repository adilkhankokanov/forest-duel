// =====================================================================
//  RNG — seeded mulberry32. The only randomness the simulation may use.
//  Unity: same algorithm in a plain C# class (uint math), state is one uint.
// =====================================================================
function makeRng(){return{
  s:1,
  seed(n){this.s=(n>>>0)||1},
  next(){let t=(this.s=(this.s+0x6D2B79F5)>>>0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296},
  range(a,b){return a+this.next()*(b-a)},
  int(n){return Math.floor(this.next()*n)}
}}
const RNG=makeRng();
// VRNG: presentation-only randomness (particles, jitter). Separate stream, so visuals never change the match.
const VRNG=makeRng();VRNG.seed((Math.random()*4294967296)>>>0);
const VR=()=>VRNG.next(), rnd=(a,b)=>a+VR()*(b-a);
// a fresh seed for a normal match (app level; the sim never calls this itself)
const newSeed=()=>(Math.random()*4294967296)>>>0;
