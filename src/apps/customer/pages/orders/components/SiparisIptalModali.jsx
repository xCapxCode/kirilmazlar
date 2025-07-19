import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../contexts/NotificationContext';

const SiparisIptalModali = ({ order, onClose, onCancel }) => {
  const { showSuccess, showError } = useNotification();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      showError('Lütfen iptal nedenini belirtin');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onCancel(order.id, reason);
      showSuccess('Siparişiniz başarıyla iptal edildi');
      onClose();
    } catch (error) {
      console.error('Order cancellation error:', error);
      showError('Sipariş iptal edilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Geçersiz tarih';
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const cancelReasons = [
    'Siparişi yanlışlıkla verdim',
    'Ürünleri artık istemiyorum',
    'Teslimat süresi çok uzun',
    'Ödeme yöntemini değiştirmek istiyorum',
    'Başka bir sipariş vermek istiyorum',
    'Diğer'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sipariş İptal</h2>
            <p className="text-gray-600 mt-1">{order.orderNumber}</p>
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
          {/* Sipariş Özeti */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sipariş Özeti</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sipariş No:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarih:</span>
                <span className="font-medium">{formatDate(order.orderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam:</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ürün Sayısı:</span>
                <span className="font-medium">{order.items?.length || 0} adet</span>
              </div>
            </div>
          </div>

          {/* İptal Nedeni */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İptal Nedeni
            </label>
            <div className="space-y-2 mb-4">
              {cancelReasons.map((cancelReason) => (
                <label key={cancelReason} className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={cancelReason}
                    checked={reason === cancelReason}
                    onChange={() => setReason(cancelReason)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{cancelReason}</span>
                </label>
              ))}
            </div>
            
            {reason === 'Diğer' && (
              <textarea
                value={reason === 'Diğer' ? '' : reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="İptal nedeninizi yazın..."
              />
            )}
          </div>

          {/* Uyarı */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Önemli Bilgi</p>
                <p>Siparişinizi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Siparişi İptal Et</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiparisIptalModali;