import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
import { useMemoizedCalculations, useMemoizedCallbacks } from '@utils/memoizationHelpers';
import { migrateCategoryIds } from '@utils/productLoader';
import { logger } from '@utils/productionLogger';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResponsiveGrid } from '../../../../components/ui/ResponsiveComponents';
import { GridSkeleton } from '../../../../components/ui/SkeletonLoaders';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';

import Icon from '@shared/components/AppIcon';
import BottomTabNavigation from '@shared/components/ui/BottomTabNavigation';
import Header from '@shared/components/ui/Header';
import CategoryChips from './components/CategoryChips';
import FilterPanel from './components/FilterPanel';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import QuickAddModal from './components/QuickAddModal';

const CustomerProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showSuccess } = useNotification();
  const { isMobile, isTablet } = useBreakpoint(); // Responsive hook
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // İlk yüklemede true olarak başlat
  const [sortBy, setSortBy] = useState('name_asc');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef(null);

  // Dinamik kategoriler - satıcının eklediği kategorilerden oluşur
  const [dynamicCategories, setDynamicCategories] = useState([
    { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }
  ]);

  useEffect(() => {
    logger.debug('🚀 Initial useEffect - Loading products and categories');
    // State'leri reset et
    setProducts([]);
    setFilteredProducts([]);
    setIsLoading(true);

    // Scroll'u en üste taşı
    window.scrollTo(0, 0);

    // Sonra ürünleri yükle
    loadProducts();
  }, []); // İlk yüklemede çalışsın

  // Ürünleri periyodik olarak yenile
  useEffect(() => {
    // Storage değişikliklerini dinle (unified storage events)
    const handleProductsUpdate = (data) => {
      console.log('📢 Ürünler güncellendi event alındı');
      loadProducts();
    };

    // Unified storage events dinle
    const unsubscribeProducts = storage.subscribe('products', handleProductsUpdate);

    // Her 30 saniyede bir ürünleri yenile (fallback)
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);

    return () => {
      unsubscribeProducts();
      clearInterval(interval);
    };
  }, []);

  // Memoized filtered products using optimization helper
  const filteredProductsMemo = useMemoizedCalculations.useFilteredProducts(
    products,
    {
      selectedCategory,
      sortBy,
      priceRange,
      showAvailableOnly,
      searchQuery: searchParams.get('search') || ''
    },
    [selectedCategory, sortBy, priceRange, showAvailableOnly, searchParams.get('search'), categories]
  );

  // Update filteredProducts state when memoized value changes
  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  useEffect(() => {
    console.log('🔗 URL params useEffect');
    // Handle URL search params
    const search = searchParams.get('search');
    const view = searchParams.get('view');

    if (search) {
      console.log('🔍 Search param found:', search);
      // Handle search query
    }

    if (view === 'categories') {
      console.log('📂 Categories view requested');
      // Handle categories view
    }
  }, [searchParams]); // URL değiştiğinde çalışsın

  const loadProducts = async () => {
    console.log('🔄 loadProducts called');
    console.log('📊 DEBUG - Customer Storage durumu:');
    console.log('Storage mode:', storage.isDevelopment ? 'MEMORY' : 'LOCALSTORAGE');
    storage.debug();

    setIsLoading(true);

    try {
      // CategoryId migration çalıştır
      await migrateCategoryIds();

      let loadedProducts = [];

      // Storage'dan ürünleri yükle (unified storage kullan)
      const savedProducts = storage.get('products', []);
      console.log('📦 Storage\'dan ürünler alındı:', savedProducts.length, 'adet');

      if (savedProducts && savedProducts.length > 0) {
        // Aktif ürünleri müşteriye göster - daha esnek filtreleme
        loadedProducts = savedProducts
          .filter(product => {
            // Ürün aktif mi kontrolü - birden fazla alan kontrol et
            const isActive = product.isActive === true ||
              product.status === 'active' ||
              product.status === 'available' ||
              (!product.hasOwnProperty('isActive') && !product.hasOwnProperty('status')); // Varsayılan aktif

            // Stok kontrolü - 0 stok da göster ama "stokta yok" olarak işaretle
            const hasValidStock = product.stock >= 0; // Negatif stok hariç

            console.log(`Ürün ${product.name}: isActive=${isActive}, stock=${product.stock}, hasValidStock=${hasValidStock}`);

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
            isOrganic: product.description?.toLowerCase().includes('organik') || false,
            discount: 0, // Gelecekte indirim sistemi eklenebilir
            rating: 4.5, // Gelecekte değerlendirme sistemi eklenebilir
            status: product.status,
            seller_id: product.seller_id,
            description: product.description || `${product.name} - Taze ve kaliteli`,
            gallery: [getProductImagePath(product.name)]
          }));

        console.log('📦 Müşteri ürünleri hazırlandı:', loadedProducts.length, 'adet');

        // Image path kontrolü
        if (loadedProducts.length > 0) {
          console.log('🖼️ Müşteri - İlk ürün image:', loadedProducts[0].image);
          console.log('🖼️ Müşteri - İlk 3 ürün:', loadedProducts.slice(0, 3).map(p => ({ name: p.name, image: p.image })));
        }
      }

      // Bu kod bloğu artık gereksiz - yukarıda zaten storage'dan yüklüyoruz

      // Eğer hiç ürün yoksa boş array kullan
      if (loadedProducts.length === 0) {
        console.log('📦 Hiç ürün bulunamadı - satıcı henüz ürün eklememiş');
        loadedProducts = [];
      }

      setProducts(loadedProducts);

      // Dinamik kategorileri oluştur
      const categoryMap = new Map();
      categoryMap.set('all', { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: loadedProducts.length });

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
      console.error('Ürünler yüklenirken hata:', error);

      // Hata durumunda boş array kullan
      setProducts([]);

      // Boş kategoriler
      setCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
      setDynamicCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
    }

    setIsLoading(false);
  };

  // Kategori ikonlarını belirle
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
    console.log('🔄 handleRefresh called');
    setIsRefreshing(true);
    await loadProducts();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Optimized callbacks using memoization helpers
  const {
    handleCategorySelect,
    handleQuickAdd,
    handleAddToCart,
    handleProductClick
  } = useMemoizedCallbacks.useProductCallbacks({
    setSelectedCategory,
    setSearchParams,
    addToCart,
    showSuccess,
    setQuickAddProduct,
    setSelectedProduct
  });

  console.log('🎨 RENDER - Müşteri Ürün Kataloğu', {
    isLoading,
    productsLength: products.length,
    filteredProductsLength: filteredProducts.length,
    categoriesLength: categories.length,
    selectedCategory,
    isFilterOpen
  });

  return (
    <div className="min-h-screen bg-slate-200">
      <Header />
      <BottomTabNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Package" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Ürün Kataloğu</h1>
                <p className="text-gray-600 mt-1">
                  Taze ve kaliteli ürünlerimizi keşfedin
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-smooth ${isRefreshing
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
              >
                <Icon
                  name="RefreshCw"
                  size={20}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Kategoriler - Kutusuz */}
        <div className="mb-4">
          <CategoryChips
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Ürün Listesi - Artık arka plan kutusu yok */}
        <div className="mb-6">
          {isLoading ? (
            <GridSkeleton itemCount={6} columns={3} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === 'all'
                  ? 'Henüz ürün eklenmemiş veya tüm ürünler stokta yok.'
                  : 'Bu kategoride ürün bulunamadı. Başka kategorilere göz atabilirsiniz.'
                }
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  handleRefresh();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tüm Ürünleri Göster
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Product Grid */}
              <ResponsiveGrid
                cols={{ mobile: 1, tablet: 2, desktop: 3 }}
                gap={4}
                className="w-full"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={() => handleQuickAdd(product)} // Modal açması için sadece product gönder
                    onAddToCart={handleAddToCart} // Direkt sepete ekleme için
                    onProductClick={() => handleProductClick(product)}
                    showPrices={true} // Müşteri tarafında her zaman fiyat göster
                    layout={isMobile ? "vertical" : "vertical"} // Mobile'da da vertical
                    isMobile={isMobile}
                  />
                ))}
              </ResponsiveGrid>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {isFilterOpen && (
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={{
            sortBy,
            priceRange,
            showAvailableOnly
          }}
          onFiltersChange={({ sortBy: newSortBy, priceRange: newPriceRange, showAvailableOnly: newShowAvailableOnly }) => {
            if (newSortBy !== undefined) setSortBy(newSortBy);
            if (newPriceRange !== undefined) setPriceRange(newPriceRange);
            if (newShowAvailableOnly !== undefined) setShowAvailableOnly(newShowAvailableOnly);
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          showPrices={true} // Müşteri tarafında her zaman fiyat göster
        />
      )}

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          isOpen={!!quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
          onAddToCart={handleAddToCart}
          showPrices={true} // Müşteri tarafında her zaman fiyat göster
        />
      )}
    </div>
  );
};

export default CustomerProductCatalog;