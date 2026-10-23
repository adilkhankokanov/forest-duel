// =====================================================================
//  TWEENS — animations are data: {property, from, to, duration, delay, easing, loop}
//  Tracks are evaluated statelessly at time t, so the same anim plays the same
//  everywhere (and pauses for free). Easings are the standard Penner set.
//  Unity: each anim -> a DOTween Sequence (Insert(delay, DOTween.To(...).SetEase(...))).
// =====================================================================
const EASE=(()=>{
  const c1=1.70158,c2=c1*1.525,c3=c1+1,c4=2*Math.PI/3,c5=2*Math.PI/4.5,n1=7.5625,d1=2.75;
  const bounceOut=x=>x<1/d1?n1*x*x:x<2/d1?n1*(x-=1.5/d1)*x+.75:x<2.5/d1?n1*(x-=2.25/d1)*x+.9375:n1*(x-=2.625/d1)*x+.984375;
  return{
    linear:x=>x,
    sineIn:x=>1-Math.cos(x*Math.PI/2),sineOut:x=>Math.sin(x*Math.PI/2),sineInOut:x=>-(Math.cos(Math.PI*x)-1)/2,
    quadIn:x=>x*x,quadOut:x=>1-(1-x)*(1-x),quadInOut:x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,
    cubicIn:x=>x*x*x,cubicOut:x=>1-Math.pow(1-x,3),cubicInOut:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
    backIn:x=>c3*x*x*x-c1*x*x,backOut:x=>1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2),
    backInOut:x=>x<.5?(Math.pow(2*x,2)*((c2+1)*2*x-c2))/2:(Math.pow(2*x-2,2)*((c2+1)*(x*2-2)+c2)+2)/2,
    elasticIn:x=>x===0?0:x===1?1:-Math.pow(2,10*x-10)*Math.sin((x*10-10.75)*c4),
    elasticOut:x=>x===0?0:x===1?1:Math.pow(2,-10*x)*Math.sin((x*10-.75)*c4)+1,
    elasticInOut:x=>x===0?0:x===1?1:x<.5?-(Math.pow(2,20*x-10)*Math.sin((20*x-11.125)*c5))/2:(Math.pow(2,-20*x+10)*Math.sin((20*x-11.125)*c5))/2+1,
    bounceIn:x=>1-bounceOut(1-x),bounceOut,bounceInOut:x=>x<.5?(1-bounceOut(1-2*x))/2:(1+bounceOut(2*x-1))/2
  };
})();
// value of one track at time t (seconds since the anim started)
function trackValue(k,t){
  let u=(t-(k.delay||0))/k.duration;
  if(k.loop){u+=(k.phase||0)/k.duration;
    if(k.loop==='yoyo'){const m=((u%2)+2)%2;u=m>1?2-m:m}else u=((u%1)+1)%1}
  else u=u<0?0:u>1?1:u;
  return k.from+(k.to-k.from)*EASE[k.easing||'linear'](u);
}
// all properties of a named anim at time t (normalized anims take t in 0..1); a later track on the same property takes over once its delay is reached
function anim(name,t){
  const A=DATA.anims[name],out={};
  for(const k of A.tracks){if(!(k.property in out)||k.loop||t>=(k.delay||0))out[k.property]=trackValue(k,t)}
  return out;
}
const animLen=name=>DATA.anims[name].length;
