/**
 * Integration Tests - Customer Order Workflow
 * @package Kırılmazlar Panel Testing Suite
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Customer Order Workflow Integration', () => {
  let testCustomer;
  let authService, customerService, orderService, productService;

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();

    // Use mock services
    const mockServices = createMockServices();
    authService = mockServices.authService;
    customerService = mockServices.customerService;
    orderService = mockServices.orderService;
    productService = mockServices.productService;

    // Setup test customer that matches mock service expectations
    testCustomer = {
      id: 'test_customer_integration',
      name: 'Test Customer',
      email: 'test_customer_integration@example.com', // Match mock service pattern
      phone: '0555 000 0000'
    };

    // Test products are provided by mock service
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Complete Customer Journey', () => {
    it('should handle complete customer order flow', async () => {
      // 1. Customer authentication
      const loginResult = await authService.signIn(testCustomer.email, 'password123');
      expect(loginResult.success).toBe(true);

      // 2. Customer profile verification
      const customer = await customerService.getById(testCustomer.id);
      expect(customer).toBeDefined();
      expect(customer.email).toBe(`${testCustomer.id}@example.com`); // Mock service pattern

      // 3. Product browsing
      const products = await productService.getAll();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);

      // 4. Order creation
      const orderData = {
        customerId: testCustomer.id,
        items: [
          { productId: 'product_1', quantity: 2, price: 15.50 },
          { productId: 'product_2', quantity: 1, price: 12.00 }
        ],
        total: 43.00
      };

      const orderResult = await orderService.create(orderData);
      expect(orderResult.success).toBe(true);
      expect(orderResult.order.customerId).toBe(testCustomer.id);

      // 5. Order verification
      const customerOrders = await orderService.getByCustomerId(testCustomer.id);
      expect(customerOrders.length).toBeGreaterThan(0);
      expect(customerOrders.some(order => order.id === orderResult.order.id)).toBe(true);

      // 6. Order status update
      const statusUpdate = await orderService.updateStatus(orderResult.order.id, 'confirmed');
      expect(statusUpdate.success).toBe(true);
      expect(statusUpdate.order.status).toBe('confirmed');
    });

    it('should maintain data isolation between customers', async () => {
      // Create two separate customer sessions
      const customer1 = { id: 'customer_1', email: 'customer1@test.com' };
      const customer2 = { id: 'customer_2', email: 'customer2@test.com' };

      // Customer 1 creates an order
      await authService.signIn(customer1.email, 'password123');
      await orderService.create({
        customerId: customer1.id,
        items: [{ productId: 'product_1', quantity: 1, price: 15.50 }],
        total: 15.50
      });

      // Customer 2 creates an order
      await authService.signOut();
      await authService.signIn(customer2.email, 'password123');
      await orderService.create({
        customerId: customer2.id,
        items: [{ productId: 'product_2', quantity: 2, price: 12.00 }],
        total: 24.00
      });

      // Verify isolation
      const customer1Orders = await orderService.getByCustomerId(customer1.id);
      const customer2Orders = await orderService.getByCustomerId(customer2.id);

      expect(customer1Orders.length).toBeGreaterThan(0);
      expect(customer2Orders.length).toBeGreaterThan(0);

      // Ensure no cross-contamination
      customer1Orders.forEach(order => {
        expect(order.customerId).toBe(customer1.id);
      });

      customer2Orders.forEach(order => {
        expect(order.customerId).toBe(customer2.id);
      });

      const customer1OrderIds = customer1Orders.map(o => o.id);
      const customer2OrderIds = customer2Orders.map(o => o.id);
      const overlap = customer1OrderIds.some(id => customer2OrderIds.includes(id));

      expect(overlap).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication failures gracefully', async () => {
      const invalidLogin = await authService.signIn('invalid@email.com', 'wrongpassword');
      expect(invalidLogin.success).toBe(false);

      // Attempt to create order without authentication
      const orderResult = await orderService.create({
        customerId: 'invalid_customer',
        items: [{ productId: 'product_1', quantity: 1, price: 15.50 }],
        total: 15.50
      });

      expect(orderResult.success).toBe(false);
    });

    it('should validate order data across services', async () => {
      await authService.signIn(testCustomer.email, 'password123');

      // Invalid product ID
      const invalidOrderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'non_existent_product', quantity: 1, price: 15.50 }],
        total: 15.50
      });

      expect(invalidOrderResult.success).toBe(false);
      expect(invalidOrderResult.errors).toBeDefined();
    });
  });

  describe('Data Consistency Checks', () => {
    it('should maintain consistency across storage updates', async () => {
      await authService.signIn(testCustomer.email, 'password123');

      // Create order
      const orderResult = await orderService.create({
        customerId: testCustomer.id,
        items: [{ productId: 'product_1', quantity: 2, price: 15.50 }],
        total: 31.00
      });

      // Verify order appears in customer's order list
      const customerOrders = await customerService.getCustomerOrders(testCustomer.id);
      const orderExists = customerOrders.some(order => order.id === orderResult.order.id);

      expect(orderExists).toBe(true);

      // Update order status
      await orderService.updateStatus(orderResult.order.id, 'shipped');

      // Verify status update reflects everywhere
      const updatedOrder = await orderService.getById(orderResult.order.id);
      expect(updatedOrder.status).toBe('shipped');

      const customerOrdersAfterUpdate = await customerService.getCustomerOrders(testCustomer.id);
      const updatedOrderInCustomerList = customerOrdersAfterUpdate.find(
        order => order.id === orderResult.order.id
      );

      expect(updatedOrderInCustomerList.status).toBe('shipped');
    });
  });
});
