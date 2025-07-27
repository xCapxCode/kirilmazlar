/**
 * ===========================================
 * KIRIILMAZLAR PANEL - HEALTH MONITOR
 * Application health monitoring system
 * ===========================================
 */

import logger from '../utils/productionLogger.js';

class HealthMonitor {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.metrics = {
      startTime: Date.now(),
      errors: [],
      performance: {
        pageLoads: 0,
        averageLoadTime: 0,
        memoryUsage: []
      },
      connectivity: {
        online: navigator.onLine,
        connectionType: this.getConnectionType()
      }
    };

    this.thresholds = {
      maxErrors: 10, // Maximum errors per minute
      maxLoadTime: 5000, // 5 seconds
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      criticalMemoryUsage: 200 * 1024 * 1024 // 200MB
    };

    this.alerts = [];
    this.healthCheckInterval = null;
  }

  /**
   * Get connection type
   */
  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Initialize health monitoring
   */
  initialize() {
    try {
      this.setupErrorTracking();
      this.setupPerformanceMonitoring();
      this.setupConnectivityMonitoring();
      this.startHealthChecks();

      logger.system('HealthMonitor initialized successfully');
    } catch (error) {
      logger.error('HealthMonitor initialization failed:', error);
    }
  }

  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });

    // React error boundary integration
    window.reportReactError = (error, errorInfo) => {
      this.trackError({
        type: 'react',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now()
      });
    };
  }

  /**
   * Track application errors
   */
  trackError(errorData) {
    this.metrics.errors.push(errorData);

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    // Check error rate
    const recentErrors = this.getRecentErrors(60000); // Last minute
    if (recentErrors.length >= this.thresholds.maxErrors) {
      this.triggerAlert('high-error-rate', {
        count: recentErrors.length,
        threshold: this.thresholds.maxErrors
      });
    }

    logger.error('Application error tracked:', errorData);
  }

  /**
   * Get recent errors within timeframe
   */
  getRecentErrors(timeframe = 60000) {
    const cutoff = Date.now() - timeframe;
    return this.metrics.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Page load performance
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      this.trackPageLoad(loadTime);
    }

    // Performance observer for navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.trackPageLoad(entry.loadEventEnd - entry.fetchStart);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        logger.warn('Performance observer not supported for navigation');
      }
    }

    // Memory monitoring
    if (window.performance.memory) {
      setInterval(() => {
        this.trackMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad(loadTime) {
    this.metrics.performance.pageLoads++;

    // Calculate average load time
    const prevAvg = this.metrics.performance.averageLoadTime;
    const count = this.metrics.performance.pageLoads;
    this.metrics.performance.averageLoadTime = (prevAvg * (count - 1) + loadTime) / count;

    // Check load time threshold
    if (loadTime > this.thresholds.maxLoadTime) {
      this.triggerAlert('slow-page-load', {
        loadTime,
        threshold: this.thresholds.maxLoadTime
      });
    }

    logger.debug(`Page load tracked: ${loadTime}ms (avg: ${this.metrics.performance.averageLoadTime.toFixed(2)}ms)`);
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if (!window.performance.memory) return;

    const memory = {
      used: window.performance.memory.usedJSHeapSize,
      total: window.performance.memory.totalJSHeapSize,
      limit: window.performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };

    this.metrics.performance.memoryUsage.push(memory);

    // Keep only last 100 measurements
    if (this.metrics.performance.memoryUsage.length > 100) {
      this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.slice(-100);
    }

    // Check memory thresholds
    if (memory.used > this.thresholds.criticalMemoryUsage) {
      this.triggerAlert('critical-memory-usage', {
        used: memory.used,
        threshold: this.thresholds.criticalMemoryUsage
      });
    } else if (memory.used > this.thresholds.maxMemoryUsage) {
      this.triggerAlert('high-memory-usage', {
        used: memory.used,
        threshold: this.thresholds.maxMemoryUsage
      });
    }
  }

  /**
   * Setup connectivity monitoring
   */
  setupConnectivityMonitoring() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.metrics.connectivity.online = true;
      this.triggerAlert('connectivity-restored', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.metrics.connectivity.online = false;
      this.triggerAlert('connectivity-lost', { status: 'offline' });
    });

    // Connection type changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        const oldType = this.metrics.connectivity.connectionType;
        const newType = this.getConnectionType();

        this.metrics.connectivity.connectionType = newType;

        if (oldType !== newType) {
          logger.debug(`Connection type changed: ${oldType} → ${newType}`);
        }
      });
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  /**
   * Perform comprehensive health check
   */
  performHealthCheck() {
    const health = {
      timestamp: Date.now(),
      uptime: Date.now() - this.metrics.startTime,
      errors: {
        total: this.metrics.errors.length,
        recent: this.getRecentErrors(300000).length // Last 5 minutes
      },
      performance: {
        averageLoadTime: this.metrics.performance.averageLoadTime,
        pageLoads: this.metrics.performance.pageLoads,
        memoryUsage: this.getCurrentMemoryUsage()
      },
      connectivity: this.metrics.connectivity,
      storage: this.checkStorageHealth(),
      services: this.checkServiceHealth()
    };

    // Determine overall health status
    health.status = this.calculateHealthStatus(health);

    logger.system('Health check completed:', health);

    // Trigger alerts if needed
    if (health.status === 'critical') {
      this.triggerAlert('system-critical', health);
    } else if (health.status === 'warning') {
      this.triggerAlert('system-warning', health);
    }

    return health;
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage() {
    if (!window.performance.memory) return null;

    return {
      used: window.performance.memory.usedJSHeapSize,
      total: window.performance.memory.totalJSHeapSize,
      usedMB: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024)
    };
  }

  /**
   * Check storage health
   */
  checkStorageHealth() {
    try {
      // Test localStorage
      const testKey = '_health_check_' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      return {
        localStorage: 'healthy',
        quota: this.getStorageQuota()
      };
    } catch (error) {
      return {
        localStorage: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        return { error: error.message };
      }
    }
    return null;
  }

  /**
   * Check service health
   */
  checkServiceHealth() {
    // This would typically check external services
    return {
      api: 'unknown', // Would need actual API health check
      authentication: 'unknown',
      notifications: 'unknown'
    };
  }

  /**
   * Calculate overall health status
   */
  calculateHealthStatus(health) {
    let score = 100;

    // Error rate impact
    if (health.errors.recent > this.thresholds.maxErrors) {
      score -= 30;
    } else if (health.errors.recent > this.thresholds.maxErrors / 2) {
      score -= 15;
    }

    // Performance impact
    if (health.performance.averageLoadTime > this.thresholds.maxLoadTime) {
      score -= 20;
    } else if (health.performance.averageLoadTime > this.thresholds.maxLoadTime / 2) {
      score -= 10;
    }

    // Memory impact
    if (health.performance.memoryUsage) {
      if (health.performance.memoryUsage.used > this.thresholds.criticalMemoryUsage) {
        score -= 25;
      } else if (health.performance.memoryUsage.used > this.thresholds.maxMemoryUsage) {
        score -= 15;
      }
    }

    // Connectivity impact
    if (!health.connectivity.online) {
      score -= 40;
    }

    // Storage impact
    if (health.storage.localStorage === 'error') {
      score -= 20;
    }

    // Determine status based on score
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  /**
   * Trigger system alert
   */
  triggerAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: Date.now(),
      id: Date.now().toString()
    };

    this.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoringService(alert);
    }

    logger.warn(`Health alert triggered: ${type}`, data);
  }

  /**
   * Send alert to external monitoring service
   */
  sendToMonitoringService(alert) {
    // This would integrate with external monitoring services
    // like Sentry, LogRocket, etc.
    logger.debug('Alert sent to monitoring service:', alert);
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    return {
      status: this.calculateHealthStatus(this.performHealthCheck()),
      uptime: Date.now() - this.metrics.startTime,
      totalErrors: this.metrics.errors.length,
      recentErrors: this.getRecentErrors(300000).length,
      averageLoadTime: this.metrics.performance.averageLoadTime,
      memoryUsage: this.getCurrentMemoryUsage(),
      connectivity: this.metrics.connectivity,
      recentAlerts: this.alerts.slice(-10)
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    logger.system('HealthMonitor cleaned up');
  }
}

// Create singleton instance
const healthMonitor = new HealthMonitor();

// Global health monitoring functions
window.getHealthSummary = () => healthMonitor.getHealthSummary();
window.triggerHealthCheck = () => healthMonitor.performHealthCheck();

export default healthMonitor;
