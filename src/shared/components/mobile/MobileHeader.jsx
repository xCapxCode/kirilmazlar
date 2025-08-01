import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import Icon from '../AppIcon';
import NotificationDropdown from '../ui/NotificationDropdown';

const MobileHeader = ({
  title = 'Kırılmazlar Gıda',
  showBack = false,
  showCart = true,
  showNotifications = true,
  showSearch = true,
  onSearchClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { userProfile } = useAuth();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/m/catalog');
    }
  };

  const handleCartClick = () => {
    navigate('/m/cart');
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      // Default search behavior
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-green-600 to-green-700 text-white sticky top-0 z-40 ${className}`}
      style={{ WebkitBackfaceVisibility: 'hidden' }}
    >
      <div className="safe-area-inset-top"></div>

      <div className="px-4 py-3 safe-area-padding-x">
        <div className="flex items-center justify-between min-h-[48px]">
          {/* Sol Taraf - Back Button veya Logo */}
          <div className="flex items-center flex-1 min-w-0">
            {showBack ? (
              <button
                onClick={handleBack}
                className="mr-3 w-10 h-10 flex items-center justify-center touch-manipulation hover:bg-white/10 rounded-full transition-colors active:scale-95"
                aria-label="Geri"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon name="ArrowLeft" size={20} className="text-white" />
              </button>
            ) : (
              <div className="flex items-center mr-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Icon name="Leaf" size={20} className="text-white" />
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate leading-tight">
                {title}
              </h1>
              {userProfile?.name && (
                <p className="text-xs text-green-100 truncate leading-tight mt-0.5">
                  Hoş geldiniz, {userProfile.name}
                </p>
              )}
            </div>
          </div>

          {/* Sağ Taraf - Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Search Button */}
            {showSearch && (
              <button
                onClick={handleSearchClick}
                className="w-10 h-10 flex items-center justify-center touch-manipulation hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95"
                aria-label="Ara"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon name="Search" size={20} className="text-white" />
              </button>
            )}

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="w-10 h-10 flex items-center justify-center touch-manipulation hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95 relative"
                  aria-label="Bildirimler"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon name="Bell" size={20} className="text-white" />
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                </button>

                {showNotificationDropdown && (
                  <div className="absolute top-full right-0 mt-2 z-50">
                    <NotificationDropdown
                      isOpen={showNotificationDropdown}
                      onClose={() => setShowNotificationDropdown(false)}
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            {showCart && (
              <button
                onClick={handleCartClick}
                className="w-10 h-10 flex items-center justify-center touch-manipulation hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95 relative"
                aria-label={`Sepet - ${totalCartItems} ürün`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon name="ShoppingCart" size={20} className="text-white" />

                {/* Cart Badge */}
                {totalCartItems > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border border-white shadow-sm">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
