import { motion } from "framer-motion";
import { CookCard } from "./CookCard";
import { CookCardSkeletonGrid } from "./Skeletons";
import { ErrorState } from "./ErrorState";
import type { CookListItem } from "../lib/api";

interface CookGridProps {
  results: { cook: CookListItem; distance: number }[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyMessage?: string;
}

export function CookGrid({ results, loading, error, onRetry, emptyMessage }: CookGridProps) {
  if (loading) return <CookCardSkeletonGrid />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (results.length === 0) {
    return <ErrorState message={emptyMessage ?? "Aucun cuisinier ne correspond à votre recherche pour l'instant."} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {results.map(({ cook, distance }, i) => (
        <motion.div
          key={cook.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
        >
          <CookCard cook={cook} distanceKm={distance} />
        </motion.div>
      ))}
    </div>
  );
}
