// =====================================================================
//  MENU (Arena UI Kit look): tabs, arenas, upgrades, settings, results
// =====================================================================
(function(){
const ui=document.getElementById('ui');
const IC={
 trophy:'<svg viewBox="0 0 40 40"><path d="M11 6h18v8a9 9 0 0 1-18 0zM16 26h8v5h4v4H12v-4h4z" fill="#f5a623" stroke="#0d0b1a" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 9H6a5 5 0 0 0 6 8M29 9h5a5 5 0 0 1-6 8" fill="none" stroke="#0d0b1a" stroke-width="2.5"/></svg>',
 coin:'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#f5a623" stroke="#0d0b1a" stroke-width="3"/><circle cx="20" cy="20" r="11" fill="#fbe149" stroke="#b8700f" stroke-width="2"/></svg>',
 gear:'<svg viewBox="0 0 40 40"><path d="M17 3h6l1 5 4 2 5-3 4 4-3 5 2 4 5 1v6l-5 1-2 4 3 5-4 4-5-3-4 2-1 5h-6l-1-5-4-2-5 3-4-4 3-5-2-4-5-1v-6l5-1 2-4-3-5 4-4 5 3 4-2z" fill="#e8ebf3" stroke="#0d0b1a" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="6" fill="#5d6688" stroke="#0d0b1a" stroke-width="2.5"/></svg>',
 lock:'<svg viewBox="0 0 40 40"><rect x="8" y="17" width="24" height="19" rx="4" fill="#fbe149" stroke="#0d0b1a" stroke-width="3"/><path d="M13 17v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#0d0b1a" stroke-width="4"/><circle cx="20" cy="26" r="2.6" fill="#0d0b1a"/></svg>',
 x:'<svg viewBox="0 0 20 20"><path d="M4 4l12 12M16 4 4 16" stroke="#0d0b1a" stroke-width="6" stroke-linecap="round"/><path d="M4 4l12 12M16 4 4 16" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
 shop:'<svg viewBox="0 0 48 48"><rect x="8" y="20" width="32" height="22" rx="3" fill="#f5a623" stroke="#0d0b1a" stroke-width="3"/><path d="M5 20 9 8h30l4 12z" fill="#d8182f" stroke="#0d0b1a" stroke-width="3" stroke-linejoin="round"/><path d="M15 8l-2 12M24 8v12M33 8l2 12" stroke="#fff" stroke-width="3"/></svg>',
 battle:'<svg viewBox="0 0 48 48"><path d="M10 40 36 10M38 40 12 10" stroke="#0d0b1a" stroke-width="7" stroke-linecap="round"/><path d="M10 40 36 10M38 40 12 10" stroke="#2a8cfb" stroke-width="3.5" stroke-linecap="round"/><path d="M30 6c8 0 12 6 10 12l-8-2zM18 6C10 6 6 12 8 18l8-2z" fill="#d9dde0" stroke="#0d0b1a" stroke-width="3" stroke-linejoin="round"/></svg>',
 up:'<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="32" rx="6" fill="#c069f3" stroke="#0d0b1a" stroke-width="3"/><path d="M24 14 36 27h-7v10h-10V27h-7z" fill="#3fdc3a" stroke="#0d0b1a" stroke-width="3" stroke-linejoin="round"/></svg>',
 league:'<svg viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="26" rx="4" fill="#d8182f" stroke="#0d0b1a" stroke-width="3"/><rect x="18" y="20" width="12" height="18" rx="3" fill="#9326d8" stroke="#0d0b1a" stroke-width="2.5"/><path d="M14 16 17 6l7 6 7-6 3 10z" fill="#fbe149" stroke="#0d0b1a" stroke-width="3" stroke-linejoin="round"/></svg>',
 chest:'<svg viewBox="0 0 40 40"><rect x="5" y="14" width="30" height="20" rx="3" fill="#5ad943" stroke="#0d0b1a" stroke-width="2.5"/><path d="M5 18a15 9 0 0 1 30 0" fill="#a0f86d" stroke="#0d0b1a" stroke-width="2.5"/><rect x="17" y="19" width="6" height="7" rx="1" fill="#d9dde0" stroke="#0d0b1a" stroke-width="2"/></svg>'
};
const img=k=>'<img alt="" src="'+(SPR[k]||'')+'">';
const icn=(k,sz)=>'<img alt="" src="'+(SPR[k]||'')+'" class="m-ic m-ic'+sz+'">';
const icf=k=>'<img alt="" src="'+(SPR[k]||'')+'" class="m-icf">';
const fmtN=n=>n>=10000?(n/1000).toFixed(1)+'K':n>=1000?(n/1000).toFixed(2)+'k':String(Math.round(n));
const f1=v=>String(Math.round(v*10)/10);
const U=T.menu,UP=T.metaUp;


// ---------- upgrade catalogue ----------
const cost=L=>Math.round(40*L*(1+.15*(L-1)));

// ---------- skeleton ----------
ui.innerHTML=`
<div class="m-root au au-screen" id="mroot"><div class="m-bgfx" id="mbg"></div>
 <div class="m-top">
  <button class="m-ava" data-act="profile" id="mAva"></button>
  <div class="au-resbar m-grow">
   <div class="au-res" id="rGold"><span class="au-res__icon">${icf('icCoin')}</span><span class="au-res__value au-outline" id="vGold">0</span><span class="au-res__plus au-outline" data-act="testGold">+</span></div>
  </div>
  <button class="m-gear" data-act="settings" aria-label="${U.settings}">${icf('icGear')}</button>
 </div>
 <div class="m-content">
  <section class="m-tab m-tab--flush" id="t-battle"></section>
  <section class="m-tab" id="t-up"></section>
 </div>
 <nav class="au-nav" role="tablist"><span class="au-nav__hl" id="navHl"></span>
  <button class="au-nav__item au-nav__item--locked" data-tab="shop">${img('tabShop').replace('<img','<img class="au-nav__icon"')}<img class="au-nav__lock" alt="" src="${SPR.icLock}"><span class="au-nav__label au-outline">${U.tabShop}</span></button>
  <button class="au-nav__item au-nav__item--locked" data-tab="hero">${img('tabHero').replace('<img','<img class="au-nav__icon"')}<img class="au-nav__lock" alt="" src="${SPR.icLock}"><span class="au-nav__label au-outline">${U.tabHero}</span></button>
  <button class="au-nav__item is-active" data-tab="battle" aria-selected="true">${img('tabBattle').replace('<img','<img class="au-nav__icon"')}<span class="au-nav__label au-outline">${U.tabBattle}</span></button>
  <button class="au-nav__item" data-tab="up">${img('tabUp').replace('<img','<img class="au-nav__icon"')}<span class="au-nav__label au-outline">${U.tabUp}</span></button>
  <button class="au-nav__item au-nav__item--locked" data-tab="league">${img('tabLeague').replace('<img','<img class="au-nav__icon"')}<img class="au-nav__lock" alt="" src="${SPR.icLock}"><span class="au-nav__label au-outline">${U.tabLeague}</span></button>
 </nav>
</div>
<div id="mlayer" class="m-layer"></div>`;
const root=document.getElementById('mroot');root.style.setProperty('--bgimg','url('+SPR.menuBg+')');
const _r2=0,layer=document.getElementById('mlayer');
ui.querySelectorAll('.m-tab:not(.m-tab--flush)').forEach(t=>dragScroll(t)); // the battle tab does not scroll
let TAB='battle';

function dragScroll(el){let y0=null,s0=0,moved=false;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;y0=e.clientY;s0=el.scrollTop;moved=false});
  window.addEventListener('pointermove',e=>{if(y0===null)return;const dy=e.clientY-y0;if(Math.abs(dy)>4)moved=true;el.scrollTop=s0-dy/(el.getBoundingClientRect().height/el.clientHeight||1)});
  window.addEventListener('pointerup',()=>{y0=null});el.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true)}
function toast(t){const d=document.createElement('div');d.className='au au-toast au-outline';d.textContent=t;layer.appendChild(d);setTimeout(()=>d.remove(),1650)}
function modal(title,body,opts={}){
  const s=document.createElement('div');s.className='au au-scrim';s.style.pointerEvents='auto';
  s.innerHTML=`<div class="au-modal ${opts.cls||''}">${title?`<div class="au-modal__title au-outline">${title}</div>`:''}<button class="au-close" data-x>${IC.x}</button><div class="m-mbody">${body}</div></div>`;
  s.querySelector('[data-x]').onclick=()=>{s.remove();opts.onClose&&opts.onClose()};
  layer.appendChild(s);return s;
}
function soon(name){modal(U.soonTitle,`<div class="au-note">${name?name+' — ':''}${U.soonBody}</div>`)}

// ---------- tabs ----------
function setTab(t){
  closeDetail();const prevIdx=setTab.idx??-1;TAB=t;root.classList.toggle('is-army',t==='up');let idx=0;ui.querySelectorAll('.au-nav__item').forEach((b,i)=>{const on=b.dataset.tab===t;if(on)idx=i;b.setAttribute('aria-selected',on?'true':'false');b.classList.toggle('is-active',on)});
  const hl=document.getElementById('navHl');if(hl)hl.style.transform=`translateX(${idx*100}%)`; // slides under the chosen tab (CSS transition)
  ui.querySelectorAll('.m-tab').forEach(x=>x.classList.toggle('on',x.id==='t-'+t));render();
  const box=document.getElementById('t-'+t);box.scrollTop=0;setTab.idx=idx;staggerIn(box,t==='battle'?'.s-swap,.b-prog,.b-sel__view,.b-arrow:not(.is-off),.b-fight':'.m-sec,.a-cell',prevIdx<0?0:Math.sign(idx-prevIdx));
}
ui.addEventListener('click',e=>{
  try{audioInit()}catch(_){}
  const n=e.target.closest('[data-tab]');
  if(n){const t=n.dataset.tab;if(t==='shop'||t==='league'||t==='hero'){toast(U.soonTitle);return}if(t===TAB)return;setTab(t);return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='testGold'){META.gold+=1000;saveMeta();invalidate();toast('+1000')} // TEMP: test gold, remove before release
  else if(act==='settings')openSettings();
  else if(act==='profile')openProfile(modal,render);
  else if(act==='fight')startBattle();
  else if(act==='arenaPrev')switchArena(VIEW-1);
  else if(act==='arenaNext')switchArena(VIEW+1);
  else if(act==='chest'){const r=rewardsList().find(x=>x.at===+a.dataset.at);if(r)toast(U.chestInfo.replace('{n}',r.at).replace('{g}',r.gold))}
  else if(act==='item')openItem(a.dataset.id);
  else if(act==='lvup')levelUp(a.dataset.id);
  else if(act==='equip')equip(a.dataset.id);
  else if(act==='closeItem')closeDetail();
});
function sfxUI(){try{sfx('flaskHit',.05)}catch(_){}}
document.getElementById('ui').addEventListener('dragstart',e=>e.preventDefault()); // images are not draggable
// every button in the UI: short pop, tap sound and a light haptic
document.getElementById('ui').addEventListener('pointerdown',e=>{
  const b=e.target.closest('button,[data-act],[data-tab],.b-node');if(!b||b.disabled||b.classList.contains('is-active'))return; // the open tab stays silent
  b.classList.remove('ui-pop');void b.offsetWidth;b.classList.add('ui-pop');
  try{audioInit();sfx(b.matches('[data-tab]:not(.au-nav__item--locked)')?'whoosh':'flaskHit',.03)}catch(_){}try{haptic('tap')}catch(_){}
},true);
// entrance: elements pop in one after another along the diagonal, top-left to bottom-right
function staggerIn(box,sel,dir){if(!box)return;const els=[...box.querySelectorAll(sel)];
  box.style.setProperty('--dx',(dir||0)*28+'px');box.style.setProperty('--sk',(dir||0)*-6+'deg'); // enter from the side of the chosen tab
  // read all positions first, then write: one layout pass instead of one per element
  const R=box.getBoundingClientRect(),D=els.map(el=>{const r=el.getBoundingClientRect();return((r.left-R.left)+(r.top-R.top))/(R.width+R.height||1)});
  for(const el of els)el.classList.remove('ui-in');void box.offsetWidth;
  els.forEach((el,i)=>{el.style.animationDelay=(D[i]*.42).toFixed(3)+'s';el.classList.add('ui-in')})}

// ---------- render ----------
function arenaOf(tr){return arenaIdx(tr)}
// tabs keep their DOM; a tab is rebuilt only when something it shows changed (DIRTY), not on every switch
const DIRTY={battle:true,up:true};let HUD_KEY='';
function render(force){
  const key=META.gold+'|'+profile().avatar;if(key!==HUD_KEY){HUD_KEY=key;countGold(META.gold);document.getElementById('mAva').innerHTML=avatarHTML(profile().avatar)}
  if(force===true){DIRTY.battle=DIRTY.up=true}
  if(TAB==='battle'&&DIRTY.battle){DIRTY.battle=false;renderBattle()}else if(TAB==='up'&&DIRTY.up){DIRTY.up=false;renderUp()}
}
const invalidate=()=>{DIRTY.battle=DIRTY.up=true;render()};
// gold pill: the number counts to the new value; a gain also pops the pill and spins the coin
const GC={v:null,raf:0};
function countGold(to){const el=document.getElementById('vGold');if(GC.v===null){GC.v=to;el.textContent=fmtN(to);return}
  const from=GC.v,t0=performance.now(),D=.6;GC.v=to;cancelAnimationFrame(GC.raf);
  if(to>from){const p=document.getElementById('rGold');p.classList.remove('gold-pop');void p.offsetWidth;p.classList.add('gold-pop')}
  (function f(n){const k=Math.min(1,(n-t0)/1000/D),e=1-Math.pow(1-k,3);el.textContent=fmtN(Math.round(from+(to-from)*e));if(k<1)GC.raf=requestAnimationFrame(f)})(t0)}
// ---------- battle tab: arena scene (top half), trophy road, arena selector + BATTLE ----------
const AM=DATA.arenas.menu;
const unlocked=k=>META.maxTrophies>=ARENAS[k].min;
let VIEW=Math.min(arenaIdx(META.maxTrophies),AM.shown-1),SHOWN_TRO=null;
function arenaRange(k){const lo=ARENAS[k].min,hi=ARENAS[k+1]?ARENAS[k+1].min:lo+250;return[lo,hi]}
function progHTML(k,tro){
  const[lo,hi]=arenaRange(k),p=Math.max(0,Math.min(1,(tro-lo)/(hi-lo)));
  const nodes=rewardsList().filter(r=>r.at>lo&&r.at<=hi).map(r=>{const got=!!META.claimed[r.at];
    return `<span class="b-node ${got?'is-got':''}" data-act="chest" data-at="${r.at}" style="left:${(r.at-lo)/(hi-lo)*100}%"><span class="b-bubble"><img class="b-bubble__img" alt="" src="${SPR.icChest}">${got?'<span class="b-bubble__ok">✓</span>':''}</span></span>`}).join('');
  return `<img class="b-prog__cup" alt="" src="${SPR.icTrophy}">
   <div class="b-prog__mid"><div class="b-nodes">${nodes}</div>
    <div class="b-bar"><div class="b-bar__fill" style="width:${p*100}%"></div><div class="b-bar__text au-outline">${Math.round(tro)} / ${hi}</div></div></div>
   <img class="b-prog__cup" alt="" src="${SPR.icTrophy}">`;
}
function selHTML(k){const A=ARENAS[k],open=unlocked(k);
  return `<div class="b-sel__sub au-outline">${tx(U.arena,k+1)}</div><div class="b-sel__name au-outline">${A.name}</div>
   ${open?'':`<div class="b-sel__lock au-outline-thin"><img class="b-sel__lockic" alt="" src="${SPR.icLock}">${tx(U.unlocksAt,A.min)}</div>`}`}
// scene objects (trees, pedestal objects, tank) as separate sprites, laid out like the battle field preview
const SCN=(()=>{const z=AM.scene.w/300,oy=1.25+68,trees=[];let sd=7;const r2=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  for(let i=0;i<70;i++){const tx=r2()*300,ty=20+r2()*150;if(Math.abs(tx-150)<48)continue;trees.push({x:tx,y:ty,g:r2()<.3})}
  trees.sort((a,b)=>a.y-b.y);return{z,oy,trees,peds:[[70,110],[230,110]]}})();
const SB={x:0,y:0}; // origin of the object box being built (px), children are placed relative to it
const sp=(k,x,y,w,ax,ay,cls)=>`<img class="s-obj ${cls||''}" alt="" src="${SPR[k]}" style="left:${(x*SCN.z-SB.x).toFixed(1)}px;top:${(y*SCN.z+SCN.oy-SB.y).toFixed(1)}px;width:${(w*SCN.z).toFixed(1)}px;transform:translate(${-ax*100}%,${-ay*100}%)">`;
const spB=(k,x,y,cls)=>{const m=DATA.sprites.baked[k];return sp(k,x,y,m.w,m.pivot[0],m.pivot[1],cls)};
// one swappable object: a zero-size box at the object's foot, so flips scale small layers only
function swapBox(fx,fy,attrs,build){const bx=fx*SCN.z,by=fy*SCN.z+SCN.oy;SB.x=bx;SB.y=by;const inner=build();SB.x=0;SB.y=0;
  // --wd: wind delay, so a gust travels across the forest from left to right
  return `<span class="s-swap" style="left:${bx.toFixed(1)}px;top:${by.toFixed(1)}px;--wd:${(-fx/110-fy/400).toFixed(2)}s" data-fx="${fx}" data-fy="${fy}" ${attrs}>${inner}</span>`}
function swapFill(el,build){const fx=+el.dataset.fx,fy=+el.dataset.fy;SB.x=fx*SCN.z;SB.y=fy*SCN.z+SCN.oy;el.innerHTML=build();SB.x=0;SB.y=0}
function pedHTML(kind,x,y){
  if(kind==='rocket')return sp('rocket',x,y+10,32,.5,.84);
  let h=sp('pedestal',x,y+10,26,.5,1);const cy=y-6;
  if(kind==='bomb')h+=spB('bombPed',x,cy)+spB('fuseSpark',x+7,cy-31,'s-fuse');
  else{const n=kind==='ice'?'Ice':'Lava';h+=`<span class="s-bob">${spB('crystal'+n,x,cy)}${spB('glow'+n,x,cy,'s-glow')}</span>`}
  return h}
const paperStyle=A=>`background-color:${A.paper};background-image:repeating-linear-gradient(90deg,transparent 0 5.6px,${A.grid} 5.6px 6.4px,transparent 6.4px 13px),repeating-linear-gradient(0deg,transparent 0 5.6px,${A.grid} 5.6px 6.4px,transparent 6.4px 13px)`;
function sceneHTML(k){const A=ARENAS[k];let h=`<div class="s-paper" style="${paperStyle(A)}"></div><div class="s-world">`;
  for(const t of SCN.trees)h+=`<span class="s-shadow" style="left:${((t.x+1)*SCN.z).toFixed(1)}px;top:${((t.y+7)*SCN.z+SCN.oy).toFixed(1)}px"></span>`;
  const items=[];SCN.trees.forEach((t,i)=>items.push({y:t.y,h:swapBox(t.x,t.y+7,`data-x="${t.x}" data-tree="${i}" data-arena="${k}"`,()=>sp(treeKey(t.g,k),t.x,t.y+7,21,.5,.85))}));
  SCN.peds.forEach((p,i)=>items.push({y:p[1],h:swapBox(p[0],p[1]+10,`data-x="${p[0]}" data-ped="${i}" data-arena="${k}"`,()=>pedHTML(A.obj,p[0],p[1]))}));
  items.sort((a,b)=>a.y-b.y);for(const it of items)h+=it.h;
  h+=`<span class="s-shadow s-shadow--tank" style="left:${150*SCN.z}px;top:${226*SCN.z+SCN.oy}px"></span>`+sp('tankP',150,206,62,.5,.5,'s-tank');
  return h+'</div><div class="s-cloud"></div>'}
function renderBattle(){
  cancelAnimationFrame(SWS.raf);SWS.raf=0;SWS.pages=[];SWS.objs=null;
  const k=VIEW,open=unlocked(k),tro=SHOWN_TRO===null?META.trophies:SHOWN_TRO;
  document.getElementById('t-battle').innerHTML=`<div class="b-root">
   <div class="b-scene" id="bscene">${sceneHTML(k)}
    <div class="b-scene__lock ${open?'is-off':''}"><div class="b-lockbadge"><img class="b-lockbadge__ic" alt="" src="${SPR.icLock}"><span class="b-lockbadge__t au-outline">${U.locked}</span></div></div></div>
   <div class="b-prog">${progHTML(k,tro)}</div>
   <div class="b-lower">
    <div class="b-sel"><button class="b-arrow b-arrow--l ${k>0?'':'is-off'}" data-act="arenaPrev" aria-label="previous"><svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" fill="none" stroke="#0d0b1a" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 5 8 12l7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
     <div class="b-sel__view"><div class="b-sel__page">${selHTML(k)}</div></div>
     <button class="b-arrow b-arrow--r ${k<AM.shown-1?'':'is-off'}" data-act="arenaNext" aria-label="next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="#0d0b1a" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <button class="au-btn au-btn--hero b-fight" data-act="fight">${U.fight}</button></div>
   <div class="b-unlock au-outline" id="bunlock"></div></div>`;
}
// switch to arena k: the tank stays, every tree / pedestal object flips into the new arena's version in a wave,
// the paper colour cross-fades and the arena title slides (dir: +1 right, -1 left).
// Presses can come in quick succession: every object keeps its own state and simply retargets.
const SWS={raf:0,pages:[],objs:null};
function switchArena(k,done){
  if(k<0||k>=AM.shown||k===VIEW){done&&done();return}
  const dir=k>VIEW?1:-1,root_=document.querySelector('.b-root'),scene=document.getElementById('bscene');if(!root_){VIEW=k;return}
  VIEW=k;const now=performance.now(),A=ARENAS[k];
  // title pages: whatever is on screen slides out, the new one slides in
  const view=root_.querySelector('.b-sel__view');
  for(const p of SWS.pages)if(!p.out){p.out=true;p.dir=dir;p.t0=now;p.from=p.pos()}
  [...view.querySelectorAll('.b-sel__page')].forEach(el=>{if(!SWS.pages.some(p=>p.el===el))SWS.pages.push({el,out:true,dir,t0:now,from:0,pos:()=>0})});
  const pg=document.createElement('div');pg.className='b-sel__page';pg.innerHTML=selHTML(k);view.appendChild(pg);
  const np={el:pg,out:false,dir,t0:now,from:dir};np.pos=()=>np.cur||0;SWS.pages.push(np);
  // paper: new layer fades in on top
  const paper=document.createElement('div');paper.className='s-paper';paper.style.cssText=paperStyle(A)+';opacity:0';paper.dataset.t0=now;
  const papers=scene.querySelectorAll('.s-paper');papers[papers.length-1].after(paper);
  scene.querySelector('.b-scene__lock').classList.toggle('is-off',unlocked(k));
  root_.querySelector('.b-arrow--l').classList.toggle('is-off',k<=0);root_.querySelector('.b-arrow--r').classList.toggle('is-off',k>=AM.shown-1);
  const pr=root_.querySelector('.b-prog');if(pr)pr.innerHTML=progHTML(k,SHOWN_TRO===null?META.trophies:SHOWN_TRO);
  // objects: each one gets a new target and its own start time along the wave
  if(!SWS.objs)SWS.objs=[...scene.querySelectorAll('.s-swap')].map(el=>({el,cur:+el.dataset.arena,target:+el.dataset.arena,t0:0,phase:'idle'}));
  // a press during a running switch speeds everything up (shorter wave, faster flips) instead of queueing behind it
  const hurry=SWS.raf?1:0;SWS.speed=hurry?1.9:1;const span=hurry?.12:.32;
  for(const o of SWS.objs){const x=+o.el.dataset.x,t1=now+((dir>0?x:300-x)/300*span+Math.random()*.04)*1000;o.target=k;
    if(o.phase==='idle'){o.phase='wait';o.t0=t1}else o.t0=Math.min(o.t0,t1)}
  if(!SWS.raf)SWS.raf=requestAnimationFrame(tickSwitch);
  done&&setTimeout(done,800);
}
const dirOf=o=>(+o.el.dataset.x<150?-1:1); // trees lean outward while they flip
function tickSwitch(now){
  const SP=SWS.speed||1,OUT=animLen('sceneOut')/SP,IN=animLen('sceneIn')/SP,SL=animLen('arenaSlide');let busy=false;
  for(const p of SWS.pages){const e=anim('arenaSlide',(now-p.t0)/1000).k;
    if(p.out){const x=p.from+(-p.dir-p.from)*e;p.cur=x;p.el.style.transform=`translateX(${x*100}%)`;p.el.style.opacity=1-Math.abs(x);if(e>=1)p.dead=true}
    else{const x=p.from*(1-e);p.cur=x;p.el.style.transform=`translateX(${x*100}%)`;p.el.style.opacity=1-Math.abs(x)}
    if((now-p.t0)/1000<SL)busy=true}
  SWS.pages=SWS.pages.filter(p=>{if(p.dead){p.el.remove();return false}return true});
  const scene=document.getElementById('bscene');
  if(scene){const ps=[...scene.querySelectorAll('.s-paper')];ps.forEach((el,i)=>{if(i===0)return;const a=Math.min(1,(now-(+el.dataset.t0))/350);el.style.opacity=a;if(a<1)busy=true;else while(ps.length>1&&ps[0]!==el){ps.shift().remove()}})}
  for(const o of SWS.objs||[]){if(o.phase==='idle')continue;busy=true;const lt=(now-o.t0)/1000;let sc=1,rot=0,hop=0;
    if(o.phase==='wait'){if(lt>=0){o.phase='out';o.ts=now}}
    if(o.phase==='out'){const t=(now-o.ts)/1000;sc=anim('sceneOut',Math.min(t,OUT)*SP).scale;rot=-dirOf(o)*14*(1-sc);hop=-6*(1-sc);
      if(t>=OUT){o.cur=o.target;const ti=o.el.dataset.tree;
        if(ti!==undefined){const tr=SCN.trees[+ti];swapFill(o.el,()=>sp(treeKey(tr.g,o.cur),tr.x,tr.y+7,21,.5,.85))}
        else{const pd=SCN.peds[+o.el.dataset.ped];swapFill(o.el,()=>pedHTML(ARENAS[o.cur].obj,pd[0],pd[1]))}
        o.el.dataset.arena=o.cur;o.phase='in';o.ts=now;sc=0}}
    else if(o.phase==='in'){const t=(now-o.ts)/1000,W=anim('treeWobble',Math.min(t*SP,animLen('treeWobble')));sc=anim('sceneIn',Math.min(t,IN)*SP).scale;rot=W.rot*dirOf(o);hop=W.hop;
      if(o.target!==o.cur&&now>=o.t0){o.phase='out';o.ts=now-(1-sc)*OUT*1000} // retarget mid-way
      else if(t>=Math.max(IN,animLen('treeWobble')/SP)){o.phase=o.target!==o.cur?'wait':'idle';sc=1;rot=0;hop=0}}
    else if(o.phase==='wait')sc=1;
    o.el.style.transform=`translateY(${hop.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc})`}
  SWS.raf=busy?requestAnimationFrame(tickSwitch):0;if(!busy)SWS.speed=1;
}
// after a win: trophies burst from the centre with trails, hang, then fly into the trophy road
function playTrophyFx(from,to,newArena){
  const F=AM.trophyFx,host=document.querySelector('.b-root');if(!host){SHOWN_TRO=null;return}
  const cv=document.createElement('canvas');cv.className='b-fx';cv.width=393*2;cv.height=852*2;host.appendChild(cv); // created only for the effect
  const x=cv.getContext('2d'),img=new Image();img.src=SPR.icTrophy;
  const uiR=document.getElementById('ui').getBoundingClientRect(),sc=uiR.width/393;
  // aim at the end of the gold fill as it is drawn right now; updateBar() rebuilds the bar, so look it up every frame
  const target=()=>{const f=document.querySelector('.b-bar__fill'),bar=document.querySelector('.b-bar');
    if(!f||!bar)return[196,426];const r=f.getBoundingClientRect(),rb=bar.getBoundingClientRect();
    return[(Math.max(rb.left,Math.min(rb.right,r.right))-uiR.left)/sc,(rb.top-uiR.top)/sc+rb.height/sc/2]};
  const P=[];for(let i=0;i<F.count;i++){const a=i/F.count*6.283+Math.random()*.4,R=F.radius[0]+Math.random()*(F.radius[1]-F.radius[0]);
    P.push({a,R,trail:[],done:false,wob:Math.random()*6})}
  SHOWN_TRO=from;let arrived=0;const t0=performance.now(),[ox,oy]=F.origin;try{sfx('trophyAppear',.1)}catch(_){}
  (function f(now){const t=(now-t0)/1000;x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,393,852);let live=0;
    const[tx_,ty_]=target();
    for(let i=0;i<P.length;i++){const p=P[i];if(p.done)continue;live++;
      const bx=ox+Math.cos(p.a)*p.R,by=oy+Math.sin(p.a)*p.R*.8,ft=t-F.burst-F.hold-i*F.stagger;let px,py,s=1;
      if(t<F.burst){const k=anim('trophyBurst',t).k;px=ox+(bx-ox)*k;py=oy+(by-oy)*k;s=.4+.6*Math.min(1,k)}
      else if(ft<0){px=bx;py=by+Math.sin(t*6+p.wob)*3}
      else{const k=anim('trophyFly',ft).k,cx=(bx+tx_)/2+(bx-ox)*.6,cy=Math.min(by,ty_)-60;
        px=(1-k)*(1-k)*bx+2*(1-k)*k*cx+k*k*tx_;py=(1-k)*(1-k)*by+2*(1-k)*k*cy+k*k*ty_;s=1-.35*k;
        if(k>=1){p.done=true;arrived++;try{sfx('trophyPop',.03)}catch(_){}SHOWN_TRO=from+(to-from)*arrived/P.length;updateBar();continue}}
      p.trail.push([px,py]);if(p.trail.length>F.trail)p.trail.shift();
      for(let j=1;j<p.trail.length;j++){const q=j/p.trail.length;x.strokeStyle=`rgba(255,214,60,${q*.7})`;x.lineWidth=F.size*.42*q;x.lineCap='round';
        x.beginPath();x.moveTo(p.trail[j-1][0],p.trail[j-1][1]);x.lineTo(p.trail[j][0],p.trail[j][1]);x.stroke()}
      if(img.complete){const w=F.size*s;x.drawImage(img,px-w/2,py-w/2,w,w)}}
    if(live>0)requestAnimationFrame(f);
    else{cv.remove();SHOWN_TRO=null;updateBar();
      if(newArena>=0&&newArena<AM.shown)setTimeout(()=>switchArena(newArena,()=>showUnlock(newArena)),300)}})(t0);
}
function updateBar(){const el=document.querySelector('.b-prog');if(!el)return;el.innerHTML=progHTML(VIEW,SHOWN_TRO===null?META.trophies:SHOWN_TRO);
  const b=el.querySelector('.b-bar');if(b&&SHOWN_TRO!==null){const t0=performance.now();(function f(n){const A=anim('barPulse',(n-t0)/1000);b.style.transform=`scaleY(${A.scale})`;if((n-t0)/1000<animLen('barPulse'))requestAnimationFrame(f)})(t0)}}
function showUnlock(k){const el=document.getElementById('bunlock');if(!el)return;el.textContent=tx(U.arenaUnlocked,k+1);try{sfx('level',.1)}catch(_){}
  const t0=performance.now();(function f(n){const t=(n-t0)/1000,A=anim('unlockBanner',t);el.style.display='flex';
    el.style.transform=`translate(-50%,-50%) translateY(${A.y}px) scale(${A.scale})`;el.style.opacity=A.alpha;
    if(t<animLen('unlockBanner'))requestAnimationFrame(f);else el.style.display='none'})(t0)}
// ---------- army: groups of cards, detail panel ----------
const ARMY=DATA.army,AI={};for(const it of ARMY.items)AI[it.id]=it;
const itemLv=it=>it.metaKey?(META.lv[it.metaKey]||1):1;
const isEquipped=it=>META.equip&&META.equip[it.group]===it.id;
// stat at a level: base × the same meta multiplier the battle uses for the scaled stats
function itemStat(it,k,L){const b=it.stats[k];if(!it.metaKey||!(it.scales||[]).includes(k))return b;return b*(1+META_CFG.per[it.metaKey]*(L-1))}
// bar scale per group: strongest item at max level
const STAT_MAX={};for(const g of ARMY.groups){const m={atk:0,hp:0,spd:0};for(const it of ARMY.items)if(it.group===g.id)for(const k in m)m[k]=Math.max(m[k],it.stats[k]*(it.metaKey?1+META_CFG.per[it.metaKey]*(META_CFG.maxLv-1):1));STAT_MAX[g.id]=m}
// green LEVEL UP button: small label on top, coin + price in the middle
function lvBtn(it,big){
  const L=itemLv(it),max=L>=META_CFG.maxLv,c=cost(L),can=!it.locked&&!max&&META.gold>=c;
  return `<button class="au-btn ${can?'au-btn--green':'au-btn--grey'} a-lv ${big?'a-lv--big':''}" data-act="lvup" data-id="${it.id}">
   <span class="a-lv__t">${U.levelUp}</span><span class="a-lv__p">${max?U.max:`${icn('icCoin',big?20:16)}${fmtN(c)}`}</span></button>`;
}
function tile(it){
  const L=itemLv(it);
  return `<div class="a-cell"><div class="a-tile ${it.locked?'a-tile--locked':''}" data-act="item" data-id="${it.id}">
    <div class="a-tile__art">${img(it.art).replace('<img','<img class="a-tile__img'+(it.locked?' a-sil':'')+'"')}</div>
    ${it.locked?`<img class="a-tile__lock" alt="" src="${SPR.icLock}">`:`<span class="a-tile__lv au-outline-thin">${tx(U.lvShort,L)}</span>`}
    ${isEquipped(it)?'<span class="a-tile__eq">✓</span>':''}
    <div class="a-tile__name au-outline-thin">${it.locked?'???':it.name}</div></div>${lvBtn(it,false)}</div>`;
}
function renderUp(){
  document.getElementById('t-up').innerHTML=ARMY.groups.map(g=>`<div class="m-sec au-outline">${g.title}</div>
   <div class="a-grid">${ARMY.items.filter(it=>it.group===g.id).map(tile).join('')}</div>`).join('');
  if(DETAIL)renderDetail();
}
let DETAIL=null;
function openItem(id){const it=AI[id];if(!it)return;if(it.locked){toast(U.notAvailable);try{sfx('treeHit',.05)}catch(_){}return}DETAIL=id;renderDetail();sfxUI();staggerIn(document.getElementById('adetail'),'.a-card__head,.a-stat,.a-act,.a-lv')}
function closeDetail(){DETAIL=null;const d=document.getElementById('adetail');if(d)d.remove()}
function renderDetail(){
  const it=AI[DETAIL],L=itemLv(it),mx=STAT_MAX[it.group],eq=isEquipped(it);
  const row=(k,label)=>{const v=itemStat(it,k,L),n=itemStat(it,k,L+1),up=L<META_CFG.maxLv&&n>v;
    return `<div class="a-stat"><span class="a-stat__l au-outline-thin">${label}</span><div class="a-stat__bar"><div class="a-stat__fill" style="width:${Math.min(100,v/mx[k]*100)}%"></div></div>
     <span class="a-stat__v au-outline-thin">${f1(v)}${up?` <span class="au-up">+${f1(n-v)}</span>`:''}</span></div>`};
  let d=document.getElementById('adetail');
  if(!d){d=document.createElement('div');d.id='adetail';d.className='a-detail';root.appendChild(d)}
  d.innerHTML=`<div class="a-show" style="background-image:url(${SPR.showcaseBg})">${img(it.art).replace('<img','<img class="a-show__model a-show__model--'+it.group+'"')}</div>
   <div class="a-card">
    <div class="a-card__head"><div class="a-card__icon">${img(it.art).replace('<img','<img class="a-card__iconimg"')}</div>
     <div class="a-card__mid"><div class="a-card__name au-outline">${it.name}</div><div class="a-card__desc">${it.desc}</div></div>
     <div class="a-card__lv au-outline">${tx(U.lvShort,L)}</div></div>
    <div class="a-stats">${row('atk',U.statAtk)}${row('hp',U.statHp)}${row('spd',U.statSpd)}</div>
    <div class="a-actions">
     <button class="au-btn ${eq?'au-btn--grey':'au-btn--blue'} a-act" data-act="equip" data-id="${it.id}" ${eq?'disabled':''}>${eq?U.equipped+'<span class="a-act__ok">✓</span>':U.equip}</button>
     ${lvBtn(it,true)}
     <button class="au-btn au-btn--red a-act" data-act="closeItem">${U.close}</button>
    </div></div>`;
}
function levelUp(id){
  const it=AI[id];if(!it||it.locked){toast(U.notAvailable);return}
  const k=it.metaKey,L=META.lv[k]||1;if(L>=META_CFG.maxLv){toast(U.maxLevel);return}
  const c=cost(L);if(META.gold<c){toast(U.noGold);try{sfx('treeHit',.05)}catch(_){}return}
  META.gold-=c;META.lv[k]=L+1;saveMeta();try{sfx('levelUpBtn',.05)}catch(_){}invalidate();lvFx(id,L+1);
}
// level-up impact (Juicy Impact): a held squash pose (hit-stop), squash 1.3/0.7 -> 0.9/1.1 -> 1, white->lemon flash,
// decaying shake, the model jumps and lands, the level badge pops, sparks burst and "LEVEL UP" rises and fades.
function lvFx(id,L){
  const det=DETAIL===id?document.getElementById('adetail'):null,card=det?det.querySelector('.a-card'):document.querySelector(`.a-tile[data-id="${id}"]`);if(!card)return;
  const box=det||document.getElementById('t-up'),model=det?det.querySelector('.a-show__model'):card.querySelector('.a-tile__img'),
    badge=det?det.querySelector('.a-card__lv'):card.querySelector('.a-tile__lv'),host=det?det.querySelector('.a-show'):card,big=!!det;
  const A=(n,k,o)=>n&&n.animate(k,Object.assign({easing:'linear'},o)),stop=70;
  if(!big)A(card,[{transform:'scale(1.3,.7)'},{transform:'scale(1.3,.7)',offset:stop/330},{transform:'scale(.9,1.1)',offset:(stop+90)/330,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:'scale(1)'}],{duration:330});
  const fl=document.createElement('div');fl.className='lv-flash'+(big?' lv-flash--soft':'');(big?host:card).appendChild(fl);A(fl,[{opacity:big?.4:.9,background:'#fff'},{opacity:big?.25:.6,background:'#FFE14D',offset:.3},{opacity:0,background:'#FFE14D'}],{duration:320,fill:'forwards'}).onfinish=()=>fl.remove();
  const amp=big?0:7;if(amp)A(box,[0,1,2,3,4,5,6].map(i=>({transform:`translate(${(i%2?-1:1)*amp*Math.pow(.6,i)}px,${(i%2?1:-1)*amp*.4*Math.pow(.6,i)}px)`})).concat([{transform:'none'}]),{duration:360,delay:stop});
  A(model,[{transform:'none'},{transform:'translateY(-30px) scale(1.12)',offset:.4,easing:'cubic-bezier(.2,.8,.4,1)'},{transform:'translateY(0) scale(1.25,.8)',offset:.7,easing:'cubic-bezier(.6,0,.9,.5)'},{transform:'scale(.95,1.06)',offset:.85},{transform:'none'}],{duration:520,delay:stop});
  A(badge,[{transform:'scale(1)'},{transform:'scale(1.45)',offset:.35,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:'scale(1)'}],{duration:420,delay:stop+60});
  if(det)det.querySelectorAll('.a-stat__fill').forEach((f,i)=>A(f,[{transform:'scaleX(.8)'},{transform:'scaleX(1.06)',offset:.6},{transform:'scaleX(1)'}],{duration:420,delay:stop+120+i*70,easing:'ease-out'}));
  // sparks + rising text, from the model
  const hr=host.getBoundingClientRect(),mr=(model||card).getBoundingClientRect(),sc=hr.width/host.offsetWidth||1,cx=(mr.left+mr.width/2-hr.left)/sc,cy=(mr.top+mr.height/2-hr.top)/sc;
  const fx=document.createElement('div');fx.className='lv-fx';host.appendChild(fx);
  for(let i=0;i<(big?18:12);i++){const s=document.createElement('span');s.className='lv-spark';s.style.left=cx+'px';s.style.top=cy+'px';s.style.background=['#FFE14D','#FF6F61','#fff'][i%3];fx.appendChild(s);
    const a=i/(big?18:12)*6.283+Math.random()*.3,r=(big?90:46)+Math.random()*(big?50:26);
    A(s,[{transform:'translate(-50%,-50%) scale(1.2)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px)) scale(0)`,opacity:0}],{duration:520+Math.random()*200,delay:stop,easing:'cubic-bezier(.2,.8,.3,1)',fill:'both'})}
  const t=document.createElement('div');t.className='lv-text'+(big?' lv-text--big':'');t.textContent=U.levelUpFx.replace('{n}',L);t.style.left=cx+'px';t.style.top=(cy-(big?40:24))+'px';fx.appendChild(t);
  A(t,[{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{transform:'translate(-50%,-50%) scale(1.45)',opacity:1,offset:.18,easing:'cubic-bezier(.2,.8,.3,1)'},
    {transform:'translate(-50%,-80%) scale(1)',opacity:1,offset:.35},{transform:'translate(-50%,-180%) scale(1)',opacity:1,offset:.75},{transform:'translate(-50%,-200%) scale(.95)',opacity:0}],{duration:1000,delay:stop,fill:'both'});
  if(big){ // podium effects: light beam, expanding ring, sparkles rising around the model
    const beam=document.createElement('div');beam.className='lv-beam';beam.style.left=cx+'px';fx.appendChild(beam);
    A(beam,[{transform:'translateX(-50%) scaleX(.2)',opacity:0},{transform:'translateX(-50%) scaleX(1)',opacity:.85,offset:.25},{transform:'translateX(-50%) scaleX(.6)',opacity:0}],{duration:900,delay:stop,fill:'both'});
    for(let r=0;r<2;r++){const ring=document.createElement('div');ring.className='lv-ring';ring.style.left=cx+'px';ring.style.top=(cy+40)+'px';fx.appendChild(ring);
      A(ring,[{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(-50%,-50%) scale(1.6)',opacity:0}],{duration:650,delay:stop+r*140,easing:'cubic-bezier(.2,.8,.3,1)',fill:'both'})}
    for(let i=0;i<22;i++){const s=document.createElement('span');s.className='lv-rise';const x=cx+(Math.random()-.5)*150;s.style.left=x+'px';s.style.top=(cy+50)+'px';fx.appendChild(s);
      const h=90+Math.random()*120,dx=(Math.random()-.5)*40,sz=.6+Math.random()*.8;
      A(s,[{transform:`translate(-50%,-50%) scale(${sz}) rotate(0deg)`,opacity:0},{opacity:1,offset:.2},{transform:`translate(calc(-50% + ${dx}px),calc(-50% - ${h}px)) scale(0) rotate(180deg)`,opacity:0}],{duration:900+Math.random()*500,delay:stop+Math.random()*350,easing:'cubic-bezier(.3,.6,.4,1)',fill:'both'})}}
  setTimeout(()=>fx.remove(),1800);
}
function equip(id){const it=AI[id];if(!it||it.locked)return;META.equip[it.group]=id;saveMeta();sfxUI();invalidate()}

// ---------- arena path & rewards ----------
let RW=null;function rewardsList(){if(RW)return RW;const out=[],n=META_CFG.nodesPerArena;
  for(let k=0;k<ARENAS.length-1;k++){const a=ARENAS[k].min,b=ARENAS[k+1].min;
    for(let i=1;i<=n;i++){const t=Math.round((a+(b-a)*i/(n+1))/5)*5;out.push({at:t,gold:META_CFG.nodeGold+10*k})}
    out.push({at:b,gold:ARENAS[k+1].chest,chest:true,arena:k+1})}
  return RW=out}
function nextReward(){return rewardsList().find(r=>!META.claimed[r.at])}
function claimRewards(){let g=0;const got=[];for(const r of rewardsList())if(r.at<=META.trophies&&!META.claimed[r.at]){META.claimed[r.at]=1;g+=r.gold;got.push(r)}META.gold+=g;return{g,got}}

// ---------- settings ----------
function openSettings(){
  const row=(k,name)=>`<div class="m-row au-outline-thin"><span>${name}</span><button class="m-switch ${META.settings[k]?'is-on':''}" data-set="${k}" aria-label="${name}"><span class="m-switch__knob"></span></button></div>`;
  const m=modal(U.settings,`<div class="m-stack">${row('sound',U.sound)}${row('music',U.music)}${row('vib',U.vib)}
    <button class="au-btn au-btn--blue m-mt6" data-pp>${U.privacy}</button>
    <button class="au-btn au-btn--red m-mt6" data-clear>${U.clearData}</button></div>`,{cls:'au-modal--settings au-modal--small'});
  const clr=m.querySelector('[data-clear]');clr.onclick=()=>{if(!clr.dataset.sure){clr.dataset.sure=1;clr.textContent=U.clearConfirm;return}
    try{localStorage.removeItem(META_KEY)}catch(_){}location.reload()}; // second tap: wipe the save and start over
  m.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;META.settings[k]=!META.settings[k];saveMeta();applySettings();
    b.classList.toggle('is-on',META.settings[k]);if(k==='vib'&&META.settings.vib)try{haptic('tap')}catch(_){}});
  m.querySelector('[data-pp]').onclick=()=>modal(U.privacy,`<div class="m-legal">${U.privacyBody}</div>`,{cls:'au-modal--settings'});
}
function applySettings(){try{SND.on=META.settings.sound}catch(_){}}
applySettings();

// ---------- battle flow ----------
const isPhone=()=>/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&navigator.maxTouchPoints>0);
function startBattle(){
  try{audioInit()}catch(_){}if(isPhone())try{goFull()}catch(_){}
  CUR_ARENA=arenaIdx(META.maxTrophies);openMatchmaking(); // always the arena you are in, whatever the selector shows
}
Flow.on(()=>{root.style.display=Flow.inGame()?'none':'';if(Flow.inGame())layer.innerHTML=''}); // any route into a battle hides the menu
let PENDING_FX=null;
window.toMenu=function(){Flow.go('menu');root.style.display='';layer.innerHTML='';CUR_ARENA=arenaIdx(META.maxTrophies);
  const fx=PENDING_FX;PENDING_FX=null;if(fx)SHOWN_TRO=fx.from;DIRTY.battle=DIRTY.up=true;TAB='';setTab('battle');if(fx)setTimeout(()=>playTrophyFx(fx.from,fx.to,fx.newArena),250)};
function onMatchEnd(win){
  const before=META.trophies,prevMax=META.maxTrophies,floor=ARENAS[arenaIdx(META.maxTrophies)].min;
  META.trophies=win?META.trophies+META_CFG.winTrophies:Math.max(floor,META.trophies-META_CFG.loseTrophies);
  META.maxTrophies=Math.max(META.maxTrophies,META.trophies);
  const prevArena=arenaIdx(prevMax),newArena=arenaIdx(META.maxTrophies);
  if(win&&META.trophies>before)PENDING_FX={from:before,to:META.trophies,newArena:newArena>prevArena?newArena:-1};
  const {g,got}=claimRewards();saveMeta();
  const d=META.trophies-before;
  let rw='';if(got.length)rw=`<div class="au-note m-mt8">${U.pathRewards}</div><div class="m-rw au-outline">${icn('icCoin',24)} +${g}</div>`;
  if(newArena>prevArena)rw+=`<div class="au-note m-mt8">${U.newArena} <b>${ARENAS[newArena].name}</b>!</div>`;
  showResult(win,{d,g,got:got.length>0,newArena:newArena>prevArena?newArena:-1});
}
// ---------- result screen: VICTORY (gold rays, trophy, confetti on the field) / DEFEAT (rain, cracked shield) ----------
// Everything is staged with the Web Animations API on transform/opacity/filter: emblem drops and lands with a squash,
// title letters fall one by one, trophies and the three stats count up, the button pops in last.
const RS=DATA.arenas.menu.result;
// defeat emblem: a shield that a bullet shoots straight through; it then splits along the crack into two halves
const SHIELD_PATH='M60 6 108 24v38c0 34-20 58-48 72C32 120 12 96 12 62V24Z',SHIELD_IN='M60 18 96 32v30c0 26-15 45-36 57C39 107 24 88 24 62V32Z',CRACK='M60 0 54 34 66 50 52 70 64 88 56 140';
const shieldHalf=(side)=>`<svg viewBox="0 0 120 140" class="rs-half rs-half--${side}"><defs><clipPath id="rsc${side}"><path d="${side==='l'?'M-10 -10H60L54 34 66 50 52 70 64 88 56 150H-10Z':'M130 -10H60L54 34 66 50 52 70 64 88 56 150H130Z'}"/></clipPath></defs>
  <g clip-path="url(#rsc${side})"><path d="${SHIELD_PATH}" fill="#b8453f" stroke="#140D38" stroke-width="6" stroke-linejoin="round"/><path d="${SHIELD_IN}" fill="#d9625a"/>
  <path d="M60 30 84 40v22c0 18-10 31-24 40" fill="none" stroke="#f3a39b" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>
  <path d="${CRACK}" fill="none" stroke="#140D38" stroke-width="5" stroke-linejoin="round" clip-path="url(#rsc${side})"/></svg>`;
// odometer: every digit is a strip 0..9 (twice) that rolls into place, the later digits land later, like a slot machine
function odoHTML(txt){return [...String(txt)].map(c=>/\d/.test(c)?`<span class="odo-c" data-d="${c}"><span class="odo-s">${'01234567890123456789'.split('').map(n=>`<i>${n}</i>`).join('')}</span></span>`:`<span class="odo-x">${c}</span>`).join('')}
function odoRun(el,delay){const cs=[...el.querySelectorAll('.odo-c')];cs.forEach((c,i)=>{const d=+c.dataset.d,s=c.querySelector('.odo-s');
  s.animate([{transform:'translateY(0)'},{transform:`translateY(${-(10+d)}em)`}],{duration:700+i*160,delay,easing:'cubic-bezier(.15,.85,.25,1.08)',fill:'both'})});
  return delay+700+Math.max(0,cs.length-1)*160}
const mmss=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function showResult(win,r){
  const S=MSTATS,tiles=[['clock',U.statTime,mmss(G.time||0)],['flaskDmg',U.statUpg,S.flasks],['treeY',U.statTrees,S.trees],['manR',U.statKills,S.units+S.tanks]];
  const CLOCK=`<svg viewBox="0 0 40 40"><circle cx="20" cy="21" r="15" fill="#fff" stroke="#140D38" stroke-width="4"/><path d="M20 12v10l6 4" fill="none" stroke="#140D38" stroke-width="4" stroke-linecap="round"/><rect x="16" y="1" width="8" height="6" rx="2" fill="#140D38"/></svg>`;
  const tile=([ic,label,v])=>`<div class="rs-tile"><span class="rs-tile__ic">${ic==='clock'?CLOCK:`<img alt="" src="${SPR[ic]}">`}</span><span class="rs-tile__v">${odoHTML(v)}</span><span class="rs-tile__l">${label}</span></div>`;
  const title=(win?U.win:U.lose).split('').map(c=>`<span class="rs-l">${c}</span>`).join('');
  let rw='';if(win&&r.got)rw+=`<div class="rs-note">${U.pathRewards} <b>${icn('icCoin',20)} +${r.g}</b></div>`;
  if(r.newArena>=0)rw+=`<div class="rs-note">${U.newArena} <b>${ARENAS[r.newArena].name}</b>!</div>`;
  const el=document.createElement('div');el.className='au rs '+(win?'rs--win':'rs--lose');el.style.pointerEvents='auto';
  el.innerHTML=`<div class="rs-bg"></div>${win?'<div class="rs-rays"></div>':'<div class="rs-vig"></div>'}<div class="rs-flash"></div>
   <div class="rs-stage">
    <div class="rs-emblem">${win?`<img class="rs-trophy" alt="" src="${SPR.icTrophy}"><span class="rs-star rs-star--a">✦</span><span class="rs-star rs-star--b">✦</span><span class="rs-star rs-star--c">✦</span>`
      :`<div class="rs-shieldbox">${shieldHalf('l')}${shieldHalf('r')}<span class="rs-hole"></span></div><img class="rs-bullet" alt="" src="${SPR.bullet}"><span class="rs-trail"></span>`}</div>
    <div class="rs-title">${title}</div>
    ${win?`<div class="rs-tro"><img alt="" src="${SPR.icTrophy}"><span class="rs-tro__v">+${odoHTML(r.d)}</span></div>`:`<div class="rs-sub">${U.loseSub}</div>`}
    <div class="rs-grid">${tiles.map(tile).join('')}</div>
    ${rw}<button class="au-btn ${win?'':'au-btn--blue'} rs-cont" data-cont>${U.continue}</button>
   </div>`;
  layer.appendChild(el);el.querySelector('[data-cont]').onclick=()=>{el.remove();toMenu()};
  const A=(n,k,o)=>n&&n.animate(k,Object.assign({easing:'linear',fill:'both'},o)),q=s=>el.querySelector(s),qa=s=>[...el.querySelectorAll(s)],T0=RS.t,ms=v=>v*1000;
  const shake=(amp)=>A(q('.rs-stage'),[0,1,2,3,4,5,6].map(i=>({transform:`translate(${(i%2?-1:1)*amp*Math.pow(.55,i)}px,${(i%2?1:-1)*amp*.4*Math.pow(.55,i)}px)`})).concat([{transform:'none'}]),{duration:320,fill:'none'});
  const flash=(a)=>A(q('.rs-flash'),[{opacity:a},{opacity:0}],{duration:220,fill:'none'});
  const squash=[{transform:'translateY(-260px) scale(.7,1.4)',opacity:0,filter:'blur(8px)'},{transform:'translateY(0) scale(1.3,.7)',opacity:1,filter:'blur(0)',offset:.55,easing:'cubic-bezier(.5,0,.75,.6)'},
    {transform:'translateY(-10px) scale(.9,1.1)',offset:.75},{transform:'none',opacity:1}];
  A(q('.rs-bg'),[{opacity:0},{opacity:1}],{duration:260});A(q('.rs-rays')||q('.rs-vig'),[{opacity:0},{opacity:1}],{duration:500,delay:150});
  if(win){A(q('.rs-emblem'),squash,{duration:ms(T0.emblem),delay:150});setTimeout(()=>{shake(7);flash(.35);try{sfx('blast',.05)}catch(_){}},150+ms(T0.emblem)*.55)}
  else{ // shield drops in, a bullet streaks through it (hit-stop + shake + hole), then it breaks in two
    const B=RS.shield;A(q('.rs-shieldbox'),[{transform:'translateY(-40px) scale(.6)',opacity:0},{transform:'scale(1.08)',opacity:1,offset:.7,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:'none',opacity:1}],{duration:380,delay:120});
    const hit=ms(B.hit);A(q('.rs-bullet'),[{transform:'translate(-230px,-50%) rotate(90deg)',opacity:1},{transform:'translate(-10px,-50%) rotate(90deg)',opacity:1,offset:.5},{transform:'translate(240px,-50%) rotate(90deg)',opacity:0}],{duration:ms(B.fly),delay:hit-ms(B.fly)/2,easing:'linear'});
    A(q('.rs-trail'),[{transform:'scaleX(0)',opacity:.9},{transform:'scaleX(1)',opacity:.9,offset:.5},{transform:'scaleX(1)',opacity:0}],{duration:ms(B.fly)*1.4,delay:hit-ms(B.fly)/2});
    A(q('.rs-hole'),[{transform:'translate(-50%,-50%) scale(0)'},{transform:'translate(-50%,-50%) scale(1.4)',offset:.4},{transform:'translate(-50%,-50%) scale(1)'}],{duration:240,delay:hit});
    A(q('.rs-shieldbox'),[{transform:'scale(1.25,.8)'},{transform:'scale(1.25,.8)',offset:.35},{transform:'scale(.92,1.08)',offset:.65},{transform:'none'}],{duration:260,delay:hit,fill:'none'});
    setTimeout(()=>{shake(10);flash(.25);try{sfx('treeHit',.05)}catch(_){}},hit);
    const brk=hit+ms(B.split);
    A(q('.rs-half--l'),[{transform:'none'},{transform:`translate(${-B.dx}px,${B.dy}px) rotate(${-B.rot}deg)`,offset:.6,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:`translate(${-B.dx}px,${B.dy+4}px) rotate(${-B.rot-2}deg)`}],{duration:700,delay:brk});
    A(q('.rs-half--r'),[{transform:'none'},{transform:`translate(${B.dx}px,${B.dy+2}px) rotate(${B.rot}deg)`,offset:.6,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:`translate(${B.dx}px,${B.dy+6}px) rotate(${B.rot+2}deg)`}],{duration:700,delay:brk});
    A(q('.rs-hole'),[{opacity:1},{opacity:0}],{duration:120,delay:brk});
    setTimeout(()=>{shake(6);try{sfx('blast',.05)}catch(_){}
      const box=q('.rs-shieldbox');for(let i=0;i<12;i++){const c=document.createElement('span');c.className='rs-chip';box.appendChild(c);const a=-Math.PI/2+(Math.random()-.5)*2.6,d=50+Math.random()*60;
        A(c,[{transform:'translate(-50%,-50%) rotate(0)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d+60}px)) rotate(${(Math.random()-.5)*400}deg)`,opacity:0}],{duration:700+Math.random()*300,easing:'cubic-bezier(.2,.6,.5,1)'})}},brk)}
  qa('.rs-l').forEach((l,i)=>A(l,win?[{transform:'translateY(-120px) scale(.8,1.5)',opacity:0,filter:'blur(6px)'},{transform:'translateY(0) scale(1.3,.7)',opacity:1,filter:'blur(0)',offset:.5,easing:'cubic-bezier(.5,0,.8,.6)'},
    {transform:'translateY(-5px) scale(.9,1.1)',offset:.72},{transform:'none',opacity:1}]
    :[{transform:'translateY(-60px)',opacity:0},{transform:'translateY(4px)',opacity:1,offset:.6,easing:'cubic-bezier(.5,0,.8,.6)'},{transform:`translateY(${i%2?3:1}px) rotate(${i%2?4:-3}deg)`,opacity:1}],
    {duration:ms(T0.letter),delay:ms((win?T0.title:T0.titleLose)+i*T0.stagger)}));
  const pop=[{transform:'scale(.3)',opacity:0},{transform:'scale(1.45)',opacity:1,offset:.45,easing:'cubic-bezier(.2,.8,.3,1)'},{transform:'scale(1)',opacity:1}];
  const sparkle=(host)=>{for(let i=0;i<8;i++){const s=document.createElement('span');s.className='rs-sp';host.appendChild(s);const a=i/8*6.283,d=26+Math.random()*14;
    A(s,[{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(0)`,opacity:0}],{duration:520,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>s.remove()}};
  const after=win?0:ms(RS.shield.hit+RS.shield.split)-ms(T0.trophies)+200;
  if(win){const tr=q('.rs-tro');A(tr,pop,{duration:420,delay:ms(T0.trophies)});const end=odoRun(tr,ms(T0.trophies)+120);
    setTimeout(()=>{A(tr,[{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.3,1.6,.5,1)',fill:'none'});sparkle(tr);try{sfx('upgrade',.05)}catch(_){}},end)}
  else A(q('.rs-sub'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:400,delay:ms(T0.trophies)+after});
  qa('.rs-tile').forEach((tl,i)=>{const d=ms(T0.stats+i*T0.rowStagger)+after;
    A(tl,[{transform:'translateY(40px) scale(.6) rotate(-6deg)',opacity:0},{transform:'translateY(-4px) scale(1.08,.94) rotate(1deg)',opacity:1,offset:.65,easing:'cubic-bezier(.2,.9,.3,1)'},{transform:'none',opacity:1}],{duration:440,delay:d});
    const v=tl.querySelector('.rs-tile__v'),end=odoRun(v,d+200);
    setTimeout(()=>{A(v,[{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.3,1.6,.5,1)',fill:'none'});sparkle(tl);try{sfx('pop',.03)}catch(_){}},end)});
  qa('.rs-note').forEach((n,i)=>A(n,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:350,delay:ms(T0.stats+4*T0.rowStagger+.9+i*.15)+after}));
  A(q('.rs-cont'),pop,{duration:420,delay:ms(T0.stats+4*T0.rowStagger+1.1)+after});
}
setInterval(()=>{if(Flow.state==='result'&&G.endT>1.6&&!G.resultShown){G.resultShown=true;onMatchEnd(G.state==='win')}},200);



// ---------- background music (soft arpeggio loop) ----------
const MUS=DATA.audio.music,CH=MUS.chords;let mStep=0;
setInterval(()=>{
  if(!SND.ac||!META.settings.music||Flow.paused()||document.hidden)return;
  const ch=CH[Math.floor(mStep/8)%CH.length],i=mStep%8,v=Flow.inGame()?MUS.inBattleVolume:1;
  try{const f=ch[MUS.pattern[i]];tone(f*2,f*2,.22,'triangle',.016*v);if(i===0||i===4)tone(ch[0]/2,ch[0]/2,.5,'sine',.04*v)}catch(_){}
  mStep++;
},MUS.step*1000);

// background: a grid of small game icons drifting diagonally; the pattern repeats every block,
// so shifting by exactly one block loops seamlessly
// background: a tiled layer one tile larger than the screen, shifted by (time*speed mod tile) -> seamless loop.
// battle tab: game doodle pattern; army tab: moving blueprint grid
(function bgFx(){const B=DATA.arenas.menu.bg,el=document.getElementById('mbg');if(!el)return;
  el.innerHTML=`<div class="m-bgfx__layer m-bgfx__layer--bp" style="width:${393+B.bpTile}px;height:${852+B.bpTile}px"></div>`;
  const bp=el.firstChild,t0=performance.now();
  // runs only while the menu is visible (stops during battles)
  (function f(n){if(!Flow.inGame()){const e=((n-t0)/1000*B.bpSpeed)%B.bpTile;bp.style.transform=`translate3d(${-e}px,${-e}px,0)`}requestAnimationFrame(f)})(t0)})();
setTab('battle');render();
// sprites switched to short blob: URLs: rebuild the hidden tab later with the light HTML (visible one keeps working)
window.onSpritesSwapped=()=>{DIRTY.up=TAB!=='up'||DIRTY.up};
// build the army tab in the background once the menu is idle, so the first visit is instant
setTimeout(()=>{if(DIRTY.up&&TAB!=='up'){DIRTY.up=false;renderUp()}},1200);
window.addEventListener('pointerdown',()=>{try{audioInit()}catch(_){}},{once:true});
})();
