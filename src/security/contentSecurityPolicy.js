/**
 * Content Security Policy (CSP) Implementation
 * P2.4.2: Security Enhancement - XSS prevention measures
 * 
 * @description CSP header configuration and violation handling
 * @author KırılmazlarPanel Development Team
 * @date July 25, 2025
 */

import logger from '../utils/productionLogger';

/**
 * CSP Policy Configuration
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React dev mode - remove in production
    'https://unpkg.com', // For some dev dependencies
    'blob:' // For dynamic imports
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS solutions
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images and SVG placeholders
    'blob:', // For uploaded images
    'https:', // For external image sources
    '*.amazonaws.com' // If using AWS S3
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com'
  ],
  'connect-src': [
    "'self'",
    'ws:', 'wss:', // For WebSocket connections
    'https://api.kirilmazlar.com' // API endpoints
  ],
  'media-src': ["'self'", 'data:', 'blob:'],
  'object-src': ["'none'"], // Prevents Flash, Java applets, etc.
  'base-uri': ["'self'"],
  'form-action': ["'self'"], // Only allow forms to submit to same origin
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'upgrade-insecure-requests': true, // Automatically upgrade HTTP to HTTPS
  'block-all-mixed-content': true // Block mixed content
};

/**
 * Convert CSP policy object to header string
 */
export const generateCSPHeader = () => {
  const directives = [];

  Object.entries(CSP_POLICY).forEach(([directive, sources]) => {
    if (directive === 'upgrade-insecure-requests' || directive === 'block-all-mixed-content') {
      if (sources === true) {
        directives.push(directive);
      }
    } else if (Array.isArray(sources)) {
      directives.push(`${directive} ${sources.join(' ')}`);
    }
  });

  return directives.join('; ');
};

/**
 * CSP Meta Tag Component
 */
export const CSPMetaTag = () => {
  const cspHeader = generateCSPHeader();

  return `<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`;
};

/**
 * Production CSP Configuration (more restrictive)
 */
export const PRODUCTION_CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'sha256-HASH_OF_INLINE_SCRIPTS'"], // Use hashes instead of unsafe-inline
  'style-src': ["'self'", "'sha256-HASH_OF_INLINE_STYLES'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.kirilmazlar.com'],
  'media-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true,
  'require-sri-for': ['script', 'style'] // Require subresource integrity
};

/**
 * CSP Violation Handler for Client-side
 */
export const setupCSPViolationReporting = () => {
  if (typeof window === 'undefined') return;

  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', (e) => {
    const violation = {
      blockedURI: e.blockedURI,
      documentURI: e.documentURI,
      effectiveDirective: e.effectiveDirective,
      originalPolicy: e.originalPolicy,
      referrer: e.referrer,
      statusCode: e.statusCode,
      violatedDirective: e.violatedDirective,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
      timestamp: new Date().toISOString()
    };

    // Log violation
    logger.error('🚨 CSP Violation:', violation);

    // Send to monitoring service (implement based on your monitoring setup)
    if (window.reportCSPViolation) {
      window.reportCSPViolation(violation);
    }

    // Store locally for debugging
    const violations = JSON.parse(
      localStorage.getItem('csp_violations') || '[]'
    );
    violations.push(violation);

    // Keep only last 10 violations
    if (violations.length > 10) {
      violations.shift();
    }

    localStorage.setItem('csp_violations', JSON.stringify(violations));
  });
};

/**
 * Get stored CSP violations (for debugging)
 */
export const getCSPViolations = () => {
  if (typeof window === 'undefined') return [];

  return JSON.parse(localStorage.getItem('csp_violations') || '[]');
};

/**
 * Clear stored CSP violations
 */
export const clearCSPViolations = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('csp_violations');
};

export default {
  CSP_POLICY,
  PRODUCTION_CSP_POLICY,
  generateCSPHeader,
  CSPMetaTag,
  setupCSPViolationReporting,
  getCSPViolations,
  clearCSPViolations
};
