import storage from '@core/storage';
import { getProductImagePath } from '@utils/imagePathHelper';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../contexts/NotificationContext';
import Icon from '../../../../../shared/components/AppIcon';
import { logger } from '../../../../../utils/productionLogger';

const MobileSellerProducts = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'Meyveler', name: 'Meyveler' },
    { id: 'Sebzeler', name: 'Sebzeler' },
    { id: 'Kasalı Ürünler', name: 'Kasalı Ürünler' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const savedProducts = storage.get('products', []);
      setProducts(savedProducts);
      logger.info(`📦 Mobile seller: ${savedProducts.length} ürün yüklendi`);
    } catch (error) {
      logger.error('Products loading error:', error);
      showError('Ürünler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category === selectedCategory
      );
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const toggleProductStatus = async (productId) => {
    try {
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          const newStatus = product.status === 'active' ? 'inactive' : 'active';
          return { ...product, status: newStatus };
        }
        return product;
      });

      storage.set('products', updatedProducts);
      setProducts(updatedProducts);
      showSuccess('Ürün durumu güncellendi');
    } catch (error) {
      logger.error('Product status update error:', error);
      showError('Ürün durumu güncellenirken hata oluştu');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStockStatus = (stock, minStock = 5) => {
    if (stock <= 0) {
      return { label: 'Stokta Yok', color: 'bg-red-100 text-red-800' };
    } else if (stock <= minStock) {
      return { label: 'Az Stok', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Stokta', color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative px-6 py-8 text-white">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Package" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Ürünlerim</h1>
            <p className="text-white/80 text-sm">
              {filteredProducts.length} ürün mevcut
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {products.filter(p => p.status === 'active').length}
                </div>
                <div className="text-white/70 text-xs">Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {products.filter(p => p.stock < p.minStock).length}
                </div>
                <div className="text-white/70 text-xs">Az Stok</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  {products.length}
                </div>
                <div className="text-white/70 text-xs">Toplam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-24 relative z-20 space-y-4">
        {/* Arama ve Filtreler */}
        <div className="space-y-3">
          {/* Arama Çubuğu */}
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
            />
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ürün Listesi */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 rounded-xl h-16 w-16"></div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded h-4 w-32 mb-2"></div>
                    <div className="bg-gray-200 rounded h-3 w-24 mb-2"></div>
                    <div className="bg-gray-200 rounded h-3 w-16"></div>
                  </div>
                  <div className="bg-gray-200 rounded h-8 w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Package" size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Arama kriterlerinize uygun ürün yok.' : 'Henüz ürün eklenmemiş.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-medium"
            >
              İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStock);
              return (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center space-x-4">
                    {/* Ürün Resmi */}
                    <img
                      src={getProductImagePath(product.name)}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = '/assets/images/placeholders/product-placeholder.png';
                      }}
                    />

                    {/* Ürün Bilgileri */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {product.status === 'active' ? 'Aktif' : 'Pasif'}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-500">/{product.unit}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Stok: {product.stock} {product.unit}
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <Icon name="Edit" size={16} className="text-gray-600" />
                          </button>
                          <button className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors">
                            <Icon name="Trash2" size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ürün Ekleme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Plus" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Ekle</h3>
              <p className="text-gray-500">Bu özellik yakında eklenecek</p>
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSellerProducts;