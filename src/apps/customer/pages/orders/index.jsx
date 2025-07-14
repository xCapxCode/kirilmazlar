import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';
import Header from '../../../../shared/components/ui/Header';
import BottomTabNavigation from '../../../../shared/components/ui/BottomTabNavigation';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './components/OrderDetailModal';
import FilterModal from './components/FilterModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import { useCart } from '../../../../contexts/CartContext';
import { isDemoOrdersDisabled } from '../../../../utils/orderSyncUtils';
import KirilmazlarStorage from '../../../../core/storage';

const CustomerOrderHistory = () => {
  const { addToCart, orders } = useCart();
  const navigate = useNavigate();
  const storage = KirilmazlarStorage.getInstance();
  
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    timeRange: 'all',
    sortBy: 'newest'
  });

  // Optimized order loading function
  const loadOrders = useCallback(() => {
    const demoDisabled = isDemoOrdersDisabled();
    
    let combined;
    if (demoDisabled) {
      // Sadece gerçek siparişleri göster
      combined = [...orders];
    } else {
      // Demo siparişleri de dahil et
      const deletedDemoOrders = storage.get('deletedDemoOrders', []);
      const visibleMockOrders = mockOrders.filter(order => !deletedDemoOrders.includes(order.id));
      combined = [...orders, ...visibleMockOrders];
    }
    
    setAllOrders(combined);
    console.log('Orders loaded:', combined.length);
    return combined;
  }, [orders, storage]);

  // Demo sipariş verileri - SINIRLI miktar (infinite loop önlemek için)
  const mockOrders = [
    {
      id: "SIP-241001",
      date: new Date(Date.now() - 86400000), // 1 gün önce
      status: "delivered",
      total: 245.50,
      itemCount: 5,
      deliveryAddress: "Atatürk Caddesi No: 123, Kadıköy, İstanbul",
      estimatedDelivery: new Date(Date.now() - 43200000), // 12 saat önce
      items: [
        {
          id: 1,
          name: "Taze Domates",
          image: "/assets/images/no_image.svg",
          quantity: 2,
          unit: "kg",
          price: 18.00,
          total: 36.00
        },
        {
          id: 2,
          name: "Organik Ispanak",
          image: "/assets/images/no_image.svg",
          quantity: 1,
          unit: "demet",
          price: 12.50,
          total: 12.50
        },
        {
          id: 3,
          name: "Kırmızı Biber",
          image: "/assets/images/no_image.svg",
          quantity: 1.5,
          unit: "kg",
          price: 25.00,
          total: 37.50
        },
        {
          id: 4,
          name: "Taze Havuç",
          image: "/assets/images/no_image.svg",
          quantity: 2,
          unit: "kg",
          price: 15.00,
          total: 30.00
        },
        {
          id: 5,
          name: "Salatalık",
          image: "/assets/images/no_image.svg",
          quantity: 2,
          unit: "kg",
          price: 12.00,
          total: 24.00
        }
      ],
      timeline: [
        { status: "confirmed", time: new Date(Date.now() - 86400000), completed: true },
        { status: "preparing", time: new Date(Date.now() - 75600000), completed: true },
        { status: "out_for_delivery", time: new Date(Date.now() - 50400000), completed: true },
        { status: "delivered", time: new Date(Date.now() - 43200000), completed: true }
      ],
      canCancel: false,
      canReorder: true,
      notes: "Lütfen arka kapıya teslim edin. Zili iki kez çalın.",
      isDemo: true
    },
    {
      id: "SIP-241002",
      date: new Date(Date.now() - 3600000), // 1 saat önce
      status: "pending",
      total: 95.25,
      itemCount: 3,
      deliveryAddress: "Atatürk Caddesi No: 123, Kadıköy, İstanbul",
      estimatedDelivery: new Date(Date.now() + 86400000), // 1 gün sonra
      items: [
        {
          id: 3,
          name: "Taze Elma",
          image: "/assets/images/no_image.svg",
          quantity: 1,
          unit: "kg",
          price: 22.00,
          total: 22.00
        },
        {
          id: 4,
          name: "Olgun Muz",
          image: "/assets/images/no_image.svg",
          quantity: 1,
          unit: "demet",
          price: 18.50,
          total: 18.50
        },
        {
          id: 5,
          name: "Taze Portakal",
          image: "/assets/images/no_image.svg",
          quantity: 1,
          unit: "kg",
          price: 28.75,
          total: 28.75
        }
      ],
      timeline: [
        { status: "confirmed", time: null, completed: false },
        { status: "preparing", time: null, completed: false },
        { status: "out_for_delivery", time: null, completed: false },
        { status: "delivered", time: null, completed: false }
      ],
      canCancel: true,
      canReorder: true,
      notes: "Lütfen teslimattan önce arayın.",
      isDemo: true
    },
    {
      id: "SIP-241003",
      date: new Date(Date.now() - 172800000), // 2 gün önce
      status: "cancelled",
      total: 156.00,
      itemCount: 3,
      deliveryAddress: "Atatürk Caddesi No: 123, Kadıköy, İstanbul",
      estimatedDelivery: null,
      items: [
        {
          id: 6,
          name: "Kabak",
          image: "/assets/images/no_image.svg",
          quantity: 2,
          unit: "kg",
          price: 14.00,
          total: 28.00
        },
        {
          id: 7,
          name: "Patlıcan",
          image: "/assets/images/no_image.svg",
          quantity: 1,
          unit: "kg",
          price: 28.00,
          total: 28.00
        },
        {
          id: 8,
          name: "Soğan",
          image: "/assets/images/no_image.svg",
          quantity: 2,
          unit: "kg",
          price: 8.00,
          total: 16.00
        }
      ],
      timeline: [
        { status: "confirmed", time: null, completed: false },
        { status: "preparing", time: null, completed: false },
        { status: "out_for_delivery", time: null, completed: false },
        { status: "delivered", time: null, completed: false }
      ],
      canCancel: false,
      canReorder: true,
      notes: "Müşteri tarafından iptal edildi",
      isDemo: true
    }
  ];

  // Combine orders from context with demo orders - OPTIMIZED
  useEffect(() => {
    // Scroll'u en üste taşı
    window.scrollTo(0, 0);
    
    loadOrders();
    setLoading(false);
  }, [loadOrders]);

  // Storage event handlers and cleanup - OPTIMIZED for unified storage
  useEffect(() => {
    let refreshTimeout;

    const handleOrderStatusUpdate = (event) => {
      console.log('Order status update:', event.detail);
      
      // Toast bildirimi göster
      const toastEvent = new CustomEvent('showToast', {
        detail: { 
          message: `Sipariş ${event.detail.orderId} durumu güncellendi: ${event.detail.displayStatus}`, 
          type: 'info' 
        }
      });
      window.dispatchEvent(toastEvent);
      
      // Debounced refresh
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        setIsRefreshing(true);
        loadOrders();
        setTimeout(() => setIsRefreshing(false), 1000);
      }, 300);
    };

    const handleStorageChange = () => {
      console.log('Storage changed, refreshing orders...');
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        setIsRefreshing(true);
        loadOrders();
        setTimeout(() => setIsRefreshing(false), 1000);
      }, 300);
    };

    const handleOrderDeleted = (event) => {
      console.log('Order deleted:', event.detail.orderId);
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        setIsRefreshing(true);
        loadOrders();
        setTimeout(() => setIsRefreshing(false), 1000);
      }, 300);
    };

    // Subscribe to storage events
    const unsubscribe = storage.subscribe('customerOrders', handleStorageChange);
    
    // Window event listeners
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    window.addEventListener('newOrderStatus', handleStorageChange);
    window.addEventListener('allOrdersCleared', handleStorageChange);
    window.addEventListener('orderDeleted', handleOrderDeleted);

    return () => {
      clearTimeout(refreshTimeout);
      unsubscribe();
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate);
      window.removeEventListener('newOrderStatus', handleStorageChange);
      window.removeEventListener('allOrdersCleared', handleStorageChange);
      window.removeEventListener('orderDeleted', handleOrderDeleted);
    };
  }, [storage, loadOrders]);

  // Optimized filtering and sorting
  useEffect(() => {
    if (!allOrders.length) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...allOrders];

    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilter);
    }

    // Optimize sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    console.log('Filtered orders:', filtered.length);
  }, [allOrders, activeFilter, sortBy]);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Yenileme işlemi artık gerekmiyor çünkü CartContext otomatik güncelliyor
      setIsRefreshing(false);
    }, 1000);
  };

  // Sipariş iptal etme
  const handleCancelOrder = async (orderId) => {
    try {
      // Demo için localStorage'dan siparişi güncelle
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancel_requested', cancelRequestTime: new Date() }
          : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Toast mesajı göster
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Sipariş iptal talebi gönderildi. Satıcı onayından sonra iptal edilecek.', 
          type: 'info' 
        }
      });
      window.dispatchEvent(event);
      
      console.log('Sipariş iptal talebi gönderildi:', orderId);
    } catch (error) {
      console.error('Sipariş iptal edilirken hata:', error);
      const event = new CustomEvent('showToast', {
        detail: { message: 'Sipariş iptal edilirken hata oluştu.', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  // Yeniden sipariş verme
  const handleReorder = async (order) => {
    try {
      // Siparişteki ürünleri sepete ekle
      order.items.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          image: item.image,
          category: 'Sebzeler', // Default kategori
          stock: 50, // Demo stock
          isAvailable: true
        }, item.quantity);
      });
      
      // Toast mesajı göster
      const event = new CustomEvent('showToast', {
        detail: { 
          message: `${order.items.length} ürün sepetinize eklendi. Sipariş sayfasına yönlendiriliyorsunuz.`, 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
      
      // Sepet sayfasına yönlendir
      setTimeout(() => {
        navigate('/sepet-odeme');
      }, 1500);
      
      console.log('Yeniden sipariş verildi:', order.id);
    } catch (error) {
      console.error('Yeniden sipariş verilirken hata:', error);
      const event = new CustomEvent('showToast', {
        detail: { message: 'Yeniden sipariş verilirken hata oluştu.', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  // Sipariş takibi
  const handleTrackOrder = (orderId) => {
    const order = allOrders.find(order => order.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowTrackingModal(true);
    }
  };

  // OrderCard'dan gelen eylemler
  const handleOrderAction = (action, order) => {
    switch (action) {
      case 'cancel':
        handleCancelOrder(order.id);
        break;
      case 'reorder':
        handleReorder(order);
        break;
      case 'track':
        handleTrackOrder(order.id);
        break;
      default:
        console.log('Bilinmeyen eylem:', action);
    }
  };

  // Sipariş silme
  const handleDeleteOrder = async (orderId) => {
    const order = allOrders.find(o => o.id === orderId);
    const confirmed = window.confirm(
      `"${order?.orderNumber || orderId}" numaralı siparişi silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
    );
    
    if (confirmed) {
      try {
        // orderSyncUtils kullanarak sil (hem müşteri hem satıcı panelinden)
        const { deleteOrder } = await import('../../../../utils/orderSyncUtils');
        deleteOrder(orderId);
        
        // Demo siparişleri için ayrıca işaretle
        if (order?.isDemo) {
          const deletedDemoOrders = JSON.parse(localStorage.getItem('deletedDemoOrders') || '[]');
          deletedDemoOrders.push(orderId);
          localStorage.setItem('deletedDemoOrders', JSON.stringify(deletedDemoOrders));
        }
        
        // Local state'den sil
        setAllOrders(allOrders.filter(o => o.id !== orderId));
        
        // Toast mesajı göster
        const event = new CustomEvent('showToast', {
          detail: { 
            message: 'Sipariş başarıyla silindi.', 
            type: 'success' 
          }
        });
        window.dispatchEvent(event);
        
        console.log('Sipariş silindi:', orderId);
      } catch (error) {
        console.error('Sipariş silinirken hata:', error);
        const event = new CustomEvent('showToast', {
          detail: { message: 'Sipariş silinirken hata oluştu.', type: 'error' }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'preparing': return 'text-purple-600 bg-purple-50';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-success bg-success/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'out_for_delivery': return 'Yolda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Header />
      <BottomTabNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Icon name="Package" size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Sipariş Geçmişi</h1>
                <p className="text-gray-600 mt-1">Tüm siparişlerinizi görüntüleyin ve takip edin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Icon name="Filter" size={18} />
                <span>Filtrele</span>
              </button>
              
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg transition-colors ${
                  isRefreshing
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isRefreshing}
              >
                <Icon 
                  name="RefreshCw" 
                  size={18} 
                  className={isRefreshing ? 'animate-spin' : ''} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Durum Filtreleri */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {[
              { id: 'all', label: 'Tümü', count: allOrders.length },
              { id: 'pending', label: 'Beklemede', count: allOrders.filter(o => o.status === 'pending').length },
              { id: 'confirmed', label: 'Onaylandı', count: allOrders.filter(o => o.status === 'confirmed').length },
              { id: 'preparing', label: 'Hazırlanıyor', count: allOrders.filter(o => o.status === 'preparing').length },
              { id: 'out_for_delivery', label: 'Yolda', count: allOrders.filter(o => o.status === 'out_for_delivery').length },
              { id: 'delivered', label: 'Teslim Edildi', count: allOrders.filter(o => o.status === 'delivered').length },
              { id: 'cancelled', label: 'İptal Edildi', count: allOrders.filter(o => o.status === 'cancelled').length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-smooth ${
                  activeFilter === filter.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-slate-100 text-text-secondary border border-border hover:bg-slate-200 hover:text-text-primary'
                }`}
              >
                <span className="text-sm font-medium">{filter.label}</span>
                {filter.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    activeFilter === filter.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-200 text-text-secondary'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Icon name="RefreshCw" size={24} className="text-green-600 animate-spin" />
                <span className="text-gray-600">Siparişler yükleniyor...</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {activeFilter === 'all' ? 'Henüz sipariş vermediniz' : 'Bu durumda sipariş bulunamadı'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? 'İlk siparişinizi vermek için ürün kataloğuna göz atın.'
                  : 'Farklı durum filtrelerini deneyebilirsiniz.'
                }
              </p>
              {activeFilter === 'all' ? (
                <Link
                  to="/musteri-urun-katalogu"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Icon name="ShoppingCart" size={18} />
                  <span>Alışverişe Başla</span>
                </Link>
              ) : (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tüm Siparişleri Göster
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sipariş Sayısı */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">{filteredOrders.length}</span> sipariş listeleniyor
                  {activeFilter !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {activeFilter === 'pending' && 'Beklemede'}
                      {activeFilter === 'confirmed' && 'Onaylandı'}
                      {activeFilter === 'preparing' && 'Hazırlanıyor'}
                      {activeFilter === 'out_for_delivery' && 'Yolda'}
                      {activeFilter === 'delivered' && 'Teslim Edildi'}
                      {activeFilter === 'cancelled' && 'İptal Edildi'}
                    </span>
                  )}
                </p>
              </div>

              {/* Sipariş Kartları */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOrderSelect={handleOrderSelect}
                    onOrderAction={handleOrderAction}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFilters && (
        <FilterModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onCancel={handleCancelOrder}
          onReorder={handleReorder}
          onDelete={handleDeleteOrder}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      {showTrackingModal && selectedOrder && (
        <OrderTrackingModal
          order={selectedOrder}
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerOrderHistory;
