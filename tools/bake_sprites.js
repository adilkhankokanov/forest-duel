// Bakes the procedural shapes the game used to draw with canvas paths into fixed-scale PNGs.
// Run once: node tools/bake_sprites.js   (needs the built dist/forest-duel.html for tree tints)
// Output: assets/sprites/<key>.png + src/data/sprites.json (logical size + pivot per baked sprite)
const {chromium}=require(process.env.PW||'/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'assets/sprites'),SCALE=4;
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file://'+path.join(ROOT,'dist/forest-duel.html'));await p.waitForTimeout(800);
  const res=await p.evaluate((SCALE)=>{
    const out={},meta={};
    // box = logical bounds [x0,y0,x1,y1] in game pixels around the shape's own origin (pivot)
    function bake(key,box,draw){
      const [x0,y0,x1,y1]=box,w=x1-x0,h=y1-y0,c=document.createElement('canvas');c.width=Math.round(w*SCALE);c.height=Math.round(h*SCALE);
      const x=c.getContext('2d');x.scale(SCALE,SCALE);x.translate(-x0,-y0);x.lineJoin='round';draw(x);
      out[key]=c.toDataURL('image/png');meta[key]={w,h,pivot:[+(-x0/w).toFixed(4),+(-y0/h).toFixed(4)]};
    }
    const R=(x,X,Y,W,H,r)=>{x.beginPath();x.roundRect(X,Y,W,H,r)};
    const INK='#22252c';
    for(const side of['p','e'])bake(side==='p'?'shellP':'shellE',[-7,-18,7,12],x=>{
      x.lineWidth=2;x.strokeStyle=INK;
      x.fillStyle='#e0a83a';R(x,-5,-4,10,14,2.5);x.fill();x.stroke();
      x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-3.2,-3,2,11);
      x.fillStyle='#5b4a3a';x.fillRect(-5,6,10,3);
      x.fillStyle=side==='p'?'#3d8ef0':'#e8443a';x.beginPath();x.moveTo(-5,-4);x.quadraticCurveTo(-5,-12,0,-16);x.quadraticCurveTo(5,-12,5,-4);x.closePath();x.fill();x.stroke();
      x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(-1.8,-9,1.2,3,0,0,7);x.fill()});
    bake('bombPed',[-13,-33,13,5],x=>{x.lineWidth=2.5;x.strokeStyle=INK;
      x.fillStyle='#2b2f37';x.beginPath();x.arc(0,-8,11,0,7);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(-4,-12,3.5,0,7);x.fill();
      x.strokeStyle='#8a5a2a';x.lineWidth=2.5;x.beginPath();x.moveTo(4,-18);x.quadraticCurveTo(10,-26,7,-30);x.stroke()});
    bake('fuseSpark',[-3.5,-3.5,3.5,3.5],x=>{x.fillStyle='#ffd23a';x.beginPath();x.arc(0,0,3.5,0,7);x.fill();x.fillStyle='#ff6a1a';x.beginPath();x.arc(0,0,1.8,0,7);x.fill()});
    bake('bombFly',[-14,-14,14,14],x=>{x.lineWidth=2.5;x.strokeStyle=INK;
      x.fillStyle='#2b2f37';x.beginPath();x.arc(0,0,12,0,7);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(-4,-4,3.5,0,7);x.fill()});
    for(const ice of[true,false]){const c1=ice?'#bfefff':'#ffb347',c2=ice?'#5cc8f5':'#e8401a',n=ice?'Ice':'Lava';
      bake('crystal'+n,[-12,-36,12,4],x=>{x.lineWidth=2.5;x.strokeStyle=INK;
        x.fillStyle=c2;x.beginPath();x.moveTo(0,-34);x.lineTo(10,-12);x.lineTo(0,2);x.lineTo(-10,-12);x.closePath();x.fill();x.stroke();
        x.fillStyle=c1;x.beginPath();x.moveTo(0,-34);x.lineTo(-10,-12);x.lineTo(0,-14);x.closePath();x.fill()});
      bake('glow'+n,[-18,-32,18,4],x=>{x.fillStyle=c1;x.beginPath();x.arc(0,-14,18,0,7);x.fill()});
      bake('crystal'+n+'Fly',[-13,-22,13,16],x=>{x.lineWidth=2.5;x.strokeStyle=INK;
        x.fillStyle=ice?'#5cc8f5':'#e8401a';x.beginPath();x.moveTo(0,-20);x.lineTo(11,0);x.lineTo(0,14);x.lineTo(-11,0);x.closePath();x.fill();x.stroke();
        x.fillStyle=ice?'#e6fbff':'#ffd23a';x.beginPath();x.moveTo(0,-20);x.lineTo(-11,0);x.lineTo(0,-2);x.closePath();x.fill()});
    }
    // barrel icon shown on the barrel flask (the old drawBarrelShape in icon mode, roll 0)
    bake('barrelIcon',[-7.5,-5.85,7.5,5.85],x=>{const w=15,h=w*.78;x.fillStyle='#fff';R(x,-w/2,-h/2,w,h,w*.22);x.fill();
      x.save();R(x,-w/2,-h/2,w,h,w*.22);x.clip();x.fillStyle='rgba(255,140,40,.9)';
      for(let i=-1;i<3;i++){const yy=-h/2+(((i*.45)%0.9+0.9)%0.9/0.9)*h*1.1-h*.05;x.fillRect(-w/2,yy,w,h*.13)}x.restore()});
    // fullscreen HUD button (enter / exit), was drawn with paths on the canvas
    for(const ex of[false,true])bake(ex?'btnFullExit':'btnFull',[-20,-20,20,20],x=>{x.fillStyle=INK;R(x,-20,-20,40,40,10);x.fill();x.fillStyle='#f6e7c8';R(x,-17.5,-17.5,35,33,8);x.fill();
      x.strokeStyle='#1f6fd6';x.lineWidth=3.2;x.lineCap='round';const o=ex?4:9,i=ex?9:4;
      for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.beginPath();x.moveTo(a*o,b*i);x.lineTo(a*o,b*o);x.lineTo(a*i,b*o);x.stroke()}});
    // arena paper tiles (one 13×13 grid cell) for a tiled background in Unity
    ARENA_THEMES.forEach((t,i)=>bake('paper'+i,[0,0,13,13],x=>{x.fillStyle=t.paper;x.fillRect(0,0,13,13);x.strokeStyle=t.grid;x.lineWidth=1.2/SCALE*2;x.beginPath();x.moveTo(6.5,0);x.lineTo(6.5,13);x.moveTo(0,6.5);x.lineTo(13,6.5);x.stroke()}));
    // tinted trees (treeG_autumn … treeY_fire) were baked once from the old runtime HSV recolour and are now source PNGs
    return{out,meta};
  },SCALE);
  for(const k in res.out)fs.writeFileSync(path.join(OUT,k+'.png'),Buffer.from(res.out[k].split(',')[1],'base64'));
  const order=JSON.parse(fs.readFileSync(path.join(OUT,'_order.json')));const have=new Set(order.map(o=>o[0]));
  for(const k in res.out)if(!have.has(k)&&!k.startsWith('paper'))order.push([k,'png']); // paper tiles are Unity-only (web draws the crisp grid)
  fs.writeFileSync(path.join(OUT,'_order.json'),JSON.stringify(order));
  fs.writeFileSync(path.join(ROOT,'src/data/sprites.json'),JSON.stringify({scale:SCALE,baked:res.meta},null,1));
  console.log('baked',Object.keys(res.out).join(' '));await b.close();
})();
