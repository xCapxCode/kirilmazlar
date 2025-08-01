import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';

const CustomerStatusModal = ({ customer, onClose, onUpdateStatus }) => {
  const { showError } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState(customer?.status || 'active');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedStatus === 'blocked' && !reason.trim()) {
      showError('Engelleme nedeni belirtmeniz gerekiyor');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onUpdateStatus(customer.id, selectedStatus, reason);
      onClose();
    } catch (error) {
      logger.error('Error updating customer status:', error);
      showError('Müşteri durumu güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Aktif',
          description: 'Müşteri tüm özelliklere erişebilir ve sipariş verebilir.',
          icon: 'CheckCircle',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'inactive':
        return {
          label: 'Pasif',
          description: 'Müşteri hesabı pasif durumda. Giriş yapabilir ancak sipariş veremez.',
          icon: 'Clock',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
      case 'blocked':
        return {
          label: 'Engelli',
          description: 'Müşteri hesabı engellendi. Giriş yapamaz ve hiçbir işlem gerçekleştiremez.',
          icon: 'XCircle',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'pending':
        return {
          label: 'Onay Bekliyor',
          description: 'Müşteri hesabı onay bekliyor. Sınırlı özelliklere erişebilir.',
          icon: 'AlertCircle',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      default:
        return {
          label: 'Bilinmiyor',
          description: 'Müşteri durumu belirtilmemiş.',
          icon: 'HelpCircle',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Müşteri Durumu Güncelle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Müşteri Bilgisi */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">{customer?.name}</h3>
                <p className="text-sm text-gray-500">{customer?.email}</p>
              </div>
            </div>
          </div>

          {/* Durum Seçenekleri */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Müşteri Durumu
            </label>
            <div className="space-y-3">
              {['active', 'inactive', 'blocked', 'pending'].map((status) => {
                const statusInfo = getStatusInfo(status);
                
                return (
                  <label 
                    key={status} 
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStatus === status 
                        ? `border-${statusInfo.color.split('-')[1]}-600 ${statusInfo.bgColor}` 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <Icon name={statusInfo.icon} size={16} className={statusInfo.color} />
                        <span className="font-medium text-gray-900">{statusInfo.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{statusInfo.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Engelleme Nedeni (Engelli seçilirse) */}
          {selectedStatus === 'blocked' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engelleme Nedeni
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Müşteriyi neden engellediğinizi açıklayın..."
                required
              />
            </div>
          )}

          {/* Uyarı */}
          {selectedStatus !== customer?.status && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Dikkat</p>
                  <p>Müşteri durumunu değiştirmek, müşterinin sisteme erişimini ve sipariş verme yeteneğini etkileyebilir.</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedStatus === customer?.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Durumu Güncelle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerStatusModal;
