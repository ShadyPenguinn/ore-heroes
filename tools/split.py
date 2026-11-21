"""Cuts the camp's set renders into one frame per spot, before pack.py. art/src/camp.js draws each body or head layer at three spots at
once (set a: spots 2, 4, 1; set b: spots 0, 5, 3, left to right on screen, far enough apart not to touch). Here every changed pixel
goes to the spot whose column is nearest (the columns come from the bald male heads, one small blob per spot), and each spot gets a
frame of its own: tools/frames/camp/b-sword-2.png and so on, with its .slots.png. The colour slots are the same at every spot, so
slots-b-sword-a.json becomes slots-b-sword.json, and every head shares slots-h.json. Usage: python3 tools/split.py camp"""
import json, os, sys, re
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, 'frames', sys.argv[1] if len(sys.argv) > 1 else 'camp')
SETS = {'a': [2, 4, 1], 'b': [0, 5, 3]}
rgb = lambda n: np.asarray(Image.open(os.path.join(FR, n + '.png')).convert('RGB'))
bg = rgb('bg').astype(int)
diff = lambda a: np.abs(a.astype(int) - bg).sum(2) > 0

def centres(set_):
    xs = np.sort(np.nonzero(diff(rgb('h-male-bald-' + set_)))[1])
    gaps = np.argsort(np.diff(xs))[-2:]
    cuts = sorted(xs[g] + (xs[g + 1] - xs[g]) / 2 for g in gaps)
    groups = [xs[xs < cuts[0]], xs[(xs >= cuts[0]) & (xs < cuts[1])], xs[xs >= cuts[1]]]
    return [float(g.mean()) for g in groups]

meta = json.load(open(os.path.join(FR, 'jobs.json')))
jobs, spots = [], {}
for set_, order in SETS.items():
    cx = np.array(centres(set_))
    spots[set_] = cx.tolist()
    cols = np.arange(bg.shape[1])
    owner = np.argmin(np.abs(cols[:, None] - cx[None, :]), 1)  # which spot each column of the screen belongs to
    for n in meta['jobs']:
        m = re.match(r'^(.*)-' + set_ + '$', n)
        if not m:
            continue
        a = rgb(n)
        sp = os.path.join(FR, n + '.slots.png')
        sl = np.asarray(Image.open(sp).convert('L')) if os.path.exists(sp) else None
        for j, spot in enumerate(order):
            keep = owner[None, :].repeat(bg.shape[0], 0) == j
            out = np.where(keep[..., None], a, bg).astype(np.uint8)
            name = f'{m.group(1)}-{spot}'
            Image.fromarray(out, 'RGB').save(os.path.join(FR, name + '.png'))
            if sl is not None:
                Image.fromarray((sl * keep).astype(np.uint8), 'L').save(os.path.join(FR, name + '.slots.png'))
            jobs.append(name)
        os.remove(os.path.join(FR, n + '.png'))
        if sl is not None:
            os.remove(sp)
# the slots: one file per outfit, one for all heads
for f in os.listdir(FR):
    m = re.match(r'^slots-(b-\w+|h)-.*-?[ab]\.json$', f)
    if m:
        dst = os.path.join(FR, 'slots-' + (m.group(1) if m.group(1).startswith('b-') else 'h') + '.json')
        os.replace(os.path.join(FR, f), dst)
meta['jobs'] = [n for n in meta['jobs'] if not re.search(r'-[ab]$', n)] + jobs
meta['spots'] = spots
json.dump(meta, open(os.path.join(FR, 'jobs.json'), 'w'))
print('split', len(jobs), 'frames; spot columns', spots)
