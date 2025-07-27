import Icon from '@shared/components/AppIcon';
import { useEffect, useState } from 'react';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import customerService from '../../../../../../services/customerService';

const CustomerDetailModal = ({ customer, onClose }) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false); // Sadece ek veriler için loading
  const [customerData, setCustomerData] = useState(customer || null); // Prop'tan gelen veriyi başlangıç verisi olarak kullan
  const [customerStats, setCustomerStats] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (customer?.id) {
      // Prop'tan gelen customer verisini hemen kullan
      setCustomerData(customer);
      loadAdditionalData();
    }
  }, [customer]);

  const loadAdditionalData = async () => {
    try {
      setLoading(true);

      // Sadece eksik verileri yükle - istatistikler ve siparişler
      const [stats, orders] = await Promise.all([
        customerService.getCustomerStats(customer.id),
        customerService.getCustomerOrders(customer.id)
      ]);

      setCustomerStats(stats);
      setCustomerOrders(orders);

    } catch (error) {
      console.error('Müşteri ek bilgileri yüklenirken hata:', error);
      showError('Müşteri ek bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getAccountTypeLabel = (type) => {
    return type === 'business' ? 'Kurumsal' : 'Bireysel';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { label: 'Pasif', color: 'bg-gray-100 text-gray-800' };
      case 'blocked':
        return { label: 'Engelli', color: 'bg-red-100 text-red-800' };
      case 'pending':
        return { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!customerData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-100 rounded-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Müşteri Detayları</h2>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              >
                <Icon name="X" size={24} className="text-white" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Müşteri bilgileri hazırlanıyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon name="User" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customerData?.name || 'Müşteri'}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
                    {getStatusLabel(customerData?.status).label}
                  </span>
                  <span className="text-blue-100 text-sm">
                    {getAccountTypeLabel(customerData?.accountType)} Hesap
                  </span>
                  <span className="text-blue-100 text-sm">
                    Kayıt: {formatDate(customerData?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            >
              <Icon name="X" size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="flex bg-white border-b border-gray-200 px-6">
          {[
            { id: 'info', label: 'Müşteri Bilgileri', icon: 'User' },
            { id: 'orders', label: 'Sipariş Geçmişi', icon: 'ShoppingBag' },
            { id: 'stats', label: 'İstatistikler', icon: 'TrendingUp' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              {/* İletişim Bilgileri Kartı */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="Mail" size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">İletişim Bilgileri</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon name="Mail" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">E-posta</p>
                        <p className="font-medium text-gray-900">{customerData?.email || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon name="Phone" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p className="font-medium text-gray-900">{customerData?.phone || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon name="MapPin" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Şehir</p>
                        <p className="font-medium text-gray-900">{customerData?.city || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon name="Home" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Adres</p>
                        <p className="font-medium text-gray-900">{customerData?.address || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hesap Bilgileri Kartı */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="Settings" size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Hesap Bilgileri</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Icon name="Calendar" size={24} className="text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                    <p className="font-semibold text-gray-900">{formatDate(customerData?.createdAt)}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <Icon name="CheckCircle" size={24} className="text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Hesap Durumu</p>
                    <p className="font-semibold text-gray-900">{getStatusLabel(customerData?.status).label}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Icon name="Building" size={24} className="text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Hesap Tipi</p>
                    <p className="font-semibold text-gray-900">{getAccountTypeLabel(customerData?.accountType)}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <Icon name="Clock" size={24} className="text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Son Aktivite</p>
                    <p className="font-semibold text-gray-900">{formatDate(customerData?.lastActivity)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon name="ShoppingBag" size={20} className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Sipariş Geçmişi</h3>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {loading ? 'Yükleniyor...' : `${customerOrders.length} sipariş`}
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-600">Sipariş geçmişi yükleniyor...</p>
                    </div>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-gray-200 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Icon name="Receipt" size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                              <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Sipariş Ürünleri */}
                        <div className="flex items-center space-x-3 mb-3">
                          {order.items && order.items.slice(0, 4).map((item, index) => (
                            <div key={index} className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="Package" size={14} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items && order.items.length > 4 && (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">+{order.items.length - 4}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">
                              {order.items?.[0]?.name || order.items?.[0]?.productName}
                              {order.items && order.items.length > 1 && ` ve ${order.items.length - 1} ürün daha`}
                            </p>
                            <p className="text-xs text-gray-500">{order.items?.length || 0} ürün</p>
                          </div>
                        </div>

                        {/* Sipariş Özeti */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                              <Icon name="MapPin" size={14} className="inline mr-1" />
                              {order.deliveryAddress ? order.deliveryAddress.substring(0, 30) + '...' : 'Adres belirtilmemiş'}
                            </span>
                            <span className="text-gray-600">
                              <Icon name="CreditCard" size={14} className="inline mr-1" />
                              {order.paymentMethod || 'Nakit'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="ShoppingBag" size={48} className="text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz sipariş yok</h4>
                    <p className="text-gray-500">Bu müşteri henüz sipariş vermemiş.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-600">İstatistikler yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* İstatistik Kartları */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon name="ShoppingCart" size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Toplam Sipariş</p>
                          <p className="text-2xl font-bold text-gray-900">{customerStats?.totalOrders || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Icon name="TrendingUp" size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ortalama Sipariş</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(customerStats?.averageOrder || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Son Aktiviteler */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Icon name="Activity" size={20} className="text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Icon name="ShoppingBag" size={16} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Son sipariş</p>
                          <p className="text-xs text-gray-500">{customerOrders[0] ? formatDate(customerOrders[0].orderDate) : 'Henüz sipariş yok'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Icon name="User" size={16} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Hesap oluşturuldu</p>
                          <p className="text-xs text-gray-500">{formatDate(customerData?.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
