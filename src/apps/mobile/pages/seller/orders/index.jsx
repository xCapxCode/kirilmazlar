import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../contexts/NotificationContext';
import Icon from '../../../../../shared/components/AppIcon';
import { logger } from '../../../../../utils/productionLogger';

const MobileSellerOrders = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending'); // pending, completed, all
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedTab]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const savedOrders = storage.get('orders', []);

      // Siparişleri tarihe göre sırala (en yeni önce)
      const sortedOrders = savedOrders.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
      logger.info(`📋 Mobile seller: ${sortedOrders.length} sipariş yüklendi`);
    } catch (error) {
      logger.error('Orders loading error:', error);
      showError('Siparişler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedTab === 'pending') {
      filtered = orders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
      );
    } else if (selectedTab === 'completed') {
      filtered = orders.filter(order =>
        ['delivered', 'cancelled'].includes(order.status)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: 'mobile_seller'
          };
        }
        return order;
      });

      storage.set('orders', updatedOrders);
      setOrders(updatedOrders);
      showSuccess('Sipariş durumu güncellendi');
      setSelectedOrder(null);
    } catch (error) {
      logger.error('Order status update error:', error);
      showError('Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      'confirmed': { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
      'preparing': { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-800', icon: 'Package' },
      'out_for_delivery': { label: 'Yolda', color: 'bg-orange-100 text-orange-800', icon: 'Truck' },
      'delivered': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: 'CheckCircle2' },
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: 'XCircle' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      'pending': 'Onayla',
      'confirmed': 'Hazırlanıyor',
      'preparing': 'Kargoya Ver',
      'out_for_delivery': 'Teslim Edildi'
    };
    return labels[currentStatus];
  };

  const tabs = [
    { id: 'pending', label: 'Aktif', count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length },
    { id: 'completed', label: 'Tamamlanan', count: orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length },
    { id: 'all', label: 'Tümü', count: orders.length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative px-6 py-8 text-white">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="ShoppingBag" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Siparişlerim</h1>
            <p className="text-white/80 text-sm">
              {filteredOrders.length} sipariş
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length}
                </div>
                <div className="text-white/70 text-xs">Bekleyen</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-white/70 text-xs">Teslim</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {orders.length}
                </div>
                <div className="text-white/70 text-xs">Toplam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${selectedTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Sipariş Listesi */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-200 rounded h-4 w-24"></div>
                  <div className="bg-gray-200 rounded-full h-6 w-20"></div>
                </div>
                <div className="bg-gray-200 rounded h-3 w-32 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="ShoppingBag" size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedTab === 'pending' ? 'Aktif sipariş yok' :
                selectedTab === 'completed' ? 'Tamamlanan sipariş yok' : 'Sipariş yok'}
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'pending' ? 'Yeni siparişler geldiğinde burada görünecek' :
                'Henüz tamamlanan sipariş bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const nextStatus = getNextStatus(order.status);
              const nextStatusLabel = getNextStatusLabel(order.status);

              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  {/* Sipariş Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        #{order.orderNumber || order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Müşteri Bilgisi */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </div>

                  {/* Ürün Önizlemesi */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={item.image || '/assets/images/placeholders/product-placeholder.png'}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/assets/images/placeholders/product-placeholder.png';
                          }}
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} ürün
                    </p>
                  </div>

                  {/* Toplam ve İşlemler */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="font-bold text-green-600">
                      {formatPrice(order.total || 0)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                      >
                        Detay
                      </button>
                      {nextStatus && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium"
                        >
                          {nextStatusLabel}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sipariş Detayı
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <Icon name="X" size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Sipariş Bilgileri */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sipariş Bilgileri</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sipariş No:</span>
                      <span className="font-medium">#{selectedOrder.orderNumber || selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarih:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                        {getStatusInfo(selectedOrder.status).label}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Müşteri Bilgileri</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ad:</span>
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <span className="font-medium">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">E-posta:</span>
                      <span className="font-medium">{selectedOrder.customerEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ürünler</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={item.image || '/assets/images/placeholders/product-placeholder.png'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/assets/images/placeholders/product-placeholder.png';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.total || (item.price * item.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ödeme Özeti</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teslimat:</span>
                      <span className="font-medium">{formatPrice(selectedOrder.deliveryFee || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Toplam:</span>
                      <span className="font-bold text-green-600">{formatPrice(selectedOrder.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSellerOrders;