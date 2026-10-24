# Forest Duel — motion pass (storyboard)

Idea: **the world has weight and a living camera.** Everything still works exactly as before; only the
presentation reacts more. The menu breathes slowly, the battle camera follows the action, and big events
hit with weight (punch-in, damped shake, debris that falls).

Rule: the simulation is untouched — every effect reads sim state or sim events (view layer only).
Unity: camera rig = Cinemachine impulse + noise profile; UI = DOTween sequences with the same curves.

## Scenes, options, choice

| # | Scene | Options considered | Chosen |
|---|---|---|---|
| 1 | Menu idle (battle tab scene) | static · trees sway + idle tank · layered parallax drift · light sweep · cloud shadows | **Layered drift + sway + cloud shadow**: paper, trees and tank drift on slow figure-8 paths with depth-dependent amplitude; every tree sways from its trunk with its own phase; a soft cloud shadow crosses the paper. |
| 2 | BATTLE button | pulse · breathing + shine sweep · bob · ripple ring | **Breathing + diagonal shine** every 2.6 s; press keeps the squash pop. |
| 3 | Tab switch | diagonal pop (old) · directional slide · zoom-through · card flip | **Directional entrance**: items enter from the side of the chosen tab (offset + slight skew → settle with overshoot), still staggered along the diagonal. |
| 4 | Gold counter | instant · count-up + pill pop · flying coins | **Count-up (0.6 s) + pill pop + coin icon spin.** |
| 5 | Matchmaking VS / FIGHT | scale-in (old) · slam with blur + shake · letter drop · radial speed lines | **Slam**: words drop in from 2.6× with motion blur that clears on contact, the halves shake on impact, white flash; FIGHT gets a burst of radial speed lines. |
| 6 | Battle camera | static + jitter (old) · handheld drift + damped shake · zoom punches · lean to aim · intro dolly | **Drift + damped shake + punches + lean + intro dolly + end push-in.** Base zoom 1.02 so drift never shows an edge. |
| 7 | Battle impacts | as is · spawn pop · hit squash · falling debris · speed streaks | **Spawn pop** (units scale in with overshoot), **debris with gravity** (particles fall and shrink), **speed streaks** on rockets. |
| 8 | Floating texts | float (old) · pop + tilt · punch + shake | **Pop with overshoot and a slight tilt**, then float and fade. |
| 9 | End of match | banner + confetti (old) · camera push to the broken base | **Push-in (1.6 s) towards the destroyed wall** under the existing banner and confetti. |

## Timing / sync (events that drive the camera)

| Sim event | Camera | Sound (unchanged) |
|---|---|---|
| shake(v) | trauma += v → smooth noise offset ±(trauma²·10 px), roll ±0.8° | — |
| boom (r ≥ 1.2) / rocketBoom | punch-in +3% / +5% towards the impact, decays in ~0.35 s | boom / bigBoom |
| match created | dolly 1.10 → 1.02 over 1.4 s (under the matchmaking panels) | bugle / rush |
| win / lose | push-in +5% towards the destroyed base over 1.6 s | win / lose |

## Pass 2

| # | Scene | Options considered | Chosen |
|---|---|---|---|
| 10 | Camera near the edges | always lean · hard clamp · dead zone + spring | **Dead zone + critically damped spring**: centred in the middle, glides up to 32 px after the cannon near an edge so the whole tank stays visible; paper and walls extend past the screen. |
| 11 | Result screen | old modal · full-screen card · split banner · staged screen | **Staged screen**: VICTORY — gold rays, trophy drops and lands with a squash (shake + flash), letters fall one by one, +trophies count up, 3 stat rows slide in and count; DEFEAT — rain, a cracked shield under a cloud, heavy wobbling landing, drooping letters, no trophies, no confetti. |
| 12 | Army level-up | glow · confetti · juicy impact | **Juicy impact**: held squash pose (hit-stop 70 ms), squash 1.3/0.7 → 0.9/1.1 → 1, white→lemon flash, decaying shake, model jumps and lands, badge pops 1.45, sparks, “LEVEL N!” rises −180% and fades. |
| 13 | Battle tab scene | flat · tilted plane · full 3D | **Tilted plane** (rotateX 18°, perspective 760 px): you look a little into the distance. |
| 14 | VS / FIGHT | scale slam · letters clash · letters drop | **VS letters fly in from opposite sides and clash; FIGHT letters drop one by one with a squash**, Bungee, smaller; cards −30 %, both background halves drift the same way. |

## Pass 3

| # | Scene | Options considered | Chosen |
|---|---|---|---|
| 15 | Battle intro | flat dolly · CSS tilt of the canvas · strip-warped ground + upright sprites | **Low perspective close-up**: ground warped strip by strip (52°, ×1.9), trees / pedestals / tanks stand upright at their projected feet, haze at the horizon; held while the matchmaking halves open, flattens into the battle view between FIGHT and the start. |
| 16 | Wider forest | plain paper past the edge · real extra trees (changes the match) · decoration | **Decoration**: the outer 30 % bands of the forest are copied outwards (view only). |
| 17 | Defeat emblem | cracked shield · broken flag · shield shot through | **Shield shot through**: bullet streak, hit-stop squash + hole + shake, then the shield splits along the crack into two halves with chips; warm red screen, no rain. |
| 18 | Result stats | 3 bars · 2×2 tiles with rolling digits | **2×2 tiles** (battle time, upgrades, trees cut, enemies defeated) pop in with a squash; digits roll like a slot machine, land with a pop and sparkles. |
| 19 | Army level-up (card view) | full-screen shake · podium effect | **Podium**: soft flash, light beam, two expanding rings, rising sparkles; the model jumps and lands, no screen shake. |
