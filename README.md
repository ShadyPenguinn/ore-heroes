# Ore Heroes

A redesign of Blacksmith Battles built around a small cast of named heroes who level up, instead of hundreds of hired workers.

The game starts in the Mine. You tap as the Miner, and new mine heroes arrive one at a time, each working their own spot in the mine:

- **Miner** (you): ore every tap
- **Carter**: pushes the ore cart up the rails into the tunnel and back, tipping each load on the heap
- **Phantom Pick**: a ghostly pickaxe that strikes the copper vein on its own
- **Prospector**: swings at his own rock every time the Miner swings
- **Foreman**: blows his whistle and the Miner (and Prospector) swing, every 10 s at first and faster every level
- **Blaster**: crouches by a bundle of dynamite; a big blast every 20 s
- **Lamplighter**: brighter lanterns, more ore, and keeps the mine working while you're away
- **Time Miner**: late game; turns his hourglass and every timed hero in the mine runs faster

Levels cost ore (base x 1.15 per level). Levels 10, 25, 50, 100 and every 50 after double that hero's output.

## The Forge

Hiring the Foreman opens the forge (he keeps the Miner swinging while you smith); switch with the Mine / Forge buttons. Forging is Blacksmith Battles' minigame: pick a weapon and a blank size in Folds (a 3-Fold Copper blank is 150 ore, each Fold doubles it), heat it, and strike while the marker crosses the glow. Perfect is 2 stars, Good 1, and from the 5th Perfect in a row each is worth one more. A miss ends the blank and costs a third of your stars; Quench banks the score early. Stars set the grade (Crude, Fine, Superior, Masterwork, Exalted... 20 grades). Your best weapon of each kind hangs on the rack.

- **Blacksmith** (you): +1 Fold every 5 levels (Copper holds 10); levels 5/20/40 widen the glow and 10/30/50 slow the marker; Axes at 25, Spears at 50, Shields at 75, Warhammers at 100
- **Swordsmith** (Blacksmith 5): every Sword you forge gets +3% Might and Haste per level, locked in. Blanks are paid in ore only (no ingots)
- **Axesmith, Spearwright, Shieldwright, Hammersmith**: +3% to their weapon's two signature stats per level, locked in when you forge it; they finish your weapon at their station

The game keeps its own save (`ore-heroes-v1`) and offline cache, fully separate from Blacksmith Battles.

## Art

The mine and the forge are built in code with ink-studio (the splat toolkit vendored in Blacksmith Battles), from `art/src/mine.js`, a fork of Blacksmith Battles' mine scene. Each hero is its own layer and is packed with the empty cave into `art/mine.png` + `art/mine.json`.

The forge is `art/src/forge.js`, in the same style and camera. To re-render after changing a scene (needs a `blacksmith-battles` clone next to this repo, or `INK_STUDIO` pointing at its `cli/ink-studio.js`):

```sh
node tools/render.js mine    # or forge; about 1.5 minutes, into tools/frames/<scene>/
python3 tools/pack.py mine   # writes art/mine.png and art/mine.json (or forge)
```

## The mine and the forge in 3D

The mine (`mine3d.js`) and the forge (`forge3d.js`) are drawn live in 3D with three.js, sharing `kit3d.js`. The mine is a lantern-lit cave built in code; the game's own clocks (swings, cart trips, blasts) drive the 3D heroes. Both use KayKit models and KayKit's own animations by Kay Lousberg (CC0, see `models/KayKit-License.txt`). The Blacksmith (Barbarian) swings on every strike and his hammer lands on the anvil; the Swordsmith (Knight) hones at the grindstone. The 2D canvas draws on top of it for sparks, numbers and the rack glints. three.js r160 is vendored in `lib/` so the game works offline. Without WebGL the game falls back to the 2D art.

`models/` holds the KayKit files converted to .glb, with the animation files cut down to the clips the game uses.
