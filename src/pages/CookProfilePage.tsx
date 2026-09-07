import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAsync } from "../hooks/useAsync";
import { fetchCookDetail } from "../lib/api";
import { StarRating } from "../components/StarRating";
import { DishCard } from "../components/DishCard";
import { Badge } from "../components/Badge";
import { ProfileHeaderSkeleton, DishCardSkeleton } from "../components/Skeletons";
import { ErrorState } from "../components/ErrorState";
import { ProgressiveImage } from "../components/ProgressiveImage";

export function CookProfilePage() {
  const { id = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => fetchCookDetail(id), [id]);

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-8">
      <div className="absolute left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-10">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-terracotta-100"
          aria-label="Retour"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-ink" strokeWidth={2.25} />
        </Link>
      </div>

      {loading && (
        <div className="pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <ProfileHeaderSkeleton />
          <div className="mt-6 space-y-2.5 px-4">
            <DishCardSkeleton />
            <DishCardSkeleton />
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="px-4 pt-20">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative flex h-64 items-end px-4 pb-4"
          >
            <ProgressiveImage
              src={data.cook.coverPhotoUrl}
              alt=""
              wrapperClassName="absolute inset-0"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] flex gap-1.5">
              {data.cook.isNew && <Badge tone="new">Nouveau</Badge>}
            </div>
            <div className="relative flex items-end gap-3.5">
              <img
                src={data.cook.avatarUrl}
                alt={data.cook.name}
                className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-white/90"
              />
              <div className="min-w-0 pb-1 text-white">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-xl font-bold drop-shadow-sm">{data.cook.name}</h1>
                  {data.cook.verified && <BadgeCheck className="h-4.5 w-4.5 shrink-0" strokeWidth={2.5} />}
                </div>
                <p className="truncate text-sm text-white/90 drop-shadow-sm">
                  {data.cook.specialty} · {data.cook.neighborhood} ({data.cook.arrondissement}e)
                </p>
              </div>
            </div>
          </motion.div>

          <div className="px-4 pt-3.5">
            <div className="flex items-center gap-1.5">
              <StarRating rating={data.cook.rating} size="md" />
              <span className="text-xs text-ink/50">({data.cook.reviewCount} avis)</span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink/80">{data.cook.bio}</p>

            <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-800">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
              Retrait : {data.cook.pickupAddress}
            </div>

            <section className="mt-5">
              <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-ink/50">
                Plats du jour ({data.dishes.length})
              </h2>
              <div className="space-y-2.5">
                {data.dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-ink/50">
                Avis ({data.reviews.length})
              </h2>
              <div className="space-y-2.5">
                {data.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{review.author}</span>
                      <StarRating rating={review.rating} showValue={false} />
                    </div>
                    <p className="mt-1 text-sm text-ink/70">{review.comment}</p>
                    <p className="mt-1 text-xs text-ink/40">{review.date}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
