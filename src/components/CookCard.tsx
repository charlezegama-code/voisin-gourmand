import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck } from "lucide-react";
import { StarRating } from "./StarRating";
import { Badge } from "./Badge";
import { formatDistance } from "../lib/geo";
import { CuisineIcon } from "../lib/cuisineIcons";
import type { CookListItem } from "../lib/api";

const MotionLink = motion.create(Link);

const GRADIENTS = [
  "from-terracotta-400 to-terracotta-600",
  "from-sage-400 to-sage-600",
  "from-terracotta-500 via-terracotta-500 to-sage-600",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

interface CookCardProps {
  cook: CookListItem;
  distanceKm?: number;
}

export function CookCard({ cook, distanceKm }: CookCardProps) {
  return (
    <MotionLink
      to={`/cuisiniers/${cook.id}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="block overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-2px_rgba(43,33,25,0.12)] ring-1 ring-terracotta-50"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${gradientFor(cook.id)}`}>
        <CuisineIcon cuisine={cook.specialty} className="absolute -right-3 -top-3 h-24 w-24 text-white/15" strokeWidth={1.25} />
        <img
          src={cook.avatarUrl}
          alt=""
          className="h-16 w-16 rounded-full object-cover ring-4 ring-white/90"
          loading="lazy"
        />

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {cook.isNew && <Badge tone="new">Nouveau</Badge>}
          {cook.soldOutToday && <Badge tone="soldout">Complet</Badge>}
        </div>
        {cook.verified && (
          <div className="absolute right-2.5 top-2.5">
            <Badge tone="verified" icon={<BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />}>
              Vérifié
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3.5">
        <h3 className="truncate text-[15px] font-bold leading-tight text-ink">{cook.name}</h3>
        <p className="flex items-center gap-1 truncate text-xs text-ink/55">
          <CuisineIcon cuisine={cook.specialty} className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {cook.specialty} · {cook.neighborhood}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <StarRating rating={cook.rating} />
          <span className="text-[11px] text-ink/40">{cook.reviewCount} avis</span>
        </div>
        <div className="flex items-center justify-between pt-0.5 text-xs font-semibold">
          <span className="text-terracotta-600">{cook.minPrice != null ? `dès ${cook.minPrice.toFixed(2)}€` : "—"}</span>
          {distanceKm != null && (
            <span className="flex items-center gap-0.5 text-sage-600">
              <MapPin className="h-3 w-3" strokeWidth={2.5} />
              {formatDistance(distanceKm)}
            </span>
          )}
        </div>
      </div>
    </MotionLink>
  );
}
