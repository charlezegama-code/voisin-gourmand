import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { CookProfilePage } from "./pages/CookProfilePage";
import { DishPage } from "./pages/DishPage";
import { OrderConfirmPage } from "./pages/OrderConfirmPage";
import { OrdersPage } from "./pages/OrdersPage";

function App() {
  return (
    <div className="mx-auto flex h-dvh max-w-lg flex-col bg-cream">
      <main className="min-h-0 flex-1 pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cuisiniers/:id" element={<CookProfilePage />} />
          <Route path="/plats/:id" element={<DishPage />} />
          <Route path="/commande-confirmee/:orderId" element={<OrderConfirmPage />} />
          <Route path="/mes-commandes" element={<OrdersPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
