import React from 'react';
import Icon from '@shared/components/AppIcon';

const StokUyarilari = ({ alerts }) => {
  const getAlertLevel = (currentStock, minStock) => {
    if (currentStock === 0) {
      return {
        level: 'critical',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: 'AlertCircle'
      };
    } else if (currentStock <= minStock) {
      return {
        level: 'warning',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: 'AlertTriangle'
      };
    }
    return {
      level: 'normal',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: 'CheckCircle'
    };
  };

  const getAlertMessage = (currentStock, minStock) => {
    if (currentStock === 0) {
      return 'Stok tükendi';
    } else if (currentStock <= minStock) {
      return 'Stok azalıyor';
    }
    return 'Stok yeterli';
  };

  const handleStokEkle = () => {
    // Ürün yönetimi sayfasına yönlendir
    window.location.href = '/seller/products';
  };

  const handleTumunuGor = () => {
    // Ürün yönetimi sayfasına stok filtresi ile yönlendir
    window.location.href = '/seller/products?filter=low-stock';
  };

  const handleDuzenle = () => {
    // Ürün yönetimi sayfasına yönlendir
    window.location.href = '/seller/products';
  };

  return (
    <div className="bg-slate-100 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-orange-600">Stok Uyarıları</h3>
        <button 
          onClick={handleTumunuGor}
          className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-all"
        >
          Tümünü Gör
        </button>
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={24} className="text-green-600" />
          </div>
          <p className="text-gray-600">Tüm ürünler yeterli stokta</p>
          <button
            onClick={handleStokEkle}
            className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium transition-all"
          >
            Yeni Ürün Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const alertInfo = getAlertLevel(alert.currentStock, alert.minStock);
            
            return (
              <div 
                key={alert.id}
                className={`${alertInfo.bgColor} ${alertInfo.borderColor} border rounded-lg p-4 hover:shadow-sm transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <Icon 
                        name={alertInfo.icon} 
                        size={18} 
                        className={alertInfo.color} 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.productName}
                      </p>
                      <p className={`text-sm ${alertInfo.color} font-medium`}>
                        {getAlertMessage(alert.currentStock, alert.minStock)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Mevcut Stok</p>
                    <p className={`font-bold ${alertInfo.color}`}>
                      {alert.currentStock} {alert.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {alert.minStock} {alert.unit}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        alert.currentStock === 0 
                          ? 'bg-red-500/70' 
                          : alert.currentStock <= alert.minStock 
                            ? 'bg-orange-500/70' 
                            : 'bg-green-500/70'
                      }`}
                      style={{ 
                        width: `${Math.min((alert.currentStock / (alert.minStock * 2)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>Min: {alert.minStock}</span>
                    <span>{alert.minStock * 2}+</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      {alerts && alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-orange-200/30">
          <div className="flex space-x-3">
            <button 
              onClick={handleStokEkle}
              className="flex-1 bg-green-500/10 text-green-600 border border-green-200/50 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Icon name="Plus" size={16} />
              <span>Stok Ekle</span>
            </button>
            <button 
              onClick={handleDuzenle}
              className="flex-1 bg-gray-500/10 border border-gray-200/50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Icon name="Edit" size={16} />
              <span>Düzenle</span>
            </button>
          </div>
          
          {/* Quick Info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {alerts.filter(a => a.currentStock === 0).length} ürün tükendi, {alerts.filter(a => a.currentStock > 0 && a.currentStock <= a.minStock).length} ürün azalıyor
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StokUyarilari; 