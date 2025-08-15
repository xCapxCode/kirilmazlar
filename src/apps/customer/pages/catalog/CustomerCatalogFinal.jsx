/**
 * MÜŞTERİ KATALOG SAYFASI - FİNAL VERSİYON
 * - Tek kutu tasarım (arama çubuğu altındaki kutu kaldırıldı)
 * - Stok kontrolü düzeltildi (gerçekte stok yoksa "stokta yok" yazısı)
 * - 4 ürün per satır (lg:grid-cols-4)
 */

import storage from '@core/storage';
import { logger } from '@utils/productionLogger';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import productSyncService from '../../../../services/productSyncService';

import Icon from '@shared/components/AppIcon';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';

const CustomerCatalogFinal = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const { addToCart } = useCart();
  const { showSuccess } = useNotification();

  // URL'den kategori al
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      logger.info('🔄 Ürünler yükleniyor...');

      // Storage'dan ürünleri al
      const rawProducts = await storage.get('products', []);
      logger.info('📦 Raw ürünler:', rawProducts.length);

      // ProductSyncService ile filtrele ve zenginleştir
      const filteredProducts = productSyncService.filterProductsForCustomer(rawProducts);
      logger.info('✅ Filtrelenmiş ürünler:', filteredProducts.length);

      // Kategorileri oluştur
      const categoryMap = productSyncService.createCategoryMap(filteredProducts);
      logger.info('📂 Kategoriler:', categoryMap.length);

      setProducts(filteredProducts);
      setCategories(categoryMap);

      // Kasalı ürünleri logla
      const kasaliProducts = filteredProducts.filter(p => p.isKasali);
      logger.info('🗃️ Kasalı ürünler:', kasaliProducts.length, kasaliProducts.map(p => p.name));

    } catch (error) {
      logger.error('❌ Ürün yükleme hatası:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadProducts();
  }, []);

  // Storage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      logger.info('📢 Storage değişikliği algılandı, ürünler yeniden yükleniyor...');
      loadProducts();
    };

    // Storage events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('productsUpdated', handleStorageChange);
    window.addEventListener('forceProductsReload', handleStorageChange);

    // BroadcastChannel
    const channel = new BroadcastChannel('products-sync');
    channel.addEventListener('message', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('productsUpdated', handleStorageChange);
      window.removeEventListener('forceProductsReload', handleStorageChange);
      channel.close();
    };
  }, []);

  // Ürünleri filtrele
  const filteredProducts = products.filter(product => {
    // Arama filtresi
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Kategori filtresi
    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'kasali-urunler' && product.isKasali) ||
      product.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sepete ekle
  const handleAddToCart = (product) => {
    addToCart(product);
    showSuccess(`${product.name} sepete eklendi`);
  };

  // Kategori değiştir
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchParams(categoryId === 'all' ? {} : { category: categoryId });
  };

  // Ürün detayını aç
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Tek Başlık Bandı - Arama ve kategoriler dahil */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Icon name="Package" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Ürün Kataloğu</h1>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} ürün • Taze ve kaliteli
                </p>
              </div>
            </div>
          </div>

          {/* Arama */}
          <div className="relative mb-4">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Kategoriler */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Icon name={category.icon} size={16} className="inline mr-2" />
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Ürünler - 4 ürün per satır */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Arama kriterlerinize uygun ürün bulunamadı.' : 'Bu kategoride ürün bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* Debug Info - Sadece development'ta */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
            <div>Toplam: {products.length}</div>
            <div>Filtrelenmiş: {filteredProducts.length}</div>
            <div>Kasalı: {products.filter(p => p.isKasali).length}</div>
            <div>Kategori: {selectedCategory}</div>
          </div>
        )}

        {/* Ürün Detay Modalı */}
        {showProductModal && selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerCatalogFinal;