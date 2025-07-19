import React from 'react';
import Icon from '../AppIcon';

const ConfirmModal = ({ 
  title = 'Onay', 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Evet',
  cancelText = 'Hayır',
  type = 'warning' // warning, danger, info
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        };
      case 'info':
        return {
          icon: 'Info',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmText: 'text-white'
        };
      default: // warning
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white'
        };
    }
  };

  const { icon, iconColor, confirmBg, confirmText: confirmTextColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-gray-100`}>
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
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${confirmBg} ${confirmTextColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;