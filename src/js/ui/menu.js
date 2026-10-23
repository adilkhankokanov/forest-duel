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
<div class="m-root au au-screen" id="mroot">
 <div class="m-top">
  <div class="au-resbar m-grow">
   <div class="au-res" id="rTro"><span class="au-res__icon">${icf('icTrophy')}</span><span class="au-res__value au-outline" id="vTro">0</span></div>
   <div class="au-res" id="rGold"><span class="au-res__icon">${icf('icCoin')}</span><span class="au-res__value au-outline" id="vGold">0</span><span class="au-res__plus au-outline" data-act="soon">+</span></div>
  </div>
  <button class="m-gear" data-act="settings" aria-label="${U.settings}">${icf('icGear')}</button>
 </div>
 <div class="m-content">
  <section class="m-tab" id="t-battle"></section>
  <section class="m-tab" id="t-up"></section>
 </div>
 <nav class="au-nav" role="tablist">
  <button class="au-nav__item au-nav__item--locked" data-tab="shop">${img('tabShop').replace('<img','<img class="au-nav__icon"')}<img class="au-nav__lock" alt="" src="${SPR.icLock}"><span class="au-nav__label au-outline">${U.tabShop}</span></button>
  <button class="au-nav__item au-nav__item--wide is-active" data-tab="battle" aria-selected="true">${img('tabBattle').replace('<img','<img class="au-nav__icon"')}<span class="au-nav__label au-outline">${U.tabBattle}</span></button>
  <button class="au-nav__item" data-tab="up">${img('tabUp').replace('<img','<img class="au-nav__icon"')}<span class="au-nav__label au-outline">${U.tabUp}</span></button>
  <button class="au-nav__item au-nav__item--locked" data-tab="league">${img('tabLeague').replace('<img','<img class="au-nav__icon"')}<img class="au-nav__lock" alt="" src="${SPR.icLock}"><span class="au-nav__label au-outline">${U.tabLeague}</span></button>
 </nav>
</div>
<div id="mlayer" class="m-layer"></div>`;
const root=document.getElementById('mroot');root.style.setProperty('--bgimg','url('+SPR.menuBg+')');
const _r2=0,layer=document.getElementById('mlayer');
ui.querySelectorAll('.m-tab').forEach(t=>dragScroll(t));
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
  closeDetail();TAB=t;ui.querySelectorAll('.au-nav__item').forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',on?'true':'false');b.classList.toggle('is-active',on)});
  ui.querySelectorAll('.m-tab').forEach(x=>x.classList.toggle('on',x.id==='t-'+t));render();
}
ui.addEventListener('click',e=>{
  try{audioInit()}catch(_){}
  const n=e.target.closest('[data-tab]');
  if(n){const t=n.dataset.tab;if(t==='shop'||t==='league'){soon(t==='shop'?U.shop:U.league);return}setTab(t);sfxUI();return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='soon')soon(U.buyGold);
  else if(act==='settings')openSettings();
  else if(act==='fight')startBattle();
  else if(act==='path')openPath();
  else if(act==='item')openItem(a.dataset.id);
  else if(act==='lvup')levelUp(a.dataset.id);
  else if(act==='equip')equip(a.dataset.id);
  else if(act==='closeItem')closeDetail();
});
function sfxUI(){try{sfx('flaskHit',.05)}catch(_){}}

// ---------- render ----------
function arenaOf(tr){return arenaIdx(tr)}
function render(){
  document.getElementById('vTro').textContent=fmtN(META.trophies);
  document.getElementById('vGold').textContent=fmtN(META.gold);
  if(TAB==='battle')renderBattle();else if(TAB==='up')renderUp();
}
function renderBattle(){
  const a=CUR_ARENA,A=ARENAS[a],next=ARENAS[a+1],lo=A.min,hi=next?next.min:A.min+250,p=Math.max(0,Math.min(1,(META.trophies-lo)/(hi-lo)));
  const nr=nextReward();
  document.getElementById('t-battle').innerHTML=`<div class="m-battle">
   <div class="m-center"><div class="au-outline m-arena-sub">${tx(U.arena,a+1)}</div><div class="m-arena-title au-outline">${A.name}</div></div>
   <div class="m-scene" data-act="path"><canvas id="mscene" width="600" height="500"></canvas></div>
   <div class="au-progress m-prog" data-act="path"><div class="au-progress__fill" style="width:${p*100}%"></div><div class="au-progress__text">${META.trophies}/${hi}</div></div>
   ${nr?`<div class="m-nextrw au-outline-thin">${U.nextReward} ${icn('icTrophy',20)} ${nr.at} → ${nr.chest?icn('icChest',22):icn('icCoin',20)} ${nr.gold}</div>`:''}
   <button class="au-btn au-btn--hero m-fight" data-act="fight">${U.fight}</button></div>`;
  drawScene();
}
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
function openItem(id){const it=AI[id];if(!it)return;if(it.locked){toast(U.notAvailable);try{sfx('treeHit',.05)}catch(_){}return}DETAIL=id;renderDetail();sfxUI()}
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
function openPath(){
  const L=rewardsList().filter(r=>r.at<=Math.max(META.trophies,0)+3000).reverse();let h='<div class="m-pathwrap"><div class="au-path">';
  for(const r of L){const done=!!META.claimed[r.at],ai=arenaIdx(r.at);
    if(r.chest)h+=`<div class="au-milestone ${META.trophies>=r.at?'':'au-milestone--locked'}"><div class="au-note m-note-sm">${U.chest} ${icn('icCoin',16)} ${r.gold}</div>
      <div class="au-milestone__head au-outline"><span>${r.arena+1}</span> ${ARENAS[r.arena].name}<span class="m-push">${r.at}</span></div></div>`;
    else h+=`<div class="au-node au-node--${ARENAS[ai].node} au-outline-thin ${done?'au-node--done':''}"><span class="m-w24">${icf('icTrophy')}</span>${r.at}<span class="au-node__reward">${r.gold} <span class="m-coin22">${icf('icCoin')}</span></span></div>`}
  h+=`<div class="au-milestone"><div class="au-milestone__head au-outline"><span>1</span> ${ARENAS[0].name}<span class="m-push">0</span></div></div></div></div>`;
  const m=modal(U.pathTitle,h);const w=m.querySelector('.m-pathwrap');const here=w.querySelector('.au-node--here')||w.lastElementChild;w.scrollTop=w.scrollHeight;requestAnimationFrame(()=>{const cur=[...w.querySelectorAll('.au-node:not(.au-node--done)')].pop();if(cur)w.scrollTop=cur.offsetTop-w.clientHeight/2});dragScroll(w);
}

// ---------- settings ----------
function openSettings(){
  const row=(k,name)=>`<div class="m-row au-outline-thin"><span>${name}</span><button class="au-btn au-btn--sm m-toggle ${META.settings[k]?'au-btn--green':'au-btn--grey'}" data-set="${k}">${META.settings[k]?U.on:U.off}</button></div>`;
  const m=modal(U.settings,`<div class="m-stack">${row('sound',U.sound)}${row('music',U.music)}${row('vib',U.vib)}
    <button class="au-btn au-btn--blue m-mt6" data-pp>${U.privacy}</button></div>`,{cls:'au-modal--settings'});
  m.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;META.settings[k]=!META.settings[k];saveMeta();applySettings();
    b.classList.toggle('au-btn--green',META.settings[k]);b.classList.toggle('au-btn--grey',!META.settings[k]);b.textContent=META.settings[k]?U.on:U.off});
  m.querySelector('[data-pp]').onclick=()=>modal(U.privacy,`<div class="m-legal">${U.privacyBody}</div>`,{cls:'au-modal--settings'});
}
function applySettings(){try{SND.on=META.settings.sound}catch(_){}}
applySettings();

// ---------- battle flow ----------
const isPhone=()=>/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&navigator.maxTouchPoints>0);
function startBattle(){
  try{audioInit()}catch(_){}if(isPhone())try{goFull()}catch(_){}
  CUR_ARENA=arenaIdx(META.maxTrophies);newMatch();
  root.style.display='none';layer.innerHTML='';
}
Flow.on(()=>{root.style.display=Flow.inGame()?'none':'';if(Flow.inGame())layer.innerHTML=''}); // any route into a battle hides the menu
window.toMenu=function(){Flow.go('menu');root.style.display='';layer.innerHTML='';CUR_ARENA=arenaIdx(META.maxTrophies);setTab('battle')};
function onMatchEnd(win){
  const before=META.trophies,floor=ARENAS[arenaIdx(META.maxTrophies)].min;
  META.trophies=win?META.trophies+META_CFG.winTrophies:Math.max(floor,META.trophies-META_CFG.loseTrophies);
  META.maxTrophies=Math.max(META.maxTrophies,META.trophies);
  const prevArena=CUR_ARENA,newArena=arenaIdx(META.maxTrophies);
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

// ---------- arena preview scene ----------
function drawScene(){
  const c=document.getElementById('mscene');if(!c)return;const x=c.getContext('2d'),A=ARENAS[CUR_ARENA];
  x.setTransform(2,0,0,2,0,0);x.fillStyle=A.paper;x.fillRect(0,0,300,250);x.strokeStyle=A.grid;x.lineWidth=.7;x.beginPath();
  for(let i=6;i<300;i+=13){x.moveTo(i,0);x.lineTo(i,250)}for(let j=6;j<250;j+=13){x.moveTo(0,j);x.lineTo(300,j)}x.stroke();
  const keep=ctx,keepA=G.arena;ctx=x;G.arena=CUR_ARENA;
  const trees=[];let sd=7;const rnd2=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  for(let i=0;i<70;i++){const tx=rnd2()*300,ty=20+rnd2()*150;if(Math.abs(tx-150)<48)continue;trees.push([tx,ty,rnd2()<.3])}
  trees.sort((a,b)=>a[1]-b[1]);
  for(const[tx,ty]of trees){x.fillStyle='rgba(60,50,35,.25)';x.beginPath();x.ellipse(tx+1,ty+7,8,3,0,0,7);x.fill()}
  let pi=0;const peds=[[70,110],[230,110]];
  for(const[tx,ty,g]of trees){while(pi<2&&peds[pi][1]<ty){try{drawPedObj(A.obj,peds[pi][0],peds[pi][1],1)}catch(_){}pi++}spr(treeKey(g,CUR_ARENA),tx,ty+7,21,.5,.85)}
  while(pi<2){try{drawPedObj(A.obj,peds[pi][0],peds[pi][1],1)}catch(_){}pi++}
  x.fillStyle='rgba(60,55,45,.26)';x.beginPath();x.ellipse(150,226,30,7,0,0,7);x.fill();spr('tankP',150,206,62);
  ctx=keep;G.arena=keepA;
}
setTimeout(()=>{if(TAB==='battle')drawScene()},400);

// ---------- background music (soft arpeggio loop) ----------
const MUS=DATA.audio.music,CH=MUS.chords;let mStep=0;
setInterval(()=>{
  if(!SND.ac||!META.settings.music||Flow.paused()||document.hidden)return;
  const ch=CH[Math.floor(mStep/8)%CH.length],i=mStep%8,v=Flow.inGame()?MUS.inBattleVolume:1;
  try{const f=ch[MUS.pattern[i]];tone(f*2,f*2,.22,'triangle',.016*v);if(i===0||i===4)tone(ch[0]/2,ch[0]/2,.5,'sine',.04*v)}catch(_){}
  mStep++;
},MUS.step*1000);

setTab('battle');render();
window.addEventListener('pointerdown',()=>{try{audioInit()}catch(_){}},{once:true});
})();
