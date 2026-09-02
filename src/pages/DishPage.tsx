import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { fetchDishDetail, placeOrder, ApiError } from "../lib/api";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";

export function DishPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => fetchDishDetail(id), [id]);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  async function handleOrder() {
    if (!data) return;
    setSubmitting(true);
    setOrderError(null);
    try {
      const { order } = await placeOrder(data.dish.id, quantity);
      navigate(`/commande-confirmee/${order.id}`, { state: { order, cook: data.cook } });
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : "Impossible de valider la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-8">
      <div className="flex items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-terracotta-100"
          aria-label="Retour"
        >
          ←
        </button>
      </div>

      {loading && <LoadingState label="Chargement du plat…" />}
      {error && !loading && (
        <div className="px-4 pt-4">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="mx-4 mt-2 flex h-40 items-center justify-center rounded-3xl bg-terracotta-50 text-7xl">
            {data.dish.emoji}
          </div>

          <div className="mt-4 px-4">
            <h1 className="text-xl font-bold text-ink">{data.dish.name}</h1>
            <p className="mt-1 text-sm text-ink/70">{data.dish.description}</p>

            <Link
              to={`/cuisiniers/${data.cook.id}`}
              className="mt-3 flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-terracotta-50"
            >
              <img src={data.cook.avatarUrl} alt={data.cook.name} className="h-10 w-10 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{data.cook.name}</p>
                <p className="truncate text-xs text-ink/50">{data.cook.neighborhood}</p>
              </div>
              <span className="text-ink/30">›</span>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-2xl bg-sage-50 p-3">
                <p className="text-xs font-medium text-sage-700">Créneau de retrait</p>
                <p className="font-semibold text-sage-900">{data.dish.pickupWindow}</p>
              </div>
              <div className="rounded-2xl bg-terracotta-50 p-3">
                <p className="text-xs font-medium text-terracotta-700">Disponibilité</p>
                <p className="font-semibold text-terracotta-900">
                  {data.dish.quantityAvailable > 0 ? `${data.dish.quantityAvailable} portions` : "Épuisé"}
                </p>
              </div>
            </div>

            {data.dish.quantityAvailable > 0 && (
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50">
                <span className="text-sm font-medium text-ink/70">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-50 text-lg font-bold text-terracotta-600"
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(data.dish.quantityAvailable, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-50 text-lg font-bold text-terracotta-600"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {orderError && (
              <p className="mt-3 rounded-xl bg-terracotta-50 px-3 py-2 text-sm text-terracotta-700">{orderError}</p>
            )}
          </div>

          <div className="sticky bottom-0 mt-6 border-t border-terracotta-100 bg-cream/95 px-4 py-3 backdrop-blur">
            <p className="mb-2 text-center text-[11px] text-ink/40">
              Démo — paiement simulé, aucune transaction réelle
            </p>
            <button
              onClick={handleOrder}
              disabled={data.dish.quantityAvailable === 0 || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta-500 py-3 font-semibold text-cream shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Confirmation…"
                : data.dish.quantityAvailable === 0
                  ? "Épuisé"
                  : `Commander · ${(data.dish.price * quantity).toFixed(2)}€`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
