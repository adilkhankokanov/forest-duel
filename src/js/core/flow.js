// =====================================================================
//  FLOW — explicit app state machine: menu -> battle <-> paused -> result -> menu
//  Unity: enum AppState + a GameFlow class; screens subscribe to onChange.
// =====================================================================
const Flow={
  state:'menu',
  subs:[],
  go(s){if(s===this.state)return;const prev=this.state;this.state=s;for(const f of this.subs)f(s,prev)},
  on(f){this.subs.push(f)},
  paused(){return this.state==='paused'},
  inGame(){return this.state!=='menu'},          // battle, paused or result: field is shown
  running(){return this.state==='battle'||this.state==='result'}, // simulation advances
  togglePause(){if(this.state==='battle')this.go('paused');else if(this.state==='paused')this.go('battle')}
};
