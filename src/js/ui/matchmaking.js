// =====================================================================
//  MATCHMAKING — opponent search screen shown after BATTLE.
//  Screen split by a slightly tilted seam: red (opponent) on top, blue (player) below.
//  Search ~2.5 s (rolling avatars) -> opponent pops in -> VS -> halves slide away
//  over the battle scene -> FIGHT! -> the match starts.
//  Timings: data/matchmaking.json; motion: anims.json (mm*). Unity: a UI Toolkit screen
//  driven by the same timeline (DOTween Sequence).
// =====================================================================
const MM=DATA.matchmaking;
// avatar tile: palette-coloured tile + picture (data/matchmaking.json avatars)
function avatarHTML(i,cls){const a=MM.avatars[i]||MM.avatars[0];
  return `<span class="pf-ava pf-ava--${a.bg} ${cls||''}"><img class="pf-ava__img" alt="" src="${SPR[a.img]}"></span>`}
function profile(){return META.profile||(META.profile={name:'Player',avatar:0})}

const MMS={el:null,t0:0,raf:0,opp:null,phase:'',onDone:null};
function openMatchmaking(onCancel){
  if(MMS.el)return;
  const P=profile(),T_=MM.timeline,U_=T.menu;
  MMS.opp={name:MM.botNames[Math.floor(Math.random()*MM.botNames.length)],avatar:Math.floor(Math.random()*MM.avatars.length),
    trophies:Math.max(0,META.trophies+Math.round((Math.random()-.5)*60))};
  const roll=MM.avatars.map((a,i)=>avatarHTML(i,'mm-roll__ava')).join('');
  const el=document.createElement('div');el.className='au mm';el.style.setProperty('--mmpat','url('+SPR.menuBg+')');
  el.innerHTML=`
   <div class="mm-half mm-half--top" style="clip-path:polygon(0 0,100% 0,100% ${MM.seam.rightPct}%,0 ${MM.seam.leftPct}%)"><div class="mm-panel mm-panel--opp">
     <div class="mm-ava mm-ava--opp"><div class="mm-roll"><div class="mm-roll__strip">${roll}${roll}</div></div><div class="mm-found">${avatarHTML(MMS.opp.avatar)}</div></div>
     <div class="mm-info"><div class="mm-name mm-name--opp au-outline">???</div><div class="mm-tro au-outline-thin"><img class="mm-tro__ic" alt="" src="${SPR.icTrophy}"><span class="mm-tro__v">—</span></div></div>
   </div></div>
   <div class="mm-half mm-half--bot" style="clip-path:polygon(0 ${MM.seam.leftPct}%,100% ${MM.seam.rightPct}%,100% 100%,0 100%)"><div class="mm-panel mm-panel--me">
     <div class="mm-ava">${avatarHTML(P.avatar)}</div>
     <div class="mm-info"><div class="mm-name au-outline"></div><div class="mm-tro au-outline-thin"><img class="mm-tro__ic" alt="" src="${SPR.icTrophy}"><span>${fmtNum(META.trophies)}</span></div></div>
   </div></div>
   <svg class="mm-seam" viewBox="0 0 393 852" preserveAspectRatio="none"><line x1="-2" y1="${852*MM.seam.leftPct/100}" x2="395" y2="${852*MM.seam.rightPct/100}" stroke="#0d0b1a" stroke-width="${MM.seam.width}"/></svg>
   <div class="mm-search au-outline">${U_.searching}</div>
   <button class="mm-cancel" aria-label="cancel"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15" stroke="#0d0b1a" stroke-width="6" stroke-linecap="round"/><path d="M5 5l10 10M15 5 5 15" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg></button>
   <div class="mm-word mm-word--vs au-outline">${U_.vs}</div>
   <div class="mm-word mm-word--fight au-outline">${U_.fightBanner}</div>`;
  el.querySelector('.mm-panel--me .mm-name').textContent=P.name;
  el.querySelector('.mm-cancel').onclick=()=>{closeMatchmaking();onCancel&&onCancel()};
  document.getElementById('ui').appendChild(el);
  MMS.el=el;MMS.t0=performance.now();MMS.phase='search';
  MMS.raf=requestAnimationFrame(tickMatchmaking);
}
function closeMatchmaking(){cancelAnimationFrame(MMS.raf);if(MMS.el)MMS.el.remove();MMS.el=null;MMS.phase=''}
const fmtNum=n=>String(Math.round(n));
// one frame of the timeline; every visual value comes from anim() tracks
function tickMatchmaking(now){
  const el=MMS.el;if(!el)return;MMS.raf=requestAnimationFrame(tickMatchmaking);
  const t=(now-MMS.t0)/1000,TL=MM.timeline,q=s=>el.querySelector(s),set=(n,o)=>{if(n)Object.assign(n.style,o)};
  // drifting stripes on both halves (same edges the seam is drawn from, so it lines up at any screen size)
  const bp=(t*MM.bgScroll).toFixed(1);set(q('.mm-half--top'),{backgroundPosition:`0 0,${bp}px ${bp}px,0 0`});set(q('.mm-half--bot'),{backgroundPosition:`0 0,${-bp}px ${-bp}px,0 0`});
  // searching: avatar strip rolls, label pulses
  if(t<TL.found){
    const y=anim('mmRoll',t).y,n=MM.avatars.length;set(q('.mm-roll__strip'),{transform:`translateY(${-y*n*76}px)`});
    const step=Math.floor(t/(animLen('mmRoll')||DATA.anims.mmRoll.tracks[0].duration)*n);if(step!==MMS.step){MMS.step=step;try{sfx('roll',.02)}catch(_){}} // tun-tun-tun per avatar
    set(q('.mm-search'),{opacity:anim('mmPulse',t).alpha});
  }else if(MMS.phase==='search'){
    MMS.phase='found';q('.mm-roll').style.display='none';q('.mm-search').style.display='none';q('.mm-cancel').style.display='none';
    q('.mm-name--opp').textContent=MMS.opp.name;q('.mm-panel--opp .mm-tro__v').textContent=fmtNum(MMS.opp.trophies);
    try{sfx('upgrade',.05)}catch(_){}
  }
  if(t>=TL.found){const A=anim('mmPop',t-TL.found);set(q('.mm-found'),{transform:`scale(${A.scale})`,opacity:A.alpha});
    set(q('.mm-name--opp'),{transform:`scale(${A.scale})`,opacity:A.alpha})}
  // VS in, stays while the halves leave, then out
  const vs=q('.mm-word--vs');
  if(t>=TL.vsIn&&t<TL.vsOut){const A=anim('mmVsIn',t-TL.vsIn);set(vs,{display:'flex',transform:`translate(-50%,-50%) rotate(${-MM.angleDeg}deg) scale(${A.scale})`,opacity:A.alpha})}
  else if(t>=TL.vsOut){const A=anim('mmTextOut',t-TL.vsOut);set(vs,{transform:`translate(-50%,-50%) rotate(${-MM.angleDeg}deg) scale(${A.scale})`,opacity:A.alpha})}
  if(t>=TL.vsIn&&MMS.phase==='found'){MMS.phase='vs';try{sfx('bugle',.1)}catch(_){}}
  // halves slide away and uncover the battle scene (match created, not running yet)
  if(t>=TL.panelsOut){
    if(MMS.phase==='vs'){MMS.phase='out';newMatch(undefined,'intro');document.getElementById('ui').appendChild(el)}
    const s=anim('mmPanelsOut',t-TL.panelsOut).shift;
    set(q('.mm-seam'),{opacity:Math.max(0,1-s*4)});
    set(q('.mm-half--top'),{transform:`translateY(${-s*110}%)`});set(q('.mm-half--bot'),{transform:`translateY(${s*110}%)`});
  }
  // FIGHT! in and out, then the match starts
  const fg=q('.mm-word--fight');
  if(t>=TL.fightIn&&t<TL.fightOut){const A=anim('mmFightIn',t-TL.fightIn);set(fg,{display:'flex',transform:`translate(-50%,-50%) scale(${A.scale})`,opacity:A.alpha});
    if(MMS.phase==='out'){MMS.phase='fight';try{sfx('rush',.1)}catch(_){}}}
  else if(t>=TL.fightOut){const A=anim('mmTextOut',t-TL.fightOut);set(fg,{transform:`translate(-50%,-50%) scale(${A.scale})`,opacity:A.alpha})}
  if(t>=TL.start){closeMatchmaking();if(Flow.state==='intro')Flow.go('battle')}
}

// ---------- profile: nickname + avatar (opened from the avatar button in the menu) ----------
function openProfile(modal,onSave){
  const P=profile();let pick=P.avatar;
  const grid=MM.avatars.map((a,i)=>`<button class="pf-pick ${i===pick?'is-on':''}" data-ava="${i}">${avatarHTML(i)}</button>`).join('');
  const m=modal(T.menu.profile,`<div class="pf">
    <div class="pf-label au-outline-thin">${T.menu.nickname}</div>
    <input class="pf-input" maxlength="16" spellcheck="false" autocomplete="off" autocapitalize="off" inputmode="latin">
    <div class="pf-label au-outline-thin">${T.menu.avatar}</div>
    <div class="pf-grid">${grid}</div>
    <button class="au-btn au-btn--green pf-save" data-pf-save>${T.menu.save}</button></div>`,{cls:'au-modal--settings'});
  const inp=m.querySelector('.pf-input');inp.value=P.name.replace(/[^A-Za-z]/g,'').slice(0,16);
  // nickname: English letters only, up to 16
  inp.addEventListener('input',()=>{const v=inp.value.replace(/[^A-Za-z]/g,'').slice(0,16);if(v!==inp.value)inp.value=v});
  m.querySelectorAll('[data-ava]').forEach(b=>b.onclick=()=>{pick=+b.dataset.ava;const a=b.firstElementChild;a.classList.remove('ui-pop');void a.offsetWidth;a.classList.add('ui-pop');try{sfx('upgrade',.03)}catch(_){}m.querySelectorAll('.pf-pick').forEach(x=>x.classList.toggle('is-on',x===b))});
  m.querySelector('[data-pf-save]').onclick=()=>{const n=inp.value.replace(/[^A-Za-z]/g,'').slice(0,16);P.name=n||'Player';P.avatar=pick;saveMeta();m.remove();onSave&&onSave()};
}
