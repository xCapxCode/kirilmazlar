import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';

const RolYonetimiModali = ({ role, onClose, onSave }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    id: role?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Rol adı boş olamaz');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const roleData = {
        ...role,
        ...formData,
        id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '_')
      };
      
      await onSave(roleData);
      showSuccess(`Rol başarıyla ${role ? 'güncellendi' : 'oluşturuldu'}`);
      onClose();
    } catch (error) {
      console.error('Rol işlemi hatası:', error);
      showError(`Rol ${role ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu`);
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
              {role ? 'Rol Düzenle' : 'Yeni Rol'}
            </h2>
            {role && (
              <p className="text-gray-600 mt-1">{role.name}</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Rol Adı
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                Rol ID (Opsiyonel)
              </label>
              <input
                id="id"
                name="id"
                type="text"
                value={formData.id}
                onChange={handleChange}
                placeholder="Boş bırakılırsa otomatik oluşturulur"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Rol ID'si boş bırakılırsa rol adından otomatik oluşturulur.
              </p>
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
              disabled={isSubmitting || !formData.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{role ? 'Güncelle' : 'Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolYonetimiModali;