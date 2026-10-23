// =====================================================================
//  STATE
// =====================================================================
let G;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=RNG.int(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const Fr=r=>1+CFG.rankStep*(r-1);
const cellKey=(x,z)=>(Math.floor(x/0.5)+20)*1000+(Math.floor(z/0.5)+40);

function mkSide(id){
  const p=id==='p';
  return{id,dir:p?-1:1,x:0,tx:0,cd:CFG.cannon.interval,dmgMul:1,rateMul:1,dmgPicks:0,ratePicks:0,
    rank:{dmg:1,rate:1,doubles:1,squad:1,giant:1,wave:1,fence:1,barrel:1},gold:0,lvl:1,pending:0,flasks:[],bag:[],
    buff:0,buffQ:[],hp:CFG.baseHp,hitT:0,reserve:[],recoil:0,
    front:p?P_FRONT:E_FRONT,foeFront:p?E_FRONT:P_FRONT,muzzle:p?P_MUZZLE:E_MUZZLE,flaskZ:p?P_FLASK_Z:E_FLASK_Z,
    mod:{},aiT:0,choice:-1,style:['squad','giant','defense','economy'][RNG.int(4)]};
}
function genTreesOnce(){
  const T=CFG.tree,dn=makeNoise(),gn=makeNoise(),trees=[],grid=new Map();
  const peds=[-CFG.pedestal.x,CFG.pedestal.x];
  const near=(x,z)=>{for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){const a=grid.get(cellKey(x+ix*.5,z+iz*.5));if(a)for(const t of a)if((t.x-x)**2+(t.z-z)**2<T.minDist*T.minDist)return true}return false};
  for(let i=0;i<40000&&trees.length<T.max;i++){
    const x=RNG.range(T.xMin,T.xMax),z=RNG.range(T.zMin,T.zMax);
    if(Math.abs(x)<T.roadHalf)continue;
    if(peds.some(px=>DM.hypot(x-px,z-CFG.pedestal.z)<T.pedestalClear))continue;
    if(dn(x*T.densityFreq+11.3,z*T.densityFreq+7.1)<T.densityCut)continue;
    if(near(x,z))continue;
    const t={x,z,hp:0,max:0,g:false,dead:false,hit:0,gv:gn(x*T.goldFreq+50,z*T.goldFreq+50)+RNG.range(-.08,.08)};
    trees.push(t);const k=cellKey(x,z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);
  }
  // golden belts: same golden count per belt on both halves, positions from noise
  const belts={};
  for(const t of trees){
    const c=clamp(1-Math.abs(t.z-T.midZ)/T.centerSpan,0,1),b=Math.min(3,Math.floor(c*4)),h=t.z<T.midZ?'e':'p';
    (belts[b+h]=belts[b+h]||[]).push(t);
  }
  for(let b=0;b<4;b++){
    const A=belts[b+'e']||[],B=belts[b+'p']||[];
    const k=Math.round(T.beltGold[b]*(A.length+B.length)/2);
    for(const L of[A,B]){L.sort((u,v)=>v.gv-u.gv);L.forEach((t,i)=>t.g=i<k)}
  }
  for(const t of trees){const s=t.g?T.golden:T.green;t.hp=t.max=s.hp}
  trees.sort((a,b)=>a.z-b.z);
  return{trees,grid};
}
// regenerate until gold that each side can shoot first (front trees of every lane) is roughly equal; not mirrored
function exposedGold(trees,side){
  const R=CFG.tree.radius+.03;let sc=0;
  for(let x=CFG.tree.xMin;x<=CFG.tree.xMax;x+=.25){
    const lane=trees.filter(t=>Math.abs(t.x-x)<R).sort((a,b)=>side==='p'?b.z-a.z:a.z-b.z);
    for(let i=0;i<3&&i<lane.length;i++)if(lane[i].g)sc+=3-i;
  }
  return sc;
}
function genTrees(){
  let best=null,bd=1e9;
  for(let i=0;i<CFG.tree.balanceTries;i++){const r=genTreesOnce(),p=exposedGold(r.trees,'p'),e=exposedGold(r.trees,'e'),d=Math.abs(p-e);
    if(d<bd){bd=d;best=r}if(d<=Math.max(2,(p+e)*.04))break}
  return best;
}
// seed: same seed + same inputs -> same match. Without a seed the app picks one.
function reset(seed){
  if(seed===undefined)seed=newSeed();
  RNG.seed(seed);
  const{trees,grid}=genTrees();
  G={seed,uid:0,time:0,trees,grid,treesInit:trees.length,units:[],bullets:[],rockets:[],waves:[],fences:[],
    peds:[-1,1].map(s=>({x:s*CFG.pedestal.x,z:CFG.pedestal.z,hp:CFG.pedestal.hp,dead:false,hit:0})),
    shells:[],barrels:[],slicks:[],splats:[],rush:false,rushT:0,state:'play',endT:0,P:mkSide('p'),E:mkSide('e'),arena:CUR_ARENA};
  G.P.mod=metaMod('p');G.E.mod=metaMod('e');
  G.P.cbType=equippedComeback();G.E.cbType='cb0'; // bot always uses the wave
  resetClock();
}
reset();
function snapshot(){return{G:JSON.parse(JSON.stringify(G,(k,v)=>(k==='grid'||k==='act'||k==='chase')?undefined:v)),rng:RNG.s}}
function restore(d){
  if(!d||!d.G||!d.G.trees){reset();return}
  G=d.G;G.grid=new Map();for(const t of G.trees){const k=cellKey(t.x,t.z);if(!G.grid.has(k))G.grid.set(k,[]);G.grid.get(k).push(t)}
  G.shells=G.shells||[];G.barrels=G.barrels||[];G.slicks=G.slicks||[];G.splats=G.splats||[];G.uid=G.uid||0;for(const w of G.waves)w.hit=w.hit||[];
  if(d.rng)RNG.seed(d.rng);resetClock();
}
function start(d){restore(d)} // the menu decides when a battle starts
window.claude?.hot?.snapshot?.(snapshot);
if(window.claude?.hot?.ready)window.claude.hot.ready(start);else start(window.claude?.hot?.data??{});

