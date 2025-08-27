/**
 * PRODUCTION LOGGER SERVICE
 * Environment-aware logging system for Kırılmazlar Panel
 * Development: Full logging, Production: Silent/Error only
 */

/* eslint-disable no-console */

class ProductionLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';

    // Log levels
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      SILENT: 4
    };

    // Set log level based on environment
    this.currentLevel = this.isDevelopment ? this.levels.DEBUG : this.levels.ERROR;

    // Initialize performance monitoring
    this.startTime = performance.now();
    this.metrics = {
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0
    };
  }

  /**
   * Debug level logging - Only in development
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.debug('🔍 [DEBUG]', ...args);
      this.metrics.debug++;
    }
  }

  /**
   * Info level logging - Development and selective production
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (this.currentLevel <= this.levels.INFO) {
      console.info('ℹ️ [INFO]', ...args);
      this.metrics.info++;
    }
  }

  /**
   * Warning level logging - Development and production
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn('⚠️ [WARN]', ...args);
      this.metrics.warnings++;
    }
  }

  /**
   * Error level logging - Always logged
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (this.currentLevel <= this.levels.ERROR) {
      console.error('❌ [ERROR]', ...args);
      this.metrics.errors++;

      // In production, send to error reporting service
      if (this.isProduction) {
        this.reportToErrorService(args);
      }
    }
  }

  /**
   * Success logging - Only in development
   * @param {...any} args - Arguments to log
   */
  success(...args) {
    if (this.currentLevel <= this.levels.INFO) {
      console.info('✅ [SUCCESS]', ...args);
      this.metrics.info++;
    }
  }

  /**
   * Performance timing
   * @param {string} label - Performance label
   * @param {Function} operation - Operation to time
   */
  async time(label, operation) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.time(`⏱️ ${label}`);
    }

    const result = await operation();

    if (this.currentLevel <= this.levels.DEBUG) {
      console.timeEnd(`⏱️ ${label}`);
    }

    return result;
  }

  /**
   * Group logging - Only in development
   * @param {string} groupName - Group name
   * @param {Function} groupContent - Content to group
   */
  group(groupName, groupContent) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.group(groupName);
      groupContent();
      console.groupEnd();
    }
  }

  /**
   * Storage/System monitoring logs
   * @param {string} system - System name (Storage, Auth, etc.)
   * @param {string} message - Message
   * @param {any} data - Additional data
   */
  system(system, message, data = null) {
    if (this.currentLevel <= this.levels.INFO) {
      const emoji = this.getSystemEmoji(system);
      console.info(`${emoji} [${system.toUpperCase()}]`, message, data || '');
      this.metrics.info++;
    }
  }

  /**
   * Get emoji for system type
   * @param {string} system - System name
   * @returns {string} - Emoji
   */
  getSystemEmoji(system) {
    const emojis = {
      storage: '🛡️',
      auth: '🔐',
      order: '📦',
      customer: '👤',
      product: '🛒',
      session: '🔄',
      security: '🔒',
      performance: '⚡',
      sync: '🔄',
      api: '🌐'
    };
    return emojis[system.toLowerCase()] || '🔧';
  }

  /**
   * Report errors to external service (Production only)
   * @param {any[]} args - Error arguments
   */
  reportToErrorService(args) {
    try {
      // Railway deployment bilgilerini topla
      const railwayInfo = {
        environment: process.env.VITE_APP_ENVIRONMENT || 'unknown',
        railwayUrl: process.env.VITE_API_BASE_URL || 'not-set',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        mode: process.env.MODE || 'unknown',
        prod: process.env.NODE_ENV === 'production'
      };
      
      // Gerçek bir hata servisi entegrasyonu burada olabilir
      // Şimdilik localStorage'a kaydet
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: args,
        userAgent: navigator.userAgent,
        url: window.location.href,
        railway: railwayInfo,
        storage: {
          localStorageSize: Object.keys(localStorage).length,
          hasUsers: !!localStorage.getItem('users'),
          hasCurrentUser: !!localStorage.getItem('currentUser')
        }
      };

      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(errorLog);

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      localStorage.setItem('error_logs', JSON.stringify(errors));
      
      // Railway production'da console'a da yaz (Railway logs için)
      if (railwayInfo.environment === 'production' || railwayInfo.prod) {
        console.log('🚂 RAILWAY LOG:', JSON.stringify({
          level: 'error',
          message: args,
          timestamp: errorLog.timestamp,
          railway: railwayInfo,
          data: typeof args === 'object' ? JSON.stringify(args) : args
        }));
      }
      
    } catch (e) {
      // Silent fail - don't break the app
      console.error('Error reporting failed:', e);
    }
  }

  /**
   * Get logging statistics
   * @returns {Object} - Metrics object
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Math.round(performance.now() - this.startTime),
      environment: this.isDevelopment ? 'development' : 'production',
      level: Object.keys(this.levels).find(key => this.levels[key] === this.currentLevel)
    };
  }

  /**
   * Set log level dynamically
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, SILENT)
   */
  setLevel(level) {
    if (this.levels[level.toUpperCase()] !== undefined) {
      this.currentLevel = this.levels[level.toUpperCase()];
      this.info(`Log level set to: ${level.toUpperCase()}`);
    }
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    localStorage.removeItem('error_logs');
    this.success('Error logs cleared');
  }

  /**
   * Railway-specific logging method
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  railway(message, data = {}) {
    const railwayLog = {
      timestamp: new Date().toISOString(),
      message,
      data,
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'unknown',
      url: window.location.href
    };
    
    // Her zaman console'a yaz (Railway logs için)
    console.log('🚂 RAILWAY:', JSON.stringify(railwayLog));
    
    // Development'da da detaylı göster
    if (this.isDevelopment) {
      console.info(`🚂 [RAILWAY] ${message}`, data);
    }
  }
}

// Create singleton instance
const logger = new ProductionLogger();

// Global access for debugging (development only)
if (logger.isDevelopment) {
  window.logger = logger;
}

export default logger;
export { logger };

