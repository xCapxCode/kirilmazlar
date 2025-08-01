import React from 'react';
import Icon from '../AppIcon';

const AlertModal = ({ 
  title = 'Bilgi', 
  message, 
  onClose,
  closeText = 'Tamam',
  type = 'info' // info, success, warning, error
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'CheckCircle',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100'
        };
      default: // info
        return {
          icon: 'Info',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const { icon, iconColor, iconBg } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${iconBg}`}>
              <Icon name={icon} size={24} className={iconColor} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
