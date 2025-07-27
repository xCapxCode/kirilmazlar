/**
 * Enhanced Auth Token Expiration Handler
 * P2.4.4: Security Enhancement - Advanced auth token expiration handling
 * 
 * @description Comprehensive JWT token management with automatic refresh and security monitoring
 * @author KırılmazlarPanel Development Team  
 * @date July 25, 2025 - Enhanced Token Management
 */

import storage from '@core/storage';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { SecurityMonitorService } from '../../services/securityService';
import logger from '../../utils/productionLogger';

/**
 * Enhanced Token Configuration
 */
const ENHANCED_TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  CRITICAL_THRESHOLD: 60 * 1000, // Critical warning 1 minute before expiry
  MAX_REFRESH_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds between retry attempts
  STORAGE_PREFIX: 'auth_enhanced_',
  TOKEN_BLACKLIST_KEY: 'token_blacklist',
  SESSION_FINGERPRINT_KEY: 'session_fingerprint'
};

/**
 * Enhanced JWT Token Utilities with Security Features
 */
class EnhancedJWTTokenUtils {
  /**
   * Decode JWT token with validation
   */
  static decodeToken(token, validateStructure = true) {
    if (!token || typeof token !== 'string') {
      logger.warn('⚠️ Invalid token format provided');
      return null;
    }

    try {
      const parts = token.split('.');

      if (validateStructure && parts.length !== 3) {
        logger.warn('⚠️ Invalid JWT structure - expected 3 parts');
        SecurityMonitorService.logSecurityEvent('jwt_invalid_structure', {
          partsCount: parts.length
        });
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));

      // Additional payload validation
      if (validateStructure) {
        if (!payload.exp || !payload.iat) {
          logger.warn('⚠️ JWT missing required claims (exp, iat)');
          SecurityMonitorService.logSecurityEvent('jwt_missing_claims', {
            hasExp: !!payload.exp,
            hasIat: !!payload.iat
          });
          return null;
        }

        // Check if token is from future (clock skew protection)
        if (payload.iat * 1000 > Date.now() + 60000) { // 1 minute tolerance
          logger.warn('⚠️ JWT issued in future - possible clock skew attack');
          SecurityMonitorService.logSecurityEvent('jwt_future_issued', {
            issuedAt: new Date(payload.iat * 1000).toISOString()
          });
          return null;
        }
      }

      return payload;
    } catch (error) {
      logger.error('❌ Failed to decode JWT token:', error);
      SecurityMonitorService.logSecurityEvent('jwt_decode_error', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Enhanced token expiration check with security monitoring
   */
  static isTokenExpired(token, clockSkewTolerance = 30000) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const isExpired = currentTime >= (expiryTime - clockSkewTolerance);

    if (isExpired) {
      SecurityMonitorService.logSecurityEvent('token_expired', {
        expiry: new Date(expiryTime).toISOString(),
        currentTime: new Date(currentTime).toISOString()
      });
    }

    logger.debug('⏰ Enhanced Token Expiry Check:', {
      expiry: new Date(expiryTime).toISOString(),
      current: new Date(currentTime).toISOString(),
      isExpired,
      timeLeft: isExpired ? 0 : Math.floor((expiryTime - currentTime) / 1000) + 's',
      clockSkewTolerance: clockSkewTolerance + 'ms'
    });

    return isExpired;
  }

  /**
   * Enhanced refresh check with multiple thresholds
   */
  static getTokenStatus(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return { status: 'invalid', timeLeft: 0, needsRefresh: true, isCritical: true };
    }

    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeLeft = expiryTime - currentTime;

    const status = {
      status: 'valid',
      timeLeft,
      needsRefresh: timeLeft <= ENHANCED_TOKEN_CONFIG.REFRESH_THRESHOLD,
      isCritical: timeLeft <= ENHANCED_TOKEN_CONFIG.CRITICAL_THRESHOLD,
      isExpired: timeLeft <= 0,
      expiryTime,
      payload
    };

    if (status.isExpired) {
      status.status = 'expired';
    } else if (status.isCritical) {
      status.status = 'critical';
    } else if (status.needsRefresh) {
      status.status = 'refresh_needed';
    }

    return status;
  }

  /**
   * Check if token is blacklisted
   */
  static isTokenBlacklisted(token) {
    try {
      const blacklist = storage.getItem(ENHANCED_TOKEN_CONFIG.TOKEN_BLACKLIST_KEY) || [];
      return blacklist.includes(this.getTokenId(token));
    } catch (error) {
      logger.error('❌ Failed to check token blacklist:', error);
      return false;
    }
  }

  /**
   * Get token unique identifier (jti or create hash)
   */
  static getTokenId(token) {
    const payload = this.decodeToken(token, false);
    if (payload?.jti) {
      return payload.jti;
    }

    // Create hash from token for identification
    return btoa(token.substring(0, 50)).replace(/[+/=]/g, '').substring(0, 16);
  }

  /**
   * Blacklist a token
   */
  static blacklistToken(token, reason = 'manual') {
    try {
      const tokenId = this.getTokenId(token);
      const blacklist = storage.getItem(ENHANCED_TOKEN_CONFIG.TOKEN_BLACKLIST_KEY) || [];

      if (!blacklist.includes(tokenId)) {
        blacklist.push(tokenId);
        storage.setItem(ENHANCED_TOKEN_CONFIG.TOKEN_BLACKLIST_KEY, blacklist);

        logger.info('🚫 Token blacklisted:', { tokenId, reason });
        SecurityMonitorService.logSecurityEvent('token_blacklisted', {
          tokenId,
          reason,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('❌ Failed to blacklist token:', error);
    }
  }
}

/**
 * Enhanced Token Storage Manager with Security Features
 */
class EnhancedTokenStorageManager {
  /**
   * Store token with enhanced metadata and security
   */
  static storeToken(accessToken, refreshToken = null, additionalMetadata = {}) {
    try {
      // Validate tokens before storing
      if (!this.validateTokenBeforeStorage(accessToken)) {
        throw new Error('Access token validation failed');
      }

      if (refreshToken && !this.validateTokenBeforeStorage(refreshToken)) {
        throw new Error('Refresh token validation failed');
      }

      const expiry = EnhancedJWTTokenUtils.getTokenStatus(accessToken).expiryTime;
      const fingerprint = this.generateSessionFingerprint();

      const tokenData = {
        accessToken,
        refreshToken,
        expiry,
        stored: Date.now(),
        refreshAttempts: 0,
        fingerprint,
        lastActivity: Date.now(),
        securityChecks: {
          blacklistChecked: Date.now(),
          fingerprintVerified: Date.now()
        },
        ...additionalMetadata
      };

      // Store tokens securely
      storage.setItem(ENHANCED_TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        storage.setItem(ENHANCED_TOKEN_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      }
      storage.setItem(ENHANCED_TOKEN_CONFIG.TOKEN_EXPIRY_KEY, expiry);
      storage.setItem(`${ENHANCED_TOKEN_CONFIG.STORAGE_PREFIX}metadata`, tokenData);
      storage.setItem(ENHANCED_TOKEN_CONFIG.SESSION_FINGERPRINT_KEY, fingerprint);

      logger.info('💾 Enhanced Auth Token Stored:', {
        hasRefreshToken: !!refreshToken,
        expiry: expiry ? new Date(expiry).toISOString() : null,
        fingerprintLength: fingerprint?.length || 0
      });

      SecurityMonitorService.logSecurityEvent('token_stored', {
        hasRefreshToken: !!refreshToken,
        expiry: expiry ? new Date(expiry).toISOString() : null
      });

    } catch (error) {
      logger.error('❌ Failed to store enhanced auth token:', error);
      SecurityMonitorService.logSecurityEvent('token_storage_failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate token before storage
   */
  static validateTokenBeforeStorage(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Check if token is blacklisted
    if (EnhancedJWTTokenUtils.isTokenBlacklisted(token)) {
      logger.warn('⚠️ Attempting to store blacklisted token');
      return false;
    }

    // Validate token structure
    const payload = EnhancedJWTTokenUtils.decodeToken(token, true);
    if (!payload) {
      return false;
    }

    return true;
  }

  /**
   * Get stored token with security validation
   */
  static getAccessToken(performSecurityChecks = true) {
    try {
      const token = storage.getItem(ENHANCED_TOKEN_CONFIG.ACCESS_TOKEN_KEY);

      if (!token) {
        return null;
      }

      if (performSecurityChecks) {
        // Check if token is blacklisted
        if (EnhancedJWTTokenUtils.isTokenBlacklisted(token)) {
          logger.warn('⚠️ Blacklisted token detected in storage');
          this.clearTokens('blacklisted_token_detected');
          return null;
        }

        // Verify session fingerprint
        if (!this.verifySessionFingerprint()) {
          logger.warn('⚠️ Session fingerprint mismatch - possible session hijacking');
          this.clearTokens('fingerprint_mismatch');
          return null;
        }

        // Check if token is expired
        if (EnhancedJWTTokenUtils.isTokenExpired(token)) {
          logger.warn('⚠️ Stored access token is expired');
          this.clearTokens('token_expired');
          return null;
        }
      }

      return token;
    } catch (error) {
      logger.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Generate session fingerprint for additional security
   */
  static generateSessionFingerprint() {
    if (typeof window === 'undefined') return null;

    try {
      const fingerprint = [
        navigator.userAgent || '',
        window.screen?.width || 0,
        window.screen?.height || 0,
        new Date().getTimezoneOffset(),
        navigator.language || '',
        navigator.platform || ''
      ].join('|');

      // Simple hash
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return Math.abs(hash).toString(36);
    } catch (error) {
      logger.error('❌ Failed to generate session fingerprint:', error);
      return null;
    }
  }

  /**
   * Verify session fingerprint
   */
  static verifySessionFingerprint() {
    try {
      const storedFingerprint = storage.getItem(ENHANCED_TOKEN_CONFIG.SESSION_FINGERPRINT_KEY);
      if (!storedFingerprint) {
        return true; // No fingerprint stored, skip check
      }

      const currentFingerprint = this.generateSessionFingerprint();
      const isValid = storedFingerprint === currentFingerprint;

      if (!isValid) {
        SecurityMonitorService.logSecurityEvent('session_fingerprint_mismatch', {
          stored: storedFingerprint?.substring(0, 8) + '...',
          current: currentFingerprint?.substring(0, 8) + '...'
        });
      }

      return isValid;
    } catch (error) {
      logger.error('❌ Failed to verify session fingerprint:', error);
      return true; // Don't block on verification error
    }
  }

  /**
   * Enhanced token cleanup with reason logging
   */
  static clearTokens(reason = 'manual') {
    try {
      const tokenData = this.getTokenMetadata();

      // Blacklist current tokens before clearing
      const accessToken = storage.getItem(ENHANCED_TOKEN_CONFIG.ACCESS_TOKEN_KEY);
      if (accessToken) {
        EnhancedJWTTokenUtils.blacklistToken(accessToken, reason);
      }

      // Clear all token storage
      storage.removeItem(ENHANCED_TOKEN_CONFIG.ACCESS_TOKEN_KEY);
      storage.removeItem(ENHANCED_TOKEN_CONFIG.REFRESH_TOKEN_KEY);
      storage.removeItem(ENHANCED_TOKEN_CONFIG.TOKEN_EXPIRY_KEY);
      storage.removeItem(`${ENHANCED_TOKEN_CONFIG.STORAGE_PREFIX}metadata`);
      storage.removeItem(ENHANCED_TOKEN_CONFIG.SESSION_FINGERPRINT_KEY);

      logger.info('🧹 Enhanced Auth Tokens Cleared:', { reason });
      SecurityMonitorService.logSecurityEvent('tokens_cleared', {
        reason,
        hadRefreshToken: !!tokenData?.refreshToken,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('❌ Failed to clear enhanced auth tokens:', error);
    }
  }

  /**
   * Get token metadata
   */
  static getTokenMetadata() {
    try {
      return storage.getItem(`${ENHANCED_TOKEN_CONFIG.STORAGE_PREFIX}metadata`) || {};
    } catch (error) {
      logger.error('❌ Failed to get enhanced token metadata:', error);
      return {};
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity() {
    try {
      const metadata = this.getTokenMetadata();
      metadata.lastActivity = Date.now();
      storage.setItem(`${ENHANCED_TOKEN_CONFIG.STORAGE_PREFIX}metadata`, metadata);
    } catch (error) {
      logger.error('❌ Failed to update last activity:', error);
    }
  }
}

/**
 * Enhanced Auth Token Expiration Service
 */
class EnhancedAuthTokenExpirationService {
  static refreshPromise = null;
  static refreshCallbacks = [];
  static expirationCallbacks = [];
  static isInitialized = false;
  static monitoringInterval = null;
  static warningShown = false;

  /**
   * Initialize enhanced service
   */
  static initialize() {
    if (this.isInitialized) return;

    this.startEnhancedMonitoring();
    this.setupEventListeners();
    this.isInitialized = true;

    logger.info('🛡️ Enhanced Auth Token Expiration Service Initialized');
  }

  /**
   * Start enhanced token monitoring
   */
  static startEnhancedMonitoring() {
    // Check every 30 seconds for more responsive handling
    this.monitoringInterval = setInterval(() => {
      this.performEnhancedTokenCheck();
    }, 30 * 1000);

    // Initial check
    this.performEnhancedTokenCheck();
  }

  /**
   * Perform comprehensive token check
   */
  static performEnhancedTokenCheck() {
    const accessToken = EnhancedTokenStorageManager.getAccessToken(true);

    if (!accessToken) {
      this.warningShown = false;
      return;
    }

    const tokenStatus = EnhancedJWTTokenUtils.getTokenStatus(accessToken);

    // Handle different token states
    if (tokenStatus.isExpired) {
      logger.warn('🚨 Token expired - handling expiration');
      this.handleTokenExpiration('expired');
    } else if (tokenStatus.isCritical && !this.warningShown) {
      logger.warn('⚠️ Token in critical expiration zone');
      this.showCriticalExpirationWarning(Math.floor(tokenStatus.timeLeft / 1000));
      this.warningShown = true;
    } else if (tokenStatus.needsRefresh) {
      logger.info('🔄 Token needs refresh - attempting automatic refresh');
      this.attemptTokenRefresh();
    }

    // Update last activity
    EnhancedTokenStorageManager.updateLastActivity();
  }

  /**
   * Show critical expiration warning
   */
  static showCriticalExpirationWarning(secondsLeft) {
    const event = new CustomEvent('tokenCriticalExpiration', {
      detail: {
        secondsLeft,
        timestamp: Date.now(),
        action: 'warning'
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }

    SecurityMonitorService.logSecurityEvent('token_critical_expiration', {
      secondsLeft,
      timestamp: Date.now()
    });
  }

  /**
   * Attempt token refresh with enhanced error handling
   */
  static async attemptTokenRefresh() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    try {
      this.refreshPromise = this.performEnhancedTokenRefresh();
      const result = await this.refreshPromise;
      this.refreshPromise = null;
      this.warningShown = false; // Reset warning flag on successful refresh
      return result;
    } catch (error) {
      this.refreshPromise = null;
      logger.error('❌ Enhanced token refresh failed:', error);

      // Handle refresh failure
      const metadata = EnhancedTokenStorageManager.getTokenMetadata();
      if (metadata.refreshAttempts >= ENHANCED_TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
        this.handleTokenExpiration('max_refresh_attempts_exceeded');
      }

      throw error;
    }
  }

  /**
   * Perform enhanced token refresh
   */
  static async performEnhancedTokenRefresh() {
    const refreshToken = storage.getItem(ENHANCED_TOKEN_CONFIG.REFRESH_TOKEN_KEY);
    const metadata = EnhancedTokenStorageManager.getTokenMetadata();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (metadata.refreshAttempts >= ENHANCED_TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
      throw new Error('Maximum refresh attempts exceeded');
    }

    // Update refresh attempts
    metadata.refreshAttempts = (metadata.refreshAttempts || 0) + 1;
    storage.setItem(`${ENHANCED_TOKEN_CONFIG.STORAGE_PREFIX}metadata`, metadata);

    const attempt = metadata.refreshAttempts;
    logger.info('🔄 Attempting enhanced token refresh:', { attempt });

    try {
      // Simulate API call - replace with actual endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        body: JSON.stringify({
          refreshToken,
          fingerprint: EnhancedTokenStorageManager.generateSessionFingerprint()
        })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.accessToken) {
        throw new Error('No access token in refresh response');
      }

      // Store new tokens with reset attempts
      EnhancedTokenStorageManager.storeToken(
        data.accessToken,
        data.refreshToken || refreshToken,
        { refreshAttempts: 0 }
      );

      // Notify callbacks
      this.notifyRefreshCallbacks(data.accessToken);

      logger.info('✅ Enhanced token refresh successful');
      SecurityMonitorService.logSecurityEvent('token_refresh_success', {
        attempt,
        timestamp: Date.now()
      });

      return data.accessToken;

    } catch (error) {
      logger.error('❌ Enhanced token refresh attempt failed:', error);
      SecurityMonitorService.logSecurityEvent('token_refresh_failed', {
        attempt,
        error: error.message,
        timestamp: Date.now()
      });

      // Add delay before next attempt
      if (attempt < ENHANCED_TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
        await new Promise(resolve =>
          setTimeout(resolve, ENHANCED_TOKEN_CONFIG.RETRY_DELAY * attempt)
        );
      }

      throw error;
    }
  }

  /**
   * Handle token expiration with enhanced cleanup
   */
  static handleTokenExpiration(reason = 'expired') {
    logger.warn('⚠️ Handling enhanced token expiration:', { reason });

    // Clear all tokens and blacklist them
    EnhancedTokenStorageManager.clearTokens(reason);

    // Stop monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Notify expiration callbacks
    this.notifyExpirationCallbacks(reason);

    // Dispatch expiration event
    const event = new CustomEvent('enhancedTokenExpiration', {
      detail: {
        reason,
        timestamp: Date.now(),
        action: 'logout'
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);

      // Redirect to login after cleanup
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?expired=true&reason=${reason}`;
        }
      }, 1000);
    }

    SecurityMonitorService.logSecurityEvent('token_expiration_handled', {
      reason,
      timestamp: Date.now()
    });
  }

  /**
   * Setup event listeners for security monitoring
   */
  static setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Listen for visibility change to check tokens when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.performEnhancedTokenCheck();
      }
    });

    // Listen for focus events
    window.addEventListener('focus', () => {
      this.performEnhancedTokenCheck();
    });
  }

  /**
   * Add refresh callback
   */
  static onTokenRefresh(callback) {
    this.refreshCallbacks.push(callback);
    return () => {
      const index = this.refreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.refreshCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add expiration callback
   */
  static onTokenExpiration(callback) {
    this.expirationCallbacks.push(callback);
    return () => {
      const index = this.expirationCallbacks.indexOf(callback);
      if (index > -1) {
        this.expirationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify refresh callbacks
   */
  static notifyRefreshCallbacks(newToken) {
    this.refreshCallbacks.forEach(callback => {
      try {
        callback(newToken);
      } catch (error) {
        logger.error('❌ Error in refresh callback:', error);
      }
    });
  }

  /**
   * Notify expiration callbacks
   */
  static notifyExpirationCallbacks(reason) {
    this.expirationCallbacks.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        logger.error('❌ Error in expiration callback:', error);
      }
    });
  }

  /**
   * Get enhanced token status
   */
  static getTokenStatus() {
    const accessToken = EnhancedTokenStorageManager.getAccessToken(true);
    const refreshToken = storage.getItem(ENHANCED_TOKEN_CONFIG.REFRESH_TOKEN_KEY);
    const metadata = EnhancedTokenStorageManager.getTokenMetadata();

    if (!accessToken) {
      return {
        status: 'none',
        hasRefreshToken: !!refreshToken,
        isSecure: false
      };
    }

    const tokenStatus = EnhancedJWTTokenUtils.getTokenStatus(accessToken);
    const isSecure = EnhancedTokenStorageManager.verifySessionFingerprint() &&
      !EnhancedJWTTokenUtils.isTokenBlacklisted(accessToken);

    return {
      ...tokenStatus,
      hasRefreshToken: !!refreshToken,
      refreshAttempts: metadata.refreshAttempts || 0,
      lastActivity: metadata.lastActivity,
      isSecure,
      fingerprint: !!metadata.fingerprint
    };
  }

  /**
   * Force token refresh
   */
  static async forceRefresh() {
    logger.info('🔄 Forcing enhanced token refresh');
    return this.attemptTokenRefresh();
  }

  /**
   * Emergency token cleanup
   */
  static emergencyCleanup(reason = 'emergency') {
    logger.warn('🚨 Emergency token cleanup triggered:', { reason });

    this.handleTokenExpiration(reason);

    // Additional cleanup
    if (this.refreshPromise) {
      this.refreshPromise = null;
    }

    this.warningShown = false;
  }
}

/**
 * React Hook for Enhanced Token Management
 */
export const useEnhancedTokenManagement = () => {
  const [tokenStatus, setTokenStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const authContext = useContext(AuthContext);
  const intervalRef = useRef(null);

  const updateTokenStatus = useCallback(() => {
    const status = EnhancedAuthTokenExpirationService.getTokenStatus();
    setTokenStatus(status);
  }, []);

  useEffect(() => {
    // Initialize service
    EnhancedAuthTokenExpirationService.initialize();

    // Initial status check
    updateTokenStatus();

    // Set up periodic status updates
    intervalRef.current = setInterval(updateTokenStatus, 30000);

    // Set up event listeners
    const handleTokenRefresh = (newToken) => {
      setIsRefreshing(false);
      setLastRefresh(Date.now());
      updateTokenStatus();
    };

    const handleTokenExpiration = (reason) => {
      setTokenStatus({ status: 'expired', reason });
      if (authContext?.signOut) {
        authContext.signOut();
      }
    };

    const handleCriticalExpiration = (event) => {
      updateTokenStatus();
    };

    const cleanupRefresh = EnhancedAuthTokenExpirationService.onTokenRefresh(handleTokenRefresh);
    const cleanupExpiration = EnhancedAuthTokenExpirationService.onTokenExpiration(handleTokenExpiration);

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenCriticalExpiration', handleCriticalExpiration);
      window.addEventListener('enhancedTokenExpiration', handleTokenExpiration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cleanupRefresh();
      cleanupExpiration();

      if (typeof window !== 'undefined') {
        window.removeEventListener('tokenCriticalExpiration', handleCriticalExpiration);
        window.removeEventListener('enhancedTokenExpiration', handleTokenExpiration);
      }
    };
  }, [authContext, updateTokenStatus]);

  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await EnhancedAuthTokenExpirationService.forceRefresh();
    } catch (error) {
      logger.error('❌ Force refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const emergencyLogout = useCallback((reason = 'manual') => {
    EnhancedAuthTokenExpirationService.emergencyCleanup(reason);
  }, []);

  return {
    tokenStatus,
    isRefreshing,
    lastRefresh,
    forceRefresh,
    emergencyLogout,
    updateStatus: updateTokenStatus
  };
};

// Initialize service when module loads
if (typeof window !== 'undefined') {
  EnhancedAuthTokenExpirationService.initialize();
}

export {
  ENHANCED_TOKEN_CONFIG, EnhancedAuthTokenExpirationService,
  EnhancedJWTTokenUtils,
  EnhancedTokenStorageManager
};

export default EnhancedAuthTokenExpirationService;
