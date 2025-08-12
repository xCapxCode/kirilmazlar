import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./styles/tailwind.css";

// Storage başlatma - DataService kullan
import storage from './core/storage';
import dataService from './services/dataService';

// Cross-Browser Sync Service - REMOVED (unused service)

// Storage Health Monitor - Future protection
import './utils/storageHealthMonitor';

// Temel verileri sağla - TEST_USERS KALDIRILDI
// import { TEST_USERS } from './data/testUsers.js'; // KULLANMA

// Storage'ı başlat ve temel verileri yükle

// Debug info için
import './utils/debugInfo';

// 🚀 KIRO AUTONOMOUS SYSTEM - %97 API Tasarrufu
import '../.kiro/index.js';

const container = document.getElementById("root");
const root = createRoot(container);

// Async initialization function
async function initializeApp() {
  try {
    // Sadece storage'ı initialize et
    await storage.init();

    // DataService'i başlat - Temel data yapılarını kurar
    dataService.initializeData();

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
