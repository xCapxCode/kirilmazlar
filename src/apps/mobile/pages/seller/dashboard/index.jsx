import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import Icon from '../../../../../shared/components/AppIcon';
import { logger } from '../../../../../utils/productionLogger';

const MobileSellerDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Siparişleri yükle
      const orders = storage.get('orders', []);
      const products = storage.get('products', []);
      const users = storage.get('users', []);

      // İstatistikleri hesapla
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();

      const todayOrders = orders.filter(order =>
        new Date(order.createdAt).toDateString() === today
      );

      const monthlyOrders = orders.filter(order =>
        new Date(order.createdAt).getMonth() === thisMonth
      );

      const pendingOrders = orders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      );

      const customers = users.filter(user => user.role === 'customer');

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        totalProducts: products.filter(p => p.status === 'active').length,
        totalCustomers: customers.length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        monthlyRevenue: monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });

      // Son siparişleri al
      const sortedOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentOrders(sortedOrders);

      logger.info('📊 Mobile seller dashboard data loaded');
    } catch (error) {
      logger.error('Dashboard data loading error:', error);
    } finally {
      setIsLoading(false);
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

  const quickActions = [
    {
      id: 'add-product',
      label: 'Ürün Ekle',
      icon: 'Plus',
      color: 'bg-orange-500',
      action: () => navigate('/ms/products')
    },
    {
      id: 'view-orders',
      label: 'Siparişler',
      icon: 'ShoppingBag',
      color: 'bg-red-500',
      action: () => navigate('/ms/orders')
    },
    {
      id: 'customers',
      label: 'Müşteriler',
      icon: 'Users',
      color: 'bg-orange-600',
      action: () => navigate('/ms/customers')
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: 'Settings',
      color: 'bg-gray-500',
      action: () => navigate('/ms/settings')
    }
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
              <Icon name="BarChart3" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Satış Paneli</h1>
            <p className="text-white/80 text-sm">
              Hoş geldin, {userProfile?.name || 'Satıcı'}
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {stats.totalOrders}
                </div>
                <div className="text-white/70 text-xs">Sipariş</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {stats.totalProducts}
                </div>
                <div className="text-white/70 text-xs">Ürün</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  ₺{stats.todayRevenue}
                </div>
                <div className="text-white/70 text-xs">Bugün</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-24 relative z-20 space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="ShoppingBag" size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="Clock" size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500">Bekleyen</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="Package" size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Ürün</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="Users" size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-500">Müşteri</p>
            </div>
          </div>
        </div>

        {/* Gelir Kartları */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Bugünkü Gelir</p>
                <p className="text-3xl font-bold mt-1">{formatPrice(stats.todayRevenue)}</p>
                <p className="text-orange-100 text-xs mt-1">+12% dünden</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Icon name="TrendingUp" size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Aylık Gelir</p>
                <p className="text-3xl font-bold mt-1">{formatPrice(stats.monthlyRevenue)}</p>
                <p className="text-orange-100 text-xs mt-1">Bu ay toplam</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Icon name="BarChart3" size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon name={action.icon} size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
            <button
              onClick={() => navigate('/ms/orders')}
              className="text-blue-600 text-sm font-medium"
            >
              Tümünü Gör
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-lg h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded h-4 w-24 mb-2"></div>
                      <div className="bg-gray-200 rounded h-3 w-16"></div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-6 w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
                <Icon name="ShoppingBag" size={24} className="text-green-600" />
              </div>
              <p className="text-gray-500">Henüz sipariş yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div key={order.id} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon name="ShoppingBag" size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">#{order.orderNumber || order.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.total || 0)}</p>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSellerDashboard;