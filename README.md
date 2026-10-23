# Forest Duel (web)

One-file web game built from modular sources, prepared for a 1:1 Unity port.

- Build: `python3 build.py` → `dist/forest-duel.html` and `index.html` (the page Cloudflare serves)
- Tests: `node tests/run.js` (pure simulation in Node) · `node tests/run_browser.js` (same suite in the built page)
- Reference frames: `node tools/capture.js` → `tests/screens/web/`
- Debug: `window.__game` in the console; URL params `?seed= ?level= ?state= ?frame=`

Tools and tests use Playwright (set `PW` to its module path if it is not at `/opt/npm-tools/node_modules/playwright`).

Everything about the structure, the JS → C# mapping and the Unity port is in [PORTING.md](PORTING.md).

## Deploy

1. `python3 build.py`
2. Commit and push (the root `index.html` is the published game).
3. Point the Cloudflare Worker `forest-duel` at the new commit SHA (it serves `raw.githubusercontent.com/adilkhankokanov/forest-duel/<sha>/index.html`).
