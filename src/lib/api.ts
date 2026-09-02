import type { Cook, Dish, Review, Order, CuisineType } from "../types";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Erreur serveur (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export interface CookListItem extends Cook {
  minPrice: number | null;
  dishCount: number;
  soldOutToday: boolean;
}

export function fetchCooks(filters: { cuisine?: CuisineType; maxPrice?: number; q?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return request<{ cooks: CookListItem[] }>(`/api/cooks${qs ? `?${qs}` : ""}`);
}

export function fetchCookDetail(id: string) {
  return request<{ cook: Cook; dishes: Dish[]; reviews: Review[] }>(`/api/cooks/${id}`);
}

export function fetchDishDetail(id: string) {
  return request<{ dish: Dish; cook: Cook }>(`/api/dishes/${id}`);
}

export function fetchOrders() {
  return request<{ orders: Order[] }>(`/api/orders`);
}

export function placeOrder(dishId: string, quantity: number) {
  return request<{ order: Order; simulated: boolean }>(`/api/orders`, {
    method: "POST",
    body: JSON.stringify({ dishId, quantity }),
  });
}
