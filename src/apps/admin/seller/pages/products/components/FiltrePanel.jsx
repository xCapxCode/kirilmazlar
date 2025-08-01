import React from 'react';
import Icon from '../../../components/AppIcon';

const FiltrePanel = ({ categories, filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-slate-100 rounded-lg border border-gray-200 p-6 space-y-6 h-fit">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-gray-600" />
          <span>Filtreler</span>
        </h3>
        
        {/* Arama */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Ara
          </label>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Ürün adı..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Kategori */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Durum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>

        {/* Stok Durumu */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stok Durumu
          </label>
          <select
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tümü</option>
            <option value="normal">Yeterli</option>
            <option value="low">Düşük</option>
            <option value="out">Tükendi</option>
          </select>
        </div>

        {/* Filtreleri Temizle */}
        <button
          onClick={() => onFiltersChange({
            search: '',
            category: '',
            status: '',
            stockStatus: ''
          })}
          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Icon name="RotateCcw" size={16} />
          <span>Filtreleri Temizle</span>
        </button>
      </div>

      {/* Kategori İstatistikleri */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-gray-600" />
          <span>Kategori Dağılımı</span>
        </h4>
        <div className="space-y-2 text-sm">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{category.name}</span>
              </div>
              <span className="font-medium">{category.productCount || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltrePanel; 
