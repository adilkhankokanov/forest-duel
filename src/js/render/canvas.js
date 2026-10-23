// =====================================================================
//  SPRITES + CANVAS
// =====================================================================
const SPR=__SPRITES__;
const IMG={};for(const k in SPR){const i=new Image();i.onload=()=>{try{whiteImg(k)}catch(e){}};i.src=SPR[k];IMG[k]=i}
const W=DATA.layout.ref.w,H=DATA.layout.ref.h;
const cv=document.getElementById('c');let ctx=cv.getContext('2d');
let K=1;
function resize(){
  const phone=innerWidth<=600||matchMedia('(pointer:coarse)').matches,mh=phone?0:28,mw=phone?0:36;
  // real visible area: visual viewport minus the safe-area padding the page sits inside
  const cs=getComputedStyle(document.documentElement),vv=window.visualViewport;
  const vh=Math.min(innerHeight,vv?vv.height:innerHeight,document.documentElement.clientHeight||innerHeight)-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0);
  const vw=Math.min(innerWidth,vv?vv.width:innerWidth,document.documentElement.clientWidth||innerWidth);
  const s=Math.max(.2,Math.min((vh-mh)/H,(vw-mw)/W));
  cv.style.width=W*s+'px';cv.style.height=H*s+'px';
  const st=document.getElementById('stage'),u=document.getElementById('ui');if(st){st.style.width=W*s+'px';st.style.height=H*s+'px'}if(u)u.style.transform='scale('+s+')';
  const d=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*s*d);cv.height=Math.round(H*s*d);K=s*d;
}
addEventListener('resize',resize);window.visualViewport&&visualViewport.addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));resize();

// ---------- screen layout (unchanged UI) and world mapping ----------
const UI=DATA.layout.ui; // screen layout in reference pixels (393×852)
// field between the walls is squeezed to fit; world units stay the same (base-to-base = 9.4)
const LW=DATA.layout.world,PX=LW.pxPerUnitX,CX=W/2,PZ=LW.pxPerUnitZRef*(UI.pWall-(UI.eWall+UI.wallH))/LW.refFieldPx,ZY0=(UI.eWall+UI.wallH+UI.pWall)/2-CFG.tree.midZ*PZ;
const sx=X=>CX+X*PX, sy=Z=>ZY0+Z*PZ, wx=x=>(x-CX)/PX, wz=y=>(y-ZY0)/PZ;
const SOLDIER_PX=DATA.layout.unitPx.soldier,GIANT_PX=DATA.layout.unitPx.giant;


