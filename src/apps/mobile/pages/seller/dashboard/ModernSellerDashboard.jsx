import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import Icon from '../../../../../shared/components/AppIcon';
import { logger } from '../../../../../utils/productionLogger';

const ModernSellerDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Kategoriler - Icon'larla
  const categories = [
    {
      id: 'siparisler',
      name: 'Siparişler',
      icon: 'ShoppingBag',
      path: '/ms/orders'
    },
    {
      id: 'urunler',
      name: 'Ürünler',
      icon: 'Package',
      path: '/ms/products'
    },
    {
      id: 'musteriler',
      name: 'Müşteriler',
      icon: 'Users',
      path: '/ms/customers'
    },
    {
      id: 'ayarlar',
      name: 'Ayarlar',
      icon: 'Settings',
      path: '/ms/settings'
    }
  ];

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
      const customers = users.filter(user => user.role === 'customer');
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order =>
        new Date(order.createdAt).toDateString() === today
      ).length;
      const pendingOrders = orders.filter(order =>
        order.status === 'pending' || order.status === 'processing'
      ).length;

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalRevenue,
        todayOrders,
        pendingOrders
      });

      // Son siparişleri al (en fazla 5 tane)
      const sortedOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(sortedOrders);

      logger.info('📊 Satıcı dashboard verileri yüklendi');
    } catch (error) {
      logger.error('Dashboard veri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'processing': return 'İşleniyor';
      case 'pending': return 'Bekliyor';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Kırılmazlar Header - Müşteri mobil ile aynı */}
      <div className="bg-white px-4 pt-12 pb-6">
        {/* Top Bar - Logo & Icons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="/assets/images/logo/KirilmazlarLogo.png"
              alt="Kırılmazlar"
              className="h-12 w-auto"
              style={{ opacity: 1, filter: 'brightness(1.2) contrast(1.1)' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="text-2xl font-bold text-green-600 hidden">Kırılmazlar</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative">
              <Icon name="Bell" size={20} className="text-gray-600" />
              {stats.pendingOrders > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => navigate('/ms/settings')}
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <Icon name="User" size={16} className="text-blue-600" />
            </button>
          </div>
        </div>

        {/* Welcome Message - İnce yazı ile */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Hoş geldin,</p>
          <h1 className="text-xl font-medium text-gray-900">
            {userProfile?.name || 'Satıcı'}
          </h1>
        </div>

        {/* Satış Paneli Kartı - Müşteri mobil renkleri ile */}
        <div className="bg-green-100 rounded-2xl p-4 mb-6 shadow-sm hover:bg-green-150 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <Icon name="BarChart3" size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-600">Satış Paneli</h3>
                <p className="text-sm text-green-600">Hızlı Yönetim</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600 font-medium">Siparişlerinizi</p>
              <p className="text-xs text-green-600">kolayca yönetin</p>
            </div>
          </div>
        </div>

        {/* Categories - Müşteri mobil ile aynı tasarım */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Hızlı Erişim</h3>
          </div>
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(category.path)}
                className="flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all w-20 h-20 bg-green-100 shadow-sm hover:bg-green-150 hover:shadow-md"
              >
                <div className="flex items-center justify-center mb-1 w-full h-8">
                  <Icon name={category.icon} size={24} className="text-green-600" />
                </div>
                <span className="text-xs font-medium text-center leading-tight text-green-600">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section - Müşteri mobil products section gibi */}
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">İstatistikler</h2>
            <p className="text-sm text-gray-500">İşletme özeti</p>
          </div>
          <button
            onClick={handleRefresh}
            className={`text-blue-500 text-sm font-medium flex items-center space-x-1 ${isRefreshing ? 'animate-pulse' : ''}`}
          >
            <Icon name="RefreshCw" size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>

        {/* Stats Cards - Müşteri mobil renkleri ile */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Toplam Siparişler */}
          <div className="bg-green-100 rounded-2xl p-3 shadow-sm hover:bg-green-150 hover:shadow-md transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-1 w-full h-8">
                <Icon name="ShoppingBag" size={24} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600 mb-1">{stats.totalOrders}</div>
              <span className="text-xs font-medium text-center leading-tight text-green-600">
                Sipariş
              </span>
            </div>
          </div>

          {/* Toplam Ürünler */}
          <div className="bg-green-100 rounded-2xl p-3 shadow-sm hover:bg-green-150 hover:shadow-md transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-1 w-full h-8">
                <Icon name="Package" size={24} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600 mb-1">{stats.totalProducts}</div>
              <span className="text-xs font-medium text-center leading-tight text-green-600">
                Ürün
              </span>
            </div>
          </div>

          {/* Toplam Müşteriler */}
          <div className="bg-green-100 rounded-2xl p-3 shadow-sm hover:bg-green-150 hover:shadow-md transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-1 w-full h-8">
                <Icon name="Users" size={24} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600 mb-1">{stats.totalCustomers}</div>
              <span className="text-xs font-medium text-center leading-tight text-green-600">
                Müşteri
              </span>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-green-100 rounded-2xl p-3 shadow-sm hover:bg-green-150 hover:shadow-md transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-1 w-full h-8">
                <Icon name="DollarSign" size={24} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600 mb-1">₺{stats.totalRevenue}</div>
              <span className="text-xs font-medium text-center leading-tight text-green-600">
                Gelir
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders - Müşteri mobil empty state gibi */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Son Siparişler</h2>
              <p className="text-sm text-gray-500">
                {recentOrders.length} sipariş bulundu
              </p>
            </div>
            <button
              onClick={() => navigate('/ms/orders')}
              className="text-blue-500 text-sm font-medium flex items-center space-x-1"
            >
              <span>Tümünü Gör</span>
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded h-4 mb-2"></div>
                      <div className="bg-gray-200 rounded h-3 w-2/3 mb-2"></div>
                      <div className="bg-gray-200 rounded h-4 w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ShoppingBag" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sipariş yok</h3>
              <p className="text-gray-500 mb-6">
                İlk siparişinizi bekliyoruz.
              </p>
              <button
                onClick={() => navigate('/ms/orders')}
                className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-medium"
              >
                Siparişleri Görüntüle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    {/* Sipariş İkonu */}
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Icon name="ShoppingBag" size={24} className="text-blue-600" />
                    </div>

                    {/* Sipariş Bilgileri */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight">
                        Sipariş #{order.id?.toString().slice(-4) || 'N/A'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {order.customerName || 'Müşteri'} • {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-blue-500">
                          {formatPrice(order.total)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernSellerDashboard;