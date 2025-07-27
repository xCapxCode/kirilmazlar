/**
 * Environment Configuration Service
 * Centralized environment variable management with type safety and validation
 * 
 * @author GeniusCoder (Gen)
 * @version 1.0.0
 */

import logger from '@utils/productionLogger.js';

class EnvironmentService {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  /**
   * Detect current environment
   * @returns {string} Environment name
   */
  detectEnvironment() {
    const env = import.meta.env.VITE_APP_ENVIRONMENT || import.meta.env.MODE || 'development';
    const validEnvironments = ['development', 'staging', 'production'];

    if (!validEnvironments.includes(env)) {
      logger.warn(`Invalid environment "${env}", defaulting to development`);
      return 'development';
    }

    return env;
  }

  /**
   * Load and parse environment configuration
   * @returns {object} Configuration object
   */
  loadConfiguration() {
    return {
      // App Configuration
      app: {
        name: import.meta.env.VITE_APP_NAME || 'Kırılmazlar Panel',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: this.environment,
        debug: this.parseBoolean(import.meta.env.VITE_APP_DEBUG, false)
      },

      // API Configuration
      api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
        timeout: this.parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
        retryAttempts: this.parseNumber(import.meta.env.VITE_API_RETRY_ATTEMPTS, 3)
      },

      // Feature Flags
      features: {
        consoleLogs: this.parseBoolean(import.meta.env.VITE_ENABLE_CONSOLE_LOGS, true),
        developerTools: this.parseBoolean(import.meta.env.VITE_ENABLE_DEVELOPER_TOOLS, true),
        mockData: this.parseBoolean(import.meta.env.VITE_ENABLE_MOCK_DATA, true),
        storageDebug: this.parseBoolean(import.meta.env.VITE_ENABLE_STORAGE_DEBUG, true)
      },

      // Performance Settings
      performance: {
        serviceWorker: this.parseBoolean(import.meta.env.VITE_ENABLE_SERVICE_WORKER, false),
        lazyLoading: this.parseBoolean(import.meta.env.VITE_ENABLE_LAZY_LOADING, true),
        bundleAnalyzer: this.parseBoolean(import.meta.env.VITE_BUNDLE_ANALYZER, false)
      },

      // Security Settings
      security: {
        enableCSP: this.parseBoolean(import.meta.env.VITE_ENABLE_CSP, false),
        enableHTTPS: this.parseBoolean(import.meta.env.VITE_ENABLE_HTTPS, false),
        sessionTimeout: this.parseNumber(import.meta.env.VITE_SESSION_TIMEOUT, 3600000)
      },

      // Storage Configuration
      storage: {
        type: import.meta.env.VITE_STORAGE_TYPE || 'localStorage',
        prefix: import.meta.env.VITE_STORAGE_PREFIX || 'kirilmazlar_dev_',
        encrypt: this.parseBoolean(import.meta.env.VITE_STORAGE_ENCRYPT, false)
      },

      // Monitoring & Analytics
      monitoring: {
        analytics: this.parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, false),
        errorReporting: this.parseBoolean(import.meta.env.VITE_ENABLE_ERROR_REPORTING, false),
        performanceMonitoring: this.parseBoolean(import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING, false)
      },

      // Development Server
      dev: {
        port: this.parseNumber(import.meta.env.VITE_DEV_SERVER_PORT, 5500),
        host: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
        open: this.parseBoolean(import.meta.env.VITE_DEV_SERVER_OPEN, true)
      }
    };
  }

  /**
   * Validate configuration values
   */
  validateConfiguration() {
    const errors = [];

    // Validate API URL
    if (!this.isValidUrl(this.config.api.baseUrl)) {
      errors.push(`Invalid API base URL: ${this.config.api.baseUrl}`);
    }

    // Validate timeout values
    if (this.config.api.timeout < 1000 || this.config.api.timeout > 60000) {
      errors.push(`API timeout must be between 1000ms and 60000ms, got: ${this.config.api.timeout}`);
    }

    // Validate session timeout
    if (this.config.security.sessionTimeout < 300000) { // Min 5 minutes
      errors.push(`Session timeout too short: ${this.config.security.sessionTimeout}ms`);
    }

    // Validate port range
    if (this.config.dev.port < 1024 || this.config.dev.port > 65535) {
      errors.push(`Invalid port number: ${this.config.dev.port}`);
    }

    if (errors.length > 0) {
      logger.error('Environment configuration validation errors:', errors);
      throw new Error(`Environment configuration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Parse boolean value from string
   */
  parseBoolean(value, defaultValue = false) {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'boolean') return value;
    return value.toLowerCase() === 'true';
  }

  /**
   * Parse number value from string
   */
  parseNumber(value, defaultValue = 0) {
    if (value === undefined || value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate URL format
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Check if current environment is development
   */
  isDevelopment() {
    return this.environment === 'development';
  }

  /**
   * Check if current environment is staging
   */
  isStaging() {
    return this.environment === 'staging';
  }

  /**
   * Check if current environment is production
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * Get configuration value by path
   * @param {string} path - Dot notation path (e.g., 'api.baseUrl')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this.config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Print configuration summary (safe for production)
   */
  printSummary() {
    const summary = {
      environment: this.environment,
      app: {
        name: this.config.app.name,
        version: this.config.app.version,
        debug: this.config.app.debug
      },
      api: {
        baseUrl: this.config.api.baseUrl,
        timeout: this.config.api.timeout
      },
      features: this.config.features,
      performance: this.config.performance
    };

    if (this.isDevelopment()) {
      logger.system('Environment Configuration Summary:', summary);
    }

    return summary;
  }
}

// Create singleton instance
const environmentService = new EnvironmentService();

export default environmentService;
export { EnvironmentService };
