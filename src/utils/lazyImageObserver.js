/**
 * Lazy Image Loading Utility
 * P2.2.3 Performance Optimization
 * 
 * Uses Intersection Observer API for efficient lazy loading
 */

import logger from './productionLogger';

class LazyImageObserver {
  constructor() {
    this.observer = null;
    this.imageCallbacks = new Map();
    this.init();
  }

  init() {
    // Intersection Observer destekli mi kontrol et
    if (!window.IntersectionObserver) {
      logger.warn('IntersectionObserver not supported, falling back to immediate load');
      return;
    }

    // Observer oluştur
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const callback = this.imageCallbacks.get(target);

            if (callback) {
              callback();
              this.unobserve(target);
            }
          }
        });
      },
      {
        // Viewport'a %20 yaklaştığında yüklemeye başla
        rootMargin: '20px',
        threshold: 0.01
      }
    );
  }

  observe(element, callback) {
    if (!this.observer) {
      // Fallback: Intersection Observer yoksa direkt yükle
      callback();
      return;
    }

    this.imageCallbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.imageCallbacks.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.imageCallbacks.clear();
    }
  }
}

// Singleton instance
export const lazyImageObserver = new LazyImageObserver();

export default lazyImageObserver;
