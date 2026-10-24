// =====================================================================
//  VISUAL EFFECTS — presentation-only state, fed by simulation events.
//  Nothing here affects the match; it may use Math.random freely.
//  Unity: pooled particle systems / floating-text prefabs spawned by an EventView.
// =====================================================================
const VIS={parts:[],texts:[],fx:[],booms:[],rings:[],shake:0};
// screen-space text anchors used by the HUD-style floating texts
const TA=DATA.layout.textAnchors;
function textPos(e){
  switch(e.anchor){
    case'levelUp':return[W/2,UI.pWall+TA.levelUpDy];
    case'flask':return[clamp(sx(e.x),TA.flaskClamp,W-TA.flaskClamp),UI.flaskY+TA.flaskDy];
    case'pWall':return[W/2,UI.pWall+TA.pWallDy];
    case'eWall':return[W/2,UI.eWall+UI.wallH+TA.eWallDy];
  }
  return[sx(e.x),sy(e.z)+(e.dy||0)];
}
const FXD=DATA.fx;
// particle burst (emitter data in fx.json; Unity: ParticleSystem.Emit with the same ranges)
function burst(X,Z,col,n){const B=FXD.burst;for(let i=0;i<n;i++){const a=VR()*6.28,s=rnd(B.speed[0],B.speed[1]);VIS.parts.push({x:sx(X),y:sy(Z),vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,life:rnd(B.life[0],B.life[1]),col,r:rnd(B.radius[0],B.radius[1])})}}
function hitFx(X,Z,big,life){VIS.fx.push({x:sx(X),y:sy(Z),t:0,life:life||FXD.hit.life,rot:VR()*6.28,big:!!big})}
// drain the simulation's event queue into sounds, haptics and effects
function drainEvents(){
  for(let i=0;i<EVQ.length;i++){const e=EVQ[i];
    switch(e.type){
      case'sfx':sfx(e.name,e.gap);break;
      case'haptic':haptic(e.kind);break;
      case'burst':burst(e.x,e.z,col(e.col),e.n);break;
      case'text':{const p=textPos(e);VIS.texts.push({x:p[0],y:p[1],txt:e.txt,col:col(e.col),t:0,size:e.size||12});break}
      case'hit':hitFx(e.x,e.z,e.big,e.life);break;
      case'boom':VIS.booms.push({x:e.x,z:e.z,r:e.r,t:0});break;
      case'rocketBoom':{const R=FXD.rocketBoom;for(let k=0;k<R.stars;k++)VIS.fx.push({x:sx(e.x)+rnd(-R.spreadX,R.spreadX),y:sy(e.z)+rnd(-R.spreadY,R.spreadY),t:-k*R.stagger,life:R.life,rot:VR()*6,big:true});break}
      case'levelUp':{const L=FXD.levelUp,x=sx(e.x),y=sy(e.z);burst(e.x,e.z,col('gold'),L.gold);burst(e.x,e.z,col('sparkYellow'),L.sparks);
        for(let k=0;k<L.rings;k++)VIS.rings.push({x,y,t:-k*L.stagger});
        for(let k=0;k<L.stars;k++)VIS.fx.push({x:x+rnd(-L.spreadX,L.spreadX),y:y+rnd(-L.spreadY,L.spreadY)-10,t:-k*L.starStagger,life:L.starLife,rot:VR()*6,big:false});break}
      case'shake':VIS.shake=e.max?Math.max(VIS.shake,e.v):e.v;break;
    }
  }
  EVQ.length=0;
}
function clearVis(){VIS.parts.length=0;VIS.texts.length=0;VIS.fx.length=0;VIS.booms.length=0;VIS.rings.length=0;VIS.shake=0;EVQ.length=0}
// effects age with real time while the match is running (they freeze on pause)
function updateVis(dt){
  for(const t of VIS.texts)t.t+=dt;VIS.texts=VIS.texts.filter(t=>t.t<animLen('floatText'));
  for(const p of VIS.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=FXD.burst.dragPerFrame;p.vy*=FXD.burst.dragPerFrame}VIS.parts=VIS.parts.filter(p=>p.t<p.life);
  for(const r of VIS.rings)r.t+=dt;VIS.rings=VIS.rings.filter(r=>r.t<FXD.levelUp.life);
  for(const b of VIS.booms)b.t+=dt;VIS.booms=VIS.booms.filter(b=>b.t<animLen('boom'));
  for(const f of VIS.fx)f.t+=Math.min(.05,dt);VIS.fx=VIS.fx.filter(f=>f.t<f.life);
  if(VIS.shake>0)VIS.shake=Math.max(0,VIS.shake-dt);
}
