#!/usr/bin/env python3
"""Génère toutes les tailles d'icônes PWA/favicon à partir du logo officiel.

Deux sources, toutes deux dérivées du fichier fourni par la marque puis nettoyées d'un artefact
de "ringing" (dépassement de luminosité sur les canaux R/G à la frontière crème/orange, visible
comme un liseré blanc autour des traits fins, surtout aux petites tailles) — voir DECISIONS.md :

- public/logo.png : RGBA, coins arrondis + vraie transparence. C'est l'asset de marque canonique,
  utilisé tel quel dans le header et pour les icônes non-maskable (favicons, icon-64/192/512).
- scripts/logo_maskable_source.png : RGB, plein cadre (sans coins arrondis, sans transparence).
  Sert UNIQUEMENT à générer les variantes "maskable" : un icône maskable doit remplir tout le
  carré car c'est l'OS qui applique son propre masque (cercle, squircle...) — des coins déjà
  arrondis/transparents y créeraient des artefacts (coins vides visibles selon la forme du masque).

Ce script ne fait QUE du redimensionnement à la baisse (LANCZOS) — jamais d'upscale, donc net à
toutes les tailles.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

logo = Image.open(os.path.join(PUBLIC, "logo.png"))  # RGBA, coins arrondis
logo_maskable = Image.open(os.path.join(ROOT, "scripts", "logo_maskable_source.png")).convert("RGB")
assert logo.size[0] >= 512, f"Logo source trop petit ({logo.size}) pour dériver du 512x512 net"

def resized(img, size):
    return img.resize((size, size), Image.LANCZOS)

# Icônes PWA standard (non-maskable) — gardent la transparence et les coins arrondis du logo.
for size in [64, 192, 512]:
    resized(logo, size).save(os.path.join(ICONS_DIR, f"icon-{size}.png"))

# Icônes "maskable" — plein cadre, opaque, sans coins pré-arrondis (voir docstring).
resized(logo_maskable, 512).save(os.path.join(ICONS_DIR, "icon-512-maskable.png"))
resized(logo_maskable, 192).save(os.path.join(ICONS_DIR, "icon-192-maskable.png"))

# Favicons (transparence : le fond de l'onglet navigateur, très proche du crème de l'app, prend le relais)
resized(logo, 32).save(os.path.join(PUBLIC, "favicon-32x32.png"))
resized(logo, 16).save(os.path.join(PUBLIC, "favicon-16x16.png"))
resized(logo, 32).save(os.path.join(PUBLIC, "favicon.png"))  # référencé tel quel dans index.html

print("Generated PWA icons + favicons from public/logo.png (+ scripts/logo_maskable_source.png)")
