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

---

## 2026-09-02 — Session 2 : bug de navigation signalé + refonte design

### 11. Investigation du bug de navigation — conclusion : non reproduit dans le code

**Contexte** : l'utilisateur a signalé qu'en cliquant sur des cartes de plats/cuisiniers ou des filtres, l'app atterrissait parfois sur la fiche d'un cuisinier au hasard.

**Démarche d'investigation** (avant tout patch, comme demandé) :
1. Audit statique complet : `grep` de tous les `.map()` du code source (composants + pages) — aucune `key` basée sur un index, aucun id codé en dur, aucune closure suspecte dans `useAsync`/`useParams`.
2. Audit des éléments imbriqués : aucun `<button>`/`<a>` niché à l'intérieur d'un autre élément cliquable (le piège classique "clic sur un enfant déclenche la navigation du parent" n'existait pas dans le code).
3. Reproduction empirique en prod (navigateur piloté, viewport mobile réel + émulation iPhone tactile) : 3 cuisiniers différents cliqués en séquence depuis la liste, un plat depuis une fiche, deux marqueurs de carte différents via leur popup, plusieurs filtres — **dans tous les cas, la navigation a atterri sur la bonne page**.
4. Un clic simulé par l'outil de test a échoué une fois sur un filtre à l'intérieur d'un conteneur à scroll horizontal — vérifié comme un artefact de l'outil (coordonnées de clic sur un élément partiellement scrollé), pas un bug de l'app : un `.click()` DOM direct sur le même élément fonctionnait parfaitement et déclenchait le bon appel réseau.

**Conclusion** : aucun défaut reproductible trouvé dans le code tel qu'il existait. Cause probable côté utilisateur : un appareil/navigateur réel spécifique non reproduit ici, ou une confusion avec un état de chargement (voir point 12 ci-dessous, qui corrige un vrai risque latent de la même famille).

**Durcissement appliqué malgré tout** (défense en profondeur, cause profonde plutôt que symptôme) :
- `CookGrid.tsx` anime les réordonnancements de liste avec `motion.div layout` (Framer Motion). Avant ce changement, changer le tri (ex. passer de "Mieux notés" à "Plus proches") réordonnait la grille **instantanément et silencieusement** — si un utilisateur relâchait son doigt sur une carte pile au moment où l'ordre changeait (ex. la géolocalisation se résout de façon asynchrone après le premier rendu), le clic pouvait atterrir sur un item différent de celui visé. C'est le seul mécanisme plausible et vérifiable dans le code qui correspond à la famille de bug décrite. Avec l'animation `layout`, tout réordonnancement est maintenant visible et progressif (jamais un saut instantané sous le doigt).
- Aucun élément interactif n'est imbriqué dans un autre lors de la refonte des cartes (`CookCard`, `DishCard` restent chacune un unique `<Link>` racine) — règle maintenue explicitement pour ne pas réintroduire cette classe de bug avec les nouveaux badges/boutons ajoutés au design.

**Test manuel de non-régression** (exécuté après la refonte complète des composants, voir AUDIT.md pour le détail) : 3 clics DOM directs sur 3 cuisiniers différents depuis la liste → chacun a ouvert la fiche correspondante (Baptiste Roy → cook-44, Kwame Osei → cook-14, Isabelle Lambert → cook-35).

### 12. Bug réel trouvé et corrigé : `NaN` dans les commandes de démo générées

**Décision** : dans `scripts/gen_seed.mjs`, la construction des commandes factices (`demoOrders`) relisait les lignes SQL déjà sérialisées des plats via une regex (`/'[^']*'|[\d.]+/g`) pour en extraire id/nom/prix. Dès qu'une description de plat contenait une apostrophe échappée en SQL (`''`, ex. "Huile d''olive"), la regex désynchronisait le comptage des colonnes et le prix devenait `NaN` — cassant l'insertion SQL (`SQLITE_ERROR: no such column: NaN`).
**Correction** : les plats sont maintenant conservés comme objets JS structurés (`dishRecords`) en parallèle des lignes SQL, et les commandes factices piochent directement dans ces objets — plus aucun re-parsing de texte déjà sérialisé.
**Pourquoi c'est la cause profonde et pas un patch cosmétique** : échapper différemment les apostrophes ou complexifier la regex aurait juste déplacé le risque vers la prochaine chaîne à contenir un caractère spécial. Éliminer le parsing texte-vers-texte élimine la classe de bug entière.

### 13. Police auto-hébergée : Plus Jakarta Sans (variable), via `@fontsource-variable`

**Décision** : `@fontsource-variable/plus-jakarta-sans` plutôt qu'un lien Google Fonts classique.
**Pourquoi** : vraiment auto-hébergée (aucune requête réseau vers `fonts.googleapis.com` au runtime, donc fonctionne offline une fois mise en cache par le service worker, et aucune fuite d'IP vers Google) ; une seule famille variable couvre tous les poids (400 à 800) utilisés dans le design, donc un seul fichier à charger au lieu de 4-5 fichiers de poids fixes.

### 14. Icônes : Lucide React partout, wrapper `<CuisineIcon>` plutôt qu'une variable de composant locale

**Décision** : toutes les icônes (cuisines, notation, navigation, badges, statuts) passent par `lucide-react`. La résolution "nom de cuisine → composant icône" est encapsulée dans un composant `<CuisineIcon cuisine=... />` dédié plutôt que `const Icon = cuisineIcon(x); <Icon />` directement dans chaque page.
**Pourquoi** : le pattern `const Icon = fn(); <Icon />` déclenché à chaque rendu est flaggé par le linter React (`no-unstable-components`) car il ressemble à la définition d'un composant à l'intérieur d'un rendu (anti-pattern qui peut réinitialiser l'état d'un sous-arbre). Dans notre cas c'est sans risque (résolution stable depuis un dictionnaire figé), mais un composant dédié lève l'ambiguïté pour le linter ET pour tout futur contributeur, sans coût.

### 15. Carte : abandon de CartoDB Positron en cours de route, bascule vers Esri "Light Gray Canvas"

**Décision** : le plan initial (dans la consigne) était d'utiliser CartoDB Positron. Une fois implémenté et testé visuellement, les tuiles affichaient un filigrane "API KEY REQUIRED" — CARTO a restreint l'accès anonyme à ses tuiles `basemaps.cartocdn.com` depuis la rédaction de la consigne. Basculé vers les tuiles Esri "World_Light_Gray_Base" + "World_Light_Gray_Reference" (labels), gratuites et sans clé pour un usage de ce volume, vérifiées accessibles (`curl` → 200) avant intégration.
**Pourquoi documenté ici** : exactement le genre de dérive silencieuse qu'un jury ou un futur développeur doit pouvoir retracer — la consigne nommait un service précis, il a fallu s'en écarter pour une raison externe vérifiable, pas par choix arbitraire.

### 16. Bug de rendu trouvé et corrigé : avatars de la carte affichés à taille native (256px) au lieu de 38px

**Décision** : les pins personnalisés de la carte utilisaient des attributs HTML `width="38" height="38"` sur la balise `<img>` du `divIcon` Leaflet. En production (build Tailwind), ces attributs de présentation étaient ignorés et l'image s'affichait à sa taille intrinsèque (256×256), produisant d'énormes cercles superposés illisibles sur toute la carte.
**Correction** : taille imposée via `style="width:38px;height:38px;...;box-sizing:border-box"` (CSS inline, qui prime toujours sur les attributs de présentation et sur toute feuille de style externe), plutôt que de compter sur les attributs `width`/`height` HTML.
**Pourquoi c'est la bonne réparation** : dans un contexte où le HTML est injecté brut (hors de l'arbre React, donc hors du contrôle de Tailwind/PurgeCSS), ne jamais dépendre d'attributs de présentation HTML pour le dimensionnement — toujours du CSS explicite. Règle appliquée à tous les éléments du `divIcon` (anneau, avatar, pointe) par précaution.

### 17. Navigation à 4 onglets (Accueil / Recherche / Commandes / Profil) — retour sur la décision n°9

**Décision** : la session précédente avait délibérément réduit la nav à 2 onglets (Explorer/Commandes) pour éviter un onglet "Recherche" jugé redondant avec les filtres déjà visibles sur l'accueil. La consigne de cette session demande explicitement 4 onglets nommés. Plutôt que dupliquer bêtement le contenu, `/recherche` réutilise le même hook (`useCookSearch`) que l'accueil mais en mode liste uniquement, avec un compteur de résultats — et `/profil` est un écran minimal mais réel (stats dynamiques via l'API, pas des chiffres codés en dur) plutôt qu'un placeholder vide.
**Pourquoi le changement d'avis est légitime** : la décision n°9 était bonne *pour la contrainte de l'époque* (aucune exigence de nav précise) ; une nouvelle contrainte explicite prime sur une préférence d'architecture antérieure.
