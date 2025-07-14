import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const OrderTable = ({ orders, onOrderSelect, onStatusUpdate }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Bekliyor':
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Onaylandı':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Hazırlanıyor':
      case 'Preparing':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Teslim Edildi':
      case 'Delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'İptal Edildi':
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Bekliyor': 'Onaylandı',
      'Pending': 'Onaylandı',
      'Onaylandı': 'Hazırlanıyor',
      'Confirmed': 'Hazırlanıyor',
      'Hazırlanıyor': 'Teslim Edildi',
      'Preparing': 'Teslim Edildi'
    };
    return statusFlow[currentStatus];
  };

  const translateStatus = (status) => {
    const translations = {
      'Pending': 'Bekliyor',
      'Confirmed': 'Onaylandı',
      'Preparing': 'Hazırlanıyor',
      'Delivered': 'Teslim Edildi',
      'Cancelled': 'İptal Edildi'
    };
    return translations[status] || status;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
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

  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="Package" size={48} className="text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Sipariş Bulunamadı</h3>
        <p className="text-text-secondary">
          Mevcut filtrelerinizle eşleşen sipariş yok. Arama kriterlerinizi değiştirmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Sipariş ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Müşteri</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Tarih</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Ürünler</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Toplam</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Durum</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-background transition-smooth">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRowExpansion(order.id)}
                        className="p-1 hover:bg-background rounded transition-smooth"
                      >
                        <Icon 
                          name={expandedRows.has(order.id) ? "ChevronDown" : "ChevronRight"} 
                          size={16} 
                          className="text-text-secondary"
                        />
                      </button>
                      <span className="font-mono text-sm font-medium text-text-primary">
                        {order.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{order.customerName}</p>
                      <p className="text-sm text-text-secondary">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-primary">
                      {formatDate(order.orderDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-primary">
                      {order.itemCount} ürün
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {translateStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOrderSelect(order)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-smooth"
                        title="Detayları Görüntüle"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => onStatusUpdate(order, getNextStatus(order.status))}
                          className="p-2 text-text-secondary hover:text-success hover:bg-success/5 rounded-lg transition-smooth"
                          title={`${translateStatus(getNextStatus(order.status))} olarak işaretle`}
                        >
                          <Icon name="ArrowRight" size={16} />
                        </button>
                      )}
                      
                      <button
                        className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-smooth"
                        title="Fatura Yazdır"
                      >
                        <Icon name="Printer" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Row Details */}
                {expandedRows.has(order.id) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 bg-background">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-text-primary mb-3">Sipariş Ürünleri</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                                <div>
                                  <p className="text-sm font-medium text-text-primary">{item.name}</p>
                                  <p className="text-xs text-text-secondary">
                                    {item.quantity} {item.unit} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <span className="text-sm font-medium text-text-primary">
                                  {formatCurrency(item.total)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-text-primary mb-3">Müşteri Bilgileri</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-text-secondary">E-posta:</span>
                              <span className="ml-2 text-text-primary">{order.customerEmail}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Telefon:</span>
                              <span className="ml-2 text-text-primary">{order.customerPhone}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Adres:</span>
                              <p className="mt-1 text-text-primary">{order.deliveryAddress}</p>
                            </div>
                            {order.customerNotes && (
                              <div>
                                <span className="text-text-secondary">Notlar:</span>
                                <p className="mt-1 text-text-primary">{order.customerNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-medium text-text-primary mb-1">
                  {order.id}
                </p>
                <p className="font-medium text-text-primary">{order.customerName}</p>
                <p className="text-sm text-text-secondary">{formatDate(order.orderDate)}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {translateStatus(order.status)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">
                {order.itemCount} ürün
              </span>
              <span className="font-medium text-text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOrderSelect(order)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-background transition-smooth"
              >
                <Icon name="Eye" size={16} />
                <span className="text-sm">Detayları Görüntüle</span>
              </button>
              
              {getNextStatus(order.status) && (
                <button
                  onClick={() => onStatusUpdate(order, getNextStatus(order.status))}
                  className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-smooth"
                >
                  <Icon name="ArrowRight" size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTable;