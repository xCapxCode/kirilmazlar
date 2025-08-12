import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';

const SellerMobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sadece seller rotalarında göster
  if (!location.pathname.startsWith('/seller/')) {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'BarChart3',
      path: '/seller/dashboard',
      isActive: location.pathname === '/seller/dashboard' || location.pathname === '/seller'
    },
    {
      id: 'products',
      label: 'Ürünler',
      icon: 'Package',
      path: '/seller/products',
      isActive: location.pathname.startsWith('/seller/products')
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: 'ShoppingBag',
      path: '/seller/orders',
      isActive: location.pathname.startsWith('/seller/orders')
    },
    {
      id: 'customers',
      label: 'Müşteriler',
      icon: 'Users',
      path: '/seller/customers',
      isActive: location.pathname.startsWith('/seller/customers')
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: 'Settings',
      path: '/seller/settings',
      isActive: location.pathname.startsWith('/seller/settings')
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav
      className="md:hidden bg-white backdrop-blur-xl border-t border-gray-200 shadow-2xl"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '80px',
        zIndex: 99999,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none"></div>

      <div className="relative flex items-center justify-around px-1 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`group flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 min-h-[64px] touch-manipulation relative transition-all duration-300 ease-out rounded-2xl ${item.isActive
              ? 'scale-105'
              : 'hover:scale-105 active:scale-95'
              }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Background glow for active item */}
            {item.isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-blue-100/80 to-transparent rounded-2xl"></div>
            )}

            {/* Icon with enhanced styling */}
            <div className={`relative mb-1 w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-300 ${item.isActive
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200'
              : 'bg-gray-100/80 group-hover:bg-blue-100 group-hover:shadow-md'
              }`}>
              <Icon
                name={item.icon}
                size={16}
                className={`transition-all duration-300 ${item.isActive
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-blue-600'
                  }`}
              />
            </div>

            {/* Enhanced Label */}
            <span className={`text-xs font-semibold leading-none truncate transition-all duration-300 ${item.isActive
              ? 'text-blue-600 scale-105'
              : 'text-gray-500 group-hover:text-blue-600'
              }`}>
              {item.label}
            </span>

            {/* Active indicator dot */}
            {item.isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SellerMobileNavigation;