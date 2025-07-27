/**
 * Enhanced Error Boundary System
 * P2.3.3: UI/UX Enhancement - Error boundaries user-friendly messages
 * 
 * @description Production-ready error handling with user-friendly interfaces
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import React from 'react';
import Icon from '../shared/components/AppIcon';
import logger from '../utils/productionLogger';

/**
 * Error types for different scenarios
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  DATA: 'data',
  COMPONENT: 'component',
  AUTH: 'auth',
  PERMISSION: 'permission',
  GENERIC: 'generic'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Bağlantı Sorunu',
    message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    icon: 'Wifi',
    color: 'text-orange-600'
  },
  [ERROR_TYPES.DATA]: {
    title: 'Veri Yükleme Hatası',
    message: 'Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.',
    icon: 'Database',
    color: 'text-blue-600'
  },
  [ERROR_TYPES.COMPONENT]: {
    title: 'Sayfa Hatası',
    message: 'Bu sayfada beklenmeyen bir hata oluştu. Destek ekibimize bildirildi.',
    icon: 'AlertTriangle',
    color: 'text-red-600'
  },
  [ERROR_TYPES.AUTH]: {
    title: 'Oturum Sorunu',
    message: 'Oturumunuz sonlandı. Lütfen tekrar giriş yapın.',
    icon: 'Lock',
    color: 'text-yellow-600'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Erişim Reddedildi',
    message: 'Bu işlemi gerçekleştirmek için gerekli izniniz bulunmuyor.',
    icon: 'Shield',
    color: 'text-purple-600'
  },
  [ERROR_TYPES.GENERIC]: {
    title: 'Beklenmeyen Hata',
    message: 'Bir sorun oluştu. Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.',
    icon: 'AlertCircle',
    color: 'text-gray-600'
  }
};

/**
 * Enhanced Error Boundary with detailed error handling
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger error UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId;

    // Log error details
    logger.error('🚫 Error Boundary Caught Error:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      props: this.props,
      timestamp: new Date().toISOString()
    });

    // Update state with error info
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Send error to monitoring service (if available)
    this.reportError(error, errorInfo, errorId);
  }

  reportError = async (error, errorInfo, errorId) => {
    try {
      // In production, this would send to error monitoring service
      const errorReport = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: this.props.userId || 'anonymous',
        sessionId: sessionStorage.getItem('sessionId') || 'unknown'
      };

      logger.system('📊 Error Report Generated:', errorReport);

      // Store error report locally for later sync
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(errorReport);
      localStorage.setItem('errorReports', JSON.stringify(existingReports.slice(-10))); // Keep last 10

    } catch (reportingError) {
      logger.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorType = (error) => {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_TYPES.NETWORK;
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ERROR_TYPES.AUTH;
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return ERROR_TYPES.PERMISSION;
    }
    if (message.includes('data') || message.includes('parse')) {
      return ERROR_TYPES.DATA;
    }

    return ERROR_TYPES.COMPONENT;
  };

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType(this.state.error);
      const errorConfig = ERROR_MESSAGES[errorType];
      const { fallback: FallbackComponent } = this.props;

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className={`mx-auto mb-6 ${errorConfig.color}`}>
              <Icon name={errorConfig.icon} size={64} />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {errorConfig.title}
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {errorConfig.message}
            </p>

            {/* Error ID (for support) */}
            {this.state.errorId && (
              <div className="bg-gray-100 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Hata Kodu:</p>
                <code className="text-sm font-mono text-gray-700">
                  {this.state.errorId}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Retry Button */}
              <button
                onClick={this.handleRetry}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                disabled={this.state.retryCount >= 3}
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Tekrar Dene
                {this.state.retryCount > 0 && ` (${this.state.retryCount}/3)`}
              </button>

              {/* Reload Button */}
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Sayfayı Yenile
              </button>

              {/* Home Button */}
              <button
                onClick={this.handleGoHome}
                className="w-full bg-transparent text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Icon name="Home" size={16} className="mr-2" />
                Ana Sayfaya Dön
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Geliştirici Detayları
                </summary>
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-xs">
                  <pre className="whitespace-pre-wrap font-mono text-red-800">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback for smaller components
 */
export const SimpleErrorFallback = ({
  error,
  onRetry,
  className = '',
  message = 'Bir hata oluştu'
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <Icon name="AlertCircle" size={20} className="text-red-600 mr-3" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">{message}</p>
          {error && (
            <p className="text-red-600 text-sm mt-1">
              {error.message}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Network error fallback
 */
export const NetworkErrorFallback = ({ onRetry, className = '' }) => {
  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-6 text-center ${className}`}>
      <Icon name="Wifi" size={48} className="text-orange-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-orange-900 mb-2">
        Bağlantı Sorunu
      </h3>
      <p className="text-orange-700 mb-4">
        İnternet bağlantınızı kontrol edin ve tekrar deneyin.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Bağlantıyı Kontrol Et
        </button>
      )}
    </div>
  );
};

/**
 * Data loading error fallback
 */
export const DataErrorFallback = ({ onRetry, className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 text-center ${className}`}>
      <Icon name="Database" size={48} className="text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-blue-900 mb-2">
        Veri Yükleme Hatası
      </h3>
      <p className="text-blue-700 mb-4">
        Veriler yüklenirken bir sorun oluştu.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Yükle
        </button>
      )}
    </div>
  );
};

/**
 * HOC to wrap components with error boundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
