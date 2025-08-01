import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import Icon from '../../../shared/components/AppIcon';

const MobileBottomNavigation = () => {
  const location = useLocation();
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Debug log
  console.log('🔍 MobileBottomNavigation rendered at location:', location.pathname);

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: 'Home',
      path: '/mobile',
      activePattern: /^\/mobile(\/catalog)?$/
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      icon: 'Grid3X3',
      path: '/mobile/categories',
      activePattern: /^\/mobile\/categories/
    },
    {
      id: 'cart',
      label: 'Sepet',
      icon: 'ShoppingCart',
      path: '/mobile/cart',
      activePattern: /^\/mobile\/cart/,
      badge: totalItems
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: 'Package',
      path: '/mobile/orders',
      activePattern: /^\/mobile\/orders/
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: 'User',
      path: '/mobile/profile',
      activePattern: /^\/mobile\/profile/
    }
  ];

  const isActive = (item) => {
    return item.activePattern.test(location.pathname);
  };

  return (
    <div
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const active = isActive(item);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-0 flex-1 ${active
                  ? 'bg-gradient-to-t from-green-100 to-emerald-50 text-green-600 shadow-lg scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
                }`}
            >
              <div className="relative mb-1">
                <Icon
                  name={item.icon}
                  size={22}
                  className={`transition-all duration-300 ${active ? 'text-green-600 drop-shadow-sm' : 'text-gray-500'
                    }`}
                />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold shadow-lg ring-2 ring-white animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-300 truncate max-w-full ${active ? 'text-green-600 font-semibold' : 'text-gray-500'
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
