import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, Receipt, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/recherche", label: "Recherche", icon: Search, end: true },
  { to: "/mes-commandes", label: "Commandes", icon: Receipt, end: true },
  { to: "/profil", label: "Profil", icon: User, end: true },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-terracotta-100/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className="flex flex-1 flex-col items-center gap-1 py-2.5">
            {({ isActive }) => (
              <>
                <motion.span
                  whileTap={{ scale: 0.85 }}
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-terracotta-100 text-terracotta-600" : "text-ink/45"
                  }`}
                >
                  <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                </motion.span>
                <span className={`text-[11px] font-medium ${isActive ? "text-terracotta-600" : "text-ink/45"}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
