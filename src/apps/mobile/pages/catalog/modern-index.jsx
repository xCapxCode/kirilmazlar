import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
// import { migrateCategoryIds } from '@utils/productLoader'; // DEVRE DIŞI - HARDCODED DATA KULLANILMAZ
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import Icon from '../../../../shared/components/AppIcon';
import MobileCategoryChips from '../../components/MobileCategoryChips';
import MobileProductCard from '../../components/MobileProductCard';

const MobileCatalog = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { addToCart, items } = useCart();
  const { showSuccess } = useNotification();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dinamik kategoriler
  const [dynamicCategories, setDynamicCategories] = useState([
    { id: 'all', name: 'Tümü', icon: 'Grid3X3', count: 0 }
  ]);

  useEffect(() => {
    loadProducts();
  }, []);

  // Kategori filtresi
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Storage değişikliklerini dinle
  useEffect(() => {
    const handleProductsUpdate = () => {
      loadProducts();
    };

    const unsubscribe = storage.subscribe('products', handleProductsUpdate);
    return () => unsubscribe();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);

    try {
      // await migrateCategoryIds(); // DEVRE DIŞI - HARDCODED DATA KULLANILMAZ

      const savedProducts = storage.get('products', []);

      let loadedProducts = [];

      if (savedProducts && savedProducts.length > 0) {
        loadedProducts = savedProducts
          .filter(product => {
            const isActive = product.isActive === true ||
              product.status === 'active' ||
              product.status === 'available' ||
              (!product.hasOwnProperty('isActive') && !product.hasOwnProperty('status'));

            const hasValidStock = product.stock >= 0;
            return isActive && hasValidStock;
          })
          .map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            unit: product.unit || 'adet',
            image: getProductImagePath(product.name),
            category: product.category || 'Genel',
            subcategory: product.subcategory || '',
            stock: parseInt(product.stock) || 0,
            isAvailable: product.stock > 0,
            description: product.description || `${product.name} - Taze ve kaliteli`,
            gallery: [getProductImagePath(product.name)]
          }));
      }

      setProducts(loadedProducts);

      // Kategorileri oluştur
      const categoryMap = new Map();
      categoryMap.set('all', { id: 'all', name: 'Tümü', icon: 'Grid3X3', count: loadedProducts.length });

      loadedProducts.forEach(product => {
        const categoryId = product.category.toLowerCase().replace(/\s+/g, '-');
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: product.category,
            icon: getCategoryIcon(product.category),
            count: 1
          });
        } else {
          const category = categoryMap.get(categoryId);
          category.count++;
        }
      });

      setDynamicCategories(Array.from(categoryMap.values()));

    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      showSuccess('Ürünler yüklenirken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    const iconMap = {
      'meyve': 'Apple',
      'sebze': 'Carrot',
      'fruit': 'Apple',
      'vegetable': 'Carrot',
      'genel': 'Package',
      'default': 'Package'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryLower.includes(key)) {
        return icon;
      }
    }
    return iconMap.default;
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
    showSuccess('Ürünler güncellendi! 🎉');
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (!product.isAvailable) {
      showSuccess('Bu ürün stokta bulunmuyor', 'error');
      return;
    }

    addToCart({
      ...product,
      quantity
    });

    showSuccess(`${product.name} sepete eklendi! 🛒`);
  };

  const handleQuickAdd = (product) => {
    handleAddToCart(product, 1);
  };

  const handleProductClick = (product) => {
    console.log('Ürün detayına git:', product);
  };

  return (
    <div className="mobile-app min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">

      {/* TEST MENÜ - EN ÜSTTE */}
      <div className="w-full bg-red-500 text-white p-4 text-center font-bold text-xl">
        🔴 TEST MENÜ - BU GÖRÜNÜYOR MU? 🔴
      </div>

      {/* Modern Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Modern Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white shadow-2xl backdrop-blur-md">
        <div className="safe-area-inset-top"></div>
        <div className="px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="w-12 h-12 bg-white/25 backdrop-blur-lg rounded-3xl flex items-center justify-center mr-4 shadow-xl ring-2 ring-white/20">
                <Icon name="Leaf" size={24} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Kırılmazlar</h1>
                <p className="text-sm text-green-100 font-medium">🌱 Taze • Organik • Kaliteli</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button className="w-11 h-11 hover:bg-white/15 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95 backdrop-blur-sm">
                <Icon name="Heart" size={20} className="text-white" />
              </button>
              <button className="w-11 h-11 hover:bg-white/15 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95 relative backdrop-blur-sm">
                <Icon name="Bell" size={20} className="text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </button>
            </div>
          </div>

          {/* Floating Search Bar */}
          <div className="glass-morphism rounded-3xl p-4 shadow-xl ring-1 ring-white/20">
            <div className="flex items-center space-x-3">
              <Icon name="Search" size={20} className="text-white/90" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hangi ürünü arıyorsunuz?"
                className="flex-1 bg-transparent text-white placeholder-white/70 text-base focus:outline-none font-medium"
              />
              <button className="bg-white/20 rounded-2xl p-2.5 hover:bg-white/30 transition-all duration-200 active:scale-95 backdrop-blur-sm">
                <Icon name="SlidersHorizontal" size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Chips */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-lg">
        <MobileCategoryChips
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Products Grid - Enhanced */}
      <div className="relative z-10 px-4 py-6 pb-32">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Package" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {filteredProducts.length} ürün bulundu
              </p>
              <p className="text-xs text-gray-600">
                {selectedCategory === 'all' ? 'Tüm kategoriler' : dynamicCategories.find(c => c.id === selectedCategory)?.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 backdrop-blur-sm"
          >
            <Icon
              name="RefreshCw"
              size={18}
              className={`${isRefreshing ? 'animate-spin' : ''} text-gray-700`}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 animate-pulse shadow-lg">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-4"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="Package" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ürün bulunamadı</h3>
            <p className="text-gray-600 mb-8 text-base leading-relaxed max-w-sm mx-auto">
              {selectedCategory === 'all'
                ? 'Henüz ürün eklenmemiş. Lütfen daha sonra tekrar deneyin.'
                : 'Bu kategoride ürün yok. Başka kategorilere göz atabilirsiniz.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                handleRefresh();
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <div key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}>
                <MobileProductCard
                  product={product}
                  onQuickAdd={handleQuickAdd}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - Enhanced */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 z-[998] ring-4 ring-white/20 backdrop-blur-sm"
        style={{
          filter: 'drop-shadow(0 8px 24px rgba(34, 197, 94, 0.4))',
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <Icon
          name="RefreshCw"
          size={24}
          className={`${isRefreshing ? 'animate-spin' : ''} text-white drop-shadow-sm`}
        />
      </button>

      {/* MOBILE BOTTOM NAVIGATION - TEST - KIRMIZI ARKA PLAN */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-red-500 border-t-4 border-red-700 shadow-2xl h-20">
        <div className="flex items-center justify-around py-3 px-4 h-full">
          <div className="flex flex-col items-center text-white">
            <Icon name="Home" size={24} className="text-white" />
            <span className="text-xs font-bold text-white">Ana Sayfa</span>
          </div>

          <div className="flex flex-col items-center text-white">
            <Icon name="Grid3X3" size={24} className="text-white" />
            <span className="text-xs font-bold text-white">Kategoriler</span>
          </div>

          <div className="flex flex-col items-center text-white">
            <Icon name="ShoppingCart" size={24} className="text-white" />
            <span className="text-xs font-bold text-white">Sepet</span>
          </div>

          <div className="flex flex-col items-center text-white">
            <Icon name="Package" size={24} className="text-white" />
            <span className="text-xs font-bold text-white">Siparişler</span>
          </div>

          <div className="flex flex-col items-center text-white">
            <Icon name="User" size={24} className="text-white" />
            <span className="text-xs font-bold text-white">Profil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS Animations for blob effect
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);

export default MobileCatalog;
