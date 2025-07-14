import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const BulkActionsDropdown = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
    { id: 'activate', label: 'Activate Selected', icon: 'CheckCircle', color: 'text-success' },
    { id: 'deactivate', label: 'Deactivate Selected', icon: 'XCircle', color: 'text-warning' },
    { id: 'delete', label: 'Delete Selected', icon: 'Trash2', color: 'text-error' },
    { id: 'export', label: 'Export Selected', icon: 'Download', color: 'text-primary' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (actionId) => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
      >
        <Icon name="MoreHorizontal" size={16} />
        <span className="hidden sm:inline">Bulk Actions</span>
        <Icon name="ChevronDown" size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-elevated z-50">
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-background transition-smooth ${action.color}`}
              >
                <Icon name={action.icon} size={16} />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionsDropdown;