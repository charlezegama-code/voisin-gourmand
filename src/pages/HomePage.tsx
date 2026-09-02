import { useMemo, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { useUserLocation } from "../hooks/useUserLocation";
import { fetchCooks } from "../lib/api";
import { distanceKm } from "../lib/geo";
import { AppHeader } from "../components/AppHeader";
import { FilterBar, type Filters } from "../components/FilterBar";
import { MapView } from "../components/MapView";
import { CookCard } from "../components/CookCard";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";

type SortKey = "rating" | "distance" | "price";
type ViewMode = "map" | "list";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Mieux notés" },
  { key: "distance", label: "Plus proches" },
  { key: "price", label: "Prix croissant" },
];

export function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [view, setView] = useState<ViewMode>("map");
  const [sort, setSort] = useState<SortKey>("rating");
  const { location } = useUserLocation();

  const { data, loading, error, reload } = useAsync(() => fetchCooks(filters), [filters.cuisine, filters.maxPrice, filters.q]);

  const cooksWithDistance = useMemo(() => {
    const cooks = data?.cooks ?? [];
    return cooks.map((cook) => ({ cook, distance: distanceKm(location, cook) }));
  }, [data, location]);

  const sorted = useMemo(() => {
    const list = [...cooksWithDistance];
    if (sort === "rating") list.sort((a, b) => b.cook.rating - a.cook.rating);
    if (sort === "distance") list.sort((a, b) => a.distance - b.distance);
    if (sort === "price") list.sort((a, b) => (a.cook.minPrice ?? Infinity) - (b.cook.minPrice ?? Infinity));
    return list;
  }, [cooksWithDistance, sort]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Voisin Gourmand" subtitle="Des repas faits maison près de chez vous" />

      <div className="space-y-2.5 px-4 pt-2">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-terracotta-100">
            <button
              onClick={() => setView("map")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                view === "map" ? "bg-terracotta-500 text-cream" : "text-ink/60"
              }`}
            >
              Carte
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                view === "list" ? "bg-terracotta-500 text-cream" : "text-ink/60"
              }`}
            >
              Liste
            </button>
          </div>

          {view === "list" && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-terracotta-100"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex-1 overflow-hidden">
        {loading && <LoadingState label="Recherche des cuisiniers autour de vous…" />}
        {error && !loading && (
          <div className="px-4">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}
        {!loading && !error && data && (
          <>
            {data.cooks.length === 0 && (
              <div className="px-4">
                <ErrorState message="Aucun cuisinier ne correspond à votre recherche pour l'instant." />
              </div>
            )}
            {data.cooks.length > 0 && view === "map" && (
              <div className="h-full w-full">
                <MapView cooks={data.cooks} />
              </div>
            )}
            {data.cooks.length > 0 && view === "list" && (
              <div className="h-full space-y-2.5 overflow-y-auto px-4 pb-6">
                {sorted.map(({ cook, distance }) => (
                  <CookCard key={cook.id} cook={cook} distanceKm={distance} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
