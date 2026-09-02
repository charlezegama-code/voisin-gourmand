import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, LayoutGrid } from "lucide-react";
import { useCookSearch, SORT_OPTIONS, type SortKey } from "../hooks/useCookSearch";
import { AppHeader } from "../components/AppHeader";
import { FilterBar, type Filters } from "../components/FilterBar";
import { CookGrid } from "../components/CookGrid";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";

// Leaflet est lourd (~150 kB) et n'est utile qu'en vue "Carte" : chargé à la demande.
const MapView = lazy(() => import("../components/MapView").then((m) => ({ default: m.MapView })));

type ViewMode = "map" | "list";

export function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [view, setView] = useState<ViewMode>("map");
  const [sort, setSort] = useState<SortKey>("rating");
  const { results, rawCooks, loading, error, reload } = useCookSearch(filters, sort);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Voisin Gourmand" subtitle="Des repas faits maison près de chez vous" />

      <div className="space-y-2.5 px-4 pt-2">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-terracotta-100">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "map" ? "bg-terracotta-600 text-white" : "text-ink/60"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
              Carte
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "list" ? "bg-terracotta-600 text-white" : "text-ink/60"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />
              Liste
            </button>
          </div>

          {view === "list" && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink/70 shadow-sm ring-1 ring-terracotta-100"
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
        {loading && view === "map" && <LoadingState label="Recherche des cuisiniers autour de vous…" />}
        {error && !loading && (
          <div className="px-4">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}
        {!error && (
          <>
            {!loading && rawCooks.length > 0 && view === "map" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full w-full">
                <Suspense fallback={<LoadingState label="Chargement de la carte…" />}>
                  <MapView cooks={rawCooks} />
                </Suspense>
              </motion.div>
            )}
            {view === "list" && (
              <div className="h-full overflow-y-auto px-4 pb-6">
                <CookGrid results={results} loading={loading} error={null} onRetry={reload} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
