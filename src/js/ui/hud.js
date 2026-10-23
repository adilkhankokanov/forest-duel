// =====================================================================
//  HUD — in-battle buttons and the pause menu as DOM (flex, classes, reference px).
//  Buttons only emit input actions (data-input); state comes from Flow.
//  Unity: a UI Toolkit document (hud.uxml) bound to the same actions.
// =====================================================================
const HUD=(()=>{
  const el=document.createElement('div');el.className='h-root';el.hidden=true;
  const btn=(cls,act,txt)=>`<button class="h-btn ${cls}" data-input="${act}"><span class="h-btn__face"><span class="h-btn__hi"></span><span class="h-btn__txt">${txt}</span></span></button>`;
  el.innerHTML=`
   <div class="h-icon h-icon--pause"><img class="h-icon__img" alt="" src="${SPR.pause}"></div>
   <div class="h-icon h-icon--full"><img class="h-icon__img" id="hudFs" alt="" src="${SPR.btnFull}"></div>
   <div class="h-pause">
    <div class="h-pause__title">${T.game.pause}</div>
    ${btn('h-btn--green','resume',T.game.resume)}${btn('h-btn--red','restart',T.game.restart)}${btn('h-btn--blue','menu',T.game.toMenu)}
   </div>
   <div class="h-hit h-hit--pause" data-input="pause"></div>
   <div class="h-hit h-hit--full" data-input="fullscreen"></div>`;
  const ui=document.getElementById('ui');ui.insertBefore(el,ui.firstChild); // under the menu layer, so modals cover the HUD
  return{el,pause:el.querySelector('.h-pause'),full:el.querySelectorAll('.h-icon--full,.h-hit--full'),fsImg:el.querySelector('#hudFs'),s:{}};
})();
// cheap per-frame sync: only touches the DOM when something changed
function updateHud(){
  const S=HUD.s,show=Flow.inGame(),paused=Flow.paused(),fs=isFS(),ok=fsOK();
  if(S.show!==show){S.show=show;HUD.el.hidden=!show}
  if(S.paused!==paused){S.paused=paused;HUD.pause.classList.toggle('is-on',paused)}
  if(S.ok!==ok){S.ok=ok;HUD.full.forEach(e=>e.classList.toggle('is-off',!ok))}
  if(S.fs!==fs){S.fs=fs;HUD.fsImg.src=fs?SPR.btnFullExit:SPR.btnFull}
}
Flow.on(()=>updateHud()); // sync right away on state changes, not only on the next frame
updateHud();
