import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/AppIcon';

const MobileSellerBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: 'Home',
      path: '/ms/dashboard',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'products',
      label: 'Ürünler',
      icon: 'Package',
      path: '/ms/products',
      activeColor: 'text-green-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: 'ShoppingBag',
      path: '/ms/orders',
      activeColor: 'text-orange-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'customers',
      label: 'Müşteriler',
      icon: 'Users',
      path: '/ms/customers',
      activeColor: 'text-purple-600',
      inactiveColor: 'text-gray-400'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: 'Settings',
      path: '/ms/settings',
      activeColor: 'text-gray-600',
      inactiveColor: 'text-gray-400'
    }
  ];

  const isActive = (path) => {
    if (path === '/ms/dashboard') {
      return location.pathname === '/ms' || location.pathname === '/ms/' || location.pathname === '/ms/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-100"
      style={{
        zIndex: 999999,
        height: '80px'
      }}
    >
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 touch-manipulation transition-all duration-300 ease-out rounded-2xl ${active
                ? 'scale-110'
                : 'hover:bg-white/10 active:scale-95'
                }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Icon - Arkaplan yok */}
              <div className="relative mb-1.5">
                <Icon
                  name={item.icon}
                  size={24}
                  className={`transition-all duration-300 ${active ? 'text-green-500 scale-110' : 'text-gray-400'
                    }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium leading-none truncate transition-all duration-300 ${active ? 'text-green-500' : 'text-gray-400'
                  }`}
              >
                {item.label}
              </span>


            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSellerBottomNavigation;