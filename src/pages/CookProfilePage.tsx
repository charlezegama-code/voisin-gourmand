import { useParams, Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { fetchCookDetail } from "../lib/api";
import { StarRating } from "../components/StarRating";
import { DishCard } from "../components/DishCard";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";

export function CookProfilePage() {
  const { id = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => fetchCookDetail(id), [id]);

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-8">
      <div className="flex items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-terracotta-100"
          aria-label="Retour"
        >
          ←
        </Link>
      </div>

      {loading && <LoadingState label="Chargement du profil…" />}
      {error && !loading && (
        <div className="px-4 pt-4">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="mt-2 flex items-start gap-4 px-4">
            <img
              src={data.cook.avatarUrl}
              alt={data.cook.name}
              className="h-20 w-20 rounded-2xl object-cover shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-xl font-bold text-ink">{data.cook.name}</h1>
                {data.cook.verified && (
                  <span title="Cuisinier vérifié" className="text-sage-500">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-ink/60">
                {data.cook.specialty} · {data.cook.neighborhood} ({data.cook.arrondissement}e)
              </p>
              <div className="mt-1">
                <StarRating rating={data.cook.rating} />
                <span className="ml-1.5 text-xs text-ink/50">({data.cook.reviewCount} avis)</span>
              </div>
            </div>
          </div>

          <p className="mt-3 px-4 text-sm leading-relaxed text-ink/80">{data.cook.bio}</p>

          <div className="mx-4 mt-3 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-800">
            📍 Retrait : {data.cook.pickupAddress}
          </div>

          <section className="mt-5 px-4">
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-ink/50">
              Plats du jour ({data.dishes.length})
            </h2>
            <div className="space-y-2.5">
              {data.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          </section>

          <section className="mt-6 px-4">
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
        </>
      )}
    </div>
  );
}
