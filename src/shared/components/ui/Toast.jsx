import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-orange-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-green-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'Check';
      case 'error':
        return 'X';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Check';
    }
  };

  return (
    <div
      className={`fixed top-20 md:top-36 right-4 z-[250] max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getToastStyles()} rounded-lg shadow-lg p-4`}>
        <div className="flex items-center space-x-3">
          <Icon name={getIcon()} size={20} />
          <p className="text-sm font-medium flex-1">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 
