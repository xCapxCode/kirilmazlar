import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TopluIslemDropdown = ({ selectedCount, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'activate',
      label: 'Aktif Yap',
      icon: 'CheckCircle',
      color: 'text-green-600'
    },
    {
      id: 'deactivate',
      label: 'Pasif Yap',
      icon: 'XCircle',
      color: 'text-orange-600'
    },
    {
      id: 'delete',
      label: 'Sil',
      icon: 'Trash2',
      color: 'text-red-600'
    }
  ];

  const handleAction = (actionId) => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>{selectedCount} seçili</span>
        <Icon name="ChevronDown" size={16} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${action.color}`}
                >
                  <Icon name={action.icon} size={16} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopluIslemDropdown; 
