import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';

const DurumGuncellemeModali = ({ order, onClose, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Beklemede', label: 'Beklemede', icon: 'Clock', color: 'text-yellow-600' },
    { value: 'Onaylandı', label: 'Onaylandı', icon: 'CheckCircle', color: 'text-blue-600' },
    { value: 'Hazırlanıyor', label: 'Hazırlanıyor', icon: 'Package', color: 'text-orange-600' },
    { value: 'Teslim Edildi', label: 'Teslim Edildi', icon: 'Truck', color: 'text-green-600' },
    { value: 'İptal', label: 'İptal', icon: 'X', color: 'text-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(order.id, selectedStatus, notes);
      onClose(); // Modal'ı kapat
    } catch (error) {
      console.error('Status update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(opt => opt.value === selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sipariş Durumu Güncelle</h2>
            <p className="text-gray-600 mt-1">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Mevcut Durum */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Durum
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={statusOptions.find(opt => opt.value === order.status)?.icon || 'AlertCircle'} 
                  size={16} 
                  className={statusOptions.find(opt => opt.value === order.status)?.color || 'text-gray-600'} 
                />
                <span className="font-medium">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Yeni Durum */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yeni Durum Seçin
            </label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center space-x-2">
                    <Icon name={status.icon} size={16} className={status.color} />
                    <span className="text-sm font-medium text-gray-900">{status.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Not */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Not (İsteğe Bağlı)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Durum değişikliği hakkında not ekleyin..."
            />
          </div>

          {/* Özet */}
          {selectedStatus !== order.status && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Durum Değişikliği Özeti</span>
              </div>
              <div className="text-sm text-blue-700">
                <div className="flex items-center justify-between">
                  <span>{order.status}</span>
                  <Icon name="ArrowRight" size={16} />
                  <span className="font-medium">{selectedStatus}</span>
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
              disabled={isSubmitting || selectedStatus === order.status}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Güncelle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DurumGuncellemeModali; 