import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import Icon from '../AppIcon';

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();

  const totalCartItems = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: 'Home',
      path: '/customer',
      isActive: location.pathname === '/customer' || location.pathname === '/customer/'
    },
    {
      id: 'catalog',
      label: 'Kategoriler',
      icon: 'Package',
      path: '/customer/catalog',
      isActive: location.pathname === '/customer/catalog'
    },
    {
      id: 'cart',
      label: 'Sepetim',
      icon: 'ShoppingCart',
      path: '/customer/cart',
      isActive: location.pathname === '/customer/cart',
      badge: totalCartItems > 0 ? totalCartItems : null
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: 'ShoppingBag',
      path: '/customer/orders',
      isActive: location.pathname === '/customer/orders'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: 'User',
      path: '/customer/profile',
      isActive: location.pathname === '/customer/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-red-500 backdrop-blur-xl border-t border-white/50 safe-area-inset-bottom shadow-2xl"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        height: '80px'
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>

      <div className="relative flex items-center justify-around px-2 py-2 safe-area-padding-x">
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
              <div className="absolute inset-0 bg-gradient-to-t from-green-100/80 to-transparent rounded-2xl"></div>
            )}

            {/* Icon with enhanced styling */}
            <div className={`relative mb-1.5 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${item.isActive
              ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-200'
              : 'bg-gray-100/80 group-hover:bg-green-100 group-hover:shadow-md'
              }`}>
              <Icon
                name={item.icon}
                size={18}
                className={`transition-all duration-300 ${item.isActive
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-green-600'
                  }`}
              />

              {/* Enhanced Badge for cart */}
              {item.badge && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[22px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-lg animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>

            {/* Enhanced Label */}
            <span className={`text-xs font-semibold leading-none truncate transition-all duration-300 ${item.isActive
              ? 'text-green-600 scale-105'
              : 'text-gray-500 group-hover:text-green-600'
              }`}>
              {item.label}
            </span>

            {/* Active indicator dot */}
            {item.isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-green-600 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
