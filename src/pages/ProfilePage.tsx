import { User, Receipt, Heart, MapPin, Info, ChevronRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { useAsync } from "../hooks/useAsync";
import { fetchOrders } from "../lib/api";
import { useOnboarding } from "../context/OnboardingContext";

const MENU = [
  { icon: Receipt, label: "Mes commandes", to: "/mes-commandes" },
  { icon: Heart, label: "Cuisiniers favoris", to: "/recherche" },
  { icon: MapPin, label: "Adresse de retrait", to: "/recherche" },
];

export function ProfilePage() {
  const { data } = useAsync(fetchOrders, []);
  const orderCount = data?.orders.length ?? 0;
  const { restartOnboarding } = useOnboarding();

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-8">
      <AppHeader title="Profil" />

      <div className="mt-2 flex items-center gap-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-white shadow-md">
          <User className="h-7 w-7" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-ink">Utilisateur démo</h1>
          <p className="text-xs text-ink/50">Membre depuis août 2026 · Paris</p>
        </div>
      </div>

      <div className="mx-4 mt-5 grid grid-cols-3 gap-2.5">
        {[
          { label: "Commandes", value: String(orderCount) },
          { label: "Favoris", value: "0" },
          { label: "Avis laissés", value: "0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-terracotta-50">
            <p className="text-lg font-bold text-terracotta-600">{stat.value}</p>
            <p className="text-[11px] text-ink/50">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-terracotta-50">
        {MENU.map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-ink ${
              i > 0 ? "border-t border-terracotta-50" : ""
            }`}
          >
            <item.icon className="h-4.5 w-4.5 text-terracotta-500" strokeWidth={2} />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-ink/30" strokeWidth={2} />
          </Link>
        ))}
        <button
          onClick={restartOnboarding}
          className="flex w-full items-center gap-3 border-t border-terracotta-50 px-4 py-3.5 text-left text-sm font-medium text-ink"
        >
          <RotateCcw className="h-4.5 w-4.5 text-terracotta-500" strokeWidth={2} />
          <span className="flex-1">Revoir le tutoriel</span>
          <ChevronRight className="h-4 w-4 text-ink/30" strokeWidth={2} />
        </button>
      </div>

      <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-2xl bg-sage-50 p-3.5 text-xs text-sage-800">
        <Info className="h-4 w-4 shrink-0 text-sage-600" strokeWidth={2} />
        <p>
          Ceci est une démo de pitch. Le profil, les commandes et les cuisiniers sont fictifs — aucune donnée
          personnelle réelle n'est collectée.
        </p>
      </div>
    </div>
  );
}
