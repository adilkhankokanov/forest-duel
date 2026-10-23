// =====================================================================
//  NOISE
// =====================================================================
function makeNoise(){
  const p=new Uint8Array(512),g=[];for(let i=0;i<256;i++){p[i]=i;const a=RNG.next()*Math.PI*2;g.push([DM.cos(a),DM.sin(a)])}
  for(let i=255;i>0;i--){const j=Math.floor(RNG.next()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
  for(let i=0;i<256;i++)p[i+256]=p[i];
  const f=t=>t*t*t*(t*(t*6-15)+10);
  return(x,y)=>{const X=Math.floor(x),Y=Math.floor(y),xf=x-X,yf=y-Y,xi=X&255,yi=Y&255;
    const d=(h,dx,dy)=>{const v=g[h];return v[0]*dx+v[1]*dy};
    const a=d(p[p[xi]+yi],xf,yf),b=d(p[p[xi+1]+yi],xf-1,yf),c=d(p[p[xi]+yi+1],xf,yf-1),e=d(p[p[xi+1]+yi+1],xf-1,yf-1);
    const u=f(xf),v=f(yf);return(a+(b-a)*u)+((c+(e-c)*u)-(a+(b-a)*u))*v;}
}

