import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import BusinessLogo from '../BusinessLogo';
import Icon from '../AppIcon';

const SaticiKenarCubugu = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Satıcı Paneli',
      icon: 'BarChart3',
      href: '/satici-paneli',
    },
    {
      name: 'Ürün Yönetimi',
      icon: 'Package',
      href: '/urun-yonetimi',
    },
    {
      name: 'Sipariş Yönetimi',
      icon: 'ShoppingCart',
      href: '/siparis-yonetimi',
    },
    {
      name: 'Müşteri Yönetimi',
      icon: 'Users',
      href: '/musteri-yonetimi',
    },
    {
      name: 'Genel Ayarlar',
      icon: 'Settings',
      href: '/genel-ayarlar',
    },
  ];

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'} 
    `}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <BusinessLogo size="sm" showName={true} />
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name={isCollapsed ? 'Menu' : 'X'} size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon name={item.icon} size={20} />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-green-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Satıcı Paneli
              </p>
              <p className="text-xs text-gray-500 truncate">
                Aktif
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaticiKenarCubugu;
