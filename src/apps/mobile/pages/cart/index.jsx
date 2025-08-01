import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import Icon from '../../../../shared/components/AppIcon';
import Image from '../../../../shared/components/AppImage';

const MobileCart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      showSuccess('Ürün sepetten kaldırıldı');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    showSuccess(`${productName} sepetten kaldırıldı`);
  };

  const handleClearCart = () => {
    if (window.confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      clearCart();
      showSuccess('Sepet temizlendi');
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    // Sipariş işlemi simülasyonu
    setTimeout(() => {
      clearCart();
      showSuccess('Siparişiniz başarıyla alındı!');
      setIsLoading(false);
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm w-full max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="ShoppingCart" size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
          </p>
          <Link
            to="/m/catalog"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-sm inline-block hover:bg-green-700 transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Cart Header */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Sepetim ({cartItems.length} ürün)
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 text-sm font-medium"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex space-x-3">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {item.name}
                </h3>
                <p className="text-green-600 font-semibold text-sm">
                  ₺{item.price.toFixed(2)} / {item.unit}
                </p>
                <p className="text-gray-500 text-xs">
                  Toplam: ₺{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item.id, item.name)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <Icon name="Minus" size={14} />
                </button>

                <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center"
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Stok: {item.stock || 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary - Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-900">Toplam:</span>
          <span className="text-xl font-bold text-green-600">
            ₺{getCartTotal().toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-colors ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sipariş Veriliyor...</span>
            </div>
          ) : (
            'Sipariş Ver'
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileCart;
