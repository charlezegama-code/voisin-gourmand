import { Search } from "lucide-react";
import { CuisineIcon } from "../lib/cuisineIcons";
import type { CuisineType } from "../types";

const CUISINES: CuisineType[] = [
  "Française",
  "Maghrébine",
  "Asiatique",
  "Africaine",
  "Italienne",
  "Libanaise",
  "Indienne",
  "Sud-Américaine",
  "Végétarienne",
];
const PRICE_OPTIONS = [
  { label: "Tous les prix", value: undefined },
  { label: "≤ 10€", value: 10 },
  { label: "≤ 12€", value: 12 },
  { label: "≤ 15€", value: 15 },
];

export interface Filters {
  cuisine?: CuisineType;
  maxPrice?: number;
  q?: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" strokeWidth={2.25} />
        <input
          type="search"
          inputMode="search"
          placeholder="Chercher un cuisinier, un quartier…"
          value={filters.q ?? ""}
          onChange={(e) => onChange({ ...filters, q: e.target.value || undefined })}
          className="w-full rounded-full border border-terracotta-100 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none placeholder:text-ink/40 focus:border-terracotta-300"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => onChange({ ...filters, cuisine: undefined })}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            !filters.cuisine ? "bg-terracotta-600 text-white shadow-sm" : "bg-white text-ink/70 ring-1 ring-terracotta-100"
          }`}
        >
          Toutes cuisines
        </button>
        {CUISINES.map((cuisine) => {
          const active = filters.cuisine === cuisine;
          return (
            <button
              key={cuisine}
              onClick={() => onChange({ ...filters, cuisine: active ? undefined : cuisine })}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active ? "bg-terracotta-600 text-white shadow-sm" : "bg-white text-ink/70 ring-1 ring-terracotta-100"
              }`}
            >
              <CuisineIcon cuisine={cuisine} className="h-3.5 w-3.5" strokeWidth={2.25} />
              {cuisine}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange({ ...filters, maxPrice: opt.value })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filters.maxPrice === opt.value ? "bg-sage-600 text-white shadow-sm" : "bg-white text-ink/70 ring-1 ring-sage-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
