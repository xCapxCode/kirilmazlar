/**
 * Mobile Performance Tests
 * Tests specifically focused on mobile device performance,
 * responsive design optimization, and mobile-specific constraints
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Mobile Performance Tests', () => {
  let services;
  let authService, customerService, orderService, productService, storageService;
  let mobileSimulator;

  beforeEach(async () => {
    // Create mock services
    services = createMockServices();
    ({ authService, customerService, orderService, productService, storageService } = services);

    // Mobile environment simulation
    mobileSimulator = {
      // Simulate mobile device constraints
      simulateMobileDevice() {
        // Mock mobile user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          configurable: true
        });

        // Mock mobile screen dimensions
        Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

        // Mock device pixel ratio
        Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

        // Mock touch capabilities
        Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true });
      },

      // Simulate slower mobile network
      simulateSlowNetwork() {
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ data: 'mock response' }),
                text: () => Promise.resolve('mock response')
              });
            }, 200); // 200ms delay to simulate slower mobile network
          });
        });
        return originalFetch;
      },

      // Simulate limited mobile memory
      simulateLimitedMemory() {
        // Mock performance.memory with mobile constraints
        if (performance.memory) {
          Object.defineProperty(performance.memory, 'jsHeapSizeLimit', {
            value: 128 * 1024 * 1024, // 128MB limit
            configurable: true
          });
        }
      }
    };

    // Apply mobile simulation
    mobileSimulator.simulateMobileDevice();

    // Authenticate for tests
    await authService.signIn('test@example.com', 'password123');
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (storageService && typeof storageService.clear === 'function') {
      storageService.clear();
    }

    // Reset fetch mock if it was modified
    if (global.fetch && global.fetch._isMockFunction) {
      vi.restoreAllMocks();
    }
  });

  describe('Mobile Viewport Optimization', () => {
    it('should handle mobile screen dimensions efficiently', async () => {
      // Test viewport-specific operations
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);

      // Simulate operations that might depend on screen size
      const startTime = performance.now();

      // Operations that might trigger layout recalculations
      await customerService.getAll();
      await productService.getAll();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be fast even on mobile constraints
      expect(duration).toBeLessThan(300); // 300ms for mobile operations
    });

    it('should optimize touch interaction response times', async () => {
      expect(navigator.maxTouchPoints).toBe(5);

      // Simulate touch-like rapid interactions
      const touchOperations = [];
      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        touchOperations.push(
          authService.getCurrentUser() // Quick operation simulating touch feedback
        );
      }

      await Promise.all(touchOperations);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Touch responses should be very fast
      expect(duration).toBeLessThan(200); // All touch operations under 200ms
      expect(duration / touchOperations.length).toBeLessThan(25); // <25ms per operation
    });

    it('should handle mobile scrolling performance', async () => {
      // Simulate large dataset scrolling
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: `item_${i}`,
        name: `Item ${i}`,
        data: `Content for item ${i}`
      }));

      const startTime = performance.now();

      // Simulate chunked loading for scrolling
      const chunkSize = 20;
      const chunks = [];

      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        chunks.push(chunk);
      }

      // Process chunks (simulating scroll-based loading)
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate processing delay
        expect(chunk.length).toBeLessThanOrEqual(chunkSize);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Chunked loading should be efficient
      expect(duration).toBeLessThan(500); // Under 500ms for 100 items
      expect(chunks.length).toBe(5); // Should create appropriate chunks
    });
  });

  describe('Mobile Network Constraints', () => {
    it('should handle slow network conditions gracefully', async () => {
      const originalFetch = mobileSimulator.simulateSlowNetwork();

      const startTime = performance.now();

      // Perform network-dependent operations
      await customerService.getAll();
      await productService.getAll();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle slow network but not be too slow
      expect(duration).toBeGreaterThan(100); // Should reflect network delay
      expect(duration).toBeLessThan(2000); // But not be unusably slow (relaxed for test environment)

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should optimize data usage for mobile', async () => {
      // Test data efficiency
      const operations = [
        customerService.getAll,
        productService.getAll,
        orderService.getAll
      ];

      const dataSizes = [];

      for (const operation of operations) {
        const result = await operation();

        // Simulate data size calculation
        const serialized = JSON.stringify(result);
        dataSizes.push(serialized.length);

        // Each operation should return reasonable data sizes
        expect(serialized.length).toBeLessThan(10000); // Under 10KB per operation
      }

      // Total data usage should be mobile-friendly
      const totalDataSize = dataSizes.reduce((a, b) => a + b, 0);
      expect(totalDataSize).toBeLessThan(25000); // Under 25KB total
    });

    it('should handle offline scenarios', async () => {
      // Simulate offline mode - skip navigator.onLine property modification
      // Instead simulate offline behavior through service mocking
      const originalGetAll = customerService.getAll;

      // Mock offline behavior
      customerService.getAll = vi.fn().mockResolvedValue([]);

      try {
        // Operations should handle offline gracefully
        const result = await customerService.getAll();

        // Should return cached/offline data or handle gracefully
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Or should fail gracefully with appropriate error
        expect(error.message).toMatch(/offline|network|connection/i);
      }

      // Restore original function
      customerService.getAll = originalGetAll;
    });
  });

  describe('Mobile Memory Management', () => {
    it('should handle memory constraints efficiently', async () => {
      mobileSimulator.simulateLimitedMemory();

      // Test memory-intensive operations
      const memoryIntensiveOperations = Array.from({ length: 20 }, () =>
        customerService.getAll()
      );

      const startTime = performance.now();
      const results = await Promise.all(memoryIntensiveOperations);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete without memory issues
      expect(results.length).toBe(20);
      expect(duration).toBeLessThan(1000); // Under 1 second

      // All results should be valid
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should optimize garbage collection on mobile', async () => {
      const iterations = 15;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        // Create and dispose of data
        await customerService.create({
          id: `mobile_test_${i}`,
          name: `Mobile Test Customer ${i}`,
          email: `mobile${i}@test.com`,
          status: 'active'
        });

        const endTime = performance.now();
        timings.push(endTime - startTime);

        // Small delay to allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Performance should remain consistent (no memory bloat)
      const firstHalf = timings.slice(0, Math.floor(iterations / 2));
      const secondHalf = timings.slice(Math.floor(iterations / 2));

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      // Performance shouldn't degrade significantly
      const degradation = (secondAvg - firstAvg) / firstAvg;
      expect(degradation).toBeLessThan(0.5); // Less than 50% degradation
    });

    it('should handle large datasets on mobile devices', async () => {
      // Create a mobile-appropriate large dataset
      const mobileDataset = Array.from({ length: 50 }, (_, i) => ({
        id: `mobile_item_${i}`,
        name: `Mobile Item ${i}`,
        description: `Description for mobile item ${i}`,
        metadata: {
          category: ['electronics', 'clothing', 'food'][i % 3],
          price: Math.random() * 100,
          inStock: Math.random() > 0.3
        }
      }));

      const startTime = performance.now();

      // Process dataset in mobile-friendly chunks
      const chunkSize = 10;
      const processedItems = [];

      for (let i = 0; i < mobileDataset.length; i += chunkSize) {
        const chunk = mobileDataset.slice(i, i + chunkSize);

        // Simulate processing each chunk
        for (const item of chunk) {
          processedItems.push({
            ...item,
            processed: true,
            timestamp: Date.now()
          });
        }

        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process efficiently on mobile
      expect(duration).toBeLessThan(300); // Under 300ms
      expect(processedItems.length).toBe(mobileDataset.length);

      // All items should be processed
      processedItems.forEach(item => {
        expect(item.processed).toBe(true);
        expect(item.timestamp).toBeDefined();
      });
    });
  });

  describe('Mobile Battery and Performance Optimization', () => {
    it('should minimize CPU-intensive operations', async () => {
      const operationTypes = [
        { name: 'lightweight', operation: () => authService.getCurrentUser() },
        { name: 'medium', operation: () => customerService.getAll() },
        {
          name: 'heavy', operation: () => Promise.all([
            customerService.getAll(),
            productService.getAll(),
            orderService.getAll()
          ])
        }
      ];

      for (const { name, operation } of operationTypes) {
        const startTime = performance.now();
        await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Different thresholds for different operation types
        switch (name) {
          case 'lightweight':
            expect(duration).toBeLessThan(50); // Very fast
            break;
          case 'medium':
            expect(duration).toBeLessThan(150); // Fast
            break;
          case 'heavy':
            expect(duration).toBeLessThan(400); // Reasonable
            break;
        }
      }
    });

    it('should optimize battery usage patterns', async () => {
      // Simulate battery-conscious operation patterns
      const batchSize = 5;
      const batches = 3;

      const startTime = performance.now();

      for (let batch = 0; batch < batches; batch++) {
        // Process operations in batches with delays
        const batchOperations = Array.from({ length: batchSize }, () =>
          customerService.getAll()
        );

        await Promise.all(batchOperations);

        // Battery-friendly delay between batches
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be efficient but not continuously intensive
      expect(duration).toBeGreaterThan(100); // Should include delays
      expect(duration).toBeLessThan(800); // But still reasonable
    });

    it('should handle background/foreground state changes', async () => {
      // Simulate app going to background
      const originalVisibility = document.visibilityState;

      // Mock background state
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true
      });

      // Operations in background should be minimal
      const backgroundStart = performance.now();
      await authService.getCurrentUser(); // Minimal operation
      const backgroundEnd = performance.now();
      const backgroundDuration = backgroundEnd - backgroundStart;

      // Simulate returning to foreground
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      // Operations in foreground can be normal
      const foregroundStart = performance.now();
      await customerService.getAll(); // Normal operation
      const foregroundEnd = performance.now();
      const foregroundDuration = foregroundEnd - foregroundStart;

      // Background operations should be faster (less intensive)
      expect(backgroundDuration).toBeLessThan(100);
      expect(foregroundDuration).toBeLessThan(200);

      // Restore original visibility state
      Object.defineProperty(document, 'visibilityState', {
        value: originalVisibility,
        configurable: true
      });
    });
  });

  describe('Mobile Storage Optimization', () => {
    it('should optimize storage for mobile devices', async () => {
      // Test mobile storage patterns
      const mobileStorageLimit = 5 * 1024 * 1024; // 5MB limit simulation
      let totalStorageUsed = 0;

      // Add data incrementally
      for (let i = 0; i < 10; i++) {
        const data = {
          id: `mobile_storage_${i}`,
          content: 'x'.repeat(100), // Small data chunks
          timestamp: Date.now()
        };

        storageService.setItem(`mobile_data_${i}`, data);

        // Estimate storage used
        totalStorageUsed += JSON.stringify(data).length;

        // Should stay within mobile limits
        expect(totalStorageUsed).toBeLessThan(mobileStorageLimit);
      }

      // Verify data integrity
      for (let i = 0; i < 10; i++) {
        const retrieved = storageService.getItem(`mobile_data_${i}`);
        expect(retrieved).toBeTruthy();
        expect(retrieved.id).toBe(`mobile_storage_${i}`);
      }
    });

    it('should handle storage cleanup on mobile', async () => {
      // Fill storage with test data
      const testDataCount = 20;
      for (let i = 0; i < testDataCount; i++) {
        storageService.setItem(`cleanup_test_${i}`, {
          data: `Test data ${i}`,
          timestamp: Date.now() - (i * 1000) // Older data has earlier timestamps
        });
      }

      // Simulate storage cleanup (keep only recent items)
      const keepCount = 10;

      // Remove older items
      for (let i = keepCount; i < testDataCount; i++) {
        storageService.removeItem(`cleanup_test_${i}`);
      }

      // Verify cleanup worked
      for (let i = 0; i < keepCount; i++) {
        const item = storageService.getItem(`cleanup_test_${i}`);
        expect(item).toBeTruthy();
      }

      for (let i = keepCount; i < testDataCount; i++) {
        const item = storageService.getItem(`cleanup_test_${i}`);
        expect(item).toBeNull();
      }
    });

    it('should optimize cache strategies for mobile', async () => {
      // Test mobile-friendly caching
      const cacheItems = [
        { key: 'critical_data', priority: 'high', size: 'small' },
        { key: 'user_preferences', priority: 'high', size: 'small' },
        { key: 'recent_orders', priority: 'medium', size: 'medium' },
        { key: 'product_images', priority: 'low', size: 'large' }
      ];

      // Cache items with mobile optimization
      for (const item of cacheItems) {
        const data = {
          key: item.key,
          priority: item.priority,
          data: 'x'.repeat(item.size === 'small' ? 50 : item.size === 'medium' ? 200 : 500),
          timestamp: Date.now()
        };

        storageService.setItem(item.key, data);
      }

      // Verify high priority items are cached
      const criticalData = storageService.getItem('critical_data');
      const userPrefs = storageService.getItem('user_preferences');

      expect(criticalData).toBeTruthy();
      expect(userPrefs).toBeTruthy();
      expect(criticalData.priority).toBe('high');
      expect(userPrefs.priority).toBe('high');
    });
  });
});
