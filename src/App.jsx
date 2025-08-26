/* global localStorage, console, window */
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { CartProvider } from "./contexts/CartContext";
import { ModalProvider } from "./contexts/ModalContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { backupManager } from "./core/backup";
import { migrationManager } from "./core/migration";
import Routes from "./Routes";
import { setupCSPViolationReporting } from "./security/contentSecurityPolicy";
import securityService from "./security/SecurityService";
import dataService from "./services/dataService";
import ConcurrentSessionModal from "./shared/components/ConcurrentSessionModal";
import NetworkStatus from "./shared/components/NetworkStatus";
import SecurityAlertModal from "./shared/components/SecurityAlertModal";
import SessionWarningModal from "./shared/components/SessionWarningModal";
// import bundleAnalyzer from "./utils/BundleAnalyzer"; // DISABLED to fix CSS loading issue
import errorTracker from "./utils/ErrorTracker";
import healthMonitor from "./utils/HealthMonitor";
import maintenanceManager from "./utils/MaintenanceManager";
import logger from "./utils/productionLogger";
import serviceWorkerManager from "./utils/ServiceWorkerManager";

function App() {
  // Tek seferlik localStorage temizliği ve veri migrasyonu
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize monitoring & maintenance systems
        healthMonitor.initialize();
        errorTracker.initialize();
        maintenanceManager.initialize();

        // Initialize security hardening
        securityService.initialize();

        // Initialize performance monitoring - DISABLED to fix CSS loading issue
        // bundleAnalyzer.initialize();

        // Initialize service worker
        await serviceWorkerManager.initialize();

        // Initialize CSP violation reporting
        setupCSPViolationReporting();

        // Mevcut sepet verisi temizliği
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const parsedData = JSON.parse(cartData);
          // Eğer cart datası içindeki bir eleman 'product' anahtarı içeriyorsa, bu eski formattır.
          if (Array.isArray(parsedData) && parsedData.some(item => typeof item.product !== 'undefined')) {
            logger.warn("Eski formatta sepet verisi algılandı ve temizlendi.");
            localStorage.removeItem('cart');
          }
        }

        // DataService'i başlat - İlk veri yükleme için
        logger.info('🔄 DataService başlatılıyor...');
        await dataService.initializeData();
        logger.info('✅ DataService başlatıldı');

        // Kullanıcıları kontrol et (mobil erişim için login sayfasında yüklenecek)
        logger.info('Uygulama başlatıldı');

        // Veri migrasyonu yap
        logger.info('Veri migrasyonu kontrol ediliyor...');
        const migrationResult = await migrationManager.migrateAll();
        if (migrationResult) {
          logger.success('Veri migrasyonu başarıyla tamamlandı');
        } else {
          logger.warn('Veri migrasyonu sırasında bazı sorunlar oluştu');
        }

        // Global backup/restore fonksiyonlarını tanımla
        window.backupData = async () => {
          return await backupManager.createBackup();
        };

        window.restoreData = async (file) => {
          return await backupManager.restoreBackup(file);
        };
      } catch (error) {
        logger.error("Uygulama başlatma sırasında hata:", error);
        // Hata durumunda sadece cart'ı temizle
        localStorage.removeItem('cart');
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
          <BusinessProvider>
            <CartProvider>
              <NetworkStatus />
              <SessionWarningModal />
              <ConcurrentSessionModal />
              <SecurityAlertModal />
              <Routes />
            </CartProvider>
          </BusinessProvider>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
