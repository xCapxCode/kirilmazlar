import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../../shared/components/AppIcon';
import { logger } from '../../../../../utils/productionLogger';

const MobileSellerCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const users = storage.get('users', []);
      const orders = storage.get('orders', []);

      // Sadece customer rolündeki kullanıcıları al
      const customerUsers = users.filter(user => user.role === 'customer');

      // Her müşteri için sipariş istatistiklerini hesapla
      const customersWithStats = customerUsers.map(customer => {
        const customerOrders = orders.filter(order => order.customerId === customer.id);
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrderDate = customerOrders.length > 0
          ? Math.max(...customerOrders.map(order => new Date(order.createdAt).getTime()))
          : null;

        return {
          ...customer,
          totalOrders: customerOrders.length,
          totalSpent,
          lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : null
        };
      });

      // Toplam harcamaya göre sırala
      customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

      setCustomers(customersWithStats);
      logger.info(`👥 Mobile seller: ${customersWithStats.length} müşteri yüklendi`);
    } catch (error) {
      logger.error('Customers loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchQuery.trim()) {
      filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      );
    }

    setFilteredCustomers(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'Hiç sipariş yok';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 1000) {
      return { label: 'VIP', color: 'bg-purple-100 text-purple-800', icon: 'Crown' };
    } else if (totalSpent >= 500) {
      return { label: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: 'Star' };
    } else if (totalSpent >= 100) {
      return { label: 'Silver', color: 'bg-gray-100 text-gray-800', icon: 'Award' };
    } else {
      return { label: 'Yeni', color: 'bg-green-100 text-green-800', icon: 'User' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Hero - Müşteri mobil favoriler gibi */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header Content */}
        <div className="relative z-10 px-4 pt-12 pb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/ms/dashboard')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>

            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />

            <button
              onClick={loadCustomers}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="RefreshCw" size={20} className="text-white" />
            </button>
          </div>

          {/* Hero Content */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Users" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Müşterilerim</h1>
            <p className="text-white/80 text-sm">
              {filteredCustomers.length} müşteri
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {customers.filter(c => c.totalSpent >= 1000).length}
                </div>
                <div className="text-white/70 text-xs">VIP</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {customers.filter(c => c.totalSpent >= 500).length}
                </div>
                <div className="text-white/70 text-xs">Gold</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {customers.length}
                </div>
                <div className="text-white/70 text-xs">Toplam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-24 relative z-20">
        {/* Arama Çubuğu */}
        <div className="relative mb-6">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
          />
        </div>

        {/* Müşteri Listesi */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 rounded-full h-12 w-12"></div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded h-4 w-32 mb-2"></div>
                    <div className="bg-gray-200 rounded h-3 w-24 mb-2"></div>
                    <div className="bg-gray-200 rounded h-3 w-16"></div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-6 w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Users" size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Müşteri bulunamadı</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Arama kriterlerinize uygun müşteri yok.' : 'Henüz müşteri kaydı yok.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {filteredCustomers.map((customer) => {
              const level = getCustomerLevel(customer.totalSpent);
              return (
                <div key={customer.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {customer.name?.charAt(0)?.toUpperCase() || 'M'}
                      </span>
                    </div>

                    {/* Müşteri Bilgileri */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {customer.name || 'İsimsiz Müşteri'}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                          {level.label}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-1">
                        {customer.email || 'E-posta yok'}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {customer.phone || 'Telefon yok'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Sipariş</p>
                            <p className="text-sm font-semibold text-gray-900">{customer.totalOrders}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Harcama</p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatPrice(customer.totalSpent)}
                            </p>
                          </div>
                        </div>

                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Icon name="MessageCircle" size={16} className="text-gray-600" />
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Son sipariş: {formatDate(customer.lastOrderDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSellerCustomers;