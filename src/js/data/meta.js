// =====================================================================
//  META: arenas, saved progress, permanent upgrades (menu side)
//  Numbers from data/arenas.json and data/meta.json
// =====================================================================
// arenas: visual themes repeat, thresholds grow, every arena has path nodes and a chest
const ARENA_THEMES=DATA.arenas.themes;
const ARENA_NAMES=T.arenaNames;
const ARENAS=[];{const A=DATA.arenas;let min=0;for(let k=0;k<A.count;k++){const base=ARENA_NAMES[k%ARENA_NAMES.length],lap=Math.floor(k/ARENA_NAMES.length);
  ARENAS.push(Object.assign({name:base+(lap?' '+T.arenaLaps[lap-1]:''),min,chest:k?A.chest.base+A.chest.step*k:0},ARENA_THEMES[k%ARENA_THEMES.length]));
  const th=A.threshold;min+=k<th.first.length?th.first[k]:th.base+th.inc*(k-th.first.length)}}
const META_CFG=DATA.meta;
const META_KEY=META_CFG.storageKey;
const META=(()=>{const D=META_CFG.defaults,d=JSON.parse(JSON.stringify(D));
  try{const s=JSON.parse(localStorage.getItem(META_KEY)||'null');if(s){Object.assign(d,s);d.lv=Object.assign({},D.lv,s.lv||{});d.settings=Object.assign({},D.settings,s.settings||{});d.claimed=s.claimed||{};d.equip=Object.assign({},D.equip,s.equip||{})}}catch(e){}
  return d})();
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(META))}catch(e){}}
const arenaIdx=tr=>{let i=0;for(let k=0;k<ARENAS.length;k++)if(tr>=ARENAS[k].min)i=k;return i};
let CUR_ARENA=arenaIdx(META.maxTrophies);
function metaMod(side){
  const m={};
  if(side==='p'){for(const k in META_CFG.per)m[k]=1+META_CFG.per[k]*((META.lv[k]||1)-1)}
  else{const v=1+META_CFG.botPerArena*CUR_ARENA;for(const k in META_CFG.per)m[k]=v;m.veh=1} // bot: vehicle level is a player-only stat
  return m;
}
// comeback the player has equipped in the army tab (cb0 wave, cb1 barricade)
const equippedComeback=()=>(META.equip&&META.equip.comebacks)||'cb0';
const M=(s,k)=>(s&&s.mod&&s.mod[k])||1;
