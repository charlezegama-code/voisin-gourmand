#!/usr/bin/env python3
"""Génère les icônes PWA pour la démo Voisin Gourmand.
Les portraits de cuisiniers et photos de plats sont désormais de vraies images
(randomuser.me + Unsplash, voir scripts/gen_seed.mjs et scripts/dish_photos.json) —
ce script ne gère plus que les icônes d'app/favicon, qui restent des pictogrammes."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

TERRACOTTA = (196, 90, 51)
TERRACOTTA_DARK = (156, 66, 34)
CREAM = (253, 246, 237)

def draw_plate_fork(draw, cx, cy, r, color):
    """Icone simple : assiette stylisee (symbole "fait maison")."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    inner_r = r * 0.72
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=CREAM, width=max(2, int(r * 0.045)))
    leaf_w = r * 0.5
    leaf_h = r * 0.32
    draw.ellipse([cx - leaf_w / 2, cy - leaf_h / 2, cx + leaf_w / 2, cy + leaf_h / 2], fill=CREAM)

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = int(size * (0.14 if maskable else 0.06))
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), fill=TERRACOTTA)
    cx, cy = size / 2, size / 2
    r = (size - 2 * pad) * 0.32
    draw_plate_fork(draw, cx, cy, r, TERRACOTTA_DARK)
    try:
        font = ImageFont.truetype(FONT_BLACK, int(size * 0.22))
    except Exception:
        font = ImageFont.load_default()
    text = "VG"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1] + size * 0.02), text, font=font, fill=CREAM)
    return img

for size in [64, 192, 512]:
    make_icon(size).save(os.path.join(ICONS_DIR, f"icon-{size}.png"))
make_icon(512, maskable=True).save(os.path.join(ICONS_DIR, "icon-512-maskable.png"))
make_icon(192, maskable=True).save(os.path.join(ICONS_DIR, "icon-192-maskable.png"))
make_icon(64).save(os.path.join(PUBLIC, "favicon.png"))

print("Generated PWA icons")
