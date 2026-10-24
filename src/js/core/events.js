// =====================================================================
//  EVENTS — the simulation never touches audio, particles or the screen.
//  It pushes events here; the presentation layer drains the queue once per frame.
//  Unity: a List<SimEvent> filled by the sim and read by views (audio, VFX, haptics).
// =====================================================================
const EVQ=[];
const emit=(type,d)=>{EVQ.push(d?Object.assign({type},d):{type})};
// shorthands used by the simulation
const Ev={
  sfx:(name,gap)=>emit('sfx',{name,gap}),
  haptic:kind=>emit('haptic',{kind}),
  burst:(x,z,col,n)=>emit('burst',{x,z,col,n}),
  text:(o)=>emit('text',o),          // {x,z,dy}|{anchor,x}, txt, col, size
  hit:(x,z,big,life)=>emit('hit',{x,z,big,life}),
  boom:(x,z,r)=>emit('boom',{x,z,r}),
  rocketBoom:(x,z)=>emit('rocketBoom',{x,z}),
  levelUp:(x,z)=>emit('levelUp',{x,z}),   // player level up: gold sparkle burst + rising stars around the cannon
  shake:(v,max)=>emit('shake',{v,max})  // max: keep the stronger shake instead of replacing it
};
