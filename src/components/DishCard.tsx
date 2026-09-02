import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { CuisineIcon } from "../lib/cuisineIcons";
import type { Dish } from "../types";

const MotionLink = motion.create(Link);

export function DishCard({ dish }: { dish: Dish }) {
  const soldOut = dish.quantityAvailable <= 0;

  return (
    <MotionLink
      to={`/plats/${dish.id}`}
      whileHover={soldOut ? undefined : { scale: 1.015 }}
      whileTap={soldOut ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`flex items-center gap-3.5 overflow-hidden rounded-2xl bg-white p-2.5 shadow-[0_2px_10px_-2px_rgba(43,33,25,0.1)] ring-1 ring-terracotta-50 ${
        soldOut ? "opacity-55" : ""
      }`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-100 to-terracotta-200">
        <CuisineIcon cuisine={dish.category} className="h-7 w-7 text-terracotta-600" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-ink">{dish.name}</h4>
        <p className="truncate text-xs text-ink/55">{dish.description}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-sage-600">
          <Clock className="h-3 w-3" strokeWidth={2.5} />
          {dish.pickupWindow}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-terracotta-600">{dish.price.toFixed(2)}€</span>
        {soldOut ? (
          <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-semibold text-ink/50">Épuisé</span>
        ) : (
          <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-semibold text-sage-700">
            {dish.quantityAvailable} dispo
          </span>
        )}
      </div>
    </MotionLink>
  );
}
