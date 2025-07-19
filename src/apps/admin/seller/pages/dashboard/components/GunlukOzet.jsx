import React, { useState } from 'react';
import Icon from '../../../../../../shared/components/AppIcon';

function GunlukOzet({ dailyStats = {}, weeklyStats = {} }) {
  const [activeTab, setActiveTab] = useState('daily');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const dailyData = {
    orders: dailyStats.orders || 0,
    revenue: dailyStats.revenue || 0,
    products: dailyStats.products || 0
  };

  const weeklyData = {
    orders: weeklyStats.orders || 0,
    revenue: weeklyStats.revenue || 0,
    customers: weeklyStats.customers || 0
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Özet İstatistikler</h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Haftalık
          </button>
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Icon name="ShoppingCart" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bugünkü Siparişler</p>
                <p className="text-xl font-semibold text-gray-900">{dailyData.orders}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <Icon name="DollarSign" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bugünkü Gelir</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(dailyData.revenue)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <Icon name="Package" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Ürün</p>
                <p className="text-xl font-semibold text-gray-900">{dailyData.products}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Icon name="ShoppingCart" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Haftalık Siparişler</p>
                <p className="text-xl font-semibold text-gray-900">{weeklyData.orders}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <Icon name="DollarSign" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Haftalık Gelir</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(weeklyData.revenue)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <Icon name="Users" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Haftalık Müşteri</p>
                <p className="text-xl font-semibold text-gray-900">{weeklyData.customers}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GunlukOzet;