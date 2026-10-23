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
   <div class="au-res" id="rGold"><span class="au-res__icon">${icf('icCoin')}</span><span class="au-res__value au-outline" id="vGold">0</span><span class="au-res__plus au-outline" data-act="noop">+</span></div>
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
  closeDetail();TAB=t;root.classList.toggle('is-army',t==='up');let idx=0;ui.querySelectorAll('.au-nav__item').forEach((b,i)=>{const on=b.dataset.tab===t;if(on)idx=i;b.setAttribute('aria-selected',on?'true':'false');b.classList.toggle('is-active',on)});
  const hl=document.getElementById('navHl');if(hl)hl.style.transform=`translateX(${idx*100}%)`; // slides under the chosen tab (CSS transition)
  ui.querySelectorAll('.m-tab').forEach(x=>x.classList.toggle('on',x.id==='t-'+t));render();
  const box=document.getElementById('t-'+t);box.scrollTop=0;staggerIn(box,t==='battle'?'.s-swap,.b-prog,.b-sel__view,.b-arrow:not(.is-off),.b-fight':'.m-sec,.a-cell');
}
ui.addEventListener('click',e=>{
  try{audioInit()}catch(_){}
  const n=e.target.closest('[data-tab]');
  if(n){const t=n.dataset.tab;if(t==='shop'||t==='league'||t==='hero'){toast(U.soonTitle);return}if(t===TAB)return;setTab(t);return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='settings')openSettings();
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
function staggerIn(box,sel){if(!box)return;const els=[...box.querySelectorAll(sel)],R=box.getBoundingClientRect();
  els.forEach(el=>{const r=el.getBoundingClientRect(),d=((r.left-R.left)+(r.top-R.top))/(R.width+R.height||1);
    el.classList.remove('ui-in');void el.offsetWidth;el.style.animationDelay=(d*.42).toFixed(3)+'s';el.classList.add('ui-in')})}

// ---------- render ----------
function arenaOf(tr){return arenaIdx(tr)}
function render(){
  document.getElementById('vGold').textContent=fmtN(META.gold);
  document.getElementById('mAva').innerHTML=avatarHTML(profile().avatar);
  if(TAB==='battle')renderBattle();else if(TAB==='up')renderUp();
}
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
const sp=(k,x,y,w,ax,ay,cls)=>`<img class="s-obj ${cls||''}" alt="" src="${SPR[k]}" style="left:${(x*SCN.z).toFixed(1)}px;top:${(y*SCN.z+SCN.oy).toFixed(1)}px;width:${(w*SCN.z).toFixed(1)}px;transform:translate(${-ax*100}%,${-ay*100}%)">`;
const spB=(k,x,y,cls)=>{const m=DATA.sprites.baked[k];return sp(k,x,y,m.w,m.pivot[0],m.pivot[1],cls)};
function pedHTML(kind,x,y){
  if(kind==='rocket')return sp('rocket',x,y+10,32,.5,.84);
  let h=sp('pedestal',x,y+10,26,.5,1);const cy=y-6;
  if(kind==='bomb')h+=spB('bombPed',x,cy)+spB('fuseSpark',x+7,cy-31,'s-fuse');
  else{const n=kind==='ice'?'Ice':'Lava';h+=`<span class="s-bob">${spB('crystal'+n,x,cy)}${spB('glow'+n,x,cy,'s-glow')}</span>`}
  return h}
const paperStyle=A=>`background-color:${A.paper};background-image:repeating-linear-gradient(90deg,transparent 0 5.6px,${A.grid} 5.6px 6.4px,transparent 6.4px 13px),repeating-linear-gradient(0deg,transparent 0 5.6px,${A.grid} 5.6px 6.4px,transparent 6.4px 13px)`;
function sceneHTML(k){const A=ARENAS[k];let h=`<div class="s-paper" style="${paperStyle(A)}"></div>`;
  for(const t of SCN.trees)h+=`<span class="s-shadow" style="left:${((t.x+1)*SCN.z).toFixed(1)}px;top:${((t.y+7)*SCN.z+SCN.oy).toFixed(1)}px"></span>`;
  const items=[];SCN.trees.forEach((t,i)=>items.push({y:t.y,h:`<span class="s-swap" style="transform-origin:${(t.x*SCN.z).toFixed(1)}px ${((t.y+7)*SCN.z+SCN.oy).toFixed(1)}px" data-x="${t.x}" data-tree="${i}" data-arena="${k}">${sp(treeKey(t.g,k),t.x,t.y+7,21,.5,.85)}</span>`}));
  SCN.peds.forEach((p,i)=>items.push({y:p[1],h:`<span class="s-swap" style="transform-origin:${(p[0]*SCN.z).toFixed(1)}px ${((p[1]+10)*SCN.z+SCN.oy).toFixed(1)}px" data-x="${p[0]}" data-ped="${i}" data-arena="${k}">${pedHTML(A.obj,p[0],p[1])}</span>`}));
  items.sort((a,b)=>a.y-b.y);for(const it of items)h+=it.h;
  h+=`<span class="s-shadow s-shadow--tank" style="left:${150*SCN.z}px;top:${226*SCN.z+SCN.oy}px"></span>`+sp('tankP',150,206,62,.5,.5,'s-tank');
  return h}
function renderBattle(){
  cancelAnimationFrame(SWS.raf);SWS.raf=0;SWS.pages=[];SWS.objs=null;
  const k=VIEW,open=unlocked(k),tro=SHOWN_TRO===null?META.trophies:SHOWN_TRO;
  document.getElementById('t-battle').innerHTML=`<div class="b-root">
   <div class="b-scene" id="bscene">${sceneHTML(k)}
    <div class="b-scene__lock ${open?'is-off':''}"><div class="b-lockbadge"><img class="b-lockbadge__ic" alt="" src="${SPR.icLock}"><span class="b-lockbadge__t au-outline">${U.locked}</span></div></div></div>
   <div class="b-prog">${progHTML(k,tro)}</div>
   <div class="b-lower">
    <div class="b-sel"><button class="b-arrow b-arrow--l ${k>0?'':'is-off'}" data-act="arenaPrev" aria-label="previous"><svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
     <div class="b-sel__view"><div class="b-sel__page">${selHTML(k)}</div></div>
     <button class="b-arrow b-arrow--r ${k<AM.shown-1?'':'is-off'}" data-act="arenaNext" aria-label="next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <button class="au-btn au-btn--hero b-fight" data-act="fight">${U.fight}</button></div>
   <canvas class="b-fx" id="bfx" width="${393*2}" height="${852*2}"></canvas><div class="b-unlock au-outline" id="bunlock"></div></div>`;
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
        if(ti!==undefined){const tr=SCN.trees[+ti];o.el.innerHTML=sp(treeKey(tr.g,o.cur),tr.x,tr.y+7,21,.5,.85)}
        else{const pd=SCN.peds[+o.el.dataset.ped];o.el.innerHTML=pedHTML(ARENAS[o.cur].obj,pd[0],pd[1])}
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
  const F=AM.trophyFx,cv=document.getElementById('bfx');if(!cv){SHOWN_TRO=null;return}
  const x=cv.getContext('2d'),img=new Image();img.src=SPR.icTrophy;
  const bar=document.querySelector('.b-bar'),uiR=document.getElementById('ui').getBoundingClientRect(),sc=uiR.width/393;
  const target=()=>{const r=bar.getBoundingClientRect(),[lo,hi]=arenaRange(VIEW),p=Math.max(0,Math.min(1,((SHOWN_TRO??to)-lo)/(hi-lo)));
    return[(r.left-uiR.left)/sc+p*r.width/sc,(r.top-uiR.top)/sc+r.height/sc/2]};
  const P=[];for(let i=0;i<F.count;i++){const a=i/F.count*6.283+Math.random()*.4,R=F.radius[0]+Math.random()*(F.radius[1]-F.radius[0]);
    P.push({a,R,trail:[],done:false,wob:Math.random()*6})}
  SHOWN_TRO=from;let arrived=0;const t0=performance.now(),[ox,oy]=F.origin;
  (function f(now){const t=(now-t0)/1000;x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,393,852);let live=0;
    const[tx_,ty_]=target();
    for(let i=0;i<P.length;i++){const p=P[i];if(p.done)continue;live++;
      const bx=ox+Math.cos(p.a)*p.R,by=oy+Math.sin(p.a)*p.R*.8,ft=t-F.burst-F.hold-i*F.stagger;let px,py,s=1;
      if(t<F.burst){const k=anim('trophyBurst',t).k;px=ox+(bx-ox)*k;py=oy+(by-oy)*k;s=.4+.6*Math.min(1,k)}
      else if(ft<0){px=bx;py=by+Math.sin(t*6+p.wob)*3}
      else{const k=anim('trophyFly',ft).k,cx=(bx+tx_)/2+(bx-ox)*.6,cy=Math.min(by,ty_)-60;
        px=(1-k)*(1-k)*bx+2*(1-k)*k*cx+k*k*tx_;py=(1-k)*(1-k)*by+2*(1-k)*k*cy+k*k*ty_;s=1-.35*k;
        if(k>=1){p.done=true;arrived++;SHOWN_TRO=from+(to-from)*arrived/P.length;updateBar();continue}}
      p.trail.push([px,py]);if(p.trail.length>F.trail)p.trail.shift();
      for(let j=1;j<p.trail.length;j++){const q=j/p.trail.length;x.strokeStyle=`rgba(255,214,60,${q*.7})`;x.lineWidth=F.size*.42*q;x.lineCap='round';
        x.beginPath();x.moveTo(p.trail[j-1][0],p.trail[j-1][1]);x.lineTo(p.trail[j][0],p.trail[j][1]);x.stroke()}
      if(img.complete){const w=F.size*s;x.drawImage(img,px-w/2,py-w/2,w,w)}}
    if(live>0)requestAnimationFrame(f);
    else{x.clearRect(0,0,393,852);SHOWN_TRO=null;updateBar();
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
  META.gold-=c;META.lv[k]=L+1;saveMeta();try{sfx('upgrade',.05)}catch(_){}render();
}
function equip(id){const it=AI[id];if(!it||it.locked)return;META.equip[it.group]=id;saveMeta();sfxUI();render()}

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
    <button class="au-btn au-btn--blue m-mt6" data-pp>${U.privacy}</button></div>`,{cls:'au-modal--settings'});
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
  const fx=PENDING_FX;PENDING_FX=null;if(fx)SHOWN_TRO=fx.from;setTab('battle');if(fx)setTimeout(()=>playTrophyFx(fx.from,fx.to,fx.newArena),250)};
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
  const m=modal(win?U.win:U.lose,`<div class="m-result-big au-outline">${icn('icTrophy',46)} ${d>=0?'+':''}${d}</div>
    <div class="au-note">${tx(U.trophies,META.trophies)}</div>${rw}
    <div class="m-actions"><button class="au-btn" data-cont>${U.continue}</button></div>`,{cls:win?'':'au-modal--info',onClose:()=>toMenu()});
  m.querySelector('[data-cont]').onclick=()=>{m.remove();toMenu()};
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
  el.innerHTML=`<div class="m-bgfx__layer m-bgfx__layer--pat" style="background-image:url(${SPR.menuBg});background-size:${B.tile}px ${B.tile}px;width:${393+B.tile}px;height:${852+B.tile}px"></div>
   <div class="m-bgfx__layer m-bgfx__layer--bp" style="width:${393+B.bpTile}px;height:${852+B.bpTile}px"></div>`;
  const pat=el.children[0],bp=el.children[1],t0=performance.now();
  (function f(n){const t=(n-t0)/1000,d=(t*B.speed)%B.tile,e=(t*B.bpSpeed)%B.bpTile;
    pat.style.transform=`translate(${-d}px,${-d}px)`;bp.style.transform=`translate(${-e}px,${-e}px)`;requestAnimationFrame(f)})(t0)})();
setTab('battle');render();
window.addEventListener('pointerdown',()=>{try{audioInit()}catch(_){}},{once:true});
})();
