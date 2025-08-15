import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import Icon from '../../../../shared/components/AppIcon';
import MobilePromoCard from '../../../../shared/components/mobile/MobilePromoCard';
import { logger } from '../../../../utils/productionLogger';

const MobileCatalog = () => {
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { showSuccess } = useNotification();
  const { userProfile } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tumunu');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const totalCartItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Kategoriler - Kaydırılabilir
  const categories = [
    {
      id: 'tumunu',
      name: 'Tümü',
      emoji: '🛒'
    },
    {
      id: 'sebzeler',
      name: 'Sebzeler',
      emoji: '🥬'
    },
    {
      id: 'meyveler',
      name: 'Meyveler',
      emoji: '🍎'
    },
    {
      id: 'kasali',
      name: 'Kasalı Ürünler',
      emoji: '📦'
    }
  ];

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, favorites]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const savedProducts = storage.get('products', []);

      // Web ile aynı filtreleme mantığı - daha esnek
      const activeProducts = savedProducts
        .filter(product => {
          // Ürün aktif mi kontrolü - web ile aynı mantık
          const isActive = product.isActive === true ||
            product.status === 'active' ||
            product.status === 'available' ||
            (!product.hasOwnProperty('isActive') && !product.hasOwnProperty('status'));

          // Stok kontrolü - 0 stok da göster
          const hasValidStock = product.stock >= 0;

          return isActive && hasValidStock;
        })
        .map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          unit: product.unit || 'adet',
          image: product.image || getProductImagePath(product.name), // Önce satıcı resmini kullan, fallback olarak default
          category: product.category || 'Genel',
          subcategory: product.subcategory || '',
          stock: parseInt(product.stock) || 0,
          isAvailable: product.stock > 0,
          isOrganic: product.description?.toLowerCase().includes('organik') || false,
          description: product.description || `${product.name} - Taze ve kaliteli`,
          rating: 4.2 + Math.random() * 0.6,

        }));

      setProducts(activeProducts);
      logger.info(`📱 Mobil: ${activeProducts.length} ürün yüklendi (Web ile senkron)`);
    } catch (error) {
      logger.error('Mobil ürün yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = storage.get(`favorites_${userProfile?.id || 'guest'}`, []);
      setFavorites(savedFavorites);
      logger.info(`📱 ${savedFavorites.length} favori ürün yüklendi`);
    } catch (error) {
      logger.error('Favoriler yükleme hatası:', error);
    }
  };

  const toggleFavorite = (productId) => {
    try {
      const userId = userProfile?.id || 'guest';
      let updatedFavorites;

      if (favorites.includes(productId)) {
        updatedFavorites = favorites.filter(id => id !== productId);
        showSuccess('Favorilerden kaldırıldı');
      } else {
        updatedFavorites = [...favorites, productId];
        showSuccess('Favorilere eklendi');
      }

      setFavorites(updatedFavorites);
      storage.set(`favorites_${userId}`, updatedFavorites);
    } catch (error) {
      logger.error('Favori güncelleme hatası:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Kategori filtresi
    if (selectedCategory && selectedCategory !== 'tumunu') {
      filtered = filtered.filter(product => {
        const productCategory = product.category.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();

        return productCategory.includes(selectedCat) ||
          productCategory === selectedCat ||
          (selectedCat === 'sebzeler' && (productCategory.includes('sebze') || productCategory.includes('yeşil'))) ||
          (selectedCat === 'meyveler' && (productCategory.includes('meyve') || productCategory.includes('fruit'))) ||
          (selectedCat === 'kasali' && (productCategory.includes('kasalı') || productCategory.includes('kasali') || productCategory === 'Kasalı Ürünler'));
      });
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Kırılmazlar Header */}
      <div className="bg-white px-4 pt-12 pb-6">
        {/* Top Bar - Logo & Icons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="/assets/images/logo/KirilmazlarLogo.png"
              alt="Kırılmazlar"
              className="h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="text-2xl font-bold text-green-600 hidden">Kırılmazlar</span>
          </div>

          <div className="flex items-center space-x-4">

            <button className="relative">
              <Icon name="Bell" size={20} className="text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <button
              onClick={() => navigate('/m/profile')}
              className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <Icon name="User" size={16} className="text-orange-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="Search" size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Icon name="Mic" size={20} className="text-teal-500" />
          </div>
        </div>

        {/* Promo Banner */}
        <MobilePromoCard
          title="Hafta Sonu"
          subtitle="%25 İndirim"
          description="Tüm Ürünlerde"
          icon="🛒"
        />

        {/* Categories */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Kategoriler</h3>
            {/* Categories page navigation removed */}
          </div>
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all w-20 h-20 ${selectedCategory === category.id
                  ? 'bg-green-200 shadow-md'
                  : 'bg-green-100 shadow-sm hover:bg-green-150 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span className="text-2xl">
                    {category.emoji}
                  </span>
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${selectedCategory === category.id ? 'text-green-700' : 'text-green-600'
                  }`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory === 'tumunu' ? 'Tüm Ürünler' :
                selectedCategory === 'sebzeler' ? 'Sebzeler' :
                  selectedCategory === 'meyveler' ? 'Meyveler' :
                    selectedCategory === 'kasali' ? 'Kasalı Ürünler' : 'Ürünler'}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} ürün bulundu
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className={`text-green-500 text-sm font-medium flex items-center space-x-1 ${isRefreshing ? 'animate-pulse' : ''}`}
          >
            <Icon name="RefreshCw" size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded h-4 mb-2"></div>
                    <div className="bg-gray-200 rounded h-3 w-2/3 mb-2"></div>
                    <div className="bg-gray-200 rounded h-4 w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Package" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Arama kriterlerinize uygun ürün yok.'
                : 'Bu kategoride ürün bulunmuyor.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('tumunu');
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-medium"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                {/* Ürün Resmi - Kompakt */}
                <div className="relative mb-3">
                  <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src = '/assets/images/placeholders/product-placeholder.png';
                      }}
                    />
                  </div>

                  {/* Favorite - Küçük */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center ${favorites.includes(product.id)
                      ? 'bg-red-100 text-red-500'
                      : 'bg-white/80 text-gray-400'
                      }`}
                  >
                    <Icon name="Heart" size={10} className={favorites.includes(product.id) ? 'fill-current' : ''} />
                  </button>


                </div>

                {/* Ürün Bilgileri - Kompakt */}
                <div>
                  {/* Ürün Adı */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Birim */}
                  <p className="text-xs text-gray-500 mb-2">{product.unit}</p>

                  {/* Alt Kısım - Fiyat ve Sepet */}
                  <div className="flex items-center justify-between">
                    {/* Fiyat */}
                    <div>
                      <span className="text-base font-bold text-orange-500">
                        ₺{product.price}
                      </span>

                    </div>

                    {/* Sepet Butonu - Küçük ve Yeşil */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${product.isAvailable
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <Icon name="ShoppingCart" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCatalog;