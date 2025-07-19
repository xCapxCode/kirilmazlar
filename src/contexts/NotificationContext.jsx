import React, { createContext, useContext, useState, useCallback } from 'react';
import Icon from '@shared/components/AppIcon';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Toast Notification Component
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

// Notification Container Component
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
      persistent: options.persistent || false
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return showNotification(message, 'success', options);
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    return showNotification(message, 'error', options);
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return showNotification(message, 'warning', options);
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return showNotification(message, 'info', options);
  }, [showNotification]);

  const value = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};