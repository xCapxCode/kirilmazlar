import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import { useProductEvents } from '../../../../../hooks/useWebSocket';
import productSyncService from '../../../../../services/productSyncService';
import Icon from '../../../../../shared/components/AppIcon';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import { getProductImagePath } from '../../../../../utils/imagePathHelper';

// Bileşenler
import ModernUrunModali from './components/ModernUrunModali';

const UrunYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showConfirm } = useModal();
  const { showSuccess, showError } = useNotification();
  const { onProductCreated, onProductUpdated, onProductDeleted } = useProductEvents();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('Tüm Ürünler');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const itemsPerPage = 12;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    stockStatus: '',
    sortBy: 'name'
  });

  // Real-time veri güncellemeleri için subscriptions
  useEffect(() => {
    if (user && userProfile) {
      loadData();

      const unsubscribeProducts = storage.subscribe('products', (newProducts) => {
        setProducts(newProducts || []);
        console.log('🔄 Products updated via storage subscription');
      });

      const unsubscribeCategories = storage.subscribe('categories', (newCategories) => {
        setCategories(newCategories || []);
        console.log('🔄 Categories updated via storage subscription');
      });

      return () => {
        unsubscribeProducts();
        unsubscribeCategories();
      };
    }
  }, [user, userProfile]);

  // WebSocket real-time events
  useEffect(() => {
    if (!user || !userProfile) return;

    // Yeni ürün oluşturulduğunda
    const handleProductCreated = (product) => {
      setProducts(prev => {
        const exists = prev.some(p => p.id === product.id);
        if (!exists) {
          showSuccess(`Yeni ürün eklendi: ${product.name}`);
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
        showSuccess(`Ürün güncellendi: ${updatedProduct.name}`);
        return updated;
      });
    };

    // Ürün silindiğinde
    const handleProductDeleted = (productId) => {
      setProducts(prev => {
        const filtered = prev.filter(p => p.id !== productId);
        showSuccess('Ürün silindi');
        return filtered;
      });
    };

    onProductCreated(handleProductCreated);
    onProductUpdated(handleProductUpdated);
    onProductDeleted(handleProductDeleted);
  }, [user, userProfile, onProductCreated, onProductUpdated, onProductDeleted, showSuccess]);

  // Tüm ürünleri otomatik yükle fonksiyonu
  const loadAllProductsFromImages = async () => {
    try {
      const allProductsData = [
        { name: 'Ananas', category: 'Meyveler', price: 35.00, description: 'Taze ananas' },
        { name: 'Armut', category: 'Meyveler', price: 16.00, description: 'Taze armut' },
        { name: 'Avakado', category: 'Meyveler', price: 40.00, description: 'Taze avakado' },
        { name: 'Ayva', category: 'Meyveler', price: 14.00, description: 'Taze ayva' },
        { name: 'Darı Mısır', category: 'Sebzeler', price: 4.00, description: 'Taze darı mısır' },
        { name: 'Domates', category: 'Sebzeler', price: 18.00, description: 'Taze domates' },
        { name: 'Elma', category: 'Meyveler', price: 15.00, description: 'Taze kırmızı elma' },
        { name: 'Greyfurt', category: 'Meyveler', price: 22.00, description: 'Taze greyfurt' },
        { name: 'Kabak', category: 'Sebzeler', price: 6.00, description: 'Taze kabak' },
        { name: 'Kavun', category: 'Meyveler', price: 8.00, description: 'Taze kavun' },
        { name: 'Kayısı', category: 'Meyveler', price: 35.00, description: 'Taze kayısı' },
        { name: 'Kereviz', category: 'Sebzeler', price: 18.00, description: 'Taze kereviz' },
        { name: 'Kiraz', category: 'Meyveler', price: 60.00, description: 'Taze kiraz' },
        { name: 'Kivi', category: 'Meyveler', price: 25.00, description: 'Taze kivi' },
        { name: 'Kırmızı Biber', category: 'Sebzeler', price: 25.00, description: 'Taze kırmızı biber' },
        { name: 'Kıvırcık', category: 'Sebzeler', price: 12.00, description: 'Taze kıvırcık' },
        { name: 'Lahana', category: 'Sebzeler', price: 5.00, description: 'Taze lahana' },
        { name: 'Limon', category: 'Meyveler', price: 25.00, description: 'Taze limon' },
        { name: 'Mandalina', category: 'Meyveler', price: 18.00, description: 'Taze mandalina' },
        { name: 'Mantar', category: 'Sebzeler', price: 35.00, description: 'Taze mantar' },
        { name: 'Muz', category: 'Meyveler', price: 12.00, description: 'Taze muz' },
        { name: 'Nar', category: 'Meyveler', price: 24.00, description: 'Taze nar' },
        { name: 'Nektarin', category: 'Meyveler', price: 32.00, description: 'Taze nektarin' },
        { name: 'Patates', category: 'Sebzeler', price: 7.00, description: 'Taze patates' },
        { name: 'Portakal', category: 'Meyveler', price: 20.00, description: 'Taze portakal' },
        { name: 'Roka', category: 'Sebzeler', price: 15.00, description: 'Taze roka' },
        { name: 'Salatalık', category: 'Sebzeler', price: 8.00, description: 'Taze salatalık' },
        { name: 'Sarımsak', category: 'Sebzeler', price: 45.00, description: 'Taze sarımsak' },
        { name: 'Tere Otu', category: 'Sebzeler', price: 8.00, description: 'Taze tere otu' },
        { name: 'Yeşil Elma', category: 'Meyveler', price: 17.00, description: 'Taze yeşil elma' },
        { name: 'Çilek', category: 'Meyveler', price: 45.00, description: 'Taze çilek' },
        { name: 'Üzüm', category: 'Meyveler', price: 22.00, description: 'Taze üzüm' },
        { name: 'İncir', category: 'Meyveler', price: 38.00, description: 'Taze incir' },
        { name: 'Şeftali', category: 'Meyveler', price: 28.00, description: 'Taze şeftali' }
      ];

      // Mevcut ürünleri al
      const existingProducts = await storage.get('products', []);
      const existingNames = existingProducts.map(p => p.name);

      // Eksik ürünleri filtrele
      const missingProducts = allProductsData.filter(product =>
        !existingNames.includes(product.name)
      );

      if (missingProducts.length === 0) {
        showSuccess('✅ Tüm ürünler zaten sistemde!');
        return existingProducts;
      }

      // Yeni ID'ler oluştur
      const maxId = existingProducts.length > 0
        ? Math.max(...existingProducts.map(p => {
          const numId = typeof p.id === 'string' ? parseInt(p.id.replace(/[^\d]/g, '')) || 0 : p.id || 0;
          return numId;
        }))
        : 0;

      // Eksik ürünleri ekle
      const newProducts = missingProducts.map((product, index) => {
        const imageFileName = product.name === 'Nektarin' ? 'nectarine.png' :
          product.name === 'Patates' ? 'patates.png' :
            product.name === 'Kabak' ? 'kabak.png' :
              product.name === 'Lahana' ? 'lahana.png' :
                product.name === 'Tere Otu' ? 'TereOtu.png' :
                  product.name === 'Darı Mısır' ? 'DarıMısır.png' :
                    `${product.name}.png`;

        return {
          id: `prod-${maxId + index + 1}`,
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.category === 'Meyveler' ? 'Taze Meyveler' :
            product.category === 'Sebzeler' ? 'Taze Sebzeler' :
              'Genel',
          unit: 'kg',
          price: product.price,
          stock: Math.floor(Math.random() * 30) + 15, // 15-45 arası rastgele
          minStock: Math.floor(Math.random() * 8) + 3, // 3-10 arası
          status: 'active',
          image: `/assets/images/products/${imageFileName}`,
          createdAt: new Date().toISOString(),
          isActive: true
        };
      });

      const allProducts = [...existingProducts, ...newProducts];
      await storage.set('products', allProducts);
      setProducts(allProducts);

      showSuccess(`✅ ${newProducts.length} yeni ürün eklendi! Toplam: ${allProducts.length}`);
      return allProducts;

    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      showError('Ürünler yüklenirken hata oluştu');
      return [];
    }
  };

  const loadData = async () => {
    try {
      // Ürün yönetimi verileri yükleniyor

      const [storedProducts, storedCategories] = await Promise.all([
        storage.get('products', []),
        storage.get('categories', [])
      ]);

      // Storage'dan veriler yüklendi

      // Kategorileri ayarla - "Kuru Yemiş" yerine "Kasalı Ürünler"
      if (storedCategories.length === 0) {
        // Varsayılan kategoriler oluşturuluyor
        const defaultCategories = [
          {
            id: 1,
            name: 'Tüm Ürünler',
            icon: 'Package',
            color: 'gray',
            subcategories: []
          },
          {
            id: 2,
            name: 'Sebzeler',
            icon: 'Leaf',
            color: 'green',
            subcategories: ['Yeşil Yapraklılar', 'Kök Sebzeler', 'Mevsim Sebzeleri']
          },
          {
            id: 3,
            name: 'Meyveler',
            icon: 'Apple',
            color: 'red',
            subcategories: ['Turunçgiller', 'Tropik Meyveler', 'Yumuşak Meyveler']
          },
          {
            id: 4,
            name: 'Kasalı Ürünler',
            icon: 'Box',
            color: 'amber',
            subcategories: ['Genel']
          }
          // Kasalı Ürünler kategorisi kaldırıldı - dinamik sistem kullanılacak
        ];

        await storage.set('categories', defaultCategories);
        setCategories(defaultCategories);
      } else {
        // Ensure "Kasalı Ürünler" exists in stored categories
        let updatedCategories = [...storedCategories];
        const hasKasali = updatedCategories.some(cat => cat.name === 'Kasalı Ürünler');
        if (!hasKasali) {
          const newId = updatedCategories.length > 0 && updatedCategories.every(c => typeof c.id === 'number')
            ? Math.max(...updatedCategories.map(c => c.id)) + 1
            : `cat-${updatedCategories.length + 1}`;
          const kasaliCategory = {
            id: newId,
            name: 'Kasalı Ürünler',
            icon: 'Box',
            color: 'amber',
            subcategories: ['Genel']
          };
          updatedCategories.push(kasaliCategory);
          await storage.set('categories', updatedCategories);
          // "Kasalı Ürünler" kategorisi otomatik eklendi
        }
        setCategories(updatedCategories);
      }

      // Ürünleri ayarla - önce eksik ürünleri kontrol et ve ekle
      // Eksik ürünler kontrol ediliyor

      try {
        // İlk başta mevcut ürünleri kontrol et
        if (storedProducts.length < 10) {
          // Otomatik ürün yükleme başlatılıyor
          const allProducts = await loadAllProductsFromImages();
          setProducts(allProducts);
        } else {
          setProducts(storedProducts);
          // Mevcut ürünler kullanıldı
        }
      } catch (productLoadError) {
        console.warn('⚠️ Ürün yükleme hatası, basit demo ürünler ekleniyor:', productLoadError);

        // Son çare: Basit demo ürünler
        if (storedProducts.length === 0) {
          const simpleProducts = [
            {
              id: 'prod-simple-1',
              name: 'Domates',
              description: 'Taze domates',
              category: 'Sebzeler',
              subcategory: 'Mevsim Sebzeleri',
              unit: 'kg',
              price: 18.00,
              stock: 25,
              minStock: 5,
              status: 'active',
              image: '/assets/images/products/Domates.png',
              createdAt: new Date().toISOString(),
              isActive: true
            },
            {
              id: 'prod-simple-2',
              name: 'Elma',
              description: 'Taze elma',
              category: 'Meyveler',
              subcategory: 'Yumuşak Meyveler',
              unit: 'kg',
              price: 15.00,
              stock: 40,
              minStock: 10,
              status: 'active',
              image: '/assets/images/products/Elma.png',
              createdAt: new Date().toISOString(),
              isActive: true
            }
          ];

          await storage.set('products', simpleProducts);
          setProducts(simpleProducts);
          // Basit demo ürünler yüklendi
        } else {
          setProducts(storedProducts);
          // Mevcut stored ürünler kullanıldı
        }
      }

      // Ürün yönetimi verileri başarıyla yüklendi

    } catch (error) {
      console.error('❌ Ürün yönetimi veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      const currentProducts = await storage.get('products', []);
      const updatedProducts = currentProducts.map(p =>
        p.id === productId ? {
          ...p,
          isActive: !p.isActive,
          status: !p.isActive ? 'active' : 'inactive',
          updatedAt: new Date().toISOString()
        } : p
      );

      await storage.set('products', updatedProducts);
      setProducts(updatedProducts);

      // GÜÇLÜ SENKRONIZASYON - Müşteri paneline bildir
      // Ürün durum değişikliği senkronizasyon sinyalleri gönderiliyor

      // CustomEvent ile bildir
      window.dispatchEvent(new CustomEvent('productsUpdated', {
        detail: { products: updatedProducts, timestamp: Date.now() }
      }));

      // Storage event de tetikle
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kirilmazlar_products',
        newValue: JSON.stringify(updatedProducts),
        oldValue: JSON.stringify(currentProducts),
        storageArea: localStorage
      }));

      // BroadcastChannel ile de bildir (cross-tab sync)
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('products-sync');
        channel.postMessage({
          type: 'PRODUCTS_UPDATED',
          products: updatedProducts,
          timestamp: Date.now()
        });
        channel.close();
      }

      // Timeout ile de tetikle (fallback)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceProductsReload'));
      }, 100);

      const product = updatedProducts.find(p => p.id === productId);
      const statusText = product.isActive ? 'aktif' : 'pasif';
      // Ürün durumu değiştirildi ve senkronizasyon sinyalleri gönderildi
      showSuccess(`Ürün durumu ${statusText} olarak değiştirildi`);
    } catch (error) {
      console.error('❌ Ürün durum değiştirme hatası:', error);
      showError('Ürün durumu değiştirilirken bir hata oluştu');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = await showConfirm(
      'Bu ürünü silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.',
      {
        title: 'Ürün Sil',
        confirmText: 'Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        const currentProducts = await storage.get('products', []);
        const updatedProducts = currentProducts.filter(p => p.id !== productId);
        await storage.set('products', updatedProducts);
        setProducts(updatedProducts);

        // GÜÇLÜ SENKRONIZASYON - Müşteri paneline bildir
        // Ürün silme senkronizasyon sinyalleri gönderiliyor

        // CustomEvent ile bildir
        window.dispatchEvent(new CustomEvent('productsUpdated', {
          detail: { products: updatedProducts, timestamp: Date.now() }
        }));

        // Storage event de tetikle
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'kirilmazlar_products',
          newValue: JSON.stringify(updatedProducts),
          oldValue: JSON.stringify(currentProducts),
          storageArea: localStorage
        }));

        // BroadcastChannel ile de bildir (cross-tab sync)
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel('products-sync');
          channel.postMessage({
            type: 'PRODUCTS_UPDATED',
            products: updatedProducts,
            timestamp: Date.now()
          });
          channel.close();
        }

        // Timeout ile de tetikle (fallback)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('forceProductsReload'));
        }, 100);

        // Ürün başarıyla silindi ve senkronizasyon sinyalleri gönderildi
        showSuccess('Ürün başarıyla silindi');
      } catch (error) {
        console.error('❌ Ürün silme hatası:', error);
        showError('Ürün silinirken bir hata oluştu');
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    // handleSaveProduct çağrıldı

    try {
      const currentProducts = await storage.get('products', []);
      let updatedProducts;

      // Image field'ı boşsa otomatik getProductImagePath kullan
      if (!productData.image || productData.image.trim() === '') {
        productData.image = getProductImagePath(productData.name);
        // Otomatik image path oluşturuldu
      }

      if (editingProduct) {
        // Düzenleme
        updatedProducts = currentProducts.map(p =>
          p.id === editingProduct.id ? {
            ...productData,
            id: editingProduct.id,
            updatedAt: new Date().toISOString()
          } : p
        );
        // Ürün güncellendi
      } else {
        // Yeni ekleme - string ID oluşturma (mevcut sistemle uyumlu)
        const existingIds = currentProducts.map(p => p.id);
        let newId;
        let counter = 1;

        // Benzersiz ID oluştur
        do {
          newId = `prod-${counter}`;
          counter++;
        } while (existingIds.includes(newId));

        const newProduct = {
          ...productData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        };
        // Yeni ürün oluşturuluyor
        updatedProducts = [...currentProducts, newProduct];
      }

      // Güncellenecek tüm ürünler

      // Unified storage'a kaydet (cross-device sync ile)
      await storage.set('products', updatedProducts);
      setProducts(updatedProducts);

      // YENİ SİSTEM: ProductSyncService ile senkronizasyon
      productSyncService.triggerSync(updatedProducts);
      // Ürün başarıyla kaydedildi ve yeni senkronizasyon sistemi tetiklendi

      setShowProductModal(false);
      setEditingProduct(null);

    } catch (error) {
      console.error('❌ Ürün kaydetme hatası:', error);
    }
  };

  // Kategori yönetimi işlevleri
  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      showError('Kategori adı boş olamaz');
      return;
    }

    if (trimmedName.length < 2) {
      showError('Kategori adı en az 2 karakter olmalıdır');
      return;
    }

    if (categories.find(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      showError('Bu kategori zaten mevcut');
      return;
    }

    try {
      // Benzersiz kategori ID oluştur
      const existingIds = categories.map(c => c.id);
      let newId;

      // Sayısal ID'ler varsa onlarla uyumlu ol
      const hasNumericIds = existingIds.some(id => typeof id === 'number');

      if (hasNumericIds) {
        const numericIds = existingIds.filter(id => typeof id === 'number');
        newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
      } else {
        // String ID oluştur
        let counter = 1;
        do {
          newId = `cat-${counter}`;
          counter++;
        } while (existingIds.includes(newId));
      }

      const newCategory = {
        id: newId,
        name: trimmedName,
        icon: 'Package',
        color: 'blue',
        subcategories: ['Genel']
      };
      const updatedCategories = [...categories, newCategory];

      await storage.set('categories', updatedCategories);
      setCategories(updatedCategories);
      setActiveTab(newCategory.name);
      setNewCategoryName('');
      setShowNewCategoryModal(false);

      // Kategori güncellemesi için senkronizasyon sinyali
      window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: updatedCategories }));

      // Kategori başarıyla eklendi
      showSuccess(`"${newCategory.name}" kategorisi başarıyla eklendi`);
    } catch (error) {
      console.error('❌ Kategori ekleme hatası:', error);
      showError('Kategori eklenirken hata oluştu');
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    // Kategorideki ürün sayısını kontrol et
    const categoryProducts = products.filter(p => p.category === categoryToDelete.name);

    if (categoryProducts.length > 0) {
      showError(`Bu kategoride ${categoryProducts.length} ürün bulunuyor. Önce ürünleri silmeniz veya başka kategoriye taşımanız gerekiyor.`);
      return;
    }

    if (categories.length <= 1) {
      showError('En az bir kategori bulunmalıdır.');
      return;
    }

    const confirmed = await showConfirm(
      `"${categoryToDelete.name}" kategorisini silmek istediğinizden emin misiniz?`,
      {
        title: 'Kategori Sil',
        confirmText: 'Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );

    if (confirmed) {
      try {
        const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
        await storage.set('categories', updatedCategories);
        setCategories(updatedCategories);

        // Eğer silinen kategori aktif sekme ise, ilk kategoriye geç
        if (activeTab === categoryToDelete.name) {
          setActiveTab(updatedCategories[0].name);
        }

        // Kategori güncellemesi için senkronizasyon sinyali
        window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: updatedCategories }));

        // Kategori başarıyla silindi
        showSuccess(`"${categoryToDelete.name}" kategorisi başarıyla silindi`);
      } catch (error) {
        console.error('❌ Kategori silme hatası:', error);
        showError('Kategori silinirken hata oluştu');
      }
    }
  };

  // Filtreleme ve sayfalama
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesCategory =
      activeTab === 'Tüm Ürünler' ||
      product.category === activeTab ||
      (activeTab === 'Kasalı Ürünler' && product.category.startsWith('Kasalı '));
    const matchesStockStatus = !filters.stockStatus ||
      (filters.stockStatus === 'low' && product.stock <= product.minStock) ||
      (filters.stockStatus === 'normal' && product.stock > product.minStock);

    return matchesSearch && matchesStatus && matchesCategory && matchesStockStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'tr');
      case 'price':
        return a.price - b.price;
      case 'stock':
        return a.stock - b.stock;
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürün yönetimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu panele erişmek için satıcı yetkilerine sahip olmanız gerekir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Eylemler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Package" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Ürün Yönetimi</h1>
                <p className="text-gray-600 mt-1">
                  Toplam {products.length} ürün • {currentProducts.length} görüntüleniyor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Tüm ürünleri yükle butonu */}
              <button
                onClick={async () => {
                  try {
                    await loadAllProductsFromImages();
                  } catch (error) {
                    console.error('Ürün yükleme hatası:', error);
                    showError('Ürünler yüklenirken hata oluştu');
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Tüm Ürünleri Yükle</span>
              </button>

              <button
                onClick={handleAddProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Yeni Ürün</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kategoriler Tab'ları */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setActiveTab(category.name);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${activeTab === category.name
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon name={category.icon || 'Package'} size={16} />
                  <span>{category.name}</span>
                </button>
                {category.name !== 'Tüm Ürünler' && (
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title={`${category.name} kategorisini sil`}
                  >
                    <Icon name="X" size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* Yeni Kategori Ekleme Butonu */}
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors flex items-center space-x-2"
              title="Yeni kategori ekle"
            >
              <Icon name="Plus" size={16} />
              <span>Kategori Ekle</span>
            </button>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tüm Stoklar</option>
                <option value="low">Düşük Stok</option>
                <option value="normal">Normal Stok</option>
              </select>
            </div>

            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">İsme Göre</option>
                <option value="price">Fiyata Göre</option>
                <option value="stock">Stoğa Göre</option>
                <option value="date">Tarihe Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-600 mb-4">Arama kriterlerinizi değiştirmeyi deneyin veya yeni ürün ekleyin.</p>
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-transparent border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600/10 transition-colors font-medium"
              >
                <Icon name="Plus" size={16} />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>
          ) : (
            <>
              {/* Ürün Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {currentProducts.map((product) => (
                  <div key={product.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Durum */}
                    <div className="flex items-center justify-end mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(product.isActive === true || product.status === 'active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {(product.isActive === true || product.status === 'active') ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    {/* Ürün Resmi */}
                    <div className="w-full aspect-[5/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative group overflow-hidden">
                      {product.image ? (
                        <>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
                          {/* Resim Değiştir Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer text-white text-sm bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                              <Icon name="Camera" size={16} className="inline mr-1" />
                              Değiştir
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    // Dosya boyutu kontrolü (2MB = 2 * 1024 * 1024 bytes)
                                    const maxSize = 2 * 1024 * 1024;
                                    if (file.size > maxSize) {
                                      showError('Dosya boyutu 2MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
                                      return;
                                    }

                                    if (!file.type.startsWith('image/')) {
                                      showError('Lütfen geçerli bir resim dosyası seçiniz (PNG, JPG, JPEG)');
                                      return;
                                    }

                                    // Resmi yükle ve boyutlandır
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageData = event.target.result;

                                      // Resmi boyutlandır
                                      const img = new Image();
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const ctx = canvas.getContext('2d');

                                        // Hedef boyutlar
                                        const targetWidth = 500;
                                        const targetHeight = 400;

                                        canvas.width = targetWidth;
                                        canvas.height = targetHeight;

                                        // Resmi canvas'a çiz (otomatik olarak yeniden boyutlandırılır)
                                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                                        // Yeniden boyutlandırılmış resmi base64'e çevir
                                        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);

                                        // Ürünü güncelle
                                        const updatedProducts = products.map(p =>
                                          p.id === product.id ? { ...p, image: resizedImage } : p
                                        );
                                        setProducts(updatedProducts);
                                        storage.set('products', updatedProducts);

                                        showSuccess('Ürün resmi başarıyla güncellendi');
                                      };
                                      img.src = imageData;
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors w-full h-full justify-center">
                          <Icon name="Camera" size={24} />
                          <span className="text-xs mt-1">Resim Ekle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                // Dosya boyutu kontrolü (2MB = 2 * 1024 * 1024 bytes)
                                const maxSize = 2 * 1024 * 1024;
                                if (file.size > maxSize) {
                                  showError('Dosya boyutu 2MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
                                  return;
                                }

                                if (!file.type.startsWith('image/')) {
                                  showError('Lütfen geçerli bir resim dosyası seçiniz (PNG, JPG, JPEG)');
                                  return;
                                }

                                // Resmi yükle ve boyutlandır
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const imageData = event.target.result;

                                  // Resmi boyutlandır
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');

                                    // Hedef boyutlar
                                    const targetWidth = 500;
                                    const targetHeight = 400;

                                    canvas.width = targetWidth;
                                    canvas.height = targetHeight;

                                    // Resmi canvas'a çiz (otomatik olarak yeniden boyutlandırılır)
                                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                                    // Yeniden boyutlandırılmış resmi base64'e çevir
                                    const resizedImage = canvas.toDataURL('image/jpeg', 0.8);

                                    // Ürünü güncelle
                                    const updatedProducts = products.map(p =>
                                      p.id === product.id ? { ...p, image: resizedImage } : p
                                    );
                                    setProducts(updatedProducts);
                                    storage.set('products', updatedProducts);

                                    showSuccess('Ürün resmi başarıyla eklendi');
                                  };
                                  img.src = imageData;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.subcategory}</p>

                      {/* Fiyat ve Birim */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          }).format(product.price)}
                        </span>
                        <span className="text-sm text-gray-500">/{product.unit}</span>
                      </div>

                      {/* Stok Durumu */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stok: {product.stock}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-800' :
                          product.stock <= product.minStock ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {product.stock === 0 ? 'Tükendi' :
                            product.stock <= product.minStock ? 'Az Stok' : 'Normal'}
                        </span>
                      </div>

                      {/* Açıklama */}
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                      )}
                    </div>

                    {/* İşlem Butonları */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-transparent border border-green-600 text-green-600 text-sm rounded hover:bg-green-600/10 transition-colors font-medium"
                      >
                        <Icon name="Edit2" size={14} />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center px-3 py-2 bg-transparent border border-red-600 text-red-600 text-sm rounded hover:bg-red-600/10 transition-colors font-medium"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Sayfa {currentPage} / {totalPages} ({sortedProducts.length} ürün)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Yeni Kategori Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Kategori Ekle</h3>
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Örn: Baharat, İçecekler, vb."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kategori adı en az 2 karakter olmalıdır.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Kategoriler
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Alt kategori ekle (opsiyonel)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                    <span>Genel</span>
                    <button className="ml-1 text-blue-500 hover:text-blue-700">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Alt kategoriler ürünleri daha detaylı sınıflandırmanıza yardımcı olur.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || newCategoryName.trim().length < 2}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Ürün Modal */}
      {showProductModal && (
        <ModernUrunModali
          product={editingProduct}
          categories={categories}
          activeCategory={activeTab !== 'Tüm Ürünler' ? activeTab : ''}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default UrunYonetimi;
