// =====================================================================
//  INPUT — raw device events -> named actions (data/input.json) -> handlers.
//  The simulation only sees the result (cannon target, held keys) at the next tick.
//  Unity: an Input Actions asset with the same action names and bindings.
// =====================================================================
const IN=DATA.input;
const Input={held:{},aim:null};
// binding "key/a" | "ui/pause" | "pointer/x" -> action names
const BIND={};for(const a in IN.actions)for(const b of IN.actions[a].bindings)(BIND[b]=BIND[b]||[]).push(a);
function toScreen(e){const b=cv.getBoundingClientRect();let x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;
  const c=typeof CAM!=='undefined'&&CAM.last;if(c){x=(x-c.fx-c.x)/c.z+c.fx;y=(y-c.fy-c.y)/c.z+c.fy} // undo the camera, so the finger maps to the field it sees
  return{x,y}}
// finger near the edges pushes the cannon a bit further than the finger, so the edges are reachable
const aimX=px=>{const n=clamp((px-CX)/(W/2),-1,1);return clamp(n*(1+IN.aim.edgeGain),-1,1)*CFG.cannon.xLimit};
const fsOK=()=>!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function goFull(){try{const el=document.documentElement,r=el.requestFullscreen||el.webkitRequestFullscreen;
  if(r&&!isFS()){const pr=r.call(el,{navigationUI:'hide'});pr&&pr.then&&pr.then(()=>{try{screen.orientation.lock('portrait').catch(()=>{})}catch(e){}}).catch(()=>{})}}catch(e){}}
function exitFull(){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}
// what each action does (the same entry point is used by the debug bridge)
const ACTIONS={
  aim:v=>{if(Flow.state==='battle'||Flow.state==='result')Input.aim=aimX(v)},
  moveLeft:down=>{Input.held.moveLeft=down},
  moveRight:down=>{Input.held.moveRight=down},
  pause:()=>{if(Flow.paused()||(Flow.state==='battle'&&G.state==='play'))Flow.togglePause()},
  resume:()=>{if(Flow.paused())Flow.go('battle')},
  restart:()=>{if(Flow.paused())newMatch()},
  toMenu:()=>{if(Flow.inGame())window.toMenu&&toMenu()},
  fullscreen:()=>{isFS()?exitFull():goFull()},
  toggleSound:()=>{SND.on=!SND.on}
};
function action(name,v){const f=ACTIONS[name];if(f)f(v===undefined?true:v)}
function fire(binding,v){const a=BIND[binding];if(a)for(const n of a)action(n,v)}
// --- device events ---
cv.addEventListener('pointermove',e=>fire('pointer/x',toScreen(e).x));
cv.addEventListener('pointerdown',e=>{audioInit();if(!Flow.inGame())return;fire('pointer/x',toScreen(e).x)});
['touchend','click'].forEach(ev=>document.addEventListener(ev,()=>{if(Flow.inGame())audioInit()},{passive:true}));
document.addEventListener('fullscreenchange',()=>setTimeout(resize,60));document.addEventListener('webkitfullscreenchange',()=>setTimeout(resize,60));
addEventListener('keydown',e=>{audioInit();const b='key/'+e.key,a=BIND[b];if(!a)return;for(const n of a)action(n,IN.actions[n].type==='hold'?true:undefined)});
addEventListener('keyup',e=>{const a=BIND['key/'+e.key];if(a)for(const n of a)if(IN.actions[n].type==='hold')action(n,false)});
// HUD buttons carry data-input="pause" etc.
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('[data-input]');if(!el)return;e.preventDefault();e.stopPropagation();audioInit();fire('ui/'+el.dataset.input)},true);
