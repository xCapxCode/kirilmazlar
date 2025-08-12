import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import Icon from '../../../../shared/components/AppIcon';
import { logger } from '../../../../utils/productionLogger';

const MobileCart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart, addNewOrder } = useCart();
  const { userProfile } = useAuth();
  const { showSuccess, showError } = useNotification();



  const [isLoading, setIsLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const deliveryFee = 5.00;
  const minimumOrderAmount = 25.00;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;
  const isMinimumMet = subtotal >= minimumOrderAmount;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!isMinimumMet) return;

    setIsLoading(true);
    try {
      const orderData = {
        customerId: userProfile?.id,
        customerName: userProfile?.name || 'Mobil Müşteri',
        customerEmail: userProfile?.email || 'mobil@demo.com',
        customerPhone: userProfile?.phone || '0555 000 0000',
        total: total,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          total: item.total || (item.price * item.quantity)
        })),
        deliveryAddress: userProfile?.address || 'Mobil Adres',
        paymentMethod: 'cash',
        notes: orderNotes
      };

      const orderNumber = await addNewOrder(orderData);
      showSuccess(`Siparişiniz alındı! Sipariş No: ${orderNumber}`);
      clearCart();
      navigate('/m/orders');
    } catch (error) {
      logger.error('Mobil checkout hatası:', error);
      showError('Sipariş verilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!items || items.length === 0) {
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
                <Icon name="ShoppingCart" size={32} className="text-green-600" />
              </div>

              <h1 className="text-xl font-medium text-white mb-2">Sepetim</h1>
              <p className="text-white/80 text-sm">Henüz ürün eklenmemiş</p>
            </div>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="px-4 -mt-4 pb-24 relative z-20">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all">
              <Icon name="ShoppingCart" size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Sepetiniz boş</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">Alışverişe başlamak için ürün ekleyin</p>
            <button
              onClick={() => navigate('/m/catalog')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white/30 shadow-2xl">
              <Icon name="ShoppingCart" size={24} className="text-white" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Sepetim</h1>
            <p className="text-white/80 text-sm">{items.length} ürün • {formatPrice(total)}</p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">{items.length}</div>
                <div className="text-white/70 text-xs">Ürün</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {formatPrice(subtotal)}
                </div>
                <div className="text-white/70 text-xs">Toplam</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {formatPrice(deliveryFee)}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Cart Items */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <img
                  src={item.image || '/assets/images/placeholders/product-placeholder.png'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = '/assets/images/placeholders/product-placeholder.png';
                  }}
                />

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.unit}</p>
                  <p className="text-sm font-bold text-orange-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <Icon name="Minus" size={14} className="text-gray-600" />
                  </button>

                  <span className="w-8 text-center font-semibold text-gray-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"
                  >
                    <Icon name="Plus" size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Order Notes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Sipariş Notu</h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Özel talimatlarınızı yazın..."
              className="w-full p-3 bg-gray-50 rounded-xl border-0 resize-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>
        </div>

        {/* Checkout Summary */}
        <div className="bg-white border-t border-gray-100 p-4 space-y-4">
          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Teslimat Ücreti</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Toplam</span>
                <span className="font-bold text-orange-600 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Minimum Order Warning */}
          {!isMinimumMet && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-sm text-yellow-800">
                Minimum sipariş tutarı {formatPrice(minimumOrderAmount)}.
                {formatPrice(minimumOrderAmount - subtotal)} daha eklemelisiniz.
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={!isMinimumMet || isLoading}
            className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${isMinimumMet && !isLoading
              ? 'bg-orange-500 hover:bg-orange-600 shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Icon name="RefreshCw" size={20} className="animate-spin" />
                <span>Sipariş Veriliyor...</span>
              </div>
            ) : (
              `Siparişi Tamamla • ${formatPrice(total)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCart;