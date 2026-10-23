// =====================================================================
//  SIMULATION STEP (fixed 1/60)
// =====================================================================
function stepCannon(s,dt){
  const C=CFG.cannon;
  if(s===G.P){if(s.keyL)s.tx=s.x-1.2;if(s.keyR)s.tx=s.x+1.2;s.tx=clamp(s.tx,-C.xLimit,C.xLimit);
    s.x+=clamp(s.tx-s.x,-C.playerSpeed*dt,C.playerSpeed*dt)}
  else{botThink(s,dt);s.x+=(s.tx-s.x)*Math.min(1,dt*CFG.bot.smooth);s.x=clamp(s.x,-C.xLimit,C.xLimit)}
  if(s.buff>0){s.buff-=dt;if(s.buff<=0){s.buff=0;if(s.buffQ.length){s.buff=s.buffQ.shift();s.buffMax=s.buff}}}
  if(s.hitT>0)s.hitT-=dt;
  s.recoil=Math.max(0,s.recoil-dt*30);if(s.flash>0)s.flash-=dt;
  s.cd-=dt;
  while(s.cd<=0){
    s.cd+=C.interval/(s.rateMul*M(s,'cRate'));s.recoil=3;s.flash=.09;if(s===G.P)Ev.sfx('shot',.05);
    const x=s.x+RNG.range(-C.jitter,C.jitter),dmg=C.dmg*s.dmgMul*M(s,'cDmg')*M(s,'veh'),b={side:s.id,z:s.muzzle,dz:s.dir*C.bulletSpeed,dist:0};
    if(s.buff>0){
      const D=CFG.doubles;
      G.bullets.push({...b,x:x-D.offset,dmg:dmg*D.dmgMul,noFlask:true,fire:true},{...b,fire:true,x:x+D.offset,dmg:dmg*D.dmgMul,noFlask:true},
        {...b,x,dmg,ghost:true});
    }else G.bullets.push({...b,x,dmg});
  }
  if(s.flasks.length===0&&s.pending>0){
    s.pending--;const types=drawPair(s),xs=placeFlasks(s);
    s.flasks=types.map((t,i)=>({type:t,tf:[tempoF(),tempoF(1)],x:xs[i],z:s.flaskZ,hp:CFG.flask.hp,hit:0,born:0}));
    s.choice=-1;
  }
  for(const f of s.flasks){f.born+=dt;if(f.hit>0)f.hit-=dt}
}

function botThink(s,dt){
  const B=CFG.bot;
  s.aiT-=dt;if(s.aiT>0)return;s.aiT=B.retarget;
  let tx=null;
  if(s.flasks.length){
    if(s.choice<0)s.choice=botChoose(s);
    tx=s.flasks[s.choice].x;
  }else{
    let threat=null,td=1e9;
    for(const u of G.units)if(u.side!==s.id){const d=Math.abs(u.z-s.front);if(d<B.threatDist&&d<td){td=d;threat=u}}
    if(threat)tx=threat.x+(threat.vx||0)*.25;
    else tx=botBestLane(s);
  }
  s.tx=tx+RNG.range(-B.aimErr,B.aimErr);
}
// look down a set of lanes and pick the one where a shot pays off most: gold per shot, pedestals (free rocket), open base
function botBestLane(s){
  const C=CFG.cannon,dmg=C.dmg*s.dmgMul,foe=foeOf(s),Rr=CFG.tree.radius;let best=s.x,bv=-1e9;
  const lanes=[];for(let x=-C.xLimit;x<=C.xLimit;x+=.16)lanes.push(x);for(const p of G.peds)if(!p.dead)lanes.push(p.x);
  for(const x of lanes){
    let hitZ=1e9,val=0;const ahead=z=>(z-s.muzzle)*s.dir;
    for(const t of G.trees)if(!t.dead&&Math.abs(t.x-x)<Rr){const d=ahead(t.z);if(d>0&&d<hitZ){hitZ=d;val=(t.g?CFG.tree.golden.gold:CFG.tree.green.gold)/Math.ceil(t.hp/dmg)}}
    for(const p of G.peds)if(!p.dead&&Math.abs(p.x-x)<CFG.pedestal.radius+.05){const d=ahead(p.z);if(d>0&&d<hitZ){hitZ=d;val=CFG.bot.pedestalValue/Math.ceil(p.hp/dmg)}}
    for(const u of G.units)if(u.side!==s.id&&Math.abs(u.x-x)<u.r){const d=ahead(u.z);if(d>0&&d<hitZ){hitZ=d;val=(u.giant?8:2)/Math.ceil(u.hp/dmg)+1}}
    if(hitZ===1e9)val=CFG.bot.baseValue;
    const score=val-Math.abs(x-s.x)*CFG.bot.movePenalty;
    if(score>bv){bv=score;best=x}
  }
  return best;
}
function botChoose(s){
  const B=CFG.bot,S=B.score,foeId=s.id==='p'?'e':'p';
  const near=G.units.filter(u=>u.side===foeId&&Math.abs(u.z-s.front)<B.nearDist).length;
  const own=aliveUnits(s.id);
  const sc=s.flasks.map(f=>{const t=f.type;let v=(t==='dmg'||t==='rate')?S.cannon:S.other;
    if(s.style==='squad'&&t==='squad')v+=S.favorite;
    if(s.style==='giant'&&t==='giant')v+=S.favorite;
    if(s.style==='defense'&&(t==='fence'||t==='wave'))v+=S.styleFit;
    if(s.style==='economy'&&(t==='dmg'||t==='rate'))v+=S.styleFit;
    if(near>=6&&t==='wave')v+=S.wave6;
    if(near>=3&&t==='fence')v+=S.fence3;
    if(near>=3&&t==='squad')v+=S.squad3;
    if(own<5&&t==='squad')v+=S.squadLow;
    return v});
  if(RNG.next()<B.bestChance)return sc[0]>=sc[1]?0:1;
  return RNG.int(2);
}

// ---- bullets: nearest target along the travel segment ----
function circleEntry(b,cx,cz,r,z0,travel){
  const dx=b.x-cx;if(Math.abs(dx)>=r)return null;
  const h=Math.sqrt(r*r-dx*dx),s=Math.sign(b.dz);
  const exit=(cz+s*h-z0)*s;if(exit<0)return null;
  const p=Math.max(0,(cz-s*h-z0)*s);return p<=travel?p:null;
}
function stepBullets(dt){
  const T=CFG.tree;
  for(let i=G.bullets.length-1;i>=0;i--){
    const b=G.bullets[i],owner=sideById(b.side),foe=foeOf(owner),z0=b.z,travel=Math.abs(b.dz*dt),s=Math.sign(b.dz);
    let best=null,bp=1e9;
    const consider=(p,kind,obj)=>{if(p!==null&&p<bp){bp=p;best={kind,obj}}};
    if(!b.noFlask)for(const f of owner.flasks)consider(circleEntry(b,f.x,f.z,CFG.flask.radius,z0,travel),'flask',f);
    if(!b.ghost){
      for(let zz=Math.min(z0,z0+s*travel)-.5;zz<=Math.max(z0,z0+s*travel)+.5;zz+=.5)
        for(const ox of[-.5,0,.5]){const a=G.grid.get(cellKey(b.x+ox,zz));if(a)for(const t of a)if(!t.dead)consider(circleEntry(b,t.x,t.z,T.radius,z0,travel),'tree',t)}
      for(const u of G.units)if(u.side!==b.side&&u.hp>0)consider(circleEntry(b,u.x,u.z,u.r,z0,travel),'unit',u);
      for(const sh of G.shells)if(sh.side!==b.side&&!sh.done&&sh.hp!==undefined)consider(circleEntry(b,sh.x,sh.z,CFG.giant.shellR,z0,travel),'shell',sh);
      for(const p of G.peds)if(!p.dead)consider(circleEntry(b,p.x,p.z,CFG.pedestal.radius,z0,travel),'ped',p);
      for(const f of G.fences)if(f.side!==b.side&&Math.abs(b.x-f.x)<f.w/2){
        const face=f.z-s*CFG.fence.thick,p=(face-z0)*s;if(p>=-CFG.fence.thick*2&&p<=travel)consider(Math.max(0,p),'fence',f)}
      const pb=(foe.front-z0)*s;if(pb<=travel)consider(Math.max(0,pb),'base',foe);
    }
    if(!best){b.z+=b.dz*dt;b.dist+=travel;if(b.dist>CFG.cannon.range)G.bullets.splice(i,1);continue}
    G.bullets.splice(i,1);
    const o=best.obj,hz=z0+s*bp;
    if(!b.ghost)Ev.hit(b.x,hz,best.kind==='base'||best.kind==='tree'&&o.hp<=0);
    switch(best.kind){
      case'flask':o.hp-=b.dmg;o.hit=.12;if(owner===G.P)Ev.sfx(o.hp<=0?'flask':'flaskHit',.02);
        if(o.hp<=0){const t=o.type;
          if(owner===G.P){Ev.haptic('flask');Ev.burst(o.x,o.z,UPG[t].pal,22);for(const f of owner.flasks)if(f!==o)Ev.burst(f.x,f.z,'rubble',10)}
          owner.flasks=[];applyUpg(owner,t,o)}
        break;
      case'tree':o.hp-=b.dmg;o.hit=.32;o.sw=RNG.next()<.5?-1:1;if(o.hp<=0){if(owner===G.P)Ev.sfx(o.g?'goldTree':'tree',.05)}else if(owner===G.P)Ev.sfx('treeHit',.06);
        if(o.hp<=0){o.dead=true;const v=o.g?T.golden.gold:T.green.gold;addGold(owner,v);
          Ev.burst(o.x,o.z,o.g?'goldTree':'greenTree',o.g?16:10);
          if(owner===G.P)Ev.text({x:o.x,z:o.z,txt:'+'+v,col:o.g?'goldTree':'greenTree',size:o.g?15:12})}
        break;
      case'unit':o.dmgAcc+=b.dmg*(o.giant?CFG.cannon.vsGiant:CFG.cannon.vsSoldier);o.killer=b.side;o.hit=.1;break;
      case'rocket':o.hp-=b.dmg;o.hit=.1;if(o.hp<=0){o.dead=true;Ev.sfx('pop',.05);Ev.burst(o.x,o.z,'fireOrange',20)}break;
      case'barrel':if(o.hp===undefined)o.hp=CFG.barrel.hp;o.hp-=b.dmg;o.hit=.12;if(o.hp<=0){o.done=true;Ev.burst(o.x,o.z,'barrel',14);Ev.burst(o.x,o.z,'soot',8);Ev.sfx('pop',.05)}break;
      case'shell':o.hp-=b.dmg;o.hit=.1;if(o.hp<=0){o.done=true;Ev.burst(o.x,o.z,'brass',14);Ev.burst(o.x,o.z,'ash',8);Ev.sfx('pop',.05)}break;
      case'ped':o.hp-=b.dmg;o.hit=.12;if(o.hp<=0){o.dead=true;Ev.burst(o.x,o.z,'pedRed',20);launchRocket(owner,o)}break;
      case'fence':o.dmgAcc+=b.dmg;o.hitT=.1;break;
      case'base':damageBase(o,b.dmg,b.x);break;
    }
  }
}
function launchRocket(s,p){
  G.rockets.push({side:s.id,dir:s.dir,x0:p.x,x:p.x,z:p.z,age:0,phase:RNG.next()*6.283,hp:CFG.rocket.hp,vx:0,hit:0,dead:false});
  Ev.sfx('rocket',.1);Ev.text({x:p.x,z:p.z-1,txt:s===G.P?T.game.rocketOwn:T.game.rocketFoe,col:s===G.P?'teamP':'teamE',size:14});
}
function stepRockets(dt){
  const R=CFG.rocket;
  for(const r of G.rockets){
    if(r.hit>0)r.hit-=dt;
    r.age+=dt;const ox=r.x;
    r.x=r.x0+R.wobble*(DM.sin(r.age*R.wobbleFreq+r.phase)-DM.sin(r.phase));
    r.z+=r.dir*R.speed*dt;
    r.vx=(r.x-ox)/dt; // heading is derived by the view from (vx, dir*speed)
    const foe=r.side==='p'?G.E:G.P;
    if((foe.front-r.z)*r.dir<=R.halfLen){damageBase(foe,R.dmg,r.x);Ev.sfx('bigBoom',.05);Ev.burst(r.x,foe.front,'fireOrange',40);Ev.burst(r.x,foe.front,'sparkYellow',30);Ev.burst(r.x,foe.front,'c333',24);
      Ev.shake(.6);Ev.haptic('rocket');Ev.rocketBoom(r.x,foe.front);Ev.boom(r.x,foe.front,1.6);
      Ev.text({x:r.x,z:foe.front,dy:r.dir>0?-20:20,txt:'-'+R.dmg,col:'fireOrange',size:20});r.dead=true}
  }
  G.rockets=G.rockets.filter(r=>!r.dead);
}

// ---- armies ----
// spatial grid (1×1 world cells) so units only look at their neighbours, not at every unit on the field
const UG=new Map(),NB=[];
function buildUG(units){UG.clear();for(let i=0;i<units.length;i++){const u=units[i];u._i=i;const k=((Math.floor(u.x)+16)<<8)|(Math.floor(u.z)+32);let a=UG.get(k);if(!a)UG.set(k,a=[]);a.push(u)}}
function nearUnits(x,z,rad,out){out.length=0;const r=Math.ceil(rad),cx=Math.floor(x),cz=Math.floor(z);
  for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++){const a=UG.get(((cx+i+16)<<8)|(cz+j+32));if(a)for(const o of a)out.push(o)}return out}
// tank has a box collider: soldiers bump into its front instead of sliding round a circle
function rectGap(c,g){const hw=CFG.giant.hw,hl=CFG.giant.hl,px=clamp(c.x,g.x-hw,g.x+hw),pz=clamp(c.z,g.z-hl,g.z+hl);return DM.hypot(c.x-px,c.z-pz)}
function sepRect(g,c){const hw=CFG.giant.hw,hl=CFG.giant.hl;if(Math.abs(c.x-g.x)>hw+c.r||Math.abs(c.z-g.z)>hl+c.r)return;
  const px=clamp(c.x,g.x-hw,g.x+hw),pz=clamp(c.z,g.z-hl,g.z+hl),dx=c.x-px,dz=c.z-pz,d2=dx*dx+dz*dz;if(d2>=c.r*c.r)return;
  let nx,nz,o;const d=Math.sqrt(d2);
  if(d<1e-4){const ox=hw-Math.abs(c.x-g.x),oz=hl-Math.abs(c.z-g.z);if(ox<oz){nx=Math.sign(c.x-g.x)||1;nz=0;o=ox+c.r}else{nx=0;nz=Math.sign(c.z-g.z)||1;o=oz+c.r}}
  else{nx=dx/d;nz=dz/d;o=c.r-d}
  const ms=g.m+c.m;c.x+=nx*o*g.m/ms;c.z+=nz*o*g.m/ms;g.x-=nx*o*c.m/ms;g.z-=nz*o*c.m/ms}
function sepPair(a,b){if(a.giant!==b.giant){a.giant?sepRect(a,b):sepRect(b,a);return}const rr=a.r+b.r,dx=b.x-a.x,dz=b.z-a.z;if(dx>rr||dx<-rr||dz>rr||dz<-rr)return;
  const d2=dx*dx+dz*dz;if(d2>=rr*rr)return;const d=Math.sqrt(d2)||.001,o=(rr-d)*.5,nx=dx/d,nz=dz/d,ms=a.m+b.m;
  a.x-=nx*o*b.m/ms;a.z-=nz*o*b.m/ms;b.x+=nx*o*a.m/ms;b.z+=nz*o*a.m/ms}
const SG=new Map(),SOFF=[[1,0],[1,1],[0,1],[-1,1]];
function separate(units){const C=.8;SG.clear();
  for(const u of units){const k=((Math.floor(u.x/C)+20)<<9)|(Math.floor(u.z/C)+40);let a=SG.get(k);if(!a)SG.set(k,a=[]);a.push(u)}
  for(const[k,a]of SG){const cx=k>>9,cz=k&511;
    for(let i=0;i<a.length;i++){const p=a[i];for(let j=i+1;j<a.length;j++)sepPair(p,a[j]);
      for(const[ox,oz]of SOFF){const b=SG.get(((cx+ox)<<9)|(cz+oz));if(b)for(const q of b)sepPair(p,q)}}}}
function stepArmies(dt){
  const S=CFG.soldier,Gc=CFG.giant,A=CFG.army,FC=CFG.fence;
  // release reserve
  for(const s of[G.P,G.E]){let n=0,cnt=s.reserve.length?aliveUnits(s.id):0;while(s.reserve.length&&n<A.releasePerStep&&cnt+n<A.limit){const nu=makeUnit(s,s.reserve.shift());G.units.push(nu);n++;Ev.sfx(nu.giant?'tankSpawn':'hup',nu.giant?.1:.09)}}
  const units=G.units;buildUG(units);
  // phase 1: decide from one snapshot
  const baseHits=[];
  for(const u of units){
    const dir=u.side==='p'?-1:1,foe=u.side==='p'?G.E:G.P;
    u.cd=Math.max(0,u.cd-dt);if(u.hit>0)u.hit-=dt;if(u.slow>0)u.slow-=dt;if(u.fire>0)u.fire-=dt;if(u.atkT>0)u.atkT-=dt;
    u.act=null;
    if(u.giant){
      // tank: drives forward, doesn't fight soldiers in melee; every 1.5 s fires a heavy shell at the first enemy in its lane
      u.gunCd=(u.gunCd??Gc.gun.firstShot)-dt; // first shot 1 s after spawning, then every 2 s
      if(u.gunCd<=0){u.gunCd+=Gc.gun.interval;u.fire=.2;Ev.sfx('tankShot',.05);
        G.shells.push({side:u.side,dir,x:u.x,z:u.z+dir*u.r,dmg:CFG.baseHp*Gc.shotBasePct*(u.F||1),dist:0,hp:Gc.shellHp,hit:0})}
    }else{
      let best=null,bd=1e9;nearUnits(u.x,u.z,1,NB);
      for(const o of NB)if(o.side!==u.side){const fw=(o.z-u.z)*dir;if(fw<-u.r)continue;
        const d=o.giant?rectGap(u,o):DM.hypot(o.x-u.x,o.z-u.z)-o.r;if(d<=u.r+S.engage&&d<bd){bd=d;best=o}}
      if(best)u.act={units:[best]};
      else{let c=null,cd=S.aggro;for(const o of NB)if(o.side!==u.side&&Math.abs(o.x)<CFG.tree.roadHalf+.15&&(o.z-u.z)*dir>-.05){const d=DM.hypot(o.x-u.x,o.z-u.z);if(d<cd){cd=d;c=o}}u.chase=c}
    }
    if(!u.act)for(const f of G.fences)if(f.side!==u.side&&Math.abs(u.x-f.x)<f.w/2+u.r){
      const gap=(f.z-u.z)*dir-u.r-FC.thick;if(gap<=S.engage&&gap>-FC.thick*2){u.act={fence:f};break}}
    if(!u.act){const gap=(foe.front-u.z)*dir-u.r-A.baseGap;if(gap<=.02)u.act={base:foe}}
    if(u.act&&u.cd<=0){
      u.cd=u.atk;
      if(u.giant){
        // tank does its damage with shells only
      }else{
        const t=u.act.units?u.act.units[0]:null;u.atkT=.2;Ev.sfx('hya',.13);
        if(t){const d=DM.hypot(t.x-u.x,t.z-u.z)||1;u.ax=(t.x-u.x)/d;u.az=(t.z-u.z)/d}else{u.ax=0;u.az=dir}
      if(u.act.units)for(const o of u.act.units){o.dmgAcc+=u.giant?u.dmg:(o.giant?S.dmgUnit*S.vsTankMul:S.dmgUnit*S.vsSoldierMul)*(u.dm||1);o.killer=u.side;o.hit=.1}
      else if(u.act.fence){u.act.fence.dmgAcc+=u.giant?u.dmg:S.dmgFence*(u.dm||1);u.act.fence.hitT=.1}
      else baseHits.push([u.act.base,u.giant?u.dmg:S.dmgBase*(u.dm||1),u.x]);
      }
    }
    // movement intent
    let dvx=0,dvz=0;
    if(!u.act||u.giant){
      const sp=u.spd*(u.slow>0?CFG.wave.slow:1)*oilMul(u);dvz=dir*sp;
      const RH=CFG.tree.roadHalf,inForest=u.z>CFG.tree.zMin-.3&&u.z<CFG.tree.zMax+.3,ax=Math.abs(u.x);
      // keep to the road: soft pull to the middle, strong sideways slide when touching the trees
      if(inForest){
        if(ax>RH-u.r){dvx=-Math.sign(u.x)*sp;dvz*=.35}
        else if(ax>RH*.45)dvx=-Math.sign(u.x)*sp*.35*(ax-RH*.45)/(RH*.55);
      }else if(ax>RH-u.r)dvx=-Math.sign(u.x)*sp*.8;
      if(!u.giant&&!u.act&&u.chase&&u.chase.hp>0&&!(u.unstick>0)){const dx=u.chase.x-u.x,dz=u.chase.z-u.z,d=DM.hypot(dx,dz)||1;dvx=dx/d*sp*1.15;dvz=dz/d*sp*1.15}
      // stuck: no progress for a while -> slide to the road centre, half-step back allowed
      u.chkT=(u.chkT||0)+dt;
      if(u.chkT>=.4){const moved=DM.hypot(u.x-(u.cx??u.x),u.z-(u.cz??u.z));
        if(moved<sp*.4*.3&&!(u.slow>0)&&inForest&&ax>RH*.6)u.unstick=.8;u.cx=u.x;u.cz=u.z;u.chkT=0}
      if(u.unstick>0){u.unstick-=dt;const side=Math.abs(u.x)>.05?-Math.sign(u.x):(RNG.next()<.5?-1:1);
        dvx=side*sp*1.1;dvz=dir*sp*.3}
      if(dvz*dir<0)dvz=0; // never walk back toward own base
    }
    const k=Math.min(1,dt*8);u.vx+=(dvx-u.vx)*k;u.vz+=(dvz-u.vz)*k;
    u.x+=u.vx*dt;u.z+=u.vz*dt;
    if(u.kz){u.z+=u.kz*dt;u.kz*=DM.exp(-CFG.wave.knockDecay*dt);if(Math.abs(u.kz)<.01)u.kz=0}
    if(!u.act)u.walk+=dt*(u.giant?7:24);
  }
  // waves
  for(const w of G.waves){
    // slow bulldozer: every enemy it reaches is carried along in front of it
    const Wc=CFG.wave,st=Wc.speed*dt;w.z+=w.dir*st;w.trav=(w.trav||0)+st;
    const front=w.z+w.dir*Wc.length/2,maxD=w.maxDist||Wc.pushFrac*(P_FRONT-E_FRONT);
    for(const u of units)if(u.side!==w.side&&Math.abs(u.x)<Wc.hitHalf+u.r){
      const ahead=(u.z-front)*w.dir;
      if(ahead<u.r&&ahead>-Wc.length){
        if(!w.hit.includes(u.id)){w.hit.push(u.id);u.dmgAcc+=Wc.dmg*w.F;u.killer=w.side;u.hit=.15;u.slow=Wc.slowDur}
        u.z=front+w.dir*u.r;u.vz=0;u.kz=0}}
    const foe=w.side==='p'?G.E:G.P;
    if((foe.front-front)*w.dir<=0){baseHits.push([foe,Wc.dmg*w.F,0]);w.done=true}
    else if(w.trav>=maxD){w.fade=(w.fade||0)+dt;if(w.fade>.4)w.done=true}
  }
  G.waves=G.waves.filter(w=>!w.done);
  // fences slide into place
  for(const f of G.fences){const d=f.tz-f.z;f.z+=clamp(d,-FC.speed*dt,FC.speed*dt);if(f.hitT>0)f.hitT-=dt}
  // phase 2: soft separation
  for(let it=0;it<A.sepIters;it++)separate(units);
  // phase 3: obstacles, fences, bounds
  for(const u of units){
    const dir=u.side==='p'?-1:1;
    // trees only block units on the road; a unit that got shoved into the forest walks out through it
    if(Math.abs(u.x)<CFG.tree.roadHalf+.12)for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){const a=G.grid.get(cellKey(u.x+ix*.5,u.z+iz*.5));if(!a)continue;
      for(const t of a){if(t.dead)continue;const dx=u.x-t.x,dz=u.z-t.z,rr=u.r+CFG.tree.radius;
        if(dx>rr||dx<-rr||dz>rr||dz<-rr)continue;const d=DM.hypot(dx,dz)||.001;if(d<rr){u.x+=dx/d*(rr-d);u.z+=dz/d*(rr-d)}}}
    for(const p of G.peds)if(!p.dead){const dx=u.x-p.x,dz=u.z-p.z,rr=u.r+CFG.pedestal.radius,d=DM.hypot(dx,dz)||.001;if(d<rr){u.x+=dx/d*(rr-d);u.z+=dz/d*(rr-d)}}
    for(const f of G.fences)if(f.side!==u.side&&Math.abs(u.x-f.x)<f.w/2+u.r*.5){
      const lim=f.z-dir*(u.r+FC.thick);if((u.z-lim)*dir>0&&(f.z-u.z)*dir>-FC.thick*3)u.z=lim}
    const foe=u.side==='p'?G.E:G.P,own=u.side==='p'?G.P:G.E;
    const stop=foe.front-dir*(u.r+A.baseGap);if((u.z-stop)*dir>0)u.z=stop;
    const back=own.front+dir*u.r;if((u.z-back)*dir<0)u.z=back;
    u.x=clamp(u.x,-3.5+u.r,3.5-u.r);
    if(u.giant){if(u.lockX===undefined)u.lockX=u.x;u.x=u.lockX;u.vx=0} // tank keeps its lane
  }
  // phase 4: apply all damage together
  for(const[s,v,x]of baseHits)damageBase(s,v,x);
  for(const u of units){if(u.dmgAcc>0){u.hp-=u.dmgAcc;u.dmgAcc=0}}
  for(const f of G.fences){if(f.dmgAcc>0){f.hp-=f.dmgAcc;f.dmgAcc=0}if(f.hp<=0){f.dead=true;Ev.burst(f.x,f.z,'rubble',24)}}
  G.fences=G.fences.filter(f=>!f.dead);
  for(const u of units)if(u.hp<=0&&!u.gone){u.gone=true;
    const killer=sideById(u.killer||(u.side==='p'?'e':'p'));
    addGold(killer,u.giant?CFG.killGold.giant:CFG.killGold.soldier);
    if(u.giant)Ev.burst(u.x,u.z,u.side==='p'?'c6cc4ff':'teamE',24);if(CFG.splats&&!u.giant&&G.splats.length<140)G.splats.push({x:u.x,z:u.z,side:u.side,t:0,seed:RNG.next()*100,rot:RNG.next()*6.28,big:u.giant?2.2:1});if(u.giant){Ev.shake(.2,true);Ev.hit(u.x,u.z,true,.35)}Ev.sfx(u.giant?'giantDie':'unitDie',u.giant?.05:.04)}
  G.units=units.filter(u=>!u.gone);
  for(const p of G.splats)p.t+=dt;if(G.splats.length&&G.splats[0].t>=CFG.splatTime)G.splats=G.splats.filter(p=>p.t<CFG.splatTime);
}

function stepShells(dt){
  const g=CFG.giant.gun;
  for(const sh of G.shells){
    if(sh.tx!==undefined){sh.done=true;continue}
    if(sh.hit>0)sh.hit-=dt; // drop old splash shells from before the update
    const st=g.speed*dt;sh.z+=sh.dir*st;sh.dist+=st;
    // explodes on the first enemy it touches: unit, fence or base
    const foe=sh.side==='p'?G.E:G.P;let hitZ=null,base=false,fence=null;
    for(const o of G.units)if(o.side!==sh.side&&Math.abs(o.x-sh.x)<o.r+g.hitPad&&Math.abs(o.z-sh.z)<o.r+st){hitZ=sh.z;break}
    if(hitZ===null)for(const f of G.fences)if(f.side!==sh.side&&Math.abs(sh.x-f.x)<f.w/2){const p=(f.z-sh.dir*CFG.fence.thick-sh.z)*sh.dir;
      if(p<=0&&p>-st-CFG.fence.thick*2){hitZ=f.z;fence=f;break}}
    if(hitZ===null&&(foe.front-sh.z)*sh.dir<=0){hitZ=foe.front;base=true}
    if(hitZ!==null){sh.done=true;const R=g.blastR;
      for(const o of G.units)if(o.side!==sh.side&&DM.hypot(o.x-sh.x,o.z-hitZ)<R+o.r){o.dmgAcc+=g.unitDmg;o.killer=sh.side;o.hit=.12}
      for(const f of G.fences)if(f.side!==sh.side&&Math.abs(sh.x-f.x)<f.w/2+R&&Math.abs(f.z-hitZ)<R){f.dmgAcc+=sh.dmg;f.hitT=.12}
      if(base||Math.abs(foe.front-hitZ)<R)damageBase(foe,sh.dmg,sh.x);
      Ev.boom(sh.x,hitZ,R);Ev.burst(sh.x,hitZ,'fireOrange',14);Ev.burst(sh.x,hitZ,'gold',10);Ev.sfx('blast',.04)}
    else if(sh.dist>g.range)sh.done=true;
  }
  G.shells=G.shells.filter(s=>!s.done);
}
function oilMul(u){for(const o of G.slicks)if(o.side!==u.side&&DM.hypot(u.x-o.x,u.z-o.z)<o.r+u.r*.5)return CFG.barrel.slowMul;return 1}
function stepBarrels(dt){
  const C=CFG.barrel;
  for(const b of G.barrels){
    if(b.done)continue;if(b.wait>0){b.wait-=dt;continue}if(b.hit>0)b.hit-=dt;
    const st=C.speed*dt,k=b.sc||1,BR=C.radius;b.z+=b.dir*st;b.roll+=st;b.age+=dt;
    const foe=b.side==='p'?G.E:G.P;let hit=false;
    for(const u of G.units)if(u.side!==b.side&&DM.hypot(u.x-b.x,u.z-b.z)<u.r+BR){hit=true;break}
    if(!hit)for(const f of G.fences)if(f.side!==b.side&&Math.abs(b.x-f.x)<f.w/2+BR&&(f.z-b.z)*b.dir<=BR+CFG.fence.thick){hit=true;break}
    if(!hit&&(foe.front-b.z)*b.dir<=BR)hit=true;
    if(!hit)continue;
    b.done=true;
    for(const u of G.units)if(u.side!==b.side&&DM.hypot(u.x-b.x,u.z-b.z)<C.blastR+u.r){u.dmgAcc+=C.blastDmg*(b.dmgK||1)*(u.giant?CFG.giant.barrelMul:1);u.killer=b.side;u.hit=.12}
    for(const f of G.fences)if(f.side!==b.side&&Math.abs(b.x-f.x)<f.w/2+C.blastR&&Math.abs(b.z-f.z)<C.blastR){f.dmgAcc+=C.blastDmg;f.hitT=.12}
    const SR=C.slickR*k,sz=clamp(b.z,Math.min(G.E.front,G.P.front)+SR*.4,Math.max(G.E.front,G.P.front)-SR*.4);
    G.slicks.push({side:b.side,x:b.x,z:sz,r:SR,k:b.dmgK||k,t:0,seed:RNG.next()*100});
    Ev.boom(b.x,b.z,C.blastR);Ev.burst(b.x,b.z,'fireOrange',18);Ev.burst(b.x,b.z,'soot',14);Ev.sfx('boom',.05);
  }
  G.barrels=G.barrels.filter(b=>!b.done);
  for(const o of G.slicks){o.t+=dt;o.burn=(o.burn||0)+dt;
    if(o.burn>=C.burnInterval){o.burn-=C.burnInterval;
      for(const u of G.units)if(u.side!==o.side&&DM.hypot(u.x-o.x,u.z-o.z)<o.r+u.r*.5){u.dmgAcc+=C.burnDmg*(o.k||1);u.killer=o.side;u.hit=.1}
      for(const f of G.fences)if(f.side!==o.side&&Math.abs(f.x-o.x)<f.w/2+o.r&&Math.abs(f.z-o.z)<o.r){f.dmgAcc+=C.burnDmg*(o.k||1);f.hitT=.1}}}
  G.slicks=G.slicks.filter(o=>o.t<C.slickTime);
}
function step(dt){
  G.time+=dt;
  for(const r of G.trees)if(r.hit>0)r.hit-=dt;
  for(const p of G.peds)if(p.hit>0)p.hit-=dt;
  if(G.state==='play'){stepCannon(G.P,dt);stepCannon(G.E,dt)}
  stepBullets(dt);stepRockets(dt);stepShells(dt);stepBarrels(dt);stepArmies(dt);
  const R=CFG.rush;
  // game tempo: every 15 s all flask effects grow
  if(G.state==='play'){const n=Math.floor(G.time/CFG.tempo.interval);if(n>(G.tempoN||0)){G.tempoN=n;G.tb={t:0,pct:Math.round(n*CFG.tempo.step*100)};Ev.sfx('bugle',.2)}}
  if(G.tb&&!(G.cb&&G.cb.t<CFG.tempo.bannerBlock))G.tb.t+=dt;
  if(G.state==='play')for(const s of[G.P,G.E])if(!s.comeback&&s.hp<CFG.baseHp*CFG.wave.comebackHp&&s.hp>0){
    s.comeback=true;G.cb={side:s.id,t:0};Ev.haptic('banner');Ev.sfx('rush');
    if(s.cbType==='cb1'){ // barricade: a wide fence (80% of the base width) slides out to the first fence line
      const C=CFG.fence,w=CFG.world.baseWidth*C.comebackWidthFrac,hp=C.hp*M(s,'fence');Ev.sfx('fence');
      G.fences.push({side:s.id,dir:s.dir,x:0,z:s.front,tz:s.id==='p'?C.zPlayer:C.zBot,w,hp,max:hp,dmgAcc:0,hitT:0})}
    else{Ev.sfx('wave');G.waves.push({side:s.id,dir:s.dir,z:s.front+s.dir*CFG.wave.length/2,F:M(s,'wave'),hit:[],trav:0,maxDist:CFG.wave.pushFrac*(P_FRONT-E_FRONT)})}}
  if(G.cb)G.cb.t+=dt;
  if(G.state!=='play')G.endT+=dt;
  else if(G.E.hp<=0){G.state='win';Ev.sfx('win');Ev.shake(.8);Ev.haptic('rocket')}else if(G.P.hp<=0){G.state='lose';Ev.sfx('lose');Ev.shake(.8);Ev.haptic('rocket')}
}
