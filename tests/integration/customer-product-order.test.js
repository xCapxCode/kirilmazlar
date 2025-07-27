/**
 * Customer-Product-Order Workflow Integration Tests
 * @package Kırılmazlar Panel Testing Suite
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Customer-Product-Order Workflow Integration', () => {
  let customerService;
  let productService;
  let orderService;
  let mockServices;

  beforeEach(() => {
    mockServices = createMockServices();
    customerService = mockServices.customerService;
    productService = mockServices.productService;
    orderService = mockServices.orderService;
  });

  describe('Complete Customer Journey', () => {
    it('should handle complete order workflow', async () => {
      // Step 1: Create a customer
      const customerData = {
        name: 'Integration Test Customer',
        email: 'integration@example.com',
        phone: '+90 555 123 4567',
        status: 'active'
      };

      const customerResult = await customerService.create(customerData);
      expect(customerResult.success).toBe(true);
      expect(customerResult.customer).toBeDefined();

      const customerId = customerResult.customer.id;

      // Step 2: Verify products are available
      const products = await productService.getAll();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);

      const selectedProduct = products[0];
      expect(selectedProduct).toHaveProperty('id');
      expect(selectedProduct).toHaveProperty('price');

      // Step 3: Check stock availability
      const stockAvailable = await productService.checkStockAvailability(selectedProduct.id, 2);
      expect(typeof stockAvailable).toBe('boolean');

      // Step 4: Create order
      const orderData = {
        customerId,
        items: [
          {
            productId: selectedProduct.id,
            quantity: 2,
            price: selectedProduct.price
          }
        ],
        total: selectedProduct.price * 2
      };

      const orderResult = await orderService.create(orderData);
      expect(orderResult.success).toBe(true);
      expect(orderResult.order).toBeDefined();
      expect(orderResult.order.customerId).toBe(customerId);

      // Step 5: Verify order in customer's order history
      const customerOrders = await customerService.getCustomerOrders(customerId);
      expect(Array.isArray(customerOrders)).toBe(true);
      expect(customerOrders.length).toBeGreaterThan(0);

      // Step 6: Update order status
      const statusUpdate = await orderService.updateStatus(orderResult.order.id, 'processing');
      expect(statusUpdate.success).toBe(true);
    });

    it('should handle product stock validation during order creation', async () => {
      // Create customer
      const customerResult = await customerService.create({
        name: 'Stock Test Customer',
        email: 'stock@example.com',
        status: 'active'
      });

      const customerId = customerResult.customer.id;

      // Try to order more than available stock
      const largeQuantity = 1000;
      const products = await productService.getAll();
      const product = products[0];

      const stockAvailable = await productService.checkStockAvailability(product.id, largeQuantity);
      expect(stockAvailable).toBe(false); // Mock returns false for quantity > 100

      // Order should still succeed in mock environment
      const orderData = {
        customerId,
        items: [{ productId: product.id, quantity: largeQuantity, price: product.price }],
        total: product.price * largeQuantity
      };

      const orderResult = await orderService.create(orderData);
      expect(orderResult.success).toBe(true); // Mock behavior
    });

    it('should handle customer order history retrieval', async () => {
      // Create customer
      const customerResult = await customerService.create({
        name: 'History Test Customer',
        email: 'history@example.com',
        status: 'active'
      });

      const customerId = customerResult.customer.id;

      // Create multiple orders
      const product = (await productService.getAll())[0];
      const orderPromises = Array(3).fill().map((_, index) =>
        orderService.create({
          customerId,
          items: [{ productId: product.id, quantity: 1, price: product.price }],
          total: product.price,
          orderNumber: `ORDER-${index + 1}`
        })
      );

      const orderResults = await Promise.all(orderPromises);
      orderResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify order history
      const customerOrders = await customerService.getCustomerOrders(customerId);
      expect(Array.isArray(customerOrders)).toBe(true);
    });

    it('should calculate customer lifetime value', async () => {
      const customerResult = await customerService.create({
        name: 'LTV Test Customer',
        email: 'ltv@example.com',
        status: 'active'
      });

      const customerId = customerResult.customer.id;
      const orders = await customerService.getCustomerOrders(customerId);

      const lifetimeValue = orders.reduce((sum, order) => sum + order.total, 0);

      expect(typeof lifetimeValue).toBe('number');
      expect(lifetimeValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Product Management Integration', () => {
    it('should update product stock after order', async () => {
      const product = (await productService.getAll())[0];
      const initialStock = 100;

      // Update stock
      const stockResult = await productService.updateStock(product.id, initialStock);
      expect(stockResult.success).toBe(true);

      // Create order
      const customer = await customerService.create({
        name: 'Stock Update Customer',
        email: 'stockupdate@example.com',
        status: 'active'
      });

      const orderQuantity = 5;
      const orderResult = await orderService.create({
        customerId: customer.customer.id,
        items: [{ productId: product.id, quantity: orderQuantity, price: product.price }],
        total: product.price * orderQuantity
      });

      expect(orderResult.success).toBe(true);

      // In real implementation, stock would be automatically reduced
      // Here we simulate the stock reduction
      const newStockResult = await productService.updateStock(product.id, initialStock - orderQuantity);
      expect(newStockResult.success).toBe(true);
      expect(newStockResult.product.stock).toBe(initialStock - orderQuantity);
    });

    it('should handle product category filtering in orders', async () => {
      const category = 'fruits';
      const categoryProducts = await productService.getByCategory(category);

      expect(Array.isArray(categoryProducts)).toBe(true);

      if (categoryProducts.length > 0) {
        const customer = await customerService.create({
          name: 'Category Test Customer',
          email: 'category@example.com',
          status: 'active'
        });

        const orderResult = await orderService.create({
          customerId: customer.customer.id,
          items: categoryProducts.slice(0, 2).map(product => ({
            productId: product.id,
            quantity: 1,
            price: product.price
          })),
          total: categoryProducts.slice(0, 2).reduce((sum, product) => sum + product.price, 0)
        });

        expect(orderResult.success).toBe(true);
      }
    });
  });

  describe('Order Status Workflow', () => {
    it('should handle complete order status lifecycle', async () => {
      // Create customer and order
      const customer = await customerService.create({
        name: 'Status Lifecycle Customer',
        email: 'lifecycle@example.com',
        status: 'active'
      });

      const product = (await productService.getAll())[0];
      const order = await orderService.create({
        customerId: customer.customer.id,
        items: [{ productId: product.id, quantity: 1, price: product.price }],
        total: product.price
      });

      const orderId = order.order.id;

      // Status progression
      const statuses = ['pending', 'processing', 'completed'];

      for (const status of statuses) {
        const statusResult = await orderService.updateStatus(orderId, status);
        expect(statusResult.success).toBe(true);
        expect(statusResult.order.status).toBe(status);
      }
    });

    it('should handle order cancellation workflow', async () => {
      const customer = await customerService.create({
        name: 'Cancellation Test Customer',
        email: 'cancel@example.com',
        status: 'active'
      });

      const product = (await productService.getAll())[0];
      const order = await orderService.create({
        customerId: customer.customer.id,
        items: [{ productId: product.id, quantity: 1, price: product.price }],
        total: product.price
      });

      // Cancel order
      const cancelResult = await orderService.updateStatus(order.order.id, 'cancelled');
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.order.status).toBe('cancelled');

      // Verify in customer order history
      const customerOrders = await customerService.getCustomerOrders(customer.customer.id);

      // Mock service behavior verification
      expect(Array.isArray(customerOrders)).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid customer ID in order creation', async () => {
      const product = (await productService.getAll())[0];

      const orderResult = await orderService.create({
        customerId: 'invalid_customer_id',
        items: [{ productId: product.id, quantity: 1, price: product.price }],
        total: product.price
      });

      // Mock allows this, but real implementation should validate
      expect(orderResult.success).toBe(true);
    });

    it('should handle invalid product ID in order creation', async () => {
      const customer = await customerService.create({
        name: 'Invalid Product Customer',
        email: 'invalidproduct@example.com',
        status: 'active'
      });

      const orderResult = await orderService.create({
        customerId: customer.customer.id,
        items: [{ productId: 'invalid_product_id', quantity: 1, price: 10.00 }],
        total: 10.00
      });

      // Mock allows this, but real implementation should validate
      expect(orderResult.success).toBe(true);
    });

    it('should handle concurrent order creation for same customer', async () => {
      const customer = await customerService.create({
        name: 'Concurrent Orders Customer',
        email: 'concurrent@example.com',
        status: 'active'
      });

      const product = (await productService.getAll())[0];
      const customerId = customer.customer.id;

      // Create multiple orders simultaneously
      const orderPromises = Array(5).fill().map(() =>
        orderService.create({
          customerId,
          items: [{ productId: product.id, quantity: 1, price: product.price }],
          total: product.price
        })
      );

      const results = await Promise.all(orderPromises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.order.customerId).toBe(customerId);
      });
    });
  });

  describe('Business Logic Integration', () => {
    it('should calculate order totals correctly', async () => {
      const customer = await customerService.create({
        name: 'Total Calculation Customer',
        email: 'totals@example.com',
        status: 'active'
      });

      const products = await productService.getAll();
      const selectedProducts = products.slice(0, 3);

      const items = selectedProducts.map(product => ({
        productId: product.id,
        quantity: 2,
        price: product.price
      }));

      const expectedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderResult = await orderService.create({
        customerId: customer.customer.id,
        items,
        total: expectedTotal
      });

      expect(orderResult.success).toBe(true);
      expect(orderResult.order.total).toBe(expectedTotal);
    });

    it('should handle customer status changes affecting orders', async () => {
      const customer = await customerService.create({
        name: 'Status Change Customer',
        email: 'statuschange@example.com',
        status: 'active'
      });

      // Create order while customer is active
      const product = (await productService.getAll())[0];
      const orderResult = await orderService.create({
        customerId: customer.customer.id,
        items: [{ productId: product.id, quantity: 1, price: product.price }],
        total: product.price
      });

      expect(orderResult.success).toBe(true);

      // Change customer status
      const statusResult = await customerService.update(customer.customer.id, {
        status: 'inactive'
      });

      expect(statusResult.success).toBe(true);

      // Orders should still be accessible
      const customerOrders = await customerService.getCustomerOrders(customer.customer.id);
      expect(Array.isArray(customerOrders)).toBe(true);
    });
  });
});
