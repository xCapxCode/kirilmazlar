import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import storage from '../../../../../core/storage/index.js';

// Bileşenler
import SiparisDetayModali from './components/SiparisDetayModali';
import DurumGuncellemeModali from './components/DurumGuncellemeModali';

const SiparisYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: 'all',
    sortBy: 'newest'
  });

  // Real-time sipariş güncellemeleri için subscriptions
  useEffect(() => {
    if (user && userProfile) {
      loadOrders();
      
      // Müşteri siparişlerini dinle - customer_orders ana veri kaynağı
      const unsubscribeCustomerOrders = storage.subscribe('customer_orders', (newOrders) => {
        console.log('🔄 Customer orders updated:', newOrders?.length || 0);
        setOrders(newOrders || []);
      });

      // Sipariş durumu güncellemelerini dinle
      const unsubscribeOrders = storage.subscribe('orders', loadOrders);

      return () => {
        unsubscribeCustomerOrders();
        unsubscribeOrders();
      };
    }
  }, [user, userProfile]);

  const loadOrders = async () => {
    try {
      console.log('🔄 Sipariş verileri yükleniyor...');
      
      // Öncelik: customer_orders (müşterilerin verdiği gerçek siparişler)
      const customerOrders = await storage.get('customer_orders', []);
      
      // Eğer customer_orders yoksa orders tablosuna bak
      const sellerOrders = await storage.get('orders', []);
      
      console.log('📊 Sipariş verileri:', {
        customerOrdersCount: customerOrders.length,
        sellerOrdersCount: sellerOrders.length
      });

      // Customer orders'ı öncelik ver, sonra seller orders ekle
      const allOrders = [...customerOrders];
      
      // Seller orders'dan duplicate olmayanları ekle
      sellerOrders.forEach(sellerOrder => {
        const exists = allOrders.find(order => order.id === sellerOrder.id);
        if (!exists) {
          allOrders.push(sellerOrder);
        }
      });

      // Siparişleri normalize et
      const normalizedOrders = allOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber || order.order_number || `SIP-${order.id}`,
        customerName: order.customerName || order.customer_name || 'Müşteri',
        customerEmail: order.customerEmail || order.customer_email || '',
        customerPhone: order.customerPhone || order.customer_phone || '',
        items: order.items || order.orderItems || [],
        total: parseFloat(order.total || order.total_amount || 0),
        status: normalizeStatus(order.status),
        orderDate: order.createdAt || order.created_at || order.orderDate || new Date().toISOString(),
        deliveryAddress: order.deliveryAddress || order.delivery_address || '',
        notes: order.notes || order.order_notes || '',
        paymentMethod: order.paymentMethod || order.payment_method || 'Nakit',
        source: order.source || 'customer'
      }));

      // En yeni siparişler önce gelsin
      normalizedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      setOrders(normalizedOrders);
      console.log('✅ Sipariş verileri yüklendi:', normalizedOrders.length);
      
    } catch (error) {
      console.error('❌ Sipariş yükleme hatası:', error);
      setError('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    
    return statusMap[status] || status || 'Beklemede';
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('🔄 Sipariş durumu güncelleniyor:', orderId, newStatus);
      
      // Customer orders'ı güncelle
      const customerOrders = await storage.get('customer_orders', []);
      const updatedCustomerOrders = customerOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      await storage.set('customer_orders', updatedCustomerOrders);

      // Local state'i güncelle
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: normalizeStatus(newStatus) }
            : order
        )
      );

      console.log('✅ Sipariş durumu güncellendi');
      setShowStatusUpdate(false);
      setSelectedOrder(null);
      
    } catch (error) {
      console.error('❌ Sipariş durumu güncelleme hatası:', error);
      setError('Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      try {
        console.log('🗑️ Sipariş siliniyor:', orderId);
        
        // Customer orders'dan sil
        const customerOrders = await storage.get('customer_orders', []);
        const updatedCustomerOrders = customerOrders.filter(order => order.id !== orderId);
        await storage.set('customer_orders', updatedCustomerOrders);

        // Seller orders'dan da sil (eğer varsa)
        const sellerOrders = await storage.get('orders', []);
        const updatedSellerOrders = sellerOrders.filter(order => order.id !== orderId);
        await storage.set('orders', updatedSellerOrders);

        // Local state'i güncelle
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

        console.log('✅ Sipariş silindi');
        
      } catch (error) {
        console.error('❌ Sipariş silme hatası:', error);
        setError('Sipariş silinirken hata oluştu');
      }
    }
  };

  const clearAllDummyOrders = async () => {
    if (window.confirm('Tüm test siparişlerini temizlemek istediğinizden emin misiniz?')) {
      try {
        console.log('🧹 Tüm test siparişleri temizleniyor...');
        
        // Sadece test/demo siparişlerini temizle, gerçek müşteri siparişlerini koru
        const customerOrders = await storage.get('customer_orders', []);
        const realOrders = customerOrders.filter(order => 
          !order.orderNumber?.includes('TEST') && 
          !order.customerName?.includes('Test') &&
          order.source !== 'demo'
        );
        
        await storage.set('customer_orders', realOrders);
        await storage.set('orders', []); // Seller orders'ı tamamen temizle
        
        setOrders(realOrders);
        console.log('✅ Test siparişleri temizlendi, gerçek siparişler korundu');
        
      } catch (error) {
        console.error('❌ Sipariş temizleme hatası:', error);
        setError('Siparişler temizlenirken hata oluştu');
      }
    }
  };

  // Filtreleme ve sayfalama
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || order.status === filters.status;
    
    const matchesDateRange = filters.dateRange === 'all' || (() => {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.orderDate) - new Date(a.orderDate);
      case 'oldest':
        return new Date(a.orderDate) - new Date(b.orderDate);
      case 'total':
        return b.total - a.total;
      case 'customer':
        return a.customerName.localeCompare(b.customerName, 'tr');
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    const statusColors = {
      'Beklemede': 'bg-yellow-100 text-yellow-800',
      'Onaylandı': 'bg-blue-100 text-blue-800',
      'Hazırlanıyor': 'bg-purple-100 text-purple-800',
      'Hazır': 'bg-green-100 text-green-800',
      'Kargoya Verildi': 'bg-indigo-100 text-indigo-800',
      'Teslim Edildi': 'bg-gray-100 text-gray-800',
      'İptal Edildi': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş yönetimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu panele erişmek için satıcı yetkilerine sahip olmanız gerekir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Eylemler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="ShoppingCart" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Sipariş Yönetimi</h1>
                <p className="text-gray-600 mt-1">
                  Toplam {orders.length} sipariş • {currentOrders.length} görüntüleniyor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={clearAllDummyOrders}
                className="border-2 border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="Trash2" size={18} />
                <span>Test Siparişlerini Temizle</span>
              </button>
              
              <button
                onClick={loadOrders}
                className="border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600/10 transition-colors flex items-center space-x-2"
              >
                <Icon name="RefreshCw" size={18} />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {/* Hata Banner */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800 transition-colors"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filtreler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Sipariş No / Müşteri ara..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tüm Durumlar</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Hazırlanıyor">Hazırlanıyor</option>
                <option value="Hazır">Hazır</option>
                <option value="Teslim Edildi">Teslim Edildi</option>
                <option value="İptal Edildi">İptal Edildi</option>
              </select>
            </div>

            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tüm Tarihler</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
              </select>
            </div>

            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="total">Tutara Göre</option>
                <option value="customer">Müşteriye Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
          {currentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="ShoppingCart" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
              <p className="text-gray-600">
                {orders.length === 0 
                  ? 'Henüz sipariş yok. Müşteriler sipariş verdiğinde burada görünecek.'
                  : 'Aradığınız kriterlere uygun sipariş bulunmuyor.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Sipariş No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Müşteri</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tutar</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Durum</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{order.orderNumber}</div>
                          <div className="text-sm text-gray-600">{order.items?.length || 0} ürün</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-600">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {order.total.toFixed(2)} ₺
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetail(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Detayları Görüntüle"
                            >
                              <Icon name="Eye" size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowStatusUpdate(true);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Durumu Güncelle"
                            >
                              <Icon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Sil"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modaller */}
      {showOrderDetail && selectedOrder && (
        <SiparisDetayModali
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showStatusUpdate && selectedOrder && (
        <DurumGuncellemeModali
          order={selectedOrder}
          onUpdate={handleUpdateOrderStatus}
          onClose={() => {
            setShowStatusUpdate(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default SiparisYonetimi;
