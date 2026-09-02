// Génère db/schema.sql et db/seed.sql pour Cloudflare D1.
// Données 100% fictives pour une démo de pitch (aucune vraie personne, aucun emoji).
import { writeFileSync } from "node:fs";
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

// 45 cuisiniers fictifs — noms et spécialités reflétant la diversité culinaire parisienne.
// L'arrondissement est assigné plus bas par rotation sur les 20 arrondissements.
const COOKS = [
  { name: "Amina Kader", specialty: "Maghrébine", bio: "Couscous et pastillas comme à Fès, recette transmise par ma grand-mère." },
  { name: "Julien Marchand", specialty: "Française", bio: "Bistrot fait-maison : blanquette, gratin dauphinois, tarte tatin." },
  { name: "Thanh Nguyen", specialty: "Asiatique", bio: "Cuisine vietnamienne du quotidien : bo bun, pho, nems croustillants." },
  { name: "Fatou Diallo", specialty: "Africaine", bio: "Saveurs d'Afrique de l'Ouest : mafé, thiéboudienne, beignets." },
  { name: "Marco Ferrari", specialty: "Italienne", bio: "Pâtes fraîches faites le matin même, recettes de ma nonna milanaise." },
  { name: "Chloé Petit", specialty: "Française", bio: "Cuisine de saison, marché du jour, plats mijotés façon grand-mère." },
  { name: "Youssef Bensaid", specialty: "Maghrébine", bio: "Tajines mijotés doucement, épices ramenées de Marrakech." },
  { name: "Mai Tran", specialty: "Asiatique", bio: "Spécialités du sud du Vietnam, fraîcheur et herbes du quartier asiatique." },
  { name: "Ibrahima Sow", specialty: "Africaine", bio: "Riz au poisson, yassa poulet, recettes sénégalaises authentiques." },
  { name: "Sofia Romano", specialty: "Italienne", bio: "Antipasti, risottos crémeux et tiramisu maison." },
  { name: "Nadia Haddad", specialty: "Maghrébine", bio: "Cuisine algérienne conviviale, chorba et bricks croustillantes." },
  { name: "Pierre Lefèvre", specialty: "Française", bio: "Plats bistrot revisités, produits locaux, portions généreuses." },
  { name: "Linh Phạm", specialty: "Asiatique", bio: "Bún chả, rouleaux de printemps et currys parfumés." },
  { name: "Kwame Osei", specialty: "Africaine", bio: "Cuisine ghanéenne épicée, jollof rice et poulet grillé maison." },
  { name: "Elena Conti", specialty: "Italienne", bio: "Focaccia du jour, lasagnes et desserts italiens traditionnels." },
  { name: "Karim Belkacem", specialty: "Maghrébine", bio: "Couscous royal du vendredi, merguez maison, pâtisseries orientales." },
  { name: "Camille Rousseau", specialty: "Française", bio: "Cuisine familiale française, soupes, quiches et clafoutis." },
  { name: "Hana Kimura", specialty: "Asiatique", bio: "Bento faits maison, onigiri et curry japonais réconfortant." },
  { name: "Moussa Traoré", specialty: "Africaine", bio: "Attiéké, alloco et poulet braisé façon Abidjan." },
  { name: "Giulia Bianchi", specialty: "Italienne", bio: "Cuisine romaine simple et généreuse : carbonara, saltimbocca." },
  { name: "Rami Nassar", specialty: "Libanaise", bio: "Mezze maison, taboulé au vrai persil, houmous crémeux." },
  { name: "Léa Salamé", specialty: "Libanaise", bio: "Manakish du matin, kebbé et fattouche croquant." },
  { name: "Priya Sharma", specialty: "Indienne", bio: "Curry du Nord de l'Inde, pain naan cuit à la poêle, épices torréfiées maison." },
  { name: "Arjun Mehta", specialty: "Indienne", bio: "Cuisine du Pendjab, dahl mijoté longuement, riz basmati parfumé." },
  { name: "Camila Rodrigues", specialty: "Sud-Américaine", bio: "Feijoada brésilienne du dimanche, farofa croustillante." },
  { name: "Diego Fernández", specialty: "Sud-Américaine", bio: "Empanadas argentines, asado maison, chimichurri frais." },
  { name: "Manon Girard", specialty: "Végétarienne", bio: "Bowls colorés, légumineuses de saison, cuisine 100% végétale gourmande." },
  { name: "Théo Dubois", specialty: "Végétarienne", bio: "Burgers végé maison, légumes rôtis, sauces fermentées." },
  { name: "Yuki Sato", specialty: "Asiatique", bio: "Onigiri, ramen maison et curry japonais réconfortant." },
  { name: "Siriporn Boonmee", specialty: "Asiatique", bio: "Cuisine thaïlandaise authentique : pad thaï, curry vert, som tam." },
  { name: "Wei Chen", specialty: "Asiatique", bio: "Cuisine chinoise du Sichuan, raviolis maison, saveurs relevées." },
  { name: "Aïcha Ndiaye", specialty: "Africaine", bio: "Cuisine sénégalaise généreuse, poisson braisé et légumes mijotés." },
  { name: "Samuel Kouassi", specialty: "Africaine", bio: "Spécialités ivoiriennes, garba et sauce graine maison." },
  { name: "Antoine Bernard", specialty: "Française", bio: "Terrine maison, coq au vin, mousse au chocolat de grand-mère." },
  { name: "Isabelle Lambert", specialty: "Française", bio: "Cuisine bourguignonne, œufs meurette, fromages affinés." },
  { name: "Farid Amrani", specialty: "Maghrébine", bio: "Tajines aux fruits secs, couscous du vendredi en famille." },
  { name: "Yasmine Cherif", specialty: "Maghrébine", bio: "Pâtisseries orientales maison, cornes de gazelle, makrouts au miel." },
  { name: "Luca Moretti", specialty: "Italienne", bio: "Pizza napolitaine à la pâte longuement fermentée, four maison." },
  { name: "Chiara Esposito", specialty: "Italienne", bio: "Arancini croustillants, caponata sicilienne, cannoli maison." },
  { name: "Omar Haddad", specialty: "Libanaise", bio: "Chawarma maison, falafels croustillants, sauce toum onctueuse." },
  { name: "Ravi Iyer", specialty: "Indienne", bio: "Cuisine du Sud de l'Inde, dosa croustillante, sambar parfumé." },
  { name: "Valentina Torres", specialty: "Sud-Américaine", bio: "Ceviche péruvien frais, arepas colombiennes maison." },
  { name: "Noémie Faure", specialty: "Végétarienne", bio: "Cuisine végétarienne créative, galettes de légumineuses, houmous maison." },
  { name: "Baptiste Roy", specialty: "Française", bio: "Cuisine de bistrot revisitée, produits de saison, portions généreuses." },
  { name: "Salma Bakr", specialty: "Maghrébine", bio: "Cuisine tunisienne relevée, brik à l'œuf, méchouia maison." },
];

// Banque de plats par spécialité — nom + description uniquement, aucun emoji (icônes Lucide gérées côté front).
const DISH_BANK = {
  Française: [
    ["Blanquette de veau", "Veau mijoté à la crème, riz basmati"],
    ["Gratin dauphinois", "Pommes de terre, crème, gruyère gratiné"],
    ["Tarte tatin maison", "Pommes caramélisées, pâte croustillante"],
    ["Poulet rôti aux herbes", "Pommes de terre fondantes, jus corsé"],
    ["Quiche lorraine", "Lardons, œufs, crème fraîche"],
    ["Bœuf bourguignon", "Mijoté au vin rouge, carottes, champignons"],
    ["Coq au vin", "Mijoté au vin rouge, lardons, champignons"],
  ],
  Maghrébine: [
    ["Couscous royal", "Semoule, merguez, agneau, légumes"],
    ["Tajine poulet citron", "Poulet, olives, citron confit"],
    ["Pastilla au poulet", "Feuilleté sucré-salé, amandes, cannelle"],
    ["Chorba frik", "Soupe traditionnelle, blé vert, agneau"],
    ["Brick à l'œuf", "Feuille de brick croustillante, thon, œuf"],
    ["Mafé d'agneau", "Sauce cacahuète, riz parfumé"],
    ["Cornes de gazelle", "Pâtisserie feuilletée aux amandes"],
  ],
  Asiatique: [
    ["Bo bun au bœuf", "Vermicelles, bœuf mariné, herbes fraîches"],
    ["Pho traditionnel", "Bouillon longue cuisson, nouilles de riz"],
    ["Nems croustillants", "Porc, vermicelles, sauce nuoc-mâm maison"],
    ["Bún chả Hanoï", "Porc grillé, vermicelles, herbes"],
    ["Curry thaï vert", "Poulet, lait de coco, légumes de saison"],
    ["Bento japonais", "Riz, poulet teriyaki, légumes marinés"],
    ["Pad thaï crevettes", "Nouilles sautées, cacahuètes, citron vert"],
    ["Raviolis vapeur", "Porc et ciboulette, sauce soja maison"],
  ],
  Africaine: [
    ["Thiéboudienne", "Riz au poisson façon sénégalaise"],
    ["Poulet yassa", "Oignons confits, citron, riz blanc"],
    ["Mafé poulet", "Sauce cacahuète onctueuse, riz"],
    ["Alloco & poulet braisé", "Bananes plantains frites, poulet mariné"],
    ["Jollof rice", "Riz épicé façon ghanéenne, poulet grillé"],
    ["Attiéké poisson", "Semoule de manioc, poisson grillé"],
    ["Garba maison", "Attiéké, thon frit, sauce pimentée"],
  ],
  Italienne: [
    ["Tagliatelles au ragù", "Pâtes fraîches, sauce bolognaise mijotée"],
    ["Risotto aux champignons", "Riz carnaroli, parmesan, champignons"],
    ["Lasagnes maison", "Béchamel, ragù, mozzarella gratinée"],
    ["Tiramisu classique", "Mascarpone, café, cacao"],
    ["Focaccia du jour", "Huile d'olive, romarin, fleur de sel"],
    ["Saltimbocca alla romana", "Veau, jambon cru, sauge"],
    ["Pizza napolitaine", "Pâte longue fermentation, tomate, mozzarella"],
    ["Arancini", "Boulettes de riz frites, cœur mozzarella"],
  ],
  Libanaise: [
    ["Mezze maison", "Houmous, moutabal, taboulé, falafels"],
    ["Taboulé au persil", "Persil, boulgour, tomate, citron"],
    ["Chawarma poulet", "Poulet mariné, sauce toum, pain pita"],
    ["Kebbé frit", "Boulgour, viande épicée, pignons"],
    ["Manakish za'atar", "Pain plat, za'atar, huile d'olive"],
    ["Fattouche", "Salade croquante, pain grillé, grenade"],
  ],
  Indienne: [
    ["Butter chicken", "Poulet, sauce tomate épicée, crème"],
    ["Dahl de lentilles", "Lentilles corail, épices torréfiées"],
    ["Naan maison", "Pain plat cuit à la poêle"],
    ["Curry d'agneau", "Agneau mijoté, riz basmati"],
    ["Dosa croustillante", "Crêpe de riz, sambar, chutney coco"],
    ["Biryani au poulet", "Riz basmati parfumé, épices, poulet"],
  ],
  "Sud-Américaine": [
    ["Empanadas maison", "Chaussons farcis viande ou légumes"],
    ["Ceviche péruvien", "Poisson mariné citron vert, coriandre"],
    ["Feijoada", "Ragoût de haricots noirs, riz, farofa"],
    ["Arepas colombiennes", "Galette de maïs, garniture au choix"],
    ["Asado maison", "Viande grillée, chimichurri frais"],
    ["Tacos al pastor", "Porc mariné, ananas, coriandre"],
  ],
  Végétarienne: [
    ["Bowl bouddha", "Légumineuses, céréales, légumes rôtis"],
    ["Burger végétal maison", "Galette de légumineuses, pain brioché"],
    ["Curry de légumes", "Lait de coco, légumes de saison"],
    ["Houmous & falafels", "Pois chiches, tahini, pain pita"],
    ["Galette de lentilles", "Lentilles corail, épices, sauce yaourt"],
    ["Salade de quinoa", "Quinoa, légumes croquants, vinaigrette maison"],
  ],
};

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

  cookRows.push(
    `('${id}', '${esc(c.name)}', '/avatars/cook-${i + 1}.png', '${esc(c.bio)}', '${c.specialty}', ${rating}, ${reviewCount}, ${arr}, '${esc(NEIGHBORHOODS[arr])}', ${lat}, ${lng}, '${streetNum} ${esc(street)}, 750${String(arr).padStart(2, "0")} Paris', ${verified}, ${isNew})`
  );

  // 1 à 5 plats par cuisinier (variation volontaire pour des cartes moins uniformes)
  const bank = DISH_BANK[c.specialty];
  const dishCount = 1 + Math.floor(jitterAbs(i * 3 + 7) * 5); // 1 à 5
  const soldOut = SOLD_OUT_TODAY.has(i);
  for (let d = 0; d < dishCount; d++) {
    const [name, desc] = bank[(i + d) % bank.length];
    const price = (9 + ((i * 3 + d * 2) % 7)).toFixed(2); // 9.00 - 15.00€
    const qty = soldOut ? 0 : 1 + ((i + d) % 6);
    const window = PICKUP_WINDOWS[(i + d) % PICKUP_WINDOWS.length];
    const thisDishId = `dish-${dishId}`;
    dishRows.push(
      `('${thisDishId}', '${id}', '${esc(name)}', '${esc(desc)}', ${price}, ${qty}, '${window}', '${c.specialty}')`
    );
    dishRecords.push({ id: thisDishId, cookId: id, name, price: Number(price), pickupWindow: window });
    dishId++;
  }

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
    `('order-${orderId}', '${dish.id}', '${esc(dish.name)}', '${cookId}', '${esc(cook.name)}', '/avatars/cook-${o.cookIdx + 1}.png', ${dish.price}, ${o.qty}, ${total}, '${o.status}', '${dish.pickupWindow}', '${o.daysAgo}')`
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

const seed = `-- Seed de démo — Voisin Gourmand (données 100% fictives, aucun emoji)
INSERT INTO cooks (id, name, avatar_url, bio, specialty, rating, review_count, arrondissement, neighborhood, lat, lng, pickup_address, verified, is_new) VALUES
${cookRows.join(",\n")};

INSERT INTO dishes (id, cook_id, name, description, price, quantity_available, pickup_window, category) VALUES
${dishRows.join(",\n")};

INSERT INTO reviews (id, cook_id, author, rating, comment, date) VALUES
${reviewRows.join(",\n")};

INSERT INTO orders (id, dish_id, dish_name, cook_id, cook_name, cook_avatar_url, price, quantity, total_price, status, pickup_window, created_at) VALUES
${orderRows.join(",\n")};
`;

writeFileSync(join(DB_DIR, "schema.sql"), schema);
writeFileSync(join(DB_DIR, "seed.sql"), seed);
console.log(
  `Generated ${cookRows.length} cooks (${new Set(COOKS.map((c) => c.specialty)).size} cuisines, 20 arrondissements), ${dishRows.length} dishes, ${reviewRows.length} reviews, ${orderRows.length} orders`
);
