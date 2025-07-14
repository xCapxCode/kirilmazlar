import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const StatusUpdateModal = ({ order, onConfirm, onCancel }) => {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Confirmed':
        return {
          icon: 'CheckCircle',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: 'Siparişi Onayla',
          description: 'Bu siparişi onaylanmış olarak işaretle ve hazırlık için hazırla.',
          defaultNote: 'Sipariş onaylandı ve kısa sürede hazırlanacak.'
        };
      case 'Preparing':
        return {
          icon: 'Package',
          color: 'text-accent',
          bgColor: 'bg-accent/5',
          title: 'Hazırlığa Başla',
          description: 'Sipariş ürünlerini teslimat için hazırlamaya başla.',
          defaultNote: 'Sipariş ürünleri hazırlanmaya başlandı.'
        };
      case 'Delivered':
        return {
          icon: 'Truck',
          color: 'text-success',
          bgColor: 'bg-success/5',
          title: 'Teslim Edildi Olarak İşaretle',
          description: 'Siparişin başarıyla teslim edildiğini onayla.',
          defaultNote: 'Sipariş müşteriye başarıyla teslim edildi.'
        };
      default:
        return {
          icon: 'AlertCircle',
          color: 'text-text-secondary',
          bgColor: 'bg-background',
          title: 'Durumu Güncelle',
          description: 'Sipariş durumunu güncelle.',
          defaultNote: ''
        };
    }
  };

  const statusInfo = getStatusInfo(order.newStatus);

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirm();
    setIsLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-1001 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-elevated max-w-md w-full">
        {/* Header */}
        <div className={`${statusInfo.bgColor} p-6 rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
              <Icon name={statusInfo.icon} size={24} className={statusInfo.color} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{statusInfo.title}</h2>
              <p className="text-text-secondary text-sm">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-background rounded-lg p-4 mb-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-medium text-text-primary">{order.id}</span>
              <span className="text-sm text-text-secondary">{order.itemCount} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">{order.customerName}</span>
              <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Change */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                order.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' :
                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                order.status === 'Preparing'? 'bg-accent/10 text-accent border-accent/20' : 'bg-success/10 text-success border-success/20'
              }`}>
                {order.status}
              </span>
            </div>
            
            <Icon name="ArrowRight" size={20} className="text-text-secondary" />
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                order.newStatus === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                order.newStatus === 'Preparing'? 'bg-accent/10 text-accent border-accent/20' : 'bg-success/10 text-success border-success/20'
              }`}>
                {order.newStatus}
              </span>
            </div>
          </div>

          {/* Note Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Not Ekle (İsteğe Bağlı)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={statusInfo.defaultNote}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth resize-none"
            />
          </div>

          {/* Warning for Delivered Status */}
          {order.newStatus === 'Delivered' && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Önemli</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Teslim edildi olarak işaretlendikten sonra bu işlem geri alınamaz. Lütfen siparişin müşteriye başarıyla teslim edildiğinden emin olun.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-background rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-smooth disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth disabled:opacity-50 ${statusInfo.color.replace('text-', 'bg-')} text-white hover:opacity-90`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Güncelleniyor...</span>
              </>
            ) : (
              <>
                <Icon name={statusInfo.icon} size={16} />
                <span>Güncellemeyi Onayla</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;