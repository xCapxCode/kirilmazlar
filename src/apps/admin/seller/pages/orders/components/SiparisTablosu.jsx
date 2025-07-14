import React from 'react';
import Icon from '../../../components/AppIcon';

const SiparisTablosu = ({ orders, onOrderDetail, onStatusUpdate }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: 'Clock'
        };
      case 'Onaylandı':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: 'CheckCircle'
        };
      case 'Hazırlanıyor':
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: 'Package'
        };
      case 'Teslim Edildi':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: 'Truck'
        };
      case 'İptal':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: 'X'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: 'AlertCircle'
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon name="ShoppingCart" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
          <p className="text-gray-600">Henüz sipariş bulunmuyor veya filtrelerinizi değiştirin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Sipariş</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Müşteri</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Tarih</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Tutar</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Durum</th>
                <th className="text-right px-6 py-4 font-medium text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.itemCount} ürün</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <Icon name={statusInfo.icon} size={12} className="mr-1" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOrderDetail(order)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detaylar"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => onStatusUpdate(order)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Durum Güncelle"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          
          return (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                  <Icon name={statusInfo.icon} size={12} className="mr-1" />
                  {order.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">{order.itemCount} ürün</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOrderDetail(order)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Icon name="Eye" size={16} />
                  </button>
                  <button
                    onClick={() => onStatusUpdate(order)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Icon name="Edit" size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiparisTablosu; 