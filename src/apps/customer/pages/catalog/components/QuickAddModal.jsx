import React, { useState } from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const QuickAddModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(product.unit);

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const unitOptions = [
    { value: 'kg', label: 'kg' },
    { value: 'piece', label: 'piece' },
    { value: 'bunch', label: 'bunch' },
    { value: 'crate', label: 'crate' },
    { value: 'sack', label: 'sack' }
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
        <div className="bg-surface rounded-2xl max-w-md w-full overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Add to Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-smooth"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">{product.name}</h3>
                <div className="flex items-center space-x-2">
                  {product.discount > 0 ? (
                    <>
                      <span className="text-lg font-semibold text-primary">
                        ₺{discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-text-secondary line-through">
                        ₺{product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      ₺{product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-sm text-text-secondary">per {product.unit}</span>
                </div>
              </div>
            </div>

            {/* Unit Selection */}
            {availableUnits.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Unit
                </label>
                <div className="flex space-x-2">
                  {availableUnits.map((unit) => (
                    <button
                      key={unit.value}
                      onClick={() => setSelectedUnit(unit.value)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-smooth ${
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
              <label className="block text-sm font-medium text-text-primary mb-2">
                Quantity
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                  >
                    <Icon name="Minus" size={16} />
                  </button>
                  <span className="px-6 py-3 font-medium text-text-primary min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                <span className="text-text-secondary">
                  {selectedUnit}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {product.stock} {product.unit} available
              </p>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ₺{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-border rounded-lg text-text-secondary hover:bg-background transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth font-medium"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="ShoppingCart" size={18} />
                  <span>Add to Cart</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickAddModal;