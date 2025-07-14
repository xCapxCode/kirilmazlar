import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import { demoProductImages } from '../../../../utils/demoImages';
import { switchUserRole, getCurrentUser } from '@shared/utils/userManager';

import Header from '@shared/components/ui/Header';
import BottomTabNavigation from '@shared/components/ui/BottomTabNavigation';
import Icon from '@shared/components/AppIcon';
import ProductCard from './components/ProductCard';
import CategoryChips from './components/CategoryChips';
import FilterPanel from './components/FilterPanel';
import ProductDetailModal from './components/ProductDetailModal';
import QuickAddModal from './components/QuickAddModal';
import ToastContainer from '../../../../shared/components/ui/ToastContainer';

const CustomerProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const { addToCart } = useCart();

  // Dinamik kategoriler - satıcının eklediği kategorilerden oluşur
  const [dynamicCategories, setDynamicCategories] = useState([
    { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }
  ]);

  // Demo ürünler - sadece localStorage'da ürün yoksa kullanılacak
  const fallbackProducts = [
    {
      id: 1,
      name: 'Taze Domates',
      price: 15.00,
      unit: 'kg',
      image: demoProductImages.tomato,
      category: 'Sebzeler',
      subcategory: 'Mevsim Sebzeleri',
      stock: 45,
      isAvailable: true,
      isOrganic: true,
      discount: 10,
      rating: 4.5,
      status: 'active',
      description: `Yerel çiftliklerden gelmiş taze, sulu domatesler. Salata, yemek pişirme ve taze sos yapımı için mükemmel.

C ve K vitamini, folat ve potasyum açısından zengin. Bu domatesler maksimum lezzet ve besin değeri için asma üzerinde olgunlaştırılmıştır.`,
      gallery: [demoProductImages.tomato]
    },
    {
      id: 2,
      name: 'Yeşil Elma',
      price: 12.00,
      unit: 'kg',
      image: demoProductImages.apple,
      category: 'Meyveler',
      subcategory: 'Çekirdekli Meyveler',
      stock: 32,
      isAvailable: true,
      isOrganic: false,
      discount: 0,
      rating: 4.3,
      status: 'active',
      description: `Gevrek ve ekşimsi yeşil elmalar, atıştırmak veya fırında pişirmek için mükemmel. Bu elmalar ferahlatıcı tatları ve sert dokuları ile bilinir.

Lif ve C vitamini açısından yüksek, bu elmalar sindirim sağlığını destekler ve bağışıklığı güçlendirir.`,
      gallery: [demoProductImages.apple]
    },
    {
      id: 3,
      name: 'Taze Ispanak',
      price: 8.50,
      unit: 'demet',
      image: demoProductImages.spinach,
      category: 'Sebzeler',
      subcategory: 'Yeşil Yapraklılar',
      stock: 28,
      isAvailable: true,
      isOrganic: true,
      discount: 5,
      rating: 4.7,
      status: 'active',
      description: `Salata, smoothie veya yemek pişirme için mükemmel taze, yumuşak ıspanak yaprakları. Maksimum tazelik için günlük hasat edilir.

Demir, A, C ve K vitamini ve folat bakımından zengin. Mükemmel bir antioksidan ve besin kaynağı.`,
      gallery: [demoProductImages.spinach]
    },
    {
      id: 4,
      name: 'Organik Havuç',
      price: 9.75,
      unit: 'kg',
      image: demoProductImages.tomato, // Placeholder olarak
      category: 'Sebzeler',
      subcategory: 'Kök Sebzeler',
      stock: 35,
      isAvailable: true,
      isOrganic: true,
      discount: 15,
      rating: 4.6,
      status: 'active',
      description: 'Tatlı ve gevrek organik havuçlar. A vitamini bakımından çok zengin.',
      gallery: [demoProductImages.tomato]
    },
    {
      id: 5,
      name: 'Kırmızı Biber',
      price: 18.50,
      unit: 'kg',
      image: demoProductImages.apple, // Placeholder olarak
      category: 'Sebzeler',
      subcategory: 'Mevsim Sebzeleri',
      stock: 22,
      isAvailable: true,
      isOrganic: false,
      discount: 0,
      rating: 4.4,
      status: 'active',
      description: 'Tatlı ve renkli kırmızı biberler. Salata ve yemeklerinize renk katın.',
      gallery: [demoProductImages.apple]
    },
    {
      id: 6,
      name: 'Organik Muz',
      price: 14.00,
      unit: 'kg',
      image: demoProductImages.spinach, // Placeholder olarak
      category: 'Meyveler',
      subcategory: 'Tropik Meyveler',
      stock: 40,
      isAvailable: true,
      isOrganic: true,
      discount: 8,
      rating: 4.8,
      status: 'active',
      description: 'Doğal ve tatlı organik muzlar. Potasyum deposu.',
      gallery: [demoProductImages.spinach]
    }
  ];

  useEffect(() => {
    console.log('🚀 Initial useEffect - Loading products and categories');
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
    // localStorage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'products') {
        console.log('📢 Ürünler değişti, yeniden yükleniyor...');
        loadProducts();
      }
    };

    // Custom event listener ekle (aynı tab içinde değişiklikleri dinlemek için)
    const handleProductsUpdate = () => {
      console.log('📢 Ürünler güncellendi event alındı');
      loadProducts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('productsUpdated', handleProductsUpdate);
    
    // Her 30 saniyede bir ürünleri yenile (fallback)
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log('🔄 Filter useEffect triggered', {
      productsLength: products.length,
      selectedCategory,
      sortBy,
      priceRange,
      showAvailableOnly
    });
    
    // Filter products directly in useEffect
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'organic') {
        filtered = filtered.filter(product => product.isOrganic);
      } else {
        // Kategori ID'sini kategori adına çevir
        const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
        if (categoryName) {
          filtered = filtered.filter(product => product.category === categoryName);
        }
      }
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(product => product.isAvailable);
    }

    // Sort products
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        // Keep original order for newest
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    console.log('✅ Filtered products:', filtered.length, 'items');
    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, priceRange, showAvailableOnly, categories]);

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
    setIsLoading(true);
    
    try {
      let loadedProducts = [];
      
      // Önce localStorage'dan ürünleri yükle (satıcının eklediği ürünler)
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          // Sadece aktif ve stokta olan ürünleri müşteriye göster
          loadedProducts = parsedProducts
            .filter(product => product.status === 'active' && product.stock > 0)
            .map(product => ({
              id: product.id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              unit: product.unit || 'adet',
              image: product.image || demoProductImages.tomato,
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
              gallery: [product.image || demoProductImages.tomato]
            }));
          
          console.log('📦 localStorage\'dan ürünler yüklendi:', loadedProducts.length, 'adet');
        } catch (e) {
          console.error('localStorage parse hatası:', e);
        }
      }
      
      // Eğer localStorage'da ürün yoksa, dataService'den dene
      if (loadedProducts.length === 0) {
          try {
const { productsService } = await import('@shared/utils/dataService');
          const result = await productsService.getAll();
          
          if (result.success && result.data && result.data.length > 0) {
            // Gerçek ürünleri müşteri formatına çevir
            loadedProducts = result.data
              .filter(product => product.status === 'active' && product.stock > 0)
              .map(product => ({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price) || 0,
                unit: product.units?.display_name || product.unit || 'adet',
                image: product.image_url || demoProductImages.tomato,
                category: product.categories?.display_name || product.category || 'Genel',
                subcategory: product.subcategory || '',
                stock: parseInt(product.stock) || 0,
                isAvailable: product.stock > 0,
                isOrganic: product.description?.toLowerCase().includes('organik') || false,
                discount: 0,
                rating: 4.5,
                status: product.status,
                seller_id: product.seller_id,
                description: product.description || `${product.name} - Taze ve kaliteli`,
                gallery: [product.image_url || demoProductImages.tomato]
              }));
            
            console.log('📦 dataService\'den ürünler yüklendi:', loadedProducts.length, 'adet');
          }
        } catch (dbError) {
          console.log('📦 dataService kullanılamıyor, demo modda çalışıyor');
        }
      }
      
      // Eğer hiç ürün yoksa fallback ürünleri kullan
      if (loadedProducts.length === 0) {
        loadedProducts = fallbackProducts;
        console.log('📦 Fallback ürünler kullanılıyor (hiç ürün yok):', loadedProducts.length, 'adet');
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
      
      // Fallback ürünleri yükle
      setProducts(fallbackProducts);
      
      // Kategorileri ayarla
      const allCategory = { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: fallbackProducts.length };
      const categoryMap = new Map([['all', allCategory]]);
      
      fallbackProducts.forEach(product => {
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
      
      const finalCategories = Array.from(categoryMap.values());
      setDynamicCategories(finalCategories);
      setCategories(finalCategories);
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

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  }, [setSearchParams]);

  const handleQuickAdd = (product, quantity = 1) => {
    console.log('🛒 handleQuickAdd called with:', { product: product.name, quantity });
    
    // Use CartContext to add to cart
    addToCart(product, quantity);
    
    console.log('✅ Product added to cart via CartContext');
    
    // Show success feedback
    const event = new CustomEvent('showToast', {
      detail: { message: `${quantity} ${product.unit} ${product.name} sepete eklendi!`, type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleAddToCart = (product, quantity, selectedUnit) => {
    // Create product with selected unit
    const productWithUnit = {
      ...product,
      unit: selectedUnit || product.unit
    };
    
    // Use CartContext to add to cart
    addToCart(productWithUnit, quantity);

    setQuickAddProduct(null);
    
    // Show success feedback
    const event = new CustomEvent('showToast', {
      detail: { message: `${product.name} sepete eklendi!`, type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

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
      <ToastContainer />
      
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
                className={`p-2 rounded-lg transition-smooth ${
                  isRefreshing 
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
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Icon name="RefreshCw" size={24} className="text-green-600 animate-spin" />
                <span className="text-gray-600">Ürünler yükleniyor...</span>
              </div>
            </div>
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
              {/* Ürün Listesi - Her ürün tek satırda, tam genişlikte */}
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={(quantity) => handleQuickAdd(product, quantity)}
                    onProductClick={() => handleProductClick(product)}
                    showPrices={true} // Müşteri tarafında her zaman fiyat göster
                    layout="horizontal" // Horizontal layout için prop
                  />
                ))}
              </div>
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