"""Packs the frames from render.js into art/mine.png (one atlas) and art/mine.json (where each sprite is).
Every frame is stored as just the pixels that differ from the empty cave (bg), cropped to their box, so the whole
scene is one background plus small cut-outs. Usage: python3 tools/pack.py"""
import json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, 'frames')
OUT = os.path.join(HERE, '..', 'art')
meta = json.load(open(os.path.join(FR, 'jobs.json')))
PX = 2

def load(name):
    a = np.asarray(Image.open(os.path.join(FR, name + '.png')).convert('RGB'))
    return a[::PX, ::PX]

bg = load('bg')
H, W = bg.shape[:2]
items = [('bg', (np.dstack([bg, np.full(bg.shape[:2], 255, np.uint8)]), 0, 0))]
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

AW = 1024
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
q = im.quantize(colors=255, method=Image.FASTOCTREE)
if (np.asarray(q.convert('RGBA'))[..., 3] == atlas[..., 3]).all():
    q.save(os.path.join(OUT, 'mine.png'), optimize=True)
else:
    im.save(os.path.join(OUT, 'mine.png'), optimize=True)
out = {'w': W, 'h': H, 'sprites': {n: list(map(int, v)) for n, v in place.items()}, 'heroes': meta['heroes'], 'cart': meta['cart']}
json.dump(out, open(os.path.join(OUT, 'mine.json'), 'w'), separators=(',', ':'))
print('mine', W, H, 'atlas', AW, AH, 'sprites', len(place), 'png', os.path.getsize(os.path.join(OUT, 'mine.png')))
