export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export interface CookRow {
  id: string;
  name: string;
  avatar_url: string;
  cover_photo_url: string;
  bio: string;
  specialty: string;
  rating: number;
  review_count: number;
  arrondissement: number;
  neighborhood: string;
  lat: number;
  lng: number;
  pickup_address: string;
  verified: number;
  is_new: number;
}

export interface DishRow {
  id: string;
  cook_id: string;
  name: string;
  description: string;
  photo_url: string;
  price: number;
  quantity_available: number;
  pickup_window: string;
  category: string;
}

export interface ReviewRow {
  id: string;
  cook_id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface OrderRow {
  id: string;
  dish_id: string;
  dish_name: string;
  dish_photo_url: string;
  cook_id: string;
  cook_name: string;
  cook_avatar_url: string;
  price: number;
  quantity: number;
  total_price: number;
  status: string;
  pickup_window: string;
  created_at: string;
}
