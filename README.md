# Ore Heroes

A redesign of Blacksmith Battles built around a small cast of named heroes who level up, instead of hundreds of hired workers.

This first prototype is the Mine only. You tap as the Miner, and new mine heroes arrive one at a time, each working their own spot in the mine:

- **Miner** (you): ore every tap
- **Carter**: pushes the ore cart up the rails into the tunnel and back, tipping each load on the heap
- **Phantom Pick**: a ghostly pickaxe that strikes the copper vein on its own
- **Prospector**: swings at his own rock every time the Miner swings
- **Foreman**: blows his whistle and the Miner (and Prospector) swing, every 10 s at first and faster every level
- **Blaster**: crouches by a bundle of dynamite; a big blast every 20 s
- **Lamplighter**: brighter lanterns, more ore, and keeps the mine working while you're away
- **Time Miner**: late game; turns his hourglass and every timed hero in the mine runs faster

Levels cost ore (base x 1.15 per level). Levels 10, 25, 50, 100 and every 50 after double that hero's output.

The game keeps its own save (`ore-heroes-v1`) and offline cache, fully separate from Blacksmith Battles. ## Art

The mine is built in code with ink-studio (the splat toolkit vendored in Blacksmith Battles), from `art/src/mine.js`, a fork of Blacksmith Battles' mine scene. Each hero is its own layer and is packed with the empty cave into `art/mine.png` + `art/mine.json`.

To re-render after changing `art/src/mine.js` (needs a `blacksmith-battles` clone next to this repo, or `INK_STUDIO` pointing at its `cli/ink-studio.js`):

```sh
node tools/render.js   # about 1.5 minutes, into tools/frames/
python3 tools/pack.py  # writes art/mine.png and art/mine.json
```
