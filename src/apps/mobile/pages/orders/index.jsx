import storage from '@core/storage';
import { useEffect, useState } from 'react';
import Icon from '../../../../shared/components/AppIcon';

const MobileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setIsLoading(true);

    // Storage'dan siparişleri al
    const savedOrders = storage.get('orders', []);

    // Demo data ekle eğer sipariş yoksa
    if (savedOrders.length === 0) {
      const demoOrders = [
        {
          id: '2025-001',
          date: '2025-01-27',
          status: 'delivered',
          total: 145.50,
          items: [
            { name: 'Ananas', quantity: 2, price: 35.00 },
            { name: 'Armut', quantity: 3, price: 16.00 },
          ]
        },
        {
          id: '2025-002',
          date: '2025-01-26',
          status: 'processing',
          total: 89.75,
          items: [
            { name: 'Avakado', quantity: 1, price: 40.00 },
            { name: 'Elma', quantity: 2, price: 24.75 },
          ]
        }
      ];
      setOrders(demoOrders);
    } else {
      setOrders(savedOrders);
    }

    setTimeout(() => setIsLoading(false), 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'processing':
        return 'Hazırlanıyor';
      case 'cancelled':
        return 'İptal Edildi';
      case 'pending':
        return 'Beklemede';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm w-full max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="ShoppingBag" size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Henüz Sipariş Yok</h2>
          <p className="text-gray-600 mb-6 text-sm">
            İlk siparişinizi vererek alışverişe başlayın!
          </p>
          <button
            onClick={() => window.location.href = '/m/catalog'}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">
          Siparişlerim ({orders.length})
        </h1>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Sipariş #{order.id}
                </h3>
                <p className="text-gray-500 text-xs">
                  {formatDate(order.date)}
                </p>
              </div>

              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-2 mb-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Toplam:</span>
              <span className="font-bold text-green-600 text-lg">
                ₺{order.total.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Detayları Gör
              </button>

              {order.status === 'delivered' && (
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  Tekrar Sipariş Ver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pull to Refresh */}
      <div className="p-4 text-center">
        <button
          onClick={loadOrders}
          className="text-green-600 text-sm font-medium flex items-center space-x-2 mx-auto"
        >
          <Icon name="RefreshCw" size={16} />
          <span>Yenile</span>
        </button>
      </div>
    </div>
  );
};

export default MobileOrders;
