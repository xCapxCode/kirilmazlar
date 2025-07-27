import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./styles/tailwind.css";

// Veri servisi başlatma
import dataService from './services/dataService';

// Storage Health Monitor - Future protection
import './utils/storageHealthMonitor';

// Veri servisini açıkça başlat
import { logger } from './utils/productionLogger.js';
logger.info('🚀 DataService başlatılıyor...');
logger.debug('📊 DataService durum:', dataService);

// Debug info için
import './utils/debugInfo';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
