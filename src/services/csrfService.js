/**
 * CSRF Protection Service
 * P2.4.3: Security Enhancement - CSRF protection implementation
 * 
 * @description Cross-Site Request Forgery protection utilities
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import storage from '@core/storage';
import { useCallback, useEffect, useState } from 'react';
import logger from '../utils/productionLogger';

/**
 * CSRF Configuration
 */
const CSRF_CONFIG = {
  TOKEN_NAME: '_csrf_token',
  HEADER_NAME: 'X-CSRF-Token',
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEY: 'csrf_tokens',
  MAX_TOKENS: 10 // Maximum number of tokens to store
};

/**
 * CSRF Token Generator
 */
class CSRFTokenGenerator {
  /**
   * Generate cryptographically secure random token
   */
  static generateToken() {
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

    logger.debug('🔒 CSRF Token Generated:', { length: token.length });
    return token;
  }

  /**
   * Generate token with metadata
   */
  static generateTokenWithMetadata() {
    const token = this.generateToken();
    const metadata = {
      token,
      created: Date.now(),
      expires: Date.now() + CSRF_CONFIG.TOKEN_EXPIRY,
      used: false,
      origin: typeof window !== 'undefined' ? window.location.origin : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    };

    logger.debug('🏷️ CSRF Token with Metadata:', {
      token: token.substring(0, 8) + '...',
      expires: new Date(metadata.expires).toISOString()
    });

    return metadata;
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
 * CSRF Protection Service
 */
class CSRFProtectionService {
  static isInitialized = false;

  /**
   * Initialize CSRF protection
   */
  static initialize() {
    if (this.isInitialized) return;

    // Clean expired tokens on initialization
    CSRFTokenStorage.cleanExpiredTokens();

    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        CSRFTokenStorage.cleanExpiredTokens();
      }, 60 * 60 * 1000); // Clean every hour
    }

    this.isInitialized = true;
    logger.info('🛡️ CSRF Protection Initialized');
  }

  /**
   * Generate new CSRF token
   */
  static generateToken() {
    this.initialize();

    const tokenData = CSRFTokenGenerator.generateTokenWithMetadata();
    CSRFTokenStorage.storeToken(tokenData);

    return tokenData.token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token, markAsUsed = true) {
    if (!token || typeof token !== 'string') {
      logger.warn('⚠️ Invalid CSRF token format:', typeof token);
      return false;
    }

    const tokenData = CSRFTokenStorage.findValidToken(token);

    if (!tokenData) {
      logger.warn('⚠️ Invalid or expired CSRF token');
      return false;
    }

    // Additional security checks
    if (typeof window !== 'undefined') {
      // Check origin if available
      if (tokenData.origin && tokenData.origin !== window.location.origin) {
        logger.warn('⚠️ CSRF token origin mismatch');
        return false;
      }
    }

    if (markAsUsed) {
      CSRFTokenStorage.markTokenAsUsed(token);
    }

    logger.debug('✅ CSRF Token Validated Successfully');
    return true;
  }

  /**
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
   * Secure fetch wrapper with CSRF protection
   */
  static async secureFetch(url, options = {}) {
    const secureOptions = this.addTokenToFetch(options);

    try {
      const response = await fetch(url, secureOptions);

      logger.debug('🌐 Secure Fetch Request:', {
        url: url.substring(0, 50) + (url.length > 50 ? '...' : ''),
        method: options.method || 'GET',
        hasCSRF: !!secureOptions.headers[CSRF_CONFIG.HEADER_NAME]
      });

      return response;
    } catch (error) {
      logger.error('❌ Secure Fetch Failed:', error);
      throw error;
    }
  }

  /**
   * Get CSRF protection statistics
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
      newestToken: tokens.length > 0 ? new Date(Math.max(...tokens.map(t => t.created))) : null
    };

    logger.debug('📊 CSRF Protection Statistics:', stats);
    return stats;
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
