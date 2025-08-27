import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";

// Cache utilities'i yükle (console erişimi için)
import './utils/clearCache.js';

// Storage başlatma - DataService kullan
import storage from './core/storage';
import dataService from './services/dataService';

// Cross-Browser Sync Service - REMOVED (unused service)

// Storage Health Monitor - Future protection
import './utils/storageHealthMonitor';

// Test data initialization - Development için
import { initializeAllTestData } from './utils/initializeTestData.js';

// Debug info için
import './utils/debugInfo';

const container = document.getElementById("root");
const root = createRoot(container);

// Async initialization function
async function initializeApp() {
  try {
    // Sadece storage'ı initialize et
    await storage.init();

    // DataService'i başlat - Temel data yapılarını kurar
    dataService.initializeData();

    // Test verilerini initialize et (development için)
    initializeAllTestData();

    // Cross-browser sync removed - unused service

    // React uygulamasını render et
    root.render(<App />);
  } catch (error) {
    // Hata durumunda basit bir hata sayfası göster
    root.render(
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Uygulama Başlatma Hatası</h1>
        <p>Lütfen sayfayı yenileyin veya sistem yöneticisine başvurun.</p>
      </div>
    );
  }
}

// Uygulamayı başlat
initializeApp();
