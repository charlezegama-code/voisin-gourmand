# 🍲 Voisin Gourmand

App de démo (pitch business school) mettant en relation des cuisiniers amateurs et des voisins cherchant un repas fait maison, à Paris. **Ceci est une démo** : profils de cuisiniers fictifs, aucun vrai paiement.

**Démo en ligne :** https://voisin-gourmand.synagogue.workers.dev

## Stack

- **Frontend** : React 19 + Vite + TypeScript (strict) + Tailwind CSS v4
- **Design** : police auto-hébergée Plus Jakarta Sans (`@fontsource-variable`), icônes [Lucide](https://lucide.dev) (zéro emoji dans l'UI), animations [Framer Motion](https://www.framer.com/motion/)
- **Carte** : Leaflet + tuiles Esri "Light Gray Canvas" (gratuit, pas de clé API)
- **Backend** : Cloudflare Workers + [Hono](https://hono.dev) pour le routage
- **Base de données** : Cloudflare D1 (SQLite)
- **PWA** : manifest + service worker via `vite-plugin-pwa` (installable, cache offline des assets + API en `NetworkFirst`)

## Structure du projet

```
├── src/                # Frontend React
│   ├── components/      # UI réutilisable (carte, cartes cuisinier/plat, filtres...)
│   ├── pages/            # Écrans (accueil/carte, fiche cuisinier, plat, commandes...)
│   ├── hooks/            # useAsync (data fetching), useUserLocation (géoloc)
│   ├── lib/               # Client API, calcul de distance
│   └── types/             # Types partagés front
├── worker/              # Backend Cloudflare Worker (API + service des assets)
│   ├── index.ts          # Routes Hono (/api/cooks, /api/dishes, /api/orders...)
│   ├── mappers.ts        # snake_case (D1) -> camelCase (API)
│   └── types.ts           # Types des bindings et lignes D1
├── db/
│   ├── schema.sql        # Schéma des 4 tables (cooks, dishes, reviews, orders)
│   └── seed.sql           # 45 cuisiniers fictifs, ~78 plats, 90 avis, 5 commandes de démo
├── scripts/
│   ├── gen_seed.mjs       # Génère db/schema.sql + db/seed.sql
│   └── gen_assets.py      # Génère les icônes PWA + avatars (initiales, aucune vraie photo)
├── wrangler.toml         # Config Cloudflare Workers (D1 binding + assets statiques)
├── DECISIONS.md          # Décisions techniques prises de façon autonome
└── AUDIT.md              # Bilan honnête : ce qui marche, ce qui est simulé, limites
```

## Lancer en local

Prérequis : Node 18+, un compte Cloudflare (gratuit) avec `wrangler` authentifié (`npx wrangler login`).

```bash
npm install

# Seed la base D1 locale (SQLite émulé par Wrangler, aucun accès réseau requis)
npm run db:seed:local

# Terminal 1 — API + D1 (backend Worker)
npm run worker:dev      # http://127.0.0.1:8787

# Terminal 2 — Frontend avec hot-reload (proxy /api vers le worker ci-dessus)
npm run dev              # http://localhost:5173
```

Ouvrez `http://localhost:5173`. Le frontend appelle `/api/*`, que Vite redirige vers le Worker local sur le port 8787 (voir `server.proxy` dans `vite.config.ts`).

> Pour tester la version 100% intégrée (front buildé servi directement par le Worker, comme en prod) :
> `npm run build && npx wrangler dev` puis ouvrez l'URL affichée par Wrangler.

## Déployer sur Cloudflare

```bash
npx wrangler login                 # une seule fois
npx wrangler d1 create voisin-gourmand-db   # si la base n'existe pas encore
# -> copier le database_id retourné dans wrangler.toml

npm run db:seed:remote             # seed la base D1 de production
npm run deploy                     # build + wrangler deploy
```

La démo actuelle est déjà déployée à **https://voisin-gourmand.synagogue.workers.dev** (compte Cloudflare de l'auteur). Pour redéployer après modification du code, il suffit de relancer `npm run deploy`.

## Comptes / données de démo

Toutes les données (cuisiniers, plats, avis, commandes) sont **fictives**, générées par `scripts/gen_seed.mjs`. Aucune vraie personne, aucune vraie photo — les avatars sont des initiales sur fond coloré générées par `scripts/gen_assets.py` (Pillow).

Pour régénérer les données de démo (autre répartition, plus de cuisiniers, etc.) :

```bash
node scripts/gen_seed.mjs     # régénère db/schema.sql et db/seed.sql
npm run db:seed:local          # ou db:seed:remote
```

## Fonctionnalités

- **Carte** (Leaflet + tuiles Esri Light Gray, gratuites sans clé) centrée sur Paris avec 45 cuisiniers répartis sur les 20 arrondissements, pins circulaires avec avatar
- **Recherche & filtres** : par texte libre, 9 types de cuisine, prix max, tri par note/distance/prix (distance calculée via géolocalisation navigateur si autorisée, sinon centre de Paris par défaut)
- **Fiche cuisinier** : avatar, note, spécialité, plats du jour, avis, badges (nouveau/vérifié)
- **Fiche plat** : détail, sélecteur de quantité, bouton **Commander** → flux de commande simulé (mention claire "démo — paiement simulé"), confirmation animée
- **Mes commandes** : historique (commandes factices pré-remplies + commandes passées pendant la session, réellement enregistrées en D1)
- **Profil** : stats réelles (nombre de commandes via l'API), écran de démo
- **Navigation** : 4 onglets natifs (Accueil / Recherche / Commandes / Profil), transitions de page animées
- **PWA** : installable sur mobile/desktop, icônes 192/512 (+ maskable), cache offline des assets statiques

## Qualité / rigueur

- TypeScript strict des deux côtés (`tsconfig.app.json` pour le front, `tsconfig.worker.json` pour le Worker), aucun `any`
- Composants découpés par responsabilité (aucun fichier de plusieurs centaines de lignes)
- Gestion des états de chargement/erreur partout (`useAsync`, `LoadingState`, `ErrorState`) — l'app ne crashe pas si l'API D1 ne répond pas
- `npm run build` vérifié sans erreur avant chaque déploiement

Voir [DECISIONS.md](./DECISIONS.md) pour le détail des choix techniques et [AUDIT.md](./AUDIT.md) pour un bilan honnête de ce qui a été testé, simulé, et des limites de la démo.
