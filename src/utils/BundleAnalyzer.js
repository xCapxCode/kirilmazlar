/**
 * ===========================================
 * KIRIILMAZLAR PANEL - BUNDLE ANALYZER
 * Bundle size analysis and tree shaking optimization
 * ===========================================
 */

import logger from '../utils/productionLogger.js';

class BundleAnalyzer {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.bundleThresholds = {
      critical: 2 * 1024 * 1024, // 2MB
      warning: 1.5 * 1024 * 1024, // 1.5MB
      good: 1 * 1024 * 1024 // 1MB
    };
  }

  /**
   * Analyze bundle size impact
   */
  analyzeBundleImpact() {
    if (typeof window === 'undefined') return;

    const performanceEntries = window.performance.getEntriesByType('navigation');
    const navigationEntry = performanceEntries[0];

    if (navigationEntry) {
      const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
      const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;

      const analysis = {
        totalLoadTime: Math.round(loadTime),
        domContentLoadedTime: Math.round(domContentLoaded),
        firstContentfulPaint: this.getFCP(),
        largestContentfulPaint: this.getLCP(),
        timestamp: new Date().toISOString()
      };

      logger.system('Bundle Performance Analysis:', analysis);
      return analysis;
    }
  }

  /**
   * Get First Contentful Paint
   */
  getFCP() {
    const fcpEntries = window.performance.getEntriesByName('first-contentful-paint');
    return fcpEntries.length > 0 ? Math.round(fcpEntries[0].startTime) : null;
  }

  /**
   * Get Largest Contentful Paint
   */
  getLCP() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(Math.round(lastEntry.startTime));
        observer.disconnect();
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 5000);
      } catch (error) {
        resolve(null);
      }
    });
  }

  /**
   * Dynamic import optimization
   */
  static async optimizedImport(modulePath) {
    try {
      const startTime = performance.now();
      const module = await import(/* @vite-ignore */ modulePath);
      const loadTime = performance.now() - startTime;

      logger.debug(`Dynamic import ${modulePath} loaded in ${loadTime.toFixed(2)}ms`);
      return module;
    } catch (error) {
      logger.error(`Failed to load module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Component lazy loading wrapper
   */
  static createLazyComponent(importFunction, fallback = null) {
    return {
      component: null,
      loading: false,
      loaded: false,
      error: null,

      async load() {
        if (this.loaded || this.loading) return this.component;

        this.loading = true;
        try {
          const module = await importFunction();
          this.component = module.default || module;
          this.loaded = true;
          this.loading = false;
          return this.component;
        } catch (error) {
          this.error = error;
          this.loading = false;
          logger.error('Component lazy loading failed:', error);
          throw error;
        }
      },

      getFallback() {
        return fallback;
      }
    };
  }

  /**
   * Critical resource preloader
   */
  preloadCriticalResources(resources) {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as || 'script';

      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }

      document.head.appendChild(link);
      logger.debug(`Preloading critical resource: ${resource.href}`);
    });
  }

  /**
   * Monitor bundle performance
   */
  startPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Resource Loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.transferSize > this.bundleThresholds.warning) {
          logger.warn(`Large resource detected: ${entry.name} (${entry.transferSize} bytes)`);
        }
      });
    });

    try {
      // Check if resource is supported before observing
      if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('resource')) {
        observer.observe({ entryTypes: ['resource'] });
      }
    } catch (error) {
      // Silently handle unsupported entryTypes
      console.debug('Performance observer resource not supported in BundleAnalyzer');
    }

    // Memory monitoring
    if (window.performance.memory) {
      setInterval(() => {
        const memory = window.performance.memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };

        if (memoryUsage.used > 50) { // 50MB threshold
          logger.warn('High memory usage detected:', memoryUsage);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Code splitting recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];

    // Check for large dependencies
    const heavyDependencies = [
      'lucide-react',
      'react-router-dom',
      'date-fns',
      'lodash'
    ];

    heavyDependencies.forEach(dep => {
      recommendations.push({
        type: 'code-splitting',
        dependency: dep,
        suggestion: `Consider lazy loading ${dep} or using selective imports`
      });
    });

    // Check for unused code
    if (typeof window !== 'undefined' && window.performance) {
      const navigationEntries = window.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        const loadTime = entry.loadEventEnd - entry.fetchStart;

        if (loadTime > 3000) { // 3 second threshold
          recommendations.push({
            type: 'performance',
            metric: 'load-time',
            value: loadTime,
            suggestion: 'Consider implementing progressive loading or reducing bundle size'
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Initialize bundle optimization
   */
  initialize() {
    try {
      // Start performance monitoring
      this.startPerformanceMonitoring();

      // Analyze current bundle
      setTimeout(() => {
        this.analyzeBundleImpact();
        const recommendations = this.getOptimizationRecommendations();
        if (recommendations.length > 0) {
          logger.system('Bundle optimization recommendations:', recommendations);
        }
      }, 2000);

      // Preload critical resources in production
      if (this.isProduction) {
        this.preloadCriticalResources([
          { href: '/favicon.svg', as: 'image' }
        ]);
      }

      logger.system('BundleAnalyzer initialized successfully');
    } catch (error) {
      logger.error('BundleAnalyzer initialization failed:', error);
    }
  }
}

// Tree shaking utilities
export const TreeShaking = {
  /**
   * Selective Lucide icon import helper
   */
  async importLucideIcon(iconName) {
    try {
      const module = await import(/* @vite-ignore */ `lucide-react/dist/esm/icons/${iconName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}.js`);
      return module.default;
    } catch (error) {
      logger.warn(`Failed to import Lucide icon ${iconName}, falling back to default import`);
      // Fallback to regular import
      const { [iconName]: Icon } = await import(/* @vite-ignore */ 'lucide-react');
      return Icon;
    }
  },

  /**
   * Conditional feature loading
   */
  async loadFeature(featureName, condition = true) {
    if (!condition) return null;

    // Remove problematic dynamic imports for build
    logger.debug(`Feature loading requested: ${featureName}`);
    return null;
  },

  /**
   * Utility function pruning
   */
  createOptimizedUtilities() {
    return {
      // Only include essential utility functions
      formatCurrency: (amount) => new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount),

      formatDate: (date) => new Intl.DateTimeFormat('tr-TR').format(new Date(date)),

      debounce: (func, wait) => {
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
    };
  }
};

// Create singleton instance
const bundleAnalyzer = new BundleAnalyzer();

export default bundleAnalyzer;
