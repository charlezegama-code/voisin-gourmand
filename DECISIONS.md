# Décisions techniques — journal de bord

Ce fichier documente les choix pris seul pendant le développement (mode autonome, aucune validation intermédiaire demandée), avec la justification. Ordre chronologique approximatif.

## 1. Routing backend : Hono plutôt qu'un routeur fait main

**Décision** : utiliser [Hono](https://hono.dev) (~15 kB) dans le Worker plutôt qu'un `switch` sur `request.method`/`pathname`.
**Pourquoi** : code de routes nettement plus lisible (`app.get("/api/cooks/:id", ...)`), gestion d'erreurs centralisée (`app.onError`), et c'est le standard de facto pour les Workers en 2026. Le coût en bundle size est négligeable pour une démo.

## 2. Assets statiques via le binding `[assets]` de Wrangler, pas Cloudflare Pages ni Workers Sites

**Décision** : un seul Worker sert à la fois l'API (`/api/*`) et le frontend buildé (fallback SPA via `env.ASSETS.fetch`), configuré dans `wrangler.toml` via `[assets] not_found_handling = "single-page-application"`.
**Pourquoi** : un seul déploiement (`wrangler deploy`), un seul domaine, pas de CORS à gérer entre front et API, pas de double authentification/config Cloudflare Pages + Workers. C'est l'approche recommandée par Cloudflare depuis que les Workers ont un binding Assets natif (remplace l'ancien "Workers Sites").

## 3. Tailwind CSS v4 via le plugin Vite (`@tailwindcss/vite`), sans `tailwind.config.js`

**Décision** : configuration du thème (couleurs terracotta/sauge, police) directement en CSS via `@theme` dans `src/index.css`, pas de fichier de config JS séparé.
**Pourquoi** : c'est l'approche "CSS-first" native de Tailwind v4, plus rapide à builder (pas de PostCSS séparé) et évite un fichier de config supplémentaire pour une démo qui n'a pas besoin de plugins Tailwind avancés.

## 4. Pas de vraies photos de personnes — avatars générés localement (initiales + couleur)

**Décision** : génération de 20 avatars via Pillow (Python), simple cercle/carré coloré avec initiales, plutôt que des photos stock ou générées par IA.
**Pourquoi** : la consigne interdisait explicitement les vraies photos de personnes réelles. Des photos générées par IA (type "visage réaliste") auraient posé la même ambiguïté éthique pour une démo publique. Des initiales sur fond coloré sont un pattern UI reconnu (Slack, Linear, etc.), gratuit, reproductible sans dépendance réseau, et suffisant pour un pitch.

## 5. Icônes PWA générées par script (Pillow), pas de design externe

**Décision** : icônes 192/512 (+ variantes maskable) générées par `scripts/gen_assets.py`, simple pictogramme "assiette + VG".
**Pourquoi** : pragmatique pour une démo — évite une dépendance à un outil de design externe, garantit des icônes valides aux bonnes tailles (192/512, y compris `purpose: maskable` requis par certains critères d'installabilité Android/Chrome).

## 6. Distance calculée côté client (Haversine), pas de géocodage serveur

**Décision** : le filtre "distance" trie une liste déjà chargée via `distanceKm()` (formule de Haversine) entre la position de l'utilisateur (géolocalisation navigateur, avec repli sur le centre de Paris si refusée/indisponible) et chaque cuisinier.
**Pourquoi** : avec seulement 20 cuisiniers, trier côté client est instantané et évite d'exposer un endpoint serveur supplémentaire ou d'ajouter PostGIS-like logic à D1 (SQLite n'a pas de fonctions géospatiales natives). Sur-ingénierie évitée pour une démo à ce volume de données — voir aussi la section "auto-critique" ci-dessous.

## 7. Filtre "cuisine" et "prix" côté serveur, tri côté client

**Décision** : `cuisine`, `q` (recherche texte) et `maxPrice` sont des query params SQL (`WHERE`), mais le tri (note/distance/prix) est fait en JS après réception.
**Pourquoi** : cohérence avec le point 6 — trier 20 lignes en mémoire est plus simple et plus rapide à développer qu'un `ORDER BY` dynamique paramétré, sans bénéfice réel à ce volume.

## 8. Commande "simulée" mais réellement écrite en D1

**Décision** : le bouton "Commander" appelle un vrai `POST /api/orders` qui insère une ligne dans la table `orders` et décrémente `quantity_available`, mais aucun paiement n'est déclenché — l'écran de confirmation affiche explicitement "démo — paiement simulé".
**Pourquoi** : rend la démo crédible à l'oral (la commande apparaît vraiment dans "Mes commandes" juste après), sans jamais prétendre gérer un vrai paiement. C'est un compromis assumé : réalisme du flux de données, zéro intégration de paiement (Stripe etc.) qui serait hors-sujet pour un pitch.

## 9. Deux onglets de navigation seulement (pas trois)

**Décision** : la barre de navigation basse propose "Explorer" (carte + liste + filtres) et "Commandes", pas un troisième onglet "Recherche" séparé.
**Pourquoi** : les filtres et la recherche texte sont déjà visibles en permanence en haut de l'écran "Explorer" (pattern Deliveroo/Uber Eats). Un onglet "Recherche" dédié aurait dupliqué cet écran sans apporter de valeur — évité pour ne pas sur-ingénierer la nav pour une démo.

## 10. Génération de données déterministe (pas de `Math.random()`)

**Décision** : `scripts/gen_seed.mjs` utilise une fonction de jitter basée sur `Math.sin(seed)` plutôt que `Math.random()` pour disperser les cuisiniers autour du centre de chaque arrondissement.
**Pourquoi** : reproductibilité — relancer le script produit toujours le même jeu de données, ce qui simplifie le debug et les diffs git si le seed est régénéré.

## Auto-critique — où une approche plus simple aurait suffi

- **Le tri par distance/prix côté client (point 6-7)** est déjà la version "simple" — pas de regret ici.
- **Hono** (point 1) est probablement plus que nécessaire pour 5 routes ; un simple `if/else` sur `new URL(request.url).pathname` aurait aussi fonctionné et évité une dépendance. Gardé pour la lisibilité et parce que le coût réel (bundle, temps de dev) est minime.
- **`useAsync` générique** (`src/hooks/useAsync.ts`) est une petite abstraction sur 4 hooks quasi identiques (cooks, cook detail, dish, orders) — factorisation jugée raisonnable ici (évite 4x le même boilerplate loading/error) plutôt que sur-ingénierie.
- **Pas de state management global (Redux/Zustand)** : chaque page fetch ses propres données via `useAsync`, aucun état partagé complexe n'était nécessaire pour 5 écrans. Bon choix pour ce volume — l'ajouter aurait été de la sur-ingénierie pure.
