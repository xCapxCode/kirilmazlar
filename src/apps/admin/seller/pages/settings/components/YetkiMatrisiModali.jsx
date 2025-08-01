import React, { useState, useEffect } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import authorizationService from '../../../../../../services/authorizationService';

const YetkiMatrisiModali = ({ role, onClose, onSave }) => {
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  // Tüm izinleri kategorilere ayır
  const permissionCategories = {
    dashboard: {
      name: 'Dashboard',
      permissions: [
        { id: 'dashboard:view', name: 'Dashboard Görüntüleme' }
      ]
    },
    products: {
      name: 'Ürün Yönetimi',
      permissions: [
        { id: 'products:view', name: 'Ürünleri Görüntüleme' },
        { id: 'products:create', name: 'Ürün Oluşturma' },
        { id: 'products:edit', name: 'Ürün Düzenleme' },
        { id: 'products:delete', name: 'Ürün Silme' }
      ]
    },
    orders: {
      name: 'Sipariş Yönetimi',
      permissions: [
        { id: 'orders:view', name: 'Siparişleri Görüntüleme' },
        { id: 'orders:edit', name: 'Sipariş Düzenleme' },
        { id: 'orders:process', name: 'Sipariş İşleme' },
        { id: 'orders:delete', name: 'Sipariş Silme' }
      ]
    },
    customers: {
      name: 'Müşteri Yönetimi',
      permissions: [
        { id: 'customers:view', name: 'Müşterileri Görüntüleme' },
        { id: 'customers:create', name: 'Müşteri Oluşturma' },
        { id: 'customers:edit', name: 'Müşteri Düzenleme' },
        { id: 'customers:delete', name: 'Müşteri Silme' }
      ]
    },
    settings: {
      name: 'Ayarlar',
      permissions: [
        { id: 'settings:view', name: 'Ayarları Görüntüleme' },
        { id: 'settings:edit', name: 'Ayarları Düzenleme' },
        { id: 'settings:users', name: 'Kullanıcı Yönetimi' },
        { id: 'settings:roles', name: 'Rol Yönetimi' }
      ]
    },
    customer: {
      name: 'Müşteri Paneli',
      permissions: [
        { id: 'customer:dashboard:view', name: 'Müşteri Dashboard' },
        { id: 'customer:products:view', name: 'Ürün Kataloğu Görüntüleme' },
        { id: 'customer:orders:view', name: 'Sipariş Geçmişi Görüntüleme' },
        { id: 'customer:orders:create', name: 'Sipariş Oluşturma' },
        { id: 'customer:orders:cancel', name: 'Sipariş İptal' },
        { id: 'customer:profile:view', name: 'Profil Görüntüleme' },
        { id: 'customer:profile:edit', name: 'Profil Düzenleme' }
      ]
    }
  };

  // Tüm izinleri düz liste olarak al
  useEffect(() => {
    const allPermissions = [];
    Object.values(permissionCategories).forEach(category => {
      category.permissions.forEach(permission => {
        allPermissions.push(permission);
      });
    });
    setAvailablePermissions(allPermissions);
    
    // Rol izinlerini seçili olarak işaretle
    if (role && role.permissions) {
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions(prev => {
      if (permissionId === '*') {
        // Tüm izinler seçiliyse, tümünü kaldır
        if (prev.includes('*')) {
          return [];
        }
        // Tüm izinleri seç
        return ['*'];
      }
      
      // Tüm izinler seçiliyse ve başka bir izin kaldırılıyorsa, tüm izinleri kaldır
      if (prev.includes('*')) {
        return [permissionId];
      }
      
      // İzin zaten seçiliyse kaldır, değilse ekle
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleToggleCategory = (categoryId) => {
    const categoryPermissions = permissionCategories[categoryId].permissions.map(p => p.id);
    
    setSelectedPermissions(prev => {
      // Kategorideki tüm izinler seçili mi kontrol et
      const allSelected = categoryPermissions.every(p => prev.includes(p));
      
      if (allSelected) {
        // Tümü seçiliyse, kategorideki tüm izinleri kaldır
        return prev.filter(p => !categoryPermissions.includes(p));
      } else {
        // Tümü seçili değilse, eksik olanları ekle
        const currentSet = new Set(prev);
        categoryPermissions.forEach(p => currentSet.add(p));
        return Array.from(currentSet);
      }
    });
  };

  const isCategorySelected = (categoryId) => {
    const categoryPermissions = permissionCategories[categoryId].permissions.map(p => p.id);
    return categoryPermissions.every(p => selectedPermissions.includes(p) || selectedPermissions.includes('*'));
  };

  const isPermissionSelected = (permissionId) => {
    return selectedPermissions.includes(permissionId) || selectedPermissions.includes('*');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      const updatedRole = {
        ...role,
        permissions: selectedPermissions
      };
      
      await onSave(updatedRole);
      showSuccess('Rol yetkileri başarıyla güncellendi');
      onClose();
    } catch (error) {
      logger.error('Rol güncelleme hatası:', error);
      showError('Rol yetkileri güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Yetki Matrisi</h2>
            <p className="text-gray-600 mt-1">{role?.name || 'Rol'}</p>
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
          <div className="space-y-6">
            {/* Tüm İzinler */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                id="all-permissions"
                type="checkbox"
                checked={selectedPermissions.includes('*')}
                onChange={() => handleTogglePermission('*')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="all-permissions" className="text-lg font-medium text-gray-900">
                Tüm İzinler
              </label>
            </div>

            {/* İzin Kategorileri */}
            <div className="space-y-6">
              {Object.entries(permissionCategories).map(([categoryId, category]) => (
                <div key={categoryId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Kategori Başlığı */}
                  <div 
                    className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => handleToggleCategory(categoryId)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isCategorySelected(categoryId)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </div>

                  {/* Kategori İzinleri */}
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <input
                            id={permission.id}
                            type="checkbox"
                            checked={isPermissionSelected(permission.id)}
                            onChange={() => handleTogglePermission(permission.id)}
                            disabled={selectedPermissions.includes('*')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={permission.id} className="text-sm text-gray-700">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
              <span>Yetkileri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YetkiMatrisiModali;
