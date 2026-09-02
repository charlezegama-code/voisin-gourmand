# Audit final — Voisin Gourmand

Rédigé en mode autonome à la fin du développement, sans validation intermédiaire de l'utilisateur, comme demandé. Réponses honnêtes, y compris sur les raccourcis pris.

## 1. Qu'est-ce qui fonctionne réellement et a été testé ?

Tout ce qui suit a été **exécuté et vérifié dans cette session**, pas seulement écrit :

- **`npm run build`** : passe sans erreur (TypeScript strict + Vite). Vérifié deux fois, y compris juste avant ce fichier.
- **`npm run typecheck:worker`** : passe sans erreur sur le code du Worker (`tsc -p tsconfig.worker.json`).
- **`npx oxlint`** : aucune erreur.
- **Backend local** (`wrangler dev` + D1 local) : tous les endpoints testés via `curl` — `GET /api/cooks` (avec et sans filtres), `GET /api/cooks/:id`, `GET /api/dishes/:id`, `GET /api/orders`, `POST /api/orders` (succès **et** cas d'erreur : 404 cuisinier inconnu, 400 payload invalide).
- **Frontend en navigateur réel** (Chrome headless piloté, viewport mobile 390×844) : parcours complet testé et capturé en captures d'écran — carte avec 20 pins, bascule carte/liste, filtre par cuisine (vérifié via les requêtes réseau : `?cuisine=Asiatique` bien envoyé), fiche cuisinier, fiche plat, commande simulée, écran de confirmation, écran "Mes commandes" (avec la commande fraîchement passée qui y apparaît réellement).
- **Déploiement Cloudflare réel** : `wrangler d1 create` a créé une vraie base D1 (`voisin-gourmand-db`, région WEUR), le schéma et le seed ont été appliqués en local **et** en production (`--remote`), et `wrangler deploy` a réellement publié le Worker.
- **Site en production vérifié** : https://voisin-gourmand.synagogue.workers.dev — `curl` confirme un 200 sur la page d'accueil, sur `/api/cooks` (20 cuisiniers retournés), sur `/manifest.webmanifest` et `/sw.js`. Vérifié aussi visuellement (capture d'écran de la carte en prod, tuiles OSM chargées).
- **Manifest PWA** : contenu inspecté (`dist/manifest.webmanifest`) — nom, icônes 192/512 + variantes `maskable`, `display: standalone`, couleurs de thème. Conforme aux critères d'installabilité standards.

Un bug d'interaction est apparu pendant les tests (un clic simulé par l'outil de navigation headless ne déclenchait pas toujours le filtre "cuisine" sur un conteneur à scroll horizontal) — **vérifié comme un artefact de l'outil de test**, pas de l'application : un clic DOM direct confirme que le filtre fonctionne et déclenche bien le bon appel réseau.

## 2. Qu'est-ce qui est simulé/factice, et pourquoi ?

- **Le paiement** : le bouton "Commander" n'appelle aucun prestataire de paiement (pas de Stripe, pas de vraie carte bancaire). Il écrit une vraie ligne dans la table `orders` de D1 et décrémente le stock du plat, mais l'écran de confirmation affiche explicitement *"démo — paiement simulé, aucune transaction réelle"*. Choix assumé : intégrer un vrai PSP serait hors-sujet pour un pitch business school et introduirait une complexité (KYC, conformité) sans rapport avec l'objectif de la démo.
- **Les cuisiniers, plats, avis** : 100% fictifs, générés par script (`scripts/gen_seed.mjs`). Aucune vraie personne, aucune vraie photo — les avatars sont des initiales sur fond coloré générées localement.
- **Le statut "Récupérée"** sur les commandes d'historique pré-remplies : ce sont des données de démonstration statiques, il n'y a pas de vrai cycle de vie de commande (pas de notification, pas de scan QR au retrait, etc.).
- **La géolocalisation** : utilisée si l'utilisateur l'autorise (calcul de distance réel), sinon repli silencieux sur le centre de Paris — comportement volontaire pour ne jamais bloquer la démo sur un refus de permission.

## 3. Décisions techniques prises seul

Voir [DECISIONS.md](./DECISIONS.md) pour le détail complet (10 décisions documentées : choix de Hono, assets Cloudflare natifs, Tailwind v4 CSS-first, avatars générés, icônes PWA générées, tri/distance côté client, structure de nav à 2 onglets, génération de données déterministe, etc.), plus une section d'auto-critique sur les endroits où une approche plus simple aurait suffi.

## 4. Limites actuelles de la démo (ce qu'il faudrait pour un vrai produit)

- **Pas d'authentification** : "Mes commandes" montre un historique global partagé par tous les visiteurs du site (pas de compte utilisateur). Pour un vrai produit : auth (Cloudflare Access, ou email/OTP), commandes scopées par utilisateur.
- **Pas de vrai paiement** (voir point 2) : intégration Stripe Connect nécessaire pour reverser l'argent aux cuisiniers.
- **Pas de gestion cuisinier** : les cuisiniers ne peuvent pas se connecter pour gérer leurs plats/stocks/disponibilités — tout est en lecture seule côté seed. Un vrai produit aurait besoin d'un espace cuisinier (CRUD plats, upload photo, gestion créneaux).
- **Pas de vraies photos de plats** : emojis utilisés comme placeholders visuels. Un vrai produit nécessiterait un vrai upload de photos (R2 + redimensionnement).
- **Pas de notifications** (email/push) pour confirmer une commande ou rappeler le créneau de retrait.
- **Recherche par distance approximative** : centre d'arrondissement + jitter déterministe, pas de vraies adresses géocodées. Suffisant pour une démo visuelle, pas pour une vraie logistique de retrait.
- **Pas de tests automatisés** (unitaires/e2e) : seule une vérification manuelle (build + navigateur piloté) a été faite dans cette session. Un vrai produit nécessiterait une suite de tests (Vitest + Playwright) intégrée en CI.
- **Sécurité basique** : pas de rate-limiting sur `POST /api/orders` (un script pourrait épuiser artificiellement les stocks). Acceptable pour une démo publique à faible trafic, pas pour la production.

## 5. Le build passe-t-il ? Le déploiement a-t-il abouti ?

**Oui aux deux, vérifié dans cette session, aucune commande manuelle restante à lancer.**

- `npm run build` : ✅ sans erreur.
- `npm run typecheck:worker` : ✅ sans erreur.
- Déploiement Cloudflare : ✅ réellement effectué (`wrangler d1 create` + seed remote + `wrangler deploy`), site accessible et fonctionnel à **https://voisin-gourmand.synagogue.workers.dev**.
- Repo GitHub : créé et poussé via `gh repo create` (voir commande finale dans le message de conclusion de la session).

Il n'y a **aucune commande bloquante restante** — la démo est entièrement livrée et en ligne.

## 6. Note de confiance pour un passage à l'oral face à un jury : **8/10**

**Points forts** :
- L'app tourne réellement en production, sur une vraie infrastructure (pas un mockup Figma) — un jury peut ouvrir le lien sur son téléphone pendant la présentation, l'installer en PWA, et cliquer dans un vrai flux de bout en bout (carte → cuisinier → plat → commande → confirmation → historique).
- Le design est cohérent et différencié (palette terracotta/sauge, pas de template Bootstrap générique), mobile-first, avec des données de démo crédibles et diversifiées (5 types de cuisine, 8 quartiers parisiens).
- Les états de chargement/erreur sont gérés partout, donc pas de risque de crash visible pendant une démo live même en cas de réseau instable.
- La mention "démo — paiement simulé" est visible à deux endroits (fiche plat, confirmation), donc pas de risque de donner une fausse impression de transaction réelle face au jury.

**Pourquoi pas 9-10** :
- Le nom de domaine `*.workers.dev` (sous-domaine Cloudflare par défaut, avec un identifiant de compte peu flatteur type "synagogue") fait moins "produit fini" qu'un domaine personnalisé — facilement corrigible en achetant un nom de domaine et en le branchant sur le Worker (non fait ici, hors scope d'une démo gratuite).
- L'historique "Mes commandes" n'est pas scopé par utilisateur (limite 4, déjà documentée) : si deux membres du jury commandent en même temps sur leurs téléphones, ils verront les commandes l'un de l'autre. Mineur pour une démo mais à signaler si la question est posée.
- Aucun test automatisé — la robustesse repose sur la vérification manuelle faite dans cette session, pas sur une CI. Suffisant pour un pitch, pas pour rassurer un jury très technique sur la maintenabilité long terme.
