import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../shared/components/AppIcon';
import { logger } from '../../../../utils/productionLogger';

const MobileOrders = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active'); // active, completed

  useEffect(() => {
    loadOrders();
  }, [userProfile]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      if (!userProfile?.id) return;

      const customerOrders = storage.get('customer_orders', []);
      const userOrders = customerOrders.filter(order => order.customerId === userProfile.id);

      setOrders(userOrders);
      logger.info(`📱 Mobil: ${userOrders.length} sipariş yüklendi`);
    } catch (error) {
      logger.error('Mobil sipariş yükleme hatası:', error);
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
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
      'Teslim Edildi': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: 'CheckCircle2' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const activeOrders = orders.filter(order =>
    !['delivered', 'cancelled', 'Teslim Edildi'].includes(order.status)
  );

  const completedOrders = orders.filter(order =>
    ['delivered', 'cancelled', 'Teslim Edildi'].includes(order.status)
  );

  const currentOrders = selectedTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 px-4 pt-12 pb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Package" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Siparişlerim</h1>
            <p className="text-white/80 text-sm">{orders.length} sipariş geçmişi</p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">{activeOrders.length}</div>
                <div className="text-white/70 text-xs">Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">{completedOrders.length}</div>
                <div className="text-white/70 text-xs">Tamamlanan</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(0)}₺
                </div>
                <div className="text-white/70 text-xs">Toplam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 pb-4 relative z-20">
        <div className="bg-white rounded-3xl p-2 shadow-sm mb-6">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('active')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${selectedTab === 'active'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Aktif ({activeOrders.length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${selectedTab === 'completed'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Geçmiş ({completedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        ) : currentOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Icon name="Package" size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {selectedTab === 'active' ? 'Aktif siparişiniz yok' : 'Geçmiş siparişiniz yok'}
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {selectedTab === 'active'
                ? 'Yeni bir sipariş vermek için alışverişe başlayın'
                : 'Henüz tamamlanmış siparişiniz bulunmuyor'
              }
            </p>
            <button
              onClick={() => navigate('/m/catalog')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {currentOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Sipariş #{order.orderNumber || order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Order Items Preview */}
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

                  {/* Order Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Toplam</span>
                    <span className="font-bold text-orange-600">
                      {formatPrice(order.total || 0)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                      Detayları Gör
                    </button>
                    {selectedTab === 'active' && order.status === 'pending' && (
                      <button className="flex-1 py-2 px-4 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
                        İptal Et
                      </button>
                    )}
                    {selectedTab === 'completed' && (
                      <button className="flex-1 py-2 px-4 bg-orange-100 text-orange-700 rounded-xl text-sm font-medium">
                        Tekrar Sipariş Ver
                      </button>
                    )}
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

export default MobileOrders;