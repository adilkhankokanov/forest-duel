# Nano Banana Pro — UI style task (Forest Duel)

Paste the master prompt first, then one asset prompt at a time. Attach as references:
1. a screenshot of the current game (menu + battle) — for the notebook-paper look;
2. the "Random Match" button reference — for button shape only.

## Master style prompt

```
You are designing UI assets for "Forest Duel", a cute casual mobile tank game.
Keep the game's existing look: everything sits on white NOTEBOOK PAPER with a light blue
13px square grid, like doodles in a school exercise book. Assets are hand-drawn cartoon
stickers placed on that paper.

Button / panel shape language (take ONLY the shape and rendering from the button reference,
NOT its colors, NOT its lightning icon, NOT the black number panel next to it):
- chunky rounded rectangle, corner radius about 30% of height
- thick dark ink outline (#2b2223), 6–8 px at 1x, slightly uneven like a marker
- flat main face colour + a thin lighter inner rim along the top edge
- a darker "lip" band at the bottom (about 15% of height) so it looks pressed-out, like a toy key
- a solid dark drop shadow straight down (no blur), 8–10 px
- two small white glint marks: a short pill in the top-left corner and a dot next to it
- label in a heavy rounded display font, white fill, thick dark outline, 3 px dark shadow below
- no gradients other than the subtle top rim; no glossy plastic, no bevel-and-emboss,
  no realistic lighting, no textures except optional faint paper grain

Palette (faces): green #69c47f, blue #3fa2f0, red #ef5a55, grey #c7cad1,
orange BATTLE #ffa62b (lip #e67e16, rim #ffd58a), purple ultimate #9b6bff, gold #ffd34d.
Ink #2b2223. Paper #fbfaf6 with grid lines #c9dbf5.

Output: transparent background PNG, centred, nothing else in the frame, no text unless asked,
front view, flat 2D, crisp edges, 4x resolution, consistent outline width across the set.
```

## Asset prompts (one per generation)

1. **Button blanks** — "A set of 5 empty chunky buttons in the style above: green, blue, red, grey and orange, same size 3:1, laid out in a row with generous spacing, no labels."
2. **Square icon buttons** — "4 square chunky buttons (1:1) in blue: pause, fullscreen, settings gear, close X. Icon drawn in white with dark ink outline."
3. **Panel / modal** — "A large rounded panel for a settings window: cream paper face with the faint blue notebook grid inside, thick ink outline, darker bottom lip, solid drop shadow, a coloured header ribbon (blue) across the top. No text."
4. **Tabs bar** — "A bottom navigation bar with 3 chunky tab slots on notebook paper; the selected tab raised and orange, the others flat grey. Icons: tank, army helmet, shop bag."
5. **Resource pills** — "A gold-coin counter pill and a trophy counter pill: rounded capsule, white face, ink outline, round icon badge overlapping the left edge, plus small '+' chunky green button on the right."
6. **HP bars** — "Two horizontal health-bar frames (red enemy, blue player): rounded, ink outline, dark empty track, chunky fill, small inner highlight line on top. Also a 5-segment XP bar where the last segment is purple and carries a small 'ULT' badge."
7. **Flask cards** — "Round sticker badges for upgrade flasks: glass potion bottle drawn cartoon style inside a coloured circle (orange damage, yellow fire rate, green squad, blue tank, purple ultimate), ink outline, white glint."
8. **Result screen emblems** — "VICTORY emblem: gold trophy with rays on notebook paper style. DEFEAT emblem: a round shield cracked and pierced by a bullet hole, split in two halves. Both chunky ink style, no text."
9. **Matchmaking backgrounds** — "Two seamless tileable notebook-paper backgrounds, 512×512: one soft pink paper (#f4c9c5) and one soft blue paper (#c9dbf5), each with a slightly darker 13px square grid, faint paper grain, no gradients, tiles seamlessly in both directions."

## Consistency checklist (reject if any fails)

- outline is dark ink, same thickness on every asset
- bottom lip + solid shadow present on every button/panel
- no lightning bolt, no side number panel, no extra decorations from the reference
- flat colours, notebook-paper feel, transparent background
- labels (if any) are English
