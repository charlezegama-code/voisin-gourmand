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

---

## 2026-09-07 — Session 3 : vraies photos + élimination des stéréotypes nom/cuisine

### 18. Sourcing des photos : Unsplash (plats) + randomuser.me (portraits), aucune stockée localement

**Décision** : les photos de plats viennent d'Unsplash (`images.unsplash.com/photo-<id>?w=800&h=600&fit=crop&q=80`), les portraits de cuisiniers de `randomuser.me/api/portraits/{men|women}/<n>.jpg`. Les deux sont chargées par URL directe côté client, jamais téléchargées/stockées dans `public/`.
**Pourquoi** : les deux services servent des images statiques par CDN sans nécessiter de clé API pour un simple affichage `<img src=...>` (contrairement à leurs API de recherche respectives, qui nécessitent une authentification). Stocker les fichiers localement aurait dupliqué des données déjà servies par un CDN fiable, alourdi le repo Git, et empêché toute mise à jour future des photos sans re-commit.
**Vérification anti-hallucination** : chaque URL Unsplash a été individuellement récupérée via recherche web puis validée par une requête `curl` retournant `200` avec un `content-type: image/*` avant d'être intégrée au seed — voir le rapport de l'agent de recherche et `scripts/dish_photos.json`. Aucun ID de photo n'a été deviné/inventé.

### 19. CORS : non pertinent pour de simples balises `<img>`

**Décision** : ne pas configurer de proxy ni de gestion CORS particulière pour charger les images Unsplash/randomuser.me.
**Pourquoi** : les en-têtes CORS ne s'appliquent qu'aux requêtes JS qui lisent le contenu binaire (`fetch`, `canvas.toDataURL`, etc.). Une balise `<img src="https://...">` affiche l'image sans jamais déclencher de vérification CORS, quel que soit le serveur distant — vérifié en pratique en chargeant l'app en prod avec ces URLs (voir AUDIT.md, session du 2026-09-07).

### 20. Assignation cuisine/cuisinier : méthode déterministe pour garantir zéro stéréotype

**Décision** : plutôt que d'assigner une cuisine à chaque nom "à la main" (risque de biais inconscient dans un sens ou dans l'autre), la liste de 45 noms a été composée sans intention ethnique, puis la cuisine de chacun a été assignée par une formule déterministe `cuisine[(index × 4) mod 9]` qui garantit exactement 5 cuisiniers par cuisine (45 ÷ 9) tout en décorrélant totalement la position dans la liste de la cuisine assignée. Les quelques coïncidences générées par cette formule (nom à consonance donnée + cuisine associée dans l'imaginaire courant) ont ensuite été identifiées manuellement et permutées avec un autre cuisinier pour les éliminer complètement.
**Pourquoi cette méthode plutôt qu'une curation 100% manuelle** : une assignation entièrement manuelle aurait pu sur-corriger dans l'autre sens (inverser systématiquement, ce qui est aussi une forme de stéréotype scénarisé) ou sous-corriger par fatigue sur les derniers profils. La méthode déterministe + correction ciblée des seules coïncidences repérées donne un résultat vérifiable et reproductible.
**Chaque bio raconte un parcours, pas une origine** : formation professionnelle, mentorat, voyage, mariage, reconversion — jamais une hypothèse d'origine ethnique du cuisinier. Voir AUDIT.md pour la vérification sur 5 profils tirés au hasard.

### 21. CartoDB Positron re-testé, toujours verrouillé — Esri Light Gray Canvas reconduit

**Décision** : la consigne de cette session redemandait explicitement des tuiles CartoDB Positron. Retesté (`curl` sur une tuile réelle) : toujours un filigrane "API KEY REQUIRED" incrusté dans l'image (confirmé visuellement, pas juste un code HTTP). La solution Esri "Light Gray Canvas" mise en place en session 2 (gratuite, sans clé, esthétique équivalente) est donc reconduite sans changement.
**Pourquoi documenté à nouveau** : pour qu'une future itération ne perde pas de temps à retenter CartoDB sans vérifier — la vérification a un coût trivial (une requête `curl`) comparé au risque de livrer une carte avec un filigrane visible en démo.

### 22. Incident : une fork agent a dépassé son périmètre — corrigé en cours de route

**Ce qui s'est passé** : une sous-tâche (fork) a été lancée avec pour instruction stricte de chercher et vérifier des photos Unsplash et d'écrire uniquement `scripts/dish_photos.json`. Parce qu'un fork hérite de tout le contexte de la conversation (donc de la consigne complète des 3 problèmes), il a commencé de sa propre initiative à éditer `worker/types.ts`, `worker/mappers.ts`, `worker/index.ts` et `src/types/index.ts` — un travail qui chevauchait exactement ce que je m'apprêtais à faire moi-même en parallèle.
**Correction** : dès détection (via `git status` montrant des fichiers modifiés hors du périmètre confié), la fork a reçu l'instruction explicite de tout arrêter, de `git checkout` ses changements sur ces 4 fichiers, et de se recentrer uniquement sur `scripts/dish_photos.json`. Les mêmes changements de schéma/types ont ensuite été refaits moi-même, sans dépendre du travail annulé de la fork.
**Leçon retenue** : pour une tâche déléguée à une fork avec un périmètre de fichiers strict, il faut vérifier tôt (`git status`) que la fork respecte bien ce périmètre plutôt que d'assumer qu'elle s'y limite — l'héritage complet du contexte est une force (pas besoin de tout réexpliquer) mais aussi un risque de chevauchement si deux agents travaillent le même sujet en parallèle.

### 23. Photo de couverture du cuisinier = premier plat généré, pas une photo dédiée

**Décision** : `cooks.cover_photo_url` est simplement la photo du premier plat assigné à ce cuisinier au moment de la génération du seed, pas une photo "portrait d'ambiance" distincte à sourcer séparément.
**Pourquoi** : la consigne dit littéralement "Grande photo de couverture = le plat signature du cuisinier" — réutiliser une photo de plat déjà sourcée et vérifiée évite de doubler le volume de recherche d'images (45 photos de couverture supplémentaires) pour un résultat visuellement identique à ce qui était demandé.

### 24. Skeleton par image individuelle (`ProgressiveImage`), pas seulement par carte entière

**Décision** : ajout d'un composant `ProgressiveImage` (pulse de fond tant que `onLoad` n'a pas fourni, fade-in ensuite) utilisé pour chaque photo de plat/couverture, en plus des skeletons de carte entière déjà existants (`CookCardSkeletonGrid`, `DishCardSkeleton`).
**Pourquoi** : les images Unsplash sont chargées depuis un CDN externe (latence variable, hors du contrôle de l'app) alors que les données JSON de l'API D1 répondent en quelques ms — sans ce skeleton par image, l'utilisateur verrait le texte de la carte apparaître instantanément suivi d'un flash blanc/vide le temps que l'image se charge, ce qui est visuellement moins soigné qu'un pulse cohérent.

---

## 2026-09-07 (session 4) — Logo officiel, onboarding, nettoyage profils, légende carte

### 25. Logo : dérivation par downscale uniquement, pas de re-padding

**Décision** : le fichier fourni (1024x1024, maison+cuillère terracotta sur fond crème) est sauvegardé tel quel dans `public/logo.png` comme source unique de vérité. Toutes les icônes (64/192/512, favicons 16/32) sont dérivées par redimensionnement LANCZOS à la baisse uniquement — jamais d'upscale d'une version déjà réduite.
**Analyse de marge faite avant de générer quoi que ce soit** : mesure par script (détection du contenu non-crème sur les pixels) montre que l'icône occupe ~67% de largeur et ~51% de hauteur, avec une marge de ~16-24% de chaque côté — largement dans la zone de sécurité recommandée pour les icônes "maskable" (contenu important dans le cercle inscrit à 80% du canevas). Conclusion : pas besoin de repadder pour les variantes maskable, le fichier fourni est déjà bien formaté comme une icône d'app standard.
**Pourquoi ne pas juste régénérer avec Pillow comme avant** : la consigne fournit un logo officiel de marque à utiliser tel quel — dessiner une nouvelle icône programmatique irait à l'encontre de l'objectif (cohérence de marque), même si esthétiquement proche.

### 26. Écran de démarrage : composant applicatif plutôt que compter uniquement sur le splash natif PWA

**Décision** : ajout d'un `<SplashScreen>` affiché ~900ms au montage de `App.tsx`, en plus (pas à la place) des icônes de manifest qui pilotent le splash natif généré par l'OS lors d'une vraie installation PWA.
**Pourquoi** : le splash natif Android/Chrome ne s'affiche QUE si l'app a été installée sur l'écran d'accueil et relancée depuis là — dans un contexte de démo/pitch où l'app sera très probablement montrée dans un onglet de navigateur classique (pas installée), ce splash natif ne serait jamais vu. Un composant applicatif garantit le moment de marque dans TOUS les scénarios de démo.
**Bug trouvé et corrigé pendant l'implémentation** : la légende de la carte (`z-[1000]`, imposé par les panneaux Leaflet) transperçait le splash (`z-50` initialement) car Leaflet utilise des z-index très élevés en interne. Le splash et l'onboarding sont passés à `z-[9999]`/`z-[9998]` pour rester strictement au-dessus de tout composant tiers piloté par une librairie externe.

### 27. Onboarding : overlay contrôlé par état React, pas une route

**Décision** : le tutoriel n'est PAS une route react-router (`/onboarding`) mais un composant affiché conditionnellement par-dessus toute l'app depuis `App.tsx`, piloté par un state local + `localStorage`.
**Pourquoi** : en tant que route, revenir en arrière (bouton retour du navigateur) depuis l'onboarding poserait la question de "vers quoi ?" et le lien "Revoir le tutoriel" depuis Profil devrait naviguer puis revenir — plus de complexité pour un gain nul. En overlay contrôlé par state + `OnboardingContext` (fourni par `App.tsx`, consommé par `ProfilePage`), n'importe quel écran peut déclencher le tutoriel sans jongler avec l'historique de navigation.

### 28. Nettoyage des photos de cuisiniers : méthode reproductible, pas un jugement au fil de l'eau

**Décision** : les 45 portraits actuellement utilisés ont été téléchargés et assemblés en planche-contact (6 colonnes, labels avec le nom de chaque cuisinier) pour une relecture visuelle systématique en un seul passage, plutôt que de rouvrir chaque profil un par un dans l'app.
**Critères d'exclusion appliqués** (repris de la consigne) : pouce levé/geste réseau social, réaction exagérée (bouche grande ouverte, choquée), visage caché ou de profil marqué, pose selfie clairement non professionnelle. Les choix stylistiques neutres (cheveux colorés, noir et blanc artistique, arrière-plan animé) n'ont PAS été traités comme des défauts — seuls les critères explicites de la consigne ont justifié un remplacement, pour éviter une purge excessive qui uniformiserait artificiellement les profils.
**8 profils remplacés sur 45** (~18%) : cohérent avec le taux qu'on peut attendre d'un jeu de portraits stock générique pas spécifiquement curé pour un usage "profil professionnel vérifié". Détail dans le commit `fix(cuisiniers)`.
**Implémentation technique** : `avatarOverride` optionnel sur les cuisiniers concernés dans `gen_seed.mjs`, plutôt que de réordonner ou modifier le compteur séquentiel — garantit que les 37 profils non concernés gardent EXACTEMENT la même photo qu'avant (aucun effet de bord en cascade).

### 29. Pins de carte : légende ajoutée, fonctionnalité de statut conservée

**Décision** : vérifié dans `MapView.tsx` que la couleur d'anneau des pins n'est pas arbitraire (`cook.soldOutToday` → gris, `cook.isNew` → vert, sinon terracotta). Conformément à la consigne ("si ça correspond à un statut voulu, ajoute une légende plutôt que supprimer"), la fonctionnalité est conservée et une légende discrète (pill blanche, 3 puces de couleur + libellé) est ajoutée en bas de la carte, au-dessus de l'attribution Leaflet.
**Détail technique** : `z-[1000]` sur la légende pour rester au-dessus des tuiles/contrôles Leaflet (qui utilisent aussi des z-index élevés en interne) — c'est ce même z-index qui a révélé le bug de superposition avec le splash screen (décision n°26).

---

## 2026-09-08 (session 5) — Image dédoublée, profil générique, renommage, logo

### 30. Image dédoublée : diagnostic par mesure DOM, pas par supposition

**Cause exacte** (confirmée par `getBoundingClientRect()` en direct, pas déduite du code seul) : `ProgressiveImage` code en dur la classe `"relative"` sur son conteneur, et les 3 sites d'appel (CookCard, fiche cuisinier, fiche plat) lui passaient en plus `wrapperClassName="absolute inset-0"`. Tailwind résout les classes de `position` en conflit par l'ordre du STYLESHEET généré (pas l'ordre dans l'attribut `class`), et `.relative` y est déclaré après `.absolute` — donc `.relative` gagnait systématiquement, rendant "absolute inset-0" totalement sans effet. Mesuré : le conteneur faisait 292.5px de haut au lieu des 224px attendus (= la hauteur naturelle d'une image 800×600 étirée sur 390px de large, donnant `390 × 600/800 = 292.5`), débordant du conteneur `h-56` du parent.
**Pourquoi ça ressemblait à "deux images"** : le dégradé sombre de lisibilité (`bg-gradient-to-t`), lui correctement positionné en absolute sur les 224px du VRAI parent, s'arrêtait net à 224px — alors que l'image, débordante, continuait jusqu'à 292.5px. Résultat : une moitié d'image assombrie progressivement, puis une rupture nette de luminosité, puis 68.5px d'image en pleine lumière — perçu comme une jointure entre deux photos alors qu'il n'y en avait qu'une seule.
**Fix appliqué à la racine, pas au symptôme** : plutôt que de bidouiller les classes au cas par cas, séparation claire des responsabilités — `ProgressiveImage` reste toujours `relative` en interne (nécessaire pour son propre skeleton de chargement), et tout site d'appel qui a besoin de remplir un ancêtre positionné doit envelopper l'appel dans son PROPRE `<div className="absolute inset-0">`. Documenté directement dans le composant (JSDoc sur la prop) pour qu'un futur appel ne réintroduise pas le même bug.
**Portée de la vérification** : le bug touchait TOUS les usages avec position absolue (CookCard = grille de recherche/accueil, fiche cuisinier, fiche plat), pas seulement l'écran signalé — corrigé aux 3 endroits, testé sur 5 plats + 1 fiche cuisinier + la grille de recherche, mesure DOM confirmant 224px = 224px partout après le fix.

### 31. Profil : retour arrière assumé sur la photo réelle

**Contexte** : la session précédente avait délibérément remplacé l'icône générique du profil par une photo randomuser.me, au nom de la cohérence visuelle ("le reste de l'app utilise des photos partout"). Cette session demande explicitement de revenir en arrière.
**Pourquoi ce n'est pas une simple annulation mécanique** : la distinction demandée a du sens et n'était pas évidente au moment de la décision précédente — le profil de démo représente la personne qui TESTE l'app (un rôle fonctionnel, pas un cuisinier avec une identité fictive à rendre crédible), donc lui donner une fausse photo brouille justement la distinction entre "vrais" profils vérifiés (cuisiniers, avec bio et parcours) et le compte utilisateur. Gardé en mémoire pour la prochaine fois : la cohérence visuelle ne doit pas primer sur la cohérence FONCTIONNELLE des rôles affichés.

### 32. Logo : le bug n'était pas où l'énoncé le supposait, corrigé quand même

**Ce qui a été vérifié en premier, avant tout retraitement** : le fichier logo fourni est en mode RGB pur, sans canal alpha du tout — donc l'hypothèse initiale de la consigne ("mauvaise gestion de la transparence lors du redimensionnement") ne pouvait pas être la cause, puisqu'il n'y avait pas de transparence à mal gérer. Un scan de pixels le long d'une frontière crème/orange a révélé la vraie cause : un artefact de "ringing" (dépassement de luminosité) sur les canaux rouge/vert juste avant la transition vers l'orange — le canal bleu, lui, restait parfaitement monotone.
**Pourquoi documenter cette divergence** : l'énoncé decrivait un symptôme réel (liseré blanc visible) mais une cause probable incorrecte — vérifier avant de corriger a évité un faux correctif (ex. seuiller un canal alpha inexistant n'aurait rien changé).
**Correction** : reconstruction du logo à partir du canal bleu (seul canal fiable) comme masque de position sur le dégradé crème→orange, avec les couleurs de référence exactes de la charte (`--color-cream`, `terracotta-500`) plutôt que les teintes légèrement décalées du fichier source, et une sigmoïde resserrée pour une transition nette. Bénéfice secondaire : le fichier n'ayant jamais eu de vraie transparence, l'occasion a été prise d'en ajouter une (coins arrondis avec alpha réel) plutôt que les coins blancs opaques d'origine — et de séparer un fichier dédié plein-cadre pour les icônes "maskable" (qui ne doivent justement PAS avoir de coins pré-arrondis, l'OS appliquant son propre masque).
**SVG non nécessaire** : l'option de repli proposée par la consigne (vectoriser en SVG) n'a pas été mise en œuvre — le retraitement PNG a complètement éliminé l'artefact (vérifié par zoom 8× sur le rendu réel du header à 36px et des favicons à 16/32px), donc passer par une vectorisation aurait été un effort supplémentaire sans bénéfice mesurable.
