// Génère db/schema.sql et db/seed.sql pour Cloudflare D1.
// Données 100% fictives pour une démo de pitch (aucune vraie personne).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DB_DIR = join(ROOT, "db");

// Centres approximatifs par arrondissement (lat, lng) pour disperser les pins.
const ARR_CENTERS = {
  9: [48.8767, 2.3372],
  10: [48.8709, 2.3606],
  11: [48.8583, 2.38],
  13: [48.8322, 2.3559],
  18: [48.8925, 2.3444],
  19: [48.885, 2.384],
  20: [48.8636, 2.398],
  3: [48.863, 2.362],
};

const NEIGHBORHOODS = {
  9: "Faubourg-Montmartre",
  10: "Canal Saint-Martin",
  11: "Oberkampf",
  13: "Butte-aux-Cailles",
  18: "Montmartre",
  19: "Buttes-Chaumont",
  20: "Belleville",
  3: "Haut-Marais",
};

// jitter déterministe (pas de Math.random pour reproductibilité du seed)
function jitter(seed) {
  const x = Math.sin(seed * 999.77) * 10000;
  return x - Math.floor(x) - 0.5;
}

const COOKS = [
  { name: "Amina Kader", specialty: "Maghrébine", arr: 18, bio: "Couscous et pastillas comme à Fès, recette transmise par ma grand-mère." },
  { name: "Julien Marchand", specialty: "Française", arr: 11, bio: "Bistrot fait-maison : blanquette, gratin dauphinois, tarte tatin." },
  { name: "Thanh Nguyen", specialty: "Asiatique", arr: 10, bio: "Cuisine vietnamienne du quotidien : bo bun, pho, nems croustillants." },
  { name: "Fatou Diallo", specialty: "Africaine", arr: 18, bio: "Saveurs d'Afrique de l'Ouest : mafé, thiéboudienne, beignets." },
  { name: "Marco Ferrari", specialty: "Italienne", arr: 9, bio: "Pâtes fraîches faites le matin même, recettes de ma nonna milanaise." },
  { name: "Chloé Petit", specialty: "Française", arr: 20, bio: "Cuisine de saison, marché du jour, plats mijotés façon grand-mère." },
  { name: "Youssef Bensaid", specialty: "Maghrébine", arr: 19, bio: "Tajines mijotés doucement, épices ramenées de Marrakech." },
  { name: "Mai Tran", specialty: "Asiatique", arr: 13, bio: "Spécialités du sud du Vietnam, fraîcheur et herbes du quartier asiatique." },
  { name: "Ibrahima Sow", specialty: "Africaine", arr: 18, bio: "Riz au poisson, yassa poulet, recettes sénégalaises authentiques." },
  { name: "Sofia Romano", specialty: "Italienne", arr: 11, bio: "Antipasti, risottos crémeux et tiramisu maison." },
  { name: "Nadia Haddad", specialty: "Maghrébine", arr: 20, bio: "Cuisine algérienne conviviale, chorba et bricks croustillantes." },
  { name: "Pierre Lefèvre", specialty: "Française", arr: 10, bio: "Plats bistrot revisités, produits locaux, portions généreuses." },
  { name: "Linh Phạm", specialty: "Asiatique", arr: 19, bio: "Bún chả, rouleaux de printemps et currys parfumés." },
  { name: "Kwame Osei", specialty: "Africaine", arr: 20, bio: "Cuisine ghanéenne épicée, jollof rice et poulet grillé maison." },
  { name: "Elena Conti", specialty: "Italienne", arr: 18, bio: "Focaccia du jour, lasagnes et desserts italiens traditionnels." },
  { name: "Karim Belkacem", specialty: "Maghrébine", arr: 11, bio: "Couscous royal du vendredi, merguez maison, pâtisseries orientales." },
  { name: "Camille Rousseau", specialty: "Française", arr: 9, bio: "Cuisine familiale française, soupes, quiches et clafoutis." },
  { name: "Hana Kimura", specialty: "Asiatique", arr: 3, bio: "Bento faits maison, onigiri et curry japonais réconfortant." },
  { name: "Moussa Traoré", specialty: "Africaine", arr: 19, bio: "Attiéké, alloco et poulet braisé façon Abidjan." },
  { name: "Giulia Bianchi", specialty: "Italienne", arr: 20, bio: "Cuisine romaine simple et généreuse : carbonara, saltimbocca." },
];

const DISH_BANK = {
  Française: [
    ["Blanquette de veau", "Veau mijoté à la crème, riz basmati", "🍲"],
    ["Gratin dauphinois", "Pommes de terre, crème, gruyère gratiné", "🥔"],
    ["Tarte tatin maison", "Pommes caramélisées, pâte croustillante", "🥧"],
    ["Poulet rôti aux herbes", "Pommes de terre fondantes, jus corsé", "🍗"],
    ["Quiche lorraine", "Lardons, œufs, crème fraîche", "🥧"],
    ["Bœuf bourguignon", "Mijoté au vin rouge, carottes, champignons", "🍷"],
  ],
  Maghrébine: [
    ["Couscous royal", "Semoule, merguez, agneau, légumes", "🍛"],
    ["Tajine poulet citron", "Poulet, olives, citron confit", "🍋"],
    ["Pastilla au poulet", "Feuilleté sucré-salé, amandes, cannelle", "🥟"],
    ["Chorba frik", "Soupe traditionnelle, blé vert, agneau", "🍜"],
    ["Brick à l'œuf", "Feuille de brick croustillante, thon, œuf", "🥟"],
    ["Mafé d'agneau", "Sauce cacahuète, riz parfumé", "🥜"],
  ],
  Asiatique: [
    ["Bo bun au bœuf", "Vermicelles, bœuf mariné, herbes fraîches", "🥗"],
    ["Pho traditionnel", "Bouillon longue cuisson, nouilles de riz", "🍜"],
    ["Nems croustillants", "Porc, vermicelles, sauce nuoc-mâm maison", "🥟"],
    ["Bún chả Hanoï", "Porc grillé, vermicelles, herbes", "🍢"],
    ["Curry thaï vert", "Poulet, lait de coco, légumes de saison", "🍛"],
    ["Bento japonais", "Riz, poulet teriyaki, légumes marinés", "🍱"],
  ],
  Africaine: [
    ["Thiéboudienne", "Riz au poisson façon sénégalaise", "🐟"],
    ["Poulet yassa", "Oignons confits, citron, riz blanc", "🍋"],
    ["Mafé poulet", "Sauce cacahuète onctueuse, riz", "🥜"],
    ["Alloco & poulet braisé", "Bananes plantains frites, poulet mariné", "🍌"],
    ["Jollof rice", "Riz épicé façon ghanéenne, poulet grillé", "🍚"],
    ["Attiéké poisson", "Semoule de manioc, poisson grillé", "🐠"],
  ],
  Italienne: [
    ["Tagliatelles au ragù", "Pâtes fraîches, sauce bolognaise mijotée", "🍝"],
    ["Risotto aux champignons", "Riz carnaroli, parmesan, champignons", "🍚"],
    ["Lasagnes maison", "Béchamel, ragù, mozzarella gratinée", "🧀"],
    ["Tiramisu classique", "Mascarpone, café, cacao", "☕"],
    ["Focaccia du jour", "Huile d'olive, romarin, fleur de sel", "🍞"],
    ["Saltimbocca alla romana", "Veau, jambon cru, sauge", "🍽️"],
  ],
};

const PICKUP_WINDOWS = ["12h00 - 13h30", "12h30 - 14h00", "19h00 - 20h30", "19h30 - 21h00", "18h30 - 20h00"];
const STREETS = ["rue de la Fontaine au Roi", "rue des Poissonniers", "rue de la Roquette", "rue Ramponeau", "rue du Faubourg Saint-Denis", "rue Oberkampf", "rue de la Chapelle", "rue de Belleville", "rue Myrha", "rue Sedaine", "avenue Simon Bolivar", "rue de la Butte-aux-Cailles"];

const REVIEW_AUTHORS = ["Léa", "Antoine", "Sarah", "Hugo", "Manon", "Yanis", "Inès", "Paul", "Lucie", "Nathan", "Zoé", "Adam"];
const REVIEW_COMMENTS = [
  "Un vrai goût de fait-maison, on sent l'amour dans le plat.",
  "Portions généreuses et super accueil au retrait.",
  "Exactement comme chez ma grand-mère, je recommande !",
  "Plat encore chaud, emballage soigné, parfait.",
  "Un peu d'attente mais ça valait le coup, très bon.",
  "Découverte du quartier, je recommande à 100%.",
  "Rapport qualité-prix excellent pour Paris.",
  "Épices bien dosées, très parfumé sans être trop relevé.",
];

function esc(s) {
  return String(s).replace(/'/g, "''");
}

let cookRows = [];
let dishRows = [];
let reviewRows = [];
let orderRows = [];
let dishId = 1;
let reviewId = 1;

COOKS.forEach((c, i) => {
  const id = `cook-${i + 1}`;
  const [baseLat, baseLng] = ARR_CENTERS[c.arr];
  const lat = (baseLat + jitter(i + 1) * 0.012).toFixed(6);
  const lng = (baseLng + jitter(i + 47) * 0.012).toFixed(6);
  const rating = (4.2 + (Math.abs(jitter(i + 3)) * 1.6)).toFixed(1);
  const cappedRating = Math.min(5.0, Number(rating)).toFixed(1);
  const reviewCount = 8 + Math.floor(Math.abs(jitter(i + 11)) * 60);
  const street = STREETS[i % STREETS.length];
  const streetNum = 2 + (i * 7) % 130;

  cookRows.push(
    `('${id}', '${esc(c.name)}', '/avatars/cook-${i + 1}.png', '${esc(c.bio)}', '${c.specialty}', ${cappedRating}, ${reviewCount}, ${c.arr}, '${esc(NEIGHBORHOODS[c.arr])}', ${lat}, ${lng}, '${streetNum} ${esc(street)}, 750${String(c.arr).padStart(2, "0")} Paris', ${i % 4 === 0 ? 1 : 0})`
  );

  // 2 à 3 plats par cuisinier, piochés dans la banque de sa spécialité
  const bank = DISH_BANK[c.specialty];
  const dishCount = 2 + (i % 2);
  for (let d = 0; d < dishCount; d++) {
    const [name, desc, emoji] = bank[(i + d) % bank.length];
    const price = (9 + ((i * 3 + d * 2) % 7)).toFixed(2); // 9.00 - 15.00€
    const qty = 2 + ((i + d) % 5);
    const window = PICKUP_WINDOWS[(i + d) % PICKUP_WINDOWS.length];
    dishRows.push(
      `('dish-${dishId}', '${id}', '${esc(name)}', '${esc(desc)}', ${price}, ${qty}, '${window}', '${c.specialty}', '${emoji}')`
    );
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
  { cookIdx: 12, dishOffset: 0, qty: 1, status: "recupere", daysAgo: "2026-08-12" },
];

// on retrouve les dishRows générées pour lier proprement les commandes
const dishesByCook = {};
dishRows.forEach((row) => {
  const cookId = row.split(", ")[1].replace(/'/g, "");
  dishesByCook[cookId] = dishesByCook[cookId] || [];
  dishesByCook[cookId].push(row);
});

let orderId = 1;
demoOrders.forEach((o) => {
  const cook = COOKS[o.cookIdx];
  const cookId = `cook-${o.cookIdx + 1}`;
  const cookDishes = dishesByCook[cookId];
  const dishRow = cookDishes[o.dishOffset % cookDishes.length];
  const cols = dishRow.match(/'[^']*'|[\d.]+/g);
  const dId = cols[0].replace(/'/g, "");
  const dName = cols[2].replace(/'/g, "");
  const price = Number(cols[4]);
  const total = (price * o.qty).toFixed(2);
  orderRows.push(
    `('order-${orderId}', '${dId}', '${esc(dName)}', '${cookId}', '${esc(cook.name)}', '/avatars/cook-${o.cookIdx + 1}.png', ${price}, ${o.qty}, ${total}, '${o.status}', '${PICKUP_WINDOWS[o.cookIdx % PICKUP_WINDOWS.length]}', '${o.daysAgo}')`
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
  verified INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dishes (
  id TEXT PRIMARY KEY,
  cook_id TEXT NOT NULL REFERENCES cooks(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  quantity_available INTEGER NOT NULL,
  pickup_window TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT NOT NULL
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

const seed = `-- Seed de démo — Voisin Gourmand (données 100% fictives)
INSERT INTO cooks (id, name, avatar_url, bio, specialty, rating, review_count, arrondissement, neighborhood, lat, lng, pickup_address, verified) VALUES
${cookRows.join(",\n")};

INSERT INTO dishes (id, cook_id, name, description, price, quantity_available, pickup_window, category, emoji) VALUES
${dishRows.join(",\n")};

INSERT INTO reviews (id, cook_id, author, rating, comment, date) VALUES
${reviewRows.join(",\n")};

INSERT INTO orders (id, dish_id, dish_name, cook_id, cook_name, cook_avatar_url, price, quantity, total_price, status, pickup_window, created_at) VALUES
${orderRows.join(",\n")};
`;

writeFileSync(join(DB_DIR, "schema.sql"), schema);
writeFileSync(join(DB_DIR, "seed.sql"), seed);
console.log(`Generated ${cookRows.length} cooks, ${dishRows.length} dishes, ${reviewRows.length} reviews, ${orderRows.length} orders`);
