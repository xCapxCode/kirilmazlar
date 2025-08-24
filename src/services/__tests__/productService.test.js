import { describe, it, expect, beforeEach, vi } from 'vitest';
import productService from '../productService.js';
import storage from '../../core/storage/index.js';

// Mock storage
vi.mock('../../core/storage/index.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

describe('ProductService', () => {
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Test Product 1',
      price: 100,
      category: 'electronics',
      stock: 10,
      active: true
    },
    {
      id: 'prod2',
      name: 'Test Product 2',
      price: 200,
      category: 'clothing',
      stock: 5,
      active: true
    },
    {
      id: 'prod3',
      name: 'Inactive Product',
      price: 150,
      category: 'electronics',
      stock: 0,
      active: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    storage.get.mockReturnValue(mockProducts);
  });

  describe('getAllProducts', () => {
    it('should return all products from storage', () => {
      const products = productService.getAllProducts();

      expect(products).toEqual(mockProducts);
      expect(storage.get).toHaveBeenCalledWith('products', []);
    });

    it('should return empty array when no products exist', () => {
      storage.get.mockReturnValue([]);

      const products = productService.getAllProducts();

      expect(products).toEqual([]);
    });
  });

  describe('getActiveProducts', () => {
    it('should return only active products', () => {
      const activeProducts = productService.getActiveProducts();

      expect(activeProducts).toHaveLength(2);
      expect(activeProducts.every(p => p.active)).toBe(true);
      expect(activeProducts.map(p => p.id)).toEqual(['prod1', 'prod2']);
    });
  });

  describe('getProductById', () => {
    it('should return product by id', () => {
      const product = productService.getProductById('prod1');

      expect(product).toEqual(mockProducts[0]);
    });

    it('should return null for non-existent product', () => {
      const product = productService.getProductById('nonexistent');

      expect(product).toBeNull();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', () => {
      const electronicsProducts = productService.getProductsByCategory('electronics');

      expect(electronicsProducts).toHaveLength(2);
      expect(electronicsProducts.every(p => p.category === 'electronics')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const products = productService.getProductsByCategory('nonexistent');

      expect(products).toEqual([]);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', () => {
      const results = productService.searchProducts('Test Product 1');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prod1');
    });

    it('should search products case-insensitively', () => {
      const results = productService.searchProducts('test product');

      expect(results).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const results = productService.searchProducts('nonexistent product');

      expect(results).toEqual([]);
    });
  });

  describe('addProduct', () => {
    it('should add new product with generated id', () => {
      const newProduct = {
        name: 'New Product',
        price: 300,
        category: 'books',
        stock: 15
      };

      const result = productService.addProduct(newProduct);

      expect(result.success).toBe(true);
      expect(result.product).toMatchObject(newProduct);
      expect(result.product.id).toBeDefined();
      expect(result.product.active).toBe(true);
      expect(storage.set).toHaveBeenCalledWith('products', expect.any(Array));
    });

    it('should validate required fields', () => {
      const invalidProduct = {
        price: 100
        // missing name
      };

      const result = productService.addProduct(invalidProduct);

      expect(result.success).toBe(false);
      expect(result.error).toContain('name');
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should validate price is positive', () => {
      const invalidProduct = {
        name: 'Test Product',
        price: -10,
        category: 'test'
      };

      const result = productService.addProduct(invalidProduct);

      expect(result.success).toBe(false);
      expect(result.error).toContain('price');
    });
  });

  describe('updateProduct', () => {
    it('should update existing product', () => {
      const updates = {
        name: 'Updated Product Name',
        price: 250
      };

      const result = productService.updateProduct('prod1', updates);

      expect(result.success).toBe(true);
      expect(result.product.name).toBe('Updated Product Name');
      expect(result.product.price).toBe(250);
      expect(storage.set).toHaveBeenCalled();
    });

    it('should return error for non-existent product', () => {
      const result = productService.updateProduct('nonexistent', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should validate updated fields', () => {
      const invalidUpdates = {
        price: -50
      };

      const result = productService.updateProduct('prod1', invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('price');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product by id', () => {
      const result = productService.deleteProduct('prod1');

      expect(result.success).toBe(true);
      expect(storage.set).toHaveBeenCalled();
    });

    it('should return error for non-existent product', () => {
      const result = productService.deleteProduct('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('updateStock', () => {
    it('should update product stock', () => {
      const result = productService.updateStock('prod1', 20);

      expect(result.success).toBe(true);
      expect(result.product.stock).toBe(20);
      expect(storage.set).toHaveBeenCalled();
    });

    it('should not allow negative stock', () => {
      const result = productService.updateStock('prod1', -5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('stock');
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product active status', () => {
      const result = productService.toggleProductStatus('prod1');

      expect(result.success).toBe(true);
      expect(result.product.active).toBe(false); // was true, now false
      expect(storage.set).toHaveBeenCalled();
    });
  });

  describe('getProductStats', () => {
    it('should return product statistics', () => {
      const stats = productService.getProductStats();

      expect(stats).toMatchObject({
        total: 3,
        active: 2,
        inactive: 1,
        totalValue: expect.any(Number),
        categories: expect.any(Array)
      });
    });
  });
});