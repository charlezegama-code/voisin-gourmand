import { motion } from "framer-motion";
import { useAsync } from "../hooks/useAsync";
import { fetchOrders } from "../lib/api";
import { AppHeader } from "../components/AppHeader";
import { ErrorState } from "../components/ErrorState";
import { DishCardSkeleton } from "../components/Skeletons";
import type { Order } from "../types";

const STATUS_LABEL: Record<Order["status"], string> = {
  recupere: "Récupérée",
  confirme: "Confirmée",
};

const STATUS_STYLE: Record<Order["status"], string> = {
  recupere: "bg-ink/10 text-ink/60",
  confirme: "bg-sage-100 text-sage-700",
};

function formatOrderDate(createdAt: string): string {
  return createdAt.slice(0, 10);
}

export function OrdersPage() {
  const { data, loading, error, reload } = useAsync(fetchOrders, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-8">
      <AppHeader title="Mes commandes" subtitle="Historique de démo" />

      <div className="mt-2 flex-1 px-4">
        {loading && (
          <div className="space-y-2.5">
            <DishCardSkeleton />
            <DishCardSkeleton />
            <DishCardSkeleton />
          </div>
        )}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && data && data.orders.length === 0 && (
          <ErrorState message="Aucune commande pour le moment. Explorez la carte pour découvrir vos voisins cuisiniers !" />
        )}

        {!loading && !error && data && data.orders.length > 0 && (
          <div className="space-y-2.5">
            {data.orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50"
              >
                <img
                  src={order.cookAvatarUrl}
                  alt={order.cookName}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{order.dishName}</p>
                      <p className="truncate text-xs text-ink/50">chez {order.cookName}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-ink/50">
                      {order.quantity}× · {formatOrderDate(order.createdAt)}
                    </span>
                    <span className="font-semibold text-terracotta-600">{order.totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
