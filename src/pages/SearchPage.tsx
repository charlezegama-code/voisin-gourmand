import { useState } from "react";
import { useCookSearch, SORT_OPTIONS, type SortKey } from "../hooks/useCookSearch";
import { AppHeader } from "../components/AppHeader";
import { FilterBar, type Filters } from "../components/FilterBar";
import { CookGrid } from "../components/CookGrid";

export function SearchPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortKey>("rating");
  const { results, loading, error, reload } = useCookSearch(filters, sort);

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <AppHeader title="Recherche" subtitle="Trouvez votre prochain repas fait maison" />

      <div className="space-y-2.5 px-4 pt-2">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink/50">
            {loading ? "Recherche…" : `${results.length} cuisinier${results.length > 1 ? "s" : ""}`}
          </p>
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
        </div>
      </div>

      <div className="mt-3 px-4">
        <CookGrid results={results} loading={loading} error={error} onRetry={reload} />
      </div>
    </div>
  );
}
