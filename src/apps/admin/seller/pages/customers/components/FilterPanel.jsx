import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Arama */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ad, telefon, email ara..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Durum Filtresi */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="vip">VIP</option>
          </select>
        </div>

        {/* Şehir Filtresi */}
        <div>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tüm Şehirler</option>
            <option value="Ankara">Ankara</option>
            <option value="İstanbul">İstanbul</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </select>
        </div>

        {/* Sipariş Durumu */}
        <div>
          <select
            value={filters.orderStatus}
            onChange={(e) => onFilterChange({ ...filters, orderStatus: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Sipariş Durumu</option>
            <option value="hasOrders">Sipariş Vermiş</option>
            <option value="noOrders">Sipariş Vermemiş</option>
            <option value="recentOrders">Son 30 Günde Sipariş</option>
          </select>
        </div>

        {/* Sıralama */}
        <div>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="name">İsme Göre</option>
            <option value="totalSpent">Harcamaya Göre</option>
            <option value="orderCount">Sipariş Sayısına Göre</option>
            <option value="registeredAt">Kayıt Tarihine Göre</option>
            <option value="lastOrderDate">Son Siparişe Göre</option>
          </select>
        </div>

        {/* Sıralama Yönü */}
        <button
          onClick={() => onFilterChange({ 
            ...filters, 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          title={filters.sortOrder === 'asc' ? 'Azalan sıralama' : 'Artan sıralama'}
        >
          <Icon 
            name={filters.sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
            size={20} 
            className="text-gray-600" 
          />
        </button>

        {/* Sıfırla */}
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Icon name="RotateCcw" size={16} />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* Hızlı Filtreler */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500 mr-2">Hızlı Filtreler:</span>
        
        <button
          onClick={() => onFilterChange({ ...filters, status: 'vip' })}
          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
        >
          VIP Müşteriler
        </button>
        
        <button
          onClick={() => onFilterChange({ ...filters, orderStatus: 'recentOrders' })}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
        >
          Aktif Müşteriler
        </button>
        
        <button
          onClick={() => onFilterChange({ ...filters, orderStatus: 'noOrders' })}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
        >
          Sipariş Vermeyenler
        </button>

        <button
          onClick={() => onFilterChange({ ...filters, sortBy: 'totalSpent', sortOrder: 'desc' })}
          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
        >
          En Çok Harcayanlar
        </button>
      </div>
    </div>
  );
};

export default FilterPanel; 
