// Storage Health Monitor - Future Protection System
// Bu sistem gelecekteki storage conflicts'ı önleyecek

import storage from '../core/storage/index.js';
import logger from '@utils/productionLogger';

class StorageHealthMonitor {
  constructor() {
    this.isMonitoring = false;
    this.healthCheckInterval = null;
    this.conflictDetectionEnabled = true;
  }

  // Storage health monitoring başlat
  startMonitoring() {
    if (this.isMonitoring) return;

    logger.system('storage', 'Storage Health Monitor started');
    this.isMonitoring = true;

    // Her 60 saniyede storage health check (10sn çok sıktı - production optimized)
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // 10000'den 60000'e çıkardık

    // Storage değişikliklerini izle
    this.setupStorageWatcher();
  }

  // Storage sağlık kontrolü
  performHealthCheck() {
    const healthReport = {
      timestamp: new Date().toISOString(),
      storageKeys: storage.getAllKeys(),
      potentialConflicts: [],
      recommendations: []
    };

    // Duplicate key detection
    this.detectDuplicateKeys(healthReport);

    // Orphaned data detection
    this.detectOrphanedData(healthReport);

    // Memory usage check
    this.checkMemoryUsage(healthReport);

    // Conflict detection
    if (this.conflictDetectionEnabled) {
      this.detectStorageConflicts(healthReport);
    }

    // Kritik problemler varsa alert
    if (healthReport.potentialConflicts.length > 0) {
      this.alertCriticalIssues(healthReport);
    }

    return healthReport;
  }

  // Duplicate key tespiti
  detectDuplicateKeys(report) {
    const keys = report.storageKeys;
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

    if (duplicates.length > 0) {
      report.potentialConflicts.push({
        type: 'DUPLICATE_KEYS',
        severity: 'HIGH',
        details: duplicates,
        recommendation: 'Remove duplicate storage keys immediately'
      });
    }
  }

  // Orphaned data tespiti
  detectOrphanedData(report) {
    const products = storage.get('products', []);
    const categories = storage.get('categories', []);

    // Kategorisi olmayan ürünler
    const orphanedProducts = products.filter(product => {
      return !categories.find(cat => cat.name === product.category);
    });

    if (orphanedProducts.length > 0) {
      report.potentialConflicts.push({
        type: 'ORPHANED_PRODUCTS',
        severity: 'LOW', // MEDIUM'dan LOW'a düşürdük - kritik olmayan durum
        details: orphanedProducts.map(p => ({ id: p.id, name: p.name, category: p.category })),
        recommendation: 'Create missing categories or reassign products'
      });
    }
  }

  // Memory usage kontrolü
  checkMemoryUsage(report) {
    const totalSize = report.storageKeys.reduce((size, key) => {
      const data = localStorage.getItem(`kirilmazlar_${key}`);
      return size + (data ? data.length : 0);
    }, 0);

    // 5MB'dan fazlaysa warning
    if (totalSize > 5 * 1024 * 1024) {
      report.potentialConflicts.push({
        type: 'HIGH_MEMORY_USAGE',
        severity: 'MEDIUM',
        details: { totalSize, sizeMB: (totalSize / (1024 * 1024)).toFixed(2) },
        recommendation: 'Consider data cleanup or archiving'
      });
    }
  }

  // Storage conflict detection
  detectStorageConflicts(report) {
    // Multiple storage systems kontrolü
    const storagePatterns = [
      { pattern: 'kirilmazlar_', system: 'unified_storage' },
      { pattern: 'products', system: 'legacy_direct' },
      { pattern: 'categories', system: 'legacy_direct' }
    ];

    const activeSystems = new Set();

    Object.keys(localStorage).forEach(key => {
      storagePatterns.forEach(({ pattern, system }) => {
        if (key.includes(pattern)) {
          activeSystems.add(system);
        }
      });
    });

    if (activeSystems.size > 1) {
      report.potentialConflicts.push({
        type: 'MULTIPLE_STORAGE_SYSTEMS',
        severity: 'LOW', // CRITICAL'den LOW'a düşürdük - geliştirme ortamında normal
        details: Array.from(activeSystems),
        recommendation: 'Multiple storage systems detected - normal in development'
      });
    }
  }

  // Storage değişiklik watcher
  setupStorageWatcher() {
    // Unified storage events'i izle
    storage.onChange((changeEvent) => {
      logger.debug('Storage Health Monitor - Change detected:', changeEvent);

      // Kritik değişikliklerde immediate health check
      if (['categories', 'products'].includes(changeEvent.key)) {
        setTimeout(() => this.performHealthCheck(), 1000);
      }
    });
  }

  // Kritik durum alert sistemi - SADECE CRITICAL severity'ler için alarm
  alertCriticalIssues(healthReport) {
    const criticalIssues = healthReport.potentialConflicts.filter(
      conflict => conflict.severity === 'CRITICAL' // Sadece gerçekten kritik durumlar
    );

    if (criticalIssues.length > 0) {
      logger.error('STORAGE CRITICAL ISSUES DETECTED:', criticalIssues);

      // Developer notification - sadece CRITICAL için
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Storage System Critical Issues',
          message: `${criticalIssues.length} critical storage issues detected. Check console for details.`,
          duration: 10000
        });
      }

      // Custom event for application
      window.dispatchEvent(new CustomEvent('storage_critical_issues', {
        detail: { issues: criticalIssues, fullReport: healthReport }
      }));
    }
  }

  // Monitoring durdur
  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
    logger.system('storage', 'Storage Health Monitor stopped');
  }

  // Manuel health check
  getHealthReport() {
    return this.performHealthCheck();
  }

  // Development protection - future conflicts prevention
  enableConflictPrevention() {
    this.conflictDetectionEnabled = true;
    logger.system('storage', 'Storage conflict prevention enabled');
  }

  disableConflictPrevention() {
    this.conflictDetectionEnabled = false;
    logger.warn('Storage conflict prevention disabled');
  }
}

// Singleton instance
const storageHealthMonitor = new StorageHealthMonitor();

// Development environment'da otomatik başlat
if (import.meta.env.DEV) {
  storageHealthMonitor.startMonitoring();
}

// Global access
window.storageHealthMonitor = storageHealthMonitor;

export default storageHealthMonitor;
