/**
 * Enhanced XSS Prevention Components
 * P2.4.2: Security Enhancement - Advanced XSS prevention measures
 * 
 * @description Enhanced React components with comprehensive XSS protection
 * @author KırılmazlarPanel Development Team  
 * @date July 25, 2025
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { InputSanitizer, SecurityMonitorService } from '../../services/securityService';
import logger from '../../utils/productionLogger';

/**
 * XSS Attack Patterns Detection
 */
const XSS_ATTACK_PATTERNS = {
  // Advanced script injection patterns
  SCRIPT_VARIATIONS: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<script[\s\S]*?>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:text\/javascript/gi
  ],

  // Event handler injections
  EVENT_HANDLERS: [
    /on\w+\s*=\s*['"]/gi,
    /on\w+\s*=\s*[^'"\s>]+/gi,
    /@import/gi,
    /expression\s*\(/gi
  ],

  // HTML injection attempts
  HTML_INJECTIONS: [
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /<form[\s\S]*?>/gi,
    /<input[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi
  ],

  // CSS injection patterns
  CSS_INJECTIONS: [
    /style\s*=\s*['"]/gi,
    /@import/gi,
    /url\s*\(/gi,
    /expression\s*\(/gi
  ]
};

/**
 * Content Security Policy Helper
 */
class CSPViolationDetector {
  static violationCount = 0;
  static maxViolations = 10;

  static reportViolation(violation) {
    this.violationCount++;

    const report = {
      timestamp: new Date().toISOString(),
      violationType: 'CSP_VIOLATION',
      blockedURI: violation.blockedURI,
      documentURI: violation.documentURI,
      originalPolicy: violation.originalPolicy,
      violatedDirective: violation.violatedDirective,
      sourceFile: violation.sourceFile,
      lineNumber: violation.lineNumber,
      columnNumber: violation.columnNumber
    };

    logger.error('🚨 CSP Violation Detected:', report);

    // Alert security monitoring service
    SecurityMonitorService.monitorInput(
      `CSP Violation: ${violation.violatedDirective}`,
      'CSPViolationDetector'
    );

    // If too many violations, trigger security alert
    if (this.violationCount > this.maxViolations) {
      logger.error('🚨 CRITICAL: Multiple CSP violations detected - Potential XSS attack');
    }

    return report;
  }
}

/**
 * Advanced XSS Scanner
 */
class XSSScanner {
  static scanForXSS(input, context = 'unknown') {
    if (typeof input !== 'string') return { isClean: true, threats: [] };

    const threats = [];
    const scanResults = {
      isClean: true,
      threats: [],
      riskLevel: 'LOW',
      sanitizedInput: input
    };

    // Scan for script injection patterns
    XSS_ATTACK_PATTERNS.SCRIPT_VARIATIONS.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'SCRIPT_INJECTION',
          pattern: `SCRIPT_VARIATION_${index}`,
          severity: 'CRITICAL',
          position: input.search(pattern)
        });
      }
    });

    // Scan for event handler injections
    XSS_ATTACK_PATTERNS.EVENT_HANDLERS.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'EVENT_HANDLER_INJECTION',
          pattern: `EVENT_HANDLER_${index}`,
          severity: 'HIGH',
          position: input.search(pattern)
        });
      }
    });

    // Scan for HTML injections
    XSS_ATTACK_PATTERNS.HTML_INJECTIONS.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'HTML_INJECTION',
          pattern: `HTML_INJECTION_${index}`,
          severity: 'MEDIUM',
          position: input.search(pattern)
        });
      }
    });

    // Scan for CSS injections
    XSS_ATTACK_PATTERNS.CSS_INJECTIONS.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'CSS_INJECTION',
          pattern: `CSS_INJECTION_${index}`,
          severity: 'MEDIUM',
          position: input.search(pattern)
        });
      }
    });

    // Determine risk level and clean status
    if (threats.length > 0) {
      scanResults.isClean = false;
      scanResults.threats = threats;

      const criticalThreats = threats.filter(t => t.severity === 'CRITICAL');
      const highThreats = threats.filter(t => t.severity === 'HIGH');

      if (criticalThreats.length > 0) {
        scanResults.riskLevel = 'CRITICAL';
      } else if (highThreats.length > 0) {
        scanResults.riskLevel = 'HIGH';
      } else {
        scanResults.riskLevel = 'MEDIUM';
      }

      // Enhanced sanitization for detected threats
      let sanitized = input;

      // Remove all detected patterns
      XSS_ATTACK_PATTERNS.SCRIPT_VARIATIONS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      XSS_ATTACK_PATTERNS.EVENT_HANDLERS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      XSS_ATTACK_PATTERNS.HTML_INJECTIONS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      XSS_ATTACK_PATTERNS.CSS_INJECTIONS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      scanResults.sanitizedInput = sanitized;

      // Log the scan results
      logger.warn(`🔍 XSS Scan Results [${context}]:`, {
        riskLevel: scanResults.riskLevel,
        threatsFound: threats.length,
        inputLength: input.length,
        sanitizedLength: sanitized.length
      });

      // Alert security monitoring
      SecurityMonitorService.monitorInput(input, `XSSScanner_${context}`);
    }

    return scanResults;
  }
}

/**
 * Enhanced Secure Input with XSS Protection
 */
export const EnhancedSecureInput = ({
  value,
  onChange,
  onBlur,
  type = 'text',
  aggressiveMode = true,
  allowedPatterns = [],
  className = '',
  placeholder = '',
  disabled = false,
  required = false,
  maxLength,
  onXSSDetected,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [xssWarning, setXssWarning] = useState('');
  const [threatLevel, setThreatLevel] = useState('LOW');
  const inputRef = useRef(null);

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleInputChange = useCallback((e) => {
    let inputValue = e.target.value;

    // Perform XSS scan
    const scanResults = XSSScanner.scanForXSS(inputValue, 'EnhancedSecureInput');

    if (!scanResults.isClean) {
      setXssWarning(`⚠️ Potansiyel güvenlik tehdidi tespit edildi (${scanResults.riskLevel})`);
      setThreatLevel(scanResults.riskLevel);

      // Use sanitized input in aggressive mode
      if (aggressiveMode) {
        inputValue = scanResults.sanitizedInput;
      }

      // Notify parent component of XSS detection
      if (onXSSDetected) {
        onXSSDetected({
          originalInput: e.target.value,
          sanitizedInput: inputValue,
          threats: scanResults.threats,
          riskLevel: scanResults.riskLevel
        });
      }

      // Blur input if critical threat detected
      if (scanResults.riskLevel === 'CRITICAL') {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }, 100);
      }

    } else {
      setXssWarning('');
      setThreatLevel('LOW');
    }

    // Apply max length
    if (maxLength && inputValue.length > maxLength) {
      inputValue = inputValue.substring(0, maxLength);
    }

    setInternalValue(inputValue);

    // Call parent onChange with sanitized value
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: inputValue
        }
      });
    }
  }, [onChange, aggressiveMode, maxLength, onXSSDetected]);

  const getThreatLevelColor = () => {
    switch (threatLevel) {
      case 'CRITICAL': return 'border-red-600 bg-red-50';
      case 'HIGH': return 'border-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const inputClassName = `
    ${className}
    ${getThreatLevelColor()}
    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
  `.trim();

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type={type}
        value={internalValue}
        onChange={handleInputChange}
        onBlur={onBlur}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        {...props}
      />

      {xssWarning && (
        <div className={`mt-2 p-2 rounded text-sm flex items-center ${threatLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
            threatLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
          }`}>
          <span className="mr-2">🛡️</span>
          {xssWarning}
        </div>
      )}
    </div>
  );
};

/**
 * XSS-Safe HTML Renderer with whitelist
 */
export const XSSSafeRenderer = ({
  content,
  allowHtml = false,
  allowedTags = ['p', 'br', 'strong', 'em', 'u'],
  allowedAttributes = ['class', 'style'],
  className = '',
  fallback = 'İçerik güvenlik kontrolünden geçemedi'
}) => {
  const [safeContent, setSafeContent] = useState('');
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    if (!content) {
      setSafeContent('');
      return;
    }

    try {
      // Perform comprehensive XSS scan
      const scanResults = XSSScanner.scanForXSS(content, 'XSSSafeRenderer');

      if (!scanResults.isClean) {
        logger.warn('🚨 XSS threats detected in content:', scanResults.threats);
        setIsSecure(false);

        // Use sanitized version
        let processedContent = scanResults.sanitizedInput;

        if (allowHtml && allowedTags.length > 0) {
          // Additional whitelist filtering
          const tagWhitelist = new RegExp(
            `<(?!\/?(?:${allowedTags.join('|')})\\b)[^>]*>`,
            'gi'
          );
          processedContent = processedContent.replace(tagWhitelist, '');
        } else {
          // Strip all HTML
          processedContent = InputSanitizer.stripHtml(processedContent);
        }

        setSafeContent(processedContent);
      } else {
        setIsSecure(true);

        if (allowHtml) {
          setSafeContent(content);
        } else {
          setSafeContent(InputSanitizer.stripHtml(content));
        }
      }

    } catch (error) {
      logger.error('❌ XSSSafeRenderer Error:', error);
      setSafeContent(fallback);
      setIsSecure(false);
    }
  }, [content, allowHtml, allowedTags, fallback]);

  if (!isSecure) {
    return (
      <div className={`${className} border border-red-300 bg-red-50 p-2 rounded`}>
        <div className="flex items-center text-red-800 text-sm">
          <span className="mr-2">🚨</span>
          Güvenlik nedeniyle içerik filtrelendi
        </div>
        <div className="mt-2 text-xs text-red-600">
          {safeContent || fallback}
        </div>
      </div>
    );
  }

  if (allowHtml && safeContent) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }

  return (
    <div className={className}>
      {safeContent}
    </div>
  );
};

/**
 * Initialize CSP violation reporting
 */
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', (e) => {
    CSPViolationDetector.reportViolation(e);
  });
}

export {
  CSPViolationDetector,
  XSS_ATTACK_PATTERNS, XSSScanner
};

export default {
  EnhancedSecureInput,
  XSSSafeRenderer,
  XSSScanner,
  CSPViolationDetector
};
