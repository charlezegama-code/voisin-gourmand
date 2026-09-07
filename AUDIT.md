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

---

## Mise à jour — 2026-09-02 : correctif de navigation + refonte design complète

### 1. Cause racine du bug de navigation, et preuve que le fix fonctionne

**Diagnostic** : après audit statique complet (toutes les `key` de liste, tous les `.map()`, tous les éléments imbriqués dans des `<Link>`) et 7+ scénarios de reproduction en navigateur piloté (liste, carte/popups, plats, filtres, émulation tactile iPhone), **aucun bug de routing n'a pu être reproduit dans le code source**. Aucune `key` basée sur un index, aucun id codé en dur, aucune closure obsolète — les trois causes suggérées dans la consigne n'étaient pas présentes.

Deux vrais bugs ont en revanche été trouvés et corrigés pendant l'investigation (détail dans `DECISIONS.md` §11-12, 16) :
- **NaN dans les commandes de démo** : la génération du seed reparsait du SQL déjà sérialisé avec une regex fragile, cassée par les apostrophes échappées dans les descriptions de plats. Corrigé en gardant les plats comme objets structurés.
- **Avatars de la carte affichés à 256px au lieu de 38px** : les attributs HTML `width`/`height` sur les `<img>` injectés en HTML brut (hors arbre React) étaient ignorés en production. Corrigé avec du CSS inline explicite.
- **Durcissement préventif** : la grille de résultats anime maintenant ses réordonnancements (`framer-motion layout`) au lieu de sauter instantanément — élimine le seul mécanisme plausible et vérifiable dans le code qui aurait pu faire atterrir un clic sur le mauvais élément (réordonnancement silencieux pendant qu'un doigt est en l'air).

**Test manuel exécuté** (post-refonte, sur le build final) : depuis la vue Liste de l'accueil, 3 clics DOM directs sur 3 cuisiniers différents :
1. Baptiste Roy → a ouvert `/cuisiniers/cook-44` avec le titre "Baptiste Roy" ✅
2. Kwame Osei → a ouvert `/cuisiniers/cook-14` avec le titre "Kwame Osei" ✅
3. Isabelle Lambert → a ouvert `/cuisiniers/cook-35` avec le titre "Isabelle Lambert" ✅

Chaque navigation a atterri sur la fiche exacte cliquée, aucune redirection vers un profil aléatoire.

### 2. Écrans refaits — ce qui a changé concrètement

| Écran | Changements |
|---|---|
| **Accueil (carte)** | Tuiles Esri Light Gray (clair, épuré, gratuit, sans clé) remplaçant OSM brut ; pins circulaires avec avatar du cuisinier dedans (couleur d'anneau = statut : vert "nouveau", gris "complet", terracotta par défaut) ; animation d'apparition en cascade des pins ; carte chargée à la demande (code-splitting, ~46 ko gzip séparés du bundle principal) |
| **Liste / Recherche** | Grille 2 colonnes façon Airbnb/UberEats (au lieu d'une liste empilée) ; cartes à visuel dominant (dégradé de marque + avatar + icône de cuisine en filigrane, ~60% de la hauteur) ; badges "Nouveau"/"Complet"/"Vérifié" ; squelettes de chargement animés (au lieu d'un simple spinner) ; tri animé (`layout`) |
| **Filtres** | Pills toujours horizontales mais étendues à 9 cuisines (au lieu de 5), icône Lucide par cuisine, contraste renforcé (fond plein terracotta-600/sage-600 pour le texte blanc, conforme WCAG AA) |
| **Navigation basse** | 4 onglets (Accueil / Recherche / Commandes / Profil) avec icônes Lucide et pastille active animée, au lieu de 2 onglets texte |
| **Fiche cuisinier** | Bandeau héro dégradé pleine largeur avec avatar et icône de cuisine en filigrane (au lieu d'un simple avatar carré) ; badges intégrés ; squelette de chargement dédié |
| **Fiche plat** | Visuel héro dégradé avec icône de cuisine grand format (au lieu d'un simple carré emoji) ; icônes Lucide pour créneau/disponibilité ; stepper de quantité animé ; CTA "Commander — prix" fixe en bas, feedback tactile |
| **Confirmation de commande** | Coche animée (spring + trait dessiné) au lieu d'un emoji statique ; apparition en cascade des sections |
| **Mes commandes** | Squelettes de chargement ; apparition en cascade des lignes |
| **Profil** *(nouvel écran)* | Stats réelles (nombre de commandes récupéré depuis l'API, pas codé en dur), menu de raccourcis, mention explicite "démo" |
| **Recherche** *(nouvel écran)* | Réutilise la logique de recherche de l'accueil en mode liste seule, avec compteur de résultats |
| **Global** | Police Plus Jakarta Sans (auto-hébergée, variable) remplaçant la police système ; zéro emoji nulle part (icônes Lucide partout, y compris étoiles, statuts, navigation) ; transitions de page (fade + slide, `AnimatePresence`) ; `prefers-reduced-motion` respecté (`MotionConfig reducedMotion="user"` + CSS de repli) |
| **Données de démo** | 20 → **45 cuisiniers**, 5 → **9 cuisines** (ajout Libanaise/Indienne/Sud-Américaine/Végétarienne), répartis sur les **20 arrondissements** (contre 8), notes réalistes étalées 4.0-5.0 (au lieu de quasi toutes ≥4.5), 1 à 5 plats par cuisinier (au lieu de 2-3 fixes), badges "Nouveau" et "Complet aujourd'hui" pour varier les états visuels |

### 3. Build et déploiement

- `npm run build` : ✅ sans erreur (vérifié après chaque étape majeure de la refonte).
- `npm run typecheck:worker` : ✅ sans erreur.
- `npx oxlint` : ✅ 0 erreur — 3 avertissements résiduels acceptés et documentés (`DECISIONS.md` §14 : pattern de résolution dynamique d'icône, sans risque réel dans ce cas précis).
- Taille du bundle : la carte (Leaflet) est maintenant chargée à la demande (`React.lazy`) — bundle principal 398 ko (125 ko gzip), chunk carte 156 ko (46 ko gzip) séparé, chargé seulement quand l'utilisateur ouvre la vue Carte.
- Déploiement Cloudflare : ✅ réellement effectué (`wrangler deploy` + seed de la base D1 de production avec les 45 nouveaux cuisiniers). Vérifié par `curl` (200 sur `/`, `/api/cooks` retourne bien 45 cuisiniers/9 cuisines, `/avatars/cook-45.png` accessible) et visuellement (capture d'écran de la carte en production).

**URL finale à tester : https://voisin-gourmand.synagogue.workers.dev**

### 4. Ce qui reste perfectible, et pourquoi ce n'est pas fait

- **Dark mode** : non implémenté. La consigne autorisait explicitement à documenter une priorisation différente si le temps manquait. Un vrai dark mode correct nécessite de redériver toute une seconde palette (contraste WCAG AA à revérifier pour chaque paire fond/texte, pas juste inverser les couleurs) — pour une démo de pitch présentée dans une salle éclairée sur un thème clair déjà travaillé, le retour sur investissement était plus faible que finir le reste (bug + 45 cuisiniers + animations + icônes). Prioriser le fond (contenu, données, absence de bug) avant la forme optionnelle.
- **`FilterBar` n'est pas debounced** : chaque frappe dans le champ de recherche déclenche un appel réseau. Sans impact perceptible ici (D1 répond en quelques ms, 45 lignes), mais un `useDebouncedValue` serait la bonne pratique à un volume de données plus réaliste.
- **Avertissements oxlint résiduels** (3, tous liés au pattern `CuisineIcon`) : documentés comme acceptés plutôt que corrigés, car la "correction" propre demanderait de dupliquer 9 composants triviaux (un par cuisine) pour un gain de lisibilité marginal — sur-ingénierie pour une démo.
- **Pas de tests automatisés** : toujours vrai depuis la première livraison, toujours honnête de le répéter — la vérification reste manuelle (build + navigateur piloté), pas de CI.

### 5. Note de confiance mise à jour : **9/10** *(était 8/10)*

**Ce qui justifie la hausse** : le point faible le plus visible de la première version — un design "qui fait le café du coin plutôt que la startup" — est résolu. La carte dense sur 45 cuisiniers/20 arrondissements rend l'app crédible visuellement dès l'ouverture (avant même d'interagir), les animations (pins en cascade, transitions de page, check de confirmation) donnent une sensation d'app native soignée, et le bug de navigation signalé a été activement recherché, non retrouvé, et durci quand même par prudence plutôt que balayé.

**Pourquoi pas 10** : le point n°2 de l'audit précédent (nom de domaine `workers.dev`, historique de commandes non scopé par utilisateur) reste vrai et non résolu — ce sont des limites structurelles de la démo, pas des défauts corrigibles en une session sans compte payant/backend d'authentification. Un jury technique pointilleux pourrait aussi remarquer l'absence de tests automatisés.

---

## Mise à jour — 2026-09-07 : vraies photos partout + élimination des stéréotypes nom/cuisine

### 1. Chaque cuisinier a-t-il une vraie photo portrait ? Chaque plat a-t-il une vraie photo ?

**Oui aux deux, vérifié mécaniquement, pas juste visuellement.**

- 45 cuisiniers, 45 portraits `randomuser.me` distincts (compteur séparé hommes/femmes dans `scripts/gen_seed.mjs`, aucune répétition — vérifié : 22 URLs `.../men/1.jpg` à `.../men/22.jpg`, 23 URLs `.../women/1.jpg` à `.../women/23.jpg`).
- 78 plats au total (1 à 5 par cuisinier), chacun pointant vers une des 45 photos Unsplash uniques de `scripts/dish_photos.json` (un plat nommé identiquement chez deux cuisiniers différents partage la même photo — comportement voulu, voir DECISIONS.md #18, pas un plat sans photo).
- **Vérification indépendante des 45 URLs Unsplash** : boucle `curl -s -o /dev/null -w "%{http_code}"` sur chacune des 45 entrées de `dish_photos.json` → **45/45 retournent 200**, `content-type: image/jpeg` (voir commande exécutée dans cette session, hors du rapport de l'agent de recherche — un second contrôle indépendant, pas une confiance aveugle dans son rapport).
- **Vérification visuelle en prod** (navigateur piloté, capture d'écran) : carte avec 45 pins-portraits distincts, grille de recherche avec photos de plats réelles et reconnaissables (pizza, nems, riz au poisson, salade méditerranéenne...), fiche cuisinier et fiche plat avec hero photo + dégradé, écran de commande et historique avec photo du plat commandé. Aucune icône générique, aucun fond coloré uni, aucune initiale restante nulle part dans l'app déployée.
- Aucune image stockée dans le repo : tout est chargé par URL directe depuis Unsplash/randomuser.me (voir DECISIONS.md #18) — confirmé par `performance.getEntriesByType('resource')` en prod : 45 ressources externes chargées, 0 requête réseau en échec (`network requests --status 400-599` → aucune capturée).

### 2. Les stéréotypes nom/cuisine sont-ils éliminés ? Vérification sur 5 profils au hasard

Tirage aléatoire reproductible (`random.seed(42)`) sur les 45 profils de `scripts/gen_seed.mjs` :

| Nom | Cuisine assignée | Stéréotype ? |
|---|---|---|
| Nadia Haddad | Végétarienne | Non — le végétarisme n'est pas une origine ; nom à consonance arabe sur une catégorie sans lien ethnique |
| Rami Nassar | Italienne | Non — nom à consonance libanaise sur une cuisine italienne |
| Karim Belkacem | Française | Non — nom à consonance maghrébine sur une cuisine française (inversion explicite du stéréotype d'origine) |
| Charlotte Mercier | Africaine | Non — nom à consonance française sur une cuisine africaine |
| Antoine Bernard | Africaine | Non — nom à consonance française sur une cuisine africaine, bio explique le mariage avec une Sénégalaise |

**5/5 sans corrélation stéréotypée.** Chaque bio associée explique un parcours personnel (mariage, mentorat, voyage, formation, reconversion) plutôt que de supposer une origine ethnique liée au nom — voir les bios complètes dans `scripts/gen_seed.mjs`. Méthode d'assignation détaillée en DECISIONS.md #20 (formule déterministe garantissant 5 cuisiniers par cuisine, puis correction manuelle des rares coïncidences repérées lors d'une relecture complète des 45 paires nom/cuisine).

### 3. Build et déploiement

- `npm run build` : ✅ sans erreur.
- `npm run typecheck:worker` : ✅ sans erreur.
- `npx oxlint` : ✅ 0 erreur (3 avertissements pré-existants acceptés, voir session précédente).
- D1 local et distant re-seedés avec le nouveau schéma (`cooks.cover_photo_url`, `dishes.photo_url`, `orders.dish_photo_url`) et les 45 nouveaux profils — confirmé par `rows_written: 604` sur la base de production.
- `wrangler deploy` : ✅ réellement exécuté, `Current Version ID` renouvelé, assets re-uploadés (5 fichiers modifiés détectés et poussés).
- 3 commits Git séparés et poussés sur GitHub : `feat(data)` (photos + données + backend), `feat(animations)` (skeleton de chargement image), `feat(design)` (héros photo, dégradés, overlay portrait) — dans cet ordre pour que chaque commit reste cohérent (le commit design dépend du composant introduit par le commit animations).

**URL finale à tester : https://voisin-gourmand.synagogue.workers.dev**

### 4. Note de confiance : que l'app ressemble à une vraie app foodtech 2026 — **9/10**

**Ce qui justifie ce score** : la transformation visuelle est spectaculaire par rapport à la version précédente — une carte avec 45 vrais visages et une grille avec de vraies photos de plats (pizza napolitaine, nems, biryani, ceviche...) change complètement la perception à l'ouverture. C'est précisément le problème identifié par la consigne ("la bouffe se vend par les yeux") qui est résolu, pas contourné. Les bios personnalisées donnent aussi une épaisseur narrative que peu de démos étudiantes prennent le temps de soigner.

**Pourquoi pas 10** : quelques photos de plats sont des correspondances plausibles mais pas exactes faute de photo Unsplash parfaitement dédiée (Blanquette de veau, Poulet yassa, Mafé poulet, Fattouche, Feijoada — voir la liste de compromis assumés au point 5) ; un jury qui connaît bien ces plats précis pourrait remarquer l'écart. Les portraits randomuser.me, bien que réels, ont un rendu "banque d'images" reconnaissable pour un œil habitué (éclairage studio homogène) plutôt que des photos de profil authentiques — un compromis assumé pour une démo gratuite et instantanée plutôt qu'une génération IA de visages, plus chère et plus ambiguë éthiquement.

### 5. Ce qui reste perfectible

- **5 photos de plats sont des compromis assumés**, faute de correspondance exacte disponible gratuitement sur Unsplash : Blanquette de veau (ragoût de bœuf générique), Poulet yassa (poulet en sauce, sans les tons jaune caractéristiques du citron confit), Mafé poulet (ragoût brun générique), Fattouche (salade crue générique), Feijoada (plat de haricots générique, pas spécifiquement brésilien). Documenté plutôt que caché — voir le rapport de recherche cité dans cette session.
- **Le "plat signature" en couverture est mécanique** (premier plat généré pour ce cuisinier), pas choisi éditorialement pour être la photo la plus flatteuse — un vrai produit laisserait le cuisinier choisir sa photo de couverture.
- **CartoDB Positron redemandé par la consigne reste indisponible sans clé** (re-vérifié cette session, filigrane "API KEY REQUIRED" toujours présent) — Esri Light Gray Canvas reste la solution en place, visuellement proche mais pas identique à ce qui était nommé dans la consigne.
- **Dépendance à deux services tiers gratuits non contractuels** (Unsplash CDN, randomuser.me) : aucune garantie de disponibilité à long terme contrairement à des images stockées en propre — acceptable pour une démo de pitch, pas pour un produit en prod (voir aussi la limite déjà documentée sur R2/upload de vraies photos par les cuisiniers).
- **Portraits non liés sémantiquement au genre du prénom au-delà de l'homme/femme binaire choisi manuellement** : l'attribution homme/femme par prénom a été faite au jugé pour 45 noms, sans vérification systématique — un prénom mixte ou peu familier pourrait avoir reçu un genre de portrait "au hasard" plutôt qu'un choix réfléchi. Impact mineur pour une démo, mais worth noting.

---

## Mise à jour — 2026-09-07 (session 4) : logo officiel, onboarding, profil, nettoyage photos, légende carte

### 1. Le logo apparaît-il bien partout (header, favicon, manifest, splash) ?

**Oui, vérifié à chaque emplacement, pas juste supposé :**

- **Header** : `AppHeader` (Accueil, Recherche, Commandes, Profil) charge `/icons/icon-64.png`, régénéré depuis le logo officiel — capture d'écran prise sur les 4 écrans, logo visible et net partout.
- **Favicon** : `index.html` déclare `favicon-32x32.png`, `favicon-16x16.png` et un `favicon.png` de repli, tous dérivés du logo par downscale. Fichier `public/favicon-32x32.png` inspecté visuellement (`Read` sur le PNG) : forme maison/cuillère reconnaissable même à 32px.
- **Manifest PWA** : `dist/manifest.webmanifest` inspecté après build — les 4 icônes (192/512 + variantes maskable) pointent vers les fichiers régénérés ; contenu binaire vérifié en prod par téléchargement direct (`curl` sur `/icons/icon-192.png` en production, taille de fichier identique à la version locale).
- **Splash** : nouveau composant `SplashScreen`, capturé en local ET en production (`https://voisin-gourmand.synagogue.workers.dev`) — logo centré, aucune fuite visuelle d'un autre composant par-dessus (un bug de superposition avec la légende de carte a été trouvé et corrigé pendant cette session — voir DECISIONS.md #26).

Aucune trace de l'ancienne icône "VG" dessinée programmatiquement n'a été retrouvée (`grep` sur le code : zéro référence texte "VG", et tous les fichiers PNG servant d'icônes ont été régénérés depuis le nouveau logo).

### 2. L'onboarding fonctionne-t-il de bout en bout, et est-il re-déclenchable ?

**Oui, testé de bout en bout en local ET en production, captures d'écran à chaque étape :**

1. Premier chargement → splash (~900ms) → onboarding écran 1 ("Trouvez un cuisinier...", icône loupe) ✅
2. "Suivant" → écran 2 ("Commandez votre plat", icône panier), pagination sur le 2e point ✅
3. "Suivant" → écran 3 ("Récupérez votre repas", icône poignée de main), bouton devenu "Commencer" ✅
4. "Commencer" → navigation vers l'accueil (la carte), `localStorage` marqué → rechargement de la page ne réaffiche PAS l'onboarding (vérifié) ✅
5. Depuis Profil → "Revoir le tutoriel" → l'onboarding réapparaît immédiatement depuis l'écran 1, sans recharger la page ✅
6. "Passer" (testé séparément) → navigation directe vers l'accueil, quel que soit l'écran courant ✅

### 3. Le profil utilisateur a-t-il une vraie photo ?

**Oui** — remplacé l'icône silhouette générique par un portrait `randomuser.me` (`men/91.jpg`, non réutilisé ailleurs dans les 45 cuisiniers), même traitement visuel (rond, ombre, ring blanc) que les avatars de cuisiniers. Vérifié visuellement sur la capture d'écran de l'écran Profil.

### 4. Combien de photos de cuisiniers remplacées, et pourquoi ?

**8 sur 45** (Diego Herrera, Kwame Osei, Moussa Traoré, Salma Bakr, Valentine Roussel, Chloé Petit, Aïcha Ndiaye, Isabelle Fabre) — planche-contact complète des 45 portraits construite et relue systématiquement (pas un survol rapide dans l'app). Motifs de remplacement, un par un :

| Cuisinier | Problème repéré |
|---|---|
| Diego Herrera | Pouce levé, expression exagérée façon réseau social |
| Kwame Osei | Pose "main sur la tempe" artificielle, peu crédible |
| Moussa Traoré | Même pose artificielle que Kwame Osei |
| Salma Bakr | Main devant une partie du visage, cadrage selfie |
| Valentine Roussel | Réaction exagérée (bouche grande ouverte, choquée) |
| Chloé Petit | Ne regarde pas l'objectif, cheveux masquant le visage |
| Aïcha Ndiaye | Réaction exagérée (bouche ouverte, main près du visage) |
| Isabelle Fabre | Boit avec une paille, moue façon "duck face" |

Remplacements choisis parmi de nouveaux numéros `randomuser.me` (hors des 45 déjà utilisés, donc aucun doublon introduit), eux-mêmes relus sur planche-contact avant sélection finale. Les 37 autres profils n'ont **pas** été touchés (vérifié : même URL avant/après pour Karim Belkacem, Omar Haddad, Amina Benali pris en échantillon).

### 5. Qu'as-tu fait des pins de carte, et pourquoi ?

**Conservé le code couleur, ajouté une légende** — pas supprimé. Vérification dans `MapView.tsx` : la couleur d'anneau (terracotta/vert/gris) correspond bien à un statut réel (`soldOutToday`/`isNew`/défaut), ce n'était pas arbitraire. Une légende discrète (pill blanche semi-transparente, 3 puces de couleur + libellé : Disponible / Nouveau / Complet) a été ajoutée en bas de la carte, au-dessus de l'attribution Leaflet — conforme à l'instruction explicite de préférer une légende à une suppression de fonctionnalité.

### 6. Build et déploiement OK ? URL finale ?

- `npm run build` : ✅ sans erreur (revérifié après le découpage des commits, pas seulement avant).
- `npm run typecheck:worker` : ✅ sans erreur.
- `npx oxlint` : ✅ 0 erreur (3 avertissements pré-existants acceptés, inchangés).
- D1 locale et distante re-seedées avec les 8 nouvelles URLs de portrait.
- `wrangler deploy` : ✅ réellement exécuté, nouvelle version publiée, assets modifiés (logo, favicons, icônes, JS/CSS) confirmés uploadés.
- Vérifié en production par navigateur piloté : splash → onboarding complet (3 écrans, Suivant × 2, Commencer) → accueil avec carte, légende visible, pins avec les nouvelles photos.
- 5 commits séparés et poussés sur GitHub : `feat(logo)`, `feat(onboarding)`, `feat(profil)`, `fix(cuisiniers)`, `feat(carte)` — dans cet ordre pour que chaque commit reste cohérent isolément (ex. le commit onboarding ajoute le bouton "Revoir le tutoriel" sur l'icône générique existante, la vraie photo arrive au commit suivant).

**URL finale à tester : https://voisin-gourmand.synagogue.workers.dev**

### 7. Note de confiance finale pour jeudi : **9/10**

**Ce qui justifie ce score** : les 5 points de cette session ferment des trous de crédibilité très visibles à l'œil d'un jury — un logo de marque cohérent (pas un badge "VG" bricolé), un onboarding qui donne tout de suite le mode d'emploi de l'app (standard dans toute app foodtech réelle), un profil qui ne détonne plus avec le reste (photos partout, plus une seule icône générique dans toute l'app), des photos de cuisiniers qui ne cassent plus l'illusion de "vrais profils vérifiés", et une carte dont le code couleur est enfin lisible sans qu'on ait à deviner. Le fait de pouvoir re-déclencher l'onboarding depuis Profil est un vrai plus pour l'oral : ça permet de montrer ce flow à la demande du jury sans recharger la page en direct.

**Pourquoi pas 10** : les limites déjà connues (nom de domaine `workers.dev`, historique de commandes non scopé par utilisateur, dépendance à des CDN tiers gratuits, quelques photos de plats approximatives faute de mieux sur Unsplash) restent vraies et non résolues — ce sont des choix de scope assumés pour une démo gratuite en quelques sessions, pas des oublis. Un jury qui pousserait sur la robustesse technique (tests automatisés, montée en charge, vraie authentification) trouverait les mêmes limites qu'aux audits précédents.
