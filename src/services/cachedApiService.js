/**
 * Cached API Service
 * Wraps existing API services with intelligent caching
 */

import { apiCache, PerformanceMonitor } from '../utils/performanceOptimizer';
import { customerService } from './customerService';
import { productService } from './productService';
import { orderService } from './orderService';
import authService from './authService.js';

class CachedApiService {
  constructor(originalService, serviceName) {
    this.originalService = originalService;
    this.serviceName = serviceName;
    this.cacheConfig = {
      // Cache durations for different operations (in ms)
      GET: 2 * 60 * 1000,      // 2 minutes
      POST: 0,                  // No cache for mutations
      PUT: 0,                   // No cache for mutations
      DELETE: 0,                // No cache for mutations
      SEARCH: 1 * 60 * 1000,    // 1 minute for search results
      LIST: 3 * 60 * 1000       // 3 minutes for lists
    };
  }

  // Generic cached request wrapper
  async cachedRequest(method, endpoint, params = {}, options = {}) {
    const { 
      skipCache = false, 
      cacheDuration = null,
      cacheKey = null 
    } = options;

    // Skip cache for mutations or when explicitly requested
    if (skipCache || ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
      return this.executeRequest(method, endpoint, params);
    }

    // Generate cache key
    const key = cacheKey || this.generateCacheKey(method, endpoint, params);
    
    // Try to get from cache first
    const cachedResult = apiCache.get(key);
    if (cachedResult) {
      console.log(`Cache hit for ${this.serviceName}.${endpoint}`);
      return cachedResult;
    }

    // Execute request and cache result
    const result = await this.executeRequest(method, endpoint, params);
    
    // Cache successful results
    if (result && !result.error) {
      const duration = cacheDuration || this.getCacheDuration(method, endpoint);
      if (duration > 0) {
        apiCache.set(key, result, duration);
        console.log(`Cached result for ${this.serviceName}.${endpoint} (${duration}ms)`);
      }
    }

    return result;
  }

  async executeRequest(method, endpoint, params) {
    const startTime = performance.now();
    
    try {
      let result;
      
      // Execute the original service method
      if (typeof this.originalService[endpoint] === 'function') {
        result = await this.originalService[endpoint](params);
      } else {
        throw new Error(`Method ${endpoint} not found in ${this.serviceName}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow API request: ${this.serviceName}.${endpoint} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      console.error(`API Error in ${this.serviceName}.${endpoint}:`, error);
      throw error;
    }
  }

  generateCacheKey(method, endpoint, params) {
    const paramString = JSON.stringify(params);
    return `${this.serviceName}_${method}_${endpoint}_${btoa(paramString).slice(0, 20)}`;
  }

  getCacheDuration(method, endpoint) {
    // Special cases for different endpoints
    if (endpoint.includes('search') || endpoint.includes('filter')) {
      return this.cacheConfig.SEARCH;
    }
    
    if (endpoint.includes('list') || endpoint.includes('getAll')) {
      return this.cacheConfig.LIST;
    }
    
    return this.cacheConfig[method.toUpperCase()] || 0;
  }

  // Cache invalidation methods
  invalidateCache(pattern = null) {
    if (pattern) {
      // Invalidate specific cache entries
      for (const key of apiCache.cache.keys()) {
        if (key.includes(pattern)) {
          apiCache.cache.delete(key);
        }
      }
    } else {
      // Clear all cache for this service
      for (const key of apiCache.cache.keys()) {
        if (key.startsWith(this.serviceName)) {
          apiCache.cache.delete(key);
        }
      }
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    const criticalEndpoints = this.getCriticalEndpoints();
    
    const preloadPromises = criticalEndpoints.map(async ({ endpoint, params }) => {
      try {
        await this.cachedRequest('GET', endpoint, params, { cacheDuration: 5 * 60 * 1000 });
        console.log(`Preloaded: ${this.serviceName}.${endpoint}`);
      } catch (error) {
        console.warn(`Failed to preload: ${this.serviceName}.${endpoint}`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  getCriticalEndpoints() {
    // Override in specific service implementations
    return [];
  }
}

// Cached Customer Service
class CachedCustomerService extends CachedApiService {
  constructor() {
    super(customerService, 'CustomerService');
  }

  async getCustomers(params = {}) {
    return this.cachedRequest('GET', 'getCustomers', params);
  }

  async getCustomerById(id) {
    return this.cachedRequest('GET', 'getCustomerById', { id });
  }

  async searchCustomers(query) {
    return this.cachedRequest('GET', 'searchCustomers', { query });
  }

  async createCustomer(customerData) {
    const result = await this.cachedRequest('POST', 'createCustomer', customerData);
    this.invalidateCache('getCustomers');
    return result;
  }

  async updateCustomer(id, customerData) {
    const result = await this.cachedRequest('PUT', 'updateCustomer', { id, ...customerData });
    this.invalidateCache(`customer_${id}`);
    this.invalidateCache('getCustomers');
    return result;
  }

  async deleteCustomer(id) {
    const result = await this.cachedRequest('DELETE', 'deleteCustomer', { id });
    this.invalidateCache(`customer_${id}`);
    this.invalidateCache('getCustomers');
    return result;
  }

  getCriticalEndpoints() {
    return [
      { endpoint: 'getCustomers', params: { limit: 20 } }
    ];
  }
}

// Cached Product Service
class CachedProductService extends CachedApiService {
  constructor() {
    super(productService, 'ProductService');
  }

  async getProducts(params = {}) {
    return this.cachedRequest('GET', 'getProducts', params);
  }

  async getProductById(id) {
    return this.cachedRequest('GET', 'getProductById', { id });
  }

  async searchProducts(query) {
    return this.cachedRequest('GET', 'searchProducts', { query });
  }

  async getProductsByCategory(category) {
    return this.cachedRequest('GET', 'getProductsByCategory', { category });
  }

  async createProduct(productData) {
    const result = await this.cachedRequest('POST', 'createProduct', productData);
    this.invalidateCache('getProducts');
    return result;
  }

  async updateProduct(id, productData) {
    const result = await this.cachedRequest('PUT', 'updateProduct', { id, ...productData });
    this.invalidateCache(`product_${id}`);
    this.invalidateCache('getProducts');
    return result;
  }

  async deleteProduct(id) {
    const result = await this.cachedRequest('DELETE', 'deleteProduct', { id });
    this.invalidateCache(`product_${id}`);
    this.invalidateCache('getProducts');
    return result;
  }

  getCriticalEndpoints() {
    return [
      { endpoint: 'getProducts', params: { limit: 50, featured: true } },
      { endpoint: 'getProductsByCategory', params: { category: 'popular' } }
    ];
  }
}

// Cached Order Service
class CachedOrderService extends CachedApiService {
  constructor() {
    super(orderService, 'OrderService');
  }

  async getOrders(params = {}) {
    return this.cachedRequest('GET', 'getOrders', params);
  }

  async getOrderById(id) {
    return this.cachedRequest('GET', 'getOrderById', { id });
  }

  async getOrdersByCustomer(customerId) {
    return this.cachedRequest('GET', 'getOrdersByCustomer', { customerId });
  }

  async createOrder(orderData) {
    const result = await this.cachedRequest('POST', 'createOrder', orderData);
    this.invalidateCache('getOrders');
    return result;
  }

  async updateOrderStatus(id, status) {
    const result = await this.cachedRequest('PUT', 'updateOrderStatus', { id, status });
    this.invalidateCache(`order_${id}`);
    this.invalidateCache('getOrders');
    return result;
  }

  getCriticalEndpoints() {
    return [
      { endpoint: 'getOrders', params: { status: 'pending', limit: 20 } }
    ];
  }
}

// Initialize cached services
const cachedCustomerService = new CachedCustomerService();
const cachedProductService = new CachedProductService();
const cachedOrderService = new CachedOrderService();

// Preload critical data on app start
const preloadCriticalData = async () => {
  console.log('Preloading critical data...');
  
  try {
    await Promise.allSettled([
      cachedCustomerService.preloadCriticalData(),
      cachedProductService.preloadCriticalData(),
      cachedOrderService.preloadCriticalData()
    ]);
    
    console.log('Critical data preloading completed');
  } catch (error) {
    console.warn('Error during critical data preloading:', error);
  }
};

// Auto-preload on service initialization
if (typeof window !== 'undefined') {
  // Delay preloading to avoid blocking initial render
  setTimeout(preloadCriticalData, 1000);
}

export {
  CachedApiService,
  cachedCustomerService,
  cachedProductService,
  cachedOrderService,
  preloadCriticalData
};