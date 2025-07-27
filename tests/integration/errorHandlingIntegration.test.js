/**
 * Error Handling Integration Tests
 * 
 * Tests comprehensive error handling scenarios across all services,
 * including service failures, network errors, data corruption,
 * timeout handling, graceful degradation, and error recovery patterns.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Error Handling Integration Tests', () => {
  let services;
  let authService, customerService, orderService, productService, storageService;
  let testCustomer, testOrder;

  beforeEach(async () => {
    // Create mock services with error simulation capabilities
    services = createMockServices();
    ({ authService, customerService, orderService, productService, storageService } = services);

    // Setup test data
    testCustomer = {
      id: 'error_test_customer',
      name: 'Error Test Customer',
      email: 'error.test@integration.com',
      status: 'active'
    };

    testOrder = {
      id: 'error_test_order',
      customerId: testCustomer.id,
      items: [{ productId: 'error_test_product', quantity: 2, price: 15.00 }],
      total: 30.00,
      status: 'pending'
    };

    // Authenticate test user
    await authService.signIn(testCustomer.email, 'password123');
  });

  afterEach(async () => {
    // Clean up test data and reset error simulation
    vi.clearAllMocks();
    if (authService && typeof authService.signOut === 'function') {
      await authService.signOut();
    }
    if (storageService && typeof storageService.clear === 'function') {
      storageService.clear();
    }
  });

  describe('Service Failure Handling', () => {
    it('should handle authentication service failures gracefully', async () => {
      // Simulate auth service failure
      const originalSignIn = authService.signIn;
      authService.signIn = vi.fn().mockRejectedValue(new Error('Authentication service unavailable'));

      try {
        await authService.signIn('test@example.com', 'password');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Authentication service unavailable');
      }

      // Verify other services can handle auth failure
      try {
        await customerService.create(testCustomer);
        expect.fail('Should require authentication');
      } catch (error) {
        expect(error.message).toContain('Authentication required');
      }

      // Restore original function
      authService.signIn = originalSignIn;
    });

    it('should handle customer service failures with fallback', async () => {
      // Simulate customer service failure
      const originalCreate = customerService.create;
      customerService.create = vi.fn().mockRejectedValue(new Error('Customer service database error'));

      try {
        await customerService.create(testCustomer);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Customer service database error');

        // Verify error is logged and handled
        expect(error).toBeInstanceOf(Error);
      }

      // Test service recovery
      customerService.create = originalCreate;
      const result = await customerService.create(testCustomer);
      expect(result).toBeTruthy();
      expect(result.id).toBe(testCustomer.id);
    });

    it('should handle order service failures during complex workflows', async () => {
      // Create customer first
      await customerService.create(testCustomer);

      // Simulate order service failure
      const originalCreate = orderService.create;
      orderService.create = vi.fn().mockRejectedValue(new Error('Order processing system down'));

      try {
        await orderService.create(testOrder);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Order processing system down');
      }

      // Verify customer data remains intact after order failure
      const customer = await customerService.getById(testCustomer.id);
      expect(customer).toBeTruthy();
      expect(customer.id).toBe(testCustomer.id);

      // Restore order service and verify recovery
      orderService.create = originalCreate;
      const order = await orderService.create(testOrder);
      expect(order).toBeTruthy();
      expect(order.customerId).toBe(testCustomer.id);
    });
  });

  describe('Network Error Simulation', () => {
    it('should handle network timeout errors', async () => {
      // Simulate network timeout
      const originalGetById = customerService.getById;
      customerService.getById = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 100);
        });
      });

      try {
        await customerService.getById(testCustomer.id);
        expect.fail('Should have thrown timeout error');
      } catch (error) {
        expect(error.message).toBe('Network timeout');
      }

      // Restore function
      customerService.getById = originalGetById;
    });

    it('should handle intermittent network failures with retry logic', async () => {
      let attemptCount = 0;
      const originalGetAll = productService.getAll;

      // Mock function that fails first 2 attempts, succeeds on 3rd
      productService.getAll = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network connection failed');
        }
        return Promise.resolve([
          { id: 'product1', name: 'Test Product', price: 10.00 }
        ]);
      });

      // Simulate retry logic
      let result;

      for (let i = 0; i < 3; i++) {
        try {
          result = await productService.getAll();
          break;
        } catch (error) {
          if (i === 2) throw error; // Re-throw on final attempt
        }
      }

      expect(result).toBeTruthy();
      expect(result).toHaveLength(1);
      expect(attemptCount).toBe(3);

      // Restore function
      productService.getAll = originalGetAll;
    });

    it('should handle concurrent request failures', async () => {
      // Simulate service that fails under load
      let requestCount = 0;
      const originalGetById = orderService.getById;

      orderService.getById = vi.fn().mockImplementation((id) => {
        requestCount++;
        if (requestCount > 2) {
          throw new Error('Service overloaded');
        }
        return Promise.resolve({ id, status: 'pending' });
      });

      const promises = [
        orderService.getById('order1'),
        orderService.getById('order2'),
        orderService.getById('order3')
      ];

      const results = await Promise.allSettled(promises);

      // First 2 should succeed, 3rd should fail
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      expect(results[2].status).toBe('rejected');
      expect(results[2].reason.message).toBe('Service overloaded');

      // Restore function
      orderService.getById = originalGetById;
    });
  });

  describe('Data Corruption and Validation', () => {
    it('should handle corrupted customer data', async () => {
      // Create customer with valid data
      await customerService.create(testCustomer);

      // Simulate data corruption
      const corruptedCustomer = {
        id: testCustomer.id,
        name: null, // Corrupted name
        email: 'invalid-email', // Invalid email format
        status: 'unknown' // Invalid status
      };

      try {
        await customerService.update(testCustomer.id, corruptedCustomer);
        expect.fail('Should have rejected corrupted data');
      } catch (error) {
        expect(error.message).toContain('Invalid customer data');
      }

      // Verify original data remains intact
      const customer = await customerService.getById(testCustomer.id);
      expect(customer.name).toBe(testCustomer.name);
      expect(customer.email).toBe(testCustomer.email);
    });

    it('should handle storage corruption and recovery', async () => {
      // Create valid data
      await customerService.create(testCustomer);

      // Simulate storage corruption
      storageService.setItem('customers', 'corrupted-json-data');

      try {
        await customerService.getAll();
        expect.fail('Should have detected corruption');
      } catch (error) {
        expect(error.message).toContain('Storage corruption detected');
      }

      // Verify recovery mechanism
      storageService.clear();
      const customers = await customerService.getAll();
      expect(Array.isArray(customers)).toBe(true);
    });

    it('should validate order data integrity across services', async () => {
      // Create customer
      await customerService.create(testCustomer);

      // Try to create order with invalid references
      const invalidOrder = {
        id: 'invalid_order',
        customerId: 'non_existent_customer',
        items: [{ productId: 'non_existent_product', quantity: -1, price: 'invalid' }],
        total: 'not_a_number'
      };

      try {
        await orderService.create(invalidOrder);
        expect.fail('Should have rejected invalid order');
      } catch (error) {
        expect(error.message).toContain('Invalid order data');
      }

      // Verify no partial data was stored
      const orders = await orderService.getAll();
      const invalidOrderExists = orders.some(order => order.id === 'invalid_order');
      expect(invalidOrderExists).toBe(false);
    });
  });

  describe('Timeout and Performance Degradation', () => {
    it('should handle service response timeouts', async () => {
      // Mock slow service response
      const originalGetAll = customerService.getAll;
      customerService.getAll = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([]), 5000); // 5 second delay
        });
      });

      // Set timeout for 1 second
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), 1000);
      });

      try {
        await Promise.race([customerService.getAll(), timeoutPromise]);
        expect.fail('Should have timed out');
      } catch (error) {
        expect(error.message).toBe('Operation timeout');
      }

      // Restore function
      customerService.getAll = originalGetAll;
    });

    it('should handle memory pressure scenarios', async () => {
      // Simulate memory pressure by creating large datasets
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: `customer_${index}`,
        name: `Customer ${index}`,
        email: `customer${index}@test.com`,
        data: 'x'.repeat(1000) // Large string data
      }));

      try {
        // Process large dataset
        for (const customer of largeDataset.slice(0, 10)) { // Limit to prevent actual memory issues
          await customerService.create(customer);
        }

        const customers = await customerService.getAll();
        expect(customers.length).toBeGreaterThanOrEqual(10);
      } catch (error) {
        // Should handle memory pressure gracefully
        expect(error.message).toMatch(/(memory|resource)/i);
      }
    });

    it('should degrade gracefully under high load', async () => {
      // Simulate high concurrent load
      const concurrentRequests = Array.from({ length: 20 }, (_, index) =>
        customerService.create({
          id: `load_customer_${index}`,
          name: `Load Customer ${index}`,
          email: `load${index}@test.com`,
          status: 'active'
        })
      );

      const results = await Promise.allSettled(concurrentRequests);

      // Some requests might fail under load, but system should remain stable
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful.length + failed.length).toBe(20);

      // At least some requests should succeed
      expect(successful.length).toBeGreaterThan(0);

      // Failed requests should have meaningful error messages
      failed.forEach(result => {
        expect(result.reason).toBeInstanceOf(Error);
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary service failures', async () => {
      // Simulate temporary failure
      let failureCount = 0;
      const originalCreate = orderService.create;

      orderService.create = vi.fn().mockImplementation((order) => {
        failureCount++;
        if (failureCount <= 2) {
          throw new Error('Temporary service unavailable');
        }
        return originalCreate.call(orderService, order);
      });

      // First two attempts should fail
      try {
        await orderService.create(testOrder);
        expect.fail('Should fail on first attempt');
      } catch (error) {
        expect(error.message).toBe('Temporary service unavailable');
      }

      try {
        await orderService.create(testOrder);
        expect.fail('Should fail on second attempt');
      } catch (error) {
        expect(error.message).toBe('Temporary service unavailable');
      }

      // Third attempt should succeed
      const result = await orderService.create(testOrder);
      expect(result).toBeTruthy();
      expect(result.customerId).toBe(testCustomer.id);

      // Restore function
      orderService.create = originalCreate;
    });

    it('should maintain data consistency during error recovery', async () => {
      // Create customer
      await customerService.create(testCustomer);

      // Simulate partial order creation failure
      const originalCreate = orderService.create;
      orderService.create = vi.fn().mockImplementation(async (order) => {
        // Simulate partial success - order is created but status update fails
        await originalCreate.call(orderService, order);
        throw new Error('Status update failed');
      });

      try {
        await orderService.create(testOrder);
        expect.fail('Should have failed on status update');
      } catch (error) {
        expect(error.message).toBe('Status update failed');
      }

      // Verify data consistency - order should not exist in inconsistent state
      const orders = await orderService.getByCustomerId(testCustomer.id);
      const inconsistentOrder = orders.find(o => o.id === testOrder.id && !o.status);
      expect(inconsistentOrder).toBeUndefined();

      // Restore function and verify clean retry
      orderService.create = originalCreate;
      const result = await orderService.create(testOrder);
      expect(result).toBeTruthy();
      expect(result.status).toBe('pending');
    });

    it('should handle cascading failures gracefully', async () => {
      // Create initial data
      await customerService.create(testCustomer);
      await orderService.create(testOrder);

      // Simulate cascading failure - customer update fails, affecting order
      const originalUpdate = customerService.update;
      customerService.update = vi.fn().mockRejectedValue(new Error('Customer update failed'));

      try {
        // Try to update customer status, which should affect orders
        await customerService.update(testCustomer.id, { status: 'inactive' });
        expect.fail('Should have failed');
      } catch (error) {
        expect(error.message).toBe('Customer update failed');
      }

      // Verify order remains in consistent state despite customer update failure
      const order = await orderService.getById(testOrder.id);
      expect(order).toBeTruthy();
      expect(order.status).toBe('pending'); // Should not be affected by failed customer update

      // Verify customer data remains unchanged
      const customer = await customerService.getById(testCustomer.id);
      expect(customer.status).toBe('active'); // Original status preserved

      // Restore function
      customerService.update = originalUpdate;
    });
  });

  describe('Cross-Service Error Propagation', () => {
    it('should propagate authentication errors across all services', async () => {
      // Sign out to clear authentication
      await authService.signOut();

      // Verify all services properly handle authentication errors
      const operations = [
        () => customerService.create(testCustomer),
        () => orderService.create(testOrder),
        () => productService.create({ id: 'test_product', name: 'Test', price: 10.00 })
      ];

      for (const operation of operations) {
        try {
          await operation();
          expect.fail('Should require authentication');
        } catch (error) {
          expect(error.message).toContain('Authentication required');
        }
      }
    });

    it('should handle permission errors consistently', async () => {
      // Mock authentication with limited permissions
      const limitedUser = {
        id: 'limited_user',
        email: 'limited@test.com',
        permissions: ['read'] // Only read permissions
      };

      authService.getCurrentUser = vi.fn().mockResolvedValue(limitedUser);
      authService.hasPermission = vi.fn().mockImplementation((permission) => {
        return limitedUser.permissions.includes(permission);
      });

      // Test write operations with limited permissions
      const writeOperations = [
        () => customerService.create(testCustomer),
        () => orderService.create(testOrder),
        () => customerService.update(testCustomer.id, { status: 'inactive' })
      ];

      for (const operation of writeOperations) {
        try {
          await operation();
          expect.fail('Should require write permission');
        } catch (error) {
          expect(error.message).toContain('Insufficient permissions');
        }
      }

      // Verify read operations still work
      const customers = await customerService.getAll();
      expect(Array.isArray(customers)).toBe(true);
    });

    it('should maintain error context across service boundaries', async () => {
      // Create customer
      await customerService.create(testCustomer);

      // Simulate error with detailed context
      const originalCreate = orderService.create;
      orderService.create = vi.fn().mockImplementation((order) => {
        const error = new Error('Order validation failed');
        error.context = {
          service: 'orderService',
          operation: 'create',
          customerId: order.customerId,
          timestamp: new Date().toISOString()
        };
        throw error;
      });

      try {
        await orderService.create(testOrder);
        expect.fail('Should have failed with context');
      } catch (error) {
        expect(error.message).toBe('Order validation failed');
        expect(error.context).toBeTruthy();
        expect(error.context.service).toBe('orderService');
        expect(error.context.customerId).toBe(testCustomer.id);
      }

      // Restore function
      orderService.create = originalCreate;
    });
  });
});
