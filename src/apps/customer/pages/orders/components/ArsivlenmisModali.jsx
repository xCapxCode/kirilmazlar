import React, { useState, useEffect } from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../contexts/NotificationContext';
import orderCleanupUtil from '../../../../../utils/orderCleanupUtil';

const ArsivlenmisModali = ({ onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [archivedOrders, setArchivedOrders] = useState([]);

  useEffect(() => {
    loadArchivedOrders();
  }, []);

  const loadArchivedOrders = async () => {
    try {
      setLoading(true);
      const orders = await orderCleanupUtil.getArchivedOrders();
      setArchivedOrders(orders);
    } catch (error) {
      console.error('Error loading archived orders:', error);
      showError('Arşivlenmiş siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClearArchive = async () => {
    try {
      setLoading(true);
      const clearedCount = await orderCleanupUtil.clearArchivedOrders();
      setArchivedOrders([]);
      showSuccess(`${clearedCount} arşivlenmiş sipariş başarıyla temizlendi`);
    } catch (error) {
      console.error('Error clearing archived orders:', error);
      showError('Arşivlenmiş siparişler temizlenirken bir hata oluştu');
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
      year: 'numeric'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Arşivlenmiş Siparişler</h2>
            <p className="text-gray-600 mt-1">
              {archivedOrders.length} arşivlenmiş sipariş
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Icon name="RefreshCw" size={24} className="text-blue-600 animate-spin" />
                <span className="text-gray-600">Arşivlenmiş siparişler yükleniyor...</span>
              </div>
            </div>
          ) : archivedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Archive" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arşivlenmiş sipariş bulunamadı</h3>
              <p className="text-gray-600">
                Henüz arşivlenmiş siparişiniz bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedOrders.map((order) => (
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
                              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                  <Icon name="Package" size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.name || item.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity} {item.unit} × {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total || (item.quantity * item.price))}
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

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kapat
          </button>
          {archivedOrders.length > 0 && (
            <button
              onClick={handleClearArchive}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Icon name="Loader" size={16} className="animate-spin" />
                  <span>İşleniyor...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="Trash2" size={16} />
                  <span>Arşivi Temizle</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArsivlenmisModali;