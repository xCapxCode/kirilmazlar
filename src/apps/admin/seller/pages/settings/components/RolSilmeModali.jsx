import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';

const RolSilmeModali = ({ role, onClose, onDelete }) => {
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (confirmText !== role.name) {
      showError('Rol adını doğru girmelisiniz');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onDelete(role.id);
      showSuccess('Rol başarıyla silindi');
      onClose();
    } catch (error) {
      console.error('Rol silme hatası:', error);
      showError('Rol silinirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rol Sil</h2>
            <p className="text-gray-600 mt-1">{role.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Dikkat!</p>
                  <p>Bu rolü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bu role sahip kullanıcılar varsayılan role atanacaktır.</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-1">
                Onaylamak için "{role.name}" yazın
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || confirmText !== role.name}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Rolü Sil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolSilmeModali;