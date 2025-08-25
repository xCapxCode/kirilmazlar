/**
 * KIRILMAZLAR STORAGE MANAGER
 * Single Source of Truth for all application data
 * Bu dosya TÜMEL uygulamanın tek veri kaynağıdır
 */

import logger from '@utils/productionLogger';

class KirilmazlarStorage {
  constructor() {
    // Force consistent prefix regardless of environment
    this.prefix = 'kirilmazlar_';
    this.version = '1.0.0';
    this.channel = null;

    // Development mode - use localStorage but with enhanced sync
    this.isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    logger.info('🔧 Storage Mode:', this.isDevelopment ? 'LOCALSTORAGE (Development with Enhanced Sync)' : 'LOCALSTORAGE (Production)');
    logger.info('🏷️ Storage Prefix:', this.prefix);
    logger.info('🌐 Current Host:', window.location.hostname + ':' + window.location.port);

    this.init();
    // TEMPORARILY DISABLE cross-device sync to fix infinite loop
    // this.setupCrossDeviceSync();
    this.setupStorageHealthMonitor();
  }

  init() {
    // Versiyon kontrolü
    const currentVersion = this.getRaw('data_version');
    if (currentVersion !== this.version) {
      logger.info('🔄 Storage version update:', currentVersion, '->', this.version);
      this.migrate();
      this.setRaw('data_version', this.version);
    }
  }

  // CROSS-DEVICE SYNC SETUp
  setupCrossDeviceSync() {
    try {
      // BroadcastChannel for same-origin communication
      this.channel = new BroadcastChannel('kirilmazlar_sync');

      this.channel.addEventListener('message', (event) => {
        logger.info('📡 Cross-device sync received:', event.data);
        this.handleRemoteUpdate(event.data);
      });

      // Storage event for cross-tab sync
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(this.prefix)) {
          logger.info('🔄 Storage event detected:', event.key);
          this.notifyStorageChange(event.key, event.newValue);
        }
      });

      logger.info('✅ Cross-device sync enabled');
    } catch (error) {
      logger.warn('⚠️ Cross-device sync not available:', error);
    }
  }

  // Handle remote updates from other devices
  handleRemoteUpdate(data) {
    const { key, value, timestamp, deviceId, source } = data;

    // Don't process our own updates
    const currentDeviceId = this.getDeviceId();
    if (deviceId === currentDeviceId) return;

    // Apply remote update locally
    try {
      // Always use localStorage
      if (value === null) {
        localStorage.removeItem(this.prefix + key);
      } else {
        localStorage.setItem(this.prefix + key, value);
      }
      logger.info('✅ Applied localStorage update from remote:', key, 'source:', source || 'unknown');

      // Notify local components
      window.dispatchEvent(new CustomEvent('storage_remote_update', {
        detail: { key: this.prefix + key, value, timestamp, deviceId, source }
      }));

    } catch (error) {
      logger.error('❌ Failed to apply remote update:', error);
    }
  }

  // Broadcast changes to other devices
  // Broadcast changes to other devices
  broadcastChange(key, value) {
    if (!this.channel) return;

    try {
      const message = {
        key,
        value,
        timestamp: Date.now(),
        deviceId: this.getDeviceId(),
        type: 'storage_update',
        source: 'localStorage'
      };

      this.channel.postMessage(message);

      if (this.isDevelopment) {
        logger.info('📡 Broadcasting localStorage change:', key);
      }
    } catch (error) {
      logger.error('❌ Broadcast failed:', error);
    }
  }

  // Get unique device identifier
  getDeviceId() {
    let deviceId = this.getRaw('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      this.setRaw('device_id', deviceId);
      
      // Device ID sadece unique identifier - veri silme işlemi yapma
      logger.info('🆔 New device ID created:', deviceId);
    }
    return deviceId;
  }

  // Notify about storage changes
  notifyStorageChange(fullKey, newValue) {
    window.dispatchEvent(new CustomEvent('kirilmazlar_storage_change', {
      detail: {
        key: fullKey,
        value: newValue,
        timestamp: Date.now()
      }
    }));
  }

  // Raw storage operations - always use localStorage
  getRaw(key) {
    const value = localStorage.getItem(this.prefix + key);
    if (this.isDevelopment) {
      logger.debug(`🔍 Storage Read: ${key}`, value);
    }
    return value;
  }

  setRaw(key, value) {
    localStorage.setItem(this.prefix + key, value);
    // Enhanced sync in development
    if (this.isDevelopment) {
      logger.debug(`💾 Storage Write: ${key}`, value);
      this.broadcastChange(key, value);
    }
  }

  removeRaw(key) {
    localStorage.removeItem(this.prefix + key);
    if (this.isDevelopment) {
      logger.debug(`🗑️ Storage Delete: ${key}`);
      this.broadcastChange(key, null);
    }
  }

  // Storage sağlığını izle
  setupStorageHealthMonitor() {
    if (this.isDevelopment) {
      setInterval(() => {
        this.checkStorageHealth();
      }, 5000); // Her 5 saniyede bir kontrol et
    }
  }

  // Storage sağlık kontrolü
  checkStorageHealth() {
    try {
      const totalItems = Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .length;

      const usedSpace = this.getStorageUsage();
      const maxSpace = 5 * 1024 * 1024; // 5MB

      logger.info('📊 Storage Health Check:', {
        totalItems,
        usedSpace: `${(usedSpace / 1024 / 1024).toFixed(2)}MB`,
        maxSpace: '5MB',
        usage: `${((usedSpace / maxSpace) * 100).toFixed(2)}%`
      });

      if (usedSpace > maxSpace * 0.8) {
        logger.warn('⚠️ Storage space is running low!');
      }
    } catch (error) {
      logger.error('❌ Storage health check failed:', error);
    }
  }

  // Storage kullanımını hesapla
  getStorageUsage() {
    let totalSize = 0;
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        totalSize += localStorage.getItem(key).length * 2; // UTF-16
      });
    return totalSize;
  }

  // Tüm storage verilerini temizle
  clearAllData() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        localStorage.removeItem(key);
      });
    logger.info('🧹 Storage cleared');
  }

  // JSON operations with error handling
  get(key, defaultValue = null) {
    try {
      const raw = this.getRaw(key);
      if (raw === null || raw === 'undefined' || raw === 'null') {
        return defaultValue;
      }

      // Raw string değerler için (data_version, device_id vb.)
      if (key === 'data_version' || key === 'device_id') {
        return raw;
      }

      // JSON olarak parse et
      return JSON.parse(raw);
    } catch (error) {
      logger.error(`Storage get error for key "${key}":`, error);
      // Parse hatası durumunda raw değeri döndür
      const raw = this.getRaw(key);
      if (raw && typeof raw === 'string') {
        return raw;
      }
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      let finalValue;

      // Raw string değerler için (data_version, device_id vb.)
      if (key === 'data_version' || key === 'device_id') {
        finalValue = value.toString();
      } else {
        finalValue = JSON.stringify(value);
      }

      this.setRaw(key, finalValue);

      // Broadcast to other devices
      this.broadcastChange(key, finalValue);

      // Trigger local events
      this.triggerChangeEvent(key, value);

      logger.info('💾 Stored with cross-device sync:', key);
      return true;
    } catch (error) {
      logger.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  remove(key) {
    this.removeRaw(key);

    // Broadcast removal to other devices  
    this.broadcastChange(key, null);

    // Trigger local events
    this.triggerChangeEvent(key, null);
  }

  // Cross-tab communication
  triggerChangeEvent(key, value) {
    window.dispatchEvent(new CustomEvent('kirilmazlar_storage_change', {
      detail: {
        key,
        fullKey: this.prefix + key,
        value,
        timestamp: Date.now()
      }
    }));

    // Also trigger storage event for backward compatibility
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.prefix + key,
      newValue: JSON.stringify(value),
      storageArea: localStorage
    }));
  }

  // Event listener for storage changes
  onChange(callback) {
    window.addEventListener('kirilmazlar_storage_change', (event) => {
      callback(event.detail);
    });
  }

  // Migration from old keys
  migrate() {
    logger.info('🔄 Migrating storage data...');

    const migrations = [
      { from: 'products', to: 'products' },
      { from: 'orders', to: 'orders' },
      { from: 'productCategories', to: 'categories' },
      { from: 'sellerOrders', to: 'seller_orders' },
      { from: 'customerOrders', to: 'customer_orders' },
      { from: 'users', to: 'users' },
      { from: 'businessInfo', to: 'business_info' }
    ];

    migrations.forEach(({ from, to }) => {
      const oldData = localStorage.getItem(from);
      if (oldData && !this.getRaw(to)) {
        logger.info(`📦 Migrating ${from} -> ${to}`);
        this.setRaw(to, oldData);
        localStorage.removeItem(from);
      }
    });
  }

  // Clear all data
  clear() {
    // Always clear localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
    logger.info(`🧹 Cleared ${keys.length} localStorage keys`);

    // Broadcast clear to other windows
    if (this.isDevelopment) {
      this.broadcastChange('storage_cleared', { timestamp: Date.now() });
    }
  }

  // Get all keys
  getAllKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  // Debug info
  debug() {
    const keys = this.getAllKeys();
    logger.info('🔍 KIRILMAZLAR STORAGE DEBUG');
    logger.info('============================');
    logger.info('Mode:', this.isDevelopment ? 'LOCALSTORAGE (Enhanced Dev Sync)' : 'LOCALSTORAGE (Production)');
    logger.info('Version:', this.version);
    logger.info('Keys:', keys.length);

    keys.forEach(key => {
      const rawValue = this.getRaw(key);

      // Raw string değerler için
      if (key === 'data_version' || key === 'device_id') {
        logger.info(`  ${key}:`, rawValue);
        return;
      }

      // JSON değerler için parse etmeye çalış
      try {
        const value = JSON.parse(rawValue);
        if (Array.isArray(value)) {
          logger.info(`  ${key}: Array[${value.length}]`);
        } else if (typeof value === 'object' && value !== null) {
          logger.info(`  ${key}: Object[${Object.keys(value).length} keys]`);
        } else {
          logger.info(`  ${key}:`, value);
        }
      } catch (error) {
        logger.info(`  ${key}: Raw[${rawValue?.length || 0} chars]`);
      }
    });
  }

  // Subscribe to storage changes for a specific key
  subscribe(key, callback) {
    const handler = (event) => {
      if (event.detail && (event.detail.key === key || event.detail.key === this.prefix + key)) {
        const data = this.get(key);
        callback(data);
      }
    };

    window.addEventListener('kirilmazlar_storage_change', handler);

    return () => {
      window.removeEventListener('kirilmazlar_storage_change', handler);
    };
  }

  // Singleton pattern - getInstance static method
  static getInstance() {
    if (!KirilmazlarStorage.instance) {
      KirilmazlarStorage.instance = new KirilmazlarStorage();
    }
    return KirilmazlarStorage.instance;
  }
}

// TRUE SINGLETON - Only one instance allowed across all imports
let globalStorageInstance = null;

function getStorageInstance() {
  if (!globalStorageInstance) {
    globalStorageInstance = new KirilmazlarStorage();
    logger.info('🔧 Created SINGLETON storage instance');
  }
  return globalStorageInstance;
}

// Export the singleton instance
const storageInstance = getStorageInstance();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.KirilmazlarStorage = KirilmazlarStorage;
  window.storage = storageInstance;

  // Debug utilities
  window.storageDebug = {
    clearAllStorageData: () => {
      const keys = Object.keys(localStorage);
      const kirilmazlarKeys = keys.filter(key => key.startsWith('kirilmazlar_'));
      kirilmazlarKeys.forEach(key => localStorage.removeItem(key));
      logger.info('🧹 Cleared all Kırılmazlar storage data:', kirilmazlarKeys.length + ' keys');
      return kirilmazlarKeys;
    },

    listAllStorageKeys: () => {
      const keys = Object.keys(localStorage);
      const kirilmazlarKeys = keys.filter(key => key.startsWith('kirilmazlar_'));
      logger.info('🔍 All Kırılmazlar storage keys:', kirilmazlarKeys);
      return kirilmazlarKeys;
    },

    getStorageInfo: () => {
      const info = {
        prefix: storageInstance.prefix,
        hostname: window.location.hostname,
        port: window.location.port,
        isDevelopment: storageInstance.isDevelopment,
        totalKeys: Object.keys(localStorage).filter(key => key.startsWith('kirilmazlar_')).length
      };
      logger.info('📊 Storage Info:', info);
      return info;
    }
  };

  window.getStorageInstance = getStorageInstance;
}

export default storageInstance;
