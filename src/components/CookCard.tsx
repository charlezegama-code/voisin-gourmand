import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";
import { formatDistance } from "../lib/geo";
import type { CookListItem } from "../lib/api";

interface CookCardProps {
  cook: CookListItem;
  distanceKm?: number;
}

export function CookCard({ cook, distanceKm }: CookCardProps) {
  return (
    <Link
      to={`/cuisiniers/${cook.id}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50 transition active:scale-[0.98]"
    >
      <img
        src={cook.avatarUrl}
        alt={cook.name}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-ink">{cook.name}</h3>
            {cook.verified && (
              <span title="Cuisinier vérifié" className="text-sage-500">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-ink/60">
            {cook.specialty} · {cook.neighborhood} ({cook.arrondissement}e)
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <StarRating rating={cook.rating} />
          <span className="text-ink/50">{cook.reviewCount} avis</span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-terracotta-600">
            {cook.minPrice != null ? `dès ${cook.minPrice.toFixed(2)}€` : "—"}
          </span>
          {distanceKm != null && <span className="text-sage-600">{formatDistance(distanceKm)}</span>}
        </div>
      </div>
    </Link>
  );
}
