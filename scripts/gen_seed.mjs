// Génère db/schema.sql et db/seed.sql pour Cloudflare D1.
// Données 100% fictives pour une démo de pitch (aucune vraie personne, aucun emoji).
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DB_DIR = join(ROOT, "db");

// Centre approximatif de chaque arrondissement parisien (1 à 20), pour disperser les pins sur toute la carte.
const ARR_CENTERS = {
  1: [48.8607, 2.3358],
  2: [48.8686, 2.3411],
  3: [48.863, 2.362],
  4: [48.8546, 2.3567],
  5: [48.8448, 2.3471],
  6: [48.8496, 2.335],
  7: [48.856, 2.32],
  8: [48.8718, 2.3075],
  9: [48.8767, 2.3372],
  10: [48.8709, 2.3606],
  11: [48.8583, 2.38],
  12: [48.8399, 2.388],
  13: [48.8322, 2.3559],
  14: [48.83, 2.3266],
  15: [48.8417, 2.2989],
  16: [48.8637, 2.2769],
  17: [48.8873, 2.3222],
  18: [48.8925, 2.3444],
  19: [48.885, 2.384],
  20: [48.8636, 2.398],
};

const NEIGHBORHOODS = {
  1: "Les Halles",
  2: "Sentier",
  3: "Haut-Marais",
  4: "Le Marais",
  5: "Quartier Latin",
  6: "Saint-Germain-des-Prés",
  7: "Invalides",
  8: "Champs-Élysées",
  9: "Faubourg-Montmartre",
  10: "Canal Saint-Martin",
  11: "Oberkampf",
  12: "Bercy",
  13: "Butte-aux-Cailles",
  14: "Montparnasse",
  15: "Vaugirard",
  16: "Passy",
  17: "Batignolles",
  18: "Montmartre",
  19: "Buttes-Chaumont",
  20: "Belleville",
};

// jitter déterministe (pas de Math.random pour reproductibilité du seed)
function jitter(seed) {
  const x = Math.sin(seed * 999.77) * 10000;
  return x - Math.floor(x) - 0.5;
}
function jitterAbs(seed) {
  return Math.abs(jitter(seed));
}

// 45 cuisiniers fictifs. Règle stricte : le prénom/nom N'EST JAMAIS corrélé à la cuisine pratiquée
// (voir DECISIONS.md — méthode d'assignation déterministe pour garantir l'absence de stéréotype).
// Chaque bio explique le PARCOURS PERSONNEL qui mène à cette cuisine (voyage, famille par alliance,
// mentor, formation, reconversion) plutôt que de supposer une origine ethnique.
const COOKS = [
  // — Française (5) : aucun n'a un nom "typiquement français"
  { name: "Amina Benali", specialty: "Française", gender: "f", bio: "Formée dans un bistrot parisien pendant dix ans avant de se lancer en solo, elle revisite les classiques de grand-mère : blanquette, tarte tatin, quiche." },
  { name: "Karim Belkacem", specialty: "Française", gender: "m", bio: "Ancien second de cuisine dans une brasserie du 6e arrondissement, il a gardé le goût des plats mijotés français appris sur le tas." },
  { name: "Ibrahima Diallo", specialty: "Française", gender: "m", bio: "Arrivé à Paris à 19 ans, il est tombé amoureux de la cuisine bourguignonne en travaillant comme commis — aujourd'hui il la cuisine mieux que personne." },
  { name: "Mei Chen", specialty: "Française", gender: "f", bio: "Diplômée d'une école hôtelière lyonnaise, elle a choisi de se spécialiser dans le répertoire classique français plutôt que dans la cuisine de son enfance." },
  { name: "Diego Herrera", specialty: "Française", gender: "m", bio: "Venu d'Argentine pour un stage à Paris, il ne s'est jamais remis du gratin dauphinois de sa colocataire — il en a fait son métier depuis." },

  // — Italienne (5)
  { name: "Thomas Lefebvre", specialty: "Italienne", gender: "m", bio: "Un été à Bologne chez la famille de son ex a suffi à le convertir aux pâtes fraîches maison — il n'est jamais reparti côté fourneaux." },
  { name: "Fatou Mbaye", specialty: "Italienne", gender: "f", bio: "Ancienne commis dans une trattoria du Marais, elle a appris le risotto directement du chef sicilien qui l'a formée." },
  { name: "Rami Nassar", specialty: "Italienne", gender: "m", bio: "Passionné de cuisine italienne depuis un Erasmus à Rome, il refait chez lui les recettes de sa colocataire romaine." },
  { name: "Samuel Kouassi", specialty: "Italienne", gender: "m", bio: "Autodidacte, il a appris la cuisine italienne en regardant des heures de vidéos de nonnas napolitaines avant de se lancer." },
  { name: "Omar Haddad", specialty: "Italienne", gender: "m", bio: "Ancien pizzaiolo à Naples pendant trois ans, il a ramené la vraie pâte à longue fermentation dans sa cuisine parisienne." },

  // — Asiatique (5)
  { name: "Pierre Durand", specialty: "Asiatique", gender: "m", bio: "Parti travailler un an à Tokyo, il en est revenu obsédé par les currys japonais et le riz parfaitement cuit." },
  { name: "Julien Marchand", specialty: "Asiatique", gender: "m", bio: "Ancien commis dans un restaurant vietnamien du 13e, il y a appris le pho et les nems qu'il refait aujourd'hui chez lui." },
  { name: "Baptiste Roy", specialty: "Asiatique", gender: "m", bio: "Sa compagne thaïlandaise lui a transmis les bases du curry vert et du pad thaï — il ne cuisine plus que ça depuis." },
  { name: "Camila Santos", specialty: "Asiatique", gender: "f", bio: "Fascinée par la cuisine vietnamienne depuis un voyage à Hanoï, elle a appris les bouillons longue cuisson auprès d'une famille locale." },
  { name: "Salma Bakr", specialty: "Asiatique", gender: "f", bio: "Formée dans un izakaya parisien pendant deux ans, elle maîtrise les currys et bento japonais du quotidien." },

  // — Africaine (5)
  { name: "Antoine Bernard", specialty: "Africaine", gender: "m", bio: "Marié à une Sénégalaise, il a appris le thiéboudienne et le mafé directement de sa belle-mère — sa meilleure professeure." },
  { name: "Hugo Fontaine", specialty: "Africaine", gender: "m", bio: "Deux ans de coopération à Dakar lui ont donné le goût du poulet yassa qu'il cuisine depuis son retour." },
  { name: "Charlotte Mercier", specialty: "Africaine", gender: "f", bio: "Ancienne collègue d'une cheffe ivoirienne, elle a hérité de ses recettes de garba et d'attiéké." },
  { name: "Valentine Roussel", specialty: "Africaine", gender: "f", bio: "Passionnée par la cuisine ghanéenne depuis un stage humanitaire à Accra, elle prépare un jollof rice qui fait référence dans le quartier." },
  { name: "Ravi Kapoor", specialty: "Africaine", gender: "m", bio: "Formé par un chef sénégalais dans un restaurant lyonnais, il perpétue aujourd'hui les recettes ouest-africaines qu'on lui a transmises." },

  // — Maghrébine (5)
  { name: "Marie Lambert", specialty: "Maghrébine", gender: "f", bio: "Belle-fille d'une famille algérienne, elle prépare le couscous du vendredi depuis quinze ans — une vraie tradition adoptée." },
  { name: "Sofia Moreau", specialty: "Maghrébine", gender: "f", bio: "Ancienne serveuse dans un restaurant marocain, elle a fini par passer derrière les fourneaux pour apprendre le tajine." },
  { name: "Manon Girard", specialty: "Maghrébine", gender: "f", bio: "Un voyage à Marrakech et un cours de cuisine improvisé chez l'habitant : elle n'a plus jamais arrêté de faire des tajines." },
  { name: "Théo Simon", specialty: "Maghrébine", gender: "m", bio: "Formé par son ancien colocataire tunisien, il maîtrise la chorba et le brick à l'œuf comme un local." },
  { name: "Giulia Renard", specialty: "Maghrébine", gender: "f", bio: "Installée à Paris après plusieurs années à Tunis, elle a rapporté dans ses valises les recettes de sa famille d'adoption tunisienne." },

  // — Libanaise (5)
  { name: "Chloé Petit", specialty: "Libanaise", gender: "f", bio: "Un stage dans un restaurant libanais du 15e lui a donné le goût du mezze — elle en a fait sa spécialité." },
  { name: "Kwame Osei", specialty: "Libanaise", gender: "m", bio: "Ancien collègue de cuisine d'un chef beyrouthin, il a hérité de ses recettes de fattouche et de kebbé." },
  { name: "Elena Blanchard", specialty: "Libanaise", gender: "f", bio: "Fascinée par la cuisine levantine depuis un voyage à Beyrouth, elle prépare un houmous qui fait sa réputation." },
  { name: "Arjun Patel", specialty: "Libanaise", gender: "m", bio: "Formé auprès d'une famille libanaise du quartier, il maîtrise le taboulé et le chawarma maison." },
  { name: "Moussa Traoré", specialty: "Libanaise", gender: "m", bio: "Ancien cuisinier dans une épicerie fine libanaise, il a appris sur le tas les mezze qu'il propose aujourd'hui." },

  // — Indienne (5)
  { name: "Camille Rousseau", specialty: "Indienne", gender: "f", bio: "Six mois de voyage en Inde du Nord lui ont donné envie d'apprendre le curry auprès de familles locales — elle ne s'est plus arrêtée." },
  { name: "Linh Tran", specialty: "Indienne", gender: "f", bio: "Ancienne commis dans un restaurant indien du 18e, elle a appris le biryani et le dahl directement du chef." },
  { name: "Nicolas Bertrand", specialty: "Indienne", gender: "m", bio: "Formé par son mentor, un chef originaire du Kerala, il prépare un curry d'agneau qui ne triche pas sur les épices." },
  { name: "Maxime Chevalier", specialty: "Indienne", gender: "m", bio: "Passionné de cuisine indienne depuis un stage en cuisine à Bombay, il refait chez lui les currys appris là-bas." },
  { name: "Farid Amrani", specialty: "Indienne", gender: "m", bio: "Sa colocataire indienne lui a transmis les bases du dahl et du naan — dix ans plus tard, c'est devenu son métier." },

  // — Sud-Américaine (5)
  { name: "Youssef Amrani", specialty: "Sud-Américaine", gender: "m", bio: "Un an passé à Lima l'a converti au ceviche — il importe même ses piments depuis son fournisseur péruvien." },
  { name: "Lucas Girard", specialty: "Sud-Américaine", gender: "m", bio: "Ancien élève d'un chef argentin à Buenos Aires, il maîtrise l'asado et le chimichurri comme personne." },
  { name: "Priya Sharma", specialty: "Sud-Américaine", gender: "f", bio: "Fascinée par la cuisine péruvienne depuis un voyage à Lima, elle prépare un ceviche qui fait référence dans le quartier." },
  { name: "Yasmine Cherif", specialty: "Sud-Américaine", gender: "f", bio: "Formée par une famille colombienne du quartier, elle a appris les arepas et les empanadas maison." },
  { name: "Hana Kobayashi", specialty: "Sud-Américaine", gender: "f", bio: "Deux ans à Rio lui ont donné le goût de la feijoada qu'elle cuisine depuis son retour à Paris." },

  // — Végétarienne (5)
  { name: "Nadia Haddad", specialty: "Végétarienne", gender: "f", bio: "Passée au 100% végétal après un documentaire qui l'a marquée, elle réinvente les classiques réconfortants sans viande." },
  { name: "Léa Dubois", specialty: "Végétarienne", gender: "f", bio: "Ancienne cheffe de cuisine traditionnelle, elle s'est reconvertie au végétarien par conviction il y a cinq ans." },
  { name: "Aïcha Ndiaye", specialty: "Végétarienne", gender: "f", bio: "Diététicienne de formation, elle a développé des recettes végétariennes équilibrées et gourmandes pour ses voisins." },
  { name: "Isabelle Fabre", specialty: "Végétarienne", gender: "f", bio: "Convertie au végétarisme depuis dix ans, elle prouve chaque jour qu'un bowl peut être aussi gourmand qu'un plat en sauce." },
  { name: "Noémie Faure", specialty: "Végétarienne", gender: "f", bio: "Formée en cuisine végétale à Londres, elle importe des techniques anglo-saxonnes dans ses recettes parisiennes." },
];

// Banque de plats par spécialité — nom + description ; la photo est injectée depuis dish_photos.json
// (généré par scripts/fetch_dish_photos — voir DECISIONS.md). Aucun emoji.
const DISH_BANK = {
  Française: [
    ["Blanquette de veau", "Veau mijoté à la crème, riz basmati"],
    ["Gratin dauphinois", "Pommes de terre, crème, gruyère gratiné"],
    ["Tarte tatin maison", "Pommes caramélisées, pâte croustillante"],
    ["Quiche lorraine", "Lardons, œufs, crème fraîche"],
    ["Bœuf bourguignon", "Mijoté au vin rouge, carottes, champignons"],
  ],
  Maghrébine: [
    ["Couscous royal", "Semoule, merguez, agneau, légumes"],
    ["Tajine poulet citron", "Poulet, olives, citron confit"],
    ["Pastilla au poulet", "Feuilleté sucré-salé, amandes, cannelle"],
    ["Chorba frik", "Soupe traditionnelle, blé vert, agneau"],
    ["Brick à l'œuf", "Feuille de brick croustillante, thon, œuf"],
  ],
  Asiatique: [
    ["Bo bun au bœuf", "Vermicelles, bœuf mariné, herbes fraîches"],
    ["Pho traditionnel", "Bouillon longue cuisson, nouilles de riz"],
    ["Nems croustillants", "Porc, vermicelles, sauce nuoc-mâm maison"],
    ["Curry thaï vert", "Poulet, lait de coco, légumes de saison"],
    ["Pad thaï crevettes", "Nouilles sautées, cacahuètes, citron vert"],
  ],
  Africaine: [
    ["Thiéboudienne", "Riz au poisson façon sénégalaise"],
    ["Poulet yassa", "Oignons confits, citron, riz blanc"],
    ["Mafé poulet", "Sauce cacahuète onctueuse, riz"],
    ["Alloco & poulet braisé", "Bananes plantains frites, poulet mariné"],
    ["Jollof rice", "Riz épicé façon ghanéenne, poulet grillé"],
  ],
  Italienne: [
    ["Tagliatelles au ragù", "Pâtes fraîches, sauce bolognaise mijotée"],
    ["Risotto aux champignons", "Riz carnaroli, parmesan, champignons"],
    ["Lasagnes maison", "Béchamel, ragù, mozzarella gratinée"],
    ["Tiramisu classique", "Mascarpone, café, cacao"],
    ["Pizza napolitaine", "Pâte longue fermentation, tomate, mozzarella"],
  ],
  Libanaise: [
    ["Mezze maison", "Houmous, moutabal, taboulé, falafels"],
    ["Taboulé au persil", "Persil, boulgour, tomate, citron"],
    ["Chawarma poulet", "Poulet mariné, sauce toum, pain pita"],
    ["Kebbé frit", "Boulgour, viande épicée, pignons"],
    ["Fattouche", "Salade croquante, pain grillé, grenade"],
  ],
  Indienne: [
    ["Butter chicken", "Poulet, sauce tomate épicée, crème"],
    ["Dahl de lentilles", "Lentilles corail, épices torréfiées"],
    ["Curry d'agneau", "Agneau mijoté, riz basmati"],
    ["Dosa croustillante", "Crêpe de riz, sambar, chutney coco"],
    ["Biryani au poulet", "Riz basmati parfumé, épices, poulet"],
  ],
  "Sud-Américaine": [
    ["Empanadas maison", "Chaussons farcis viande ou légumes"],
    ["Ceviche péruvien", "Poisson mariné citron vert, coriandre"],
    ["Feijoada", "Ragoût de haricots noirs, riz, farofa"],
    ["Arepas colombiennes", "Galette de maïs, garniture au choix"],
    ["Tacos al pastor", "Porc mariné, ananas, coriandre"],
  ],
  Végétarienne: [
    ["Bowl bouddha", "Légumineuses, céréales, légumes rôtis"],
    ["Burger végétal maison", "Galette de légumineuses, pain brioché"],
    ["Curry de légumes", "Lait de coco, légumes de saison"],
    ["Houmous & falafels", "Pois chiches, tahini, pain pita"],
    ["Salade de quinoa", "Quinoa, légumes croquants, vinaigrette maison"],
  ],
};

const DISH_PHOTOS = JSON.parse(readFileSync(join(ROOT, "scripts", "dish_photos.json"), "utf-8"));
function photoFor(dishName) {
  const url = DISH_PHOTOS[dishName];
  if (!url) throw new Error(`Aucune photo trouvée pour le plat "${dishName}" dans dish_photos.json`);
  return url;
}

// Portraits réels (randomuser.me, gratuit, sans clé) — compteur par genre pour ne jamais répéter une photo.
let manCounter = 1;
let womanCounter = 1;
function portraitFor(gender) {
  if (gender === "m") return `https://randomuser.me/api/portraits/men/${manCounter++}.jpg`;
  return `https://randomuser.me/api/portraits/women/${womanCounter++}.jpg`;
}

const PICKUP_WINDOWS = ["12h00 - 13h30", "12h30 - 14h00", "19h00 - 20h30", "19h30 - 21h00", "18h30 - 20h00"];
const STREETS = [
  "rue de la Fontaine au Roi", "rue des Poissonniers", "rue de la Roquette", "rue Ramponeau",
  "rue du Faubourg Saint-Denis", "rue Oberkampf", "rue de la Chapelle", "rue de Belleville",
  "rue Myrha", "rue Sedaine", "avenue Simon Bolivar", "rue de la Butte-aux-Cailles",
  "rue du Château d'Eau", "rue Saint-Maur", "rue de Ménilmontant", "rue Lecourbe",
  "rue de Vaugirard", "rue Saint-Dominique", "avenue de Wagram", "rue de Passy",
  "rue des Martyrs", "rue Montorgueil", "rue des Archives", "rue Mouffetard",
];

const REVIEW_AUTHORS = ["Léa", "Antoine", "Sarah", "Hugo", "Manon", "Yanis", "Inès", "Paul", "Lucie", "Nathan", "Zoé", "Adam", "Emma", "Louis", "Jade", "Gabriel"];
const REVIEW_COMMENTS = [
  "Un vrai goût de fait-maison, on sent l'amour dans le plat.",
  "Portions généreuses et super accueil au retrait.",
  "Exactement comme chez ma grand-mère, je recommande !",
  "Plat encore chaud, emballage soigné, parfait.",
  "Un peu d'attente mais ça valait le coup, très bon.",
  "Découverte du quartier, je recommande à 100%.",
  "Rapport qualité-prix excellent pour Paris.",
  "Épices bien dosées, très parfumé sans être trop relevé.",
  "Service adorable, on sent la passion du métier.",
  "Meilleur repas fait-maison testé cette année.",
];

function esc(s) {
  return String(s).replace(/'/g, "''");
}

let cookRows = [];
let dishRows = [];
let dishRecords = []; // objets structurés (pas de re-parsing de SQL déjà sérialisé — voir DECISIONS.md)
let reviewRows = [];
let orderRows = [];
let dishId = 1;
let reviewId = 1;
const cookAvatars = {}; // cookId -> avatarUrl, réutilisé pour les commandes de démo

// Cuisiniers "complets aujourd'hui" pour varier les états visuels de la carte (index 0-based).
const SOLD_OUT_TODAY = new Set([6, 17, 29, 38]);

COOKS.forEach((c, i) => {
  const id = `cook-${i + 1}`;
  const arr = (i % 20) + 1; // rotation sur les 20 arrondissements pour une carte dense partout
  const [baseLat, baseLng] = ARR_CENTERS[arr];
  const lat = (baseLat + jitter(i + 1) * 0.011).toFixed(6);
  const lng = (baseLng + jitter(i + 47) * 0.011).toFixed(6);
  // note étalée entre 4.0 et 5.0 pour un réalisme plus marqué (pas tous proches de 5)
  const rating = Math.min(5.0, 4.0 + jitterAbs(i * 2 + 5) * 1.0).toFixed(1);
  const reviewCount = 4 + Math.floor(jitterAbs(i + 11) * 65);
  const street = STREETS[i % STREETS.length];
  const streetNum = 2 + ((i * 7) % 130);
  const isNew = i % 7 === 0 ? 1 : 0;
  const verified = i % 4 === 0 ? 1 : 0;
  const avatarUrl = portraitFor(c.gender);
  cookAvatars[id] = avatarUrl;

  // 1 à 5 plats par cuisinier (variation volontaire pour des cartes moins uniformes)
  const bank = DISH_BANK[c.specialty];
  const dishCount = 1 + Math.floor(jitterAbs(i * 3 + 7) * 5); // 1 à 5
  const soldOut = SOLD_OUT_TODAY.has(i);
  let coverPhotoUrl = null;
  for (let d = 0; d < dishCount; d++) {
    const [name, desc] = bank[(i + d) % bank.length];
    const photoUrl = photoFor(name);
    if (coverPhotoUrl === null) coverPhotoUrl = photoUrl; // le premier plat sert de photo de couverture
    const price = (9 + ((i * 3 + d * 2) % 7)).toFixed(2); // 9.00 - 15.00€
    const qty = soldOut ? 0 : 1 + ((i + d) % 6);
    const window = PICKUP_WINDOWS[(i + d) % PICKUP_WINDOWS.length];
    const thisDishId = `dish-${dishId}`;
    dishRows.push(
      `('${thisDishId}', '${id}', '${esc(name)}', '${esc(desc)}', '${photoUrl}', ${price}, ${qty}, '${window}', '${c.specialty}')`
    );
    dishRecords.push({ id: thisDishId, cookId: id, name, photoUrl, price: Number(price), pickupWindow: window });
    dishId++;
  }

  cookRows.push(
    `('${id}', '${esc(c.name)}', '${avatarUrl}', '${coverPhotoUrl}', '${esc(c.bio)}', '${c.specialty}', ${rating}, ${reviewCount}, ${arr}, '${esc(NEIGHBORHOODS[arr])}', ${lat}, ${lng}, '${streetNum} ${esc(street)}, 750${String(arr).padStart(2, "0")} Paris', ${verified}, ${isNew})`
  );

  // 2 avis fictifs par cuisinier
  for (let r = 0; r < 2; r++) {
    const author = REVIEW_AUTHORS[(i * 2 + r) % REVIEW_AUTHORS.length];
    const comment = REVIEW_COMMENTS[(i + r * 3) % REVIEW_COMMENTS.length];
    const revRating = r === 0 ? 5 : 4 + (i % 2);
    const day = 1 + ((i + r) % 27);
    reviewRows.push(
      `('review-${reviewId}', '${id}', '${esc(author)}', ${revRating}, '${esc(comment)}', '2026-08-${String(day).padStart(2, "0")}')`
    );
    reviewId++;
  }
});

// Commandes factices pré-remplies pour l'écran "Mes commandes" (utilisateur démo)
const demoOrders = [
  { cookIdx: 1, dishOffset: 0, qty: 1, status: "recupere", daysAgo: "2026-08-27" },
  { cookIdx: 4, dishOffset: 1, qty: 2, status: "recupere", daysAgo: "2026-08-24" },
  { cookIdx: 8, dishOffset: 0, qty: 1, status: "recupere", daysAgo: "2026-08-19" },
  { cookIdx: 20, dishOffset: 0, qty: 1, status: "recupere", daysAgo: "2026-08-14" },
  { cookIdx: 12, dishOffset: 0, qty: 1, status: "recupere", daysAgo: "2026-08-12" },
];

// on relie les commandes aux plats via les objets structurés dishRecords (jamais de re-parsing de SQL sérialisé)
const dishesByCook = {};
dishRecords.forEach((dish) => {
  dishesByCook[dish.cookId] = dishesByCook[dish.cookId] || [];
  dishesByCook[dish.cookId].push(dish);
});

let orderId = 1;
demoOrders.forEach((o) => {
  const cook = COOKS[o.cookIdx];
  const cookId = `cook-${o.cookIdx + 1}`;
  const cookDishes = dishesByCook[cookId];
  const dish = cookDishes[o.dishOffset % cookDishes.length];
  const total = (dish.price * o.qty).toFixed(2);
  orderRows.push(
    `('order-${orderId}', '${dish.id}', '${esc(dish.name)}', '${dish.photoUrl}', '${cookId}', '${esc(cook.name)}', '${cookAvatars[cookId]}', ${dish.price}, ${o.qty}, ${total}, '${o.status}', '${dish.pickupWindow}', '${o.daysAgo}')`
  );
  orderId++;
});

const schema = `-- Schéma D1 — Voisin Gourmand (démo)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS cooks;

CREATE TABLE cooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  cover_photo_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialty TEXT NOT NULL,
  rating REAL NOT NULL,
  review_count INTEGER NOT NULL,
  arrondissement INTEGER NOT NULL,
  neighborhood TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  pickup_address TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dishes (
  id TEXT PRIMARY KEY,
  cook_id TEXT NOT NULL REFERENCES cooks(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  price REAL NOT NULL,
  quantity_available INTEGER NOT NULL,
  pickup_window TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  cook_id TEXT NOT NULL REFERENCES cooks(id),
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  dish_photo_url TEXT NOT NULL,
  cook_id TEXT NOT NULL,
  cook_name TEXT NOT NULL,
  cook_avatar_url TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL,
  pickup_window TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_dishes_cook ON dishes(cook_id);
CREATE INDEX idx_reviews_cook ON reviews(cook_id);
`;

const seed = `-- Seed de démo — Voisin Gourmand (données 100% fictives, aucun emoji, aucun stéréotype nom/cuisine)
INSERT INTO cooks (id, name, avatar_url, cover_photo_url, bio, specialty, rating, review_count, arrondissement, neighborhood, lat, lng, pickup_address, verified, is_new) VALUES
${cookRows.join(",\n")};

INSERT INTO dishes (id, cook_id, name, description, photo_url, price, quantity_available, pickup_window, category) VALUES
${dishRows.join(",\n")};

INSERT INTO reviews (id, cook_id, author, rating, comment, date) VALUES
${reviewRows.join(",\n")};

INSERT INTO orders (id, dish_id, dish_name, dish_photo_url, cook_id, cook_name, cook_avatar_url, price, quantity, total_price, status, pickup_window, created_at) VALUES
${orderRows.join(",\n")};
`;

writeFileSync(join(DB_DIR, "schema.sql"), schema);
writeFileSync(join(DB_DIR, "seed.sql"), seed);
console.log(
  `Generated ${cookRows.length} cooks (${new Set(COOKS.map((c) => c.specialty)).size} cuisines, 20 arrondissements), ${dishRows.length} dishes, ${reviewRows.length} reviews, ${orderRows.length} orders`
);
