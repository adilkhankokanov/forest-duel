// =====================================================================
//  DMATH — deterministic math for the simulation.
//  Math.sin/cos/exp/hypot may differ in the last bit between browsers, Node and .NET,
//  and one flipped bit can change a whole match. These use only + - * / and sqrt
//  (exactly rounded by IEEE 754 everywhere), so JS and C# (double) give identical results.
//  Unity: port 1:1 as a static class DMath (do not swap in System.Math / Mathf).
// =====================================================================
const DM=(()=>{
  const PI=3.141592653589793,TWO_PI=6.283185307179586,HALF_PI=1.5707963267948966;
  function sin(x){
    x-=Math.round(x/TWO_PI)*TWO_PI;                 // -> [-pi, pi]
    if(x>HALF_PI)x=PI-x;else if(x<-HALF_PI)x=-PI-x; // -> [-pi/2, pi/2]
    const x2=x*x;                                    // Taylor series to x^17
    return x*(1+x2*(-1/6+x2*(1/120+x2*(-1/5040+x2*(1/362880+x2*(-1/39916800+x2*(1/6227020800+x2*(-1/1307674368000+x2*(1/355687428096000)))))))));
  }
  const cos=x=>sin(x+HALF_PI);
  // e^x: split off whole powers of e^(1/8), series for the small remainder
  function exp(x){
    let n=Math.round(x*8),r=x-n/8,s=1,t=1;
    for(let i=1;i<14;i++){t*=r/i;s+=t}
    const E8=1.1331484530668263;let p=1,b=n<0?1/E8:E8;n=Math.abs(n);
    while(n>0){if(n&1)p*=b;b*=b;n>>=1}
    return s*p;
  }
  const hypot=(a,b)=>Math.sqrt(a*a+b*b);
  return{sin,cos,exp,hypot,PI};
})();
