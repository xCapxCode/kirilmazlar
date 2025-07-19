import React, { createContext, useContext, useState, useCallback } from 'react';
import Icon from '@shared/components/AppIcon';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Confirm Modal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Onayla', cancelText = 'İptal', type = 'warning' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'info':
        return {
          icon: 'Info',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default: // warning
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Icon name={styles.icon} size={24} className={styles.iconColor} />
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Onay Gerekli'}
            </h3>
          </div>
          
          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {message}
          </p>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prompt Modal Component
const PromptModal = ({ isOpen, title, message, placeholder, onConfirm, onCancel, confirmText = 'Onayla', cancelText = 'İptal' }) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Icon name="Edit" size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Bilgi Girişi'}
            </h3>
          </div>
          
          {message && (
            <p className="text-gray-700 mb-4">
              {message}
            </p>
          )}
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
          
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModalProvider = ({ children }) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Onayla',
    cancelText: 'İptal',
    type: 'warning'
  });

  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Onayla',
    cancelText: 'İptal'
  });

  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title: options.title || 'Onay Gerekli',
        message,
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const showPrompt = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setPromptModal({
        isOpen: true,
        title: options.title || 'Bilgi Girişi',
        message,
        placeholder: options.placeholder || '',
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        onConfirm: (value) => {
          setPromptModal(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        },
        onCancel: () => {
          setPromptModal(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        }
      });
    });
  }, []);

  const hideModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setPromptModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    showConfirm,
    showPrompt,
    hideModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />
      
      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        message={promptModal.message}
        placeholder={promptModal.placeholder}
        onConfirm={promptModal.onConfirm}
        onCancel={promptModal.onCancel}
        confirmText={promptModal.confirmText}
        cancelText={promptModal.cancelText}
      />
    </ModalContext.Provider>
  );
};