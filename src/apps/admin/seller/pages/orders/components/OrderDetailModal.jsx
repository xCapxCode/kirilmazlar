import React from 'react';
import Icon from 'components/AppIcon';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Delivered':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'Confirmed',
      'Confirmed': 'Preparing',
      'Preparing': 'Delivered'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handlePrintInvoice = () => {
    // In real app, this would generate and print invoice
    logger.info('Printing invoice for order:', order.id);
    alert('Print functionality would be implemented here');
  };

  const handleContactCustomer = () => {
    // In real app, this would open phone/email client
    window.open(`tel:${order.customerPhone}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-1000 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Order Details</h2>
            <p className="text-text-secondary font-mono text-sm mt-1">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-smooth"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Order Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-sm text-text-secondary">
                  {formatDate(order.orderDate)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleContactCustomer}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-background transition-smooth"
                >
                  <Icon name="Phone" size={16} />
                  <span className="text-sm">Contact</span>
                </button>
                
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-background transition-smooth"
                >
                  <Icon name="Printer" size={16} />
                  <span className="text-sm">Yazdır</span>
                </button>
                
                {getNextStatus(order.status) && (
                  <button
                    onClick={() => onStatusUpdate(order, getNextStatus(order.status))}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
                  >
                    <Icon name="ArrowRight" size={16} />
                    <span className="text-sm">{getNextStatus(order.status)} Olarak İşaretle</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
                <Icon name="User" size={18} />
                <span>Müşteri Bilgileri</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Ad Soyad</p>
                  <p className="font-medium text-text-primary">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Telefon</p>
                  <p className="font-medium text-text-primary">{order.customerPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary">E-posta</p>
                  <p className="font-medium text-text-primary">{order.customerEmail}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary">Teslimat Adresi</p>
                  <p className="font-medium text-text-primary whitespace-pre-line">{order.deliveryAddress}</p>
                </div>
                {order.customerNotes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-text-secondary">Müşteri Notları</p>
                    <p className="font-medium text-text-primary">{order.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
                <Icon name="Package" size={18} />
                <span>Sipariş Ürünleri ({order.itemCount})</span>
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.name}</p>
                      <p className="text-sm text-text-secondary">
                        {item.quantity} {item.unit} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-primary">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-lg font-medium text-text-primary">Toplam Tutar</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
                <Icon name="Clock" size={18} />
                <span>Durum Geçmişi</span>
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      history.status === 'Delivered' ? 'bg-success' :
                      history.status === 'Preparing' ? 'bg-accent' :
                      history.status === 'Confirmed'? 'bg-blue-500' : 'bg-warning'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary">{history.status}</span>
                        <span className="text-sm text-text-secondary">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-text-secondary mt-1">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-background">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-smooth"
          >
            Close
          </button>
          {getNextStatus(order.status) && (
            <button
              onClick={() => onStatusUpdate(order, getNextStatus(order.status))}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
            >
              Update to {getNextStatus(order.status)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
