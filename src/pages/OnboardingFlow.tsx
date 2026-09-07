import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBasket, Handshake } from "lucide-react";

interface Step {
  icon: typeof Search;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Trouvez un cuisinier près de chez vous",
    description: "Découvrez les plats faits maison de vos voisins, sur la carte ou en liste, filtrés par cuisine et par prix.",
  },
  {
    icon: ShoppingBasket,
    title: "Commandez votre plat",
    description: "Choisissez le plat qui vous fait envie et réservez-le en quelques secondes, directement depuis l'app.",
  },
  {
    icon: Handshake,
    title: "Récupérez votre repas",
    description: "Rendez-vous chez votre voisin cuisinier au créneau convenu — votre plat vous attend, encore chaud.",
  },
];

interface OnboardingFlowProps {
  onDone: () => void;
}

export function OnboardingFlow({ onDone }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function next() {
    if (isLast) onDone();
    else setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-[9998] mx-auto flex h-dvh max-w-lg flex-col bg-cream px-6">
      <div className="flex justify-end pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button onClick={onDone} className="text-sm font-medium text-ink/40">
          Passer
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-terracotta-100">
              <current.icon className="h-12 w-12 text-terracotta-600" strokeWidth={1.75} />
            </div>
            <h1 className="mt-7 text-xl font-bold text-ink">{current.title}</h1>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink/60">{current.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-6">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-5 bg-terracotta-600" : "w-1.5 bg-terracotta-200"
            }`}
          />
        ))}
      </div>

      <div className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full rounded-full bg-terracotta-600 py-3.5 font-semibold text-white shadow-md"
        >
          {isLast ? "Commencer" : "Suivant"}
        </motion.button>
      </div>
    </div>
  );
}
