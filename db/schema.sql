-- Schéma D1 — Voisin Gourmand (démo)
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
