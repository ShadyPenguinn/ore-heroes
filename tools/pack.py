"""Packs the frames from render.js into art/mine.png (one atlas) and art/mine.json (where each sprite is).
Every frame is stored as just the pixels that differ from the empty cave (bg), cropped to their box, so the whole
scene is one background plus small cut-outs. Usage: python3 tools/pack.py mine|forge|camp|explore"""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WHICH = sys.argv[1] if len(sys.argv) > 1 else 'mine'
FR = os.path.join(HERE, 'frames', WHICH)
OUT = os.path.join(HERE, '..', 'art')
meta = json.load(open(os.path.join(FR, 'jobs.json')))
# the mine is rendered at px 1 (full detail) and kept that way: the game draws it at half size on a 2x canvas ("k": 2).
# The others are rendered at px 2 and kept one pixel per art pixel.
PX = 1 if WHICH in ('mine', 'forge', 'camp') else 2
K = 2 if WHICH in ('mine', 'forge', 'camp') else 1

def load(name):
    a = np.asarray(Image.open(os.path.join(FR, name + '.png')).convert('RGB'))
    return a[::PX, ::PX]

bg = load('bg')
H, W = bg.shape[:2]
items = [('bg', (np.dstack([bg, np.full(bg.shape[:2], 255, np.uint8)]), 0, 0))]
masks = {}  # where each frame's changeable colours are (multi.js: <name>.slots.png), cropped like the frame
for n in meta['jobs']:
    if n == 'bg':
        continue
    a = load(n)
    m = (a != bg).any(2)
    ys, xs = np.nonzero(m)
    if not len(xs):
        print('empty', n); continue
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., :3] = a[y0:y1, x0:x1]
    rgba[..., 3] = m[y0:y1, x0:x1] * 255
    items.append((n, (rgba, int(x0), int(y0))))
    sp = os.path.join(FR, n + '.slots.png')
    if os.path.exists(sp):
        sm = np.asarray(Image.open(sp).convert('RGB'))[::PX, ::PX, 0]
        masks[n] = (sm[y0:y1, x0:x1] * m[y0:y1, x0:x1]).astype(np.uint8)

AW = 2048 if WHICH in ('mine', 'forge', 'camp') else 1024
x = y = rowh = 0
place = {}
for n, (img, ox, oy) in sorted(items, key=lambda it: -it[1][0].shape[0]):
    h, w = img.shape[:2]
    if x + w > AW:
        x, y, rowh = 0, y + rowh + 1, 0
    place[n] = (x, y, w, h, ox, oy)
    x += w + 1
    rowh = max(rowh, h)
AH = y + rowh
atlas = np.zeros((AH, AW, 4), np.uint8)
for n, (img, ox, oy) in items:
    px, py, w, h, _, _ = place[n]
    atlas[py:py + h, px:px + w] = img
im = Image.fromarray(atlas, 'RGBA')
slots = {}
if masks:
    sa = np.zeros((AH, AW), np.uint8)
    for n, mk in masks.items():
        px, py, w, h, _, _ = place[n]
        sa[py:py + h, px:px + w] = mk
    Image.fromarray(sa, 'L').save(os.path.join(OUT, WHICH + '-slots.png'), optimize=True)
    for f in sorted(os.listdir(FR)):
        if f.startswith('slots-') and f.endswith('.json'):
            slots[f[6:-5]] = json.load(open(os.path.join(FR, f)))
# an exact palette when the atlas has few enough colours (the splat look does: a few hundred at most), else the nearest 255
cols = np.unique(atlas[atlas[..., 3] > 0][:, :3], axis=0)
if len(cols) <= 255:
    key = lambda c: (c[..., 0].astype(np.int64) << 16) | (c[..., 1].astype(np.int64) << 8) | c[..., 2]
    qa = (np.searchsorted(key(cols), key(atlas[..., :3])) + 1).astype(np.uint8)
    qa[atlas[..., 3] == 0] = 0
    q = Image.fromarray(qa, 'P'); q.putpalette([0, 0, 0] + cols.flatten().tolist()); q.info['transparency'] = 0
else:
    q = im.quantize(colors=255, method=Image.FASTOCTREE)
print('colours', len(cols))
if (np.asarray(q.convert('RGBA'))[..., 3] == atlas[..., 3]).all():
    q.save(os.path.join(OUT, WHICH + '.png'), optimize=True)
else:
    im.save(os.path.join(OUT, WHICH + '.png'), optimize=True)
out = {**({'k': K} if K > 1 else {}), 'w': W, 'h': H, 'sprites': {n: list(map(int, v)) for n, v in place.items()}, 'heroes': meta['heroes'], **({'cart': meta['cart']} if 'cart' in meta else {}), **({'slots': slots} if slots else {})}
json.dump(out, open(os.path.join(OUT, WHICH + '.json'), 'w'), separators=(',', ':'))
print(WHICH, W, H, 'atlas', AW, AH, 'sprites', len(place), 'png', os.path.getsize(os.path.join(OUT, WHICH + '.png')))
