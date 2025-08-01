/**
 * CROSS-BROWSER SYNC SERVICE
 * Edge ve VSCode Simple Browser arasında localStorage senkronizasyonu
 */

import logger from '@utils/logger';

class CrossBrowserSyncService {
  constructor() {
    this.syncEndpoint = '/api/sync'; // Local server endpoint
    this.syncInterval = 5000; // 5 saniye
    this.isRunning = false;
    this.lastSyncTime = 0;
  }

  // Başlat
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info('🔄 Cross-browser sync başlatıldı');

    // Development modunda edge-storage sync'i devre dışı bırak
    if (import.meta.env.DEV) {
      logger.info('🚫 Development modunda edge-storage sync devre dışı');
      return;
    }

    // İlk sync
    this.performSync();

    // Periyodik sync
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.syncInterval);

    // Window focus'ta sync
    window.addEventListener('focus', () => {
      this.performSync();
    });

    // Storage değişikliklerinde sync
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('kirilmazlar_')) {
        setTimeout(() => this.performSync(), 100);
      }
    });
  }

  // Durdur
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    logger.info('⏹️ Cross-browser sync durduruldu');
  }

  // Sync işlemi
  async performSync() {
    // Development modunda sync yapma
    if (import.meta.env.DEV) {
      return;
    }

    try {
      // Edge'den veri çek (referans)
      const edgeData = await this.getEdgeData();

      if (edgeData && Object.keys(edgeData).length > 0) {
        // VSCode'a uygula
        await this.applyDataToVSCode(edgeData);
        logger.debug('✅ Edge → VSCode sync tamamlandı');
      } else {
        // VSCode'dan veri al
        const vscodeData = this.getVSCodeData();

        if (vscodeData && Object.keys(vscodeData).length > 0) {
          // Edge'e gönder
          await this.sendDataToEdge(vscodeData);
          logger.debug('✅ VSCode → Edge sync tamamlandı');
        }
      }

      this.lastSyncTime = Date.now();
    } catch (error) {
      logger.error('❌ Cross-browser sync hatası:', error);
    }
  }

  // Edge'den veri al (HTTP endpoint üzerinden)
  async getEdgeData() {
    try {
      const response = await fetch('/api/edge-storage', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // HTTP endpoint yoksa localStorage'dan oku
      return this.readFromTempStorage();
    }
    return null;
  }

  // VSCode'dan veri al
  getVSCodeData() {
    const data = {};

    // Tüm kirilmazlar_ verileri
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('kirilmazlar_')) {
        data[key] = localStorage.getItem(key);
      }
    }

    return data;
  }

  // Edge'e veri gönder
  async sendDataToEdge(data) {
    try {
      await fetch('/api/edge-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      // HTTP endpoint yoksa temp storage'a yaz
      this.writeToTempStorage(data);
    }
  }

  // VSCode'a veri uygula
  async applyDataToVSCode(data) {
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('kirilmazlar_')) {
        localStorage.setItem(key, value);
      }
    });

    // UI'ı güncelle
    window.dispatchEvent(new CustomEvent('cross_browser_sync', {
      detail: { type: 'data_updated', source: 'edge' }
    }));
  }

  // Temp storage (fallback)
  writeToTempStorage(data) {
    localStorage.setItem('temp_sync_data', JSON.stringify({
      data,
      timestamp: Date.now(),
      source: 'vscode'
    }));
  }

  readFromTempStorage() {
    try {
      const temp = localStorage.getItem('temp_sync_data');
      if (temp) {
        const parsed = JSON.parse(temp);
        // 1 dakikadan eski verileri yoksay
        if (Date.now() - parsed.timestamp < 60000) {
          return parsed.data;
        }
      }
    } catch (error) {
      logger.warn('Temp storage okuma hatası:', error);
    }
    return null;
  }

  // Manuel sync tetikle
  triggerManualSync() {
    logger.info('🔄 Manuel sync tetiklendi');
    return this.performSync();
  }

  // Sync durumu
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      timeSinceLastSync: Date.now() - this.lastSyncTime
    };
  }
}

// Singleton instance
const crossBrowserSyncService = new CrossBrowserSyncService();

export default crossBrowserSyncService;
