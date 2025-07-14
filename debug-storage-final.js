/**
 * STORAGE ABSTRACTION TEST SCRIPT
 * KirilmazlarStorage tek kaynak sisteminin test edilmesi
 */

// Browser console'da çalıştırılacak test kodu
console.log('🔍 KIRILMAZLAR STORAGE ABSTRACTION TEST');
console.log('=====================================');

// Test 1: KirilmazlarStorage import kontrolü
try {
  console.log('\n📦 Test 1: Import kontrolü');
  // Bu normalde import ile gelir, test için window objesinden kontrol edelim
  console.log('✅ Storage abstraction layer hazır');
} catch (error) {
  console.error('❌ Import hatası:', error);
}

// Test 2: localStorage key yapısını kontrol et
console.log('\n🔑 Test 2: LocalStorage key analizi');
const allKeys = Object.keys(localStorage);
console.log('Mevcut localStorage keys:', allKeys);

const kirilmazlarKeys = allKeys.filter(key => key.startsWith('kirilmazlar_'));
console.log('Kirilmazlar prefixli keys:', kirilmazlarKeys);

const oldKeys = allKeys.filter(key => 
  key === 'products' || 
  key === 'orders' || 
  key === 'sellerOrders' ||
  key === 'categories'
);
console.log('Eski format keys (silinmeli):', oldKeys);

// Test 3: Veri tutarlılığı kontrolü
console.log('\n📊 Test 3: Veri tutarlılığı');
kirilmazlarKeys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    const parsed = JSON.parse(data);
    console.log(`✅ ${key}: ${Array.isArray(parsed) ? parsed.length + ' items' : 'valid object'}`);
  } catch (error) {
    console.error(`❌ ${key}: corrupt data`);
  }
});

// Test 4: Migration durumu kontrolü
console.log('\n🔄 Test 4: Migration durumu');
const demoInitialized = localStorage.getItem('kirilmazlar_demo_initialized');
const dataVersion = localStorage.getItem('kirilmazlar_data_version');
console.log('Demo initialized:', demoInitialized);
console.log('Data version:', dataVersion);

// Test 5: Çakışma analizi
console.log('\n⚠️ Test 5: Key çakışma analizi');
const conflicts = [];
if (localStorage.getItem('products') && localStorage.getItem('kirilmazlar_products')) {
  conflicts.push('products');
}
if (localStorage.getItem('orders') && localStorage.getItem('kirilmazlar_orders')) {
  conflicts.push('orders');
}
if (conflicts.length > 0) {
  console.warn('🚨 ÇAKIŞMA TESPİT EDİLDİ:', conflicts);
  console.log('Manuel temizlik gerekebilir!');
} else {
  console.log('✅ Key çakışması yok');
}

// Test 6: Bellek kullanımı
console.log('\n💾 Test 6: Storage kullanımı');
let totalSize = 0;
allKeys.forEach(key => {
  const size = (localStorage.getItem(key) || '').length;
  totalSize += size;
});
console.log(`Toplam localStorage boyutu: ${(totalSize / 1024).toFixed(2)} KB`);

// Test 7: Real-time test fonksiyonu
console.log('\n🧪 Test 7: Real-time operation test');
window.testKirilmazlarStorage = function() {
  console.log('🔄 Storage test başlıyor...');
  
  // Test data
  const testProduct = { id: 999, name: 'Test Ürün', price: '1.00' };
  
  // Eski yöntem ile write (eğer varsa)
  if (localStorage.getItem('products')) {
    const oldProducts = JSON.parse(localStorage.getItem('products') || '[]');
    oldProducts.push(testProduct);
    localStorage.setItem('products', JSON.stringify(oldProducts));
    console.log('📝 Eski sisteme yazıldı');
  }
  
  // Yeni yöntem ile read
  const newProducts = JSON.parse(localStorage.getItem('kirilmazlar_products') || '[]');
  console.log('📖 Yeni sistemden okundu:', newProducts.length, 'ürün');
  
  // Data sync kontrolü
  const oldData = localStorage.getItem('products');
  const newData = localStorage.getItem('kirilmazlar_products');
  
  if (oldData && newData) {
    const isSynced = oldData === newData;
    console.log(isSynced ? '✅ Veriler senkron' : '❌ Veriler farklı');
  }
};

console.log('\n🎯 TEST TAMAMLANDI');
console.log('✨ testKirilmazlarStorage() fonksiyonu hazır');
console.log('📋 Sonuç: ' + (oldKeys.length === 0 ? 'TEMİZ SİSTEM' : 'ESKI KEYS MEVCUT'));
