// LocalStorage Key Yönetimi ve Veri Tutarlılığı
const STORAGE_KEYS = {
  PRODUCTS: 'kirilmazlar_products',
  CATEGORIES: 'kirilmazlar_categories', 
  ORDERS: 'kirilmazlar_orders',
  CUSTOMERS: 'kirilmazlar_customers',
  DASHBOARD: 'kirilmazlar_dashboard',
  USER_SETTINGS: 'kirilmazlar_user_settings',
  CART: 'kirilmazlar_cart',
  VERSION: 'kirilmazlar_data_version'
};

const CURRENT_VERSION = '1.0.0';

// Veri versiyonu kontrolü ve migration
const checkDataVersion = () => {
  const savedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  
  if (savedVersion !== CURRENT_VERSION) {
    console.log(`🔄 Veri versiyonu güncellemesi: ${savedVersion} → ${CURRENT_VERSION}`);
    
    // Versiyon uyumsuzsa cache temizle
    clearAppData();
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    
    return false; // Yeni veriler yüklenmeli
  }
  
  return true; // Mevcut veriler geçerli
};

// Tüm uygulama verilerini temizle
const clearAppData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Eski key'leri de temizle
  const oldKeys = [
    'products', 'productCategories', 'orders', 'customers', 
    'dashboardData', 'userSettings', 'cartItems'
  ];
  
  oldKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  sessionStorage.clear();
  console.log('🧹 Tüm uygulama verileri temizlendi');
};

// Güvenli localStorage get
const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`❌ ${key} verisi okunamadı:`, error);
    return defaultValue;
  }
};

// Güvenli localStorage set
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ ${key} verisi kaydedilemedi:`, error);
    return false;
  }
};

export { 
  STORAGE_KEYS, 
  checkDataVersion, 
  clearAppData, 
  safeGetItem, 
  safeSetItem,
  CURRENT_VERSION 
};
