/**
 * API Rate Limiting Service
 * P2.4.5: Security Enhancement - Advanced API rate limiting implementation
 * 
 * @description Comprehensive rate limiting for API calls with adaptive throttling and security monitoring
 * @author KırılmazlarPanel Development Team  
 * @date July 25, 2025 - Enhanced Rate Limiting
 */

import storage from '@core/storage';
import { SecurityMonitorService } from '../../services/securityService';
import logger from '../../utils/productionLogger';

/**
 * Rate Limiting Configuration
 */
const RATE_LIMIT_CONFIG = {
  // Global rate limits
  GLOBAL: {
    REQUESTS_PER_MINUTE: 120,
    REQUESTS_PER_HOUR: 2000,
    BURST_LIMIT: 10 // Maximum requests in 10 seconds
  },

  // Endpoint-specific limits
  ENDPOINTS: {
    '/api/auth/login': { requests: 5, window: 60000, burst: 2 }, // 5 per minute
    '/api/auth/refresh': { requests: 10, window: 60000, burst: 3 },
    '/api/orders': { requests: 60, window: 60000, burst: 10 },
    '/api/products': { requests: 100, window: 60000, burst: 15 },
    '/api/customers': { requests: 30, window: 60000, burst: 5 },
    '/api/upload': { requests: 10, window: 60000, burst: 2 }
  },

  // User-based limits
  USER_LIMITS: {
    AUTHENTICATED: { requests: 1000, window: 3600000 }, // 1000 per hour
    ANONYMOUS: { requests: 100, window: 3600000 }, // 100 per hour
    ADMIN: { requests: 5000, window: 3600000 } // 5000 per hour
  },

  // Security thresholds
  SECURITY: {
    SUSPICIOUS_THRESHOLD: 200, // Requests per minute that trigger security monitoring
    BAN_THRESHOLD: 500, // Requests per minute that trigger temporary ban
    BAN_DURATION: 15 * 60 * 1000, // 15 minutes
    PROGRESSIVE_DELAY: true, // Enable progressive delay for repeated violations
    MAX_DELAY: 30000 // Maximum delay (30 seconds)
  },

  // Storage keys
  STORAGE_KEYS: {
    REQUEST_COUNTS: 'rate_limit_requests',
    BANNED_IPS: 'rate_limit_banned',
    VIOLATIONS: 'rate_limit_violations',
    USER_LIMITS: 'rate_limit_users'
  }
};

/**
 * Request Rate Tracker
 */
class RequestRateTracker {
  static requestCounts = new Map();
  static lastCleanup = Date.now();
  static cleanupInterval = 60000; // Cleanup every minute

  /**
   * Track request for an identifier (IP, user, endpoint)
   */
  static trackRequest(identifier, endpoint = null) {
    const now = Date.now();
    const key = endpoint ? `${identifier}:${endpoint}` : identifier;

    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }

    const requests = this.requestCounts.get(key);
    requests.push(now);

    // Cleanup old requests periodically
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
    }

    return requests.length;
  }

  /**
   * Get request count for a time window
   */
  static getRequestCount(identifier, windowMs, endpoint = null) {
    const now = Date.now();
    const key = endpoint ? `${identifier}:${endpoint}` : identifier;
    const requests = this.requestCounts.get(key) || [];

    // Filter requests within the time window
    const recentRequests = requests.filter(timestamp =>
      now - timestamp < windowMs
    );

    // Update the stored requests to only keep recent ones
    this.requestCounts.set(key, recentRequests);

    return recentRequests.length;
  }

  /**
   * Get burst request count (last 10 seconds)
   */
  static getBurstCount(identifier, endpoint = null) {
    return this.getRequestCount(identifier, 10000, endpoint);
  }

  /**
   * Cleanup old request records
   */
  static cleanup() {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(RATE_LIMIT_CONFIG.USER_LIMITS).map(l => l.window));

    for (const [key, requests] of this.requestCounts.entries()) {
      const recentRequests = requests.filter(timestamp =>
        now - timestamp < maxAge
      );

      if (recentRequests.length === 0) {
        this.requestCounts.delete(key);
      } else {
        this.requestCounts.set(key, recentRequests);
      }
    }

    this.lastCleanup = now;

    logger.debug('🧹 Rate limit tracker cleanup completed', {
      activeTrackers: this.requestCounts.size
    });
  }

  /**
   * Get current statistics
   */
  static getStatistics() {
    const now = Date.now();
    const stats = {
      totalTrackers: this.requestCounts.size,
      activeRequests: 0,
      topIdentifiers: []
    };

    const identifierCounts = new Map();

    for (const [key, requests] of this.requestCounts.entries()) {
      const recentRequests = requests.filter(timestamp =>
        now - timestamp < 60000 // Last minute
      );

      stats.activeRequests += recentRequests.length;

      const identifier = key.split(':')[0];
      identifierCounts.set(identifier,
        (identifierCounts.get(identifier) || 0) + recentRequests.length
      );
    }

    // Get top 5 most active identifiers
    stats.topIdentifiers = Array.from(identifierCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ identifier: id, requests: count }));

    return stats;
  }
}

/**
 * Adaptive Rate Limiter with Security Features
 */
class AdaptiveRateLimiter {
  static bannedIdentifiers = new Map();
  static violations = new Map();
  static progressiveDelays = new Map();

  /**
   * Check if request should be rate limited
   */
  static async checkRateLimit(identifier, endpoint, userRole = 'anonymous') {
    const now = Date.now();

    // Check if identifier is banned
    if (this.isBanned(identifier)) {
      const banInfo = this.bannedIdentifiers.get(identifier);
      logger.warn('🚫 Request from banned identifier:', {
        identifier: identifier.substring(0, 8) + '...',
        reason: banInfo.reason,
        expiresAt: new Date(banInfo.expiresAt).toISOString()
      });

      return {
        allowed: false,
        reason: 'banned',
        retryAfter: Math.ceil((banInfo.expiresAt - now) / 1000),
        details: banInfo
      };
    }

    // Track the request
    RequestRateTracker.trackRequest(identifier, endpoint);

    // Check various rate limits
    const checks = [
      this.checkGlobalLimits(identifier),
      this.checkEndpointLimits(identifier, endpoint),
      this.checkUserLimits(identifier, userRole),
      this.checkSecurityThresholds(identifier)
    ];

    for (const check of checks) {
      const result = await check;
      if (!result.allowed) {
        this.handleViolation(identifier, result.reason, result.severity || 'medium');
        return result;
      }
    }

    // Apply progressive delay if there are previous violations
    const delay = this.getProgressiveDelay(identifier);
    if (delay > 0) {
      return {
        allowed: true,
        delay,
        reason: 'progressive_throttling',
        message: `Request delayed by ${delay}ms due to previous violations`
      };
    }

    return { allowed: true };
  }

  /**
   * Check global rate limits
   */
  static async checkGlobalLimits(identifier) {
    const minuteCount = RequestRateTracker.getRequestCount(identifier, 60000);
    const hourCount = RequestRateTracker.getRequestCount(identifier, 3600000);
    const burstCount = RequestRateTracker.getBurstCount(identifier);

    if (burstCount > RATE_LIMIT_CONFIG.GLOBAL.BURST_LIMIT) {
      return {
        allowed: false,
        reason: 'burst_limit_exceeded',
        severity: 'high',
        retryAfter: 10,
        details: { burstCount, limit: RATE_LIMIT_CONFIG.GLOBAL.BURST_LIMIT }
      };
    }

    if (minuteCount > RATE_LIMIT_CONFIG.GLOBAL.REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        reason: 'global_minute_limit_exceeded',
        severity: 'medium',
        retryAfter: 60,
        details: { minuteCount, limit: RATE_LIMIT_CONFIG.GLOBAL.REQUESTS_PER_MINUTE }
      };
    }

    if (hourCount > RATE_LIMIT_CONFIG.GLOBAL.REQUESTS_PER_HOUR) {
      return {
        allowed: false,
        reason: 'global_hour_limit_exceeded',
        severity: 'medium',
        retryAfter: 3600,
        details: { hourCount, limit: RATE_LIMIT_CONFIG.GLOBAL.REQUESTS_PER_HOUR }
      };
    }

    return { allowed: true };
  }

  /**
   * Check endpoint-specific limits
   */
  static async checkEndpointLimits(identifier, endpoint) {
    if (!endpoint || !RATE_LIMIT_CONFIG.ENDPOINTS[endpoint]) {
      return { allowed: true };
    }

    const config = RATE_LIMIT_CONFIG.ENDPOINTS[endpoint];
    const requestCount = RequestRateTracker.getRequestCount(identifier, config.window, endpoint);
    const burstCount = RequestRateTracker.getBurstCount(identifier, endpoint);

    if (burstCount > config.burst) {
      return {
        allowed: false,
        reason: 'endpoint_burst_limit_exceeded',
        severity: 'high',
        retryAfter: 10,
        details: { endpoint, burstCount, limit: config.burst }
      };
    }

    if (requestCount > config.requests) {
      return {
        allowed: false,
        reason: 'endpoint_limit_exceeded',
        severity: 'medium',
        retryAfter: Math.ceil(config.window / 1000),
        details: { endpoint, requestCount, limit: config.requests }
      };
    }

    return { allowed: true };
  }

  /**
   * Check user-based limits
   */
  static async checkUserLimits(identifier, userRole) {
    const config = RATE_LIMIT_CONFIG.USER_LIMITS[userRole.toUpperCase()];
    if (!config) {
      return { allowed: true };
    }

    const requestCount = RequestRateTracker.getRequestCount(identifier, config.window);

    if (requestCount > config.requests) {
      return {
        allowed: false,
        reason: 'user_limit_exceeded',
        severity: 'medium',
        retryAfter: Math.ceil(config.window / 1000),
        details: { userRole, requestCount, limit: config.requests }
      };
    }

    return { allowed: true };
  }

  /**
   * Check security thresholds
   */
  static async checkSecurityThresholds(identifier) {
    const minuteCount = RequestRateTracker.getRequestCount(identifier, 60000);

    if (minuteCount > RATE_LIMIT_CONFIG.SECURITY.BAN_THRESHOLD) {
      this.banIdentifier(identifier, 'excessive_requests', RATE_LIMIT_CONFIG.SECURITY.BAN_DURATION);

      return {
        allowed: false,
        reason: 'security_ban',
        severity: 'critical',
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.SECURITY.BAN_DURATION / 1000),
        details: { minuteCount, threshold: RATE_LIMIT_CONFIG.SECURITY.BAN_THRESHOLD }
      };
    }

    if (minuteCount > RATE_LIMIT_CONFIG.SECURITY.SUSPICIOUS_THRESHOLD) {
      SecurityMonitorService.logSecurityEvent('suspicious_rate_limit_activity', {
        identifier: identifier.substring(0, 8) + '...',
        requestCount: minuteCount,
        threshold: RATE_LIMIT_CONFIG.SECURITY.SUSPICIOUS_THRESHOLD
      });

      return {
        allowed: true,
        warning: 'suspicious_activity_detected',
        details: { minuteCount, threshold: RATE_LIMIT_CONFIG.SECURITY.SUSPICIOUS_THRESHOLD }
      };
    }

    return { allowed: true };
  }

  /**
   * Handle rate limit violation
   */
  static handleViolation(identifier, reason, severity = 'medium') {
    const now = Date.now();

    if (!this.violations.has(identifier)) {
      this.violations.set(identifier, []);
    }

    const violations = this.violations.get(identifier);
    violations.push({ timestamp: now, reason, severity });

    // Keep only recent violations (last hour)
    const recentViolations = violations.filter(v => now - v.timestamp < 3600000);
    this.violations.set(identifier, recentViolations);

    logger.warn('⚠️ Rate limit violation:', {
      identifier: identifier.substring(0, 8) + '...',
      reason,
      severity,
      totalViolations: recentViolations.length
    });

    SecurityMonitorService.logSecurityEvent('rate_limit_violation', {
      identifier: identifier.substring(0, 8) + '...',
      reason,
      severity,
      violationCount: recentViolations.length
    });

    // Update progressive delay
    this.updateProgressiveDelay(identifier, severity);
  }

  /**
   * Ban an identifier
   */
  static banIdentifier(identifier, reason, duration = RATE_LIMIT_CONFIG.SECURITY.BAN_DURATION) {
    const expiresAt = Date.now() + duration;

    this.bannedIdentifiers.set(identifier, {
      reason,
      bannedAt: Date.now(),
      expiresAt,
      duration
    });

    logger.warn('🚫 Identifier banned:', {
      identifier: identifier.substring(0, 8) + '...',
      reason,
      duration: duration / 1000 + 's',
      expiresAt: new Date(expiresAt).toISOString()
    });

    SecurityMonitorService.logSecurityEvent('identifier_banned', {
      identifier: identifier.substring(0, 8) + '...',
      reason,
      duration,
      expiresAt: new Date(expiresAt).toISOString()
    });

    // Store in persistent storage for cross-session bans
    try {
      const bannedList = storage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS) || {};
      bannedList[identifier] = { reason, bannedAt: Date.now(), expiresAt, duration };
      storage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS, bannedList);
    } catch (error) {
      logger.error('❌ Failed to persist ban information:', error);
    }
  }

  /**
   * Check if identifier is banned
   */
  static isBanned(identifier) {
    const now = Date.now();

    // Check in-memory bans
    if (this.bannedIdentifiers.has(identifier)) {
      const banInfo = this.bannedIdentifiers.get(identifier);
      if (now < banInfo.expiresAt) {
        return true;
      } else {
        this.bannedIdentifiers.delete(identifier);
      }
    }

    // Check persistent bans
    try {
      const bannedList = storage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS) || {};
      if (bannedList[identifier]) {
        const banInfo = bannedList[identifier];
        if (now < banInfo.expiresAt) {
          // Load back to memory
          this.bannedIdentifiers.set(identifier, banInfo);
          return true;
        } else {
          // Remove expired ban
          delete bannedList[identifier];
          storage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS, bannedList);
        }
      }
    } catch (error) {
      logger.error('❌ Failed to check persistent ban:', error);
    }

    return false;
  }

  /**
   * Update progressive delay for repeated violations
   */
  static updateProgressiveDelay(identifier, severity) {
    if (!RATE_LIMIT_CONFIG.SECURITY.PROGRESSIVE_DELAY) return;

    const currentDelay = this.progressiveDelays.get(identifier) || 0;
    const severityMultiplier = severity === 'critical' ? 4 : severity === 'high' ? 2 : 1;
    const newDelay = Math.min(
      (currentDelay + 1000) * severityMultiplier,
      RATE_LIMIT_CONFIG.SECURITY.MAX_DELAY
    );

    this.progressiveDelays.set(identifier, newDelay);

    // Decay delay over time
    setTimeout(() => {
      const currentDelayAtTimeout = this.progressiveDelays.get(identifier) || 0;
      const decayedDelay = Math.max(0, currentDelayAtTimeout - 500);

      if (decayedDelay === 0) {
        this.progressiveDelays.delete(identifier);
      } else {
        this.progressiveDelays.set(identifier, decayedDelay);
      }
    }, 60000); // Decay after 1 minute
  }

  /**
   * Get progressive delay for identifier
   */
  static getProgressiveDelay(identifier) {
    return this.progressiveDelays.get(identifier) || 0;
  }

  /**
   * Get rate limiting statistics
   */
  static getStatistics() {
    const now = Date.now();
    const trackerStats = RequestRateTracker.getStatistics();

    return {
      ...trackerStats,
      activeBans: this.bannedIdentifiers.size,
      activeViolations: this.violations.size,
      progressiveDelays: this.progressiveDelays.size,
      recentViolations: Array.from(this.violations.values())
        .flat()
        .filter(v => now - v.timestamp < 300000) // Last 5 minutes
        .length,
      configuration: {
        globalLimits: RATE_LIMIT_CONFIG.GLOBAL,
        endpointCount: Object.keys(RATE_LIMIT_CONFIG.ENDPOINTS).length,
        userRoles: Object.keys(RATE_LIMIT_CONFIG.USER_LIMITS).length
      }
    };
  }

  /**
   * Reset rate limits for identifier (admin function)
   */
  static resetLimits(identifier, reason = 'admin_reset') {
    RequestRateTracker.requestCounts.delete(identifier);
    this.bannedIdentifiers.delete(identifier);
    this.violations.delete(identifier);
    this.progressiveDelays.delete(identifier);

    // Remove from persistent storage
    try {
      const bannedList = storage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS) || {};
      delete bannedList[identifier];
      storage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEYS.BANNED_IPS, bannedList);
    } catch (error) {
      logger.error('❌ Failed to remove from persistent ban list:', error);
    }

    logger.info('🔄 Rate limits reset for identifier:', {
      identifier: identifier.substring(0, 8) + '...',
      reason
    });

    SecurityMonitorService.logSecurityEvent('rate_limits_reset', {
      identifier: identifier.substring(0, 8) + '...',
      reason
    });
  }
}

/**
 * Rate Limiting Middleware for API Calls
 */
export class RateLimitingMiddleware {
  /**
   * Create rate limiting middleware
   */
  static create(options = {}) {
    const config = {
      getUserIdentifier: options.getUserIdentifier || (() => 'anonymous'),
      getUserRole: options.getUserRole || (() => 'anonymous'),
      onRateLimited: options.onRateLimited || null,
      enableLogging: options.enableLogging !== false
    };

    return async (request, next) => {
      const identifier = config.getUserIdentifier(request);
      const userRole = config.getUserRole(request);
      const endpoint = this.extractEndpoint(request.url);

      const rateLimitResult = await AdaptiveRateLimiter.checkRateLimit(
        identifier,
        endpoint,
        userRole
      );

      if (!rateLimitResult.allowed) {
        if (config.enableLogging) {
          logger.warn('🚫 Request rate limited:', {
            identifier: identifier.substring(0, 8) + '...',
            endpoint,
            reason: rateLimitResult.reason,
            retryAfter: rateLimitResult.retryAfter
          });
        }

        if (config.onRateLimited) {
          return config.onRateLimited(rateLimitResult, request);
        }

        return {
          error: true,
          status: 429,
          message: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          details: rateLimitResult
        };
      }

      // Apply progressive delay if needed
      if (rateLimitResult.delay) {
        await new Promise(resolve => setTimeout(resolve, rateLimitResult.delay));
      }

      return next(request);
    };
  }

  /**
   * Extract endpoint pattern from URL
   */
  static extractEndpoint(url) {
    try {
      const path = new URL(url).pathname;

      // Match against configured endpoints
      for (const endpoint of Object.keys(RATE_LIMIT_CONFIG.ENDPOINTS)) {
        if (path.startsWith(endpoint)) {
          return endpoint;
        }
      }

      return path;
    } catch (error) {
      return url;
    }
  }
}

/**
 * Rate Limit Monitor Component for Admin Dashboard
 */
export const RateLimitMonitor = ({
  showStatistics = true,
  showTopUsers = true,
  autoRefresh = true,
  refreshInterval = 30000,
  onBanUser,
  onResetLimits
}) => {
  const [statistics, setStatistics] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const updateStatistics = useCallback(() => {
    const stats = AdaptiveRateLimiter.getStatistics();
    setStatistics(stats);
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    updateStatistics();

    if (autoRefresh) {
      const interval = setInterval(updateStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [updateStatistics, autoRefresh, refreshInterval]);

  if (!showStatistics || !statistics) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🛡️ Rate Limiting Monitor
        </h3>
        <span className="text-sm text-gray-500">
          Son güncelleme: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{statistics.totalTrackers}</div>
          <div className="text-sm text-gray-600">Aktif Tracker</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">{statistics.activeRequests}</div>
          <div className="text-sm text-gray-600">Son Dakika İstek</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded">
          <div className="text-2xl font-bold text-red-600">{statistics.activeBans}</div>
          <div className="text-sm text-gray-600">Aktif Ban</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded">
          <div className="text-2xl font-bold text-yellow-600">{statistics.recentViolations}</div>
          <div className="text-sm text-gray-600">Son 5dk İhlal</div>
        </div>
      </div>

      {showTopUsers && statistics.topIdentifiers.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">En Aktif Kullanıcılar</h4>
          <div className="space-y-2">
            {statistics.topIdentifiers.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-mono">
                  {item.identifier.substring(0, 12)}...
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.requests} istek</span>
                  {onBanUser && (
                    <button
                      onClick={() => onBanUser(item.identifier)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Ban
                    </button>
                  )}
                  {onResetLimits && (
                    <button
                      onClick={() => onResetLimits(item.identifier)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={updateStatistics}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm transition-colors"
      >
        🔄 İstatistikleri Güncelle
      </button>
    </div>
  );
};

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    RequestRateTracker.cleanup();
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}

export {
  AdaptiveRateLimiter, RATE_LIMIT_CONFIG, RequestRateTracker
};

export default AdaptiveRateLimiter;
