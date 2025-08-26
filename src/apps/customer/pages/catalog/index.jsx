import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
import { useMemoizedCallbacks } from '@utils/memoizationHelpers';
// import { migrateCategoryIds } from '@utils/productLoader'; // DEVRE DIŞI - HARDCODED DATA KULLANILMAZ
import { logger } from '@utils/productionLogger';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import { useProductEvents } from '../../../../hooks/useWebSocket';

import Icon from '@shared/components/AppIcon';
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
  const { onProductCreated, onProductUpdated, onProductDeleted } = useProductEvents();
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
      logger.info('📢 Ürünler güncellendi event alındı');
      loadProducts();
    };

    // Unified storage events dinle
    const unsubscribeProducts = storage.subscribe('products', handleProductsUpdate);
    const unsubscribeCategories = storage.subscribe('categories', (data) => {
      logger.info('📢 Kategoriler güncellendi event alındı');
      loadProducts(); // Kategoriler değiştiğinde ürünleri yeniden yükle
    });

    // Custom events dinle - GÜÇLENDİRİLDİ
    const handleCategoriesUpdate = () => {
      logger.info('📢 Custom kategoriler güncellendi event alındı');
      loadProducts();
    };

    const handleProductsCustomUpdate = (event) => {
      logger.info('📢 Custom ürünler güncellendi event alındı:', event?.detail);
      // Force reload with delay
      setTimeout(() => {
        loadProducts();
        loadCategories();
      }, 100);
    };

    const handleForceReload = () => {
      logger.info('📢 Force reload event alındı');
      loadProducts();
      loadCategories();
    };

    // BroadcastChannel listener
    const broadcastChannel = new BroadcastChannel('products-sync');
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'PRODUCTS_UPDATED') {
        logger.info('📢 BroadcastChannel products update alındı');
        setTimeout(() => loadProducts(), 100);
      }
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('productsUpdated', handleProductsCustomUpdate);
    window.addEventListener('forceProductsReload', handleForceReload);

    // Her 30 saniyede bir ürünleri yenile (fallback)
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('productsUpdated', handleProductsCustomUpdate);
      window.removeEventListener('forceProductsReload', handleForceReload);
      broadcastChannel.close();
      clearInterval(interval);
    };
  }, []);

  // WebSocket real-time events
  useEffect(() => {
    // Yeni ürün oluşturulduğunda
    const handleProductCreated = (product) => {
      setProducts(prev => {
        const exists = prev.some(p => p.id === product.id);
        if (!exists) {
          logger.info('🆕 Yeni ürün eklendi:', product.name);
          return [...prev, product];
        }
        return prev;
      });
    };

    // Ürün güncellendiğinde
    const handleProductUpdated = (updatedProduct) => {
      setProducts(prev => {
        const updated = prev.map(p => 
          p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
        );
        logger.info('🔄 Ürün güncellendi:', updatedProduct.name);
        return updated;
      });
    };

    // Ürün silindiğinde
    const handleProductDeleted = (productId) => {
      setProducts(prev => {
        const filtered = prev.filter(p => p.id !== productId);
        logger.info('🗑️ Ürün silindi:', productId);
        return filtered;
      });
    };

    onProductCreated(handleProductCreated);
    onProductUpdated(handleProductUpdated);
    onProductDeleted(handleProductDeleted);
  }, [onProductCreated, onProductUpdated, onProductDeleted]);

  // Custom filtered products - daha basit ve güvenilir
  const filteredProductsMemo = useMemo(() => {
    logger.debug('🔄 Custom filtering products...');

    let filtered = [...products];
    const searchQuery = searchParams.get('search') || '';

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      logger.debug('🔍 Filtering by category:', selectedCategory);

      filtered = filtered.filter(product => {
        const productCategory = product.category || '';

        // Kasalı ürünler için özel eşleştirme - AKILLI SİSTEM
        if (selectedCategory === 'kasalı-ürünler') {
          // Direkt kasalı kategori kontrolü
          if (productCategory === 'Kasalı Ürünler' ||
            productCategory.startsWith('Kasalı ') ||
            /^kasalı\s+/i.test(productCategory)) {
            return true;
          }

          // Ürün birimini kontrol et (kasa/çuval)
          if (product.unit === 'kasa' || product.unit === 'çuval') {
            return true;
          }

          // Orijinal kategori kontrolü (dinamik sistem için)
          if (product.originalCategory) {
            return true;
          }

          return false;
        }

        // Diğer kategoriler için ID bazlı eşleştirme
        const productCategoryId = productCategory.toLowerCase().replace(/\s+/g, '-');
        return productCategoryId === selectedCategory;
      });

      logger.debug('🔍 Filtered products count:', filtered.length);
    }

    // Price range filter
    if (priceRange && priceRange.length === 2) {
      filtered = filtered.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(product => product.isAvailable && product.stock > 0);
    }

    // Sort products
    switch (sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'tr-TR'));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, priceRange, showAvailableOnly, searchParams.get('search')]);

  // Update filteredProducts state when memoized value changes
  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  useEffect(() => {
    logger.info('🔗 URL params useEffect');
    // Handle URL search params
    const search = searchParams.get('search');
    const view = searchParams.get('view');

    if (search) {
      logger.info('🔍 Search param found:', search);
      // Handle search query
    }

    if (view === 'categories') {
      logger.info('📂 Categories view requested');
      // Handle categories view
    }
  }, [searchParams]); // URL değiştiğinde çalışsın

  const loadProducts = async () => {
    logger.info('🔄 loadProducts called');
    logger.info('📊 DEBUG - Customer Storage durumu:');
    logger.info('Storage mode:', storage.isDevelopment ? 'MEMORY' : 'LOCALSTORAGE');
    storage.debug();

    // KASALI ÜRÜNLER DEBUG BAŞLANGICI
    logger.info('🗃️ ===== KASALI ÜRÜNLER DEBUG BAŞLADI =====');

    setIsLoading(true);

    try {
      // CategoryId migration çalıştır
      // await migrateCategoryIds(); // DEVRE DIŞI - HARDCODED DATA KULLANILMAZ

      let loadedProducts = [];

      // Storage'dan ürünleri yükle (unified storage kullan)
      // DIREKT localStorage kontrolü
      const rawLocalStorage = localStorage.getItem('kirilmazlar_products');
      const savedProducts = storage.get('products', []);

      logger.info('📦 Storage\'dan ürünler alındı:', savedProducts.length, 'adet');

      // DEEP DEBUG: Tüm storage'ı logla
      logger.info('🔍 DEEP DEBUG - Tüm storage products:', JSON.stringify(savedProducts, null, 2));

      // Kasalı ürünler özel kontrolü
      const kasaliInStorage = savedProducts.filter(p =>
        p.category && (
          p.category.toLowerCase().includes('kasalı') ||
          p.category.toLowerCase().includes('kasali')
        )
      );
      logger.info('🔍 DEEP DEBUG - Kasalı ürünler storage\'da:', kasaliInStorage);

      // Kasalı ürünlerin aktiflik durumunu kontrol et
      kasaliInStorage.forEach(product => {
        const isActive = product.isActive !== false && product.status !== 'inactive' && product.status !== 'disabled';
        logger.info(`🔍 KASALI ÜRÜN AKTIFLIK: ${product.name} - isActive: ${product.isActive}, status: ${product.status}, stock: ${product.stock}, SONUÇ: ${isActive}`);
      });

      // Her ürünün filtreleme durumunu kontrol et
      savedProducts.forEach(product => {
        const isActive = product.isActive !== false &&
          product.status !== 'inactive' &&
          product.status !== 'disabled';
        logger.info(`🔍 Ürün: ${product.name}, Kategori: ${product.category}, Aktif: ${isActive}, Status: ${product.status}, Stock: ${product.stock}, Image: ${product.image}`);
      });

      if (savedProducts && savedProducts.length > 0) {
        // Aktif ürünleri müşteriye göster - ESNEK KONTROL
        loadedProducts = savedProducts
          .filter(product => {
            // Pasif olarak işaretlenmiş ürünleri hariç tut
            const isExplicitlyInactive = product.isActive === false ||
              product.status === 'inactive' ||
              product.status === 'disabled';

            // Stok kontrolü - stok 0 ise gösterme
            const hasStock = product.stock > 0;

            const shouldShow = !isExplicitlyInactive && hasStock;

            if (product.category && product.category.toLowerCase().includes('kasalı')) {
              logger.info(`🗃️ KASALI ÜRÜN FİLTRE: ${product.name} - isActive: ${product.isActive}, status: ${product.status}, stock: ${product.stock}, GÖSTER: ${shouldShow}`);
            }

            return shouldShow;
          })
          .filter(product => {
            // Temel veri kontrolü
            const hasBasicData = product.name && product.category;

            logger.info(`Ürün ${product.name}: hasBasicData=${hasBasicData}, category=${product.category}`);

            return hasBasicData;
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
            discount: 0, // Gelecekte indirim sistemi eklenebilir
            rating: 4.5, // Gelecekte değerlendirme sistemi eklenebilir
            status: product.status,
            seller_id: product.seller_id,
            description: product.description || `${product.name} - Taze ve kaliteli`,
            gallery: [product.image || getProductImagePath(product.name)]
          }));

        logger.info('📦 Müşteri ürünleri hazırlandı:', loadedProducts.length, 'adet');

        // Image path kontrolü
        if (loadedProducts.length > 0) {
          logger.info('🖼️ Müşteri - İlk ürün image:', loadedProducts[0].image);
          logger.info('🖼️ Müşteri - İlk 3 ürün:', loadedProducts.slice(0, 3).map(p => ({ name: p.name, image: p.image })));
        }
      }

      // Bu kod bloğu artık gereksiz - yukarıda zaten storage'dan yüklüyoruz

      // Eğer hiç ürün yoksa boş array kullan
      if (loadedProducts.length === 0) {
        logger.info('📦 Hiç ürün bulunamadı - satıcı henüz ürün eklememiş');
        loadedProducts = [];
      }

      setProducts(loadedProducts);

      // DEBUG: Storage durumunu kontrol et
      logger.info('🔍 DEBUG - Yüklenen ürünler ve kategorileri:');
      logger.info('📦 Raw storage products:', savedProducts);
      logger.info('📦 Filtered products:', loadedProducts);

      const categoryCount = {};
      loadedProducts.forEach(product => {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      });
      logger.info('📊 Kategori dağılımı:', categoryCount);

      // Kasalı ürünler özel kontrolü
      const kasaliProducts = savedProducts.filter(p =>
        p.category && p.category.toLowerCase().includes('kasalı')
      );
      logger.info('🔍 Kasalı ürünler (raw):', kasaliProducts);

      const kasaliFiltered = loadedProducts.filter(p =>
        p.category && p.category.toLowerCase().includes('kasalı')
      );
      logger.info('🔍 Kasalı ürünler (filtered):', kasaliFiltered);

      // Satıcı panelindeki aktif kategorileri al
      const sellerCategories = storage.get('categories', []);
      logger.info('📂 Satıcı kategorileri:', sellerCategories);

      // Eğer satıcı kategorileri boşsa, varsayılan kategorileri oluştur
      if (sellerCategories.length === 0) {
        logger.warn('⚠️ Satıcı kategorileri bulunamadı, varsayılan kategoriler kullanılıyor');
        const defaultCategories = [
          { id: 1, name: 'Tüm Ürünler', icon: 'Package' },
          { id: 2, name: 'Sebzeler', icon: 'Leaf' },
          { id: 3, name: 'Meyveler', icon: 'Apple' }
        ];
        storage.set('categories', defaultCategories);
      }

      // Dinamik kategorileri oluştur - sadece satıcı panelindeki kategorilerden
      const categoryMap = new Map();
      categoryMap.set('all', { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: loadedProducts.length });

      // Önce satıcı panelindeki kategorileri ekle (Tüm Ürünler hariç)
      sellerCategories.forEach(sellerCategory => {
        if (sellerCategory.name !== 'Tüm Ürünler') {
          const categoryId = sellerCategory.name.toLowerCase().replace(/\s+/g, '-');
          categoryMap.set(categoryId, {
            id: categoryId,
            name: sellerCategory.name,
            icon: getCategoryIcon(sellerCategory.name),
            count: 0
          });
        }
      });

      // Tüm ürünleri göster - kategori temizleme işlemini devre dışı bırak
      const validProducts = loadedProducts;

      // Kategori sayımı için tüm ürünleri işle
      loadedProducts.forEach(product => {
        const categoryId = product.category.toLowerCase().replace(/\s+/g, '-');

        // Kasalı ürünler için özel eşleştirme - AKILLI SİSTEM
        let targetCategoryId = categoryId;
        const isKasaliProduct = product.category === 'Kasalı Ürünler' ||
          product.category.startsWith('Kasalı ') ||
          /^kasalı\s+/i.test(product.category) ||
          product.unit === 'kasa' ||
          product.unit === 'çuval' ||
          product.originalCategory;

        if (isKasaliProduct) {
          targetCategoryId = 'kasalı-ürünler';
          logger.info(`🗃️ KASALI ÜRÜN TESPİT EDİLDİ: ${product.name} -> ${targetCategoryId} (kategori: ${product.category}, unit: ${product.unit}, originalCategory: ${product.originalCategory})`);
        }

        // Kategori map'te yoksa oluştur
        if (!categoryMap.has(targetCategoryId)) {
          // Kasalı ürünler için özel isim
          const categoryName = targetCategoryId === 'kasalı-ürünler' ? 'Kasalı Ürünler' : product.category;
          categoryMap.set(targetCategoryId, {
            id: targetCategoryId,
            name: categoryName,
            icon: getCategoryIcon(categoryName),
            count: 0
          });
        }

        // Sayımı artır
        if (categoryMap.has(targetCategoryId)) {
          categoryMap.get(targetCategoryId).count++;

          if (targetCategoryId === 'kasalı-ürünler') {
            logger.info(`🗃️ KASALI KATEGORİ SAYIM: ${product.name} eklendi, toplam: ${categoryMap.get(targetCategoryId).count}`);
          }
        }

        logger.info(`📊 Kategori sayımı: ${product.name} -> ${targetCategoryId} (${product.category})`);
      });

      // Sadece ürünü olan kategorileri göster
      const finalCategories = Array.from(categoryMap.values()).filter(cat =>
        cat.id === 'all' || cat.count > 0
      );

      setDynamicCategories(finalCategories);
      setCategories(finalCategories);

    } catch (error) {
      logger.error('Ürünler yüklenirken hata:', error);

      // Hata durumunda boş array kullan
      setProducts([]);

      // Boş kategoriler
      setCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
      setDynamicCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
    }

    // KASALI ÜRÜNLER DEBUG SONU
    logger.info('🗃️ ===== KASALI ÜRÜNLER DEBUG BİTTİ =====');
    logger.info('📊 SONUÇ ÖZET:');
    logger.info('- Toplam yüklenen ürün:', products.length);
    logger.info('- Toplam kategori:', categories.length);
    logger.info('- Kasalı kategori var mı:', categories.some(cat => cat.id === 'kasalı-ürünler'));

    setIsLoading(false);
  };

  // Kategori ikonlarını belirle
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Sebzeler': 'Carrot',
      'Meyveler': 'Apple',
      'Yeşil Yapraklılar': 'Leaf',
      'Otlar': 'Flower',
      'Organik': 'Heart',
      'Kasalı Ürünler': 'Package2',
      'Kasalı': 'Package2'
    };
    return iconMap[categoryName] || 'Package';
  };

  // Kategorileri yükleyen fonksiyon - loadProducts'tan sonra çağrılmalı
  const loadCategories = async () => {
    logger.info('🔄 loadCategories called');

    try {
      // Products zaten yüklenmişse, kategorileri products üzerinden oluştur
      if (products && products.length > 0) {
        // Kategori dağılımını logla
        const categoryCount = {};
        products.forEach(product => {
          categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });
        logger.info('📊 Kategori dağılımı:', categoryCount);

        // Satıcı panelindeki aktif kategorileri al
        const sellerCategories = storage.get('categories', []);
        logger.info('📂 Satıcı kategorileri:', sellerCategories);

        // Dinamik kategorileri oluştur
        const categoryMap = new Map();
        categoryMap.set('all', { id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: products.length });

        // Önce satıcı panelindeki kategorileri ekle (Tüm Ürünler hariç)
        sellerCategories.forEach(sellerCategory => {
          if (sellerCategory.name !== 'Tüm Ürünler') {
            const categoryId = sellerCategory.name.toLowerCase().replace(/\s+/g, '-');
            categoryMap.set(categoryId, {
              id: categoryId,
              name: sellerCategory.name,
              icon: getCategoryIcon(sellerCategory.name),
              count: 0
            });
          }
        });

        // Kategori sayımı için tüm ürünleri işle
        products.forEach(product => {
          const categoryId = product.category.toLowerCase().replace(/\s+/g, '-');

          // Kasalı ürünler için özel eşleştirme - AKILLI SİSTEM
          let targetCategoryId = categoryId;
          const isKasaliProduct = product.category === 'Kasalı Ürünler' ||
            product.category.startsWith('Kasalı ') ||
            /^kasalı\s+/i.test(product.category) ||
            product.unit === 'kasa' ||
            product.unit === 'çuval' ||
            product.originalCategory;

          if (isKasaliProduct) {
            targetCategoryId = 'kasalı-ürünler';
            logger.info(`🗃️ KASALI ÜRÜN TESPİT EDİLDİ (2): ${product.name} -> ${targetCategoryId} (kategori: ${product.category}, unit: ${product.unit}, originalCategory: ${product.originalCategory})`);
          }

          // Kategori map'te yoksa oluştur
          if (!categoryMap.has(targetCategoryId)) {
            // Kasalı ürünler için özel isim
            const categoryName = targetCategoryId === 'kasalı-ürünler' ? 'Kasalı Ürünler' : product.category;
            categoryMap.set(targetCategoryId, {
              id: targetCategoryId,
              name: categoryName,
              icon: getCategoryIcon(categoryName),
              count: 0
            });
          }

          // Sayımı artır
          if (categoryMap.has(targetCategoryId)) {
            categoryMap.get(targetCategoryId).count++;

            if (targetCategoryId === 'kasalı-ürünler') {
              logger.info(`🗃️ KASALI KATEGORİ SAYIM (2): ${product.name} eklendi, toplam: ${categoryMap.get(targetCategoryId).count}`);
            }
          }

          logger.info(`📊 Kategori sayımı: ${product.name} -> ${targetCategoryId} (${product.category})`);
        });

        // Sadece ürünü olan kategorileri göster
        const finalCategories = Array.from(categoryMap.values()).filter(cat =>
          cat.id === 'all' || cat.count > 0
        );

        setDynamicCategories(finalCategories);
        setCategories(finalCategories);

        logger.info('✅ Kategoriler başarıyla yüklendi:', finalCategories.length);
      } else {
        logger.warn('⚠️ Ürünler yüklenmeden kategoriler yüklenmek istendi');
        // Ürün yoksa, tüm kategorileri göster
        setCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
        setDynamicCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
      }
    } catch (error) {
      logger.error('Kategoriler yüklenirken hata:', error);

      // Hata durumunda sadece 'Tüm Ürünler' kategorisi göster
      setCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
      setDynamicCategories([{ id: 'all', name: 'Tüm Ürünler', icon: 'Grid3X3', count: 0 }]);
    }
  };

  const handleRefresh = async () => {
    logger.info('🔄 handleRefresh called - GÜÇLÜ FORCE RELOAD');
    setIsRefreshing(true);

    try {
      // Storage'ı temizle ve yeniden yükle
      logger.info('🧹 Storage cache temizleniyor...');

      // Manuel storage kontrolü
      const currentStorage = storage.get('products', []);
      logger.info('🔍 REFRESH - Current storage products:', currentStorage.length);

      const kasaliInRefresh = currentStorage.filter(p =>
        p.category && p.category.toLowerCase().includes('kasalı')
      );
      logger.info('🔍 REFRESH - Kasalı ürünler:', kasaliInRefresh);

      // Force reload - state'leri sıfırla
      setProducts([]);
      setCategories([]);
      setFilteredProducts([]);

      // Kısa delay sonra yeniden yükle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Ürünleri ve kategorileri yeniden yükle
      await loadProducts();
      await loadCategories();

      // Storage'dan tekrar kontrol et
      const afterReload = storage.get('products', []);
      const kasaliAfter = afterReload.filter(p =>
        p.category && p.category.toLowerCase().includes('kasalı')
      );
      logger.info('🔍 REFRESH AFTER - Kasalı ürünler:', kasaliAfter);

      logger.info('✅ Güçlü refresh tamamlandı');
    } catch (error) {
      logger.error('❌ Refresh hatası:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // DEBUG: Global window'a debug fonksiyonu ekle
  window.debugCustomer = {
    checkProducts: () => {
      const raw = localStorage.getItem('kirilmazlar_products');
      const parsed = raw ? JSON.parse(raw) : [];
      // Kasalı ürünler filtreleme
        const kasaliProducts = parsed.filter(p => p.category && p.category.toLowerCase().includes('kasalı'));
      return parsed;
    },
    currentProducts: products,
    storageInstance: storage,
    forceReload: () => {
      loadProducts();
      loadCategories();
    }
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

  logger.info('🎨 RENDER - Müşteri Ürün Kataloğu', {
    isLoading,
    productsLength: products.length,
    filteredProductsLength: filteredProducts.length,
    categoriesLength: categories.length,
    selectedCategory,
    isFilterOpen
  });

  return (
    <div className="min-h-screen bg-slate-200 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="ShoppingBag" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Ürünler</h1>
                <p className="text-gray-600 mt-1">
                  Taze ve kaliteli ürünler
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-xl transition-all ${isRefreshing
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                  }`}
              >
                <Icon
                  name="RefreshCw"
                  size={18}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
              </button>


            </div>
          </div>
        </div>

        {/* Kategoriler - Sadece Web'de görünsün */}
        <div className="hidden md:block mb-6">
          <CategoryChips
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Ürün Listesi */}
        <div className="mb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-32 md:h-40 mb-3"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Henüz ürün eklenmemiş veya tüm ürünler stokta yok.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  handleRefresh();
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Tüm Ürünleri Göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickAdd={() => handleQuickAdd(product)}
                  onAddToCart={handleAddToCart}
                  onProductClick={() => handleProductClick(product)}
                  showPrices={true}
                  layout="vertical"
                  isMobile={isMobile}
                />
              ))}
            </div>
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
