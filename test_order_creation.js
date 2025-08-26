// Test script for order creation issue
import { orderService } from './src/services/orderService.js';
import storage from './src/core/storage/index.js';

// Test order creation functionality
async function testOrderCreation() {
  console.log('🧪 TESTING ORDER CREATION...');
  
  try {
    // Clear existing orders for clean test
    await storage.set('customer_orders', []);
    await storage.set('orders', []);
    
    // Test order data - orderService beklenen format
    const testOrderData = {
      customerId: 'test-customer-123',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '555-0123',
      items: [
        {
          id: 'product-1',
          productId: 'product-1',
          name: 'Test Product',
          price: 100,
          quantity: 2
        }
      ],
      total: 200,
      deliveryAddress: 'Test Address',
      paymentMethod: 'Nakit',
      notes: 'Test order creation'
    };
    
    console.log('📦 Creating test order with data:', testOrderData);
    
    // Create order
    const newOrder = await orderService.create(testOrderData);
    
    console.log('✅ Order created successfully:', {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerId: newOrder.customerId,
      status: newOrder.status
    });
    
    // Verify storage
    const customerOrders = await storage.get('customer_orders', []);
    const sellerOrders = await storage.get('orders', []);
    
    console.log('📊 Storage verification:');
    console.log('- customer_orders count:', customerOrders.length);
    console.log('- orders count:', sellerOrders.length);
    
    // Test retrieval
    const retrievedOrder = await orderService.getById(newOrder.id);
    console.log('🔍 Retrieved order:', retrievedOrder ? 'SUCCESS' : 'FAILED');
    
    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber
    };
    
  } catch (error) {
    console.error('❌ Order creation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
testOrderCreation().then(result => {
  console.log('🏁 Test completed:', result);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});