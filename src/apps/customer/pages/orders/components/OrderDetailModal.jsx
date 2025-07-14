import React from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const OrderDetailModal = ({ 
  order, 
  onClose, 
  onCancel, 
  onReorder, 
  onDelete,
  getStatusColor, 
  getStatusText, 
  formatDate, 
  formatCurrency 
}) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onCancel(order.id);
    onClose();
  };

  const handleReorder = () => {
    onReorder(order);
    onClose();
  };

  const handleDelete = () => {
    onDelete(order.id);
    onClose();
  };

  const getTimelineStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Sipariş Onaylandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'out_for_delivery': return 'Yola Çıktı';
      case 'delivered': return 'Teslim Edildi';
      default: return status;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Sipariş Detayları
            </h2>
            <p className="text-sm text-text-secondary">
              {order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background transition-smooth"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 space-y-6">
            {/* Order Status */}
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-sm text-text-secondary mt-1">
                    Sipariş Tarihi: {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-text-primary">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {order.itemCount} ürün
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {order.timeline.map((step, index) => (
                  <div key={step.status} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      step.completed ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.completed ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {getTimelineStatusText(step.status)}
                      </p>
                      {step.time && (
                        <p className="text-xs text-text-secondary">
                          {formatDate(step.time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-3">
                Teslimat Bilgileri
              </h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Icon name="MapPin" size={16} className="text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Teslimat Adresi
                    </p>
                    <p className="text-sm text-text-secondary">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
                
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex items-start space-x-2">
                    <Icon name="Clock" size={16} className="text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Tahmini Teslimat
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="flex items-start space-x-2">
                    <Icon name="MessageSquare" size={16} className="text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Teslimat Notları
                      </p>
                      <p className="text-sm text-text-secondary">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-3">
                Sipariş Ürünleri
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {item.quantity} {item.unit} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-primary">
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    Toplam Tutar
                  </span>
                  <span className="font-semibold text-text-primary text-lg">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center space-x-3">
            {order.canCancel && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-smooth"
              >
                <Icon name="X" size={18} />
                <span className="font-medium">İptal Et</span>
              </button>
            )}
            
            {order.canReorder && (
              <button
                onClick={handleReorder}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
              >
                <Icon name="RotateCcw" size={18} />
                <span className="font-medium">Yeniden Sipariş</span>
              </button>
            )}

            {/* Silme butonu - her zaman göster */}
            <button
              onClick={handleDelete}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-smooth"
            >
              <Icon name="Trash2" size={18} />
              <span className="font-medium">Sil</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-text-primary rounded-lg hover:bg-gray-200 transition-smooth"
            >
              <span className="font-medium">Kapat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;