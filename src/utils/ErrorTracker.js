/**
 * ===========================================
 * KIRIILMAZLAR PANEL - ERROR TRACKER
 * Advanced error tracking and reporting system
 * ===========================================
 */

import logger from '../utils/productionLogger.js';

class ErrorTracker {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.errors = [];
    this.maxErrors = 1000; // Maximum errors to store
    this.sessionId = this.generateSessionId();

    this.errorCategories = {
      javascript: 'JavaScript Runtime Error',
      network: 'Network/API Error',
      react: 'React Component Error',
      performance: 'Performance Issue',
      security: 'Security Violation',
      storage: 'Storage Access Error',
      user: 'User Action Error'
    };

    this.severityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize error tracking
   */
  initialize() {
    try {
      this.setupGlobalErrorHandlers();
      this.setupReactErrorBoundary();
      this.setupNetworkErrorTracking();
      this.setupPerformanceErrorTracking();

      logger.system('ErrorTracker initialized successfully');
    } catch (error) {
      logger.error('ErrorTracker initialization failed:', error);
    }
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // JavaScript runtime errors
    window.addEventListener('error', (event) => {
      this.trackError({
        category: 'javascript',
        severity: 'high',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        category: 'javascript',
        severity: 'high',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.trackError({
        category: 'security',
        severity: 'critical',
        message: `CSP Violation: ${event.violatedDirective}`,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Setup React error boundary integration
   */
  setupReactErrorBoundary() {
    window.reportReactError = (error, errorInfo) => {
      this.trackError({
        category: 'react',
        severity: 'critical',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    };
  }

  /**
   * Setup network error tracking
   */
  setupNetworkErrorTracking() {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Development modunda edge-storage hatalarını ignore et
        if (import.meta.env.DEV && args[0] && args[0].includes('/api/edge-storage')) {
          return response;
        }

        // Track failed HTTP requests
        if (!response.ok) {
          this.trackError({
            category: 'network',
            severity: response.status >= 500 ? 'critical' : 'medium',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            method: args[1]?.method || 'GET',
            status: response.status,
            timestamp: Date.now()
          });
        }

        return response;
      } catch (error) {
        this.trackError({
          category: 'network',
          severity: 'high',
          message: `Network error: ${error.message}`,
          url: args[0],
          method: args[1]?.method || 'GET',
          stack: error.stack,
          timestamp: Date.now()
        });
        throw error;
      }
    };
  }

  /**
   * Setup performance error tracking
   */
  setupPerformanceErrorTracking() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.trackError({
                category: 'performance',
                severity: entry.duration > 100 ? 'high' : 'medium',
                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
                timestamp: Date.now()
              });
            }
          });
        });

        // Check if longtask is supported before observing
        if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
          observer.observe({ entryTypes: ['longtask'] });
        }
      } catch (error) {
        // Silently handle unsupported entryTypes
        console.debug('Performance observer longtask not supported');
      }
    }

    // Monitor large resources
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.transferSize > 1024 * 1024) { // Resources larger than 1MB
              this.trackError({
                category: 'performance',
                severity: 'medium',
                message: `Large resource loaded: ${(entry.transferSize / 1024 / 1024).toFixed(2)}MB`,
                name: entry.name,
                transferSize: entry.transferSize,
                duration: entry.duration,
                timestamp: Date.now()
              });
            }
          });
        });

        // Check if resource is supported before observing
        if (PerformanceObserver.supportedEntryTypes.includes('resource')) {
          observer.observe({ entryTypes: ['resource'] });
        }
      } catch (error) {
        // Silently handle unsupported entryTypes
        console.debug('Performance observer resource not supported');
      }
    }
  }

  /**
   * Track custom error
   */
  trackError(errorData) {
    // Add common metadata
    const enhancedError = {
      id: this.generateErrorId(),
      sessionId: this.sessionId,
      category: errorData.category || 'javascript',
      severity: errorData.severity || 'medium',
      message: errorData.message || 'Unknown error',
      timestamp: errorData.timestamp || Date.now(),
      url: errorData.url || window.location.href,
      userAgent: errorData.userAgent || navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      ...errorData
    };

    // Add to error collection
    this.errors.push(enhancedError);

    // Maintain error limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log error
    this.logError(enhancedError);

    // Send to external service in production
    if (this.isProduction) {
      this.sendToErrorService(enhancedError);
    }

    return enhancedError;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  /**
   * Log error with appropriate level
   */
  logError(error) {
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`;

    switch (error.severity) {
      case 'critical':
        logger.error(logMessage, error);
        break;
      case 'high':
        logger.error(logMessage, error);
        break;
      case 'medium':
        logger.warn(logMessage, error);
        break;
      case 'low':
        logger.info(logMessage, error);
        break;
      default:
        logger.debug(logMessage, error);
    }
  }

  /**
   * Send error to external monitoring service
   */
  sendToErrorService(error) {
    // This would integrate with services like Sentry, LogRocket, etc.
    try {
      // Simulate sending to error service
      logger.debug('Error sent to monitoring service:', error.id);

      // In a real implementation, you would use:
      // Sentry.captureException(error);
      // or similar service integration
    } catch (sendError) {
      logger.error('Failed to send error to monitoring service:', sendError);
    }
  }

  /**
   * Track user action error
   */
  trackUserError(action, error, context = {}) {
    return this.trackError({
      category: 'user',
      severity: 'medium',
      message: `User action failed: ${action}`,
      action,
      error: error.message || error,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Track storage error
   */
  trackStorageError(operation, error, storageType = 'localStorage') {
    return this.trackError({
      category: 'storage',
      severity: 'high',
      message: `Storage operation failed: ${operation}`,
      operation,
      storageType,
      error: error.message || error,
      timestamp: Date.now()
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeframe = 3600000) { // Default: last hour
    const cutoff = Date.now() - timeframe;
    const recentErrors = this.errors.filter(error => error.timestamp > cutoff);

    const stats = {
      total: recentErrors.length,
      bySeverity: {},
      byCategory: {},
      topErrors: {},
      timeline: this.getErrorTimeline(recentErrors)
    };

    // Group by severity
    Object.keys(this.severityLevels).forEach(severity => {
      stats.bySeverity[severity] = recentErrors.filter(e => e.severity === severity).length;
    });

    // Group by category
    Object.keys(this.errorCategories).forEach(category => {
      stats.byCategory[category] = recentErrors.filter(e => e.category === category).length;
    });

    // Top error messages
    const errorCounts = {};
    recentErrors.forEach(error => {
      const key = error.message.substring(0, 100); // Truncate for grouping
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    stats.topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return stats;
  }

  /**
   * Get error timeline
   */
  getErrorTimeline(errors, buckets = 12) {
    const timeline = Array(buckets).fill(0);
    const timeframe = 3600000; // 1 hour
    const bucketSize = timeframe / buckets;
    const now = Date.now();

    errors.forEach(error => {
      const age = now - error.timestamp;
      const bucketIndex = Math.min(Math.floor(age / bucketSize), buckets - 1);
      timeline[buckets - 1 - bucketIndex]++;
    });

    return timeline;
  }

  /**
   * Get recent critical errors
   */
  getCriticalErrors(timeframe = 3600000) {
    const cutoff = Date.now() - timeframe;
    return this.errors
      .filter(error => error.timestamp > cutoff && error.severity === 'critical')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear error history
   */
  clearErrors() {
    const count = this.errors.length;
    this.errors = [];
    logger.system(`Cleared ${count} errors from error tracker`);
    return count;
  }

  /**
   * Export error data
   */
  exportErrors(format = 'json') {
    const data = {
      sessionId: this.sessionId,
      exportTime: Date.now(),
      errors: this.errors,
      stats: this.getErrorStats()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'category', 'severity', 'message', 'url'];
      const rows = this.errors.map(error =>
        headers.map(header => error[header] || '').join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }

    return data;
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Global error tracking functions
window.trackError = (error, context) => errorTracker.trackError({ ...error, ...context });
window.trackUserError = (action, error, context) => errorTracker.trackUserError(action, error, context);
window.getErrorStats = (timeframe) => errorTracker.getErrorStats(timeframe);
window.getCriticalErrors = (timeframe) => errorTracker.getCriticalErrors(timeframe);
window.exportErrors = (format) => errorTracker.exportErrors(format);

export default errorTracker;
