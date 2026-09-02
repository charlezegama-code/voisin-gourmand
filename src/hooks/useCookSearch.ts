import { useMemo } from "react";
import { useAsync } from "./useAsync";
import { useUserLocation } from "./useUserLocation";
import { fetchCooks, type CookListItem } from "../lib/api";
import { distanceKm } from "../lib/geo";
import type { Filters } from "../components/FilterBar";

export type SortKey = "rating" | "distance" | "price";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Mieux notés" },
  { key: "distance", label: "Plus proches" },
  { key: "price", label: "Prix croissant" },
];

interface CookSearchResult {
  cook: CookListItem;
  distance: number;
}

export function useCookSearch(filters: Filters, sort: SortKey) {
  const { location } = useUserLocation();

  const { data, loading, error, reload } = useAsync(
    () => fetchCooks(filters),
    [filters.cuisine, filters.maxPrice, filters.q]
  );

  const withDistance = useMemo<CookSearchResult[]>(() => {
    const cooks = data?.cooks ?? [];
    return cooks.map((cook) => ({ cook, distance: distanceKm(location, cook) }));
  }, [data, location]);

  const sorted = useMemo(() => {
    const list = [...withDistance];
    if (sort === "rating") list.sort((a, b) => b.cook.rating - a.cook.rating);
    if (sort === "distance") list.sort((a, b) => a.distance - b.distance);
    if (sort === "price") list.sort((a, b) => (a.cook.minPrice ?? Infinity) - (b.cook.minPrice ?? Infinity));
    return list;
  }, [withDistance, sort]);

  return { results: sorted, rawCooks: data?.cooks ?? [], loading, error, reload };
}
