/**
 * DEPLOY CONFIGURATION
 * Production deploy için önemli ayarlar
 */

export const DEPLOY_CONFIG = {
  // Production domain
  PRODUCTION_DOMAIN: 'kirilmazlar.com',

  // Development hosts (localStorage farklı olacak)
  DEVELOPMENT_HOSTS: [
    'localhost',
    '127.0.0.1',
    '192.168.1.101',
    '192.168.1.114'
  ],

  // İlk veri yükleme stratejisi
  INITIAL_DATA_STRATEGY: {
    // Development: Her host'ta aynı veri
    development: 'force_load_same_data',

    // Production: Sadece boşsa yükle
    production: 'load_if_empty'
  },

  // Storage senkronizasyon
  STORAGE_SYNC: {
    // Development: Cross-device sync kapalı (farklı host'lar)
    development: false,

    // Production: Cross-device sync açık (aynı domain)
    production: true
  }
};

// Mevcut ortamı tespit et
export const getCurrentEnvironment = () => {
  const hostname = window.location.hostname;

  if (DEPLOY_CONFIG.DEVELOPMENT_HOSTS.includes(hostname)) {
    return 'development';
  }

  if (hostname.includes(DEPLOY_CONFIG.PRODUCTION_DOMAIN)) {
    return 'production';
  }

  return 'development'; // Default
};

// Deploy durumu kontrol et
export const getDeployStatus = () => {
  const env = getCurrentEnvironment();
  const hostname = window.location.hostname;

  return {
    environment: env,
    hostname,
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    storageSync: DEPLOY_CONFIG.STORAGE_SYNC[env],
    dataStrategy: DEPLOY_CONFIG.INITIAL_DATA_STRATEGY[env]
  };
};