/**
 * XSS Prevention Components
 * P2.4.2: Security Enhancement - XSS prevention measures
 * 
 * @description React components with built-in XSS protection - Enhanced with advanced scanning
 * @author KırılmazlarPanel Development Team
 * @date July 25, 2025 - Enhanced XSS Protection
 */

import { useCallback, useEffect, useState } from 'react';
import { InputSanitizer, InputValidator, SecurityMonitorService } from '../services/securityService';
import logger from '../utils/productionLogger';
import { XSSScanner } from './XSSPreventionEnhanced';

/**
 * Secure Input Component
 */
export const SecureInput = ({
  value,
  onChange,
  onBlur,
  type = 'text',
  sanitizeHtml = true,
  validateOnChange = true,
  validationRules = {},
  className = '',
  placeholder = '',
  disabled = false,
  required = false,
  maxLength,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [validationError, setValidationError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleInputChange = useCallback((e) => {
    let inputValue = e.target.value;

    // Enhanced XSS scanning
    const xssResults = XSSScanner.scanForXSS(inputValue, 'SecureInput');
    if (!xssResults.isClean) {
      logger.warn('🚨 XSS threats detected in SecureInput:', xssResults);
      inputValue = xssResults.sanitizedInput; // Use sanitized version
    }

    // Monitor for suspicious patterns (legacy support)
    const violations = SecurityMonitorService.monitorInput(inputValue, 'SecureInput');
    if (violations.length > 0) {
      logger.warn('🚨 Suspicious input detected:', violations);
    }

    // Sanitize input if enabled
    if (sanitizeHtml && type !== 'password') {
      inputValue = InputSanitizer.sanitizeHtml(inputValue);
    }

    // Apply max length
    if (maxLength && inputValue.length > maxLength) {
      inputValue = inputValue.substring(0, maxLength);
    }

    setInternalValue(inputValue);

    // Validate on change if enabled
    if (validateOnChange && isTouched) {
      validateInput(inputValue);
    }

    // Call parent onChange
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: inputValue
        }
      });
    }
  }, [onChange, sanitizeHtml, type, maxLength, validateOnChange, isTouched]);

  const validateInput = useCallback((inputValue) => {
    let error = '';

    // Required validation
    if (required && !inputValue.trim()) {
      error = 'Bu alan zorunludur';
    }

    // Type-specific validation
    else if (inputValue) {
      switch (type) {
        case 'email':
          if (!InputValidator.isValidEmail(inputValue)) {
            error = 'Geçerli bir e-posta adresi giriniz';
          }
          break;
        case 'tel':
          if (!InputValidator.isValidPhone(inputValue)) {
            error = 'Geçerli bir telefon numarası giriniz';
          }
          break;
        case 'number':
          if (!InputValidator.isValidNumber(inputValue, validationRules.min, validationRules.max)) {
            error = 'Geçerli bir sayı giriniz';
          }
          break;
        default:
          // Custom validation rules
          if (validationRules.minLength && inputValue.length < validationRules.minLength) {
            error = `En az ${validationRules.minLength} karakter giriniz`;
          } else if (validationRules.maxLength && inputValue.length > validationRules.maxLength) {
            error = `En fazla ${validationRules.maxLength} karakter giriniz`;
          } else if (validationRules.pattern && !validationRules.pattern.test(inputValue)) {
            error = validationRules.customError || 'Geçersiz format';
          }
      }
    }

    setValidationError(error);
    return !error;
  }, [type, required, validationRules]);

  const handleBlur = useCallback((e) => {
    setIsTouched(true);
    validateInput(internalValue);

    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur, internalValue, validateInput]);

  const inputClassName = `
    ${className}
    ${validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `.trim();

  return (
    <div className="w-full">
      <input
        type={type}
        value={internalValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        {...props}
      />
      {validationError && isTouched && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
};

/**
 * Secure Textarea Component
 */
export const SecureTextarea = ({
  value,
  onChange,
  onBlur,
  sanitizeHtml = true,
  validateOnChange = true,
  maxLength = 1000,
  rows = 4,
  className = '',
  placeholder = '',
  disabled = false,
  required = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [validationError, setValidationError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    let inputValue = e.target.value;

    // Enhanced XSS scanning for textarea
    const xssResults = XSSScanner.scanForXSS(inputValue, 'SecureTextarea');
    if (!xssResults.isClean) {
      logger.warn('🚨 XSS threats detected in SecureTextarea:', xssResults);
      inputValue = xssResults.sanitizedInput; // Use sanitized version
    }

    // Monitor for suspicious patterns (legacy support)
    SecurityMonitorService.monitorInput(inputValue, 'SecureTextarea');

    // Sanitize HTML
    if (sanitizeHtml) {
      inputValue = InputSanitizer.sanitizeHtml(inputValue);
    }

    // Apply max length
    if (inputValue.length > maxLength) {
      inputValue = inputValue.substring(0, maxLength);
    }

    setInternalValue(inputValue);

    // Validate
    if (validateOnChange && isTouched) {
      const error = required && !inputValue.trim() ? 'Bu alan zorunludur' : '';
      setValidationError(error);
    }

    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: inputValue
        }
      });
    }
  }, [onChange, sanitizeHtml, maxLength, validateOnChange, isTouched, required]);

  const handleBlur = useCallback((e) => {
    setIsTouched(true);
    const error = required && !internalValue.trim() ? 'Bu alan zorunludur' : '';
    setValidationError(error);

    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur, internalValue, required]);

  const textareaClassName = `
    ${className}
    ${validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `.trim();

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={rows}
          className={textareaClassName}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...props}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {internalValue.length}/{maxLength}
        </div>
      </div>
      {validationError && isTouched && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
};

/**
 * Safe HTML Renderer Component
 */
export const SafeHtmlRenderer = ({
  content,
  allowedTags = [],
  className = '',
  fallback = 'İçerik yüklenemedi'
}) => {
  const [safeContent, setSafeContent] = useState('');

  useEffect(() => {
    if (!content) {
      setSafeContent('');
      return;
    }

    try {
      // Enhanced XSS scanning before rendering
      const xssResults = XSSScanner.scanForXSS(content, 'SafeHtmlRenderer');
      if (!xssResults.isClean) {
        logger.warn('🚨 XSS threats detected in SafeHtmlRenderer:', xssResults);
        content = xssResults.sanitizedInput; // Use sanitized version
      }

      // Monitor the content for security issues (legacy support)
      SecurityMonitorService.monitorInput(content, 'SafeHtmlRenderer');

      // Sanitize the content
      let sanitized = InputSanitizer.sanitizeHtml(content);

      // If specific tags are allowed, implement whitelist filtering
      if (allowedTags.length > 0) {
        // Simple whitelist implementation (for more complex needs, use a library like DOMPurify)
        const allowedPattern = new RegExp(`<(?!/?(?:${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
        sanitized = sanitized.replace(allowedPattern, '');
      }

      setSafeContent(sanitized);

    } catch (error) {
      logger.error('❌ SafeHtmlRenderer Error:', error);
      setSafeContent(fallback);
    }
  }, [content, allowedTags, fallback]);

  if (!safeContent) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
};

/**
 * Secure File Upload Component
 */
export const SecureFileUpload = ({
  onFileSelect,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  multiple = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validateFile = useCallback((file) => {
    const errors = [];

    // Validate file size
    if (file.size > maxSize) {
      errors.push(`Dosya boyutu ${maxSize / 1024 / 1024}MB'dan büyük olamaz`);
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`Desteklenmeyen dosya türü: ${file.type}`);
    }

    // Validate file name for security
    const safeName = InputSanitizer.sanitizeFileName(file.name);
    if (safeName !== file.name) {
      logger.warn('🚨 Suspicious filename detected:', file.name);
    }

    return { isValid: errors.length === 0, errors };
  }, [maxSize, acceptedTypes]);

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(...validation.errors);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    } else {
      setUploadError('');
      if (onFileSelect) {
        onFileSelect(multiple ? validFiles : validFiles[0]);
      }
    }
  }, [validateFile, onFileSelect, multiple]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const uploadClassName = `
    ${className}
    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${uploadError ? 'border-red-500 bg-red-50' : ''}
  `.trim();

  return (
    <div className="w-full">
      <div
        className={uploadClassName}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          id="secure-file-upload"
        />
        <label htmlFor="secure-file-upload" className="cursor-pointer">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm">
              <span className="font-medium text-blue-600">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.join(', ')} - Max {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </label>
      </div>
      {uploadError && (
        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
};

export default {
  SecureInput,
  SecureTextarea,
  SafeHtmlRenderer,
  SecureFileUpload
};
