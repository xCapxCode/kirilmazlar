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

  // Dinamik kategoriler
  const [dynamicCategories, setDynamicCategories] = useState([
    { id: 'all', name: 'Tümü', icon: 'Grid3X3', count: 0 }
  ]);

  useEffect(() => {
    loadProducts();
  }, []);

  // Kategori filtresi
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory]);

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
            count: 0
          });
        }
        categoryMap.get(categoryId).count++;
      });

      setDynamicCategories(Array.from(categoryMap.values()));
      setCategories(Array.from(categoryMap.values()));

    } catch (error) {
      logger.error('Ürünler yüklenirken hata:', error);
      setProducts([]);
      setCategories([{ id: 'all', name: 'Tümü', icon: 'Grid3X3', count: 0 }]);
      setDynamicCategories([{ id: 'all', name: 'Tümü', icon: 'Grid3X3', count: 0 }]);
    }

    setIsLoading(false);
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Sebzeler': 'Carrot',
      'Meyveler': 'Apple',
      'Yeşil Yapraklılar': 'Leaf',
      'Otlar': 'Flower',
      'Organik': 'Heart'
    };
    return iconMap[categoryName] || 'Package';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    showSuccess(`${product.name} sepete eklendi!`);
  };

  const handleQuickAdd = (product) => {
    handleAddToCart(product, 1);
  };

  const handleProductClick = (product) => {
    // Modal açma işlemi - şimdilik console log
    logger.info('Ürün detayı:', product);
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-app">
      {/* Categories - Fixed positioning for stable scrolling */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <MobileCategoryChips
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-4 bg-white">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Products Grid - Optimized for mobile viewing */}
      <div className="px-4 py-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-sm">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Icon name="Package" size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {selectedCategory === 'all'
                ? 'Henüz ürün eklenmemiş'
                : 'Bu kategoride ürün yok'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                handleRefresh();
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium text-sm touch-target mobile-btn"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onQuickAdd={handleQuickAdd}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Refresh Button - Enhanced for mobile */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="fixed bottom-24 right-4 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center mobile-btn touch-target-lg z-50"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(34, 197, 94, 0.3))',
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <Icon
          name="RefreshCw"
          size={22}
          className={`${isRefreshing ? 'animate-spin' : ''} text-white`}
        />
      </button>
    </div>
  );
};

export default MobileCatalog;
