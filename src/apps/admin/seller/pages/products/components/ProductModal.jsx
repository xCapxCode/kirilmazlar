import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const ProductModal = ({ product, categories, units, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    price: '',
    unit: 'kg',
    stock: '',
    lowStockThreshold: '',
    minimumOrder: '1',
    status: 'active',
    image: '',
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'Info' },
    { id: 'pricing', label: 'Pricing', icon: 'DollarSign' },
    { id: 'images', label: 'Images', icon: 'Image' },
    { id: 'stock', label: 'Stock', icon: 'Package' }
  ];

  const subCategories = {
    Vegetables: ['Leafy Greens', 'Root Vegetables', 'Nightshades', 'Peppers', 'Cruciferous'],
    Fruits: ['Tree Fruits', 'Berries', 'Citrus', 'Tropical Fruits', 'Stone Fruits']
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        price: product.price?.toString() || '',
        unit: product.unit || 'kg',
        stock: product.stock?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '',
        minimumOrder: product.minimumOrder?.toString() || '1',
        status: product.status || 'active',
        image: product.image || '',
        tags: product.tags || []
      });
      setImagePreview(product.image || '');
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImagePreview(imageUrl);
        handleInputChange('image', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subCategory) newErrors.subCategory = 'Sub-category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = 'Valid low stock threshold is required';
    }
    if (!formData.minimumOrder || parseInt(formData.minimumOrder) <= 0) {
      newErrors.minimumOrder = 'Valid minimum order is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        minimumOrder: parseInt(formData.minimumOrder)
      };
      
      onSave(productData);
    } catch (error) {
      logger.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Product Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
            errors.name ? 'border-error' : 'border-border'
          }`}
          placeholder="Enter product name"
        />
        {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth resize-none ${
            errors.description ? 'border-error' : 'border-border'
          }`}
          placeholder="Enter product description"
        />
        {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              handleInputChange('category', e.target.value);
              handleInputChange('subCategory', '');
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
              errors.category ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="text-error text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Sub-Category *
          </label>
          <select
            value={formData.subCategory}
            onChange={(e) => handleInputChange('subCategory', e.target.value)}
            disabled={!formData.category}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth disabled:bg-gray-50 disabled:cursor-not-allowed ${
              errors.subCategory ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Select sub-category</option>
            {formData.category && subCategories[formData.category]?.map(subCat => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
          {errors.subCategory && <p className="text-error text-sm mt-1">{errors.subCategory}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-primary-600"
              >
                <Icon name="X" size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
            placeholder="Add tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">₺</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                errors.price ? 'border-error' : 'border-border'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && <p className="text-error text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
          >
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Minimum Order Quantity *
        </label>
        <input
          type="number"
          min="1"
          value={formData.minimumOrder}
          onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
            errors.minimumOrder ? 'border-error' : 'border-border'
          }`}
          placeholder="1"
        />
        {errors.minimumOrder && <p className="text-error text-sm mt-1">{errors.minimumOrder}</p>}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-text-primary mb-2">Price Preview</h4>
        <div className="text-sm text-text-secondary">
          {formData.price && formData.unit ? (
            <p>₺{parseFloat(formData.price || 0).toFixed(2)} per {formData.unit}</p>
          ) : (
            <p>Enter price and unit to see preview</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Product Image
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Image uploaded successfully</p>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    handleInputChange('image', '');
                  }}
                  className="text-error hover:text-error/80 text-sm transition-smooth"
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
                <Icon name="Package" size={32} className="text-gray-400" />
              </div>
              <div>
                <p className="text-text-primary font-medium mb-1">Upload product image</p>
                <p className="text-sm text-text-secondary">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth cursor-pointer"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            {imagePreview ? 'Change Image' : 'Upload Image'}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Image URL (Alternative)
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => {
            handleInputChange('image', e.target.value);
            setImagePreview(e.target.value);
          }}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-text-secondary mt-1">
          You can also paste an image URL instead of uploading
        </p>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Current Stock *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
              errors.stock ? 'border-error' : 'border-border'
            }`}
            placeholder="0"
          />
          {errors.stock && <p className="text-error text-sm mt-1">{errors.stock}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Low Stock Threshold *
          </label>
          <input
            type="number"
            min="0"
            value={formData.lowStockThreshold}
            onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
              errors.lowStockThreshold ? 'border-error' : 'border-border'
            }`}
            placeholder="0"
          />
          {errors.lowStockThreshold && <p className="text-error text-sm mt-1">{errors.lowStockThreshold}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Status
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-text-primary">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-text-primary">Inactive</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-text-primary mb-2">Stock Status</h4>
        <div className="text-sm">
          {formData.stock && formData.lowStockThreshold ? (
            <div className="space-y-1">
              <p className="text-text-secondary">
                Current: {formData.stock} {formData.unit}
              </p>
              <p className="text-text-secondary">
                Alert threshold: {formData.lowStockThreshold} {formData.unit}
              </p>
              {parseInt(formData.stock) <= parseInt(formData.lowStockThreshold) && (
                <p className="text-error font-medium">⚠️ Low stock alert will be triggered</p>
              )}
            </div>
          ) : (
            <p className="text-text-secondary">Enter stock values to see status</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'pricing': return renderPricing();
      case 'images': return renderImages();
      case 'stock': return renderStock();
      default: return renderBasicInfo();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-surface rounded-lg shadow-elevated w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-smooth"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-smooth whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5' :'border-transparent text-text-secondary hover:text-text-primary hover:bg-background'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-background transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center space-x-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{product ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
