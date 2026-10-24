// =====================================================================
//  HELPERS
// =====================================================================
const foeOf=s=>s===G.P?G.E:G.P;
const sideById=id=>id==='p'?G.P:G.E;
const levelCost=s=>s.lvl===1?CFG.level.first:CFG.level.second+CFG.level.step*(s.lvl-2);
function addGold(s,v){s.gold+=v;while(s.gold>=levelCost(s)){s.gold-=levelCost(s);s.lvl++;s.pending++;
  if(s===G.P){Ev.text({anchor:'levelUp',txt:tx(T.game.levelUp,s.lvl),col:'gold',size:17});Ev.sfx('level',.2);Ev.levelUp(s.x,s.muzzle)}}}
const aliveUnits=id=>G.units.filter(u=>u.side===id).length;
const fencesOf=id=>G.fences.filter(f=>f.side===id).length;

// --- upgrade values (labels read the same numbers that are applied) ---
const upInc=(c,picks)=>c.first+c.step*picks;
// number of barrels per flask: grows with the match tempo (+1 every tempoStepsPerExtra steps), read from the flask's frozen tempo factor
function barrelCount(){const C=CFG.barrel,tn=Math.round((tempoF()/CFG.tempo.start-1)/CFG.tempo.step);return Math.min(C.maxCount,1+Math.floor(tn/C.tempoStepsPerExtra))}
let TF_LOCK=null; // tempo factors frozen on a flask when it appeared
function tempoF(cannon){if(TF_LOCK)return cannon?TF_LOCK[1]:TF_LOCK[0];return (cannon?CFG.tempo.cannonStart:CFG.tempo.start)*(1+CFG.tempo.step*((G&&G.tempoN)||0))}
function upgInfo(s,type){
  switch(type){
    case'dmg':return{t:T.upg.dmg,v:tx(T.upgVal.dmg,Math.round(Math.min(CFG.dmgUp.first*tempoF(1),CFG.dmgUp.cap-s.dmgMul)*100))};
    case'rate':return{t:T.upg.rate,v:tx(T.upgVal.rate,Math.round(Math.min(CFG.rateUp.first*tempoF(1),CFG.rateUp.cap-s.rateMul)*100))};
    case'doubles':return{t:T.upg.doubles,v:tx(T.upgVal.doubles,fmt(CFG.doubles.dur*M(s,'ult')))};
    case'squad3':return{t:T.upg.squad3,v:tx(T.upgVal.squad3,Math.round(CFG.squad.base*tempoF())*CFG.ult.triple)};
    case'giant3':return{t:T.upg.giant3,v:tx(T.upgVal.giant3,CFG.ult.triple)};
    case'squad':return{t:T.upg.squad,v:tx(T.upgVal.squad,Math.round(CFG.squad.base*tempoF()))};
    case'giant':return{t:T.upg.giant,v:tx(T.upgVal.giant,Math.round(CFG.giant.hp*tempoF()*M(s,'tank')))};
    case'wave':return{t:T.upg.wave,v:tx(T.upgVal.wave,fmt(CFG.wave.dmg*tempoF()))};
    case'barrel':return{t:T.upg.barrel,v:tx(T.upgVal.barrel,barrelCount())};
    case'fence':return{t:T.upg.fence,v:tx(T.upgVal.fence,Math.round(CFG.fence.hp*tempoF()*M(s,'fence')))};
  }
}
function available(s,type){
  const foeId=s.id==='p'?'e':'p';
  if(type==='dmg')return s.dmgMul<CFG.dmgUp.cap-1e-6;   // capped at 300%: no more damage flasks after that
  if(type==='rate')return s.rateMul<CFG.rateUp.cap-1e-6;
  if(type==='wave')return false; // wave is now the comeback mechanic, not a flask
  // fence only shows up when an enemy unit is already on our half of the field
  // fence only when an enemy is already in the open strip between our base and the forest
  // full chance when an enemy is in the open strip before our base, otherwise half the chance (coin flip)
  if(type==='fence')return (G.units.some(u=>u.side===foeId&&(s.id==='p'?u.z>CFG.tree.zMax&&u.z<P_FRONT:u.z<CFG.tree.zMin&&u.z>E_FRONT))||RNG.next()<.5)&&fencesOf(s.id)<CFG.fence.maxAlive;
  return true;
}
function fillBag(s){s.bag=[];for(const k in CFG.bag)for(let i=0;i<CFG.bag[k];i++)s.bag.push(k);shuffle(s.bag)}
function drawPair(s){
  for(let tries=0;tries<2;tries++){
    const av=s.bag.filter(t=>available(s,t)),a=av[0],b=av.find(t=>t!==a);
    if(a&&b){s.bag.splice(s.bag.indexOf(a),1);s.bag.splice(s.bag.indexOf(b),1);return[a,b]}
    fillBag(s);
  }
  return['squad','giant'];
}
function placeFlasks(s){
  const C=CFG.flask,L=C.xLimit,X=s.x;let a=X-C.side,b=X+C.side;
  if(a<-L){a=Math.min(X+C.side*.6,L-C.minGap);b=Math.max(a+C.minGap,Math.min(L,X+C.side*1.7));if(b>L){b=L;a=b-C.minGap}}
  else if(b>L){b=Math.max(X-C.side*.6,-L+C.minGap);a=Math.min(b-C.minGap,Math.max(-L,X-C.side*1.7));if(a<-L){a=-L;b=a+C.minGap}}
  return[a,b];
}

// --- applying upgrades ---
function spawnArmy(s,giant,n){for(let i=0;i<n;i++)s.reserve.push({giant,i,F:tempoF()*(giant?M(s,'tank'):1),m:M(s,'sold')})}
function makeUnit(s,spec){
  const S=CFG.soldier,Gc=CFG.giant,z0=s.front+s.dir*CFG.army.spawnOffset;
  if(spec.giant){const F=spec.F||1,k=F;
    return{id:++G.uid,side:s.id,giant:true,F,x:0,z:z0,vx:0,vz:0,r:Gc.radius,m:Gc.mass,hp:Gc.hp*k,max:Gc.hp*k,dmg:Gc.dmg*k,
      atk:Gc.atkInterval,spd:Gc.speed,cd:0,dmgAcc:0,slow:0,walk:0,hit:0,vis:1,killer:null};}
  const a=spec.i*CFG.army.spiralAngle,rr=CFG.army.spiralR*Math.sqrt(spec.i);
  return{id:++G.uid,side:s.id,giant:false,dm:spec.m||1,x:DM.cos(a)*rr,z:z0+DM.sin(a)*rr,vx:0,vz:0,r:S.radius,m:S.mass,hp:S.hp*(spec.m||1),max:S.hp*(spec.m||1),
    atk:S.atkInterval,spd:S.speed,cd:0,dmgAcc:0,slow:0,walk:RNG.next()*6,hit:0,killer:null};
}
function applyUpg(s,type,at){TF_LOCK=at&&at.tf||null;try{return applyUpg0(s,type,at)}finally{TF_LOCK=null}}
function applyUpg0(s,type,at){
  const info=upgInfo(s,type);
  Ev.sfx(type==='squad'||type==='squad3'?'squad':type==='giant'||type==='giant3'?'giant':type==='wave'?'wave':type==='fence'?'fence':s===G.P?'upgrade':'_',.05);
  if(type==='dmg'){s.dmgMul=Math.min(CFG.dmgUp.cap,s.dmgMul+CFG.dmgUp.first*tempoF(1));s.dmgPicks++}
  else if(type==='rate'){s.rateMul=Math.min(CFG.rateUp.cap,s.rateMul+CFG.rateUp.first*tempoF(1));s.ratePicks++}
  else if(type==='squad3'){spawnArmy(s,false,Math.round(CFG.squad.base*tempoF())*CFG.ult.triple)}
  else if(type==='giant3'){spawnArmy(s,true,CFG.ult.triple)}
  else if(type==='doubles'){const d=CFG.doubles.dur*M(s,'ult');if(s.buff>0)s.buffQ.push(d);else{s.buff=d;s.buffMax=d}}
  else if(type==='squad'){spawnArmy(s,false,Math.round(CFG.squad.base*tempoF()))}
  else if(type==='giant'){spawnArmy(s,true,1)}
  else if(type==='wave'){const F=tempoF();G.waves.push({side:s.id,dir:s.dir,z:s.front+s.dir*.4,F,hit:[],done:false})}
  else if(type==='barrel'){
    // barrels roll in a symmetric fan centred on the road; the centre one(s) go first, outer ones a bit later
    const C=CFG.barrel,n=barrelCount(),dmgK=tempoF()*M(s,'barrel');
    for(let i=0;i<n;i++){const o=i-(n-1)/2;
      G.barrels.push({side:s.id,dir:s.dir,x:o*C.laneGap,z:s.front+s.dir*C.spawnOffset,roll:0,age:0,hp:C.hp,hit:0,sc:1,dmgK,wait:Math.floor(Math.abs(o))*C.stagger})}}
  else if(type==='fence'){
    if(fencesOf(s.id)<CFG.fence.maxAlive){
      const C=CFG.fence,z1=s.id==='p'?C.zPlayer:C.zBot,z2=z1-s.dir*C.secondLine;
      const used=G.fences.filter(f=>f.side===s.id).map(f=>f.tz);
      const tz=used.includes(z1)?z2:z1;
      G.fences.push({side:s.id,dir:s.dir,x:0,z:s.front,tz,w:C.width,hp:C.hp*tempoF()*M(s,'fence'),max:C.hp*tempoF()*M(s,'fence'),dmgAcc:0,hitT:0});
    }
  }
  if(at&&s===G.P)Ev.text({anchor:'flask',x:at.x,txt:info.t+' '+info.v,col:UPG[type].pal,size:16});
  else Ev.text({anchor:s===G.P?'pWall':'eWall',txt:(s===G.E?T.game.enemyPrefix:'')+info.t+' '+info.v,col:UPG[type].pal,size:s===G.P?15:12});
}
function damageBase(s,v,X){Ev.sfx('hitBase',.09);s.hp=Math.max(0,s.hp-v);s.hitT=.12;Ev.burst(X,s.front,s===G.P?'teamP':'teamE',3)}


