import type { CookRow, DishRow, ReviewRow, OrderRow } from "./types";

export function mapCook(row: CookRow) {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    specialty: row.specialty,
    rating: row.rating,
    reviewCount: row.review_count,
    arrondissement: row.arrondissement,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    pickupAddress: row.pickup_address,
    verified: row.verified === 1,
  };
}

export function mapDish(row: DishRow) {
  return {
    id: row.id,
    cookId: row.cook_id,
    name: row.name,
    description: row.description,
    price: row.price,
    quantityAvailable: row.quantity_available,
    pickupWindow: row.pickup_window,
    category: row.category,
    emoji: row.emoji,
  };
}

export function mapReview(row: ReviewRow) {
  return {
    id: row.id,
    cookId: row.cook_id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    date: row.date,
  };
}

export function mapOrder(row: OrderRow) {
  return {
    id: row.id,
    dishId: row.dish_id,
    dishName: row.dish_name,
    cookId: row.cook_id,
    cookName: row.cook_name,
    cookAvatarUrl: row.cook_avatar_url,
    price: row.price,
    quantity: row.quantity,
    totalPrice: row.total_price,
    status: row.status,
    pickupWindow: row.pickup_window,
    createdAt: row.created_at,
  };
}
