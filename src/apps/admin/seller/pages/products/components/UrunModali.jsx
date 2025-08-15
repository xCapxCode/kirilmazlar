import { useEffect, useState } from 'react';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import storage from '../../../../../../core/storage';
import Icon from '../../../../../../shared/components/AppIcon';
import logger from '../../../../../../utils/logger';

const UrunModali = ({ product, categories, activeCategory, onSave, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: activeCategory || '',
    subcategory: '',
    unit: 'kg',
    price: '',
    stock: '',
    minStock: '',
    status: 'active',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [units, setUnits] = useState([]);

  // Birimleri ayarlar sayfasından yükle
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const customUnits = await storage.get('custom_units', []);
        const activeUnits = customUnits.filter(unit => unit.active);

        if (activeUnits.length > 0) {
          setUnits(activeUnits.map(unit => unit.name));
        } else {
          // Varsayılan birimler
          setUnits(['kg', 'adet', 'gram', 'litre', 'demet', 'kasa', 'çuval']);
        }
      } catch (error) {
        console.error('Birimler yüklenirken hata:', error);
        // Hata durumunda varsayılan birimler
        setUnits(['kg', 'adet', 'gram', 'litre', 'demet', 'kasa', 'çuval']);
      }
    };

    loadUnits();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        unit: product.unit || 'kg',
        price: product.price || '',
        stock: product.stock || '',
        minStock: product.minStock || '',
        status: product.status || 'active',
        image: product.image || null
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    logger.info('handleImageUpload çağrıldı', e.target.files);
    const file = e.target.files[0];
    if (file) {
      logger.info('Dosya seçildi:', file.name, file.type);
      processImageFile(file);
    } else {
      logger.info('Dosya seçilmedi');
    }
  };

  const processImageFile = (file) => {
    logger.info('processImageFile çağrıldı:', file);

    // Dosya boyutu kontrolü (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('Dosya boyutu 2MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
      return;
    }

    if (file && file.type.startsWith('image/')) {
      logger.info('Dosya tipi uygun, boyutlandırma başlıyor...');
      const reader = new FileReader();
      reader.onload = (event) => {
        logger.info('Dosya okundu, yeniden boyutlandırılıyor...');
        const imageData = event.target.result;
        resizeImage(imageData, 500, 400);
      };
      reader.readAsDataURL(file);
    } else {
      logger.info('Geçersiz dosya tipi:', file?.type);
      showError('Lütfen geçerli bir resim dosyası seçiniz (PNG, JPG, JPEG)');
    }
  };

  // Resmi belirtilen boyutlara yeniden boyutlandır
  const resizeImage = (imageDataUrl, targetWidth, targetHeight) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Canvas boyutlarını hedef boyutlara ayarla
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Resmi canvas'a çiz (otomatik olarak yeniden boyutlandırılır)
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Yeniden boyutlandırılmış resmi base64'e çevir
      const resizedImage = canvas.toDataURL('image/jpeg', 0.8);

      // Form data'ya kaydet
      setFormData(prev => ({
        ...prev,
        image: resizedImage
      }));

      logger.info('Resim başarıyla yeniden boyutlandırıldı:', targetWidth + 'x' + targetHeight);
    };

    img.src = imageDataUrl;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: selectedCategory,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gereklidir';
    }

    // Alt kategori artık zorunlu değil - opsiyonel

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Geçerli bir stok miktarı giriniz';
    }

    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'Geçerli bir minimum stok miktarı giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logger.info('Form submit edildi');
    logger.info('Form data:', formData);

    if (!validateForm()) {
      logger.info('Form validation başarısız');
      logger.info('Hatalar:', errors);
      showError('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    logger.info('Form validation başarılı, kaydetme işlemi başlıyor...');
    setIsSubmitting(true);

    try {
      let productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        status: formData.status || 'active', // Kullanıcının seçtiği durumu koru
        isActive: formData.status === 'active' // isActive alanını da güncelle
      };

      // YENİ SİSTEM: ProductSyncService ile kasalı ürün standardizasyonu
      productData = productSyncService.standardizeProductForSeller(productData);

      logger.info('🗃️ Standardize edilmiş ürün verisi:', productData);
      await onSave(productData);
      logger.info('Ürün başarıyla kaydedildi');

      showSuccess(product ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
    } catch (error) {
      logger.error('Ürün kaydetme hatası:', error);
      showError('Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">

            {/* Ürün Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Ürün adını giriniz"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ürün açıklaması"
              />
            </div>

            {/* Ürün Resmi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Resmi
              </label>
              <div
                className={`border-2 border-dashed rounded-lg overflow-hidden transition-all duration-200 ${isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {formData.image ? (
                  <div className="relative w-full h-48">
                    <img
                      src={formData.image}
                      alt="Ürün resmi"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <label className="bg-blue-600 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                        <Icon name="Edit2" size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center h-48 cursor-pointer transition-colors p-4 ${isDragOver
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <label className="flex flex-col items-center w-full h-full justify-center cursor-pointer">
                      {isDragOver ? (
                        <>
                          <Icon name="Upload" size={48} className="text-blue-500 mb-2" />
                          <span className="text-blue-600 text-sm font-medium">Resmi bırakın</span>
                          <span className="text-blue-400 text-xs mt-1">Dosya yüklenecek</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Camera" size={48} className="text-gray-400 mb-2" />
                          <span className="text-gray-600 text-sm font-medium">Ürün resmi yükleyin</span>
                          <span className="text-gray-400 text-xs mt-1">Tıklayın veya sürükleyip bırakın</span>
                          <span className="text-gray-400 text-xs">PNG, JPG, JPEG formatları desteklenir</span>
                          <span className="text-gray-400 text-xs">Maksimum 2MB, otomatik 500x400 boyutlandırılır</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              {formData.image && (
                <p className="text-xs text-gray-500 mt-2">
                  ✅ Resim 500x400 boyutunda otomatik olarak boyutlandırıldı
                </p>
              )}
            </div>

            {/* Kategori ve Alt Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Kategori seçiniz</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Kategori (Opsiyonel)
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  disabled={!selectedCategory}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${errors.subcategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Alt kategori seçiniz (opsiyonel)</option>
                  {selectedCategory?.subcategories?.map(subcategory => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  )) || []}
                </select>
                {errors.subcategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>
                )}
              </div>
            </div>

            {/* Birim ve Fiyat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birim
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Stok Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Stok *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.stock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stok *
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.minStock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.minStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                )}
              </div>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleInputChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktif</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleInputChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pasif</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{product ? 'Güncelle' : 'Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UrunModali;
