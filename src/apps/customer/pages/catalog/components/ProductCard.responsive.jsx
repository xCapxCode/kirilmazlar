import { memoComparisonHelpers, trackRender } from '@utils/memoizationHelpers';
import React, { useState } from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const MobileProductCard = ({ product, onQuickAdd, onAddToCart, onProductClick }) => {
  trackRender('MobileProductCard');

  const [quantity, setQuantity] = useState(0);

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => prev > 0 ? prev - 1 : 0);
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity);
      setQuantity(0); // Reset after adding
    }
  };

  const totalPrice = quantity * discountedPrice;

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-mobile-sm hover:shadow-mobile-md transition-all duration-200 touch-manipulation">
      {/* Ürün Resmi */}
      <div
        className="relative aspect-square w-full bg-gray-50 cursor-pointer overflow-hidden"
        onClick={() => onProductClick(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-secondary-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            %{product.discount}
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-mobile-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Add to favorites
            }}
          >
            <Icon name="Heart" size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="p-3">
        {/* Ürün Adı ve Kategori */}
        <div className="mb-2">
          <h3
            className="font-medium text-gray-900 text-sm line-clamp-2 cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
        </div>

        {/* Fiyat Bilgisi */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">/{product.unit}</p>
        </div>

        {/* Stok Bilgisi */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Stok: {product.stock} {product.unit}</span>
            {product.stock <= 10 && product.stock > 0 && (
              <span className="text-amber-600 font-medium">Az stok!</span>
            )}
          </div>
        </div>

        {/* Miktar ve Sepet Kontrolü */}
        {quantity === 0 ? (
          <button
            onClick={handleQuantityIncrease}
            disabled={product.stock === 0}
            className="w-full h-touch bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors touch-manipulation"
          >
            {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </button>
        ) : (
          <div className="space-y-2">
            {/* Miktar Kontrolleri */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
              <button
                onClick={handleQuantityDecrease}
                className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors touch-manipulation"
              >
                <Icon name="Minus" size={16} className="text-gray-600" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-semibold text-gray-900">{quantity}</span>
                <span className="text-xs text-gray-500">{product.unit}</span>
              </div>

              <button
                onClick={handleQuantityIncrease}
                disabled={quantity >= product.stock}
                className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <Icon name="Plus" size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Toplam Fiyat ve Sepete Ekle */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">
                  {formatPrice(totalPrice)}
                </div>
                <div className="text-xs text-gray-500">
                  Toplam fiyat
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 h-10 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors touch-manipulation flex items-center justify-center gap-1"
              >
                <Icon name="ShoppingCart" size={16} />
                <span className="text-sm">Sepete Ekle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ana ProductCard komponenti - responsive davranış
const ProductCard = ({ product, onQuickAdd, onAddToCart, onProductClick, layout = 'vertical' }) => {
  // Performance tracking
  trackRender('ProductCard');

  const [quantity, setQuantity] = useState(0);

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => prev > 0 ? prev - 1 : 0);
  };

  const totalPrice = quantity * discountedPrice;

  // Mobil görünüm kontrolü (Tailwind breakpoint kullanarak)
  return (
    <>
      {/* Mobil görünüm (md altı) */}
      <div className="md:hidden">
        <MobileProductCard
          product={product}
          onQuickAdd={onQuickAdd}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
        />
      </div>

      {/* Desktop görünüm (md ve üstü) - Mevcut tasarım korunuyor */}
      <div className="hidden md:block">
        {/* Horizontal layout için farklı yapı */}
        {layout === 'horizontal' ? (
          <div className="bg-slate-100 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
            <div className="p-4">
              {/* Üst Kısım: Resim + Bilgiler + Fiyat + Sepet */}
              <div className="flex items-center justify-between mb-4">
                {/* Sol Kısım: Resim + Bilgiler */}
                <div className="flex items-center space-x-4 flex-1">
                  {/* Ürün Resmi */}
                  <div
                    className="relative w-20 h-16 aspect-[5/4] flex-shrink-0 overflow-hidden cursor-pointer rounded-lg bg-gray-50"
                    onClick={() => onProductClick(product)}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {product.discount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        %{product.discount}
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-gray-900 text-sm mb-1 cursor-pointer hover:text-green-600 transition-colors line-clamp-1"
                      onClick={() => onProductClick(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Stok: {product.stock} {product.unit}</span>
                      {product.stock <= 10 && product.stock > 0 && (
                        <span className="text-amber-600 font-medium px-2 py-0.5 bg-amber-50 rounded-full">
                          Az stok!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fiyat Bilgisi */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(discountedPrice)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">/{product.unit}</p>
                  </div>
                </div>

                {/* Sağ Kısım: Miktar ve Sepet Kontrolleri */}
                <div className="ml-4 flex-shrink-0">
                  {quantity === 0 ? (
                    <button
                      onClick={handleQuantityIncrease}
                      disabled={product.stock === 0}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      {/* Miktar Kontrolleri */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button
                          onClick={handleQuantityDecrease}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition-colors"
                        >
                          <Icon name="Minus" size={14} className="text-gray-600" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
                        <button
                          onClick={handleQuantityIncrease}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                        >
                          <Icon name="Plus" size={14} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Sepete Ekle Butonu */}
                      <button
                        onClick={() => {
                          onAddToCart(product, quantity);
                          setQuantity(0);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Icon name="ShoppingCart" size={14} />
                        Sepete Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Kısım: Toplam Fiyat */}
              {quantity > 0 && (
                <div className="text-right border-t border-gray-200 pt-2">
                  <span className="text-sm text-gray-600 mr-2">Toplam:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vertical layout (Desktop)
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
            {/* Ürün Resmi */}
            <div
              className="relative w-full aspect-[5/4] overflow-hidden cursor-pointer bg-gray-50"
              onClick={() => onProductClick(product)}
            >
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  %{product.discount}
                </div>
              )}
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-3.5">
              {/* Ürün Adı ve Kategori */}
              <div className="mb-2.5">
                <h3
                  className="font-medium text-gray-900 text-sm mb-1 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>

              {/* Fiyat Bilgisi */}
              <div className="mb-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(discountedPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">/{product.unit}</p>
              </div>

              {/* Stock Info */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2.5">
                <span>Stok: {product.stock} {product.unit}</span>
                {product.stock <= 10 && product.stock > 0 && (
                  <span className="text-amber-600 font-medium">Az stok!</span>
                )}
              </div>

              {/* Miktar ve Sepet Kontrolü */}
              {quantity === 0 ? (
                <button
                  onClick={handleQuantityIncrease}
                  disabled={product.stock === 0}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                </button>
              ) : (
                <div className="space-y-2">
                  {/* Miktar Kontrolleri */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={handleQuantityDecrease}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Icon name="Minus" size={14} className="text-gray-600" />
                    </button>
                    <div className="text-center">
                      <span className="font-medium text-gray-900">{quantity}</span>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <button
                      onClick={handleQuantityIncrease}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon name="Plus" size={14} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Toplam Fiyat ve Sepete Ekle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">Toplam</div>
                    </div>
                    <button
                      onClick={() => {
                        onAddToCart(product, quantity);
                        setQuantity(0);
                      }}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="ShoppingCart" size={14} />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(ProductCard, memoComparisonHelpers.deepEqual);
