/**
 * Performance Optimization Utilities
 * Caching, lazy loading, and bundle optimization
 */

// Cache Management
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value, customTTL = null) {
    const expiry = Date.now() + (customTTL || this.ttl);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// API Response Cache
class APICache extends CacheManager {
  constructor() {
    super();
    this.maxSize = 50;
    this.ttl = 2 * 60 * 1000; // 2 minutes for API responses
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }

  cacheRequest(url, params, response) {
    const key = this.generateKey(url, params);
    this.set(key, response);
  }

  getCachedRequest(url, params) {
    const key = this.generateKey(url, params);
    return this.get(key);
  }
}

// Image Optimization
class ImageOptimizer {
  static createWebPVersion(imageSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        // Try WebP format
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(imageSrc); // Fallback to original
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  }

  static lazyLoadImage(img, src) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = src;
          image.classList.remove('lazy');
          observer.unobserve(image);
        }
      });
    });
    
    observer.observe(img);
  }
}

// Bundle Optimization
class BundleOptimizer {
  static async loadChunk(chunkName) {
    try {
      // Use dynamic import with proper path resolution
      const module = await import(/* @vite-ignore */ `/chunks/${chunkName}.js`);
      return module.default || module;
    } catch (error) {
      console.warn(`Failed to load chunk: ${chunkName}`, error);
      return null;
    }
  }

  static preloadCriticalChunks() {
    const criticalChunks = [
      'customer-catalog',
      'customer-cart',
      'auth-components'
    ];
    
    criticalChunks.forEach(chunk => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/chunks/${chunk}.js`;
      document.head.appendChild(link);
    });
  }
}

// Performance Monitoring
class PerformanceMonitor {
  static measureRenderTime(componentName, renderFn) {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    if (end - start > 16) { // More than one frame (60fps)
      console.warn(`Slow render detected: ${componentName} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  static trackMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }

  static logPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    console.group('Performance Metrics');
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
    
    paint.forEach(entry => {
      console.log(`${entry.name}:`, entry.startTime, 'ms');
    });
    
    const memory = this.trackMemoryUsage();
    if (memory) {
      console.log('Memory Usage:', `${memory.used}MB / ${memory.total}MB (Limit: ${memory.limit}MB)`);
    }
    
    console.groupEnd();
  }
}

// Debounce and Throttle utilities
class PerformanceUtils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static memoize(fn) {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }
}

// Initialize global instances
const apiCache = new APICache();
const imageCache = new CacheManager();

// Cleanup interval
setInterval(() => {
  apiCache.cleanup();
  imageCache.cleanup();
}, 60000); // Every minute

export {
  CacheManager,
  APICache,
  ImageOptimizer,
  BundleOptimizer,
  PerformanceMonitor,
  PerformanceUtils,
  apiCache,
  imageCache
};