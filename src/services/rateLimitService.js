/**
 * Rate Limiting Service
 * P2.4.5: Security Enhancement - Rate limiting for API calls
 * 
 * @description Client-side rate limiting and request throttling
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import storage from '@core/storage';
import { useCallback, useEffect, useState } from 'react';
import logger from '../utils/productionLogger';

/**
 * Rate Limiting Configuration
 */
const RATE_LIMIT_CONFIG = {
  // Default limits
  DEFAULT_WINDOW: 60 * 1000, // 1 minute
  DEFAULT_LIMIT: 60, // 60 requests per minute

  // Specific endpoint limits
  ENDPOINTS: {
    '/api/auth/login': { limit: 5, window: 60 * 1000 }, // 5 attempts per minute
    '/api/auth/register': { limit: 3, window: 60 * 1000 }, // 3 attempts per minute
    '/api/auth/forgot-password': { limit: 3, window: 60 * 1000 },
    '/api/products': { limit: 100, window: 60 * 1000 }, // 100 requests per minute
    '/api/orders': { limit: 30, window: 60 * 1000 }, // 30 requests per minute
    '/api/customers': { limit: 50, window: 60 * 1000 }
  },

  // Storage keys
  STORAGE_KEY: 'rate_limit_data',
  BLOCKED_KEY: 'rate_limit_blocked',

  // Cleanup settings
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 1000
};

/**
 * Rate Limit Entry Class
 */
class RateLimitEntry {
  constructor(endpoint, limit, window) {
    this.endpoint = endpoint;
    this.limit = limit;
    this.window = window;
    this.requests = [];
    this.blocked = false;
    this.blockExpiry = null;
    this.totalRequests = 0;
    this.violations = 0;
  }

  /**
   * Add a request timestamp
   */
  addRequest() {
    const now = Date.now();
    this.requests.push(now);
    this.totalRequests++;

    // Clean old requests outside the window
    this.cleanup();

    logger.debug('📊 Rate Limit Request Added:', {
      endpoint: this.endpoint,
      current: this.requests.length,
      limit: this.limit,
      totalRequests: this.totalRequests
    });
  }

  /**
   * Check if limit is exceeded
   */
  isLimitExceeded() {
    this.cleanup();
    const exceeded = this.requests.length >= this.limit;

    if (exceeded) {
      this.violations++;
      logger.warn('⚠️ Rate Limit Exceeded:', {
        endpoint: this.endpoint,
        requests: this.requests.length,
        limit: this.limit,
        violations: this.violations
      });
    }

    return exceeded;
  }

  /**
   * Block endpoint for specified duration
   */
  block(duration = this.window) {
    this.blocked = true;
    this.blockExpiry = Date.now() + duration;

    logger.warn('🚫 Endpoint Blocked:', {
      endpoint: this.endpoint,
      duration: duration / 1000 + 's',
      expiry: new Date(this.blockExpiry).toISOString()
    });
  }

  /**
   * Check if endpoint is currently blocked
   */
  isBlocked() {
    if (this.blocked && this.blockExpiry && Date.now() >= this.blockExpiry) {
      this.unblock();
    }

    return this.blocked;
  }

  /**
   * Unblock endpoint
   */
  unblock() {
    this.blocked = false;
    this.blockExpiry = null;

    logger.info('✅ Endpoint Unblocked:', { endpoint: this.endpoint });
  }

  /**
   * Clean old requests
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.window;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Get remaining requests
   */
  getRemainingRequests() {
    this.cleanup();
    return Math.max(0, this.limit - this.requests.length);
  }

  /**
   * Get time until window reset
   */
  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.window;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      endpoint: this.endpoint,
      limit: this.limit,
      window: this.window,
      currentRequests: this.requests.length,
      totalRequests: this.totalRequests,
      violations: this.violations,
      remaining: this.getRemainingRequests(),
      resetIn: this.getTimeUntilReset(),
      blocked: this.blocked,
      blockExpiry: this.blockExpiry
    };
  }
}

/**
 * Rate Limiting Service
 */
class RateLimitingService {
  static entries = new Map();
  static isInitialized = false;

  /**
   * Initialize the service
   */
  static initialize() {
    if (this.isInitialized) return;

    this.loadFromStorage();
    this.startCleanupTimer();
    this.isInitialized = true;

    logger.info('🛡️ Rate Limiting Service Initialized');
  }

  /**
   * Load rate limit data from storage
   */
  static loadFromStorage() {
    try {
      const data = storage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEY) || {};

      Object.entries(data).forEach(([endpoint, entryData]) => {
        const entry = new RateLimitEntry(
          entryData.endpoint,
          entryData.limit,
          entryData.window
        );

        // Restore state
        entry.requests = entryData.requests || [];
        entry.blocked = entryData.blocked || false;
        entry.blockExpiry = entryData.blockExpiry || null;
        entry.totalRequests = entryData.totalRequests || 0;
        entry.violations = entryData.violations || 0;

        this.entries.set(endpoint, entry);
      });

      logger.debug('📚 Rate Limit Data Loaded:', { entries: this.entries.size });
    } catch (error) {
      logger.error('❌ Failed to load rate limit data:', error);
    }
  }

  /**
   * Save rate limit data to storage
   */
  static saveToStorage() {
    try {
      const data = {};

      this.entries.forEach((entry, endpoint) => {
        data[endpoint] = {
          endpoint: entry.endpoint,
          limit: entry.limit,
          window: entry.window,
          requests: entry.requests,
          blocked: entry.blocked,
          blockExpiry: entry.blockExpiry,
          totalRequests: entry.totalRequests,
          violations: entry.violations
        };
      });

      storage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEY, data);

      logger.debug('💾 Rate Limit Data Saved:', { entries: Object.keys(data).length });
    } catch (error) {
      logger.error('❌ Failed to save rate limit data:', error);
    }
  }

  /**
   * Get or create rate limit entry for endpoint
   */
  static getEntry(endpoint) {
    if (!this.entries.has(endpoint)) {
      const config = this.getEndpointConfig(endpoint);
      const entry = new RateLimitEntry(endpoint, config.limit, config.window);
      this.entries.set(endpoint, entry);
    }

    return this.entries.get(endpoint);
  }

  /**
   * Get configuration for endpoint
   */
  static getEndpointConfig(endpoint) {
    // Check for exact match
    if (RATE_LIMIT_CONFIG.ENDPOINTS[endpoint]) {
      return RATE_LIMIT_CONFIG.ENDPOINTS[endpoint];
    }

    // Check for pattern match
    for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG.ENDPOINTS)) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }

    // Return default
    return {
      limit: RATE_LIMIT_CONFIG.DEFAULT_LIMIT,
      window: RATE_LIMIT_CONFIG.DEFAULT_WINDOW
    };
  }

  /**
   * Check if request is allowed
   */
  static isRequestAllowed(endpoint) {
    this.initialize();

    const entry = this.getEntry(endpoint);

    // Check if blocked
    if (entry.isBlocked()) {
      logger.warn('🚫 Request Blocked:', {
        endpoint,
        blockExpiry: new Date(entry.blockExpiry).toISOString()
      });
      return false;
    }

    // Check rate limit
    if (entry.isLimitExceeded()) {
      // Block endpoint for excessive requests
      entry.block();
      this.saveToStorage();
      return false;
    }

    return true;
  }

  /**
   * Record a request
   */
  static recordRequest(endpoint) {
    this.initialize();

    const entry = this.getEntry(endpoint);
    entry.addRequest();
    this.saveToStorage();

    logger.debug('📝 Request Recorded:', {
      endpoint,
      remaining: entry.getRemainingRequests(),
      resetIn: Math.ceil(entry.getTimeUntilReset() / 1000) + 's'
    });
  }

  /**
   * Check and record request (combined operation)
   */
  static checkAndRecord(endpoint) {
    if (!this.isRequestAllowed(endpoint)) {
      return false;
    }

    this.recordRequest(endpoint);
    return true;
  }

  /**
   * Get rate limit status for endpoint
   */
  static getStatus(endpoint) {
    this.initialize();

    const entry = this.getEntry(endpoint);
    return entry.getStats();
  }

  /**
   * Reset rate limit for endpoint
   */
  static reset(endpoint) {
    this.initialize();

    if (this.entries.has(endpoint)) {
      this.entries.delete(endpoint);
      this.saveToStorage();

      logger.info('🔄 Rate Limit Reset:', { endpoint });
    }
  }

  /**
   * Block endpoint manually
   */
  static blockEndpoint(endpoint, duration = RATE_LIMIT_CONFIG.DEFAULT_WINDOW) {
    this.initialize();

    const entry = this.getEntry(endpoint);
    entry.block(duration);
    this.saveToStorage();
  }

  /**
   * Unblock endpoint manually
   */
  static unblockEndpoint(endpoint) {
    this.initialize();

    const entry = this.getEntry(endpoint);
    entry.unblock();
    this.saveToStorage();
  }

  /**
   * Start cleanup timer
   */
  static startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, RATE_LIMIT_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Cleanup old entries and expired blocks
   */
  static cleanup() {
    const now = Date.now();
    let cleaned = 0;

    this.entries.forEach((entry, endpoint) => {
      entry.cleanup();

      // Remove entries with no recent requests and not blocked
      if (entry.requests.length === 0 && !entry.isBlocked()) {
        const lastActivity = entry.totalRequests > 0 ?
          Math.max(...entry.requests, now - RATE_LIMIT_CONFIG.CLEANUP_INTERVAL) :
          now - RATE_LIMIT_CONFIG.CLEANUP_INTERVAL;

        if (now - lastActivity > RATE_LIMIT_CONFIG.CLEANUP_INTERVAL) {
          this.entries.delete(endpoint);
          cleaned++;
        }
      }
    });

    // Limit total entries
    if (this.entries.size > RATE_LIMIT_CONFIG.MAX_ENTRIES) {
      const sorted = Array.from(this.entries.entries()).sort((a, b) => {
        const aLastActivity = a[1].requests.length > 0 ? Math.max(...a[1].requests) : 0;
        const bLastActivity = b[1].requests.length > 0 ? Math.max(...b[1].requests) : 0;
        return aLastActivity - bLastActivity;
      });

      const toRemove = sorted.slice(0, this.entries.size - RATE_LIMIT_CONFIG.MAX_ENTRIES);
      toRemove.forEach(([endpoint]) => {
        this.entries.delete(endpoint);
        cleaned++;
      });
    }

    if (cleaned > 0) {
      this.saveToStorage();
      logger.debug('🧹 Rate Limit Cleanup:', {
        cleaned,
        remaining: this.entries.size
      });
    }
  }

  /**
   * Get all statistics
   */
  static getAllStats() {
    this.initialize();

    const stats = {
      totalEndpoints: this.entries.size,
      blockedEndpoints: 0,
      totalRequests: 0,
      totalViolations: 0,
      endpoints: {}
    };

    this.entries.forEach((entry, endpoint) => {
      const entryStats = entry.getStats();
      stats.endpoints[endpoint] = entryStats;
      stats.totalRequests += entryStats.totalRequests;
      stats.totalViolations += entryStats.violations;

      if (entryStats.blocked) {
        stats.blockedEndpoints++;
      }
    });

    return stats;
  }

  /**
   * Rate limited fetch wrapper
   */
  static async rateLimitedFetch(url, options = {}) {
    const endpoint = new URL(url, window.location.origin).pathname;

    if (!this.checkAndRecord(endpoint)) {
      const status = this.getStatus(endpoint);
      const error = new Error('Rate limit exceeded');
      error.rateLimitStatus = status;
      throw error;
    }

    try {
      const response = await fetch(url, options);

      logger.debug('🌐 Rate Limited Request:', {
        url: url.substring(0, 50) + (url.length > 50 ? '...' : ''),
        status: response.status,
        remaining: this.getStatus(endpoint).remaining
      });

      return response;
    } catch (error) {
      logger.error('❌ Rate Limited Fetch Failed:', error);
      throw error;
    }
  }
}

/**
 * React Hook for Rate Limiting
 */
export const useRateLimit = (endpoint) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (endpoint) {
      setStatus(RateLimitingService.getStatus(endpoint));
    }
  }, [endpoint]);

  const checkLimit = useCallback(() => {
    if (!endpoint) return false;
    return RateLimitingService.isRequestAllowed(endpoint);
  }, [endpoint]);

  const recordRequest = useCallback(() => {
    if (!endpoint) return;
    RateLimitingService.recordRequest(endpoint);
    setStatus(RateLimitingService.getStatus(endpoint));
  }, [endpoint]);

  const rateLimitedFetch = useCallback((url, options = {}) => {
    return RateLimitingService.rateLimitedFetch(url, options);
  }, []);

  return {
    status,
    checkLimit,
    recordRequest,
    rateLimitedFetch,
    isBlocked: status?.blocked || false,
    remaining: status?.remaining || 0,
    resetIn: status?.resetIn || 0
  };
};

export {
  RATE_LIMIT_CONFIG, RateLimitEntry, RateLimitingService
};

export default RateLimitingService;
