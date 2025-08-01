import { useState } from 'react';
import Icon from '../../../shared/components/AppIcon';
import Image from '../../../shared/components/AppImage';

const MobileProductCard = ({
  product,
  onQuickAdd,
  onAddToCart,
  onProductClick
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product, 1);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onQuickAdd(product);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div
      className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 active:scale-[0.97] transition-all duration-300 ease-out touch-manipulation hover:shadow-2xl hover:bg-white/90"
      onClick={() => onProductClick(product)}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Product Image */}
      <div className="relative mb-4">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative shadow-inner">
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Package" size={32} className="text-gray-300" />
            </div>
          )}

          {/* Loading Overlay */}
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Stock Badge - Modern */}
        <div className="absolute top-3 right-3">
          {product.isAvailable ? (
            <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/20">
              Stokta
            </div>
          ) : (
            <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/20">
              Tükendi
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 border border-white/50"
        >
          <Icon
            name="Heart"
            size={16}
            className={`transition-colors duration-200 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem] flex items-start group-hover:text-green-600 transition-colors duration-200">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-green-600 leading-none">
              ₺{product.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
              <Icon name="Package" size={12} className="text-gray-400" />
              {product.unit} • {product.stock} adet
            </p>
          </div>

          {/* Action Buttons - Modern */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleQuickAdd}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-green-600 transition-all duration-200 rounded-xl hover:bg-green-50 active:scale-95 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Icon name="Plus" size={16} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 touch-manipulation shadow-md ${product.isAvailable
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Icon name="ShoppingCart" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProductCard;
