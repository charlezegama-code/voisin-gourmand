#!/usr/bin/env python3
"""Génère toutes les tailles d'icônes PWA/favicon à partir du logo officiel (public/logo.png).

Le logo source est un carré 1024x1024 (maison stylisée + cuillère, terracotta sur fond crème),
fourni par la marque — voir DECISIONS.md. Ce script ne fait QUE du redimensionnement à la baisse
(LANCZOS) pour rester net à toutes les tailles ; jamais d'upscale.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

LOGO_PATH = os.path.join(PUBLIC, "logo.png")
logo = Image.open(LOGO_PATH).convert("RGB")
assert logo.size[0] >= 512, f"Logo source trop petit ({logo.size}) pour dériver du 512x512 net"

def resized(size):
    return logo.resize((size, size), Image.LANCZOS)

# Icônes PWA standard (le logo a déjà une marge intérieure confortable : ~16% H / ~24% V,
# largement dans la zone de sécurité "maskable" recommandée — pas besoin de re-padder).
for size in [64, 192, 512]:
    resized(size).save(os.path.join(ICONS_DIR, f"icon-{size}.png"))
resized(512).save(os.path.join(ICONS_DIR, "icon-512-maskable.png"))
resized(192).save(os.path.join(ICONS_DIR, "icon-192-maskable.png"))

# Favicons
resized(32).save(os.path.join(PUBLIC, "favicon-32x32.png"))
resized(16).save(os.path.join(PUBLIC, "favicon-16x16.png"))
resized(32).save(os.path.join(PUBLIC, "favicon.png"))  # référencé tel quel dans index.html

print("Generated PWA icons + favicons from public/logo.png")
