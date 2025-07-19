import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const PromptModal = ({ 
  title = 'Giriş', 
  message, 
  defaultValue = '',
  onConfirm, 
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  placeholder = '',
  type = 'text' // text, password, email
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    // Input'a otomatik focus
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Icon name="Edit" size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-4">
            {message && (
              <p className="text-gray-700 leading-relaxed mb-4">{message}</p>
            )}
            
            <input
              ref={inputRef}
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;