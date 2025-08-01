/**
 * Enhanced Notification Context
 * P2.3.4: UI/UX Enhancement - Toast notification system enhancement
 * 
 * @description Modern notification system with enhanced toast functionality
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import { createContext, useCallback, useContext, useState } from 'react';
import {
  EnhancedNotificationProvider,
  TOAST_DURATIONS,
  TOAST_POSITIONS,
  TOAST_TYPES,
  useEnhancedNotification
} from '../components/ui/EnhancedNotifications';
import Icon from '../shared/components/AppIcon';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Legacy Toast Notification Component (Backward Compatibility)
const ToastNotification = ({ notification, onClose }) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: 'CheckCircle',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      case 'info':
      default:
        return {
          icon: 'Info',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-4 shadow-lg max-w-sm w-full transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start space-x-3">
        <Icon name={styles.icon} size={20} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {notification.title && (
            <h4 className={`font-medium ${styles.textColor} mb-1`}>
              {notification.title}
            </h4>
          )}
          <p className={`text-sm ${styles.textColor}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

// Legacy Notification Container Component
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-4 max-w-sm pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 4}px)`,
            zIndex: 9999 - index
          }}
        >
          <ToastNotification
            notification={notification}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};

// Enhanced Notification Provider with backward compatibility
export const NotificationProvider = ({ children }) => {
  // Legacy state for backward compatibility
  const [legacyNotifications, setLegacyNotifications] = useState([]);

  // Legacy notification methods
  const addNotification = useCallback((message, type = 'info', title = null, duration = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const notification = {
      id,
      message,
      type,
      title,
      timestamp: Date.now()
    };

    setLegacyNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setLegacyNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Convenience methods (backward compatibility)
  const showSuccess = useCallback((message, title = 'Başarılı!') => {
    return addNotification(message, 'success', title, 3000);
  }, [addNotification]);

  const showError = useCallback((message, title = 'Hata!') => {
    return addNotification(message, 'error', title, 6000);
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Uyarı!') => {
    return addNotification(message, 'warning', title, 4000);
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Bilgi') => {
    return addNotification(message, 'info', title, 4000);
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setLegacyNotifications([]);
  }, []);

  const contextValue = {
    // Legacy methods
    notifications: legacyNotifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllNotifications: clearAll,
    // Enhanced methods available
    TOAST_TYPES,
    TOAST_POSITIONS,
    TOAST_DURATIONS
  };

  return (
    <EnhancedNotificationProvider position={TOAST_POSITIONS.TOP_RIGHT}>
      <NotificationContext.Provider value={contextValue}>
        {children}
        {/* Legacy notifications container */}
        <NotificationContainer
          notifications={legacyNotifications}
          onClose={removeNotification}
        />
      </NotificationContext.Provider>
    </EnhancedNotificationProvider>
  );
};

// Hook for enhanced notifications (new API)
export const useEnhancedNotifications = () => {
  try {
    return useEnhancedNotification();
  } catch {
    // Fallback to legacy if enhanced not available
    return useNotification();
  }
};

// Migration utility
export const migrateToEnhancedNotifications = (legacyNotification) => {
  const notification = useEnhancedNotifications();

  return {
    showSuccess: (message, title, options = {}) => {
      if (typeof title === 'object') {
        options = title;
        title = options.title || 'Başarılı!';
      }
      return notification.showSuccess(title || 'Başarılı!', message, options);
    },
    showError: (message, title, options = {}) => {
      if (typeof title === 'object') {
        options = title;
        title = options.title || 'Hata!';
      }
      return notification.showError(title || 'Hata!', message, options);
    },
    showWarning: (message, title, options = {}) => {
      if (typeof title === 'object') {
        options = title;
        title = options.title || 'Uyarı!';
      }
      return notification.showWarning(title || 'Uyarı!', message, options);
    },
    showInfo: (message, title, options = {}) => {
      if (typeof title === 'object') {
        options = title;
        title = options.title || 'Bilgi';
      }
      return notification.showInfo(title || 'Bilgi', message, options);
    }
  };
};

export default NotificationContext;
