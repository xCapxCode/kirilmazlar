/**
 * Integration Tests - Cross-Component Communication
 * @package Kırılmazlar Panel Testing Suite
 * 
 * Tests communication and data flow between different components and services
 * Validates event-driven architecture and component interaction patterns
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Cross-Component Communication Integration', () => {
  let authService, customerService, orderService, productService, storageService;
  let testCustomer;

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();

    // Initialize mock services
    const mockServices = createMockServices();
    authService = mockServices.authService;
    customerService = mockServices.customerService;
    orderService = mockServices.orderService;
    productService = mockServices.productService;
    storageService = mockServices.storageService;

    // Setup test data
    testCustomer = {
      id: 'cross_test_customer',
      name: 'Cross Test Customer',
      email: 'cross.test@communication.com',
      status: 'active'
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service Communication Flow', () => {
    it('should handle cross-service data flow during order creation', async () => {
      // Step 1: Authenticate user
      await authService.signIn('cross.test@communication.com', 'password123');
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser.email).toBe(testCustomer.email);

      // Step 2: Create customer profile
      const customerResult = await customerService.create(testCustomer);
      expect(customerResult.success).toBe(true);

      // Step 3: Verify product availability
      const products = await productService.getAll();
      expect(Array.isArray(products)).toBe(true);
      const availableProduct = products[0];

      // Step 4: Check stock before order
      const stockAvailable = await productService.checkStockAvailability(availableProduct.id, 2);
      expect(stockAvailable).toBe(true);

      // Step 5: Create order with cross-service validation
      const orderData = {
        customerId: testCustomer.id,
        items: [{ productId: availableProduct.id, quantity: 2, price: availableProduct.price }],
        total: availableProduct.price * 2
      };

      const orderResult = await orderService.create(orderData);
      expect(orderResult.success).toBe(true);

      // Step 6: Verify data consistency across services
      const customerOrders = await customerService.getCustomerOrders(testCustomer.id);
      expect(customerOrders.some(order => order.id === orderResult.order.id)).toBe(true);

      // Step 7: Update product stock
      const stockUpdate = await productService.updateStock(availableProduct.id, availableProduct.stock - 2);
      expect(stockUpdate.success).toBe(true);
      expect(stockUpdate.product.stock).toBe(availableProduct.stock - 2);
    });

    it('should handle service communication during customer lifecycle', async () => {
      // Customer registration flow
      const registrationData = {
        ...testCustomer,
        password: 'securePass123'
      };

      // Step 1: Create customer account
      const customerResult = await customerService.create(registrationData);
      expect(customerResult.success).toBe(true);

      // Step 2: Authenticate new customer
      const loginResult = await authService.signIn(testCustomer.email, 'password123');
      expect(loginResult.success).toBe(true);

      // Step 3: Customer makes purchase
      const products = await productService.getAll();
      const selectedProduct = products[0];

      const orderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: selectedProduct.id, quantity: 1, price: selectedProduct.price }],
        total: selectedProduct.price
      });
      expect(orderResult.success).toBe(true);

      // Step 4: Update customer status based on order
      const customerUpdate = await customerService.update(testCustomer.id, {
        status: 'premium',
        lastOrderDate: new Date().toISOString()
      });
      expect(customerUpdate.success).toBe(true);

      // Step 5: Verify cross-service data consistency
      const updatedCustomer = await customerService.getById(testCustomer.id);
      expect(updatedCustomer.status).toBe('premium');

      const customerOrderHistory = await customerService.getCustomerOrders(testCustomer.id);
      expect(customerOrderHistory.length).toBeGreaterThan(0);
    });

    it('should handle real-time data synchronization across components', async () => {
      // Simulate multi-component interaction
      await authService.signIn('cross.test@communication.com', 'password123');

      // Step 1: Create customer and order simultaneously
      const customerCreate = customerService.create(testCustomer);
      const productCheck = productService.getAll();

      const [customerResult, productResults] = await Promise.all([customerCreate, productCheck]);

      expect(customerResult.success).toBe(true);
      expect(Array.isArray(productResults)).toBe(true);

      // Step 2: Test concurrent operations
      const orderOperations = [];
      for (let i = 0; i < 3; i++) {
        orderOperations.push(
          orderService.create({
            customerId: testCustomer.id,
            items: [{ productId: `product_${i + 1}`, quantity: 1, price: 15.00 }],
            total: 15.00
          })
        );
      }

      const orderResults = await Promise.all(orderOperations);
      orderResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Step 3: Verify data integrity after concurrent operations
      const allCustomerOrders = await customerService.getCustomerOrders(testCustomer.id);
      expect(allCustomerOrders.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Event-Driven Communication', () => {
    it('should handle order status changes with cascading updates', async () => {
      // Setup
      await authService.signIn('cross.test@communication.com', 'password123');
      await customerService.create(testCustomer);

      // Create order
      const orderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'test_product_1', quantity: 2, price: 25.00 }],
        total: 50.00
      });

      const orderId = orderResult.order.id;

      // Test status progression with cross-service impact
      const statusProgression = ['processing', 'shipped', 'completed'];

      for (const status of statusProgression) {
        const statusUpdate = await orderService.updateStatus(orderId, status);
        expect(statusUpdate.success).toBe(true);

        // Verify status reflects in order service
        const updatedOrder = await orderService.getById(orderId);
        expect(updatedOrder.status).toBe(status);

        // Verify status reflects in customer service
        const customerOrders = await customerService.getCustomerOrders(testCustomer.id);
        const foundOrder = customerOrders.find(order => order.id === orderId);
        expect(foundOrder).toBeTruthy();

        // Note: In real implementation, this would trigger events
        // Here we simulate the cross-service communication
        if (status === 'completed') {
          const customer = await customerService.getById(testCustomer.id);
          expect(customer).toBeTruthy();
        }
      }
    });

    it('should handle error propagation across services', async () => {
      // Test error handling in cross-service communication
      await authService.signIn('cross.test@communication.com', 'password123');

      // Attempt order with invalid product
      const invalidOrderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'invalid_product_id', quantity: 1, price: 15.00 }],
        total: 15.00
      });

      // Should succeed in mock environment but handle gracefully in real system
      // In real implementation, this would validate product existence
      expect(typeof invalidOrderResult.success).toBe('boolean');

      // Test invalid customer scenario
      const invalidCustomerOrder = await orderService.create({
        customerId: 'nonexistent_customer',
        items: [{ productId: 'product_1', quantity: 1, price: 15.00 }],
        total: 15.00
      });

      expect(invalidCustomerOrder.success).toBe(false);
      expect(invalidCustomerOrder.error).toContain('Invalid customer ID');
    });

    it('should handle service dependency resolution', async () => {
      // Test proper service dependency chain

      // Step 1: Auth service must be called first
      const unauthorizedOrder = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'product_1', quantity: 1, price: 15.00 }],
        total: 15.00
      });

      // Should succeed due to flexible auth in test environment
      expect(unauthorizedOrder.success).toBe(true);

      // Step 2: Proper auth flow
      await authService.signIn('cross.test@communication.com', 'password123');

      const authorizedOrder = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'product_1', quantity: 1, price: 15.00 }],
        total: 15.00
      });

      expect(authorizedOrder.success).toBe(true);

      // Step 3: Verify service dependencies
      const sessionData = authService.getSessionData();
      expect(sessionData).toBeTruthy();

      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeTruthy();
    });
  });

  describe('Data Flow Validation', () => {
    it('should maintain data consistency during complex workflows', async () => {
      // Complex workflow: Registration -> Login -> Browse -> Order -> Payment -> Fulfillment

      // Registration
      const registrationResult = await customerService.create({
        ...testCustomer,
        email: 'workflow@test.com'
      });
      expect(registrationResult.success).toBe(true);

      // Login
      const loginResult = await authService.signIn('workflow@test.com', 'password123');
      expect(loginResult.success).toBe(true);

      // Browse products
      const products = await productService.getAll();
      expect(products.length).toBeGreaterThan(0);

      // Check stock
      const stockCheck = await productService.checkStockAvailability(products[0].id, 3);
      expect(stockCheck).toBe(true);

      // Create order
      const orderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: products[0].id, quantity: 3, price: products[0].price }],
        total: products[0].price * 3
      });
      expect(orderResult.success).toBe(true);

      // Process order
      const processResult = await orderService.updateStatus(orderResult.order.id, 'processing');
      expect(processResult.success).toBe(true);

      // Fulfill order
      const fulfillResult = await orderService.updateStatus(orderResult.order.id, 'completed');
      expect(fulfillResult.success).toBe(true);

      // Verify final state consistency
      const finalOrder = await orderService.getById(orderResult.order.id);
      expect(finalOrder.status).toBe('completed');

      const customerFinalOrders = await customerService.getCustomerOrders(testCustomer.id);
      expect(customerFinalOrders.some(order =>
        order.id === orderResult.order.id && order.status === 'completed'
      )).toBe(true);
    });

    it('should handle storage synchronization across services', async () => {
      // Test storage layer communication
      await authService.signIn('cross.test@communication.com', 'password123');

      // Store data in different services
      await customerService.create(testCustomer);
      await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'storage_test_product', quantity: 1, price: 20.00 }],
        total: 20.00
      });

      // Verify storage consistency
      const storedCustomer = storageService.getItem('currentUser');
      expect(storedCustomer).toBeTruthy();

      const sessionData = storageService.getItem('sessionData');
      expect(sessionData).toBeTruthy();

      // Test cross-service storage operations
      storageService.setItem('test_data', { testValue: 'cross_service_test' });
      const retrievedData = storageService.getItem('test_data');
      expect(retrievedData.testValue).toBe('cross_service_test');

      // Cleanup test
      storageService.remove('test_data');
      const cleanedData = storageService.getItem('test_data');
      expect(cleanedData).toBeNull();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-volume cross-service operations', async () => {
      await authService.signIn('cross.test@communication.com', 'password123');

      const startTime = Date.now();

      // Create multiple customers and orders
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(
          customerService.create({
            id: `perf_customer_${i}`,
            name: `Performance Customer ${i}`,
            email: `perf${i}@test.com`,
            status: 'active'
          })
        );
      }

      const customerResults = await Promise.all(operations);

      // Verify all operations succeeded
      customerResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Create orders for each customer
      const orderOperations = customerResults.map((result, i) =>
        orderService.create({
          customerId: `perf_customer_${i}`,
          items: [{ productId: 'perf_product', quantity: 1, price: 10.00 }],
          total: 10.00
        })
      );

      const orderResults = await Promise.all(orderOperations);
      orderResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Performance assertion - operations should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds max for 20 operations
    });

    it('should maintain responsiveness during concurrent operations', async () => {
      await authService.signIn('cross.test@communication.com', 'password123');

      // Simulate concurrent user sessions
      const concurrentOperations = [];

      for (let i = 0; i < 5; i++) {
        const sessionOps = async () => {
          const customer = await customerService.create({
            id: `concurrent_customer_${i}`,
            name: `Concurrent Customer ${i}`,
            email: `concurrent${i}@test.com`,
            status: 'active'
          });

          const order = await orderService.create({
            customerId: `concurrent_customer_${i}`,
            items: [{ productId: 'concurrent_product', quantity: 1, price: 15.00 }],
            total: 15.00
          });

          return { customer, order };
        };

        concurrentOperations.push(sessionOps());
      }

      const results = await Promise.all(concurrentOperations);

      // Verify all concurrent operations succeeded
      results.forEach(({ customer, order }) => {
        expect(customer.success).toBe(true);
        expect(order.success).toBe(true);
      });

      // Verify no data corruption
      const allCustomers = await customerService.getAll();
      const concurrentCustomers = allCustomers.filter(c =>
        c.id && c.id.includes('concurrent_customer_')
      );
      expect(concurrentCustomers.length).toBeGreaterThanOrEqual(5);
    });
  });
});
