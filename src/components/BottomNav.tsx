import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Explorer", icon: "🗺️", end: true },
  { to: "/mes-commandes", label: "Commandes", icon: "🧾", end: true },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-terracotta-100 bg-cream/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                isActive ? "text-terracotta-600" : "text-ink/50"
              }`
            }
          >
            <span className="text-lg" aria-hidden="true">
              {tab.icon}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
