import { useLocation, useParams, Link } from "react-router-dom";
import type { Order, Cook } from "../types";

interface ConfirmState {
  order: Order;
  cook: Cook;
}

export function OrderConfirmPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state as ConfirmState | undefined;

  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl" aria-hidden="true">
          🧾
        </span>
        <p className="text-sm text-ink/60">
          Détails de la commande {orderId} indisponibles depuis cet écran. Retrouvez-la dans « Mes commandes ».
        </p>
        <Link to="/mes-commandes" className="rounded-full bg-terracotta-500 px-5 py-2.5 font-semibold text-cream">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  const { order, cook } = state;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-4xl">✅</div>

      <div>
        <h1 className="text-xl font-bold text-ink">Commande confirmée !</h1>
        <p className="mt-1 text-sm text-ink/60">Démo — paiement simulé, aucune transaction réelle n'a eu lieu.</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-terracotta-50">
        <div className="flex items-center gap-3">
          <img src={cook.avatarUrl} alt={cook.name} className="h-12 w-12 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{order.dishName}</p>
            <p className="truncate text-xs text-ink/50">chez {cook.name}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-terracotta-50 pt-3 text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Quantité</span>
            <span className="font-medium text-ink">{order.quantity}</span>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Créneau de retrait</span>
            <span className="font-medium text-ink">{order.pickupWindow}</span>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Lieu</span>
            <span className="max-w-[60%] text-right font-medium text-ink">{cook.pickupAddress}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-terracotta-50 pt-2 text-base font-bold text-terracotta-600">
            <span>Total</span>
            <span>{order.totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2.5">
        <Link
          to="/mes-commandes"
          className="rounded-full bg-terracotta-500 py-3 font-semibold text-cream shadow-md active:scale-[0.98]"
        >
          Voir mes commandes
        </Link>
        <Link to="/" className="rounded-full bg-white py-3 font-semibold text-ink/70 ring-1 ring-terracotta-100">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
