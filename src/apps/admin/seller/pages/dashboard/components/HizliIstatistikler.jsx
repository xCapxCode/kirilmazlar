import React from 'react';
import Icon from '@shared/components/AppIcon';

const HizliIstatistikler = ({ stats }) => {
  const statItems = [
    {
      title: 'Toplam Ürün',
      value: stats?.totalProducts || 0,
      icon: 'Package',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200/50',
      hoverColor: 'hover:bg-blue-500/20'
    },
    {
      title: 'Aktif Siparişler',
      value: stats?.activeOrders || 0,
      icon: 'ShoppingCart',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-200/50',
      hoverColor: 'hover:bg-green-500/20'
    },
    {
      title: 'Toplam Müşteri',
      value: stats?.totalCustomers || 0,
      icon: 'Users',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-200/50',
      hoverColor: 'hover:bg-purple-500/20'
    },
    {
      title: 'Düşük Stok',
      value: stats?.lowStockItems || 0,
      icon: 'AlertTriangle',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-200/50',
      hoverColor: 'hover:bg-orange-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`${item.bgColor} ${item.borderColor} rounded-lg border p-6 ${item.hoverColor} transition-all`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg">
              <Icon name={item.icon} size={24} className={item.iconColor} />
            </div>
            
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className={`text-2xl font-bold ${item.iconColor}`}>
                {item.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HizliIstatistikler; 
