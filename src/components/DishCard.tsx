import { Link } from "react-router-dom";
import type { Dish } from "../types";

export function DishCard({ dish }: { dish: Dish }) {
  const soldOut = dish.quantityAvailable <= 0;

  return (
    <Link
      to={`/plats/${dish.id}`}
      className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50 transition ${
        soldOut ? "opacity-60" : "active:scale-[0.98]"
      }`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-terracotta-50 text-2xl">
        {dish.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold text-ink">{dish.name}</h4>
        <p className="truncate text-xs text-ink/60">{dish.description}</p>
        <p className="mt-0.5 text-xs text-sage-600">Retrait {dish.pickupWindow}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-semibold text-terracotta-600">{dish.price.toFixed(2)}€</span>
        {soldOut ? (
          <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-medium text-ink/50">Épuisé</span>
        ) : (
          <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700">
            {dish.quantityAvailable} dispo
          </span>
        )}
      </div>
    </Link>
  );
}
