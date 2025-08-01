import React, { useState } from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(product.unit);

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'piece', label: 'Adet' },
    { value: 'bunch', label: 'Demet' },
    { value: 'crate', label: 'Kasa' },
    { value: 'sack', label: 'Çuval' }
  ];

  const availableUnits = unitOptions.filter(unit => 
    unit.value === product.unit || 
    (product.unit === 'kg' && ['piece', 'bunch'].includes(unit.value)) ||
    (product.unit === 'piece' && ['kg', 'bunch'].includes(unit.value))
  );

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedUnit);
  };

  const totalPrice = discountedPrice * quantity;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-999"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Ürün Detayları</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-smooth"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6">
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.gallery[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.gallery.length > 1 && (
                <div className="flex space-x-2">
                  {product.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-smooth ${
                        selectedImageIndex === index
                          ? 'border-primary' :'border-border hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-6 lg:border-l border-border">
              {/* Title and Rating */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-text-primary mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={16}
                        className={i < Math.floor(product.rating) 
                          ? 'text-accent fill-current' :'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">
                    ({product.rating} puan)
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex space-x-2 mb-4">
                {product.isOrganic && (
                  <span className="bg-success text-white text-sm font-medium px-3 py-1 rounded-full">
                    Organik
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="bg-error text-white text-sm font-medium px-3 py-1 rounded-full">
                    %{product.discount} İndirim
                  </span>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <span className="bg-warning text-white text-sm font-medium px-3 py-1 rounded-full">
                    Az Stok
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  {product.discount > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-primary">
                        ₺{discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xl text-text-secondary line-through">
                        ₺{product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      ₺{product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-text-secondary">{product.unit} başına</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Stok: {product.stock} {product.unit} mevcut
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Açıklama</h3>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Unit Selection */}
              {availableUnits.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Birim</h3>
                  <div className="flex space-x-2">
                    {availableUnits.map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => setSelectedUnit(unit.value)}
                        className={`px-3 py-2 rounded-lg border transition-smooth ${
                          selectedUnit === unit.value
                            ? 'border-primary bg-primary/5 text-primary' :'border-border text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Miktar</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                    >
                      <Icon name="Minus" size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-text-primary min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                  </div>
                  <span className="text-text-secondary">
                    {selectedUnit}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-background rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-text-primary">Toplam:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₺{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-smooth ${
                  product.isAvailable
                    ? 'bg-primary text-white hover:bg-primary-600' :'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.isAvailable ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="ShoppingCart" size={20} />
                    <span>Sepete Ekle</span>
                  </div>
                ) : (
                  'Stokta Yok'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
