import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import Icon from '../../../../shared/components/AppIcon';
import { logger } from '../../../../utils/productionLogger';

const MobileFavorites = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess } = useNotification();
  const { userProfile } = useAuth();

  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);

      // Favori ID'leri al
      const savedFavorites = storage.get(`favorites_${userProfile?.id || 'guest'}`, []);
      setFavorites(savedFavorites);

      // Tüm ürünleri al
      const allProducts = storage.get('products', []);

      // Favori ürünleri filtrele
      const favoriteItems = allProducts
        .filter(product => savedFavorites.includes(product.id))
        .map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          unit: product.unit || 'adet',
          image: getProductImagePath(product.name),
          category: product.category || 'Genel',
          stock: parseInt(product.stock) || 0,
          isAvailable: product.stock > 0,
          isOrganic: product.description?.toLowerCase().includes('organik') || false,
          rating: 4.2 + Math.random() * 0.6,

        }));

      setFavoriteProducts(favoriteItems);
      logger.info(`📱 ${favoriteItems.length} favori ürün yüklendi`);
    } catch (error) {
      logger.error('Favoriler yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (productId) => {
    try {
      const userId = userProfile?.id || 'guest';
      const updatedFavorites = favorites.filter(id => id !== productId);

      setFavorites(updatedFavorites);
      storage.set(`favorites_${userId}`, updatedFavorites);

      // Favori ürünler listesinden kaldır
      setFavoriteProducts(prev => prev.filter(product => product.id !== productId));

      showSuccess('Favorilerden kaldırıldı');
    } catch (error) {
      logger.error('Favori güncelleme hatası:', error);
    }
  };

  const handleAddToCart = (product) => {
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        stock: product.stock
      }, 1);
      showSuccess(`${product.name} sepete eklendi!`);
    } catch (error) {
      logger.error('Sepete ekleme hatası:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Hero */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header Content */}
        <div className="relative z-10 px-4 pt-12 pb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/m/catalog')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>

            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />

            <button
              onClick={() => navigate('/m/catalog')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="Plus" size={20} className="text-white" />
            </button>
          </div>

          {/* Hero Content */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Heart" size={24} className="text-green-600 fill-current" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Favorilerim</h1>
            <p className="text-white/80 text-sm">
              {favoriteProducts.length} sevdiğin ürün
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">{favoriteProducts.length}</div>
                <div className="text-white/70 text-xs">Favori</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {favoriteProducts.filter(p => p.isAvailable).length}
                </div>
                <div className="text-white/70 text-xs">Stokta</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {favoriteProducts.length}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-24 relative z-20">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 w-2/3 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 w-1/3"></div>
              </div>
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Icon name="Heart" size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Henüz favori ürün yok
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Beğendiğiniz ürünleri kalp simgesine tıklayarak favorilere ekleyebilirsiniz.
            </p>
            <button
              onClick={() => navigate('/m/catalog')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Icon name="ShoppingCart" size={18} />
              <span>Alışverişe Başla</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                {/* Ürün Resmi */}
                <div className="relative mb-3">
                  <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = '/assets/images/placeholders/product-placeholder.png';
                      }}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">

                    {product.isOrganic && (
                      <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                        Organik
                      </div>
                    )}
                    {!product.isAvailable && (
                      <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                        Stokta Yok
                      </div>
                    )}
                  </div>

                  {/* Remove from Favorites Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    <Icon name="Heart" size={14} className="fill-current" />
                  </button>
                </div>

                {/* Ürün Bilgileri */}
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">
                        {product.rating?.toFixed(1) || '4.5'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>

                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${product.isAvailable
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {product.isAvailable ? 'Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFavorites;