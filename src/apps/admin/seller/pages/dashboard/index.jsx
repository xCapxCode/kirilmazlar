import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import Icon from '../../../../../shared/components/AppIcon';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import logger from '@utils/productionLogger';
import GunlukOzet from './components/GunlukOzet';
import HizliIstatistikler from './components/HizliIstatistikler';
import SonSiparisler from './components/SonSiparisler';
import StokUyarilari from './components/StokUyarilari';

const SellerDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    dailyStats: { orders: 0, revenue: 0, products: 0 },
    weeklyStats: { orders: 0, revenue: 0, customers: 0 },
    stockAlerts: [],
    recentOrders: [],
    quickStats: { totalProducts: 0, activeOrders: 0, totalCustomers: 0, lowStockItems: 0 }
  });

  useEffect(() => {
    if (user && userProfile) {
      loadDashboardData();

      // Real-time veri güncellemeleri için subscriptions
      const unsubscribeProducts = storage.subscribe('products', loadDashboardData);
      const unsubscribeOrders = storage.subscribe('orders', loadDashboardData);
      const unsubscribeCustomerOrders = storage.subscribe('customer_orders', loadDashboardData);
      const unsubscribeCustomers = storage.subscribe('customers', loadDashboardData);

      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
        unsubscribeCustomerOrders();
        unsubscribeCustomers();
      };
    }
  }, [user, userProfile]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      logger.info('🔄 Dashboard verileri yükleniyor...');

      const [products, orders, customerOrders, customers] = await Promise.all([
        storage.get('products', []),
        storage.get('orders', []),
        storage.get('customer_orders', []),
        storage.get('customers', [])
      ]);

      // Siparişleri birleştir - customer_orders öncelikli
      const allOrders = [...customerOrders];
      orders.forEach(order => {
        const exists = allOrders.find(o => o.id === order.id);
        if (!exists) {
          allOrders.push(order);
        }
      });

      logger.info('📊 Dashboard veriler alındı:', {
        productsCount: products.length,
        ordersCount: orders.length,
        customerOrdersCount: customerOrders.length,
        totalOrdersCount: allOrders.length,
        customersCount: customers.length
      });

      const dashboardStats = calculateDashboardStats(products, allOrders, customers);
      setDashboardData(dashboardStats);

    } catch (error) {
      logger.error('❌ Dashboard data loading error:', error);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (products, orders, customers = []) => {
    try {
      // Yeni storage sistemi - tek orders key'i kullanıyoruz
      const uniqueOrders = orders || [];

      // Temel istatistikler
      const totalProducts = products.length;
      const activeOrders = uniqueOrders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'Beklemede', 'Onaylandı', 'Hazırlanıyor'].includes(order.status)
      ).length;
      const lowStockItems = products.filter(product => product.stock <= (product.min_stock || 5)).length;

      // Son siparişler (son 5)
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

      return dashboardData;

    } catch (error) {
      logger.error('Dashboard istatistik hesaplama hatası:', error);

      // Fallback demo verileri
      return {
        dailyStats: { orders: 0, revenue: 0, products: 0 },
        weeklyStats: { orders: 0, revenue: 0, customers: 0 },
        stockAlerts: [],
        recentOrders: [],
        quickStats: { totalProducts: 0, activeOrders: 0, totalCustomers: 0, lowStockItems: 0 }
      };
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

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
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
    <div className="min-h-screen bg-slate-200 pb-20 md:pb-0">
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
