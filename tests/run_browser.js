// Runs the same JSON suites inside the real web build through window.__game.runTest
// and checks the result equals the recorded expectations (exact hash included).
// Usage: node tests/run_browser.js [path/to/forest-duel.html]
const {chromium}=require(process.env.PW||'/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
  const page=process.argv[2]||path.join(__dirname,'../dist/forest-duel.html');
  const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+path.resolve(page));await p.waitForTimeout(500);
  let fail=0,total=0;
  for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.json'))){
    const suite=JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
    for(const t of suite.tests){total++;const got=await p.evaluate(t=>__game.runTest(t),t);
      const ok=JSON.stringify(got)===JSON.stringify(t.expect);if(!ok){fail++;console.log('FAIL',f,t.name,'\n  exp',JSON.stringify(t.expect),'\n  got',JSON.stringify(got))}else console.log('ok  ',f,t.name)}}
  console.log(`${total-fail}/${total} passed (browser)`);await b.close();process.exit(fail?1:0);
})();
