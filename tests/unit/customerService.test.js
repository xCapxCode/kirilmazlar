/**
 * CustomerService Unit Tests
 * Simple working test implementation
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Customer Service', () => {
  let customerService;

  beforeEach(() => {
    const mockServices = createMockServices();
    customerService = mockServices.customerService;
  });

  describe('Customer CRUD Operations', () => {
    it('should create customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+90 555 123 4567'
      };

      const result = await customerService.create(customerData);

      expect(result.success).toBe(true);
      expect(result.customer).toBeDefined();
      expect(result.customer.name).toBe(customerData.name);
    });

    it('should get all customers', async () => {
      const customers = await customerService.getAll();

      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);
    });

    it('should get customer by id', async () => {
      const customerId = 'test_customer_123';
      const customer = await customerService.getById(customerId);

      expect(customer).toBeDefined();
      expect(customer.id).toBe(customerId);
    });

    it('should update customer', async () => {
      const customerId = 'test_customer_123';
      const updateData = {
        name: 'Updated Customer Name',
        phone: '+90 555 999 8888'
      };

      const result = await customerService.update(customerId, updateData);

      expect(result.success).toBe(true);
      expect(result.customer.name).toBe(updateData.name);
    });

    it('should delete customer', async () => {
      const customerId = 'test_customer_123';
      const result = await customerService.delete(customerId);

      expect(result.success).toBe(true);
    });
  });

  describe('Customer Search and Filter', () => {
    it('should search customers by name', async () => {
      const searchTerm = 'Test';
      const results = await customerService.search(searchTerm);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter customers', async () => {
      const filters = {
        active: true,
        city: 'Istanbul'
      };

      const results = await customerService.filter(filters);

      expect(Array.isArray(results)).toBe(true);
    });
  });
});
