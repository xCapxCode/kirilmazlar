import React from 'react';
import Icon from '../../../components/AppIcon';

const UrunListesi = ({ products, selectedProducts, onSelectionChange, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return { text: 'Tükendi', color: 'text-red-600' };
    } else if (stock <= minStock) {
      return { text: 'Düşük', color: 'text-orange-600' };
    }
    return { text: 'Yeterli', color: 'text-green-600' };
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1"></div>
        Pasif
      </span>
    );
  };

  if (products.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-gray-600">Filtrelerinizi değiştirin veya yeni ürün ekleyin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Ürün</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Kategori</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Fiyat</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Stok</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Durum</th>
                <th className="text-right px-6 py-4 font-medium text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-10 aspect-[5/4] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-50">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="Package" size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.category}</p>
                        <p className="text-sm text-gray-500">{product.subcategory}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-gray-500">/{product.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${stockStatus.color}`}>
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                          title="Düzenle"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
                          title="Sil"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.minStock);
          
          return (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="w-16 h-12 aspect-[5/4] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-50">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="Package" size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category} • {product.subcategory}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(product.price)}/{product.unit}
                        </span>
                        <span className={`text-sm ${stockStatus.color}`}>
                          {product.stock} {product.unit}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-xs font-medium ${stockStatus.color}`}>
                      Stok: {stockStatus.text}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UrunListesi; 