import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import Icon from '../../../../shared/components/AppIcon';
import Image from '../../../../shared/components/AppImage';
import Header from '../../../../shared/components/ui/Header';
import BottomTabNavigation from '../../../../shared/components/ui/BottomTabNavigation';

const ShoppingCartCheckout = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart,
    addNewOrder 
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showPrices, setShowPrices] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Bülent Üner',
    phone: '+90 555 123 4567',
    email: 'admin@demo.com'
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: 'Atatürk Caddesi No: 123',
    district: 'Kadıköy',
    city: 'İstanbul',
    postalCode: '34710'
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Debug mode için localStorage temizleme
  const clearAllLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Fiyat görünürlüğü ayarlarını localStorage'dan yükle
  useEffect(() => {
    const savedPriceSettings = localStorage.getItem('priceSettings');
    if (savedPriceSettings) {
      const priceSettings = JSON.parse(savedPriceSettings);
      setShowPrices(priceSettings.showPrices !== false); // Default true
    }
  }, []);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'priceSettings') {
        const savedPriceSettings = localStorage.getItem('priceSettings');
        if (savedPriceSettings) {
          const priceSettings = JSON.parse(savedPriceSettings);
          setShowPrices(priceSettings.showPrices !== false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const deliveryFee = 5.00;
  const minimumOrderAmount = 25.00;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;
  const isMinimumMet = subtotal >= minimumOrderAmount;

  const handleCheckout = async () => {
    if (!isMinimumMet) return;

    setIsLoading(true);
    
    // Create order data
    const orderData = {
      total: total,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        total: item.total
      })),
      deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.district}, ${deliveryAddress.city}`,
      notes: orderNotes
    };

    // Simulate checkout process
    setTimeout(() => {
      try {
        console.log('Sipariş veriliyor:', orderData);
        const orderId = addNewOrder(orderData);
        console.log('Sipariş ID:', orderId);
        
        setOrderNumber(orderId);
        setOrderConfirmed(true);
        setIsLoading(false);
        clearCart();
        
        console.log('Checkout tamamlandı');
      } catch (error) {
        console.error('Checkout hatası:', error);
        setIsLoading(false);
      }
    }, 2000);
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-200">
        <Header />
        <BottomTabNavigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Başlık Bandı */}
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-600">Sipariş Onaylandı!</h1>
                <p className="text-gray-600 mt-1">Siparişiniz için teşekkürler. Özenle hazırlayacağız.</p>
              </div>
            </div>
          </div>

          {/* Sipariş Detayları */}
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">Sipariş Numarası</p>
                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">Toplam Tutar</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">Tahmini Teslimat</p>
                <p className="text-xl font-bold text-gray-900">Bugün, 14:00-16:00</p>
              </div>
            </div>
          </div>

          {/* Aksiyonlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/customer/orders"
              className="bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-center hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="Package" size={20} />
              <span>Sipariş Takibi</span>
            </Link>
            
            <Link
              to="/customer/catalog"
              className="bg-white border-2 border-green-600 text-green-600 py-4 px-6 rounded-lg font-medium text-center hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="ShoppingCart" size={20} />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-200">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Başlık Bandı - Boş sepet için de göster */}
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Icon name="ShoppingCart" size={24} className="text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-green-600">Sepetim</h1>
                  <p className="text-gray-600 mt-1">
                    Sepetiniz boş • Alışverişe başlayın
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Icon name="ShoppingCart" size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sepetiniz boş</h2>
            <p className="text-gray-600 mb-8">Başlamak için taze ürünler ekleyin</p>
            
            <Link
              to="/customer/catalog"
              className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Ürünlere Göz At</span>
            </Link>
          </div>
        </div>
        
        <BottomTabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Header />
      <BottomTabNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="ShoppingCart" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Sepetim</h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length} ürün • Toplam: {formatPrice(getCartTotal())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Boş Sepet */
          <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
            <div className="text-center">
              <Icon name="ShoppingCart" size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Sepetiniz boş</h3>
              <p className="text-gray-500 mb-8">
                Alışverişe başlamak için ürün kataloğuna göz atın.
              </p>
              <Link
                to="/customer/catalog"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
              >
                <Icon name="Package" size={20} />
                <span>Ürünleri İncele</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sepet İçeriği */}
            <div className="lg:col-span-2 space-y-4">
              {/* Sepet Ürünleri */}
              <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sepet İçeriği</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    // Veri doğrulama
                    const validItem = {
                      ...item,
                      quantity: Number(item.quantity) || 1,
                      price: Number(item.price) || 0,
                      total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 1)
                    };
                    
                    return (
                      <div key={validItem.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <Image
                            src={validItem.image || validItem.image_url || '/assets/images/placeholders/product-placeholder.png'}
                            alt={validItem.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            fallback="/assets/images/placeholders/product-placeholder.png"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{validItem.name}</h3>
                          <p className="text-sm text-gray-500">{validItem.unit}</p>
                          {showPrices && (
                            <p className="text-sm font-semibold text-green-600">{formatPrice(validItem.price)}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(validItem.id, validItem.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                          >
                            <Icon name="Minus" size={16} />
                          </button>
                          
                          <span className="w-12 text-center font-semibold text-gray-900">
                            {validItem.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(validItem.id, validItem.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                          >
                            <Icon name="Plus" size={16} />
                          </button>
                        </div>
                        
                        {showPrices && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatPrice(validItem.total)}</p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => removeFromCart(validItem.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="space-y-4">
              <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
                
                <div className="space-y-3 mb-4">
                  {showPrices && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teslimat Ücreti</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">Toplam</span>
                          <span className="text-lg font-bold text-green-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!isMinimumMet && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      Minimum sipariş tutarı {formatPrice(minimumOrderAmount)}. 
                      {formatPrice(minimumOrderAmount - subtotal)} daha eklemelisiniz.
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sipariş Notu (Opsiyonel)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Özel talimatlarınızı yazın..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!isMinimumMet || isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isMinimumMet && !isLoading
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="RefreshCw" size={20} className="animate-spin" />
                      <span>Sipariş Veriliyor...</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="ShoppingBag" size={20} />
                      <span>Siparişi Tamamla</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Sipariş vererek kullanım koşullarını kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sepet Temizleme Onayı */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Sepeti Temizle</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Sepetinizdeki tüm ürünler kaldırılacak. Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartCheckout;
