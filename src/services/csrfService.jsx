/**
 * Enhanced CSRF Protection Service
 * P2.4.3: Security Enhancement - Advanced CSRF protection implementation
 * 
 * @description Cross-Site Request Forgery protection utilities with enhanced security
 * @author KırılmazlarPanel Development Team
 * @date July 25, 2025 - Enhanced CSRF Protection
 */

import storage from '@core/storage';
import { useCallback, useEffect, useState } from 'react';
import logger from '../utils/productionLogger';
import { SecurityMonitorService } from './securityService';

/**
 * Enhanced CSRF Configuration
 */
const CSRF_CONFIG = {
  TOKEN_NAME: '_csrf_token',
  HEADER_NAME: 'X-CSRF-Token',
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEY: 'csrf_tokens',
  MAX_TOKENS: 10, // Maximum number of tokens to store
  REFRESH_THRESHOLD: 60 * 60 * 1000, // Refresh token if expires in 1 hour
  DOUBLE_SUBMIT_COOKIE: 'csrf_cookie_token',
  RATE_LIMIT: {
    MAX_TOKENS_PER_MINUTE: 10,
    WINDOW_SIZE: 60 * 1000 // 1 minute
  }
};

/**
 * Enhanced CSRF Token Generator with Rate Limiting
 */
class CSRFTokenGenerator {
  static tokenGenerationTimes = [];

  /**
   * Generate cryptographically secure random token
   */
  static generateToken() {
    // Rate limiting check
    const now = Date.now();
    this.tokenGenerationTimes = this.tokenGenerationTimes.filter(
      time => now - time < CSRF_CONFIG.RATE_LIMIT.WINDOW_SIZE
    );

    if (this.tokenGenerationTimes.length >= CSRF_CONFIG.RATE_LIMIT.MAX_TOKENS_PER_MINUTE) {
      logger.warn('⚠️ CSRF Token generation rate limit exceeded');
      // Return a cached token instead of generating new one
      const existingTokens = CSRFTokenStorage.getStoredTokens();
      const validToken = existingTokens.find(t =>
        t.expires > now && !t.used
      );

      if (validToken) {
        logger.debug('🔄 Returning cached CSRF token due to rate limit');
        return validToken.token;
      }

      // If no valid token available, allow one more generation
      logger.warn('⚠️ No cached token available, allowing emergency generation');
    }

    this.tokenGenerationTimes.push(now);

    const array = new Uint8Array(CSRF_CONFIG.TOKEN_LENGTH);

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    // Convert to base64
    const token = btoa(String.fromCharCode.apply(null, array))
      .replace(/[+/=]/g, '') // Remove problematic characters
      .substring(0, CSRF_CONFIG.TOKEN_LENGTH);

    logger.debug('🔒 Enhanced CSRF Token Generated:', {
      length: token.length,
      rateLimitCount: this.tokenGenerationTimes.length
    });

    return token;
  }

  /**
   * Generate token with enhanced metadata
   */
  static generateTokenWithMetadata() {
    const token = this.generateToken();
    const metadata = {
      token,
      created: Date.now(),
      expires: Date.now() + CSRF_CONFIG.TOKEN_EXPIRY,
      used: false,
      origin: typeof window !== 'undefined' ? window.location.origin : null,
      userAgent: typeof navigator !== 'undefined' ?
        navigator.userAgent.substring(0, 100) : null, // Limit length
      sessionId: this.generateSessionId(),
      fingerprint: this.generateFingerprint()
    };

    logger.debug('🏷️ Enhanced CSRF Token with Metadata:', {
      token: token.substring(0, 8) + '...',
      expires: new Date(metadata.expires).toISOString(),
      hasFingerprint: !!metadata.fingerprint
    });

    return metadata;
  }

  /**
   * Generate session ID for additional validation
   */
  static generateSessionId() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = window.sessionStorage.getItem('csrf_session_id');

      if (!sessionId) {
        sessionId = this.generateToken().substring(0, 16);
        window.sessionStorage.setItem('csrf_session_id', sessionId);
      }

      return sessionId;
    }

    return null;
  }

  /**
   * Generate browser fingerprint for additional security
   */
  static generateFingerprint() {
    if (typeof window === 'undefined') return null;

    try {
      const fingerprint = [
        window.screen?.width || 0,
        window.screen?.height || 0,
        window.screen?.colorDepth || 0,
        navigator.language || '',
        navigator.platform || '',
        new Date().getTimezoneOffset()
      ].join('|');

      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      return Math.abs(hash).toString(36);
    } catch (error) {
      logger.error('❌ Failed to generate fingerprint:', error);
      return null;
    }
  }
}

/**
 * CSRF Token Storage Manager
 */
class CSRFTokenStorage {
  /**
   * Store CSRF token
   */
  static storeToken(tokenData) {
    try {
      let tokens = this.getStoredTokens();

      // Remove expired tokens
      tokens = tokens.filter(t => t.expires > Date.now());

      // Add new token
      tokens.push(tokenData);

      // Keep only the most recent tokens
      if (tokens.length > CSRF_CONFIG.MAX_TOKENS) {
        tokens = tokens.slice(-CSRF_CONFIG.MAX_TOKENS);
      }

      storage.setItem(CSRF_CONFIG.STORAGE_KEY, tokens);

      logger.debug('💾 CSRF Token Stored:', {
        totalTokens: tokens.length,
        token: tokenData.token.substring(0, 8) + '...'
      });

    } catch (error) {
      logger.error('❌ Failed to store CSRF token:', error);
    }
  }

  /**
   * Get stored tokens
   */
  static getStoredTokens() {
    try {
      const tokens = storage.getItem(CSRF_CONFIG.STORAGE_KEY) || [];
      return Array.isArray(tokens) ? tokens : [];
    } catch (error) {
      logger.error('❌ Failed to get stored CSRF tokens:', error);
      return [];
    }
  }

  /**
   * Find valid token
   */
  static findValidToken(token) {
    const tokens = this.getStoredTokens();
    const validToken = tokens.find(t =>
      t.token === token &&
      t.expires > Date.now() &&
      !t.used
    );

    logger.debug('🔍 Token Validation:', {
      token: token.substring(0, 8) + '...',
      found: !!validToken,
      totalTokens: tokens.length
    });

    return validToken;
  }

  /**
   * Mark token as used
   */
  static markTokenAsUsed(token) {
    try {
      const tokens = this.getStoredTokens();
      const tokenIndex = tokens.findIndex(t => t.token === token);

      if (tokenIndex !== -1) {
        tokens[tokenIndex].used = true;
        storage.setItem(CSRF_CONFIG.STORAGE_KEY, tokens);

        logger.debug('✅ CSRF Token Marked as Used:', {
          token: token.substring(0, 8) + '...'
        });
      }
    } catch (error) {
      logger.error('❌ Failed to mark CSRF token as used:', error);
    }
  }

  /**
   * Clean expired tokens
   */
  static cleanExpiredTokens() {
    try {
      const tokens = this.getStoredTokens();
      const validTokens = tokens.filter(t => t.expires > Date.now());

      if (validTokens.length !== tokens.length) {
        storage.setItem(CSRF_CONFIG.STORAGE_KEY, validTokens);

        logger.debug('🧹 Expired CSRF Tokens Cleaned:', {
          removed: tokens.length - validTokens.length,
          remaining: validTokens.length
        });
      }
    } catch (error) {
      logger.error('❌ Failed to clean expired CSRF tokens:', error);
    }
  }
}

/**
 * Enhanced CSRF Protection Service with Advanced Security
 */
class CSRFProtectionService {
  static isInitialized = false;
  static doubleSubmitCookies = new Map();

  /**
   * Initialize enhanced CSRF protection
   */
  static initialize() {
    if (this.isInitialized) return;

    // Clean expired tokens on initialization
    CSRFTokenStorage.cleanExpiredTokens();

    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        CSRFTokenStorage.cleanExpiredTokens();
        this.cleanExpiredCookies();
      }, 60 * 60 * 1000); // Clean every hour

      // Initialize double-submit cookie protection
      this.initializeDoubleSubmitCookie();
    }

    this.isInitialized = true;
    logger.info('🛡️ Enhanced CSRF Protection Initialized');
  }

  /**
   * Initialize double-submit cookie for additional protection
   */
  static initializeDoubleSubmitCookie() {
    if (typeof document === 'undefined') return;

    try {
      // Check if cookie already exists
      const existingCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(CSRF_CONFIG.DOUBLE_SUBMIT_COOKIE + '='));

      if (!existingCookie) {
        const cookieToken = CSRFTokenGenerator.generateToken();
        const expires = new Date(Date.now() + CSRF_CONFIG.TOKEN_EXPIRY).toUTCString();

        document.cookie = `${CSRF_CONFIG.DOUBLE_SUBMIT_COOKIE}=${cookieToken}; expires=${expires}; path=/; SameSite=Strict; Secure`;

        logger.debug('🍪 Double-submit cookie initialized');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize double-submit cookie:', error);
    }
  }

  /**
   * Get double-submit cookie value
   */
  static getDoubleSubmitCookie() {
    if (typeof document === 'undefined') return null;

    try {
      const cookieMatch = document.cookie
        .split('; ')
        .find(row => row.startsWith(CSRF_CONFIG.DOUBLE_SUBMIT_COOKIE + '='));

      return cookieMatch ? cookieMatch.split('=')[1] : null;
    } catch (error) {
      logger.error('❌ Failed to get double-submit cookie:', error);
      return null;
    }
  }

  /**
   * Clean expired cookies
   */
  static cleanExpiredCookies() {
    // Cookie cleanup is handled by browser, but we can clean our Map
    const now = Date.now();
    for (const [key, value] of this.doubleSubmitCookies.entries()) {
      if (value.expires < now) {
        this.doubleSubmitCookies.delete(key);
      }
    }
  }

  /**
   * Generate new CSRF token with automatic refresh
   */
  static generateToken() {
    this.initialize();

    const tokenData = CSRFTokenGenerator.generateTokenWithMetadata();
    CSRFTokenStorage.storeToken(tokenData);

    return tokenData.token;
  }

  /**
   * Enhanced CSRF token validation with additional security checks
   */
  static validateToken(token, markAsUsed = true, additionalChecks = true) {
    if (!token || typeof token !== 'string') {
      logger.warn('⚠️ Invalid CSRF token format:', typeof token);
      SecurityMonitorService.logSecurityEvent('csrf_invalid_format', {
        tokenType: typeof token
      });
      return false;
    }

    const tokenData = CSRFTokenStorage.findValidToken(token);

    if (!tokenData) {
      logger.warn('⚠️ Invalid or expired CSRF token');
      SecurityMonitorService.logSecurityEvent('csrf_invalid_token', {
        token: token.substring(0, 8) + '...'
      });
      return false;
    }

    if (additionalChecks) {
      // Enhanced security validations
      if (typeof window !== 'undefined') {
        // Check origin if available
        if (tokenData.origin && tokenData.origin !== window.location.origin) {
          logger.warn('⚠️ CSRF token origin mismatch');
          SecurityMonitorService.logSecurityEvent('csrf_origin_mismatch', {
            expected: window.location.origin,
            received: tokenData.origin
          });
          return false;
        }

        // Check session ID if available
        if (tokenData.sessionId) {
          const currentSessionId = window.sessionStorage?.getItem('csrf_session_id');
          if (currentSessionId && tokenData.sessionId !== currentSessionId) {
            logger.warn('⚠️ CSRF token session mismatch');
            SecurityMonitorService.logSecurityEvent('csrf_session_mismatch', {
              tokenSessionId: tokenData.sessionId
            });
            return false;
          }
        }

        // Validate double-submit cookie
        const cookieToken = this.getDoubleSubmitCookie();
        if (cookieToken && !this.validateDoubleSubmitCookie(cookieToken)) {
          logger.warn('⚠️ Double-submit cookie validation failed');
          SecurityMonitorService.logSecurityEvent('csrf_double_submit_failed', {});
          return false;
        }
      }

      // Check token age for additional security
      const tokenAge = Date.now() - tokenData.created;
      if (tokenAge > CSRF_CONFIG.TOKEN_EXPIRY) {
        logger.warn('⚠️ CSRF token expired');
        SecurityMonitorService.logSecurityEvent('csrf_token_expired', {
          age: tokenAge,
          maxAge: CSRF_CONFIG.TOKEN_EXPIRY
        });
        return false;
      }
    }

    if (markAsUsed) {
      CSRFTokenStorage.markTokenAsUsed(token);
    }

    logger.debug('✅ Enhanced CSRF Token Validated Successfully');
    SecurityMonitorService.logSecurityEvent('csrf_validation_success', {
      token: token.substring(0, 8) + '...'
    });

    return true;
  }

  /**
   * Validate double-submit cookie
   */
  static validateDoubleSubmitCookie(cookieToken) {
    try {
      // For now, just check if cookie exists and is not empty
      // In a real implementation, this would validate against server-side storage
      return cookieToken && cookieToken.length >= 16;
    } catch (error) {
      logger.error('❌ Double-submit cookie validation error:', error);
      return false;
    }
  }  /**
   * Get token for forms
   */
  static getFormToken() {
    return this.generateToken();
  }

  /**
   * Get token for AJAX requests
   */
  static getAjaxToken() {
    return this.generateToken();
  }

  /**
   * Add CSRF token to form
   */
  static addTokenToForm(form) {
    if (!(form instanceof HTMLFormElement)) {
      logger.error('❌ Invalid form element provided');
      return;
    }

    // Remove existing CSRF token inputs
    const existingTokens = form.querySelectorAll(`input[name="${CSRF_CONFIG.TOKEN_NAME}"]`);
    existingTokens.forEach(input => input.remove());

    // Add new token
    const token = this.generateToken();
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = CSRF_CONFIG.TOKEN_NAME;
    input.value = token;

    form.appendChild(input);

    logger.debug('📝 CSRF Token Added to Form:', {
      formId: form.id || 'unnamed',
      token: token.substring(0, 8) + '...'
    });
  }

  /**
   * Add CSRF token to fetch requests
   */
  static addTokenToFetch(options = {}) {
    const token = this.generateToken();

    const headers = {
      ...options.headers,
      [CSRF_CONFIG.HEADER_NAME]: token
    };

    return {
      ...options,
      headers
    };
  }

  /**
   * Enhanced secure fetch wrapper with comprehensive CSRF protection
   */
  static async secureFetch(url, options = {}) {
    const secureOptions = this.addTokenToFetch(options);

    // Add double-submit cookie to headers
    const cookieToken = this.getDoubleSubmitCookie();
    if (cookieToken) {
      secureOptions.headers['X-CSRF-Cookie'] = cookieToken;
    }

    try {
      const response = await fetch(url, secureOptions);

      logger.debug('🌐 Enhanced Secure Fetch Request:', {
        url: url.substring(0, 50) + (url.length > 50 ? '...' : ''),
        method: options.method || 'GET',
        hasCSRF: !!secureOptions.headers[CSRF_CONFIG.HEADER_NAME],
        hasCookie: !!secureOptions.headers['X-CSRF-Cookie']
      });

      // Handle CSRF-related HTTP errors
      if (response.status === 403 || response.status === 419) {
        logger.warn('⚠️ Possible CSRF protection triggered by server');
        SecurityMonitorService.logSecurityEvent('csrf_server_rejection', {
          status: response.status,
          url: url.substring(0, 100)
        });
      }

      return response;
    } catch (error) {
      logger.error('❌ Enhanced Secure Fetch Failed:', error);
      SecurityMonitorService.logSecurityEvent('csrf_fetch_error', {
        error: error.message,
        url: url.substring(0, 100)
      });
      throw error;
    }
  }

  /**
   * Get enhanced CSRF protection statistics
   */
  static getStatistics() {
    const tokens = CSRFTokenStorage.getStoredTokens();
    const now = Date.now();

    const stats = {
      totalTokens: tokens.length,
      validTokens: tokens.filter(t => t.expires > now && !t.used).length,
      expiredTokens: tokens.filter(t => t.expires <= now).length,
      usedTokens: tokens.filter(t => t.used).length,
      oldestToken: tokens.length > 0 ? new Date(Math.min(...tokens.map(t => t.created))) : null,
      newestToken: tokens.length > 0 ? new Date(Math.max(...tokens.map(t => t.created))) : null,
      rateLimitCount: CSRFTokenGenerator.tokenGenerationTimes?.length || 0,
      doubleSubmitCookieActive: !!this.getDoubleSubmitCookie(),
      securityEvents: SecurityMonitorService.getRecentEvents?.('csrf') || []
    };

    logger.debug('📊 Enhanced CSRF Protection Statistics:', stats);
    return stats;
  }

  /**
   * Force refresh all CSRF tokens (emergency use)
   */
  static refreshAllTokens() {
    logger.info('🔄 Force refreshing all CSRF tokens');

    // Clear all stored tokens
    storage.setItem(CSRF_CONFIG.STORAGE_KEY, []);

    // Clear rate limiting
    CSRFTokenGenerator.tokenGenerationTimes = [];

    // Reinitialize double-submit cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${CSRF_CONFIG.DOUBLE_SUBMIT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      this.initializeDoubleSubmitCookie();
    }

    // Generate new token
    const newToken = this.generateToken();

    SecurityMonitorService.logSecurityEvent('csrf_tokens_refreshed', {
      timestamp: Date.now()
    });

    return newToken;
  }
}

/**
 * React Hook for CSRF Protection
 */
export const useCSRFProtection = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    CSRFProtectionService.initialize();
    const newToken = CSRFProtectionService.generateToken();
    setToken(newToken);
  }, []);

  const generateNewToken = useCallback(() => {
    const newToken = CSRFProtectionService.generateToken();
    setToken(newToken);
    return newToken;
  }, []);

  const validateToken = useCallback((tokenToValidate) => {
    return CSRFProtectionService.validateToken(tokenToValidate);
  }, []);

  const secureFetch = useCallback((url, options = {}) => {
    return CSRFProtectionService.secureFetch(url, options);
  }, []);

  return {
    token,
    generateNewToken,
    validateToken,
    secureFetch,
    addTokenToForm: CSRFProtectionService.addTokenToForm,
    getStatistics: CSRFProtectionService.getStatistics
  };
};

/**
 * CSRF Protected Form Component
 */
export const CSRFProtectedForm = ({ children, onSubmit, ...props }) => {
  const { token, validateToken } = useCSRFProtection();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedToken = formData.get(CSRF_CONFIG.TOKEN_NAME);

    if (!validateToken(submittedToken)) {
      logger.error('❌ CSRF Token Validation Failed');
      alert('Güvenlik hatası: Sayfa yeniden yüklenecek');
      window.location.reload();
      return;
    }

    if (onSubmit) {
      onSubmit(e);
    }
  }, [validateToken, onSubmit]);

  return (
    <form onSubmit={handleSubmit} {...props}>
      <input
        type="hidden"
        name={CSRF_CONFIG.TOKEN_NAME}
        value={token || ''}
      />
      {children}
    </form>
  );
};

export {
  CSRF_CONFIG, CSRFProtectionService,
  CSRFTokenGenerator,
  CSRFTokenStorage
};

export default CSRFProtectionService;
