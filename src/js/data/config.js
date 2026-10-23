// =====================================================================
//  CONFIG — balance numbers (world units; 1/60 s steps), from data/balance.json
// =====================================================================
const CFG=DATA.balance;
// flask types: sprite, palette key (pal) and resolved colour (col) — data/upgrades.json
const UPG={};for(const k in DATA.upgrades)UPG[k]=Object.assign({},DATA.upgrades[k],{col:PAL[DATA.upgrades[k].pal]});
// world lines used by the simulation live in balance.json (world units, independent of the screen)
const WL=CFG.world,P_FRONT=WL.pFront,E_FRONT=WL.eFront,P_MUZZLE=WL.pMuzzle,E_MUZZLE=WL.eMuzzle,P_FLASK_Z=WL.pFlaskZ,E_FLASK_Z=WL.eFlaskZ;
