import { clearAppData } from './storageManager';

// Cache Temizleme ve Veri Sıfırlama Utility
const resetApplication = () => {
  console.log('🧹 Uygulama cache tamamen temizleniyor...');
  
  // Yeni storage manager ile temizle
  clearAppData();
  
  // Ek güvenlik için manuel temizlik
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.includes('kirilmazlar') || 
        key.includes('product') || 
        key.includes('order') || 
        key.includes('cart') ||
        key.includes('customer') ||
        key.includes('dashboard')) {
      localStorage.removeItem(key);
      console.log(`🗑️ ${key} temizlendi`);
    }
  });
  
  // SessionStorage tamamen temizle
  sessionStorage.clear();
  console.log('🗑️ SessionStorage tamamen temizlendi');
  
  // Cache temizliği sonrası sayfayı yenile
  setTimeout(() => {
    console.log('🔄 Sayfa yenileniyor...');
    window.location.reload();
  }, 1000);
};

// Global fonksiyon olarak tanımla
window.resetApp = resetApplication;
window.clearCache = resetApplication; // Alternatif isim

export default resetApplication;
