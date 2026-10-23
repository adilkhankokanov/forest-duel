// =====================================================================
//  DATA — every JSON file from src/data, embedded by the build.
//  Unity: the same files as TextAssets (or ScriptableObjects generated from them).
// =====================================================================
const DATA=__DATA__;
const T=DATA.texts;
// text template: "УРОВЕНЬ {n}!" + 5 -> "УРОВЕНЬ 5!"
const tx=(s,n)=>s.replace('{n}',n);
// number shown in labels: at most 2 decimals
const fmt=v=>String(Math.round(v*100)/100);
// colours: only from data/palette.json. Sim events carry palette keys; views resolve them.
const PAL=DATA.palette;
const col=c=>PAL[c]||c;
const hexRgb=h=>{h=h.slice(1);if(h.length===3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]};
// palette colour with alpha -> css rgba()
const pa=(k,a)=>{const[r,g,b]=hexRgb(PAL[k]);return'rgba('+r+','+g+','+b+','+a+')'};
// blend of two palette colours, t in 0..1
const lerpCol=(a,b,t)=>{const A=hexRgb(PAL[a]),B=hexRgb(PAL[b]);return'rgb('+A.map((v,i)=>v+(B[i]-v)*t|0).join(',')+')'};
