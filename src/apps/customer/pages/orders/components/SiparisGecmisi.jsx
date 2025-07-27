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
      
      if (!customerId) {
        console.log('⚠️  Customer ID yok, siparişler yüklenemez');
        setOrders([]);
        return;
      }
      
      // Tüm siparişleri al ve debug et
      const allOrders = await storage.get('customer_orders', []);
      console.log('🔍 SiparisGecmisi DEBUG - Tüm orders:', allOrders);
      console.log('🔍 SiparisGecmisi DEBUG - Customer ID:', customerId);
      
      // OrderService kullanarak müşteriye özel siparişleri yükle
      const customerOrders = await orderService.getByCustomerId(customerId);
      console.log('🔍 SiparisGecmisi DEBUG - Filtered orders:', customerOrders);
      
      setOrders(customerOrders);
      console.log(`✅ Customer ${customerId} için ${customerOrders.length} sipariş yüklendi`);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      showError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [customerId, showError]);

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
            <div key={order.id} className="bg-slate-100 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Order Header - Compact Design */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' ? 'Beklemede' : 
                       order.status === 'confirmed' ? 'Onaylandı' : 
                       order.status === 'preparing' ? 'Hazırlanıyor' : 
                       order.status === 'delivered' ? 'Teslim Edildi' : 
                       order.status === 'cancelled' ? 'İptal Edildi' : order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} ürün
                    </p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="flex items-center space-x-2 mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Icon name="Clock" size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Tahmini Teslimat
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    09.07.2025 04:14
                  </span>
                </div>

                {/* Product Images Row - Horizontal Layout */}
                <div className="flex items-center space-x-3 mb-4">
                  {order.items && order.items.length > 0 ? (
                    <>
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="Package" size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium">
                          {order.items[0]?.name || order.items[0]?.productName}
                          {order.items.length > 1 && `, ${order.items[1]?.name || order.items[1]?.productName}`}
                          {order.items.length > 2 && order.items.length > 3 && `, ...`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon name="Package" size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Detaylar
                  </button>
                  {canCancel(order) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
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