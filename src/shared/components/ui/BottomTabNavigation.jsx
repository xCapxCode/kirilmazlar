import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import Icon from '../AppIcon';

const BottomTabNavigation = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Satıcı için menü öğeleri
  const sellerTabs = [
    {
      id: 'dashboard',
      label: 'Panel',
      path: '/seller/dashboard',
      icon: 'BarChart3'
    },
    {
      id: 'products',
      label: 'Ürünler',
      path: '/seller/products',
      icon: 'Package'
    },
    {
      id: 'orders',
      label: 'Siparişler',
      path: '/seller/orders',
      icon: 'ShoppingCart'
    },
    {
      id: 'customers',
      label: 'Müşteriler',
      path: '/seller/customers',
      icon: 'Users'
    },
    {
      id: 'profile',
      label: 'Ayarlar',
      path: '/seller/settings',
      icon: 'Settings'
    }
  ];

  // Müşteri için menü öğeleri
  const customerTabs = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      path: '/customer/catalog',
      icon: 'Home'
    },
    {
      id: 'cart',
      label: 'Sepet',
      path: '/customer/cart',
      icon: 'ShoppingCart',
      badge: cartItemCount > 0 ? cartItemCount : null
    },
    {
      id: 'orders',
      label: 'Siparişlerim',
      path: '/customer/orders',
      icon: 'Package'
    },
    {
      id: 'profile',
      label: 'Profilim',
      path: '/customer/profile',
      icon: 'User'
    }
  ];

  // Kullanıcı rolüne göre tab'ları seç
  const tabs = (userProfile?.role === 'seller' || userProfile?.role === 'admin') ? sellerTabs : customerTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] relative transition-smooth ${
              isActive(tab.path)
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="relative">
              <Icon 
                name={tab.icon} 
                size={20} 
                strokeWidth={isActive(tab.path) ? 2.5 : 2}
              />
              {tab.badge && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-xs mt-1 font-medium ${
              isActive(tab.path) ? 'text-primary' : 'text-text-secondary'
            }`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabNavigation;