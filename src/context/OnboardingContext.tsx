import { createContext, useContext } from "react";

interface OnboardingContextValue {
  restartOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding doit être utilisé sous OnboardingContext.Provider");
  return ctx;
}
