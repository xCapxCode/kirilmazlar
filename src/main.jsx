import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./styles/tailwind.css";

// Storage başlatma - DataService kullan
import storage from './core/storage';
import dataService from './services/dataService';

// Cross-Browser Sync Service
import crossBrowserSyncService from './services/crossBrowserSyncService';

// Storage Health Monitor - Future protection
import './utils/storageHealthMonitor';

// Temel verileri sağla - TEST_USERS KALDIRILDI
// import { TEST_USERS } from './data/testUsers.js'; // KULLANMA

// Storage'ı başlat ve temel verileri yükle
import { logger } from './utils/productionLogger.js';
logger.info('🚀 Storage başlatılıyor...');

// Sadece storage'ı initialize et
await storage.init();

// DataService'i başlat - Temel data yapılarını kurar
dataService.initializeData();
logger.info('📊 DataService başlatıldı');

// Cross-browser sync'i başlat
crossBrowserSyncService.start();
logger.info('🔄 Cross-browser sync başlatıldı');

// KULLANICI VERİLERİNİ KORUMA - ASLA TEST_USERS YÜKLEME
const existingUsers = storage.get('users', []);
logger.info(`👥 Mevcut kullanıcı sayısı: ${existingUsers.length}`);
if (existingUsers.length > 0) {
  logger.info(`� GERÇEK kullanıcılar: ${existingUsers.map(u => u.username || u.email).join(', ')}`);
} else {
  logger.info('📝 Henüz kullanıcı yok - Registration sistemi aktif');
}

logger.info('✅ Sistem başlatıldı');

// Debug info için
import './utils/debugInfo';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
