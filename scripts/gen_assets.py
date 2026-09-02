#!/usr/bin/env python3
"""Génère les icônes PWA et les avatars placeholder pour la démo Voisin Gourmand.
Aucune photo réelle : avatars = initiales sur fond coloré (palette terracotta/vert)."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC, "icons")
AVATARS_DIR = os.path.join(PUBLIC, "avatars")
os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

TERRACOTTA = (196, 90, 51)
TERRACOTTA_DARK = (156, 66, 34)
GREEN = (74, 124, 89)
CREAM = (253, 246, 237)

PALETTE = [
    (196, 90, 51),   # terracotta
    (74, 124, 89),   # vert sauge
    (216, 143, 63),  # ocre
    (91, 138, 122),  # vert emeraude doux
    (176, 74, 74),   # brique
    (139, 111, 78),  # brun chaud
    (61, 116, 112),  # sarcelle
    (200, 120, 90),  # corail terracotta
]

def draw_plate_fork(draw, cx, cy, r, color):
    """Icone simple : assiette + fourchette/couteau stylisee."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    inner_r = r * 0.72
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=CREAM, width=max(2, int(r * 0.045)))
    # petite feuille au centre (symbole "fait maison")
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
    # lettres VG
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

# favicon simple
make_icon(64).save(os.path.join(PUBLIC, "favicon.png"))

# --- Avatars des cuisiniers (initiales sur fond colore) ---
# Doit rester synchronise avec la liste COOKS de scripts/gen_seed.mjs (meme ordre => meme cook-N.png)
COOKS = [
    "Amina Kader", "Julien Marchand", "Thanh Nguyen", "Fatou Diallo", "Marco Ferrari",
    "Chloe Petit", "Youssef Bensaid", "Mai Tran", "Ibrahima Sow", "Sofia Romano",
    "Nadia Haddad", "Pierre Lefevre", "Linh Pham", "Kwame Osei", "Elena Conti",
    "Karim Belkacem", "Camille Rousseau", "Hana Kimura", "Moussa Traore", "Giulia Bianchi",
    "Rami Nassar", "Lea Salame", "Priya Sharma", "Arjun Mehta", "Camila Rodrigues",
    "Diego Fernandez", "Manon Girard", "Theo Dubois", "Yuki Sato", "Siriporn Boonmee",
    "Wei Chen", "Aicha Ndiaye", "Samuel Kouassi", "Antoine Bernard", "Isabelle Lambert",
    "Farid Amrani", "Yasmine Cherif", "Luca Moretti", "Chiara Esposito", "Omar Haddad",
    "Ravi Iyer", "Valentina Torres", "Noemie Faure", "Baptiste Roy", "Salma Bakr",
]

def make_avatar(name, color, size=256):
    img = Image.new("RGB", (size, size), color)
    draw = ImageDraw.Draw(img)
    # leger degrade radial simule par cercle plus clair au centre
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    lighter = tuple(min(255, c + 25) for c in color)
    od.ellipse([-size * 0.2, -size * 0.2, size * 1.2, size * 1.2], fill=lighter + (60,))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    draw = ImageDraw.Draw(img)
    initials = "".join([p[0].upper() for p in name.split(" ")[:2]])
    try:
        font = ImageFont.truetype(FONT_BOLD, int(size * 0.38))
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), initials, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((size / 2 - tw / 2 - bbox[0], size / 2 - th / 2 - bbox[1]), initials, font=font, fill=CREAM)
    return img

for i, name in enumerate(COOKS):
    slug = str(i + 1)
    color = PALETTE[i % len(PALETTE)]
    make_avatar(name, color).save(os.path.join(AVATARS_DIR, f"cook-{slug}.png"))

print(f"Generated {len(COOKS)} avatars + icons")
