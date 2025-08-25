import { useEffect, useState } from 'react';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import storage from '../../../../../../core/storage';
import productSyncService from '../../../../../../services/productSyncService';
import Icon from '../../../../../../shared/components/AppIcon';
import logger from '../../../../../../utils/productionLogger';

const ModernUrunModali = ({ product, categories, activeCategory, onSave, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: activeCategory || '',
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

  // Birimleri yükle
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const customUnits = await storage.get('custom_units', []);
        const activeUnits = customUnits.filter(unit => unit.active);

        if (activeUnits.length > 0) {
          setUnits(activeUnits.map(unit => unit.name));
        } else {
          setUnits(['kg', 'adet', 'gram', 'litre', 'demet', 'kasa', 'çuval']);
        }
      } catch (error) {
        console.error('Birimler yüklenirken hata:', error);
        setUnits(['kg', 'adet', 'gram', 'litre', 'demet', 'kasa', 'çuval']);
      }
    };

    loadUnits();
  }, []);

  // Düzenleme modunda form verilerini doldur
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('Dosya boyutu 2MB\'dan büyük olamaz.');
      return;
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        resizeImage(imageData, 500, 400);
      };
      reader.readAsDataURL(file);
    } else {
      showError('Lütfen geçerli bir resim dosyası seçiniz (PNG, JPG, JPEG)');
    }
  };

  const resizeImage = (imageDataUrl, targetWidth, targetHeight) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const resizedImage = canvas.toDataURL('image/jpeg', 0.8);

      setFormData(prev => ({
        ...prev,
        image: resizedImage
      }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gereklidir';
    }

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

    if (!validateForm()) {
      showError('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setIsSubmitting(true);

    try {
      let productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        status: formData.status,
        isActive: formData.status === 'active'
      };

      // ProductSyncService ile standardize et
      productData = productSyncService.standardizeProductForSeller(productData);

      logger.info('🗃️ Standardize edilmiş ürün verisi:', productData);
      await onSave(productData);

      showSuccess(product ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
    } catch (error) {
      logger.error('Ürün kaydetme hatası:', error);
      showError('Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kasalı ürün kontrolü
  const isKasaliUnit = productSyncService.isKasaliUnit(formData.unit);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Icon name={product ? "Edit2" : "Plus"} size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <p className="text-green-100 text-sm">
                  {isKasaliUnit ? '🗃️ Kasalı ürün olarak kaydedilecek' : 'Standart ürün'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
            >
              <Icon name="X" size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">

            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Icon name="Info" size={20} className="text-green-600 mr-2" />
                Temel Bilgiler
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ürün Adı */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Ürün adını giriniz"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon name="AlertCircle" size={16} className="mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon name="AlertCircle" size={16} className="mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Birim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit} {productSyncService.isKasaliUnit(unit) ? '🗃️' : ''}
                      </option>
                    ))}
                  </select>
                  {isKasaliUnit && (
                    <p className="mt-1 text-sm text-amber-600 flex items-center">
                      <Icon name="Package" size={16} className="mr-1" />
                      Bu birim kasalı ürün kategorisinde kaydedilecek
                    </p>
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Ürün açıklaması (opsiyonel)"
                />
              </div>
            </div>

            {/* Fiyat ve Stok */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Icon name="DollarSign" size={20} className="text-blue-600 mr-2" />
                Fiyat ve Stok Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fiyat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₺</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon name="AlertCircle" size={16} className="mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Mevcut Stok */}
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon name="AlertCircle" size={16} className="mr-1" />
                      {errors.stock}
                    </p>
                  )}
                </div>

                {/* Minimum Stok */}
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.minStock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="0"
                  />
                  {errors.minStock && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon name="AlertCircle" size={16} className="mr-1" />
                      {errors.minStock}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Durum */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Icon name="Settings" size={20} className="text-purple-600 mr-2" />
                Ürün Durumu
              </h3>

              <div className="flex space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${formData.status === 'active'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                    }`}>
                    {formData.status === 'active' && (
                      <Icon name="Check" size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Icon name="Eye" size={18} className="text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                    <span className="text-xs text-gray-500 ml-2">(Müşteriler görebilir)</span>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${formData.status === 'inactive'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                    }`}>
                    {formData.status === 'inactive' && (
                      <Icon name="Check" size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Icon name="EyeOff" size={18} className="text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Pasif</span>
                    <span className="text-xs text-gray-500 ml-2">(Müşteriler göremez)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Ürün Resmi */}
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Icon name="Camera" size={20} className="text-amber-600 mr-2" />
                Ürün Resmi
              </h3>

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
                      className="w-full h-full object-cover object-center rounded-lg"
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
                    className={`flex flex-col items-center justify-center h-48 cursor-pointer transition-colors p-4 ${isDragOver ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                  >
                    <label className="flex flex-col items-center w-full h-full justify-center cursor-pointer">
                      {isDragOver ? (
                        <>
                          <Icon name="Upload" size={48} className="text-blue-500 mb-2" />
                          <span className="text-blue-600 text-sm font-medium">Resmi bırakın</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Camera" size={48} className="text-gray-400 mb-2" />
                          <span className="text-gray-600 text-sm font-medium">Ürün resmi yükleyin</span>
                          <span className="text-gray-400 text-xs mt-1">Tıklayın veya sürükleyip bırakın</span>
                          <span className="text-gray-400 text-xs">PNG, JPG, JPEG • Max 2MB</span>
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {isKasaliUnit && (
                <div className="flex items-center text-amber-600">
                  <Icon name="Package" size={16} className="mr-1" />
                  Bu ürün kasalı kategori altında kaydedilecek
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <Icon name={product ? "Save" : "Plus"} size={16} />
                <span>{product ? 'Güncelle' : 'Ekle'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernUrunModali;