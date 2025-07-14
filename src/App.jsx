/* global localStorage, console, window */
import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import ToastContainer from "./shared/components/ui/ToastContainer";
import NetworkStatus from "./shared/components/NetworkStatus";
import Routes from "./Routes";
import cleanupDemoUsers from "./utils/cleanupDemoUsers";

function App() {
  // Tek seferlik localStorage temizliği ve demo kullanıcı temizliği
  useEffect(() => {
    try {
      // Demo kullanıcıları temizle
      cleanupDemoUsers();
      
      // Mevcut sepet verisi temizliği
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedData = JSON.parse(cartData);
        // Eğer cart datası içindeki bir eleman 'product' anahtarı içeriyorsa, bu eski formattır.
        if (Array.isArray(parsedData) && parsedData.some(item => typeof item.product !== 'undefined')) {
          console.warn("Eski formatta sepet verisi algılandı ve temizlendi.");
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error("localStorage temizliği sırasında hata.", error);
      // Hata durumunda sadece cart'ı temizle
      localStorage.removeItem('cart');
    }
  }, []);

  return (
    <BusinessProvider>
      <AuthProvider>
        <CartProvider>
          <NetworkStatus />
          <Routes />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </BusinessProvider>
  );
}

export default App;
