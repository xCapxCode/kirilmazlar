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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: '',
    minStock: '',
    description: ''
  });

  // Kategoriler - Müşteri mobil ile aynı tasarım
  const categories = [
    {
      id: 'all',
      name: 'Tümü',
      emoji: '🛒'
    },
    {
      id: 'Sebzeler',
      name: 'Sebzeler',
      emoji: '🥬'
    },
    {
      id: 'Meyveler',
      name: 'Meyveler',
      emoji: '🍎'
    },
    {
      id: 'Kasalı Ürünler',
      name: 'Kasalı Ürünler',
      emoji: '📦'
    }
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

    // Kategori filtresi - müşteri mobil ile aynı mantık
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();

        return productCategory.includes(selectedCat) ||
          productCategory === selectedCat ||
          (selectedCat === 'sebzeler' && (productCategory.includes('sebze') || productCategory.includes('yeşil'))) ||
          (selectedCat === 'meyveler' && (productCategory.includes('meyve') || productCategory.includes('fruit'))) ||
          (selectedCat === 'kasalı ürünler' && (productCategory.includes('kasalı') || productCategory.includes('kasali') || productCategory === 'kasalı ürünler'));
      });
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

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock?.toString() || '5',
      description: product.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    try {
      if (!editForm.name.trim() || !editForm.price || !editForm.stock) {
        showError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      const updatedProducts = products.map(product => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            name: editForm.name.trim(),
            price: parseFloat(editForm.price),
            stock: parseInt(editForm.stock),
            minStock: parseInt(editForm.minStock) || 5,
            description: editForm.description.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      });

      storage.set('products', updatedProducts);
      setProducts(updatedProducts);
      setShowEditModal(false);
      setSelectedProduct(null);
      showSuccess('Ürün başarıyla güncellendi');
      logger.info(`📝 Product updated: ${editForm.name}`);
    } catch (error) {
      logger.error('Product update error:', error);
      showError('Ürün güncellenirken hata oluştu');
    }
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      const updatedProducts = products.filter(product => product.id !== selectedProduct.id);
      storage.set('products', updatedProducts);
      setProducts(updatedProducts);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      showSuccess('Ürün başarıyla silindi');
      logger.info(`🗑️ Product deleted: ${selectedProduct.name}`);
    } catch (error) {
      logger.error('Product delete error:', error);
      showError('Ürün silinirken hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Hero - Müşteri mobil favoriler gibi */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header Content */}
        <div className="relative z-10 px-4 pt-12 pb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/ms/dashboard')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>

            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="Plus" size={20} className="text-white" />
            </button>
          </div>

          {/* Hero Content */}
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
                  {products.filter(p => p.stock < 5).length}
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
      <div className="px-4 -mt-4 pb-24 relative z-20">
        {/* Arama ve Filtreler */}
        <div className="space-y-3 mb-6">
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

          {/* Kategori Filtreleri - Kutu şeklinde */}
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all w-20 h-20 ${selectedCategory === category.id
                  ? 'bg-green-200 shadow-md'
                  : 'bg-green-100 shadow-sm hover:bg-green-150 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span className="text-2xl">
                    {category.emoji}
                  </span>
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${selectedCategory === category.id ? 'text-green-700' : 'text-green-600'
                  }`}>
                  {category.name}
                </span>
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
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Icon name="Edit" size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                          >
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

      {/* Ürün Ekleme Modal - Web satıcı paneline yönlendirme */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Plus" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Ekle</h3>
              <p className="text-gray-500">Web satıcı panelinde ürün ekleyebilirsiniz</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  window.open('/seller/products', '_blank');
                  setShowAddModal(false);
                }}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium"
              >
                Web'de Aç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Düzenleme Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ürün Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Icon name="X" size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ürün Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                  placeholder="Ürün adını girin"
                />
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Stok
                  </label>
                  <input
                    type="number"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
                  placeholder="Ürün açıklaması (opsiyonel)"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Silme Onay Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Trash2" size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürünü Sil</h3>
              <p className="text-gray-500">
                <span className="font-medium">{selectedProduct.name}</span> ürününü silmek istediğinizden emin misiniz?
              </p>
              <p className="text-red-500 text-sm mt-2">Bu işlem geri alınamaz.</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSellerProducts;