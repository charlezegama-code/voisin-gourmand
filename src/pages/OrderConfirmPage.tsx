import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Receipt } from "lucide-react";
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
        <Receipt className="h-10 w-10 text-terracotta-300" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-ink/60">
          Détails de la commande {orderId} indisponibles depuis cet écran. Retrouvez-la dans « Mes commandes ».
        </p>
        <Link to="/mes-commandes" className="rounded-full bg-terracotta-600 px-5 py-2.5 font-semibold text-white">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  const { order, cook } = state;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-500 shadow-lg shadow-sage-500/30"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h1 className="text-xl font-bold text-ink">Commande confirmée !</h1>
        <p className="mt-1 text-sm text-ink/60">Démo — paiement simulé, aucune transaction réelle n'a eu lieu.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full max-w-sm rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-terracotta-50"
      >
        <div className="flex items-center gap-3">
          <img src={order.dishPhotoUrl} alt={order.dishName} className="h-12 w-12 rounded-xl object-cover" />
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex w-full max-w-sm flex-col gap-2.5"
      >
        <Link
          to="/mes-commandes"
          className="rounded-full bg-terracotta-600 py-3 font-semibold text-white shadow-md active:scale-[0.98]"
        >
          Voir mes commandes
        </Link>
        <Link to="/" className="rounded-full bg-white py-3 font-semibold text-ink/70 ring-1 ring-terracotta-100">
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
