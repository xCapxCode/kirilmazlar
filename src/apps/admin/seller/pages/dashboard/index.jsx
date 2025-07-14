import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import SaticiHeader from '@shared/components/ui/SaticiHeader';
import Icon from '@shared/components/AppIcon';

// Dashboard bileşenleri
import GunlukOzet from './components/GunlukOzet';
import StokUyarilari from './components/StokUyarilari';
import SonSiparisler from './components/SonSiparisler';
import HizliIstatistikler from './components/HizliIstatistikler';

const SellerDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dailyStats: {},
    weeklyStats: {},
    stockAlerts: [],
    recentOrders: [],
    quickStats: {}
  });

  // Satıcı değilse yönlendir
  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== 'seller' && userProfile.role !== 'admin') {
      window.location.href = '/customer/catalog';
    }
  }, [authLoading, userProfile]);

  // Dashboard verilerini yükle
  useEffect(() => {
    if (user?.id && (userProfile?.role === 'seller' || userProfile?.role === 'admin')) {
      loadDashboardData();
    }
    
    // localStorage değişikliklerini dinle
    const handleStorageChange = () => {
      if (user?.id && (userProfile?.role === 'seller' || userProfile?.role === 'admin')) {
        loadDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, userProfile?.role]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // localStorage'dan verileri al
      const savedProducts = localStorage.getItem('products');
      const savedSellerOrders = localStorage.getItem('sellerOrders');
      const savedCustomerOrders = localStorage.getItem('customerOrders');
      
      let products = [];
      let orders = [];
      
      // Ürünleri yükle
      if (savedProducts) {
        products = JSON.parse(savedProducts);
      }
      
      // Siparişleri yükle - hem seller hem customer orders'ı birleştir
      if (savedSellerOrders) {
        const sellerOrders = JSON.parse(savedSellerOrders);
        orders = [...orders, ...sellerOrders];
      }
      
      if (savedCustomerOrders) {
        const customerOrders = JSON.parse(savedCustomerOrders);
        orders = [...orders, ...customerOrders];
      }
      
      // Duplicate siparişleri filtrele
      const uniqueOrders = orders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      );
      
      console.log('Dashboard veriler yüklendi:', {
        products: products.length,
        orders: uniqueOrders.length
      });
      
      // İstatistikleri hesapla
      const totalProducts = products.length;
      const activeOrders = uniqueOrders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'Beklemede', 'Onaylandı', 'Hazırlanıyor'].includes(order.status)
      ).length;
      const lowStockItems = products.filter(product => product.stock <= (product.min_stock || 5)).length;
      
      // Son siparişleri al (son 5 sipariş)
      const recentOrders = uniqueOrders
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || order.order_number || `SIP-${order.id}`,
          customerName: order.customerName || order.customer_name || 'Müşteri',
          total: parseFloat(order.total || order.total_amount) || 0,
          status: order.status === 'pending' || order.status === 'Beklemede' ? 'Beklemede' : 
                  order.status === 'confirmed' || order.status === 'Onaylandı' ? 'Onaylandı' :
                  order.status === 'preparing' || order.status === 'Hazırlanıyor' ? 'Hazırlanıyor' :
                  order.status === 'delivered' || order.status === 'Teslim Edildi' ? 'Teslim Edildi' : 'Diğer',
          createdAt: order.createdAt || order.created_at || new Date().toISOString()
        }));

      // Stok uyarıları oluştur
      const stockAlerts = products
        .filter(product => product.stock <= (product.min_stock || 5))
        .map(product => ({
          id: product.id,
          productName: product.name,
          currentStock: product.stock,
          unit: product.unit || 'adet',
          minStock: product.min_stock || 5
        }));

      // Günlük ve haftalık istatistikler
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const todayOrders = uniqueOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at || 0);
        return !isNaN(orderDate.getTime()) && orderDate >= todayStart;
      });
      
      const weekOrders = uniqueOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at || 0);
        return !isNaN(orderDate.getTime()) && orderDate >= weekStart;
      });
      
      const todayRevenue = todayOrders.reduce((sum, order) => sum + (parseFloat(order.total || order.total_amount) || 0), 0);
      const weekRevenue = weekOrders.reduce((sum, order) => sum + (parseFloat(order.total || order.total_amount) || 0), 0);
      
      const dashboardData = {
        dailyStats: {
          orders: todayOrders.length,
          revenue: todayRevenue,
          products: totalProducts
        },
        weeklyStats: {
          orders: weekOrders.length,
          revenue: weekRevenue,
          customers: new Set(weekOrders.map(order => order.customerId || order.customer_id)).size
        },
        stockAlerts: stockAlerts,
        recentOrders: recentOrders,
        quickStats: {
          totalProducts: totalProducts,
          activeOrders: activeOrders,
          totalCustomers: new Set(uniqueOrders.map(order => order.customerId || order.customer_id)).size,
          lowStockItems: lowStockItems
        }
      };

      setDashboardData(dashboardData);

    } catch (error) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.log('Dashboard hatası:', error);
      
      // Fallback demo verileri
      const fallbackData = {
        dailyStats: {
          orders: 0,
          revenue: 0,
          products: 0
        },
        weeklyStats: {
          orders: 0,
          revenue: 0,
          customers: 0
        },
        stockAlerts: [],
        recentOrders: [],
        quickStats: {
          totalProducts: 0,
          activeOrders: 0,
          totalCustomers: 0,
          lowStockItems: 0
        }
      };
      
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Satıcı paneli yükleniyor...</p>
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
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="BarChart3" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Satıcı Paneli</h1>
                <p className="text-gray-600 mt-1">
                  Hoş geldiniz, {userProfile?.full_name || userProfile?.email || 'Satıcı'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50/50 transition-colors disabled:opacity-50 bg-transparent"
              >
                <Icon 
                  name="RefreshCw" 
                  size={18} 
                  className={refreshing ? 'animate-spin' : ''} 
                />
                <span>Yenile</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/seller/orders'}
                className="border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600/10 transition-colors flex items-center space-x-2 bg-transparent"
              >
                <Icon name="ShoppingCart" size={18} />
                <span>Sipariş Yönetimi</span>
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



        {/* Ana İçerik - Dashboard Bileşenleri */}
        <div className="space-y-6">
          {/* Hızlı İstatistikler */}
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Hızlı İstatistikler</h3>
            <HizliIstatistikler stats={dashboardData.quickStats} />
          </div>

          {/* Günlük Özet ve Son Siparişler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GunlukOzet 
              dailyStats={dashboardData.dailyStats} 
              weeklyStats={dashboardData.weeklyStats} 
            />
            <SonSiparisler orders={dashboardData.recentOrders} />
          </div>

          {/* Stok Uyarıları */}
          <StokUyarilari alerts={dashboardData.stockAlerts} />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;