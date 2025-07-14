import React, { useState } from 'react';
import Icon from '@shared/components/AppIcon';

const GunlukOzet = ({ dailyStats, weeklyStats }) => {
  const [activeTab, setActiveTab] = useState('daily');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getCurrentStats = () => {
    return activeTab === 'daily' ? dailyStats : weeklyStats;
  };

  const currentStats = getCurrentStats();

  return (
    <div className="bg-slate-100 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Satış Özeti</h3>
        
        {/* Tab Buttons */}
        <div className="flex space-x-1 bg-gray-100/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors bg-transparent ${
              activeTab === 'daily'
                ? 'bg-white/70 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors bg-transparent ${
              activeTab === 'weekly'
                ? 'bg-white/70 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
            }`}
          >
            Haftalık
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Siparişler */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Icon name="ShoppingCart" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Siparişler</p>
              <p className="text-sm text-gray-600">
                {activeTab === 'daily' ? 'Bugün' : 'Bu hafta'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {currentStats?.orders || 0}
            </p>
            <p className="text-sm text-gray-600">adet</p>
          </div>
        </div>

        {/* Gelir */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Gelir</p>
              <p className="text-sm text-gray-600">
                {activeTab === 'daily' ? 'Bugün' : 'Bu hafta'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(currentStats?.revenue || 0)}
            </p>
          </div>
        </div>

        {/* Ürün Satışı veya Müşteriler */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Icon name="Users" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {activeTab === 'daily' ? 'Ürün Satışı' : 'Müşteriler'}
              </p>
              <p className="text-sm text-gray-600">
                {activeTab === 'daily' ? 'Bugün' : 'Bu hafta'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">
              {activeTab === 'daily' 
                ? (currentStats?.products || 0)
                : (currentStats?.customers || 0)
              }
            </p>
            <p className="text-sm text-gray-600">
              {activeTab === 'daily' ? 'adet' : 'kişi'}
            </p>
          </div>
        </div>
      </div>

      {/* Büyüme Göstergesi */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="TrendingUp" size={16} className="text-green-500" />
          <span className="text-green-600 font-medium">+12%</span>
          <span className="text-gray-600">
            {activeTab === 'daily' ? 'önceki güne göre' : 'önceki haftaya göre'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GunlukOzet; 