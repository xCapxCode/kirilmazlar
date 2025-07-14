import React from 'react';
import Icon from '../../../components/AppIcon';

const FiltreKenarCubugu = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      dateRange: 'all',
      sortBy: 'newest'
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
            Sipariş Ara
          </label>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Sipariş no veya müşteri..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Durum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sipariş Durumu
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Teslim Edildi">Teslim Edildi</option>
            <option value="İptal">İptal</option>
          </select>
        </div>

        {/* Tarih Aralığı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarih Aralığı
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tüm Zamanlar</option>
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
          </select>
        </div>

        {/* Sıralama */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıralama
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="amount_high">Tutar (Yüksek→Düşük)</option>
            <option value="amount_low">Tutar (Düşük→Yüksek)</option>
          </select>
        </div>

        {/* Filtreleri Temizle */}
        <button
          onClick={clearFilters}
          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Icon name="RotateCcw" size={16} />
          <span>Filtreleri Temizle</span>
        </button>
      </div>

      {/* İstatistikler */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-gray-600" />
          <span>Hızlı Durum Özeti</span>
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Beklemede</span>
            </div>
            <span className="font-medium">-</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Onaylandı</span>
            </div>
            <span className="font-medium">-</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Hazırlanıyor</span>
            </div>
            <span className="font-medium">-</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Teslim Edildi</span>
            </div>
            <span className="font-medium">-</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltreKenarCubugu; 