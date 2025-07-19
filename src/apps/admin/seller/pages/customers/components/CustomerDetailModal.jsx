import React, { useState, useEffect } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import customerService from '../../../../../../services/customerService';
import orderService from '../../../../../../services/orderService';

const CustomerDetailModal = ({ customer, onClose }) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (customer?.id) {
      loadCustomerDetails();
    }
  }, [customer]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      
      // Müşteri detaylarını yükle
      const customerDetails = await customerService.getById(customer.id);
      setCustomerData(customerDetails);
      
      // Müşteri istatistiklerini yükle
      const stats = await customerService.getCustomerStats(customer.id);
      setCustomerStats(stats);
      
      // Müşteri siparişlerini yükle
      const orders = await customerService.getCustomerOrders(customer.id);
      setCustomerOrders(orders);
      
    } catch (error) {
      console.error('Müşteri detayları yüklenirken hata:', error);
      showError('Müşteri detayları yüklenirken bir hata oluştu');
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Müşteri Detayları</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Müşteri bilgileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{customerData?.name || 'Müşteri'}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusLabel(customerData?.status).color}`}>
                  {getStatusLabel(customerData?.status).label}
                </span>
                <span className="text-sm text-gray-500">
                  {getAccountTypeLabel(customerData?.accountType)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Müşteri Bilgileri
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sipariş Geçmişi
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            İstatistikler
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ad Soyad</p>
                    <p className="text-base text-gray-900">{customerData?.name || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-posta</p>
                    <p className="text-base text-gray-900">{customerData?.email || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="text-base text-gray-900">{customerData?.phone || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kullanıcı Adı</p>
                    <p className="text-base text-gray-900">{customerData?.username || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kayıt Tarihi</p>
                    <p className="text-base text-gray-900">{formatDate(customerData?.registeredAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Son Giriş</p>
                    <p className="text-base text-gray-900">{formatDate(customerData?.lastLoginAt)}</p>
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adres Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Adres</p>
                    <p className="text-base text-gray-900">{customerData?.address || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Şehir</p>
                    <p className="text-base text-gray-900">{customerData?.city || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">İlçe</p>
                    <p className="text-base text-gray-900">{customerData?.district || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Posta Kodu</p>
                    <p className="text-base text-gray-900">{customerData?.postalCode || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>

              {/* Şirket Bilgileri (Kurumsal ise) */}
              {customerData?.accountType === 'business' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Şirket Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Şirket Adı</p>
                      <p className="text-base text-gray-900">{customerData?.companyName || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ünvan</p>
                      <p className="text-base text-gray-900">{customerData?.companyTitle || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notlar */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notlar</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-base text-gray-900">{customerData?.notes || 'Bu müşteri için not bulunmuyor.'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Geçmişi</h3>
              
              {customerOrders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Icon name="ShoppingBag" size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Bu müşterinin henüz siparişi bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Order Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              Sipariş #{order.orderNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.items?.length || 0} ürün
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 ? (
                            order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                      <Icon name="Package" size={12} className="text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-900 line-clamp-1">
                                      {item.name || item.productName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item.quantity} {item.unit} × {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-2">
                              Ürün bilgisi bulunamadı
                            </p>
                          )}

                          {order.items && order.items.length > 3 && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              +{order.items.length - 3} daha fazla ürün
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri İstatistikleri</h3>
              
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Toplam Sipariş</p>
                      <h3 className="text-2xl font-bold text-blue-600 mt-1">{customerStats?.totalOrders || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Icon name="ShoppingBag" size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Toplam Harcama</p>
                      <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(customerStats?.totalSpent || 0)}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Icon name="CreditCard" size={20} className="text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ortalama Sipariş</p>
                      <h3 className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(customerStats?.averageOrderValue || 0)}</h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Icon name="TrendingUp" size={20} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sipariş Durumu Dağılımı */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-base font-medium text-gray-900">Sipariş Durumu Dağılımı</h4>
                </div>
                <div className="p-4">
                  {customerOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Sipariş verisi bulunmuyor</p>
                  ) : (
                    <div className="space-y-3">
                      {['Beklemede', 'Onaylandı', 'Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'].map(status => {
                        const count = customerOrders.filter(order => order.status === status).length;
                        const percentage = customerOrders.length > 0 ? (count / customerOrders.length) * 100 : 0;
                        
                        return (
                          <div key={status} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{status}</span>
                              <span className="text-sm font-medium text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('-100', '-600')}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Son Aktivite */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-base font-medium text-gray-900">Son Aktivite</h4>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Icon name="LogIn" size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Son Giriş</p>
                        <p className="text-sm text-gray-500">{formatDate(customerData?.lastLoginAt) || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Icon name="ShoppingBag" size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Son Sipariş</p>
                        <p className="text-sm text-gray-500">
                          {customerStats?.lastOrderDate 
                            ? formatDate(new Date(customerStats.lastOrderDate)) 
                            : 'Henüz sipariş vermemiş'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Icon name="UserCheck" size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kayıt Tarihi</p>
                        <p className="text-sm text-gray-500">{formatDate(customerData?.registeredAt) || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;