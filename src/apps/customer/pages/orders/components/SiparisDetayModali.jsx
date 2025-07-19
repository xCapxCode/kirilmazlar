import React from 'react';
import Icon from '@shared/components/AppIcon';
import { useNotification } from '../../../../../contexts/NotificationContext';

const SiparisDetayModali = ({ order, onClose, onCancel }) => {
  const { showSuccess, showError } = useNotification();

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

  const canCancel = (order) => {
    return order.status === 'Beklemede' || order.status === 'Onaylandı';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sipariş Detayları</h2>
            <p className="text-gray-600 mt-1">#{order.orderNumber}</p>
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
          {/* Sipariş Özeti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sipariş Bilgileri</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Sipariş Tarihi</p>
                    <p className="text-sm font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Son Güncelleme</p>
                    <p className="text-sm font-medium">{formatDate(order.updatedAt || order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Durum</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ödeme Yöntemi</p>
                    <p className="text-sm font-medium">{order.paymentMethod || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Teslimat Bilgileri</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium">
                  {order.customerName || 'İsimsiz Müşteri'}
                </p>
                <p className="text-sm text-gray-600">
                  {order.customerPhone || 'Telefon yok'}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Teslimat Adresi</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress || 'Adres belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sipariş Notları */}
          {(order.notes || order.statusNotes) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notlar</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                {order.notes && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Sipariş Notu</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
                {order.statusNotes && (
                  <div>
                    <p className="text-xs text-gray-500">Durum Notu</p>
                    <p className="text-sm">{order.statusNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sipariş Ürünleri */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sipariş Ürünleri</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birim Fiyat
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                  <Icon name="Package" size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name || item.productName}
                                </div>
                                {item.sku && (
                                  <div className="text-xs text-gray-500">
                                    SKU: {item.sku}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900">{item.quantity} {item.unit || 'adet'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(item.price || item.unitPrice || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency((item.price || item.unitPrice || 0) * item.quantity)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                          Ürün bilgisi bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Ödeme Özeti</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ara Toplam</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(order.subtotal || order.total || 0)}
                  </span>
                </div>
                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kargo Ücreti</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">KDV</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.taxAmount)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">İndirim</span>
                    <span className="text-sm font-medium text-green-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Toplam</span>
                    <span className="text-base font-bold text-blue-600">
                      {formatCurrency(order.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sipariş Durumu Takibi */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sipariş Durumu</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6 relative">
                  {/* Sipariş Alındı */}
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} z-10`}>
                      <Icon name="Check" size={16} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Sipariş Alındı</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                  </div>

                  {/* Onaylandı */}
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Onaylandı', 'Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} z-10`}>
                      {['Onaylandı', 'Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <Icon name="Clock" size={16} />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Sipariş Onaylandı</h4>
                      {['Onaylandı', 'Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.statusUpdates?.confirmed || order.updatedAt || '')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">Bekleniyor</p>
                      )}
                    </div>
                  </div>

                  {/* Hazırlanıyor */}
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} z-10`}>
                      {['Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <Icon name="Clock" size={16} />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Hazırlanıyor</h4>
                      {['Hazırlanıyor', 'Hazır', 'Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.statusUpdates?.preparing || '')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">Bekleniyor</p>
                      )}
                    </div>
                  </div>

                  {/* Kargoya Verildi */}
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} z-10`}>
                      {['Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <Icon name="Clock" size={16} />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Kargoya Verildi</h4>
                      {['Kargoya Verildi', 'Teslim Edildi'].includes(order.status) ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.statusUpdates?.shipped || '')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">Bekleniyor</p>
                      )}
                    </div>
                  </div>

                  {/* Teslim Edildi */}
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'Teslim Edildi' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} z-10`}>
                      {order.status === 'Teslim Edildi' ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <Icon name="Clock" size={16} />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Teslim Edildi</h4>
                      {order.status === 'Teslim Edildi' ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.statusUpdates?.delivered || '')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">Bekleniyor</p>
                      )}
                    </div>
                  </div>

                  {/* İptal Edildi (Koşullu) */}
                  {order.status === 'İptal Edildi' && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 z-10">
                        <Icon name="X" size={16} />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">İptal Edildi</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.statusUpdates?.cancelled || order.updatedAt || '')}
                        </p>
                        {order.cancelReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Neden: {order.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kapat
          </button>
          {canCancel(order) && (
            <button
              onClick={() => onCancel(order)}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Siparişi İptal Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiparisDetayModali;