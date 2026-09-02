import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env, CookRow, DishRow, ReviewRow, OrderRow } from "./types";
import { mapCook, mapDish, mapReview, mapOrder } from "./mappers";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Une erreur est survenue côté serveur." }, 500);
});

// GET /api/cooks — liste des cuisiniers pour la carte/recherche, avec filtres
app.get("/api/cooks", async (c) => {
  const cuisine = c.req.query("cuisine");
  const maxPrice = c.req.query("maxPrice");
  const q = c.req.query("q");

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (cuisine) {
    conditions.push("cooks.specialty = ?");
    params.push(cuisine);
  }
  if (q) {
    conditions.push("(cooks.name LIKE ? OR cooks.specialty LIKE ? OR cooks.neighborhood LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await c.env.DB.prepare(
    `SELECT cooks.*, MIN(dishes.price) as min_price, COUNT(dishes.id) as dish_count,
            COALESCE(SUM(dishes.quantity_available), 0) as total_available
     FROM cooks
     LEFT JOIN dishes ON dishes.cook_id = cooks.id
     ${where}
     GROUP BY cooks.id
     ORDER BY cooks.rating DESC`
  )
    .bind(...params)
    .all<CookRow & { min_price: number; dish_count: number; total_available: number }>();

  let cooks = results.map((row) => ({
    ...mapCook(row),
    minPrice: row.min_price,
    dishCount: row.dish_count,
    soldOutToday: row.dish_count > 0 && row.total_available === 0,
  }));

  if (maxPrice) {
    const max = Number(maxPrice);
    cooks = cooks.filter((cook) => cook.minPrice != null && cook.minPrice <= max);
  }

  return c.json({ cooks });
});

// GET /api/cooks/:id — fiche cuisinier complète (plats + avis)
app.get("/api/cooks/:id", async (c) => {
  const id = c.req.param("id");

  const cookRow = await c.env.DB.prepare("SELECT * FROM cooks WHERE id = ?").bind(id).first<CookRow>();
  if (!cookRow) return c.json({ error: "Cuisinier introuvable." }, 404);

  const [{ results: dishRows }, { results: reviewRows }] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM dishes WHERE cook_id = ?").bind(id).all<DishRow>(),
    c.env.DB.prepare("SELECT * FROM reviews WHERE cook_id = ? ORDER BY date DESC").bind(id).all<ReviewRow>(),
  ]);

  return c.json({
    cook: mapCook(cookRow),
    dishes: dishRows.map(mapDish),
    reviews: reviewRows.map(mapReview),
  });
});

// GET /api/dishes/:id — détail d'un plat + info du cuisinier
app.get("/api/dishes/:id", async (c) => {
  const id = c.req.param("id");

  const dishRow = await c.env.DB.prepare("SELECT * FROM dishes WHERE id = ?").bind(id).first<DishRow>();
  if (!dishRow) return c.json({ error: "Plat introuvable." }, 404);

  const cookRow = await c.env.DB.prepare("SELECT * FROM cooks WHERE id = ?").bind(dishRow.cook_id).first<CookRow>();
  if (!cookRow) return c.json({ error: "Cuisinier introuvable." }, 404);

  return c.json({ dish: mapDish(dishRow), cook: mapCook(cookRow) });
});

// GET /api/orders — historique factice de l'utilisateur démo
app.get("/api/orders", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all<OrderRow>();
  return c.json({ orders: results.map(mapOrder) });
});

// POST /api/orders — simule une commande (paiement factice, clairement indiqué côté front)
app.post("/api/orders", async (c) => {
  const body = await c.req.json<{ dishId?: string; quantity?: number }>().catch(() => null);
  if (!body?.dishId || !body.quantity || body.quantity < 1) {
    return c.json({ error: "Requête de commande invalide." }, 400);
  }

  const dishRow = await c.env.DB.prepare("SELECT * FROM dishes WHERE id = ?").bind(body.dishId).first<DishRow>();
  if (!dishRow) return c.json({ error: "Plat introuvable." }, 404);
  if (dishRow.quantity_available < body.quantity) {
    return c.json({ error: "Quantité demandée indisponible." }, 409);
  }

  const cookRow = await c.env.DB.prepare("SELECT * FROM cooks WHERE id = ?").bind(dishRow.cook_id).first<CookRow>();
  if (!cookRow) return c.json({ error: "Cuisinier introuvable." }, 404);

  const orderId = `order-demo-${crypto.randomUUID().slice(0, 8)}`;
  const total = dishRow.price * body.quantity;
  const now = new Date().toISOString();

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO orders (id, dish_id, dish_name, cook_id, cook_name, cook_avatar_url, price, quantity, total_price, status, pickup_window, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirme', ?, ?)`
    ).bind(
      orderId,
      dishRow.id,
      dishRow.name,
      cookRow.id,
      cookRow.name,
      cookRow.avatar_url,
      dishRow.price,
      body.quantity,
      total,
      dishRow.pickup_window,
      now
    ),
    c.env.DB.prepare("UPDATE dishes SET quantity_available = quantity_available - ? WHERE id = ?").bind(
      body.quantity,
      dishRow.id
    ),
  ]);

  return c.json(
    {
      order: {
        id: orderId,
        dishId: dishRow.id,
        dishName: dishRow.name,
        cookId: cookRow.id,
        cookName: cookRow.name,
        cookAvatarUrl: cookRow.avatar_url,
        price: dishRow.price,
        quantity: body.quantity,
        totalPrice: total,
        status: "confirme",
        pickupWindow: dishRow.pickup_window,
        createdAt: now,
      },
      simulated: true,
    },
    201
  );
});

// Tout le reste : sert le front (SPA) via le binding Assets
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
