/**
 * Enhanced Auth Token Expiration Handler
 * P2.4.4: Security Enhancement - Advanced auth token expiration handling
 * 
 * @description JWT token management with automatic refresh, security monitoring and enhanced validation
 * @author KırılmazlarPanel Development Team
 * @date July 25, 2025 - Enhanced Token Management
 */

import storage from '@core/storage';
import logger from '../utils/productionLogger';
import { SecurityMonitorService } from './securityService';

/**
 * Enhanced Token Configuration
 */
const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  CRITICAL_THRESHOLD: 60 * 1000, // Critical warning 1 minute before expiry
  MAX_REFRESH_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds between retry attempts
  STORAGE_PREFIX: 'auth_enhanced_',
  BLACKLIST_CHECK_INTERVAL: 60 * 1000 // Check blacklist every minute
};

/**
 * JWT Token Utilities
 */
class JWTTokenUtils {
  /**
   * Decode JWT token payload
   */
  static decodeToken(token) {
    if (!token || typeof token !== 'string') {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        logger.warn('⚠️ Invalid JWT format');
        return null;
      }

      const payload = parts[1];
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

      logger.debug('🔓 JWT Token Decoded:', {
        exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : null,
        iat: decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toISOString() : null,
        sub: decodedPayload.sub
      });

      return decodedPayload;
    } catch (error) {
      logger.error('❌ Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Enhanced token expiration check with security monitoring
   */
  static isTokenExpired(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const isExpired = currentTime >= expiryTime;

    if (isExpired && SecurityMonitorService) {
      SecurityMonitorService.logSecurityEvent('token_expired', {
        expiry: new Date(expiryTime).toISOString(),
        currentTime: new Date(currentTime).toISOString()
      });
    }

    logger.debug('⏰ Enhanced Token Expiry Check:', {
      expiry: new Date(expiryTime).toISOString(),
      current: new Date(currentTime).toISOString(),
      isExpired,
      timeLeft: isExpired ? 0 : Math.floor((expiryTime - currentTime) / 1000) + 's'
    });

    return isExpired;
  }

  /**
   * Enhanced refresh check with critical threshold
   */
  static needsRefresh(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const needsRefresh = timeUntilExpiry <= TOKEN_CONFIG.REFRESH_THRESHOLD;
    const isCritical = timeUntilExpiry <= TOKEN_CONFIG.CRITICAL_THRESHOLD;

    logger.debug('🔄 Enhanced Token Refresh Check:', {
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + 's',
      refreshThreshold: Math.floor(TOKEN_CONFIG.REFRESH_THRESHOLD / 1000) + 's',
      criticalThreshold: Math.floor(TOKEN_CONFIG.CRITICAL_THRESHOLD / 1000) + 's',
      needsRefresh,
      isCritical
    });

    return needsRefresh;
  }

  /**
   * Get token expiry timestamp
   */
  static getTokenExpiry(token) {
    const payload = this.decodeToken(token);
    return payload?.exp ? payload.exp * 1000 : null;
  }
}

/**
 * Token Storage Manager
 */
class TokenStorageManager {
  /**
   * Enhanced token storage with security metadata
   */
  static storeToken(accessToken, refreshToken = null) {
    try {
      const expiry = JWTTokenUtils.getTokenExpiry(accessToken);
      const tokenData = {
        accessToken,
        refreshToken,
        expiry,
        stored: Date.now(),
        refreshAttempts: 0,
        lastSecurityCheck: Date.now(),
        fingerprint: this.generateFingerprint()
      };

      storage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        storage.setItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      }
      storage.setItem(TOKEN_CONFIG.TOKEN_EXPIRY_KEY, expiry);
      storage.setItem(`${TOKEN_CONFIG.STORAGE_PREFIX}metadata`, tokenData);

      logger.info('💾 Enhanced Auth Token Stored:', {
        hasRefreshToken: !!refreshToken,
        expiry: expiry ? new Date(expiry).toISOString() : null,
        hasFingerprint: !!tokenData.fingerprint
      });

      if (SecurityMonitorService) {
        SecurityMonitorService.logSecurityEvent('token_stored', {
          hasRefreshToken: !!refreshToken,
          expiry: expiry ? new Date(expiry).toISOString() : null
        });
      }

    } catch (error) {
      logger.error('❌ Failed to store enhanced auth token:', error);
    }
  }

  /**
   * Generate browser fingerprint for additional security
   */
  static generateFingerprint() {
    if (typeof window === 'undefined') return null;

    try {
      const fingerprint = [
        navigator.userAgent || '',
        window.screen?.width || 0,
        window.screen?.height || 0,
        new Date().getTimezoneOffset(),
        navigator.language || ''
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
      logger.error('❌ Failed to generate fingerprint:', error);
      return null;
    }
  }

  /**
   * Get stored token
   */
  static getAccessToken() {
    try {
      const token = storage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);

      if (token && JWTTokenUtils.isTokenExpired(token)) {
        logger.warn('⚠️ Stored access token is expired');
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      logger.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken() {
    try {
      return storage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      logger.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get token metadata
   */
  static getTokenMetadata() {
    try {
      return storage.getItem(`${TOKEN_CONFIG.STORAGE_PREFIX}metadata`) || {};
    } catch (error) {
      logger.error('❌ Failed to get token metadata:', error);
      return {};
    }
  }

  /**
   * Enhanced token cleanup with reason tracking
   */
  static clearTokens() {
    try {
      const metadata = this.getTokenMetadata();

      storage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
      storage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
      storage.removeItem(TOKEN_CONFIG.TOKEN_EXPIRY_KEY);
      storage.removeItem(`${TOKEN_CONFIG.STORAGE_PREFIX}metadata`);

      logger.info('🧹 Enhanced Auth Tokens Cleared');

      if (SecurityMonitorService) {
        SecurityMonitorService.logSecurityEvent('tokens_cleared', {
          hadRefreshToken: !!metadata?.refreshToken,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('❌ Failed to clear enhanced auth tokens:', error);
    }
  }

  /**
   * Update refresh attempts
   */
  static updateRefreshAttempts(attempts) {
    try {
      const metadata = this.getTokenMetadata();
      metadata.refreshAttempts = attempts;
      storage.setItem(`${TOKEN_CONFIG.STORAGE_PREFIX}metadata`, metadata);
    } catch (error) {
      logger.error('❌ Failed to update refresh attempts:', error);
    }
  }
}

/**
 * Enhanced Auth Token Expiration Service
 */
class AuthTokenExpirationService {
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

    this.startExpirationMonitoring();
    this.setupEventListeners();
    this.isInitialized = true;

    logger.info('🛡️ Enhanced Auth Token Expiration Service Initialized');
  }

  /**
   * Start enhanced monitoring with security checks
   */
  static startExpirationMonitoring() {
    // Check every 30 seconds for more responsive handling
    this.monitoringInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 30 * 1000);

    // Initial check
    this.checkTokenExpiration();
  }

  /**
   * Enhanced token expiration check
   */
  static checkTokenExpiration() {
    const accessToken = TokenStorageManager.getAccessToken();

    if (!accessToken) {
      this.warningShown = false;
      return;
    }

    // Check if token is expired
    if (JWTTokenUtils.isTokenExpired(accessToken)) {
      logger.warn('🚨 Token expired - handling expiration');
      this.handleTokenExpiration('expired');
      return;
    }

    // Check if token needs refresh
    if (JWTTokenUtils.needsRefresh(accessToken)) {
      logger.info('🔄 Token needs refresh - attempting automatic refresh');
      this.refreshToken();
      return;
    }

    // Check for critical expiration (1 minute warning)
    const tokenExpiry = JWTTokenUtils.getTokenExpiry(accessToken);
    const timeLeft = tokenExpiry - Date.now();

    if (timeLeft <= TOKEN_CONFIG.CRITICAL_THRESHOLD && !this.warningShown) {
      logger.warn('⚠️ Token in critical expiration zone');
      this.showCriticalExpirationWarning(Math.floor(timeLeft / 1000));
      this.warningShown = true;
    }
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

    if (SecurityMonitorService) {
      SecurityMonitorService.logSecurityEvent('token_critical_expiration', {
        secondsLeft,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Setup event listeners for enhanced monitoring
   */
  static setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Listen for visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkTokenExpiration();
      }
    });

    // Listen for focus events
    window.addEventListener('focus', () => {
      this.checkTokenExpiration();
    });
  }

  /**
   * Enhanced token refresh with retry logic
   */
  static async refreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenStorageManager.getRefreshToken();
    const metadata = TokenStorageManager.getTokenMetadata();

    if (!refreshToken) {
      logger.warn('⚠️ No refresh token available');
      this.handleTokenExpiration('no_refresh_token');
      return null;
    }

    if (metadata.refreshAttempts >= TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
      logger.warn('⚠️ Max refresh attempts exceeded');
      this.handleTokenExpiration('max_refresh_attempts');
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken, metadata.refreshAttempts);

    try {
      const result = await this.refreshPromise;
      this.refreshPromise = null;
      this.warningShown = false; // Reset warning flag on successful refresh
      return result;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Perform actual token refresh
   */
  static async performTokenRefresh(refreshToken, attempts = 0) {
    try {
      logger.info('🔄 Attempting token refresh...', { attempt: attempts + 1 });

      // Update refresh attempts
      TokenStorageManager.updateRefreshAttempts(attempts + 1);

      // Make refresh request (this would typically be to your API)
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.accessToken) {
        throw new Error('No access token in refresh response');
      }

      // Store new tokens
      TokenStorageManager.storeToken(data.accessToken, data.refreshToken || refreshToken);

      // Notify callbacks
      this.notifyRefreshCallbacks(data.accessToken);

      logger.info('✅ Token refreshed successfully');
      return data.accessToken;

    } catch (error) {
      logger.error('❌ Token refresh failed:', error);

      const metadata = TokenStorageManager.getTokenMetadata();
      if (metadata.refreshAttempts >= TOKEN_CONFIG.MAX_REFRESH_ATTEMPTS) {
        this.handleTokenExpiration();
      }

      throw error;
    }
  }

  /**
   * Enhanced token expiration handling
   */
  static handleTokenExpiration(reason = 'expired') {
    logger.warn('⚠️ Handling enhanced token expiration:', { reason });

    // Stop monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    TokenStorageManager.clearTokens();

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

      // Redirect to login (if in browser environment)
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?expired=true&reason=${reason}`;
        }
      }, 1000);
    }

    if (SecurityMonitorService) {
      SecurityMonitorService.logSecurityEvent('token_expiration_handled', {
        reason,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Add callback for token refresh
   */
  static onTokenRefresh(callback) {
    this.refreshCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.refreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.refreshCallbacks.splice(index, 1);
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
   * Add callback for token expiration
   */
  static onTokenExpiration(callback) {
    this.expirationCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.expirationCallbacks.indexOf(callback);
      if (index > -1) {
        this.expirationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify expiration callbacks
   */
  static notifyExpirationCallbacks(reason = 'expired') {
    this.expirationCallbacks.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        logger.error('❌ Error in expiration callback:', error);
      }
    });
  }

  /**
   * Enhanced token status with security information
   */
  static getTokenStatus() {
    const accessToken = TokenStorageManager.getAccessToken();
    const refreshToken = TokenStorageManager.getRefreshToken();
    const metadata = TokenStorageManager.getTokenMetadata();

    if (!accessToken) {
      return {
        status: 'none',
        hasRefreshToken: !!refreshToken,
        isSecure: false
      };
    }

    const isExpired = JWTTokenUtils.isTokenExpired(accessToken);
    const needsRefresh = JWTTokenUtils.needsRefresh(accessToken);
    const tokenExpiry = JWTTokenUtils.getTokenExpiry(accessToken);
    const timeLeft = tokenExpiry - Date.now();
    const isCritical = timeLeft <= TOKEN_CONFIG.CRITICAL_THRESHOLD;

    return {
      status: isExpired ? 'expired' :
        isCritical ? 'critical' :
          needsRefresh ? 'refresh_needed' : 'valid',
      hasRefreshToken: !!refreshToken,
      refreshAttempts: metadata.refreshAttempts || 0,
      expiry: tokenExpiry,
      timeLeft,
      isCritical,
      lastSecurityCheck: metadata.lastSecurityCheck,
      hasFingerprint: !!metadata.fingerprint,
      isSecure: !isExpired && !!metadata.fingerprint
    };
  }

  /**
   * Force token refresh
   */
  static async forceRefresh() {
    logger.info('🔄 Forcing token refresh...');
    return this.refreshToken();
  }
}

// Initialize service when module loads
if (typeof window !== 'undefined') {
  AuthTokenExpirationService.initialize();
}

export {
  AuthTokenExpirationService,
  JWTTokenUtils, TOKEN_CONFIG, TokenStorageManager
};

export default AuthTokenExpirationService;
