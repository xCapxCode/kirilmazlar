/**
 * Enhanced CSRF Protection Components
 * P2.4.3: Security Enhancement - Advanced CSRF protection implementation
 * 
 * @description Enhanced React components with comprehensive CSRF protection and form validation
 * @author KırılmazlarPanel Development Team  
 * @date July 25, 2025
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CSRFProtectionService, CSRF_CONFIG } from '../../services/csrfService';
import { SecurityMonitorService } from '../../services/securityService';
import logger from '../../utils/productionLogger';

/**
 * Advanced CSRF Attack Detection Patterns
 */
const CSRF_ATTACK_PATTERNS = {
  // Suspicious header patterns
  SUSPICIOUS_HEADERS: [
    /x-requested-with:\s*xmlhttprequest/gi,
    /origin:\s*null/gi,
    /referer:\s*null/gi
  ],

  // Cross-origin request indicators
  CROSS_ORIGIN_INDICATORS: [
    /^https?:\/\/(?!localhost|127\.0\.0\.1|[^.]+\.local)/i,
    /data:text\/html/gi,
    /javascript:void/gi
  ],

  // Form tampering patterns
  FORM_TAMPERING: [
    /_method\s*=\s*['"]?(post|put|delete)['"]?/gi,
    /csrf.*token.*=\s*['"]/gi,
    /authenticity.*token/gi
  ]
};

/**
 * CSRF Request Analyzer
 */
class CSRFRequestAnalyzer {
  static analyzeRequest(requestData, context = 'unknown') {
    const analysis = {
      isClean: true,
      threats: [],
      riskLevel: 'LOW',
      recommendations: []
    };

    if (!requestData) return analysis;

    const threats = [];

    // Analyze headers for suspicious patterns
    if (requestData.headers) {
      Object.entries(requestData.headers).forEach(([key, value]) => {
        const headerString = `${key}: ${value}`;

        CSRF_ATTACK_PATTERNS.SUSPICIOUS_HEADERS.forEach((pattern, index) => {
          if (pattern.test(headerString)) {
            threats.push({
              type: 'SUSPICIOUS_HEADER',
              pattern: `SUSPICIOUS_HEADER_${index}`,
              severity: 'HIGH',
              location: key,
              value: value
            });
          }
        });
      });
    }

    // Analyze origin and referer
    if (requestData.origin || requestData.referer) {
      const origin = requestData.origin || requestData.referer;

      CSRF_ATTACK_PATTERNS.CROSS_ORIGIN_INDICATORS.forEach((pattern, index) => {
        if (pattern.test(origin)) {
          threats.push({
            type: 'CROSS_ORIGIN_ATTACK',
            pattern: `CROSS_ORIGIN_${index}`,
            severity: 'CRITICAL',
            location: 'origin',
            value: origin
          });
        }
      });
    }

    // Analyze form data for tampering
    if (requestData.formData) {
      const formString = JSON.stringify(requestData.formData);

      CSRF_ATTACK_PATTERNS.FORM_TAMPERING.forEach((pattern, index) => {
        if (pattern.test(formString)) {
          threats.push({
            type: 'FORM_TAMPERING',
            pattern: `FORM_TAMPERING_${index}`,
            severity: 'HIGH',
            location: 'formData'
          });
        }
      });
    }

    // Determine risk level and clean status
    if (threats.length > 0) {
      analysis.isClean = false;
      analysis.threats = threats;

      const criticalThreats = threats.filter(t => t.severity === 'CRITICAL');
      const highThreats = threats.filter(t => t.severity === 'HIGH');

      if (criticalThreats.length > 0) {
        analysis.riskLevel = 'CRITICAL';
        analysis.recommendations.push('Immediately block request and log security incident');
      } else if (highThreats.length > 0) {
        analysis.riskLevel = 'HIGH';
        analysis.recommendations.push('Require additional authentication');
      } else {
        analysis.riskLevel = 'MEDIUM';
        analysis.recommendations.push('Monitor request closely');
      }

      // Log the analysis results
      logger.warn(`🔍 CSRF Request Analysis [${context}]:`, {
        riskLevel: analysis.riskLevel,
        threatsFound: threats.length,
        recommendations: analysis.recommendations.length
      });

      // Alert security monitoring
      SecurityMonitorService.monitorInput(
        JSON.stringify(requestData),
        `CSRFAnalyzer_${context}`
      );
    }

    return analysis;
  }
}

/**
 * Enhanced CSRF Protected Form with Request Analysis
 */
export const EnhancedCSRFProtectedForm = ({
  children,
  onSubmit,
  enableRequestAnalysis = true,
  strictMode = true,
  allowedOrigins = [],
  onCSRFThreatDetected,
  className = '',
  ...props
}) => {
  const [token, setToken] = useState(null);
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [csrfWarning, setCsrfWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    CSRFProtectionService.initialize();
    const newToken = CSRFProtectionService.generateToken();
    setToken(newToken);
  }, []);

  const analyzeFormSubmission = useCallback((formData, headers = {}) => {
    if (!enableRequestAnalysis) return { isClean: true };

    const requestData = {
      formData: Object.fromEntries(formData.entries()),
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': typeof window !== 'undefined' ? window.location.origin : null,
        'Referer': typeof window !== 'undefined' ? window.location.href : null
      },
      origin: typeof window !== 'undefined' ? window.location.origin : null,
      referer: typeof window !== 'undefined' ? window.location.href : null
    };

    return CSRFRequestAnalyzer.analyzeRequest(requestData, 'EnhancedCSRFForm');
  }, [enableRequestAnalysis]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const submittedToken = formData.get(CSRF_CONFIG.TOKEN_NAME);

      // Enhanced CSRF validation
      if (!CSRFProtectionService.validateToken(submittedToken)) {
        logger.error('❌ CSRF Token Validation Failed');
        setCsrfWarning('Güvenlik token\'ı geçersiz - Sayfa yeniden yüklenecek');
        setThreatLevel('CRITICAL');

        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      // Request analysis for additional security
      const analysisResults = analyzeFormSubmission(formData);

      if (!analysisResults.isClean) {
        setThreatLevel(analysisResults.riskLevel);
        setCsrfWarning(`Güvenlik tehdidi tespit edildi (${analysisResults.riskLevel})`);

        // Notify parent component
        if (onCSRFThreatDetected) {
          onCSRFThreatDetected({
            threats: analysisResults.threats,
            riskLevel: analysisResults.riskLevel,
            recommendations: analysisResults.recommendations
          });
        }

        // Block critical threats
        if (strictMode && analysisResults.riskLevel === 'CRITICAL') {
          logger.error('🚨 CRITICAL CSRF threat detected - Request blocked');
          alert('Kritik güvenlik tehdidi tespit edildi. İşlem iptal edildi.');
          return;
        }
      }

      // Proceed with form submission
      if (onSubmit) {
        await onSubmit(e);
      }

      // Generate new token after successful submission
      const newToken = CSRFProtectionService.generateToken();
      setToken(newToken);

    } catch (error) {
      logger.error('❌ Form submission error:', error);
      setCsrfWarning('Form gönderim hatası oluştu');
      setThreatLevel('HIGH');
    } finally {
      setIsSubmitting(false);
    }
  }, [analyzeFormSubmission, onSubmit, onCSRFThreatDetected, strictMode]);

  const getThreatLevelColor = () => {
    switch (threatLevel) {
      case 'CRITICAL': return 'border-red-600 bg-red-50';
      case 'HIGH': return 'border-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const formClassName = `
    ${className}
    ${getThreatLevelColor()}
    ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}
    transition-all duration-200
  `.trim();

  return (
    <div className="w-full">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={formClassName}
        {...props}
      >
        {/* CSRF Token Input */}
        <input
          type="hidden"
          name={CSRF_CONFIG.TOKEN_NAME}
          value={token || ''}
        />

        {/* Token Metadata for Enhanced Validation */}
        <input
          type="hidden"
          name="_csrf_timestamp"
          value={Date.now()}
        />
        <input
          type="hidden"
          name="_csrf_origin"
          value={typeof window !== 'undefined' ? window.location.origin : ''}
        />

        {children}

        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span>İşlem yapılıyor...</span>
            </div>
          </div>
        )}
      </form>

      {csrfWarning && (
        <div className={`mt-2 p-3 rounded flex items-center text-sm ${threatLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-300' :
            threatLevel === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
              'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
          <span className="mr-2">
            {threatLevel === 'CRITICAL' ? '🚨' : threatLevel === 'HIGH' ? '⚠️' : '🔍'}
          </span>
          {csrfWarning}
        </div>
      )}
    </div>
  );
};

/**
 * CSRF Protection Status Monitor Component
 */
export const CSRFProtectionMonitor = ({
  showStatistics = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [statistics, setStatistics] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const updateStatistics = useCallback(() => {
    const stats = CSRFProtectionService.getStatistics();
    setStatistics(stats);
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    updateStatistics();

    if (autoRefresh) {
      const interval = setInterval(updateStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [updateStatistics, autoRefresh, refreshInterval]);

  if (!showStatistics || !statistics) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 flex items-center">
          🛡️ CSRF Protection Status
        </h3>
        <span className="text-gray-500 text-xs">
          Son güncelleme: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="font-bold text-lg text-blue-600">{statistics.totalTokens}</div>
          <div className="text-gray-600">Toplam Token</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">{statistics.validTokens}</div>
          <div className="text-gray-600">Geçerli Token</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-orange-600">{statistics.usedTokens}</div>
          <div className="text-gray-600">Kullanılan Token</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-red-600">{statistics.expiredTokens}</div>
          <div className="text-gray-600">Süresi Geçen</div>
        </div>
      </div>

      <button
        onClick={updateStatistics}
        className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded text-sm transition-colors"
      >
        🔄 İstatistikleri Güncelle
      </button>
    </div>
  );
};

/**
 * Secure AJAX Request Component with CSRF Protection
 */
export const SecureAjaxRequest = ({
  url,
  method = 'POST',
  data = {},
  onSuccess,
  onError,
  enableAnalysis = true,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeSecureRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request with CSRF protection
      const requestOptions = CSRFProtectionService.addTokenToFetch({
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      // Analyze request if enabled
      if (enableAnalysis) {
        const analysisResults = CSRFRequestAnalyzer.analyzeRequest({
          url,
          method,
          headers: requestOptions.headers,
          data
        }, 'SecureAjaxRequest');

        if (!analysisResults.isClean && analysisResults.riskLevel === 'CRITICAL') {
          throw new Error('CSRF threat detected - Request blocked');
        }
      }

      const response = await CSRFProtectionService.secureFetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      logger.error('❌ Secure AJAX Request Failed:', err);
      setError(err.message);

      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, method, data, onSuccess, onError, enableAnalysis]);

  return (
    <div className="w-full">
      {children && children({ makeSecureRequest, isLoading, error })}

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
          <span className="mr-2">❌</span>
          {error}
        </div>
      )}
    </div>
  );
};

export {
  CSRFRequestAnalyzer,
  CSRF_ATTACK_PATTERNS
};

export default {
  EnhancedCSRFProtectedForm,
  CSRFProtectionMonitor,
  SecureAjaxRequest,
  CSRFRequestAnalyzer
};
