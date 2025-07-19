import React from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';

const SiparisDetayModali = ({ order, onClose, onStatusUpdate }) => {
  // Debug: Log order data to understand structure
  console.log('Order data in modal:', order);
  const { showSuccess, showError } = useNotification();

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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Beklemede':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'Clock' };
      case 'Onaylandı':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'CheckCircle' };
      case 'Hazırlanıyor':
        return { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'Package' };
      case 'Teslim Edildi':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: 'Truck' };
      case 'İptal':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: 'X' };
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: 'AlertCircle' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sipariş Detayları</h2>
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
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sipariş Bilgileri */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Bilgileri</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sipariş No:</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      <Icon name={statusInfo.icon} size={12} className="mr-1" />
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sipariş Tarihi:</span>
                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  
                  {order.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güncelleme:</span>
                      <span className="font-medium">{formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ürün Sayısı:</span>
                    <span className="font-medium">{order.items?.length || 0} adet</span>
                  </div>
                  
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-900 font-semibold">Toplam:</span>
                    <span className="font-bold text-green-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Bilgileri</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Soyad:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">E-posta:</span>
                    <span className="font-medium">{order.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              {order.deliveryAddress && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Teslimat Adresi</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.deliveryAddress}</p>
                </div>
              )}

              {/* Notlar */}
              {order.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Notu</h3>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Ürün Listesi */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Ürünleri</h3>
              
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName || item.name || 'Ürün'}</h4>
                          <p className="text-sm text-gray-600">
                            {item.quantity || 1} {item.unit || 'adet'} × {formatCurrency(item.price || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.total || (item.quantity * item.price) || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Package" size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Bu siparişte ürün bilgisi bulunamadı</p>
                  </div>
                )}
                
                {/* Toplam */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Genel Toplam:</span>
                    <span className="text-green-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={onStatusUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="Edit" size={16} />
            <span>Durum Güncelle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiparisDetayModali; 