/**
 * ProductService Unit Tests
 * Simple working test implementation
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Product Service', () => {
  let productService;

  beforeEach(() => {
    const mockServices = createMockServices();
    productService = mockServices.productService;
  });

  describe('Product CRUD Operations', () => {
    it('should get all products', async () => {
      const products = await productService.getAll();

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should get product by id', async () => {
      const productId = 'test_product_1';
      const product = await productService.getById(productId);

      expect(product).toBeDefined();
      expect(product.id).toBe(productId);
    });

    it('should create product', async () => {
      const productData = {
        name: 'New Test Product',
        price: 29.99,
        category: 'test',
        stock: 50
      };

      const result = await productService.create(productData);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product.name).toBe(productData.name);
    });

    it('should update product', async () => {
      const productId = 'test_product_1';
      const updateData = {
        name: 'Updated Product Name',
        price: 19.99
      };

      const result = await productService.update(productId, updateData);

      expect(result.success).toBe(true);
      expect(result.product.name).toBe(updateData.name);
    });

    it('should delete product', async () => {
      const productId = 'test_product_1';
      const result = await productService.delete(productId);

      expect(result.success).toBe(true);
    });
  });

  describe('Product Search and Filter', () => {
    it('should search products by name', async () => {
      const searchTerm = 'Test';
      const results = await productService.search(searchTerm);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter products by category', async () => {
      const category = 'fruits';
      const results = await productService.getByCategory(category);

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Stock Management', () => {
    it('should update stock', async () => {
      const productId = 'test_product_1';
      const newStock = 75;

      const result = await productService.updateStock(productId, newStock);

      expect(result.success).toBe(true);
      expect(result.product.stock).toBe(newStock);
    });

    it('should check stock availability', async () => {
      const productId = 'test_product_1';
      const quantity = 5;

      const isAvailable = await productService.checkStockAvailability(productId, quantity);

      expect(typeof isAvailable).toBe('boolean');
    });
  });
});
