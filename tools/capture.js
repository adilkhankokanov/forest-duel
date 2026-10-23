// Captures the reference frames listed in tests/screens/screens.json into tests/screens/web/<name>.png
// Usage: node tools/capture.js [dist/forest-duel.html]
const {chromium}=require(process.env.PW||'/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
  const ROOT=path.join(__dirname,'..'),cfg=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/screens/screens.json'))),out=path.join(ROOT,'tests/screens/web');
  fs.mkdirSync(out,{recursive:true});const page=path.resolve(process.argv[2]||path.join(ROOT,'dist/forest-duel.html'));
  const b=await chromium.launch();
  for(const f of cfg.frames){const p=await b.newPage({viewport:{width:cfg.viewport.width,height:cfg.viewport.height},deviceScaleFactor:cfg.viewport.deviceScaleFactor});
    await p.goto('file://'+page+'?'+f.params);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
    const r=await p.evaluate(()=>{const b=document.getElementById('c').getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}});
    await p.screenshot({path:path.join(out,f.name+'.png'),clip:r});await p.close();console.log('captured',f.name)}
  await b.close();
})();
