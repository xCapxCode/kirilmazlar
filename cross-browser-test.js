/**
 * CROSS BROWSER SYNC TEST
 * VSCode vs External Browser localStorage sync kontrolü
 */

console.log('🔍 CROSS BROWSER SYNC TEST');
console.log('==========================');

// Test 1: Mevcut localStorage durumu
console.log('\n📊 Mevcut localStorage durumu:');
const allKeys = Object.keys(localStorage);
console.log('Tüm keys:', allKeys);

// Test 2: Kirilmazlar keys kontrolü  
const kirilmazlarKeys = allKeys.filter(key => key.startsWith('kirilmazlar_'));
console.log('Kirilmazlar keys:', kirilmazlarKeys);

// Test 3: Eski format keys (bunlar varsa problem!)
const oldKeys = allKeys.filter(key => 
  key === 'products' || 
  key === 'orders' || 
  key === 'sellerOrders'
);
console.log('⚠️ Eski format keys:', oldKeys);

// Test 4: Browser identification
console.log('\n🌐 Browser Info:');
console.log('User Agent:', navigator.userAgent);
console.log('Is VSCode?:', navigator.userAgent.includes('VSCode'));

// Test 5: Data consistency test
function testDataConsistency() {
  console.log('\n🧪 Data consistency test...');
  
  // Test data ekle
  const testData = {
    test_time: new Date().toISOString(),
    test_browser: navigator.userAgent.includes('VSCode') ? 'VSCode' : 'External',
    test_id: Math.random().toString(36).substr(2, 9)
  };
  
  localStorage.setItem('kirilmazlar_browser_test', JSON.stringify(testData));
  
  // Okuyup doğrula
  const readData = JSON.parse(localStorage.getItem('kirilmazlar_browser_test'));
  
  console.log('✅ Test data yazıldı:', testData);
  console.log('✅ Test data okundu:', readData);
  
  const isConsistent = JSON.stringify(testData) === JSON.stringify(readData);
  console.log(isConsistent ? '✅ Data consistent' : '❌ Data inconsistent');
  
  return { testData, readData, isConsistent };
}

// Test 6: Storage event listener
window.addEventListener('storage', (e) => {
  console.log('🔄 Storage event detected:', {
    key: e.key,
    oldValue: e.oldValue,
    newValue: e.newValue,
    url: e.url
  });
});

// Test çalıştır
const testResult = testDataConsistency();

// Report
console.log('\n📋 RAPOR:');
console.log('Browser:', testResult.testData.test_browser);
console.log('Consistency:', testResult.isConsistent ? 'OK' : 'PROBLEM');
console.log('Old keys:', oldKeys.length > 0 ? 'TEMIZLENMELI' : 'TEMIZ');

// Export test function
window.runCrossBrowserTest = testDataConsistency;
