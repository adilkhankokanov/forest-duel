// =====================================================================
//  DRAW
// =====================================================================
const FONT='"Rubik","Arial Rounded MT Bold",system-ui,sans-serif';
let FLASH=0;const WHITE={};const PAPER={c:document.createElement('canvas'),k:0};const FOREST={L:[document.createElement('canvas'),document.createElement('canvas')],sig:''};
function whiteImg(k){if(WHITE[k])return WHITE[k];const i=IMG[k];const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;
  const x=c.getContext('2d');x.drawImage(i,0,0);x.globalCompositeOperation='source-in';x.fillStyle=PAL.white;x.fillRect(0,0,c.width,c.height);return WHITE[k]=c}
function spr(k,x,y,w,ax=.5,ay=.5,rot=0,sy_=1){const i=IMG[k];if(!i.complete||!i.naturalWidth)return;
  const h=w*i.naturalHeight/i.naturalWidth;
  ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(sy_!==1)ctx.scale(1,sy_);ctx.drawImage(i,-w*ax,-h*ay,w,h);
  if(FLASH>0){ctx.globalAlpha*=Math.min(1,FLASH);ctx.drawImage(whiteImg(k),-w*ax,-h*ay,w,h)}
  ctx.restore()}
// baked sprite at its logical size (data/sprites.json) around its pivot; no hit-flash overlay
function sprB(k,x,y,sc=1,rot=0){const m=DATA.sprites.baked[k],f=FLASH;FLASH=0;spr(k,x,y,m.w*sc,m.pivot[0],m.pivot[1],rot);FLASH=f}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function outlined(txt,x,y,size,fill,stroke=PAL.ink,lw=3.5){
  ctx.font='800 '+size+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.lineJoin='round';ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function bar(x,y,w,h,f,col){ctx.fillStyle=PAL.barBack;rr(x-1,y-1,w+2,h+2,3);ctx.fill();ctx.fillStyle=col;rr(x,y,Math.max(1,w*clamp(f,0,1)),h,2);ctx.fill()}

function drawWall(s){
  const y=s===G.P?UI.pWall:UI.eWall,sh=s.hitT>0?rnd(-1.5,1.5):0,i=IMG.wall,X=UI.wallX,Wd=UI.wallW,Hh=UI.wallH;
  if(s.hp<=0&&G.state!=='play'){if(!i.complete)return;const t=G.endT,seg=Wd/8,WA=anim('wallCollapse',t);
    for(let k=0;k<16;k++){const col=k%8,row=k>>3,sd=Math.sin(k*12.9898)*43758.5453,rn=sd-Math.floor(sd);
      const fall=WA.fall,dx=(rn-.5)*40*fall,dy=(row?14:6)*fall,rot=(rn-.5)*1.2*fall;
      ctx.save();ctx.globalAlpha=WA.alpha;ctx.translate(X+col*seg+seg/2+dx,y+row*(Hh/2)+Hh/4+dy+rn*8*fall);ctx.rotate(rot);
      ctx.drawImage(i,col*i.naturalWidth/8,0,i.naturalWidth/8,i.naturalHeight,-seg/2,-Hh/4,seg-2,Hh/2);ctx.restore()}
    if(t<1.2&&VR()<.5)burst(rnd(-3,3),s.front,PAL.rubble,3);return}
  if(i.complete&&i.naturalWidth){const half=Hh/2+1;
    ctx.drawImage(i,X+sh,y,Wd,half);
    ctx.save();ctx.beginPath();ctx.rect(X,y+half-2,Wd,half+2);ctx.clip();
    ctx.drawImage(i,X-Wd/16+sh,y+half-2,Wd,half);ctx.drawImage(i,X+Wd*15/16+sh,y+half-2,Wd,half);ctx.restore()}
  const bx=X+20,bw=Wd-40,by=y+11,bh=20,f=s.hp/CFG.baseHp;
  ctx.fillStyle=PAL.barBack;rr(bx-2,by-2,bw+4,bh+4,7);ctx.fill();
  ctx.fillStyle=PAL.barTrack;rr(bx,by,bw,bh,5);ctx.fill();
  if(f>0){ctx.fillStyle=s===G.P?PAL.barP:PAL.barE;rr(bx,by,Math.max(8,bw*f),bh,5);ctx.fill();
    ctx.fillStyle=PAL.cffffff_28;rr(bx+3,by+2,Math.max(2,bw*f-6),5,3);ctx.fill()}
  if(s.hitT>0){ctx.fillStyle=PAL.cffffff_35;rr(bx,by,bw,bh,5);ctx.fill()}
  outlined(Math.ceil(s.hp)+' / '+CFG.baseHp,W/2,by+bh/2+1,13,PAL.white);
}
const XPV={show:0,lvl:0,last:0,flash:0,t:0,sparks:[]};
function drawExp(){
  if(G.state==='lose')return;
  const P=G.P,bx=UI.wallX+20,bw=UI.wallW-40,by=UI.pWall+11+20+3,bh=6,target=P.gold/levelCost(P);
  const now=nowMs(),dt=Math.min(.05,(now-(XPV.t||now))/1000);XPV.t=now;
  if(XPV.lvl===0||XPV.lvl>P.lvl){XPV.lvl=P.lvl;XPV.show=target;XPV.last=target}
  // gain detected -> flash + sparks
  if(P.lvl>XPV.lvl||target>XPV.last+1e-6){XPV.flash=1;}
  XPV.last=target;
  const goal=P.lvl>XPV.lvl?1:target;
  XPV.show+=(goal-XPV.show)*Math.min(1,dt*7)+Math.sign(goal-XPV.show)*dt*.15;
  if(goal>=XPV.show-1e-3&&Math.abs(goal-XPV.show)<.004)XPV.show=goal;
  if(P.lvl>XPV.lvl&&XPV.show>=.995){XPV.lvl++;XPV.show=0;XPV.flash=1.4;
    for(let i=0;i<18;i++)XPV.sparks.push({x:bx+VR()*bw,y:by+bh/2,vx:(VR()-.5)*60,vy:-30-VR()*70,t:0})}
  const f=clamp(XPV.show,0,1),edge=bx+bw*f;
  if(XPV.flash>0){XPV.flash=Math.max(0,XPV.flash-dt*2.2);if(VR()<.6&&f>0)XPV.sparks.push({x:edge,y:by+bh/2,vx:(VR()-.5)*40,vy:-20-VR()*50,t:0})}
  const fl=Math.min(1,XPV.flash);
  ctx.fillStyle=PAL.barBack;rr(bx-2,by-1.5,bw+4,bh+3,4);ctx.fill();
  ctx.fillStyle=PAL.barTrack;rr(bx,by,bw,bh,3);ctx.fill();
  // ghost of the target ahead of the animated fill
  if(goal>f+.002){ctx.fillStyle=pa('xpGhost',.45+.35*Math.sin(now/60));rr(edge,by,bw*(goal-f),bh,3);ctx.fill()}
  if(f>0){
    if(fl>0){ctx.save();ctx.fillStyle=pa('gold',.35*fl);rr(bx-4,by-4,Math.max(4,bw*f)+8,bh+8,6);ctx.fill()}
    ctx.fillStyle=fl>0?lerpCol('gold','xpFlash',fl):PAL.gold;rr(bx,by,Math.max(4,bw*f),bh,3);ctx.fill();
    if(fl>0)ctx.restore();
    ctx.fillStyle=PAL.cffffff_40;rr(bx+2,by+1,Math.max(1,bw*f-4),2,1);ctx.fill();
    // moving shine
    const sh=bx+((now/700)%1.6-.3)*bw;if(sh<edge){ctx.save();ctx.beginPath();ctx.rect(bx,by,bw*f,bh);ctx.clip();
      ctx.fillStyle=PAL.cffffff_35;ctx.beginPath();ctx.moveTo(sh,by);ctx.lineTo(sh+10,by);ctx.lineTo(sh+4,by+bh);ctx.lineTo(sh-6,by+bh);ctx.fill();ctx.restore()}
    if(fl>0){ctx.fillStyle=pa('white',fl);ctx.beginPath();ctx.arc(edge,by+bh/2,3+3*fl,0,7);ctx.fill()}
  }
  for(const p of XPV.sparks){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;
    ctx.globalAlpha=Math.max(0,1-p.t/.6);ctx.fillStyle=p.t<.15?PAL.white:PAL.gold;ctx.fillRect(p.x-1.5,p.y-1.5,3,3)}
  ctx.globalAlpha=1;XPV.sparks=XPV.sparks.filter(p=>p.t<.6);
}
function drawStar(x,y,r1,r2,n,rot,col){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,r=i%2?r2:r1;i?ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.closePath();ctx.fill()}
// letters hop one after another, left to right, in a loop
function bounceText(txt,x,y,size,fill,t,lw=8){
  ctx.font='800 '+size+'px '+FONT;ctx.textBaseline='middle';ctx.textAlign='left';ctx.lineJoin='round';
  const ws=[...txt].map(c=>ctx.measureText(c).width),tot=ws.reduce((a,b)=>a+b,0);let cx=x-tot/2;
  const LH=DATA.anims.letterHop;
  [...txt].forEach((c,i)=>{const hop=anim('letterHop',t-LH.startDelay-i*LH.stagger).hop*size*LH.amp;
    ctx.lineWidth=lw;ctx.strokeStyle=PAL.ink;ctx.strokeText(c,cx,y-hop);ctx.fillStyle=fill;ctx.fillText(c,cx,y-hop);cx+=ws[i]});
  ctx.textAlign='center';
}
// tank shell drawn from simple shapes: brass case, dark band, coloured pointed nose, smoke puff behind
function drawShell(x,y,dir,side,fl){
  ctx.save();ctx.translate(x,y);if(dir>0)ctx.rotate(Math.PI);
  for(let k=1;k<=4;k++){ctx.globalAlpha=.25-k*.05;ctx.fillStyle=PAL.shellSmoke;ctx.beginPath();ctx.arc(Math.sin(G.time*20+k)*1.5,10+k*7,4+k*1.6,0,7);ctx.fill()}
  ctx.globalAlpha=1;sprB(side==='p'?'shellP':'shellE',0,0);
  if(fl){ctx.globalAlpha=.75;ctx.fillStyle=PAL.white;rr(-6,-17,12,28,4);ctx.fill()}
  ctx.restore();
}
// paint splat where a unit died: pops in with an overshoot, sits, then fades out
function drawSplat(p){
  const SA=anim('splat',p.t),pop=SA.pop,a=SA.alpha;if(a<=0)return;
  const x=sx(p.x),y=sy(p.z)+3,R=9*p.big*pop,col=p.side==='p'?PAL.c2f8df5:PAL.ce8343a,hi=p.side==='p'?PAL.c7cc0ff:PAL.cff8a80;
  ctx.save();ctx.globalAlpha=a*.92;ctx.translate(x,y);ctx.rotate(p.rot);ctx.scale(1,.72);ctx.fillStyle=col;ctx.beginPath();
  for(let i=0;i<=14;i++){const an=i/14*6.283,rr_=R*(1+.12*Math.sin(an*3+p.seed)+.06*Math.sin(an*5+p.seed*2));i?ctx.lineTo(Math.cos(an)*rr_,Math.sin(an)*rr_):ctx.moveTo(Math.cos(an)*rr_,Math.sin(an)*rr_)}
  ctx.closePath();ctx.fill();
  ctx.fillStyle=hi;ctx.globalAlpha=a*.55;ctx.beginPath();ctx.ellipse(-R*.25,-R*.25,R*.35,R*.18,-.5,0,7);ctx.fill();
  ctx.restore();
}
const FLAMES=[];
function drawFlame([fy,fx,fh,fw,sw,a]){
  ctx.globalAlpha=a;ctx.fillStyle=PAL.flameOuter;ctx.beginPath();ctx.moveTo(fx-fw,fy);ctx.quadraticCurveTo(fx-fw*.7,fy-fh*.55,fx+sw,fy-fh);ctx.quadraticCurveTo(fx+fw*.7,fy-fh*.55,fx+fw,fy);ctx.closePath();ctx.fill();
  ctx.fillStyle=PAL.flameMid;ctx.beginPath();ctx.moveTo(fx-fw*.7,fy);ctx.quadraticCurveTo(fx-fw*.45,fy-fh*.45,fx+sw*.8,fy-fh*.78);ctx.quadraticCurveTo(fx+fw*.45,fy-fh*.45,fx+fw*.7,fy);ctx.closePath();ctx.fill();
  ctx.fillStyle=PAL.flameCore;ctx.beginPath();ctx.moveTo(fx-fw*.35,fy);ctx.quadraticCurveTo(fx-fw*.2,fy-fh*.3,fx+sw*.5,fy-fh*.45);ctx.quadraticCurveTo(fx+fw*.2,fy-fh*.3,fx+fw*.35,fy);ctx.closePath();ctx.fill();ctx.globalAlpha=1}
// ---- arena looks: tinted trees and a different centre object per arena ----
function treeKey(g,a){const b=g?'treeY':'treeG',T=ARENAS[a||0].tint;return T?b+'_'+T:b} // tinted variants are baked PNGs
function drawPedObj(kind,x,y,sq){
  if(kind==='rocket'){spr('rocket',x,y+10,32*sq,.5,.84);return}
  spr('pedestal',x,y+10,26*sq,.5,1);const cy=y-6,now=nowMs()/1000;
  if(kind==='bomb'){sprB('bombPed',x,cy,sq);sprB('fuseSpark',x+7*sq,cy-31*sq,sq*anim('fuse',now).scale)}
  else{const n=kind==='ice'?'Ice':'Lava',by=cy+anim('pedBob',now).y*sq;
    sprB('crystal'+n,x,by,sq);ctx.globalAlpha=anim('pedGlow',now).alpha;sprB('glow'+n,x,by,sq);ctx.globalAlpha=1}
}
function drawFlyObj(kind,x,y,w,ang){
  if(kind==='rocket'){spr('rocketFly',x,y,w,.5,.62,ang);return}
  if(kind==='bomb')sprB('bombFly',x,y,1,ang+anim('bombSpin',nowMs()/1000).rot);
  else sprB(kind==='ice'?'crystalIceFly':'crystalLavaFly',x,y,1,ang);
}
function drawFX(){
  for(const f of VIS.fx){if(f.t<0)continue;const k=f.t/f.life,sc=f.big?DATA.fx.hit.bigScale:1,A=anim('hitFx',k);
    ctx.globalAlpha=Math.max(0,A.alpha);
    ctx.strokeStyle=PAL.cffd25a_90;ctx.lineWidth=A.line;ctx.beginPath();ctx.arc(f.x,f.y,A.ring*sc,0,7);ctx.stroke();
    if(k<.5){const q=A.star;drawStar(f.x,f.y,10*sc*q+3,4*sc*q+1.5,6,f.rot,PAL.goldTree);drawStar(f.x,f.y,6*sc*q+2,2.5*sc*q+1,6,f.rot+.3,PAL.cfff6d0)}
    ctx.globalAlpha=1}
}
function drawTank(s){
  const up=s===G.P,x=sx(s.x),y=up?UI.pTankY:UI.eTankY;
  ctx.fillStyle=PAL.c3c372d_26;ctx.beginPath();ctx.ellipse(x,y+22,32,8,0,0,7);ctx.fill();
  // ultimate aura while the double-shot buff is active: glow, ring of flames, rising embers
  if(s.buff>0){const fade=Math.min(1,s.buff*3,(s.buffMax-s.buff+.05)*4),pul=1+Math.sin(G.time*14)*.06;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6*fade;const gr=ctx.createRadialGradient(x,y,6,x,y,52*pul);
    gr.addColorStop(0,PAL.cffc850_90);gr.addColorStop(.5,PAL.cff5a14_45);gr.addColorStop(1,PAL.cff2800_0);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,52*pul,0,7);ctx.fill();ctx.restore();
    for(let i=0;i<14;i++){const an=i/14*6.283+G.time*1.5,rx=x+Math.cos(an)*34,ry=y+Math.sin(an)*20+8,t=G.time*12+i*1.9;
      drawFlame([ry,rx,(16+7*Math.sin(t)+4*Math.sin(t*2.1))*fade,(6+1.5*Math.sin(t*1.3))*fade,Math.sin(t*.8)*3,fade])}
    for(let i=0;i<10;i++){const q=((G.time*.9+i*.1)%1),ex=x+Math.sin(i*2.7+G.time*3)*30,ey=y+14-q*60;ctx.globalAlpha=(1-q)*fade;ctx.fillStyle=i%3?PAL.goldTree:PAL.ember;ctx.fillRect(ex-1.5,ey-1.5,3,3)}
    ctx.globalAlpha=1}
  spr(up?'tankP':'tankE',x,y+(up?s.recoil:-s.recoil),up?68:72);
  if(s.buff>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.12*Math.sin(G.time*18);spr(up?'tankP':'tankE',x,y+(up?s.recoil:-s.recoil),up?68:72);ctx.restore()}
  if(s.buff>0){const e=-Math.PI/2+6.283*Math.min(1,s.buff/(s.buffMax||1));ctx.lineCap='round';
    ctx.save();ctx.strokeStyle=PAL.c2fe0a0_30;ctx.lineWidth=16;ctx.beginPath();ctx.arc(x,y,33,-Math.PI/2,e);ctx.stroke();ctx.restore();
    ctx.strokeStyle=PAL.ultRing;ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,33,-Math.PI/2,e);ctx.stroke();
    ctx.strokeStyle=PAL.cffffff_60;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,33,-Math.PI/2,e);ctx.stroke()}
  if(s.flash>0){const k=s.flash/.09,my=up?y-36:y+30,r=VR()*6.28;
    drawStar(x,my,(16+VR()*4)*k+4,6*k+2,7,r,PAL.cffaa1e_95);drawStar(x,my,9*k+3,3.5*k+1,7,r+.25,PAL.cfff7d6);}
}
function drawBarrelShape(x,y,w,roll,col,icon,fl=0){
  const h=w*.78;ctx.save();ctx.translate(x,y);
  ctx.fillStyle=fl>0?PAL.white:icon?col:PAL.barrel;ctx.strokeStyle=icon?PAL.c000000_0:PAL.barrelEdge;ctx.lineWidth=2;
  rr(-w/2,-h/2,w,h,w*.22);ctx.fill();if(!icon)ctx.stroke();
  ctx.save();rr(-w/2,-h/2,w,h,w*.22);ctx.clip();
  ctx.fillStyle=icon?PAL.cff8c28_90:PAL.barrelHoop;
  for(let i=-1;i<3;i++){const yy=-h/2+(((roll*1.6+i*.45)%0.9)/0.9)*h*1.1-h*.05;ctx.fillRect(-w/2,yy,w,h*.13)}
  if(!icon){ctx.fillStyle=PAL.cffffff_22;ctx.fillRect(-w/2+2,-h/2,w*.18,h)}
  ctx.restore();ctx.restore();
}
function drawFlask(f){
  const s=G.P,u=UPG[f.type],k=anim('flaskSpawn',f.born).scale*(f.hit>0?1.12:1),x=sx(f.x),y=UI.flaskY,bob=anim('flaskBob',G.time+f.x/3).y;
  ctx.save();ctx.translate(x,y+bob);ctx.scale(k,k);
  ctx.fillStyle=PAL.c3c372d_15;ctx.beginPath();ctx.ellipse(0,20,15,4,0,0,7);ctx.fill();
  FLASH=f.hit>0?f.hit/.12:0;spr(u.img,0,0,CFG.flask.drawPx);FLASH=0;if(u.icon==='barrel')sprB('barrelIcon',0,3);ctx.restore();
  const by=y+24,bw=40;if(f.hp<CFG.flask.hp)bar(x-bw/2,by,bw,7,f.hp/CFG.flask.hp,PAL.hpGreen);
  TF_LOCK=f.tf||null;const info=upgInfo(s,f.type);TF_LOCK=null;outlined(info.t,x,y-42,12,PAL.white);outlined(info.v,x,y-28,12,u.col===PAL.cc9c2b4?PAL.white:u.col);
}
function drawUnit(u){
  let x=sx(u.x),y=sy(u.z);const pop=u.hit>0?(u.giant?CFG.giant.hitScale:1.15):1;
  if(u.giant){
    const w=GIANT_PX*u.vis*pop,fd=u.side==='p'?-1:1,rec=u.fire>0?Math.sin(Math.min(1,u.fire/.2)*Math.PI)*4:0;
    y-=fd*rec;
    ctx.fillStyle=PAL.c3c372d_20;ctx.beginPath();ctx.ellipse(x,y+w*.36,w*.36,w*.14,0,0,7);ctx.fill();
    FLASH=u.hit>0?Math.min(1,u.hit/.1)*.85:0;spr(u.side==='p'?'giant':'giantE',x,y,w,.5,.5,0);FLASH=0;
    if(u.fire>.08){const my=y+fd*w*.62,a=(u.fire-.08)/.12;ctx.fillStyle=pa('muzzle',a);ctx.beginPath();ctx.arc(x,my,7*a+3,0,7);ctx.fill();
      ctx.fillStyle=pa('muzzleCore',a);ctx.beginPath();ctx.arc(x,my,3*a+1.5,0,7);ctx.fill()}
    bar(x-15,y-w*.6-6,30,4,u.hp/u.max,u.side==='p'?PAL.barP:PAL.barE);
  }else{
    ctx.fillStyle=PAL.c3c372d_18;ctx.beginPath();ctx.ellipse(x,y+5,6.5,2.6,0,0,7);ctx.fill();
    let tilt=Math.sin(u.walk)*.2,sc=pop;
    // little hop on every step while walking
    if(Math.hypot(u.vx,u.vz)>.15){const st=Math.abs(Math.sin(u.walk));y-=st*3.5;sc*=1+(1-st)*.05}
    let slash=0,ph=0;const ax=u.ax||0,az=u.az||0;
    if(u.atkT>0){ph=1-u.atkT/.2;const k=ph<.3?ph/.3:Math.max(0,1-(ph-.3)/.7);
      x-=ax*(ph<.12?ph/.12:0)*2;x+=ax*k*8;y+=az*k*8*PZ/PX;
      tilt=ax*k*.7+(Math.abs(ax)<.3?(u.side==='p'?.35:-.35)*k:0);sc*=1+k*.22;slash=ph>.2&&ph<.75?1-Math.abs(ph-.45)/.3:0}
    if(G.state!=='play'&&((G.state==='win')===(u.side==='p'))){const ph=G.time*12+(u.walk||0),st=Math.abs(Math.sin(ph));y-=st*3.5;tilt=Math.sin(ph)*.2}
    FLASH=u.hit>0?Math.min(1,u.hit/.1):0;spr(u.side==='p'?'manB':'manR',x,y+5,SOLDIER_PX*sc,.5,1,tilt);FLASH=0;
    if(slash>0){const cx=x+ax*9,cy=y-6+az*9*PZ/PX,a0=Math.atan2(az*PZ/PX,ax);ctx.globalAlpha=Math.min(1,slash*1.4);
      ctx.strokeStyle=PAL.white;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,8,a0-1.3+ph*1.2,a0+.2+ph*1.4);ctx.stroke();
      ctx.strokeStyle=u.side==='p'?PAL.c8fd0ff:PAL.cffb0a8;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,5.5,a0-1+ph*1.2,a0+ph*1.4);ctx.stroke();ctx.globalAlpha=1}
    if(u.hp<u.max)bar(x-6,y-21,12,2.5,u.hp/u.max,u.side==='p'?PAL.barP:PAL.barE);
  }
}
function drawFence(f){
  const x=sx(f.x),y=sy(f.z),w=f.w*PX,h=24,i=IMG[f.side==='p'?'fenceP':'fenceE'],sh=f.hitT>0?rnd(-1,1):0;
  ctx.fillStyle=PAL.c3c372d_22;ctx.beginPath();ctx.ellipse(x,y+h*.38,w*.5,5,0,0,7);ctx.fill();
  if(i&&i.complete&&i.naturalWidth){FLASH=f.hitT>0?.7:0;spr(f.side==='p'?'fenceP':'fenceE',x+sh,y+h*.45,w,.5,1,0,h/(w*i.naturalHeight/i.naturalWidth));FLASH=0}
  bar(x-15,y-h*.55-6,30,4,f.hp/f.max,f.side==='p'?PAL.barP:PAL.barE); // same bar as units and tanks
}
function drawWave(w){
  const C=CFG.wave,x=sx(0),y=sy(w.z),hw=C.width*PX/2,hl=C.length*PZ/2,d=w.dir,col=w.side==='p'?'waveP':'waveE';
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.max(0,1-(w.fade||0)/.4);
  const g=ctx.createLinearGradient(0,-d*hl,0,d*hl);g.addColorStop(0,pa(col,0));g.addColorStop(1,pa(col,.55));
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-hw,-d*hl);ctx.quadraticCurveTo(0,d*hl*1.6,hw,-d*hl);ctx.quadraticCurveTo(0,d*hl*.2,-hw,-d*hl);ctx.fill();
  ctx.strokeStyle=PAL.cffffff_85;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-hw,-d*hl);ctx.quadraticCurveTo(0,d*hl*1.6,hw,-d*hl);ctx.stroke();
  ctx.restore();
}
// rocket heading on screen, from its sideways wobble speed and forward speed
const rocketAngle=r=>Math.atan2((r.vx||0)*PX,-r.dir*CFG.rocket.speed*PZ);
function drawRocket(r){
  const R=CFG.rocket,x=sx(r.x),y=sy(r.z),w=R.w*PX*R.visScale,len=R.h*PZ*R.visScale;
  const ang=rocketAngle(r);
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  const fl=len*.42+Math.sin(G.time*40)*4;
  const g=ctx.createLinearGradient(0,len*.15,0,len*.15+fl);g.addColorStop(0,PAL.cffdc5a_95);g.addColorStop(1,PAL.cff5a28_0);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-w*.18,len*.15);ctx.quadraticCurveTo(0,len*.15+fl*1.2,w*.18,len*.15);ctx.fill();
  ctx.restore();
  FLASH=r.hit>0?r.hit/.1:0;drawFlyObj(ARENAS[G.arena||0].obj,x,y,w,ang);FLASH=0;
}
// ---- render layers: each one draws one sorting layer; the order comes from data/render.json ----
function L_paper(){
  // squared notebook paper, cached at screen resolution so the lines stay crisp
  const AR=ARENAS[G.arena||0];if(PAPER.k!==K+':'+(G.arena||0)){const c=PAPER.c;c.width=cv.width;c.height=cv.height;const p=c.getContext('2d');p.setTransform(K,0,0,K,0,0);
    p.fillStyle=AR.paper;p.fillRect(0,0,W,H);p.strokeStyle=AR.grid;p.lineWidth=1/K*1.2;const step=13;
    p.beginPath();for(let x=step/2;x<W;x+=step){p.moveTo(x,0);p.lineTo(x,H)}for(let y=step/2;y<H;y+=step){p.moveTo(0,y);p.lineTo(W,y)}p.stroke();PAPER.k=K+':'+(G.arena||0)}
  ctx.drawImage(PAPER.c,0,0,W,H);
}
function L_slickOil(){
  for(const o of G.slicks){const x=sx(o.x),y=sy(o.z),a=Math.min(1,o.t*4)*Math.min(1,(CFG.barrel.slickTime-o.t)/1.2);
    ctx.globalAlpha=a*.92;ctx.fillStyle=PAL.oil;ctx.beginPath();
    for(let i=0;i<=24;i++){const t=i/24*6.283,rr_=1+.14*Math.sin(t*3+o.seed)+.08*Math.sin(t*5+o.seed*2);
      const px=x+Math.cos(t)*o.r*PX*rr_,py=y+Math.sin(t)*o.r*PZ*rr_*.85;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
    ctx.fill();ctx.fillStyle=PAL.c7882a0_35;ctx.beginPath();ctx.ellipse(x-o.r*PX*.3,y-o.r*PZ*.25,o.r*PX*.28,o.r*PZ*.12,-.3,0,7);ctx.fill();
    ctx.fillStyle=PAL.cb478ff_18;ctx.beginPath();ctx.ellipse(x+o.r*PX*.2,y+o.r*PZ*.15,o.r*PX*.22,o.r*PZ*.1,.4,0,7);ctx.fill();
    ctx.globalAlpha=1}
}
function L_forest(){
  // forest & pedestals, back-to-front
  const peds=G.peds.slice().sort((a,b)=>a.z-b.z);let pi=0;
  const drawPed=p=>{const x=sx(p.x),y=sy(p.z);
    if(p.dead)return;
    const sq=p.hit>0?1.06:1;FLASH=p.hit>0?p.hit/.12:0;drawPedObj(ARENAS[G.arena||0].obj,x,y,sq);FLASH=0;
    if(p.hp<CFG.pedestal.hp)bar(x-15,y-58,30,4,p.hp/CFG.pedestal.hp,PAL.hpGreen)};
  // forest cached in two images (behind / in front of the rocket pedestals); only a small patch is repainted when a tree falls
  const cachedT=t=>!t.dead&&t.hp>=t.max,PZc=CFG.pedestal.z,layerOf=t=>t.z<PZc?0:1,drawTS=t=>{ctx.fillStyle=PAL.c3c3223_25;ctx.beginPath();ctx.ellipse(sx(t.x)+1,sy(t.z)+7,8,3,0,0,7);ctx.fill()},drawT=t=>spr(treeKey(t.g,G.arena||0),sx(t.x),sy(t.z)+7,21,.5,.85);
  const sig=K+':'+G.treesInit+':'+G.trees.length;
  if(FOREST.g!==G||FOREST.sig!==sig){
    if(IMG.treeG.complete&&IMG.treeY.complete){
      const fcs=FOREST.L.map(c=>{c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');x.setTransform(K,0,0,K,0,0);return x});
      const keep=ctx;for(const t of G.trees){t.gone=!cachedT(t);if(!t.gone){ctx=fcs[layerOf(t)];drawTS(t)}}for(const t of G.trees)if(cachedT(t)){ctx=fcs[layerOf(t)];drawT(t)}ctx=keep;FOREST.sig=sig;FOREST.g=G}
  }else{
    for(const d of G.trees)if(!cachedT(d)&&!d.gone){d.gone=true;
      const x0=sx(d.x)-14,y0=sy(d.z)-18,w=28,h=32,keep=ctx;
      FOREST.L.forEach((c,li)=>{const fc=c.getContext('2d');fc.save();fc.beginPath();fc.rect(x0,y0,w,h);fc.clip();fc.clearRect(x0,y0,w,h);ctx=fc;
        const nb=[];for(const t of G.trees)if(cachedT(t)&&layerOf(t)===li){const tx=sx(t.x),ty=sy(t.z);if(tx>x0-20&&tx<x0+w+14&&ty>y0-12&&ty<y0+h+30)nb.push(t)}nb.forEach(drawTS);nb.forEach(drawT)
        fc.restore()});ctx=keep}
  }
  ctx.drawImage(FOREST.L[0],0,0,W,H);
  while(pi<peds.length){drawPed(peds[pi]);pi++}
  ctx.drawImage(FOREST.L[1],0,0,W,H);
  // damaged trees are drawn live: they shrink with lost HP and sway from the trunk when hit
  // damaged trees are drawn live (sway on hit); the healthy trees just in front are redrawn on top to keep the depth order
  const dmgT=G.trees.filter(t=>!t.dead&&t.hp<t.max);
  // live-drawn damaged trees: redraw every tree and pedestal around them in strict Y order on top of the cache
  if(dmgT.length){
    // only things LOWER on screen than a damaged tree can cover it, so redraw the damaged trees plus every tree/pedestal
    // that overlaps them from below (and, transitively, whatever overlaps those from below), in strict Y order
    const set=new Set(dmgT),q=[...dmgT],peds=new Set();
    const overl=(a,b)=>{const ax=sx(a.x),bx=sx(b.x),ay=sy(a.z),by=sy(b.z),pa=a.x!==undefined&&a.hp!==undefined&&a.g===undefined,pb=b.g===undefined;
      return b.z>a.z&&Math.abs(bx-ax)<(pa||pb?30:22)&&by-ay<(pa?20:34)};
    while(q.length){const a=q.pop();
      for(let ix=-1;ix<=1;ix++)for(let iz=0;iz<=1;iz++){const c=G.grid.get(cellKey(a.x+ix*.5,a.z+iz*.5));if(c)for(const m of c)if(!m.dead&&!set.has(m)&&overl(a,m)){set.add(m);q.push(m)}}
      for(const p of G.peds)if(!p.dead&&!peds.has(p)&&overl(a,p)){peds.add(p);q.push(p)}}
    const list=[...set].map(t=>[t.z,t,0]);for(const p of peds)list.push([p.z,p,1]);
    list.sort((a,b)=>a[0]-b[0]);
    for(const t of dmgT){ctx.fillStyle=PAL.c3c3223_25;ctx.beginPath();ctx.ellipse(sx(t.x)+1,sy(t.z)+7,8,3,0,0,7);ctx.fill()}
    for(const[,t,isPed]of list){if(isPed){drawPed(t);continue}
      if(t.hp<t.max){const ph=t.hit>0?.32-t.hit:1,dec=t.hit>0?t.hit/.32:0,rot=dec>0?Math.sin(ph*38)*.28*dec*(t.sw||1):0,sq=dec>0?Math.sin(ph*50)*.1*dec:0;
        FLASH=t.hit>.2?Math.min(1,(t.hit-.2)/.12):0;spr(treeKey(t.g,G.arena||0),sx(t.x),sy(t.z)+7,21*(1+sq),.5,.85,rot,1-sq);FLASH=0}
      else spr(treeKey(t.g,G.arena||0),sx(t.x),sy(t.z)+7,21,.5,.85)}}
  for(const t of dmgT)bar(sx(t.x)-8,sy(t.z)-18,16,3,t.hp/t.max,PAL.hpGreen);
}
function L_walls(){
  drawWall(G.E);drawWall(G.P);
}
function L_xpBar(){
  drawExp();
}
function L_waves(){
  for(const w of G.waves)drawWave(w);
}
function L_barrels(){
  for(const b of G.barrels){const x=sx(b.x),y=sy(b.z),bob=Math.abs(Math.sin(b.roll*7))*2;
    ctx.fillStyle=PAL.c3c372d_22;const bw=44*CFG.barrel.radius/.44;ctx.beginPath();ctx.ellipse(x,y+bw*.32,bw/2,bw*.16,0,0,7);ctx.fill();
    drawBarrelShape(x,y-bob*2,bw,b.roll,'',false,b.hit>0?1:0)}
}
function L_splats(){
  for(const p of G.splats)drawSplat(p);
}
function L_slickFire(){
  for(const o of G.slicks){const x=sx(o.x),y=sy(o.z),life=CFG.barrel.slickTime,a=Math.min(1,o.t*3)*Math.min(1,(life-o.t)/.8);if(a<=0)continue;
    // glow + embers
    ctx.globalAlpha=.35*a;const gr=ctx.createRadialGradient(x,y,2,x,y,o.r*PX);gr.addColorStop(0,PAL.cff9628_90);gr.addColorStop(1,PAL.cff5a14_0);
    ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(x,y,o.r*PX,o.r*PZ*.85,0,0,7);ctx.fill();
    const area=Math.max(1,(o.r/CFG.barrel.slickR)**2);
    for(let i=0;i<Math.round(26*area);i++){const ph=((G.time*.9+i*.137+o.seed)%1),ang=o.seed*3.1+i*2.39996,rad=Math.sqrt((i*.381+o.seed)%1)*.85;
      const ex=x+Math.cos(ang)*o.r*PX*rad+Math.sin(G.time*4+i)*3,ey=y+Math.sin(ang)*o.r*PZ*rad*.85-ph*34;
      ctx.globalAlpha=a*(1-ph);ctx.fillStyle=i%3?PAL.goldTree:PAL.ember;ctx.fillRect(ex-1.3,ey-1.3,2.6,2.6)}
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*a;const gl=ctx.createRadialGradient(x,y,2,x,y,o.r*PX*1.1);gl.addColorStop(0,PAL.cffaa3c_100);gl.addColorStop(1,PAL.cff3c00_0);
    ctx.fillStyle=gl;ctx.beginPath();ctx.ellipse(x,y-6,o.r*PX*1.1,o.r*PZ,0,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';
    for(let i=0;i<Math.round(34*area);i++){const ang=o.seed*7.3+i*2.39996,rad=Math.sqrt(((o.seed*13.7+i*.618)%1))*.9,
      fx=x+Math.cos(ang)*o.r*PX*rad,fy=y+Math.sin(ang)*o.r*PZ*rad*.85,t=G.time*10+i*1.7,
      fh=(22+9*Math.sin(t)+6*Math.sin(t*2.3))*a*(1.2-rad*.45),fw=(8+2*Math.sin(t*1.3))*a,sw=Math.sin(t*.8)*3;FLAMES.push([fy,fx,fh,fw,sw,a])}
    for(let i=0;i<Math.round(8*area);i++){const ph=((G.time*.5+i*.125+o.seed)%1),px=x+Math.sin(o.seed+i*2.1)*o.r*PX*.6+Math.sin(G.time*2+i)*5,py=y-20-ph*45;
      ctx.globalAlpha=a*.35*(1-ph);ctx.fillStyle=PAL.smoke;ctx.beginPath();ctx.arc(px,py,6+ph*10,0,7);ctx.fill()}
    ctx.globalAlpha=1}
}
function L_actors(){
  const foot=u=>sy(u.z)+(u.giant?GIANT_PX*u.vis*.38:5);
  // units, tanks and fences sorted by where they touch the ground, so lower things overlap higher ones
  const ds=[];for(const u of G.units)ds.push([foot(u),u,0]);for(const f of G.fences)ds.push([sy(f.z)+8,f,1]);for(const fl of FLAMES)ds.push([fl[0],fl,2]);FLAMES.length=0;
  ds.sort((a,b)=>a[0]-b[0]);for(const d of ds)d[2]===2?drawFlame(d[1]):d[2]?drawFence(d[1]):drawUnit(d[1]);
}
function L_bullets(){
  for(const b of G.bullets)if(!b.ghost){const x=sx(b.x),y=sy(b.z),d=Math.sign(b.dz),L=Math.min(85,b.dist*PZ);
    if(b.fire){ // ultimate bullets: fiery trail with flickering sparks
      const fl=Math.min(70,b.dist*PZ),g2=ctx.createLinearGradient(x,y,x,y-d*fl);g2.addColorStop(0,PAL.cff5a14_95);g2.addColorStop(.5,PAL.cffaa1e_55);g2.addColorStop(1,PAL.cff3c00_0);
      ctx.fillStyle=g2;ctx.beginPath();ctx.moveTo(x-6,y);ctx.quadraticCurveTo(x-3+Math.sin(G.time*40+b.x)*2,y-d*fl*.5,x,y-d*fl);ctx.quadraticCurveTo(x+3+Math.sin(G.time*37+b.x)*2,y-d*fl*.5,x+6,y);ctx.fill();
      for(let k=0;k<4;k++){const q=((G.time*6+k*.25+b.x)%1),px=x+Math.sin(k*2.3+G.time*20)*4,py=y-d*q*fl;ctx.globalAlpha=1-q;ctx.fillStyle=k%2?PAL.sparkYellow:PAL.cff5a1a;ctx.fillRect(px-1.5,py-1.5,3,3)}
      ctx.globalAlpha=1;ctx.fillStyle=PAL.ember;ctx.beginPath();ctx.arc(x,y,3.5,0,7);ctx.fill();spr('bullet',x,y,10,.5,.5,d>0?Math.PI:0);continue}
    const g=ctx.createLinearGradient(x,y,x,y-d*L);g.addColorStop(0,PAL.cffe678_85);g.addColorStop(1,PAL.cffc83c_0);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-4.5,y);ctx.lineTo(x+4.5,y);ctx.lineTo(x+1,y-d*L);ctx.lineTo(x-1,y-d*L);ctx.fill();
    ctx.fillStyle=PAL.cfffff0_70;ctx.beginPath();ctx.moveTo(x-1.6,y);ctx.lineTo(x+1.6,y);ctx.lineTo(x,y-d*L*.6);ctx.fill();
    spr('bullet',x,y,10,.5,.5,d>0?Math.PI:0)}
}
function L_hitFx(){
  drawFX();
}
function L_shells(){
  for(const sh of G.shells)if(sh.dir&&!sh.done){const tx=sx(sh.x),ty=sy(sh.z),L=Math.min(130,sh.dist*PZ),d=sh.dir>0?-1:1;
    const tg=ctx.createLinearGradient(tx,ty,tx,ty+d*L);tg.addColorStop(0,sh.side==='p'?PAL.c78beff_80:PAL.cff8c78_80);tg.addColorStop(1,PAL.cffffff_0);
    ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(tx-6,ty);ctx.lineTo(tx+6,ty);ctx.lineTo(tx+1.5,ty+d*L);ctx.lineTo(tx-1.5,ty+d*L);ctx.fill();
    drawShell(sx(sh.x),sy(sh.z),sh.dir,sh.side,sh.hit>0);if(sh.hp<(CFG.giant.shellHp||1))bar(sx(sh.x)-10,sy(sh.z)-(sh.dir<0?30:-24),20,3,sh.hp/CFG.giant.shellHp,PAL.hpGreen)}
}
function L_booms(){
  for(const b of VIS.booms){const A=anim('boom',b.t),R=b.r||.6,x=sx(b.x),y=sy(b.z),e=A.spread;
    ctx.fillStyle=pa('boomFill',A.fill);ctx.beginPath();ctx.ellipse(x,y,R*PX*e,R*PZ*e,0,0,7);ctx.fill();
    ctx.strokeStyle=pa('boomRing',A.stroke);ctx.lineWidth=A.line;ctx.beginPath();ctx.ellipse(x,y,R*PX*e,R*PZ*e,0,0,7);ctx.stroke();
    if(b.t<animLen('boom')*.35){ctx.fillStyle=pa('boomCore',A.core);ctx.beginPath();ctx.arc(x,y,A.coreR,0,7);ctx.fill()}}
}
function L_rockets(){
  for(const r of G.rockets)drawRocket(r);
}
function L_tanks(){
  drawTank(G.E);drawTank(G.P);
}
function L_flasks(){
  for(const f of G.P.flasks)drawFlask(f); // flasks always on top
}
function L_particles(){
  for(const p of VIS.parts){ctx.globalAlpha=Math.max(0,1-p.t/p.life);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  ctx.globalAlpha=1;
}
function L_floatTexts(){
  for(const t of VIS.texts){const A=anim('floatText',t.t);ctx.globalAlpha=A.alpha;outlined(t.txt,t.x,t.y+A.dy,t.size,t.col)}
  ctx.globalAlpha=1;
}
function L_banners(){
  if(G.cb&&G.cb.t<animLen('bannerComeback')){const t=G.cb.t,A=anim('bannerComeback',t),sc=A.scale,me=G.cb.side==='p';
    ctx.globalAlpha=A.alpha;ctx.save();ctx.translate(W/2,sy(CFG.tree.midZ));ctx.scale(sc,sc);
    bounceText(me?T.game.comebackOwn:T.game.comebackFoe,0,0,24,me?PAL.teamP:PAL.comebackFoe,t,4.8);ctx.restore();ctx.globalAlpha=1}
  if(G.tb&&G.tb.t<animLen('bannerTempo')&&!(G.cb&&G.cb.t<animLen('bannerComeback'))){const t=G.tb.t,A=anim('bannerTempo',t),sc=A.scale;
    ctx.globalAlpha=A.alpha;ctx.save();ctx.translate(W/2,sy(CFG.tree.midZ));ctx.scale(sc,sc);bounceText(tx(T.game.tempo,G.tb.pct),0,0,20,PAL.gold,t,4.8);ctx.restore();ctx.globalAlpha=1}
}
function L_endScreen(){
  if(G.state!=='play')drawEnd();
}
function draw(){
  if(Clock.frozen)VRNG.seed((G.time*60|0)+1); // repeatable frame while frozen
  ctx.setTransform(K,0,0,K,0,0);
  if(VIS.shake>0){const m=VIS.shake*DATA.fx.shake.pxPerUnit;ctx.translate(rnd(-m,m),rnd(-m,m))}
  for(const n of DATA.render.layers)LAYERS[n]();
}
const LAYERS={paper:L_paper,slickOil:L_slickOil,forest:L_forest,walls:L_walls,xpBar:L_xpBar,waves:L_waves,barrels:L_barrels,splats:L_splats,slickFire:L_slickFire,actors:L_actors,bullets:L_bullets,hitFx:L_hitFx,shells:L_shells,booms:L_booms,rockets:L_rockets,tanks:L_tanks,flasks:L_flasks,particles:L_particles,floatTexts:L_floatTexts,banners:L_banners,endScreen:L_endScreen};

// ---- end of match: confetti and banner, the game keeps running underneath ----
const CONF=[];const CCOL=[PAL.teamE,PAL.gold,PAL.teamP,PAL.hpGreen,PAL.upgPurple,PAL.upgOrange,PAL.white];
function drawEnd(){
  const now=nowMs(),dt=Math.min(.05,(now-(drawEnd.t||now))/1000);drawEnd.t=now;
  if(G.endT<3.5&&!Flow.paused()&&!(Clock.frozen&&CONF.length)){const n=G.endT<.1&&CONF.length<70?70:(VR()<.7?1:0);for(let i=0;i<n;i++)CONF.push({x:VR()*W,y:CONF.length<70?-VR()*H*.6:-10,vy:60+VR()*90,vx:(VR()-.5)*40,
    r:VR()*6.28,vr:(VR()-.5)*10,w:5+VR()*5,h:3+VR()*4,c:CCOL[Math.floor(VR()*CCOL.length)],ph:VR()*6})}
  for(const c of CONF){if(!Flow.paused()){c.y+=c.vy*dt;c.x+=(c.vx+Math.sin(now/300+c.ph)*25)*dt;c.r+=c.vr*dt}
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.scale(1,Math.abs(Math.cos(now/200+c.ph))+.2);ctx.fillStyle=c.c;ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);ctx.restore()}
  for(let i=CONF.length-1;i>=0;i--)if(CONF[i].y>H+20)CONF.splice(i,1);
  const win=G.state==='win';ctx.save();ctx.translate(W/2,H*.42);const sc=anim('bannerEnd',G.endT).scale;ctx.scale(sc,sc);
  bounceText(win?T.game.win:T.game.lose,0,0,46,win?PAL.gold:PAL.loseRed,G.endT%DATA.anims.bannerEnd.letterLoop);ctx.restore();
}
