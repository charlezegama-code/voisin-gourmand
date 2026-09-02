import {
  Croissant,
  CookingPot,
  Soup,
  Drumstick,
  Pizza,
  Wheat,
  Flame,
  Beef,
  Salad,
  type LucideIcon,
} from "lucide-react";
import type { CuisineType } from "../types";

// Une icône Lucide par cuisine — jamais d'emoji dans l'UI.
export const CUISINE_ICONS: Record<CuisineType, LucideIcon> = {
  Française: Croissant,
  Maghrébine: CookingPot,
  Asiatique: Soup,
  Africaine: Drumstick,
  Italienne: Pizza,
  Libanaise: Wheat,
  Indienne: Flame,
  "Sud-Américaine": Beef,
  Végétarienne: Salad,
};

export function cuisineIcon(cuisine: string): LucideIcon {
  return CUISINE_ICONS[cuisine as CuisineType] ?? Soup;
}

interface CuisineIconProps {
  cuisine: string;
  className?: string;
  strokeWidth?: number;
}

// Composant stable (pas de résolution "à la volée" dans le JSX des pages) pour satisfaire
// react/no-unstable-components — la variante `cuisineIcon()` reste utilisable hors JSX (icônes Leaflet, etc.).
export function CuisineIcon({ cuisine, className, strokeWidth }: CuisineIconProps) {
  const Icon = cuisineIcon(cuisine);
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
