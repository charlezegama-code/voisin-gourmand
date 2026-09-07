import { motion } from "framer-motion";

// Écran de démarrage local (en plus des icônes de manifest, qui pilotent le splash natif
// généré par l'OS lors d'un vrai lancement PWA installée — voir DECISIONS.md). Celui-ci
// garantit un moment de marque visible dans TOUT scénario de démo (onglet navigateur classique
// ou PWA installée), pas seulement après une installation sur écran d'accueil.
export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-cream"
    >
      <motion.img
        src="/logo.png"
        alt="Voisin Gourmand"
        className="h-24 w-24"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-sm font-semibold tracking-wide text-terracotta-600"
      >
        Voisin Gourmand
      </motion.p>
    </motion.div>
  );
}
