import React, { useState, useEffect } from 'react';
import Icon from '@shared/components/AppIcon';

const MusteriGecmisiModali = ({ customer, onClose }) => {
  const [customerHistory, setCustomerHistory] = useState({
    orders: [],
    totalSpent: 0,
    orderCount: 0,
    averageOrderValue: 0,
    lastOrderDate: null,
    favoriteProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      loadCustomerHistory();
    }
  }, [customer]);

  const loadCustomerHistory = () => {
    try {
      // Tüm siparişleri al
      const sellerOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
      const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      
      // Bu müşterinin siparişlerini filtrele
      const allOrders = [...sellerOrders, ...customerOrders];
      const customerOrdersFiltered = allOrders.filter(order => 
        order.customerId === customer.id || 
        order.customer_id === customer.id ||
        order.customerEmail === customer.email ||
        order.customer_email === customer.email
      );

      // İstatistikleri hesapla
      const totalSpent = customerOrdersFiltered.reduce((sum, order) => 
        sum + (parseFloat(order.total_amount) || parseFloat(order.total) || 0), 0
      );
      
      const orderCount = customerOrdersFiltered.length;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
      
      // En son sipariş tarihi
      const sortedOrders = customerOrdersFiltered.sort((a, b) => 
        new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
      );
      const lastOrderDate = sortedOrders.length > 0 ? 
        (sortedOrders[0].createdAt || sortedOrders[0].created_at) : null;

      // En çok sipariş edilen ürünler
      const productCounts = {};
      customerOrdersFiltered.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productName = item.product?.name || item.name;
            if (productName) {
              productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 1);
            }
          });
        }
      });

      const favoriteProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setCustomerHistory({
        orders: sortedOrders,
        totalSpent,
        orderCount,
        averageOrderValue,
        lastOrderDate,
        favoriteProducts
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Müşteri geçmişi yüklenirken hata:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex items-center justify-center">
            <Icon name="Loader" size={24} className="animate-spin" />
            <span className="ml-2">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {customer.name} - Müşteri Geçmişi
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="ShoppingCart" size={20} className="text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-blue-600">Toplam Sipariş</p>
                  <p className="text-xl font-bold text-blue-900">{customerHistory.orderCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="DollarSign" size={20} className="text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-600">Toplam Harcama</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(customerHistory.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="TrendingUp" size={20} className="text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-purple-600">Ortalama Sipariş</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatCurrency(customerHistory.averageOrderValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="Calendar" size={20} className="text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-orange-600">Son Sipariş</p>
                  <p className="text-sm font-bold text-orange-900">
                    {customerHistory.lastOrderDate ? 
                      new Date(customerHistory.lastOrderDate).toLocaleDateString('tr-TR') : 
                      'Henüz sipariş yok'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* En Çok Sipariş Edilen Ürünler */}
          {customerHistory.favoriteProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">En Çok Sipariş Edilen Ürünler</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customerHistory.favoriteProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="font-medium text-gray-900">{product.name}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {product.count} adet
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sipariş Geçmişi */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sipariş Geçmişi</h3>
            {customerHistory.orders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Icon name="ShoppingCart" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Henüz sipariş bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerHistory.orders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          Sipariş #{order.orderNumber || order.order_number || order.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(order.total_amount || order.total || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt || order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Ürünler:</p>
                        <div className="text-sm text-gray-700">
                          {order.items.map((item, index) => (
                            <span key={index}>
                              {item.product?.name || item.name} ({item.quantity} adet)
                              {index < order.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={() => {
                // TODO: PDF raporu oluşturma
                window.showToast && window.showToast('PDF raporu özelliği yakında eklenecek', 'info');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              PDF Raporu İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusteriGecmisiModali;
