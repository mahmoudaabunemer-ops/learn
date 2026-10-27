"""Cut the نادي المهارات emblem out of the supplied logo (white background → alpha).

    python3 scripts/extract_logo.py path/to/logo.jpg   # writes public/brand/logo-emblem.png
"""

import os
import sys

import numpy as np
from PIL import Image

src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), "..", "public", "brand", "logo-emblem.png")
os.makedirs(os.path.dirname(out), exist_ok=True)

im = Image.open(src).convert("RGB")
w, h = im.size
# emblem only (the wordmark is re-typeset in Cairo so it stays crisp on dark navy)
emblem = im.crop((int(w * 0.26), int(h * 0.09), int(w * 0.74), int(h * 0.6)))
a = np.asarray(emblem).astype(np.float32)
# distance from white -> alpha, with a soft ramp to keep anti-aliased edges
dist = 255 - a.min(axis=2)
alpha = np.clip((dist - 12) / 50, 0, 1)
rgb = np.where(alpha[..., None] > 0, a, 0)
# un-premultiply the white fringe
rgb = np.clip((rgb - 255 * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0, 255)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")
img = img.crop(img.getbbox())
img.save(out)
print("wrote", out, img.size)
