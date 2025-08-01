/**
 * ===========================================
 * KIRIILMAZLAR PANEL - SECURITY SERVICE
 * Content Security Policy & Security Headers
 * ===========================================
 */

import logger from '../utils/productionLogger.js';

class SecurityService {
  constructor() {
    this.cspConfig = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React development
        "'unsafe-eval'", // Required for development tools
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'http:' // Allow for development
      ],
      'connect-src': [
        "'self'",
        'https://api.kirilmazlar.com',
        'wss://api.kirilmazlar.com'
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': []
    };

    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
  }

  /**
   * Generate CSP header string
   */
  generateCSPHeader() {
    const directives = Object.entries(this.cspConfig)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    return directives;
  }

  /**
   * Apply security headers to meta tags (for SPA)
   */
  applySecurityMeta() {
    if (typeof document === 'undefined') return;

    // Development mode'da CSP hatalarını engellemek için devre dışı bırak
    if (process.env.NODE_ENV === 'development') {
      logger.system('Security headers skipped in development mode');
      return;
    }

    // CSP Meta Tag
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    cspMeta.setAttribute('content', this.generateCSPHeader());

    // Other security meta tags
    Object.entries(this.securityHeaders).forEach(([name, content]) => {
      // X-Frame-Options meta tag hatası engellemek için sadece production'da uygula
      if (name === 'X-Frame-Options') return;

      if (name.startsWith('X-')) {
        let meta = document.querySelector(`meta[http-equiv="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('http-equiv', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      }
    });

    logger.system('Security headers applied');
  }

  /**
   * HTTPS Enforcement
   */
  enforceHTTPS() {
    if (typeof window === 'undefined') return;

    const isProduction = process.env.NODE_ENV === 'production';
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost';

    if (isProduction && !isHTTPS && !isLocalhost) {
      const httpsUrl = window.location.href.replace(/^http:/, 'https:');
      logger.info('Redirecting to HTTPS:', httpsUrl);
      window.location.replace(httpsUrl);
    }
  }

  /**
   * Secure cookie configuration
   */
  enforceSecureCookies() {
    if (typeof document === 'undefined') return;

    const isSecure = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost';

    if (isSecure) {
      // Override document.cookie setter to enforce secure cookies
      const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      const originalCookieSetter = originalCookieDescriptor.set;
      const originalCookieGetter = originalCookieDescriptor.get;

      Object.defineProperty(document, 'cookie', {
        set(value) {
          let secureValue = value;

          // Add Secure flag if not present and we're on HTTPS
          if (window.location.protocol === 'https:' && !value.includes('Secure')) {
            secureValue += '; Secure';
          }

          // Add SameSite if not present
          if (!value.includes('SameSite')) {
            secureValue += '; SameSite=Strict';
          }

          // Add HttpOnly for sensitive cookies
          if ((value.includes('auth') || value.includes('session')) && !value.includes('HttpOnly')) {
            secureValue += '; HttpOnly';
          }

          originalCookieSetter.call(this, secureValue);
        },
        get() {
          return originalCookieGetter.call(this);
        }
      });
    }
  }

  /**
   * Input sanitization
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * XSS Prevention
   */
  preventXSS(html) {
    if (typeof html !== 'string') return html;

    // Remove script tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove on* event handlers
    html = html.replace(/\son\w+="[^"]*"/gi, '');
    html = html.replace(/\son\w+='[^']*'/gi, '');

    // Remove javascript: urls
    html = html.replace(/href="javascript:[^"]*"/gi, 'href="#"');
    html = html.replace(/href='javascript:[^']*'/gi, "href='#'");

    return html;
  }

  /**
   * CSRF Token Generation
   */
  generateCSRFToken() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Security audit
   */
  performSecurityAudit() {
    const audit = {
      https: window.location.protocol === 'https:',
      csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      secureCookies: this.checkSecureCookies(),
      mixedContent: this.checkMixedContent(),
      timestamp: new Date().toISOString()
    };

    logger.system('Security Audit Results:', audit);
    return audit;
  }

  /**
   * Check if cookies are secure
   */
  checkSecureCookies() {
    if (typeof document === 'undefined') return true;
    if (!document.cookie) return true; // No cookies, consider secure

    const cookies = document.cookie.split(';');
    const insecureCookies = cookies.filter(cookie =>
      cookie.trim() &&
      !cookie.includes('Secure') &&
      window.location.protocol === 'https:'
    );

    return insecureCookies.length === 0;
  }

  /**
   * Check for mixed content
   */
  checkMixedContent() {
    if (typeof document === 'undefined') return true;

    const httpResources = Array.from(document.querySelectorAll('img, script, link'))
      .filter(element => {
        const src = element.src || element.href;
        return src && src.startsWith('http:') && window.location.protocol === 'https:';
      });

    return httpResources.length === 0;
  }

  /**
   * Initialize all security measures
   */
  initialize() {
    try {
      this.enforceHTTPS();
      this.applySecurityMeta();
      this.enforceSecureCookies();

      // Perform initial security audit
      setTimeout(() => this.performSecurityAudit(), 1000);

      logger.system('SecurityService initialized successfully');
    } catch (error) {
      logger.error('SecurityService initialization failed:', error);
    }
  }
}

// Create singleton instance
const securityService = new SecurityService();

export default securityService;
