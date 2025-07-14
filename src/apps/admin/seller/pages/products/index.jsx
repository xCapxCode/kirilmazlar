import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@contexts/AuthContext';
import SaticiHeader from '@shared/components/ui/SaticiHeader';
import Icon from '@shared/components/AppIcon';
import KirilmazlarStorage from '../../../../../core/storage/index.js';
import resetApplication from '@utils/resetApp';

// Bileşenler
import UrunModali from './components/UrunModali';

// Storage instance
const storage = KirilmazlarStorage.getInstance();

// Utility function to trigger product updates
const triggerProductsUpdate = () => {
  // Trigger custom event to notify other components
  window.dispatchEvent(new CustomEvent('productsUpdated'));
  
  // Use unified storage for cross-device sync
  storage.broadcastChange('products');
};

const UrunYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
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

  // Cross-device communication - unified storage events
  useEffect(() => {
    const handleProductsUpdated = (data) => {
      setProducts(data.products || []);
      console.log('🔄 Products updated via cross-device sync');
    };

    const handleCategoriesUpdated = (data) => {
      setCategories(data.categories || []);
      console.log('🔄 Categories updated via cross-device sync');
    };

    // Listen for unified storage changes
    storage.addEventListener('products', handleProductsUpdated);
    storage.addEventListener('categories', handleCategoriesUpdated);

    return () => {
      storage.removeEventListener('products', handleProductsUpdated);
      storage.removeEventListener('categories', handleCategoriesUpdated);
    };
  }, []);

  // Demo veriler - kategoriler ile birlikte ürünler
  useEffect(() => {
    const loadData = () => {
      console.log('🔄 Veri yükleme başlatılıyor...');
      
      // Veri versiyonu kontrolü
      const isDataValid = checkDataVersion();
      if (!isDataValid) {
        console.log('� Veri versiyonu uyumsuz, temiz başlangıç yapılıyor...');
      }
      
      // Kategorileri yükle - unified storage kullan
      let mockCategories = storage.get('categories', null);
      
      if (!mockCategories || !Array.isArray(mockCategories) || mockCategories.length === 0) {
        console.log('🆕 Varsayılan kategoriler oluşturuluyor...');
        mockCategories = [
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
            subcategories: ['Turunçgiller', 'Çekirdekli Meyveler', 'Tropik Meyveler']
          }
        ];
        storage.set('categories', mockCategories);
      }

      // Ürünleri yükle - unified storage kullan
      let loadedProducts = storage.get('products', []);
      
      // Ürünler boş veya geçersizse demo verilerini yükle
      if (!Array.isArray(loadedProducts) || loadedProducts.length === 0) {
        console.log('🆕 Demo ürünleri oluşturuluyor...');
        loadedProducts = [
        // Sebzeler
        {
          id: 1,
          name: 'Domates',
          category: 'Sebzeler',
          subcategory: 'Mevsim Sebzeleri',
          unit: 'kg',
          price: 15.00,
          stock: 25,
          minStock: 5,
          status: 'active',
          image: 'Domates.png',
          description: 'Taze ve organik domates'
        },
        {
          id: 2,
          name: 'Kavun',
          category: 'Sebzeler',
          subcategory: 'Mevsim Sebzeleri',
          unit: 'kg',
          price: 12.00,
          stock: 18,
          minStock: 5,
          status: 'active',
          image: 'Kavun.png',
          description: 'Tatlı kavun'
        },
        {
          id: 3,
          name: 'Kayısı',
          category: 'Sebzeler',
          subcategory: 'Mevsim Sebzeleri',
          unit: 'kg',
          price: 25.00,
          stock: 10,
          minStock: 3,
          status: 'active',
          image: 'Kayısı.png',
          description: 'Taze kayısı'
        },
        {
          id: 4,
          name: 'Kırmızı Biber',
          category: 'Sebzeler',
          subcategory: 'Mevsim Sebzeleri',
          unit: 'kg',
          price: 22.00,
          stock: 15,
          minStock: 4,
          status: 'active',
          image: 'Kırmızı Biber.png',
          description: 'Kırmızı dolmalık biber'
        },
        {
          id: 5,
          name: 'Kereviz',
          category: 'Sebzeler',
          subcategory: 'Kök Sebzeler',
          unit: 'kg',
          price: 18.00,
          stock: 12,
          minStock: 3,
          status: 'active',
          image: 'Kereviz.png',
          description: 'Taze kereviz'
        },
        {
          id: 6,
          name: 'Kıvırcık',
          category: 'Sebzeler',
          subcategory: 'Yeşil Yapraklılar',
          unit: 'demet',
          price: 4.00,
          stock: 20,
          minStock: 8,
          status: 'active',
          image: 'Kıvırcık.png',
          description: 'Kıvırcık salata'
        },
        {
          id: 7,
          name: 'Tere Otu',
          category: 'Sebzeler',
          subcategory: 'Yeşil Yapraklılar',
          unit: 'demet',
          price: 2.50,
          stock: 25,
          minStock: 10,
          status: 'active',
          image: 'TereOtu.png',
          description: 'Taze tere otu'
        },

        // Meyveler
        {
          id: 8,
          name: 'Ananas',
          category: 'Meyveler',
          subcategory: 'Tropik Meyveler',
          unit: 'adet',
          price: 35.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'Ananas.png',
          description: 'Tropik ananas'
        },
        {
          id: 9,
          name: 'Armut',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 16.00,
          stock: 12,
          minStock: 4,
          status: 'active',
          image: 'Armut.png',
          description: 'Deveci armut'
        },
        {
          id: 10,
          name: 'Ayva',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 14.00,
          stock: 10,
          minStock: 3,
          status: 'active',
          image: 'Ayva.png',
          description: 'Taze ayva'
        },
        {
          id: 11,
          name: 'Avokado',
          category: 'Meyveler',
          subcategory: 'Tropik Meyveler',
          unit: 'adet',
          price: 12.00,
          stock: 15,
          minStock: 5,
          status: 'active',
          image: 'Avokado.png',
          description: 'Organik avokado'
        },
        {
          id: 12,
          name: 'Çilek',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 35.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'Çilek.png',
          description: 'Organik çilek'
        },
        {
          id: 13,
          name: 'Dan Eti',
          category: 'Et ve Tavuk',
          subcategory: 'Et Ürünleri',
          unit: 'kg',
          price: 180.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'DanMısır.png',
          description: 'Dana kuşbaşı'
        },
        {
          id: 14,
          name: 'Elma',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 12.00,
          stock: 20,
          minStock: 5,
          status: 'active',
          image: 'Elma.png',
          description: 'Kırmızı elma'
        },
        {
          id: 15,
          name: 'Greyfurt',
          category: 'Meyveler',
          subcategory: 'Turunçgiller',
          unit: 'kg',
          price: 12.00,
          stock: 15,
          minStock: 4,
          status: 'active',
          image: 'Greyfurt.png',
          description: 'Pembe greyfurt'
        },
        {
          id: 16,
          name: 'İncir',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 28.00,
          stock: 12,
          minStock: 3,
          status: 'active',
          image: 'İncir.png',
          description: 'Taze incir'
        },
        {
          id: 17,
          name: 'Kivi',
          category: 'Meyveler',
          subcategory: 'Tropik Meyveler',
          unit: 'kg',
          price: 32.00,
          stock: 10,
          minStock: 3,
          status: 'active',
          image: 'Kivi.png',
          description: 'Taze kivi'
        },
        {
          id: 18,
          name: 'Kiraz',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 45.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'Kiraz.png',
          description: 'Napoleon kiraz'
        },
        {
          id: 19,
          name: 'Lime',
          category: 'Meyveler',
          subcategory: 'Turunçgiller',
          unit: 'kg',
          price: 25.00,
          stock: 6,
          minStock: 2,
          status: 'active',
          image: 'Lime.png',
          description: 'Taze lime'
        },
        {
          id: 20,
          name: 'Limon',
          category: 'Meyveler',
          subcategory: 'Turunçgiller',
          unit: 'kg',
          price: 8.00,
          stock: 15,
          minStock: 5,
          status: 'active',
          image: 'Limon.png',
          description: 'Taze limon'
        },
        {
          id: 21,
          name: 'Mandalina',
          category: 'Meyveler',
          subcategory: 'Turunçgiller',
          unit: 'kg',
          price: 8.00,
          stock: 20,
          minStock: 6,
          status: 'active',
          image: 'Mandalina.png',
          description: 'Satsuma mandalina'
        },
        {
          id: 22,
          name: 'Mantar',
          category: 'Sebzeler',
          subcategory: 'Özel Ürünler',
          unit: 'kg',
          price: 55.00,
          stock: 5,
          minStock: 2,
          status: 'active',
          image: 'Mantar.png',
          description: 'Beyaz mantar'
        },
        {
          id: 23,
          name: 'Muz',
          category: 'Meyveler',
          subcategory: 'Tropik Meyveler',
          unit: 'kg',
          price: 15.00,
          stock: 20,
          minStock: 6,
          status: 'active',
          image: 'Muz.png',
          description: 'Ekvador muzu'
        },
        {
          id: 24,
          name: 'Nar',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 18.00,
          stock: 10,
          minStock: 3,
          status: 'active',
          image: 'Nar.png',
          description: 'Ekşi nar'
        },
        {
          id: 25,
          name: 'Portakal',
          category: 'Meyveler',
          subcategory: 'Turunçgiller',
          unit: 'kg',
          price: 10.00,
          stock: 30,
          minStock: 8,
          status: 'active',
          image: 'Portakal.png',
          description: 'Taze portakal'
        },
        {
          id: 26,
          name: 'Roka',
          category: 'Sebzeler',
          subcategory: 'Yeşil Yapraklılar',
          unit: 'demet',
          price: 3.00,
          stock: 30,
          minStock: 10,
          status: 'active',
          image: 'Roka.png',
          description: 'Taze roka'
        },
        {
          id: 27,
          name: 'Salatalık',
          category: 'Sebzeler',
          subcategory: 'Yeşil Yapraklılar',
          unit: 'kg',
          price: 8.00,
          stock: 15,
          minStock: 3,
          status: 'active',
          image: 'Salatalık.png',
          description: 'Günlük taze salatalık'
        },
        {
          id: 28,
          name: 'Sarımsak',
          category: 'Sebzeler',
          subcategory: 'Kök Sebzeler',
          unit: 'kg',
          price: 45.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'Sarımsak.png',
          description: 'Yerli sarımsak'
        },
        {
          id: 29,
          name: 'Şeftali',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 20.00,
          stock: 12,
          minStock: 4,
          status: 'active',
          image: 'Şeftali.png',
          description: 'Tatlı şeftali'
        },
        {
          id: 30,
          name: 'Üzüm',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 18.00,
          stock: 20,
          minStock: 5,
          status: 'active',
          image: 'Üzüm.png',
          description: 'Çekirdeksiz üzüm'
        },
        {
          id: 31,
          name: 'Yeşil Elma',
          category: 'Meyveler',
          subcategory: 'Çekirdekli Meyveler',
          unit: 'kg',
          price: 14.00,
          stock: 18,
          minStock: 5,
          status: 'active',
          image: 'Yeşil Elma.png',
          description: 'Granny Smith elma'
        },

        // Et ve Tavuk
        {
          id: 32,
          name: 'Dana Eti',
          category: 'Et ve Tavuk',
          subcategory: 'Et Ürünleri',
          unit: 'kg',
          price: 180.00,
          stock: 8,
          minStock: 2,
          status: 'active',
          image: 'DanMısır.png',
          description: 'Dana kuşbaşı'
        },
        {
          id: 33,
          name: 'Tavuk Eti',
          category: 'Et ve Tavuk',
          subcategory: 'Tavuk',
          unit: 'kg',
          price: 45.00,
          stock: 15,
          minStock: 5,
          status: 'active',
          image: 'chicken.jpg',
          description: 'Tavuk göğsü'
        },

        // Balık
        {
          id: 34,
          name: 'Somon',
          category: 'Balık',
          subcategory: 'Deniz Balıkları',
          unit: 'kg',
          price: 120.00,
          stock: 5,
          minStock: 2,
          status: 'active',
          image: 'salmon.jpg',
          description: 'Norveç somon fileto'
        },

        // Süt Ürünleri
        {
          id: 35,
          name: 'Süt',
          category: 'Süt Ürünleri',
          subcategory: 'Süt',
          unit: 'litre',
          price: 8.50,
          stock: 25,
          minStock: 10,
          status: 'active',
          image: 'milk.jpg',
          description: 'Tam yağlı süt'
        },

        // İçecekler
        {
          id: 36,
          name: 'Su',
          category: 'İçecekler',
          subcategory: 'Meşrubat',
          unit: '1.5L',
          price: 2.50,
          stock: 50,
          minStock: 20,
          status: 'active',
          image: 'water.jpg',
          description: 'Doğal kaynak suyu'
        }
      ];

        setProducts(loadedProducts);
        // Demo verileri unified storage ile kaydet
        storage.set('products', loadedProducts);
        console.log('📦 Demo ürünler yüklendi:', loadedProducts.length);
      } else {
        // Mevcut ürünleri set et
        setProducts(loadedProducts);
        console.log('📦 Mevcut ürünler yüklendi:', loadedProducts.length);
      }

      setCategories(mockCategories);
      setLoading(false);
      console.log('✅ Veri yükleme tamamlandı');
    };

    loadData();
  }, []);

  // Ürünler değiştiğinde localStorage'a kaydet ve event dispatch et
  // NOT: Bu useEffect kaldırıldı çünkü infinite loop yaratıyordu
  // Artık ürünler sadece manuel değişikliklerde (create/edit/delete) kaydedilecek

  // Aktif sekmeye göre filtrelenmiş ürünler
  const filteredProducts = useMemo(() => {
    let filtered = activeTab === 'Tüm Ürünler' ? products : products.filter(product => product.category === activeTab);

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.subcategory.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Stok durumu filtresi
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'low':
          filtered = filtered.filter(product => product.stock > 0 && product.stock <= product.minStock);
          break;
        case 'out':
          filtered = filtered.filter(product => product.stock === 0);
          break;
        case 'normal':
          filtered = filtered.filter(product => product.stock > product.minStock);
          break;
      }
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'stock_high':
          return b.stock - a.stock;
        case 'stock_low':
          return a.stock - b.stock;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, activeTab, filters]);

  // Sayfalama
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Aktif sekme istatistikleri
  const tabStatistics = useMemo(() => {
    const categoryProducts = activeTab === 'Tüm Ürünler' ? products : products.filter(product => product.category === activeTab);
    const totalProducts = categoryProducts.length;
    const activeProducts = categoryProducts.filter(product => product.status === 'active').length;
    const inactiveProducts = categoryProducts.filter(product => product.status === 'inactive').length;
    const lowStockProducts = categoryProducts.filter(product => product.stock > 0 && product.stock <= product.minStock).length;
    const outOfStockProducts = categoryProducts.filter(product => product.stock === 0).length;
    const totalValue = categoryProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  }, [products, activeTab]);

  // Para formatı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Stok durumu rengini al
  const getStockStatusColor = (product) => {
    if (product.stock === 0) return 'bg-red-100 text-red-800';
    if (product.stock <= product.minStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Stok durumu metni
  const getStockStatusText = (product) => {
    if (product.stock === 0) return 'Tükendi';
    if (product.stock <= product.minStock) return 'Az Stok';
    return 'Normal';
  };

  // Durum rengini al
  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  // Durum metni
  const getStatusText = (status) => {
    return status === 'active' ? 'Aktif' : 'Pasif';
  };

  // Kategori rengini al
  const getCategoryColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      brown: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Filtre değişikliği
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      stockStatus: '',
      sortBy: 'name'
    });
    setCurrentPage(1);
  };

  // Sekme değişikliği
  const handleTabChange = (categoryName) => {
    setActiveTab(categoryName);
    setCurrentPage(1);
    setSelectedProducts([]);
    handleResetFilters();
  };

  // Yeni kategori ekleme
  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    
    if (!trimmedName) {
      window.showToast && window.showToast('Kategori adı boş olamaz', 'error');
      return;
    }
    
    if (trimmedName.length < 2) {
      window.showToast && window.showToast('Kategori adı en az 2 karakter olmalıdır', 'error');
      return;
    }
    
    if (categories.find(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      window.showToast && window.showToast('Bu kategori zaten mevcut', 'error');
      return;
    }
    
    try {
      const newCategory = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name: trimmedName,
        icon: 'Package',
        color: 'blue',
        subcategories: ['Genel']
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      
      // Unified storage'a kaydet (cross-device sync ile)
      storage.set('categories', updatedCategories);
      
      setActiveTab(newCategory.name);
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      window.showToast && window.showToast('Kategori başarıyla eklendi', 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      window.showToast && window.showToast('Kategori eklenirken hata oluştu', 'error');
    }
  };

  // Kategori silme
  const handleDeleteCategory = (categoryToDelete) => {
    // Kategorideki ürün sayısını kontrol et
    const categoryProducts = products.filter(p => p.category === categoryToDelete.name);
    
    if (categoryProducts.length > 0) {
      alert(`Bu kategoride ${categoryProducts.length} ürün bulunuyor. Önce ürünleri silmeniz veya başka kategoriye taşımanız gerekiyor.`);
      return;
    }

    if (categories.length <= 1) {
      alert('En az bir kategori bulunmalıdır.');
      return;
    }

    if (window.confirm(`"${categoryToDelete.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
      setCategories(updatedCategories);
      
      // Unified storage'a kaydet (cross-device sync ile)
      storage.set('categories', updatedCategories);
      
      // Eğer silinen kategori aktif sekme ise, ilk kategoriye geç
      if (activeTab === categoryToDelete.name) {
        setActiveTab(updatedCategories[0].name);
      }
      
      window.showToast && window.showToast('Kategori başarıyla silindi', 'success');
    }
  };

  // Satıcı değilse yönlendir
  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== 'seller' && userProfile.role !== 'admin') {
      window.location.href = '/customer/catalog';
    }
  }, [authLoading, userProfile]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      persistentStorage.setProducts(updatedProducts);
      
      // Show success toast
      window.showToast && window.showToast('Ürün başarıyla silindi!', 'success');
    }
  };

  const handleSaveProduct = (productData) => {
    console.log('🔍 handleSaveProduct çağrıldı:', productData);
    let updatedProducts;
    
    if (editingProduct) {
      // Düzenleme
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { 
          ...productData, 
          id: editingProduct.id,
          updatedAt: new Date().toISOString()
        } : p
      );
    } else {
      // Yeni ekleme - güvenli ID oluşturma
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('🔍 Yeni ürün oluşturuluyor:', newProduct);
      updatedProducts = [...products, newProduct];
    }
    
    console.log('🔍 Güncellenecek tüm ürünler:', updatedProducts);
    console.log('🔍 Güncellenecek ürün sayısı:', updatedProducts.length);
    
    // State'i güncelle
    setProducts(updatedProducts);
    
    // Unified storage'a kaydet (cross-device sync ile)
    storage.set('products', updatedProducts);
    console.log('🔍 Unified storage\'a kaydedildi');
    
    // Show success toast
    window.showToast && window.showToast(
      editingProduct ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!',
      'success'
    );
    
    setShowProductModal(false);
    setEditingProduct(null);
    
    console.log('✅ Ürün başarıyla kaydedildi');
  };

  const handleBulkAction = (action) => {
    let updatedProducts;
    
    switch (action) {
      case 'activate':
        updatedProducts = products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, status: 'active', updatedAt: new Date().toISOString() } : p
        );
        break;
      case 'deactivate':
        updatedProducts = products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, status: 'inactive', updatedAt: new Date().toISOString() } : p
        );
        break;
      case 'delete':
        if (window.confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) {
          updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
        } else {
          return; // İptal edildi, işlem yapma
        }
        break;
      default:
        return;
    }
    
    setProducts(updatedProducts);
    storage.set('products', updatedProducts);
    setSelectedProducts([]);
  };

  const handleImageUpload = (e, productId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        const updatedProducts = products.map(p => 
          p.id === productId ? { ...p, image: imageData } : p
        );
        setProducts(updatedProducts);
        storage.set('products', updatedProducts);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bandı */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Package" size={24} className="text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-purple-600">Ürün Yönetimi</h1>
                <p className="text-gray-600 mt-1">Ürünlerinizi ve kategorilerinizi yönetin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (confirm('Tüm cache temizlenecek ve sayfa yenilenecek. Devam etmek istiyor musunuz?')) {
                    resetApplication();
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50/50 transition-colors bg-transparent text-red-600"
                title="Cache temizle ve uygulamayı sıfırla"
              >
                <Icon name="Trash2" size={18} />
                <span>Cache Temizle</span>
              </button>
              
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50/50 transition-colors bg-transparent"
              >
                <Icon name="RefreshCw" size={18} />
                <span>Filtreleri Sıfırla</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Package" size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{tabStatistics.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{tabStatistics.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="AlertTriangle" size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Düşük Stok</p>
                <p className="text-2xl font-bold text-gray-900">{tabStatistics.lowStockProducts}</p>
              </div>
            </div>
          </div>


        </div>

        {/* Kategori Tabları */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab(category.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === category.name
                        ? 'bg-green-500/30 text-green-800 border-2 border-green-400/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-500/20 hover:text-green-700 border-2 border-transparent'
                    }`}
                  >
                    <Icon name={category.icon} size={16} />
                    <span>{category.name}</span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold">
                      {category.name === 'Tüm Ürünler' 
                        ? products.length 
                        : products.filter(p => p.category === category.name).length}
                    </span>
                  </button>
                  {category.name !== 'Tüm Ürünler' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.name);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors bg-transparent"
                      title="Kategoriyi Sil"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/30 text-green-800 hover:bg-green-500/40 rounded-lg font-medium border-2 border-green-400/50 transition-colors"
            >
              <Icon name="Plus" size={16} />
              <span>Yeni Kategori</span>
            </button>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  placeholder="Ürün adı ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            {/* Stok Durumu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Durumu
              </label>
              <select
                value={filters.stockStatus}
                onChange={(e) => handleFilterChange({ stockStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tüm Stoklar</option>
                <option value="inStock">Stokta Var</option>
                <option value="lowStock">Düşük Stok</option>
                <option value="outOfStock">Stokta Yok</option>
              </select>
            </div>

            {/* Sıralama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Ürün Adı</option>
                <option value="price">Fiyat</option>
                <option value="stock">Stok</option>
                <option value="category">Kategori</option>
              </select>
            </div>
          </div>

          {/* Filtre Butonları */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredProducts.length} ürün bulundu
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-transparent border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600/10 transition-colors flex items-center space-x-2 font-medium"
            >
              <Icon name="Plus" size={16} />
              <span>Yeni Ürün</span>
            </button>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedProducts.length === 0 ? (
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
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Checkbox ve Durum */}
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </label>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
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
                                onChange={(e) => handleImageUpload(e, product.id)}
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
                            onChange={(e) => handleImageUpload(e, product.id)}
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
                        <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                        <span className="text-sm text-gray-500">/{product.unit}</span>
                      </div>

                      {/* Stok Durumu */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stok: {product.stock}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product)}`}>
                          {getStockStatusText(product)}
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
                      Sayfa {currentPage} / {totalPages} ({filteredProducts.length} ürün)
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50/80 transition-colors bg-transparent"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 px-4 py-2 bg-transparent border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Modal */}
      {showProductModal && (
        <UrunModali
          product={editingProduct}
          categories={categories}
          activeCategory={activeTab}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default UrunYonetimi;
