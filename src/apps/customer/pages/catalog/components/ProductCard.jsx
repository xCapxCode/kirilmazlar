import React, { useState } from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const ProductCard = ({ product, onQuickAdd, onProductClick, layout = 'vertical' }) => {
  const [quantity, setQuantity] = useState(0); // Default olarak 0
  
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

  // Toplam fiyat hesaplama
  const totalPrice = quantity * discountedPrice;

  // Horizontal layout için farklý yapý
  if (layout === 'horizontal') {
    return (
      <div className="bg-slate-100 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
        <div className="p-4">
          {/* Üst Kýsým: Resim + Bilgiler + Fiyat + Sepet */}
          <div className="flex items-center justify-between mb-4">
            {/* Sol Kýsým: Resim + Bilgiler */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Ürün Resmi */}
              <div 
                className="relative w-20 h-16 aspect-[5/4] flex-shrink-0 overflow-hidden cursor-pointer rounded-lg bg-gray-50"
                onClick={() => onProductClick(product)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                />
                
                {/* Badges */}
                <div className="absolute top-1 left-1 flex flex-col space-y-1">
                  {product.isOrganic && (
                    <span className="bg-green-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                      Organik
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Stokta Yok
                    </span>
                  </div>
                )}
              </div>

              {/* Ürün Bilgileri */}
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-semibold text-gray-900 text-base mb-1 cursor-pointer hover:text-green-600 transition-colors truncate"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={12}
                        className={i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.rating})
                  </span>
                </div>
              </div>
            </div>

            {/* Sað Kýsým: Birim Fiyat + Sepet Butonu */}
            <div className="flex items-center space-x-3">
              {/* Birim Fiyat */}
              <div className="text-right">
                {product.discount > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-green-600">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                )}
                <div className="text-xs text-gray-500">
                  / {product.unit}
                </div>
              </div>
              
              {/* Sepete Ekle Butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantity > 0) {
                    onQuickAdd(quantity); // Sadece quantity parametresini gönder
                  }
                }}
                disabled={!product.isAvailable || quantity === 0}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  product.isAvailable && quantity > 0
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Icon name="ShoppingCart" size={18} />
              </button>
            </div>
          </div>

          {/* Alt Kýsým: Miktar Seçici Sol - Stok Bilgisi Orta - Fiyat Sað */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              {/* Miktar Seçici - Sol taraf */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityDecrease();
                    }}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="Minus" size={16} />
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-bold text-gray-900 border-x border-gray-200 min-w-[80px] text-center">
                    {quantity} {product.unit}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityIncrease();
                    }}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                
                {/* Stok Bilgisi - Miktar seçicinin yanýnda */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">
                    Stok: {product.stock}
                  </span>
                  {product.stock <= 10 && product.stock > 0 && (
                    <span className="text-xs text-orange-500 font-medium">Az Kaldý</span>
                  )}
                </div>
              </div>

              {/* Toplam Fiyat - Sað taraf */}
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {quantity > 0 ? formatPrice(totalPrice) : formatPrice(0)}
                </div>
                {quantity > 0 && (
                  <div className="text-xs text-gray-500">
                    {formatPrice(discountedPrice)} / {product.unit}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout (eski tasarým) - geriye dönük uyumluluk için
  return (
    <div className="bg-slate-100 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Ürün Resmi */}
      <div 
        className="relative aspect-[5/4] overflow-hidden cursor-pointer bg-gray-50"
        onClick={() => onProductClick(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isOrganic && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              Organik
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-full">
              Stokta Yok
            </span>
          </div>
        )}

        {/* Quick Add Button */}
        {product.isAvailable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="absolute bottom-2 right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700"
          >
            <Icon name="Plus" size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Ürün Bilgileri */}
      <div className="p-4">
        <h3 
          className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600 transition-colors"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={12}
                className={i < Math.floor(product.rating) 
                  ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({product.rating})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-semibold text-green-600">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-green-600">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {product.unit}
          </span>
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span>Stok: {product.stock} {product.unit}</span>
          {product.stock <= 10 && product.stock > 0 && (
            <span className="text-orange-500 font-medium">Az Kaldý</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onQuickAdd(product)}
          disabled={!product.isAvailable}
          className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
            product.isAvailable
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.isAvailable ? 'Sepete Ekle' : 'Stokta Yok'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
