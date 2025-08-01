import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import Icon from '../../../../../shared/components/AppIcon';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import logger from '../../../../../utils/logger';

// Bileşenler
import UrunModali from './components/UrunModali';

const UrunYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showConfirm } = useModal();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Auth kontrolü
  useEffect(() => {
    if (!authLoading && !user) {
      logger.error('Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!authLoading && userProfile?.role !== 'admin' && userProfile?.role !== 'seller') {
      logger.error('Yetkisiz erişim denemesi:', userProfile?.role);
      showError('Bu sayfaya erişim yetkiniz yok');
      return;
    }

    if (!authLoading && user && userProfile) {
      logger.info('✅ Ürün yönetimi yetkisi onaylandı:', userProfile.role);
      loadData();
    }
  }, [user, userProfile]);

  // ⚠️ DEVRE DIŞI - HARDCODED ÜRÜN YÜKLEMEK YERİNE GERÇEK ÜRÜN YÖNETİMİ
  const loadAllProductsFromImages = async () => {
    logger.warn('🚫 loadAllProductsFromImages() - Hardcoded ürün yüklemesi devre dışı bırakıldı');
    logger.info('✅ Artık sadece kullanıcının eklediği ürünler gösterilir');
    return []; // Boş array döndür
  };

  const loadData = async () => {
    try {
      logger.info('🔄 Ürün yönetimi verileri yükleniyor...');

      const [storedProducts, storedCategories] = await Promise.all([
        storage.get('products', []),
        storage.get('categories', [])
      ]);

      logger.info('📊 Storage\'dan yüklenen veriler:', {
        productsCount: storedProducts.length,
        categoriesCount: storedCategories.length
      });

      // ⚠️ DEVRE DIŞI - Otomatik ürün yükleme devre dışı bırakıldı
      // Artık sadece kullanıcının eklediği ürünler gösterilir  
      logger.info('✅ Gerçek ürün yönetimi: Sadece kullanıcı ürünleri gösteriliyor');
      setProducts(storedProducts);

      // Kategorileri ayarla
      if (storedCategories.length === 0) {
        logger.info('🆕 Temel kategoriler oluşturuluyor...');
        const defaultCategories = [
          { id: 'cat-1', name: 'Meyveler', description: 'Taze meyveler', isActive: true },
          { id: 'cat-2', name: 'Sebzeler', description: 'Taze sebzeler', isActive: true },
          { id: 'cat-3', name: 'İçecekler', description: 'Soğuk ve sıcak içecekler', isActive: true }
        ];
        await storage.set('categories', defaultCategories);
        setCategories(defaultCategories);
      } else {
        setCategories(storedCategories);
      }

      logger.info('✅ Ürün yönetimi verileri başarıyla yüklendi');

    } catch (error) {
      logger.error('❌ Ürün yönetimi veri yükleme hatası:', error);
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
    try {
      const confirmed = await showConfirm(
        'Ürün Silme Onayı',
        'Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        'Sil',
        'İptal'
      );

      if (confirmed) {
        const updatedProducts = products.filter(p => p.id !== productId);
        await storage.set('products', updatedProducts);
        setProducts(updatedProducts);
        showSuccess('Ürün başarıyla silindi');
        logger.info('✅ Ürün silindi:', productId);
      }
    } catch (error) {
      logger.error('❌ Ürün silme hatası:', error);
      showError('Ürün silinirken hata oluştu');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      let updatedProducts;

      if (editingProduct) {
        // Düzenleme
        updatedProducts = products.map(p =>
          p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
        );
        logger.info('✅ Ürün güncellendi:', productData.name);
        showSuccess('Ürün başarıyla güncellendi');
      } else {
        // Yeni ekleme
        const newProduct = {
          ...productData,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        updatedProducts = [...products, newProduct];
        logger.info('✅ Yeni ürün eklendi:', productData.name);
        showSuccess('Yeni ürün başarıyla eklendi');
      }

      await storage.set('products', updatedProducts);
      setProducts(updatedProducts);
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (error) {
      logger.error('❌ Ürün kaydetme hatası:', error);
      showError('Ürün kaydedilirken hata oluştu');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('Kategori adı boş olamaz');
      return;
    }

    try {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const updatedCategories = [...categories, newCategory];
      await storage.set('categories', updatedCategories);
      setCategories(updatedCategories);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowNewCategoryModal(false);
      showSuccess('Yeni kategori eklendi');
      logger.info('✅ Yeni kategori eklendi:', newCategoryName);
    } catch (error) {
      logger.error('❌ Kategori ekleme hatası:', error);
      showError('Kategori eklenirken hata oluştu');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const confirmed = await showConfirm(
        'Kategori Silme Onayı',
        'Bu kategoriyi silmek istediğinizden emin misiniz?',
        'Sil',
        'İptal'
      );

      if (confirmed) {
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        await storage.set('categories', updatedCategories);
        setCategories(updatedCategories);
        showSuccess('Kategori silindi');
        logger.info('✅ Kategori silindi:', categoryId);
      }
    } catch (error) {
      logger.error('❌ Kategori silme hatası:', error);
      showError('Kategori silinirken hata oluştu');
    }
  };

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sayfalama
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün yönetimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SaticiHeader
        title="Ürün Yönetimi"
        subtitle="Ürünlerinizi ekleyin, düzenleyin ve yönetin"
      />

      {/* Kategoriler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Kategoriler</h2>
            <span className="text-sm text-gray-500">{categories.length} kategori</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <div key={category.id}
                className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                {category.id !== 'cat-1' && category.id !== 'cat-2' && category.id !== 'cat-3' && (
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
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
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Ürünler</h2>
              <p className="text-gray-600 mt-1">
                Toplam {products.length} ürün • {currentProducts.length} görüntüleniyor
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* ⚠️ DEVRE DIŞI - Hardcoded ürün yükleme butonu kaldırıldı */}

              <button
                onClick={handleAddProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Yeni Ürün</span>
              </button>
            </div>
          </div>

          {/* Filtreler */}
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="Tümü">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="overflow-x-auto">
          {currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ürün eklenmemiş</h3>
              <p className="text-gray-500 mb-6">İlk ürününüzü eklemek için "Yeni Ürün" butonuna tıklayın</p>
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>İlk Ürünü Ekle</span>
              </button>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.image || '/assets/images/products/default.png'}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/assets/images/products/default.png';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{product.price?.toFixed(2)} / {product.unit || 'kg'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > (product.minStock || 5)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {product.stock || 0} {product.unit || 'kg'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {product.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Düzenle"
                          >
                            <Icon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Sil"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} arası,
                      toplam {filteredProducts.length} ürün
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Ürün Modali */}
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

      {/* Yeni Kategori Modali */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Yeni Kategori Ekle</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kategori adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kategori açıklaması"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrunYonetimi;
