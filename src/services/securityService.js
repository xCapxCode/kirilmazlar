/**
 * Security & Validation Service
 * P2.4.1: Security Enhancement - Input sanitization audit
 * 
 * @description Comprehensive input validation and sanitization utilities
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import logger from '../utils/productionLogger';

/**
 * Input sanitization patterns
 */
const SANITIZATION_PATTERNS = {
  // XSS prevention patterns
  HTML_TAGS: /<[^>]*>?/gm,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  STYLE_TAGS: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,

  // SQL injection patterns
  SQL_KEYWORDS: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  SQL_COMMENTS: /(--|\/\*|\*\/|#)/g,

  // JavaScript injection patterns
  JS_EVENTS: /on\w+\s*=/gi,
  JS_PROTOCOLS: /javascript:|data:|vbscript:/gi,

  // Common injection patterns
  MALICIOUS_CHARS: /[<>'"&]/g,
  EMAIL_PATTERN: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PHONE_PATTERN: /^[+]?[1-9][\d]{0,15}$/,

  // Turkish characters support
  TURKISH_TEXT: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-.,!?():0-9]*$/,

  // Numeric patterns
  INTEGER: /^-?\d+$/,
  DECIMAL: /^-?\d+(\.\d+)?$/,
  POSITIVE_NUMBER: /^\d+(\.\d+)?$/,

  // Date patterns
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
};

/**
 * Validation rules
 */
const VALIDATION_RULES = {
  // Length constraints
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_ADDRESS_LENGTH: 200,

  // Business rules
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 99999,

  // File constraints
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain']
};

/**
 * Input Sanitizer Class
 */
class InputSanitizer {
  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(input) {
    if (typeof input !== 'string') return '';

    const sanitized = input
      .replace(SANITIZATION_PATTERNS.SCRIPT_TAGS, '')
      .replace(SANITIZATION_PATTERNS.STYLE_TAGS, '')
      .replace(SANITIZATION_PATTERNS.JS_EVENTS, '')
      .replace(SANITIZATION_PATTERNS.JS_PROTOCOLS, '');

    logger.debug('🧼 HTML Sanitized:', { original: input.length, sanitized: sanitized.length });
    return sanitized;
  }

  /**
   * Strip all HTML tags
   */
  static stripHtml(input) {
    if (typeof input !== 'string') return '';

    const stripped = input.replace(SANITIZATION_PATTERNS.HTML_TAGS, '');
    logger.debug('🏷️ HTML Stripped:', { original: input.length, stripped: stripped.length });
    return stripped;
  }

  /**
   * Sanitize for database storage
   */
  static sanitizeForDB(input) {
    if (typeof input !== 'string') return '';

    const sanitized = input
      .replace(SANITIZATION_PATTERNS.SQL_KEYWORDS, '')
      .replace(SANITIZATION_PATTERNS.SQL_COMMENTS, '')
      .trim();

    logger.debug('🗃️ DB Sanitized:', { original: input.length, sanitized: sanitized.length });
    return sanitized;
  }

  /**
   * Escape special characters
   */
  static escapeSpecialChars(input) {
    if (typeof input !== 'string') return '';

    const escaped = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return escaped;
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName) {
    if (typeof fileName !== 'string') return '';

    const sanitized = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.{2,}/g, '.')
      .slice(0, 255);

    logger.debug('📁 Filename Sanitized:', { original: fileName, sanitized });
    return sanitized;
  }
}

/**
 * Input Validator Class
 */
class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (typeof email !== 'string') return false;

    const isValid = SANITIZATION_PATTERNS.EMAIL_PATTERN.test(email) && email.length <= 254;
    logger.debug('📧 Email Validation:', { email, isValid });
    return isValid;
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    if (typeof phone !== 'string') return false;

    const cleaned = phone.replace(/[\s\-()]/g, '');
    const isValid = SANITIZATION_PATTERNS.PHONE_PATTERN.test(cleaned);
    logger.debug('📱 Phone Validation:', { phone, cleaned, isValid });
    return isValid;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    if (typeof password !== 'string') {
      return { isValid: false, errors: ['Password must be a string'] };
    }

    const errors = [];

    if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`);
    }

    if (password.length > VALIDATION_RULES.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must not exceed ${VALIDATION_RULES.MAX_PASSWORD_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    const result = { isValid: errors.length === 0, errors };
    logger.debug('🔐 Password Validation:', { length: password.length, isValid: result.isValid });
    return result;
  }

  /**
   * Validate Turkish text
   */
  static isValidTurkishText(text, minLength = 1, maxLength = 1000) {
    if (typeof text !== 'string') return false;

    const isValid =
      text.length >= minLength &&
      text.length <= maxLength &&
      SANITIZATION_PATTERNS.TURKISH_TEXT.test(text);

    logger.debug('🇹🇷 Turkish Text Validation:', { text: text.substring(0, 50), isValid });
    return isValid;
  }

  /**
   * Validate numeric input
   */
  static isValidNumber(value, min = null, max = null) {
    const num = parseFloat(value);

    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;

    logger.debug('🔢 Number Validation:', { value, num, min, max, isValid: true });
    return true;
  }

  /**
   * Validate price
   */
  static isValidPrice(price) {
    return this.isValidNumber(price, VALIDATION_RULES.MIN_PRICE, VALIDATION_RULES.MAX_PRICE);
  }

  /**
   * Validate quantity
   */
  static isValidQuantity(quantity) {
    const num = parseInt(quantity);
    return Number.isInteger(num) &&
      num >= VALIDATION_RULES.MIN_QUANTITY &&
      num <= VALIDATION_RULES.MAX_QUANTITY;
  }

  /**
   * Validate file upload
   */
  static validateFile(file, allowedTypes = VALIDATION_RULES.ALLOWED_IMAGE_TYPES) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      errors.push(`File size must not exceed ${VALIDATION_RULES.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    const result = { isValid: errors.length === 0, errors };
    logger.debug('📎 File Validation:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isValid: result.isValid
    });
    return result;
  }

  /**
   * Validate date
   */
  static isValidDate(dateString) {
    if (typeof dateString !== 'string') return false;

    const date = new Date(dateString);
    const isValid = !isNaN(date.getTime()) &&
      SANITIZATION_PATTERNS.DATE_ISO.test(dateString);

    logger.debug('📅 Date Validation:', { dateString, isValid });
    return isValid;
  }
}

/**
 * Form Validation Service
 */
class FormValidationService {
  /**
   * Validate user registration form
   */
  static validateUserRegistration(data) {
    const errors = {};

    // Name validation
    if (!data.name || !InputValidator.isValidTurkishText(data.name, 2, 50)) {
      errors.name = 'İsim 2-50 karakter arası olmalı ve geçerli karakterler içermeli';
    }

    // Email validation
    if (!data.email || !InputValidator.isValidEmail(data.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Password validation
    const passwordValidation = InputValidator.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }

    // Phone validation
    if (data.phone && !InputValidator.isValidPhone(data.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    const result = { isValid: Object.keys(errors).length === 0, errors };
    logger.debug('👤 User Registration Validation:', result);
    return result;
  }

  /**
   * Validate product form
   */
  static validateProduct(data) {
    const errors = {};

    // Name validation
    if (!data.name || !InputValidator.isValidTurkishText(data.name, 2, 100)) {
      errors.name = 'Ürün adı 2-100 karakter arası olmalı';
    }

    // Price validation
    if (!data.price || !InputValidator.isValidPrice(data.price)) {
      errors.price = `Fiyat ${VALIDATION_RULES.MIN_PRICE}-${VALIDATION_RULES.MAX_PRICE} arasında olmalı`;
    }

    // Stock validation
    if (data.stock !== undefined && !InputValidator.isValidQuantity(data.stock)) {
      errors.stock = 'Stok miktarı geçerli bir sayı olmalı';
    }

    // Description validation
    if (data.description && data.description.length > VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
      errors.description = `Açıklama ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} karakterden fazla olamaz`;
    }

    const result = { isValid: Object.keys(errors).length === 0, errors };
    logger.debug('🛍️ Product Validation:', result);
    return result;
  }

  /**
   * Validate order form
   */
  static validateOrder(data) {
    const errors = {};

    // Items validation
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.items = 'Sipariş en az 1 ürün içermeli';
    } else {
      data.items.forEach((item, index) => {
        if (!item.productId) {
          errors[`items.${index}.productId`] = 'Ürün ID gerekli';
        }
        if (!InputValidator.isValidQuantity(item.quantity)) {
          errors[`items.${index}.quantity`] = 'Geçerli bir miktar giriniz';
        }
      });
    }

    // Address validation
    if (data.address && data.address.length > VALIDATION_RULES.MAX_ADDRESS_LENGTH) {
      errors.address = `Adres ${VALIDATION_RULES.MAX_ADDRESS_LENGTH} karakterden fazla olamaz`;
    }

    const result = { isValid: Object.keys(errors).length === 0, errors };
    logger.debug('📦 Order Validation:', result);
    return result;
  }
}

/**
 * Security Monitor Service
 */
class SecurityMonitorService {
  static suspiciousPatterns = [];
  static securityViolations = [];

  /**
   * Monitor for suspicious input patterns
   */
  static monitorInput(input, context = 'unknown') {
    const violations = [];

    // Check for XSS patterns
    if (SANITIZATION_PATTERNS.SCRIPT_TAGS.test(input)) {
      violations.push('Script tag injection attempt');
    }

    if (SANITIZATION_PATTERNS.JS_EVENTS.test(input)) {
      violations.push('JavaScript event injection attempt');
    }

    // Check for SQL injection patterns
    if (SANITIZATION_PATTERNS.SQL_KEYWORDS.test(input)) {
      violations.push('SQL injection attempt');
    }

    // Log violations
    if (violations.length > 0) {
      const violation = {
        timestamp: new Date().toISOString(),
        context,
        input: input.substring(0, 100), // Log first 100 chars only
        violations,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      };

      this.securityViolations.push(violation);
      logger.error('🚨 Security Violation Detected:', violation);

      // Alert if too many violations
      if (this.securityViolations.length > 10) {
        logger.error('🚨 Multiple Security Violations - Potential Attack');
      }
    }

    return violations;
  }

  /**
   * Get security report
   */
  static getSecurityReport() {
    return {
      totalViolations: this.securityViolations.length,
      recentViolations: this.securityViolations.slice(-10),
      patterns: this.suspiciousPatterns
    };
  }
}

export {
  FormValidationService, InputSanitizer,
  InputValidator, SANITIZATION_PATTERNS, SecurityMonitorService, VALIDATION_RULES
};

export default {
  InputSanitizer,
  InputValidator,
  FormValidationService,
  SecurityMonitorService,
  SANITIZATION_PATTERNS,
  VALIDATION_RULES
};
