import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { BottomNav } from "./components/BottomNav";
import { PageTransition } from "./components/PageTransition";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { OnboardingContext } from "./context/OnboardingContext";
import { isOnboardingSeen, markOnboardingSeen } from "./lib/onboardingStorage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { CookProfilePage } from "./pages/CookProfilePage";
import { DishPage } from "./pages/DishPage";
import { OrderConfirmPage } from "./pages/OrderConfirmPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";

const SPLASH_DURATION_MS = 900;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingSeen());

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  function finishOnboarding() {
    markOnboardingSeen();
    setShowOnboarding(false);
    navigate("/");
  }

  function restartOnboarding() {
    setShowOnboarding(true);
  }

  return (
    <OnboardingContext.Provider value={{ restartOnboarding }}>
      <div className="mx-auto flex h-dvh max-w-lg flex-col bg-cream">
        <main className="min-h-0 flex-1 overflow-hidden pb-16">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/recherche" element={<PageTransition><SearchPage /></PageTransition>} />
              <Route path="/cuisiniers/:id" element={<PageTransition><CookProfilePage /></PageTransition>} />
              <Route path="/plats/:id" element={<PageTransition><DishPage /></PageTransition>} />
              <Route path="/commande-confirmee/:orderId" element={<PageTransition><OrderConfirmPage /></PageTransition>} />
              <Route path="/mes-commandes" element={<PageTransition><OrdersPage /></PageTransition>} />
              <Route path="/profil" element={<PageTransition><ProfilePage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>

      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
      {!showSplash && showOnboarding && <OnboardingFlow onDone={finishOnboarding} />}
    </OnboardingContext.Provider>
  );
}

export default App;
