# Forest Duel — porting the web build to Unity (iOS / Android)

The web build stays the reference. Everything a Unity port needs is split out:
- the pure simulation;
- the data files;
- the assets;
- the tests that prove the two builds match.

Decisions taken for the port:
- **UI:** UI Toolkit (UXML/USS).
- **Simulation:** plain C# classes over plain data, ticked at a fixed 60 Hz, with MonoBehaviour views on top.
- **Numbers:** `double` in the simulation.
- **Sound:** every sound pre-rendered to WAV.
- **Shapes:** procedural shapes baked to PNG where they are static.

---

## 1. Project structure

```
build.py                 src/ + assets/ -> dist/forest-duel.html (one self-contained page)
src/index.html           page template (canvas + #ui overlay)
src/js/manifest.json     script order (two classic scripts sharing one global scope: "game", then "menu")
src/js/core/             engine-agnostic basics
  data.js                DATA (all JSON, embedded at build), T (texts), PAL (palette), fmt/tx helpers
  tween.js               easing set + stateless track evaluator  anim(name, t)
  rng.js                 mulberry32 RNG (simulation) + VRNG (visual-only stream)
  dmath.js               deterministic sin/cos/exp/hypot (bit-identical JS <-> C#)
  events.js              EVQ + emit(): sim -> views
  flow.js                app state machine  menu / battle / paused / result
  clock.js               fixed-step accumulator, freeze for captures, render clock
src/js/data/             config.js (CFG, UPG, world lines), meta.js (arenas, saved progress, metaMod)
src/js/sim/              the simulation — no DOM, no canvas, no audio, no Math.random
  noise.js state.js helpers.js sim.js
src/js/render/           canvas.js (screen mapping, sprites), fx.js (VIS effects from events), render.js (layers)
src/js/audio/audio.js    Web Audio synth, voice limit, continuous loops, haptics
src/js/input/input.js    device events -> actions (data/input.json) -> handlers
src/js/ui/               menu.js (meta screens), hud.js (in-battle buttons + pause menu, DOM)
src/js/app/              loop.js (rAF glue), debug.js (window.__game, URL params, test runner)
src/css/                 game.css (page), menu.css (UI kit + menu), hud.css (battle HUD)
src/data/*.json          every number, text, colour, timing, animation, layer order and binding
assets/sprites/          PNG sprites (+ _order.json: what the web build embeds)
assets/audio/            WAV: <sfx>_1..3, loop_rocket|wave|fence, music
tools/                   bake_sprites.js, export_audio.js, capture.js  (Playwright, run with node)
tests/                   sim.json (suite), run.js (Node), run_browser.js (real build), screens/ (reference frames)
```

Commands:

| Task | Command |
|---|---|
| Build | `python3 build.py` (~1 s) |
| Simulation tests | `node tests/run.js` (pure sim in Node) and `node tests/run_browser.js` (same suite inside the built page, via `window.__game`) |
| Reference frames | `node tools/capture.js` → `tests/screens/web/*.png` |
| Re-export assets | `node tools/bake_sprites.js`, `node tools/export_audio.js` (only after changing the drawing or synth code) |

## 2. Architecture (and its Unity shape)

```
Input Actions ──> Input (held keys, aim target) ──┐
                                                  v
           GameFlow (enum AppState) ──> GameRunner.Update: accumulator, fixed 1/60 steps
                                                  │ Sim.Step(dt)  (pure C#, owns GameState)
                                                  v
                                  List<SimEvent>  (sfx, haptic, burst, text, hit, boom, rocketBoom, shake)
                                                  v
              Views (MonoBehaviours): read GameState every frame + consume events
              Sprites/VFX · Audio · Haptics · UI Toolkit HUD/menus
```

- The simulation never reads the screen, the clock or a random source of its own.
  - Inputs reach it only through `G.P.tx` (cannon target), `G.P.keyL/keyR` and the flask it shoots.
  - Everything presentational leaves it as events.
- The simulation is ticked only by the accumulator: `CFG.sim.dt = 1/60`, at most `maxSteps = 6` steps per frame.
- Entities are plain data with step functions over arrays; there is no class hierarchy.
  - **Unity:** `struct`/`class` data, e.g. `Unit`, `Bullet`, `Fence`, `Rocket`, `Shell`, `Barrel`, `Slick`, `Tree`, `Pedestal`, `Side`.
  - **Unity:** one static `Sim` with `StepCannon`, `StepBullets`, `StepRockets`, `StepShells`, `StepBarrels`, `StepArmies`, `Step`.
  - **Unity:** views are prefabs bound to an entity id (units already have `id`).

## 3. JS → C# mapping

| JS (src/js/…) | Unity / C# | Notes |
|---|---|---|
| core/rng.js `RNG` | `class Rng { uint s; double Next(); double Range(a,b); int Int(n); }` | `Math.imul` → `unchecked((int)((uint)a*(uint)b))`. `>>>` → `uint` shifts. Same seed ⇒ same stream. |
| core/dmath.js `DM` | `static class DMath` | Port line by line. Never replace it with `System.Math`, `Mathf` or `Math.Round` (see §9). |
| core/events.js `EVQ`, `Ev.*` | `List<SimEvent>`, `SimEvent { Type, X, Z, Name, … }` | Cleared after views consume them each frame. |
| core/flow.js `Flow` | `enum AppState {Menu, Battle, Paused, Result}` + `GameFlow` with `OnChange` | `running()` = Battle or Result (match keeps animating under the result banner). |
| core/clock.js `advance` | `GameRunner.Update()` accumulator | Or `FixedUpdate` with `Time.fixedDeltaTime = 1/60f`. Keep `maxSteps`. |
| core/tween.js `anim()` | DOTween Sequences (§5) | Tracks are data; one Sequence per anim name. |
| core/data.js `DATA` | `TextAsset` JSON → `[Serializable]` classes, or ScriptableObjects generated once | Keep the JSON as the source of truth. |
| data/config.js `CFG`, `UPG`, world lines | `Balance` (from balance.json), `Upgrades` (upgrades.json) | `world.*` = base fronts, muzzles, flask rows, in world units. |
| data/meta.js `META`, `ARENAS`, `metaMod` | `MetaProgress` saved with `PlayerPrefs` or a JSON file; `Arenas` built from arenas.json | Same generation formula (thresholds, chests, theme cycle). |
| sim/noise.js | `Perlin` class (gradient table from `Rng`) | Uses `DMath.Cos/Sin`. |
| sim/state.js `reset/genTrees/snapshot/restore` | `GameState`, `World.Generate(seed)`, JSON (de)serialiser | `snapshot()` drops `grid`, `act`, `chase` (rebuilt / transient). |
| sim/helpers.js | `Sim.Upgrades`, `Sim.Economy` | `upgInfo` builds label strings (it needs the frozen tempo factors `TF_LOCK`); keep it next to the sim or pass the numbers to the view. |
| sim/sim.js | `Sim` (step functions, spatial grids `UG/SG`) | Grids are integer-keyed dictionaries; keep the same keys and iteration order (insertion order). |
| render/canvas.js `sx/sy/wx/wz`, `UI` | Camera + root transform (§4) | Only the view converts world → screen. |
| render/fx.js `VIS`, `drainEvents` | `EventView` spawning pooled VFX / floating text | Its randomness (`VR`) is presentation-only. |
| render/render.js `L_*` layers | Sorting Layers (§8) + one view component per entity type | |
| audio/audio.js | `AudioService` (AudioSources + AudioMixer), clips from assets/audio | §10 |
| input/input.js | Input System actions asset (§7) | |
| ui/menu.js, ui/hud.js | UI Toolkit: `menu.uxml/uss`, `hud.uxml/uss` + controllers | §6 |
| app/debug.js | `DebugBridge` (dev builds) + test runner (§11) | |

## 4. Coordinates, pivots, scale

- **World axes:**
  - X goes right. Base-to-base runs along Z.
  - Z grows down the screen, towards the player. The player's base front is `world.pFront = 4.325`, the enemy's is `world.eFront = -5.075`.
  - **Unity (2D):** `worldX = x`, `worldY = -z`.
- **Field squeeze (web only):**
  - The web view squeezes Z so the field fits between the walls: 55 px per unit across (`PX`), ≈ 47.23 px per unit along (`PZ`).
  - In Unity, keep simulation units as they are and put the field under a root transform scaled `(1, PZ/PX = 0.8588, 1)`.
  - Screen layout in reference pixels is in `layout.json`.
- **Reference resolution:** 393 × 852. Phones: width-fit with a portrait-locked orthographic camera. `Screen.safeArea` replaces CSS `env(safe-area-inset-*)`.
- **Sprite pivots:**
  - The web call `spr(key, x, y, width, ax, ay)` anchors the sprite at `(ax, ay)` with y going down. The Unity pivot is `(ax, 1 - ay)`.

    | Sprite | Anchor (ax, ay) |
    |---|---|
    | trees | (.5, .85) |
    | soldiers `manB`/`manR` | (.5, 1) |
    | pedestal | (.5, 1) |
    | pedestal rocket | (.5, .84) |
    | flying rocket | (.5, .62) |
    | fences | (.5, 1) |
    | everything else | centre |

  - Baked sprites list their pivot and logical size in `src/data/sprites.json`. They are baked at 4× (PPU = 4 per reference pixel).
- **Render-time sizes** (reference px): soldier 18, tank unit 46, tree 21, flask 38, player tank 68 / enemy 72 — `layout.unitPx`, `balance.flask.drawPx`.

## 5. Easing → DOTween

Each entry of `anims.json` is `{property, from, to, duration, delay, easing, loop?, phase?}`.
- A later track on the same property takes over once its delay is reached.
- `normalized: true` anims take t in 0..1 (multiply durations by the effect's life).
- `loop: "yoyo"` with `phase` reproduces the old `sin()` wobbles exactly.

| anims.json easing | DOTween `Ease` |
|---|---|
| linear | Linear |
| sineIn / sineOut / sineInOut | InSine / OutSine / InOutSine |
| quadIn / quadOut / quadInOut | InQuad / OutQuad / InOutQuad |
| cubicIn / cubicOut / cubicInOut | InCubic / OutCubic / InOutCubic |
| backIn / backOut / backInOut | InBack / OutBack / InOutBack (overshoot 1.70158) |
| elasticIn / elasticOut / elasticInOut | InElastic / OutElastic / InOutElastic |
| bounceIn / bounceOut / bounceInOut | InBounce / OutBounce / InOutBounce |
| `loop: "yoyo"` / `"restart"` | `SetLoops(-1, LoopType.Yoyo / Restart)`; phase = `Goto(phase)` at start |

Anims in use:
- **Banners:** bannerComeback, bannerTempo, bannerEnd, letterHop (per-letter stagger).
- **One-shot effects:** floatText, hitFx, boom, splat, flaskSpawn, wallCollapse.
- **Looping:** flaskBob, pedBob, pedGlow, fuse, bombSpin.

Particle emitters are data in `fx.json`: burst speed, life, radius, drag; hit and rocket-boom stars; shake.

## 6. CSS → UI Toolkit (USS)

Menu/HUD CSS is already flexbox-only, class-only (except the `#ui` root) and in reference px. Inline styles were replaced by classes; the only inline values left are progress-bar widths, which are runtime data (`style.width` in C#).

| CSS | USS / UI Toolkit |
|---|---|
| `display:flex; flex-direction; align-items; justify-content; gap` | same properties (gap → margins, or Unity 6 `gap` support) |
| `position:absolute; left/top/width/height` px | same |
| `flex:1 1 0`, `min-width:0` | `flex-grow:1; flex-basis:0; min-width:0` |
| `border-radius`, `border` | same |
| `-webkit-text-stroke` + `paint-order` | `-unity-text-outline-width/color` |
| `font-family` Lilita One / Nunito / Rubik (Google Fonts) | TTF font assets (download the same families) |
| `.is-active`, `.is-on`, `.is-off`, `--modifier` classes | `AddToClassList / RemoveFromClassList` |
| CSS variables `--gold` … | USS variables (`--gold` works in USS) |
| `linear-gradient`, `box-shadow`, `clip-path`, `filter`, `color-mix()` | **not in USS** → 9-slice PNG backgrounds, see §9 |
| `::before / ::after` | child VisualElements |
| `@keyframes` (au-pop, au-fade, au-toast, m-in, m-drift, m-bob) | USS transitions or DOTween on `VisualElement` (menu-only; gameplay uses no CSS animation) |
| `img` icons from SPR | `Background` images (`-unity-background-scale-mode: scale-to-fit`) |

## 7. Input → Input Actions

From `input.json`. The HUD buttons and the debug bridge go through the same action handlers.

| Action | Type | Bindings | Handler |
|---|---|---|---|
| aim | Value (float, screen x) | pointer x on the field | `Input.aim = aimX(px)`; applied at the next tick (edge gain 0.15) |
| moveLeft / moveRight | Button (hold) | ←/A, →/D | `G.P.keyL/keyR` each tick |
| pause | Button | P, Esc, HUD pause button | battle ⇄ paused |
| resume / restart / toMenu | Button | pause-menu buttons | |
| fullscreen | Button | HUD button | web only (drop in Unity) |
| toggleSound | Button | M | |

## 8. Render layers → Sorting Layers

`render.json` holds the draw order. In Unity, use one Sorting Layer per row:

| # | Layer | Content | Unity |
|---|---|---|---|
| 1 | paper | squared paper per arena theme | tiled `paper0..3.png` |
| 2 | slickOil | dark oil blobs under fire | sprite or decal |
| 3 | forest | trees (cached in 2 halves) + pedestals + damaged trees in Y order | SortingGroup, order = −z (sort by Y) |
| 4 | walls | base walls + HP bars; break-apart on defeat | |
| 5 | xpBar | player XP bar (shine, sparks) | UI or sprite |
| 6 | waves | comeback wave | sprite with gradient texture |
| 7 | barrels | rolling barrels | |
| 8 | splats | (disabled in balance) | |
| 9 | slickFire | glow + embers + flames (flames are depth-sorted with actors) | ParticleSystem in the Actors layer |
| 10 | actors | units, fences, flames sorted by foot Y | Sort by Y (Transparency Sort Axis = (0, 1, 0)) |
| 11 | bullets | bullets + trails | sprite + trail |
| 12 | hitFx | hit stars + rings | VFX |
| 13 | shells | tank shells + trail | |
| 14 | booms | explosion rings | VFX |
| 15 | rockets | rocket / bomb / crystal in flight + flame | |
| 16 | tanks | both cannons (+ ultimate aura) | |
| 17 | flasks | player's flask choices + labels | |
| 18 | particles | burst particles | ParticleSystem |
| 19 | floatTexts | +gold, LEVEL UP, upgrade labels | world-space TMP / UI |
| 20 | banners | YOUR COMEBACK / UPGRADES +N% | UI Toolkit |
| 21 | endScreen | confetti + VICTORY/DEFEAT | UI Toolkit + ParticleSystem |
| — | HUD (DOM) | pause + fullscreen buttons, pause menu | UI Toolkit (above everything) |

## 9. Places that are not 1:1, with a solution for each

| Item | Web today | Unity solution |
|---|---|---|
| **Determinism across platforms** | `DMath` replaces sin/cos/exp/hypot. Node and Chrome are bit-identical (tests prove it). | Port `DMath` and `Rng` exactly.<br>JS `Math.round(x)` rounds .5 up → C# `Math.Floor(x + 0.5)`, not `Math.Round` (banker's).<br>JS `Array.sort` is stable → use a stable sort (`OrderBy`, or insertion order + index tiebreak).<br>Integer ops `\|0`, `>>>0` → explicit casts.<br>Keep `double`.<br>IL2CPP: no `-ffast-math` / FMA contraction (default is fine). |
| Procedural VFX: flames, embers, smoke, ultimate aura, slick glow, bullet/shell/rocket trails, wave gradient, boom ellipses, hit stars, confetti, XP-bar shine | Canvas paths and gradients every frame | ParticleSystem / TrailRenderer / sprite + Shader Graph.<br>Timings and colours are in fx.json, anims.json and palette.json.<br>Pixel-exact match is not expected here (compare with tolerance, §11). |
| Hit flash (white silhouette over sprites) | `whiteImg` cache + alpha | Sprite shader with `_FlashAmount` |
| Forest cache (2 offscreen canvases, patch repaint) | Speed trick for 800 trees | Not needed: static sprites + SRP batching. Keep the same Y order. |
| Squared paper | Drawn at device resolution for crisp lines | Tiled `paper0..3.png` (one 13 px cell at 4×) |
| Tree tints per arena | Were HSV-recoloured at runtime | Now baked PNGs `tree{G,Y}_{autumn,winter,fire}` |
| Static shapes: shell, bomb, crystals, fuse spark, barrel icon, fullscreen button | Were canvas paths | Baked PNGs (`tools/bake_sprites.js`, pivots in sprites.json) |
| Still procedural | Rolling barrel (moving hoops), oil slick blob (seeded outline), HP bars, XP bar | Barrel: sprite + scrolling hoop texture.<br>Slick: sprite with random rotation/scale.<br>Bars: 9-slice sprites (colours in palette.json). |
| Outlined canvas text (`outlined`, `bounceText`) | `strokeText` + `fillText`, Rubik 800 | TextMeshPro with outline. Per-letter hop = TMP vertex animation driven by the `letterHop` track. |
| Menu CSS gradients, box-shadows, clip-path ribbons, filters, `color-mix()` | CSS | 9-slice PNGs per state (button gold/green/blue/red/grey, modal, upgrade card, node, milestone, resource pill).<br>Capture them from the web build at 4× with the same Playwright setup as `tools/capture.js`. |
| Sound | Synthesized live (Web Audio), 3 pre-rendered variants for frequent sounds | WAVs in assets/audio: 3 variants per sfx (pick one at random, pitch 0.96–1.04), `loop_*` for continuous sounds, `music.wav` (seamless 9.6 s loop). Settings in §10. |
| Haptics | `navigator.vibrate` / iOS checkbox trick | Native haptics plugin (Core Haptics / VibrationEffect). Kinds: flask, rocket, banner. |
| Saved progress | `localStorage['forestDuel.meta.v1']` | `PlayerPrefs` or a JSON file (same structure, `meta.json` defaults) |
| Fullscreen button, iOS audio unlock, `claude.hot` snapshot hooks | Web-only | Drop |
| Upgrade label strings built in the sim (`upgInfo`, uses frozen tempo `TF_LOCK`) | Sim builds the text with `T.*` | Keep in C# next to the sim (string table lookup), or emit numbers and format in the view |
| Pause-menu taps | DOM over the canvas; a transparent hit area keeps the pause icon clickable while paused (as before) | UI Toolkit buttons; same rule |
| Screen shake | Canvas translate of the field (HUD no longer shakes) | Camera shake (Cinemachine impulse or DOTween), field camera only |

## 10. Audio

- **Mixer:** master gain 0.55 → low-pass 5200 Hz (Q 0.5) → compressor (WebAudio defaults: threshold −24 dB, knee 30, ratio 12, attack 3 ms, release 250 ms).
  - The WAVs are pre-mixer, so apply this chain on the SFX group of the AudioMixer.
- **Voices:** at most 14 at once. A voice counts for 400 ms if pre-rendered and 900 ms otherwise.
  - `alwaysPlay` sounds bypass the limit: bigBoom, win, lose, rush, level, tankSpawn.
- **Re-trigger gap:** each sfx call has a minimum gap in seconds (the second argument of `Ev.sfx` in the sim). Keep it per clip.
- **Loops:** rocket 0.16, wave 0.22, fence 0.13 gain, with a 0.15 s fade-in and 0.25 s fade-out.
- **Music:** volume 1 in menus, 0.6 in battle; paused while the game is paused.
- **Import settings:**
  - Short SFX: Decompress On Load, mono, 44.1 kHz.
  - Music: Streaming (Vorbis).

## 11. Tests and reference screenshots

### Simulation suite (`tests/sim.json`)

- **Test format:** `{name, seed, level, steps, inputs:[{at, action, value}], roundTripAt?, expect}`.
- **Inputs** are applied before step `at`:
  - `aim` takes a screen x in reference px.
  - `moveLeft` / `moveRight` take true or false.
- **`expect`** holds the time, state, both sides (hp, gold, lvl, x, dmgMul, rateMul), unit, tree, fence and rocket counts, and the exact state hash (FNV-1a over the snapshot JSON).
- **Unity runner** (EditMode test):
  - For each test: `Sim.Reset(seed, level)`, apply the inputs, `Step(1/60)` × steps, build the same summary.
  - Compare the numbers with `tol`; compare the hash only if you serialise the state with the same key order as JS.
  - `roundTripAt`: serialise and deserialise the state at that step. The result must equal the continuous run.
- **Web:**
  - `node tests/run.js` (Node).
  - `node tests/run_browser.js` (inside the built page). Both must pass with the same expectations.
- **After an intended balance change:** `node tests/run.js --update`.

### Debug bridge (web, `window.__game`)

| Call | What it does |
|---|---|
| `getState()` | state + RNG + flow |
| `setState(json)` | loads a state and enters battle |
| `setSeed(n)` | new match with seed n |
| `step(n)` | runs n fixed steps |
| `input(action, value)` | fires an action |
| `pause()` / `resume()` | freezes / unfreezes real time |
| `summary()` | the summary used by the tests |
| `runTest(test)` | runs one test |

### URL params

- `?seed=N`
- `?level=N` (arena index)
- `?state=<json or base64>`
- `?frame=N` (run N steps from the start, then freeze)

When frozen:
- the frame is repeatable: visual randomness is reseeded from match time;
- looping anims follow match time;
- confetti stops spawning.

### Reference frames

1. `tests/screens/screens.json` lists the frames (seed, level, frame).
2. Capture the web references with `node tools/capture.js`. Output: `tests/screens/web/<name>.png` at 786×1704 (393×852 @2×).
3. In Unity, for each frame:
   - load the seed and level;
   - step N times with the views updated once at the end;
   - render the field camera to a 786×1704 RenderTexture;
   - save `tests/screens/unity/<name>.png`.
4. Compare, e.g. `compare -metric AE -fuzz 8% web/x.png unity/x.png diff/x.png`:
   - expect sprite/layout areas to match closely;
   - mask or tolerate particle and VFX areas (§9);
   - check positions of units, trees, HP numbers and labels first.

## 12. Porting steps

1. **Data:** import `src/data/*.json` and generate C# data classes. Import `assets/sprites` (pivots from sprites.json and §4), `assets/audio`, and the fonts.
2. **Core:** port `Rng`, `DMath`, `SimEvent` queue, `GameFlow`, the fixed-step runner, and the `Tween` evaluator (or DOTween Sequences built from anims.json).
3. **Simulation:** port `noise → state → helpers → sim` 1:1. Then port the test runner and make `tests/sim.json` pass (numbers within `tol`).
4. **Views:** add the sorting layers (§8), entity prefabs (tank, unit, giant, fence, flask, pedestal objects, rocket, shell, barrel), the world → screen root transform (§4), and the EventView (VFX, floating text, shake).
5. **Audio and haptics:** mixer chain, voice limit, loops, music (§10).
6. **Input:** actions asset (§7), wired to the same handlers.
7. **UI Toolkit:** HUD (pause, pause menu, banners) and menu screens (battle, hero, army, settings, arena path, result).
   - Bake the 9-slice backgrounds.
   - Texts come from texts.json (English).
8. **Meta:** save and load progress, arenas, rewards, trophies (+30 / −15, never below the arena's minimum).
9. **Parity:** capture the reference frames in Unity, compare with the web references, and fix the differences.
