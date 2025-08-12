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
      path: '/m/catalog',
      isActive: location.pathname === '/m/catalog' || location.pathname === '/m'
    },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: 'Heart',
      path: '/m/favorites',
      isActive: location.pathname === '/m/favorites'
    },
    {
      id: 'cart',
      label: 'Sepet',
      icon: 'ShoppingCart',
      path: '/m/cart',
      isActive: location.pathname === '/m/cart',
      badge: totalCartItems > 0 ? totalCartItems : null,
      isCenter: true // Ortadaki özel buton
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: 'ShoppingBag',
      path: '/m/orders',
      isActive: location.pathname === '/m/orders'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: 'User',
      path: '/m/profile',
      isActive: location.pathname === '/m/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      className="fixed left-0 right-0 shadow-2xl"
      style={{
        bottom: '0px',
        zIndex: 999999,
        height: '80px',
        background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 80px, #22c55e 80px)',
        borderTop: '1px solid #f3f4f6',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(80px + env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 relative">
        {navItems.map((item) => {
          // Ortadaki sepet butonu için özel tasarım
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="relative flex flex-col items-center justify-center touch-manipulation transition-all duration-200 -mt-6"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Center Cart Button - Green Color */}
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative">
                  <Icon
                    name={item.icon}
                    size={24}
                    className="text-white"
                  />

                  {/* Cart Badge */}
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 border-2 border-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </div>
              </button>
            );
          }

          // Diğer navigation öğeleri
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 touch-manipulation transition-all duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Icon */}
              <div className="relative mb-1">
                <Icon
                  name={item.icon}
                  size={20}
                  className={`transition-all duration-200 ${item.isActive ? 'text-green-500' : 'text-gray-400'
                    }`}
                />
              </div>

              {/* Label */}
              <span className={`text-xs font-medium leading-none truncate transition-all duration-200 ${item.isActive ? 'text-green-500' : 'text-gray-400'
                }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
