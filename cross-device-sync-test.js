/**
 * CROSS-DEVICE SYNC TEST
 * Mobile vs Desktop localStorage sync test script
 */

console.log('🌐 CROSS-DEVICE SYNC TEST');
console.log('========================');

// Test Device Info
const deviceInfo = {
  userAgent: navigator.userAgent,
  screen: `${screen.width}x${screen.height}`,
  platform: navigator.platform,
  timestamp: new Date().toISOString()
};

console.log('📱 Device Info:', deviceInfo);

// Test 1: Current storage state
console.log('\n📊 Current localStorage state:');
const allKeys = Object.keys(localStorage);
const kirilmazlarKeys = allKeys.filter(key => key.startsWith('kirilmazlar_'));

kirilmazlarKeys.forEach(key => {
  try {
    const value = localStorage.getItem(key);
    const parsed = JSON.parse(value);
    const type = Array.isArray(parsed) ? `array[${parsed.length}]` : typeof parsed;
    console.log(`  ${key}: ${type}`);
  } catch (e) {
    console.log(`  ${key}: raw string`);
  }
});

// Test 2: Cross-device sync listener
window.addEventListener('storage_remote_update', (event) => {
  console.log('🔄 Remote update received:', event.detail);
  
  // Show notification
  if (typeof window.showNotification === 'function') {
    window.showNotification('Data updated from another device!');
  } else {
    console.log('📢 Data updated from another device!');
  }
});

// Test 3: Manual sync test
window.testCrossDeviceSync = function() {
  console.log('\n🧪 Testing cross-device sync...');
  
  // Add test order
  const testOrder = {
    id: `TEST-${Date.now()}`,
    device: deviceInfo.platform,
    timestamp: new Date().toISOString(),
    products: [
      { name: 'Cross-Device Test Product', price: 99.99 }
    ],
    total: 99.99
  };
  
  // Get current orders
  const orders = JSON.parse(localStorage.getItem('kirilmazlar_orders') || '[]');
  orders.push(testOrder);
  
  // Save with cross-device sync
  localStorage.setItem('kirilmazlar_orders', JSON.stringify(orders));
  
  // Trigger storage event manually
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'kirilmazlar_orders',
    newValue: JSON.stringify(orders),
    oldValue: null,
    url: window.location.href
  }));
  
  console.log('✅ Test order added:', testOrder.id);
  console.log('📡 Check other devices for sync!');
  
  return testOrder;
};

// Test 4: BroadcastChannel check
if (typeof BroadcastChannel !== 'undefined') {
  console.log('✅ BroadcastChannel supported');
  
  const testChannel = new BroadcastChannel('kirilmazlar_sync');
  testChannel.addEventListener('message', (event) => {
    console.log('📡 BroadcastChannel message:', event.data);
  });
  
  // Test broadcast
  window.testBroadcast = function() {
    testChannel.postMessage({
      type: 'test',
      message: 'Hello from ' + deviceInfo.platform,
      timestamp: Date.now()
    });
    console.log('📡 Test broadcast sent');
  };
} else {
  console.warn('❌ BroadcastChannel not supported');
}

// Test 5: Real-time order monitoring
window.monitorOrders = function() {
  console.log('\n👀 Monitoring orders in real-time...');
  
  let lastOrderCount = 0;
  const currentOrders = JSON.parse(localStorage.getItem('kirilmazlar_orders') || '[]');
  lastOrderCount = currentOrders.length;
  
  console.log(`📊 Current order count: ${lastOrderCount}`);
  
  const interval = setInterval(() => {
    const orders = JSON.parse(localStorage.getItem('kirilmazlar_orders') || '[]');
    if (orders.length !== lastOrderCount) {
      console.log(`🔄 Order count changed: ${lastOrderCount} → ${orders.length}`);
      lastOrderCount = orders.length;
      
      if (orders.length > 0) {
        const latestOrder = orders[orders.length - 1];
        console.log('📦 Latest order:', latestOrder);
      }
    }
  }, 1000);
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('⏹️ Monitoring stopped');
  }, 30000);
  
  return interval;
};

console.log('\n🎯 Available test functions:');
console.log('• testCrossDeviceSync() - Add test order');
console.log('• testBroadcast() - Test broadcast channel');
console.log('• monitorOrders() - Monitor real-time changes');
console.log('\n📱 Run these from mobile and desktop simultaneously!');
