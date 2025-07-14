import React from 'react';
import Icon from '@shared/components/AppIcon';

const OrderTrackingModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  // Durum renk ve ikon eşleştirmesi
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'text-yellow-600 bg-yellow-100 border-yellow-300', icon: 'Clock', text: 'Beklemede' },
      confirmed: { color: 'text-blue-600 bg-blue-100 border-blue-300', icon: 'CheckCircle', text: 'Onaylandı' },
      preparing: { color: 'text-orange-600 bg-orange-100 border-orange-300', icon: 'Package', text: 'Hazırlanıyor' },
      out_for_delivery: { color: 'text-purple-600 bg-purple-100 border-purple-300', icon: 'Truck', text: 'Yolda' },
      delivered: { color: 'text-green-600 bg-green-100 border-green-300', icon: 'CheckCircle2', text: 'Teslim Edildi' },
      cancelled: { color: 'text-red-600 bg-red-100 border-red-300', icon: 'XCircle', text: 'İptal Edildi' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(order.status);

  // Timeline verisi - varsayılan timeline oluştur
  const defaultTimeline = [
    { status: "confirmed", time: null, completed: false, label: "Sipariş Onaylandı" },
    { status: "preparing", time: null, completed: false, label: "Hazırlanıyor" },
    { status: "out_for_delivery", time: null, completed: false, label: "Kargoya Verildi" },
    { status: "delivered", time: null, completed: false, label: "Teslim Edildi" }
  ];

  // Order'dan gelen timeline varsa kullan, yoksa varsayılanı kullan
  const timeline = order.timeline || defaultTimeline;

  // Mevcut duruma göre timeline'ı güncelle
  const statusOrder = ["confirmed", "preparing", "out_for_delivery", "delivered"];
  const currentIndex = statusOrder.indexOf(order.status);

  const updatedTimeline = timeline.map((item, index) => {
    if (currentIndex >= index) {
      return { ...item, completed: true, time: item.time || new Date() };
    }
    return item;
  });

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sipariş Takibi</h2>
            <p className="text-gray-600 mt-1">{order.id || order.orderNumber}</p>
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
          {/* Mevcut Durum */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-full ${statusInfo.color}`}>
                <Icon name={statusInfo.icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{statusInfo.text}</h3>
                <p className="text-gray-600">Sipariş Tarihi: {formatDate(order.date || order.createdAt)}</p>
              </div>
            </div>
            
            {order.estimatedDelivery && (
              <p className="text-sm text-gray-600">
                Tahmini Teslimat: {formatDate(order.estimatedDelivery)}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Sipariş Aşamaları</h4>
            <div className="space-y-4">
              {updatedTimeline.map((step, index) => (
                <div key={step.status} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.completed 
                        ? 'bg-green-100 border-green-500 text-green-600' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < updatedTimeline.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h5 className={`font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h5>
                    {step.completed && step.time && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(step.time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sipariş Detayları */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h4>
            
            <div className="space-y-4">
              {/* Teslimat Adresi */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Teslimat Adresi</h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {order.deliveryAddress || 'Adres bilgisi mevcut değil'}
                </p>
              </div>

              {/* Sipariş Özeti */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Sipariş Özeti</h5>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{order.itemCount || order.items?.length || 0} ürün</span>
                    <span className="font-semibold text-gray-900">
                      ₺{order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notlar */}
              {order.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Sipariş Notu</h5>
                  <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    {order.notes}
                  </p>
                </div>
              )}
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
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={() => {
                // İptal etme işlemi burada yapılabilir
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Siparişi İptal Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
