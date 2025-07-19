/* global localStorage, console, window */
import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ModalProvider } from "./contexts/ModalContext";
import ToastContainer from "./shared/components/ui/ToastContainer";
import NotificationContainer from "./shared/components/ui/NotificationContainer";
import NotificationSystem from "./shared/components/ui/NotificationSystem";
import NetworkStatus from "./shared/components/NetworkStatus";
import Routes from "./Routes";
import cleanupDemoUsers from "./utils/cleanupDemoUsers";
import { migrationManager } from "./core/migration";
import { backupManager } from "./core/backup";

function App() {
  // Tek seferlik localStorage temizliği, demo kullanıcı temizliği ve veri migrasyonu
  useEffect(() => {
    const initializeApp = async () => {
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
        
        // Veri migrasyonu yap
        console.log('🔄 Veri migrasyonu kontrol ediliyor...');
        const migrationResult = await migrationManager.migrateAll();
        if (migrationResult) {
          console.log('✅ Veri migrasyonu başarıyla tamamlandı');
        } else {
          console.warn('⚠️ Veri migrasyonu sırasında bazı sorunlar oluştu');
        }
        
        // Global backup/restore fonksiyonlarını tanımla
        window.backupData = async () => {
          return await backupManager.createBackup();
        };
        
        window.restoreData = async (file) => {
          return await backupManager.restoreBackup(file);
        };
      } catch (error) {
        console.error("Uygulama başlatma sırasında hata:", error);
        // Hata durumunda sadece cart'ı temizle
        localStorage.removeItem('cart');
      }
    };
    
    initializeApp();
  }, []);

  return (
    <NotificationProvider>
      <ModalProvider>
        <BusinessProvider>
          <AuthProvider>
            <CartProvider>
              <NetworkStatus />
              <Routes />
              <ToastContainer />
              <NotificationContainer />
              <NotificationSystem />
            </CartProvider>
          </AuthProvider>
        </BusinessProvider>
      </ModalProvider>
    </NotificationProvider>
  );
}

export default App;
