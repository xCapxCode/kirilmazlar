import React from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import Icon from '../AppIcon';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'AlertCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center p-4 rounded-lg border shadow-lg min-w-80 max-w-md
            transform transition-all duration-300 ease-in-out
            ${getNotificationColors(notification.type)}
          `}
        >
          <Icon 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            className="flex-shrink-0 mr-3" 
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-words">
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
