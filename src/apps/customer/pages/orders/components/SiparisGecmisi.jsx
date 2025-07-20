import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../contexts/NotificationContext';
import { useModal } from '../../../../../contexts/ModalContext';
import orderService from '../../../../../services/orderService';
import orderSyncUtil from '../../../../../utils/orderSyncUtil';
import storage from '@core/storage';
import SiparisIptalModali from './SiparisIptalModali';
import SiparisDetayModali from './SiparisDetayModali';

const SiparisGecmisi = ({ customerId }) => {
  const { showSuccess, showError } = useNotification();
  const { showConfirm } = useModal();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Basit test - sadece customer_orders storage'ından oku  
      const customerOrders = await storage.get('customer_orders', []);
      
      setOrders(customerOrders);
      console.log('✅ Siparişler başarıyla yüklendi:', customerOrders.length);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      showError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadOrders();
    
    // Sadece customer_orders storage'ını dinle
    const unsubscribeCustomerOrders = storage.subscribe('customer_orders', loadOrders);
    
    return () => {
      unsubscribeCustomerOrders();
    };
  }, [loadOrders]);

  const handleCancelOrder = async (orderId, reason) => {
    try {
      const updatedOrder = await orderService.cancel(orderId, reason);
      
      if (!updatedOrder) {
        throw new Error('Sipariş bulunamadı');
      }
      
      // Local state'i güncelle
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: updatedOrder.status,
                cancelReason: reason,
                updatedAt: new Date().toISOString()
              }
            : order
        )
      );
      
      showSuccess('Sipariş başarıyla iptal edildi');
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Sipariş iptal edilirken bir hata oluştu');
      return false;
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
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Onaylandı':
        return 'bg-blue-100 text-blue-800';
      case 'Hazırlanıyor':
        return 'bg-purple-100 text-purple-800';
      case 'Hazır':
        return 'bg-green-100 text-green-800';
      case 'Kargoya Verildi':
        return 'bg-indigo-100 text-indigo-800';
      case 'Teslim Edildi':
        return 'bg-gray-100 text-gray-800';
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (order) => {
    return order.status === 'Beklemede' || order.status === 'Onaylandı';
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : activeTab === 'active'
      ? orders.filter(order => !['Teslim Edildi', 'İptal Edildi'].includes(order.status))
      : orders.filter(order => ['Teslim Edildi', 'İptal Edildi'].includes(order.status));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tüm Siparişler
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Aktif Siparişler
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'completed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tamamlanan/İptal
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Icon name="RefreshCw" size={24} className="text-blue-600 animate-spin" />
            <span className="text-gray-600">Siparişler yükleniyor...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="ShoppingBag" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'Henüz sipariş vermemişsiniz.'
              : activeTab === 'active'
                ? 'Aktif siparişiniz bulunmuyor.'
                : 'Tamamlanan veya iptal edilen siparişiniz bulunmuyor.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Sipariş #{order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.items?.length || 0} ürün
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                            ) : (
                              <Icon name="Package" size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.name || item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.unit} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.total || (item.quantity * item.price))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Ürün bilgisi bulunamadı
                    </p>
                  )}

                  {order.items && order.items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      +{order.items.length - 3} daha fazla ürün
                    </p>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailModal(true);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Detaylar
                </button>
                {canCancel(order) && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowCancelModal(true);
                    }}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedOrder && (
        <SiparisIptalModali
          order={selectedOrder}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onCancel={handleCancelOrder}
        />
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <SiparisDetayModali
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onCancel={(order) => {
            setShowDetailModal(false);
            setSelectedOrder(order);
            setShowCancelModal(true);
          }}
        />
      )}
    </div>
  );
};

export default SiparisGecmisi;