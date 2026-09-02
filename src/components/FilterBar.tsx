import type { CuisineType } from "../types";

const CUISINES: CuisineType[] = ["Française", "Maghrébine", "Asiatique", "Africaine", "Italienne"];
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
      <input
        type="search"
        inputMode="search"
        placeholder="Chercher un cuisinier, un quartier…"
        value={filters.q ?? ""}
        onChange={(e) => onChange({ ...filters, q: e.target.value || undefined })}
        className="w-full rounded-full border border-terracotta-100 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-ink/40 focus:border-terracotta-300"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => onChange({ ...filters, cuisine: undefined })}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            !filters.cuisine ? "bg-terracotta-500 text-cream" : "bg-white text-ink/70 ring-1 ring-terracotta-100"
          }`}
        >
          Toutes cuisines
        </button>
        {CUISINES.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => onChange({ ...filters, cuisine: filters.cuisine === cuisine ? undefined : cuisine })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filters.cuisine === cuisine
                ? "bg-terracotta-500 text-cream"
                : "bg-white text-ink/70 ring-1 ring-terracotta-100"
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange({ ...filters, maxPrice: opt.value })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filters.maxPrice === opt.value
                ? "bg-sage-500 text-cream"
                : "bg-white text-ink/70 ring-1 ring-sage-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
