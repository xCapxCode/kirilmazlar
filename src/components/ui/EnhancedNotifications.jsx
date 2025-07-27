/**
 * Enhanced Toast Notification System
 * P2.3.4: UI/UX Enhancement - Toast notification system enhancement
 * 
 * @description Advanced toast notifications with animations, positions, and actions
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Icon from '../../shared/components/AppIcon';
import logger from '../../utils/productionLogger';

/**
 * Toast notification types
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

/**
 * Toast positions
 */
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

/**
 * Toast durations (milliseconds)
 */
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0 // Never auto-close
};

/**
 * Enhanced Toast Component
 */
const EnhancedToast = ({
  toast,
  onClose,
  position = TOAST_POSITIONS.TOP_RIGHT
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-close timer
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Animation duration
  }, [toast.id, onClose]);

  const getTypeConfig = () => {
    const configs = {
      [TOAST_TYPES.SUCCESS]: {
        icon: 'CheckCircle',
        bgClass: 'bg-green-50 border-green-200',
        iconClass: 'text-green-600',
        textClass: 'text-green-800',
        progressClass: 'bg-green-500'
      },
      [TOAST_TYPES.ERROR]: {
        icon: 'AlertCircle',
        bgClass: 'bg-red-50 border-red-200',
        iconClass: 'text-red-600',
        textClass: 'text-red-800',
        progressClass: 'bg-red-500'
      },
      [TOAST_TYPES.WARNING]: {
        icon: 'AlertTriangle',
        bgClass: 'bg-yellow-50 border-yellow-200',
        iconClass: 'text-yellow-600',
        textClass: 'text-yellow-800',
        progressClass: 'bg-yellow-500'
      },
      [TOAST_TYPES.INFO]: {
        icon: 'Info',
        bgClass: 'bg-blue-50 border-blue-200',
        iconClass: 'text-blue-600',
        textClass: 'text-blue-800',
        progressClass: 'bg-blue-500'
      },
      [TOAST_TYPES.LOADING]: {
        icon: 'Loader2',
        bgClass: 'bg-gray-50 border-gray-200',
        iconClass: 'text-gray-600 animate-spin',
        textClass: 'text-gray-800',
        progressClass: 'bg-gray-500'
      }
    };
    return configs[toast.type] || configs[TOAST_TYPES.INFO];
  };

  const getPositionClasses = () => {
    const positions = {
      [TOAST_POSITIONS.TOP_RIGHT]: 'top-4 right-4',
      [TOAST_POSITIONS.TOP_LEFT]: 'top-4 left-4',
      [TOAST_POSITIONS.TOP_CENTER]: 'top-4 left-1/2 transform -translate-x-1/2',
      [TOAST_POSITIONS.BOTTOM_RIGHT]: 'bottom-4 right-4',
      [TOAST_POSITIONS.BOTTOM_LEFT]: 'bottom-4 left-4',
      [TOAST_POSITIONS.BOTTOM_CENTER]: 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions[TOAST_POSITIONS.TOP_RIGHT];
  };

  const getAnimationClasses = () => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isLeft = position.includes('left');

    if (isExiting) {
      if (isRight) return 'translate-x-full opacity-0';
      if (isLeft) return '-translate-x-full opacity-0';
      return isTop ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0';
    }

    if (!isVisible) {
      if (isRight) return 'translate-x-full opacity-0';
      if (isLeft) return '-translate-x-full opacity-0';
      return isTop ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0';
    }

    return 'translate-x-0 translate-y-0 opacity-100';
  };

  const config = getTypeConfig();

  return (
    <div
      className={`
        fixed z-50 max-w-sm w-full
        ${getPositionClasses()}
        ${getAnimationClasses()}
        transition-all duration-300 ease-in-out
      `.trim()}
    >
      <div className={`
        rounded-lg border shadow-lg p-4
        ${config.bgClass}
        backdrop-blur-sm
      `.trim()}>
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconClass}`}>
            <Icon name={config.icon} size={20} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {toast.title && (
              <h4 className={`text-sm font-medium ${config.textClass}`}>
                {toast.title}
              </h4>
            )}
            {toast.message && (
              <p className={`text-sm ${config.textClass} ${toast.title ? 'mt-1' : ''}`}>
                {toast.message}
              </p>
            )}

            {/* Action buttons */}
            {toast.actions && toast.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.();
                      if (action.closeOnClick !== false) {
                        handleClose();
                      }
                    }}
                    className={`
                      text-xs font-medium px-2 py-1 rounded
                      ${action.variant === 'primary'
                        ? `${config.textClass} bg-white bg-opacity-20 hover:bg-opacity-30`
                        : `${config.textClass} hover:underline`
                      }
                      transition-colors duration-200
                    `.trim()}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          {!toast.persistent && (
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 ml-3 ${config.textClass}
                hover:opacity-70 transition-opacity
              `.trim()}
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Progress bar for timed toasts */}
        {toast.duration > 0 && toast.showProgress !== false && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
            <div
              className={`h-full ${config.progressClass} rounded-b-lg`}
              style={{
                animation: `toast-progress ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, onClose, position }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <EnhancedToast
          key={toast.id}
          toast={toast}
          onClose={onClose}
          position={position}
        />
      ))}

      {/* Progress bar animation CSS */}
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

/**
 * Toast Manager Hook
 */
export const useToastManager = (position = TOAST_POSITIONS.TOP_RIGHT) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const toast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: TOAST_DURATIONS.MEDIUM,
      showProgress: true,
      persistent: false,
      ...toastData
    };

    setToasts(prev => [...prev, toast]);

    // Log toast for debugging
    logger.debug('🔔 Toast Added:', {
      id: toast.id,
      type: toast.type,
      title: toast.title,
      message: toast.message
    });

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    logger.debug('🗑️ Toast Removed:', id);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    logger.debug('🧹 All Toasts Cleared');
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.SUCCESS,
      title,
      message,
      duration: TOAST_DURATIONS.SHORT,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.ERROR,
      title,
      message,
      duration: TOAST_DURATIONS.LONG,
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.WARNING,
      title,
      message,
      duration: TOAST_DURATIONS.MEDIUM,
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.INFO,
      title,
      message,
      duration: TOAST_DURATIONS.MEDIUM,
      ...options
    });
  }, [addToast]);

  const showLoading = useCallback((title, message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.LOADING,
      title,
      message,
      duration: TOAST_DURATIONS.PERSISTENT,
      persistent: true,
      showProgress: false,
      ...options
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    ToastContainer: () => (
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
      />
    )
  };
};

/**
 * Enhanced Notification Context
 */
const EnhancedNotificationContext = createContext();

export const useEnhancedNotification = () => {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotification must be used within EnhancedNotificationProvider');
  }
  return context;
};

/**
 * Enhanced Notification Provider
 */
export const EnhancedNotificationProvider = ({
  children,
  position = TOAST_POSITIONS.TOP_RIGHT,
  maxToasts = 5
}) => {
  const toastManager = useToastManager(position);

  // Limit number of toasts
  useEffect(() => {
    if (toastManager.toasts.length > maxToasts) {
      const excess = toastManager.toasts.length - maxToasts;
      for (let i = 0; i < excess; i++) {
        toastManager.removeToast(toastManager.toasts[i].id);
      }
    }
  }, [toastManager.toasts.length, maxToasts, toastManager.removeToast]);

  const contextValue = {
    ...toastManager,
    // Backward compatibility methods
    showSuccess: (titleOrMessage, messageOrOptions = {}) => {
      if (typeof messageOrOptions === 'string') {
        return toastManager.showSuccess(titleOrMessage, messageOrOptions);
      }
      return toastManager.showSuccess('Başarılı!', titleOrMessage, messageOrOptions);
    },
    showError: (titleOrMessage, messageOrOptions = {}) => {
      if (typeof messageOrOptions === 'string') {
        return toastManager.showError(titleOrMessage, messageOrOptions);
      }
      return toastManager.showError('Hata!', titleOrMessage, messageOrOptions);
    },
    showWarning: (titleOrMessage, messageOrOptions = {}) => {
      if (typeof messageOrOptions === 'string') {
        return toastManager.showWarning(titleOrMessage, messageOrOptions);
      }
      return toastManager.showWarning('Uyarı!', titleOrMessage, messageOrOptions);
    }
  };

  return (
    <EnhancedNotificationContext.Provider value={contextValue}>
      {children}
      <toastManager.ToastContainer />
    </EnhancedNotificationContext.Provider>
  );
};

/**
 * HOC for enhanced notifications
 */
export const withEnhancedNotifications = (WrappedComponent) => {
  return function EnhancedNotificationWrapper(props) {
    return (
      <EnhancedNotificationProvider>
        <WrappedComponent {...props} />
      </EnhancedNotificationProvider>
    );
  };
};

export default {
  EnhancedToast,
  ToastContainer,
  useToastManager,
  useEnhancedNotification,
  EnhancedNotificationProvider,
  withEnhancedNotifications,
  TOAST_TYPES,
  TOAST_POSITIONS,
  TOAST_DURATIONS
};
