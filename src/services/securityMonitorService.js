/* eslint-disable no-console */
import logger from '@utils/logger';
/**
 * Security Monitor Service
 * P1.3.3 - Session invalidation on security issues
 * 
 * This service monitors security threats and automatically invalidates sessions
 * when suspicious activities or security issues are detected.
 */

class SecurityMonitorService {
  constructor() {
    this.threatLevel = 'LOW';
    this.threats = new Map();
    this.securityEvents = [];
    this.monitoringActive = false;
    this.thresholds = {
      FAILED_LOGIN_ATTEMPTS: 5,
      SUSPICIOUS_IP_CHANGES: 3,
      RAPID_REQUESTS: 50, // requests per minute
      INVALID_TOKEN_ATTEMPTS: 10,
      PROFILE_TAMPERING_ATTEMPTS: 3
    };
    this.securityCallbacks = new Set();
  }

  /**
   * Start security monitoring
   */
  startMonitoring() {
    this.monitoringActive = true;
    this.initializeSecurityListeners();
    logger.info('🔒 P1.3.3: Security monitoring started');
  }

  /**
   * Stop security monitoring
   */
  stopMonitoring() {
    this.monitoringActive = false;
    logger.info('🔒 P1.3.3: Security monitoring stopped');
  }

  /**
   * Register callback for security events
   * @param {Function} callback - Function to call when security threat detected
   */
  onSecurityThreat(callback) {
    this.securityCallbacks.add(callback);
  }

  /**
   * Remove security threat callback
   * @param {Function} callback - Callback to remove
   */
  offSecurityThreat(callback) {
    this.securityCallbacks.delete(callback);
  }

  /**
   * Initialize security event listeners
   */
  initializeSecurityListeners() {
    // Listen for storage manipulation attempts
    window.addEventListener('storage', (event) => {
      this.handleStorageEvent(event);
    });

    // Listen for page visibility changes (potential session hijacking)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Listen for beforeunload events (potential session termination attacks)
    window.addEventListener('beforeunload', () => {
      this.handlePageUnload();
    });
  }

  /**
   * Record a security event
   * @param {string} type - Type of security event
   * @param {string} description - Description of the event
   * @param {Object} metadata - Additional metadata
   * @param {string} severity - Severity level: LOW, MEDIUM, HIGH, CRITICAL
   */
  recordSecurityEvent(type, description, metadata = {}, severity = 'MEDIUM') {
    if (!this.monitoringActive) return;

    const event = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      metadata,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.securityEvents.push(event);
    logger.warn(`🚨 P1.3.3: Security event recorded:`, event);

    // Keep only last 100 events to prevent memory bloat
    if (this.securityEvents.length > 100) {
      this.securityEvents = this.securityEvents.slice(-100);
    }

    this.evaluateThreatLevel();
    this.triggerSecurityCallbacks(event);

    return event;
  }

  /**
   * Check for failed login attempts
   * @param {string} userId - User attempting login
   * @param {string} ipAddress - IP address of attempt
   */
  recordFailedLogin(userId, ipAddress = 'unknown') {
    const threatKey = `failed_login_${userId}_${ipAddress}`;
    const currentCount = this.threats.get(threatKey) || 0;
    const newCount = currentCount + 1;

    this.threats.set(threatKey, newCount);

    const event = this.recordSecurityEvent(
      'FAILED_LOGIN',
      `Failed login attempt for user ${userId}`,
      { userId, ipAddress, attemptCount: newCount },
      newCount >= this.thresholds.FAILED_LOGIN_ATTEMPTS ? 'HIGH' : 'MEDIUM'
    );

    if (newCount >= this.thresholds.FAILED_LOGIN_ATTEMPTS) {
      this.triggerSessionInvalidation('EXCESSIVE_FAILED_LOGINS', {
        userId,
        ipAddress,
        attemptCount: newCount
      });
    }

    return event;
  }

  /**
   * Check for suspicious IP address changes
   * @param {string} userId - User ID
   * @param {string} newIpAddress - New IP address
   * @param {string} previousIpAddress - Previous IP address
   */
  recordSuspiciousIpChange(userId, newIpAddress, previousIpAddress) {
    const threatKey = `ip_change_${userId}`;
    const currentCount = this.threats.get(threatKey) || 0;
    const newCount = currentCount + 1;

    this.threats.set(threatKey, newCount);

    const event = this.recordSecurityEvent(
      'SUSPICIOUS_IP_CHANGE',
      `Suspicious IP change detected for user ${userId}`,
      { userId, newIpAddress, previousIpAddress, changeCount: newCount },
      newCount >= this.thresholds.SUSPICIOUS_IP_CHANGES ? 'HIGH' : 'MEDIUM'
    );

    if (newCount >= this.thresholds.SUSPICIOUS_IP_CHANGES) {
      this.triggerSessionInvalidation('SUSPICIOUS_IP_CHANGES', {
        userId,
        newIpAddress,
        previousIpAddress,
        changeCount: newCount
      });
    }

    return event;
  }

  /**
   * Check for rapid request patterns (potential bot attacks)
   * @param {string} userId - User making requests
   * @param {number} requestCount - Number of requests in last minute
   */
  recordRapidRequests(userId, requestCount) {
    if (requestCount >= this.thresholds.RAPID_REQUESTS) {
      const event = this.recordSecurityEvent(
        'RAPID_REQUESTS',
        `Rapid request pattern detected for user ${userId}`,
        { userId, requestCount, threshold: this.thresholds.RAPID_REQUESTS },
        'HIGH'
      );

      this.triggerSessionInvalidation('RAPID_REQUESTS', {
        userId,
        requestCount
      });

      return event;
    }
  }

  /**
   * Check for invalid token attempts
   * @param {string} userId - User with invalid token
   * @param {string} tokenType - Type of token (session, auth, etc.)
   */
  recordInvalidTokenAttempt(userId, tokenType = 'session') {
    const threatKey = `invalid_token_${userId}_${tokenType}`;
    const currentCount = this.threats.get(threatKey) || 0;
    const newCount = currentCount + 1;

    this.threats.set(threatKey, newCount);

    const event = this.recordSecurityEvent(
      'INVALID_TOKEN_ATTEMPT',
      `Invalid token attempt detected for user ${userId}`,
      { userId, tokenType, attemptCount: newCount },
      newCount >= this.thresholds.INVALID_TOKEN_ATTEMPTS ? 'CRITICAL' : 'MEDIUM'
    );

    if (newCount >= this.thresholds.INVALID_TOKEN_ATTEMPTS) {
      this.triggerSessionInvalidation('INVALID_TOKEN_ATTEMPTS', {
        userId,
        tokenType,
        attemptCount: newCount
      });
    }

    return event;
  }

  /**
   * Check for profile tampering attempts
   * @param {string} userId - User whose profile is being tampered
   * @param {Object} tamperingDetails - Details of tampering attempt
   */
  recordProfileTampering(userId, tamperingDetails) {
    const threatKey = `profile_tampering_${userId}`;
    const currentCount = this.threats.get(threatKey) || 0;
    const newCount = currentCount + 1;

    this.threats.set(threatKey, newCount);

    const event = this.recordSecurityEvent(
      'PROFILE_TAMPERING',
      `Profile tampering attempt detected for user ${userId}`,
      { userId, tamperingDetails, attemptCount: newCount },
      newCount >= this.thresholds.PROFILE_TAMPERING_ATTEMPTS ? 'CRITICAL' : 'HIGH'
    );

    if (newCount >= this.thresholds.PROFILE_TAMPERING_ATTEMPTS) {
      this.triggerSessionInvalidation('PROFILE_TAMPERING', {
        userId,
        tamperingDetails,
        attemptCount: newCount
      });
    }

    return event;
  }

  /**
   * Handle storage events (potential tampering)
   * @param {StorageEvent} event - Storage event
   */
  handleStorageEvent(event) {
    if (!this.monitoringActive) return;

    // Check for suspicious localStorage modifications
    if (event.key && event.key.startsWith('ofisnet_')) {
      const suspiciousPatterns = [
        'ofisnet_session',
        'ofisnet_profile_',
        'ofisnet_concurrent_sessions'
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => event.key.includes(pattern));

      if (isSuspicious) {
        this.recordSecurityEvent(
          'STORAGE_TAMPERING',
          `Suspicious localStorage modification detected`,
          {
            key: event.key,
            oldValue: event.oldValue,
            newValue: event.newValue,
            origin: event.url
          },
          'HIGH'
        );
      }
    }
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (!this.monitoringActive) return;

    if (document.hidden) {
      this.recordSecurityEvent(
        'PAGE_HIDDEN',
        'Page became hidden - potential session hijacking risk',
        { timestamp: Date.now() },
        'LOW'
      );
    }
  }

  /**
   * Handle page unload events
   */
  handlePageUnload() {
    if (!this.monitoringActive) return;

    this.recordSecurityEvent(
      'PAGE_UNLOAD',
      'Page unload detected',
      { timestamp: Date.now() },
      'LOW'
    );
  }

  /**
   * Evaluate current threat level based on recent events
   */
  evaluateThreatLevel() {
    const recentEvents = this.securityEvents.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const criticalCount = recentEvents.filter(e => e.severity === 'CRITICAL').length;
    const highCount = recentEvents.filter(e => e.severity === 'HIGH').length;
    const mediumCount = recentEvents.filter(e => e.severity === 'MEDIUM').length;

    let newThreatLevel = 'LOW';

    if (criticalCount > 0) {
      newThreatLevel = 'CRITICAL';
    } else if (highCount >= 3) {
      newThreatLevel = 'HIGH';
    } else if (highCount >= 1 || mediumCount >= 5) {
      newThreatLevel = 'MEDIUM';
    }

    if (newThreatLevel !== this.threatLevel) {
      const previousLevel = this.threatLevel;
      this.threatLevel = newThreatLevel;
      logger.warn(`🚨 P1.3.3: Threat level changed from ${previousLevel} to ${newThreatLevel}`);
    }
  }

  /**
   * Trigger session invalidation due to security threat
   * @param {string} reason - Reason for invalidation
   * @param {Object} metadata - Additional metadata
   */
  triggerSessionInvalidation(reason, metadata = {}) {
    const invalidationEvent = {
      type: 'SESSION_INVALIDATION',
      reason,
      metadata,
      timestamp: new Date().toISOString(),
      threatLevel: this.threatLevel
    };

    logger.error(`🚨 P1.3.3: Session invalidation triggered:`, invalidationEvent);

    // Dispatch custom event for session invalidation
    const customEvent = new CustomEvent('securitySessionInvalidation', {
      detail: invalidationEvent
    });
    window.dispatchEvent(customEvent);

    this.recordSecurityEvent(
      'SESSION_INVALIDATED',
      `Session invalidated due to security threat: ${reason}`,
      metadata,
      'CRITICAL'
    );
  }

  /**
   * Trigger security callbacks
   * @param {Object} event - Security event
   */
  triggerSecurityCallbacks(event) {
    this.securityCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error('🚨 P1.3.3: Error in security callback:', error);
      }
    });
  }

  /**
   * Get current threat level
   * @returns {string} Current threat level
   */
  getThreatLevel() {
    return this.threatLevel;
  }

  /**
   * Get recent security events
   * @param {number} limit - Maximum number of events to return
   * @returns {Array} Recent security events
   */
  getRecentSecurityEvents(limit = 20) {
    return this.securityEvents.slice(-limit);
  }

  /**
   * Clear security events (admin function)
   */
  clearSecurityEvents() {
    this.securityEvents = [];
    this.threats.clear();
    this.threatLevel = 'LOW';
    logger.info('🔒 P1.3.3: Security events cleared');
  }

  /**
   * Get security statistics
   * @returns {Object} Security statistics
   */
  getSecurityStatistics() {
    const now = Date.now();
    const last24Hours = this.securityEvents.filter(
      event => now - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    const lastHour = this.securityEvents.filter(
      event => now - new Date(event.timestamp).getTime() < 60 * 60 * 1000
    );

    const eventsByType = {};
    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    return {
      totalEvents: this.securityEvents.length,
      last24Hours: last24Hours.length,
      lastHour: lastHour.length,
      currentThreatLevel: this.threatLevel,
      eventsByType,
      monitoringActive: this.monitoringActive
    };
  }
}

// Create and export singleton instance
const securityMonitorService = new SecurityMonitorService();

export default securityMonitorService;
