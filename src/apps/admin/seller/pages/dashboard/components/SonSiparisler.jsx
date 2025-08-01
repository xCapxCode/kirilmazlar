import React from 'react';
import Icon from '@shared/components/AppIcon';

const SonSiparisler = ({ orders }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    
    const date = new Date(dateString);
    
    // Geçersiz tarih kontrolü
    if (isNaN(date.getTime())) {
      return 'Geçersiz tarih';
    }
    
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

  return (
    <div className="bg-slate-100 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
        <button 
          onClick={() => window.location.href = '/seller/orders'}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Tümünü Gör
        </button>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="ShoppingCart" size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Henüz sipariş bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <div 
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Sipariş Bilgileri */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        <Icon name={statusInfo.icon} size={12} className="mr-1" />
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Icon name="User" size={14} />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={14} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tutar */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                {/* Hızlı Aksiyonlar */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Detaylar
                  </button>
                  {order.status === 'Beklemede' && (
                    <>
                      <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                        Onayla
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                        İptal Et
                      </button>
                    </>
                  )}
                  {order.status === 'Onaylandı' && (
                    <button className="text-sm text-orange-600 hover:text-orange-800 font-medium">
                      Hazırlanıyor Yap
                    </button>
                  )}
                  {order.status === 'Hazırlanıyor' && (
                    <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                      Teslim Edildi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alt Bilgi */}
      {orders && orders.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Son {orders.length} sipariş gösteriliyor</span>
            <button 
              onClick={() => window.location.href = '/seller/orders'}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Tüm siparişleri görüntüle →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SonSiparisler; 
