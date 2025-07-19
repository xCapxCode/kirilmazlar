import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import { storage } from '../../../../../utils/persistentStorage';

// Bileşenler
import UrunModali from './components/UrunModali';

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

  const loadData = async () => {
    try {
      console.log('🔄 Ürün yönetimi verileri yükleniyor...');
      
      const [storedProducts, storedCategories] = await Promise.all([
        storage.get('products', []),
        storage.get('categories', [])
      ]);

      console.log('📊 Storage\'dan yüklenen veriler:', {
        productsCount: storedProducts.length,
        categoriesCount: storedCategories.length
      });

      // Kategorileri ayarla
      if (storedCategories.length === 0) {
        console.log('🆕 Varsayılan kategoriler oluşturuluyor...');
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
            name: 'Kuru Yemiş',
            icon: 'Nut',
            color: 'amber',
            subcategories: ['Çiğ Kuruyemiş', 'Kurutulmuş Meyve']
          }
        ];
        
        await storage.set('categories', defaultCategories);
        setCategories(defaultCategories);
      } else {
        setCategories(storedCategories);
      }

      // Ürünleri ayarla
      if (storedProducts.length === 0) {
        console.log('🆕 Demo ürünler oluşturuluyor...');
        const demoProducts = [
          {
            id: 1,
            name: 'Domates',
            category: 'Sebzeler',
            subcategory: 'Mevsim Sebzeleri',
            unit: 'kg',
            price: 18.00,
            stock: 25,
            minStock: 5,
            status: 'active',
            image: '/assets/images/products/Domates.png',
            description: 'Taze, kırmızı, lezzetli domates',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Elma',
            category: 'Meyveler',
            subcategory: 'Yumuşak Meyveler',
            unit: 'kg',
            price: 15.00,
            stock: 40,
            minStock: 10,
            status: 'active',
            image: '/assets/images/products/Elma.png',
            description: 'Kırmızı, tatlı ve sulu elma',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Yeşil Elma',
            category: 'Meyveler',
            subcategory: 'Yumuşak Meyveler',
            unit: 'kg',
            price: 17.00,
            stock: 32,
            minStock: 8,
            status: 'active',
            image: '/assets/images/products/Yeşil Elma.png',
            description: 'Granny Smith yeşil elma, ekşi ve sağlıklı',
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            name: 'Portakal',
            category: 'Meyveler',
            subcategory: 'Turunçgiller',
            unit: 'kg',
            price: 20.00,
            stock: 28,
            minStock: 6,
            status: 'active',
            image: '/assets/images/products/Portakal.png',
            description: 'Valencia portakalı, vitamin C deposu',
            createdAt: new Date().toISOString()
          },
          {
            id: 5,
            name: 'Limon',
            category: 'Meyveler',
            subcategory: 'Turunçgiller',
            unit: 'kg',
            price: 25.00,
            stock: 15,
            minStock: 4,
            status: 'active',
            image: '/assets/images/products/Limon.png',
            description: 'Akdeniz limonu, ferahlatıcı ve aromatik',
            createdAt: new Date().toISOString()
          }
        ];
        
        await storage.set('products', demoProducts);
        setProducts(demoProducts);
      } else {
        setProducts(storedProducts);
      }

      console.log('✅ Ürün yönetimi verileri başarıyla yüklendi');
      
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        const currentProducts = await storage.get('products', []);
        const updatedProducts = currentProducts.filter(p => p.id !== productId);
        await storage.set('products', updatedProducts);
        setProducts(updatedProducts);
        
        console.log('✅ Ürün başarıyla silindi:', productId);
      } catch (error) {
        console.error('❌ Ürün silme hatası:', error);
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    console.log('🔍 handleSaveProduct çağrıldı:', productData);
    
    try {
      const currentProducts = await storage.get('products', []);
      let updatedProducts;
      
      if (editingProduct) {
        // Düzenleme
        updatedProducts = currentProducts.map(p => 
          p.id === editingProduct.id ? { 
            ...productData, 
            id: editingProduct.id,
            updatedAt: new Date().toISOString()
          } : p
        );
        console.log('🔍 Ürün güncellendi:', editingProduct.id);
      } else {
        // Yeni ekleme - güvenli ID oluşturma
        const newId = currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1;
        const newProduct = {
          ...productData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('🔍 Yeni ürün oluşturuluyor:', newProduct);
        updatedProducts = [...currentProducts, newProduct];
      }
      
      console.log('🔍 Güncellenecek tüm ürünler:', updatedProducts.length);
      
      // Unified storage'a kaydet (cross-device sync ile)
      await storage.set('products', updatedProducts);
      setProducts(updatedProducts);
      
      console.log('✅ Ürün başarıyla kaydedildi');
      
      setShowProductModal(false);
      setEditingProduct(null);
      
    } catch (error) {
      console.error('❌ Ürün kaydetme hatası:', error);
    }
  };

  // Filtreleme ve sayfalama
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesCategory = activeTab === 'Tüm Ürünler' || product.category === activeTab;
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

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin')) {
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
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveTab(category.name);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === category.name
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon name={category.icon} size={16} />
                <span>{category.name}</span>
              </button>
            ))}
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
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6">
          {currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-600">Aradığınız kriterlere uygun ürün bulunmuyor.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Icon name="Edit" size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fiyat:</span>
                          <span className="font-medium">{product.price.toFixed(2)} ₺/{product.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stok:</span>
                          <span className={`font-medium ${product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Durum:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ürün Modal */}
      {showProductModal && (
        <UrunModali
          product={editingProduct}
          categories={categories}
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
