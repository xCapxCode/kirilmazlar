import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import logger from '@utils/productionLogger';

const HesapDuzenlemeModali = ({ account, onClose, onSave }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    username: account?.username || '',
    email: account?.email || '',
    role: account?.role || 'Kullanıcı',
    active: account?.active !== undefined ? account.active : true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      showError('Kullanıcı adı boş olamaz');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onSave({
        ...account,
        ...formData
      });
      showSuccess('Hesap bilgileri başarıyla güncellendi');
      onClose();
    } catch (error) {
      logger.error('Hesap güncelleme hatası:', error);
      showError('Hesap bilgileri güncellenirken bir hata oluştu');
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
            <h2 className="text-xl font-semibold text-gray-900">
              {account ? 'Hesap Düzenle' : 'Yeni Hesap'}
            </h2>
            {account && (
              <p className="text-gray-600 mt-1">{account.username}</p>
            )}
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
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ana Yönetici">Ana Yönetici</option>
                <option value="Yönetici">Yönetici</option>
                <option value="Satıcı">Satıcı</option>
                <option value="Müşteri">Müşteri</option>
                <option value="Demo Müşteri">Demo Müşteri</option>
                <option value="Demo Satıcı">Demo Satıcı</option>
                <option value="Kullanıcı">Kullanıcı</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Hesap Aktif
              </label>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HesapDuzenlemeModali;
