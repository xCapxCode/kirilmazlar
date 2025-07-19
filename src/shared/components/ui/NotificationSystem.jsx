import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

// Toast bildirim bileşeni
const Toast = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 mb-3 rounded-lg shadow-lg border-l-4 animate-slideIn";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-700`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-700`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-700`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-700`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-700`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Icon name="CheckCircle" size={20} className="text-green-500" />;
      case 'error':
        return <Icon name="XCircle" size={20} className="text-red-500" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={20} className="text-yellow-500" />;
      case 'info':
        return <Icon name="Info" size={20} className="text-blue-500" />;
      default:
        return <Icon name="Bell" size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{notification.title}</h4>
        {notification.message && (
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

// Ana bildirim sistemi
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Yeni bildirim ekleme
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Max 5 bildirim
    return id;
  };

  // Bildirim kaldırma
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Tüm bildirimleri temizle
  const clearAll = () => {
    setNotifications([]);
  };

  // Global bildirim fonksiyonunu window'a ekle
  useEffect(() => {
    window.showNotification = addNotification;
    
    // Kolay kullanım için kısayollar
    window.showSuccess = (title, message) => addNotification({ type: 'success', title, message });
    window.showError = (title, message) => addNotification({ type: 'error', title, message });
    window.showWarning = (title, message) => addNotification({ type: 'warning', title, message });
    window.showInfo = (title, message) => addNotification({ type: 'info', title, message });

    return () => {
      delete window.showNotification;
      delete window.showSuccess;
      delete window.showError;
      delete window.showWarning;
      delete window.showInfo;
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] w-96 max-w-[calc(100vw-2rem)]">
      <div className="space-y-2">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
      
      {notifications.length > 1 && (
        <div className="mt-3 text-center">
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Tümünü Temizle
          </button>
        </div>
      )}
    </div>
  );
};

// CSS animasyonları için style tag
const styles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

// Stil ekleme
if (typeof document !== 'undefined' && !document.getElementById('notification-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'notification-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default NotificationSystem;
