export type CuisineType =
  | "Française"
  | "Maghrébine"
  | "Asiatique"
  | "Africaine"
  | "Italienne";

export interface Cook {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  specialty: CuisineType;
  rating: number;
  reviewCount: number;
  arrondissement: number;
  neighborhood: string;
  lat: number;
  lng: number;
  pickupAddress: string;
  verified: boolean;
}

export interface Dish {
  id: string;
  cookId: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
  pickupWindow: string;
  category: CuisineType;
  emoji: string;
}

export interface CookWithDishes extends Cook {
  dishes: Dish[];
}

export interface DishWithCook extends Dish {
  cook: Cook;
}

export interface Review {
  id: string;
  cookId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  dishId: string;
  dishName: string;
  cookId: string;
  cookName: string;
  cookAvatarUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
  status: "recupere" | "confirme";
  pickupWindow: string;
  createdAt: string;
}

export interface CookListFilters {
  cuisine?: CuisineType;
  maxPrice?: number;
  q?: string;
}
