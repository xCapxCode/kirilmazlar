import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../AppIcon';
import NotificationDropdown from './NotificationDropdown';

const SaticiHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [businessInfo, setBusinessInfo] = useState({
    name: 'KIRILMAZLAR',
    logo: '/assets/images/logo/KirilmazlarLogo.png',
    slogan: 'Taze ve Kaliteli Ürünler'
  });

  // User dropdown dışına tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Ana Panel', path: '/seller/dashboard', icon: 'BarChart3' },
    { id: 'products', label: 'Ürün Yönetimi', path: '/seller/products', icon: 'Package' },
    { id: 'orders', label: 'Sipariş Yönetimi', path: '/seller/orders', icon: 'ShoppingCart' },
    { id: 'customers', label: 'Müşteri Yönetimi', path: '/seller/customers', icon: 'Users' },
    { id: 'settings', label: 'Genel Ayarlar', path: '/seller/settings', icon: 'Settings' }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      // Çıkış yaptıktan sonra ana sayfaya yönlendir
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/seller/settings');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* HEADER - ÜST KISIM: Logo + Kullanıcı */}
      <header className="bg-slate-200 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between py-4" style={{ minHeight: '80px' }}>

            {/* Logo ve İşletme Adı - SOL */}
            <Link to="/seller/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-smooth">
              <div className="flex-shrink-0">
                <img
                  src={businessInfo.logo}
                  alt={businessInfo.name}
                  className="w-auto object-contain"
                  style={{ height: '60px' }}
                />
              </div>
            </Link>

            {/* Sağ Taraf - Bildirimler + Kullanıcı */}
            <div className="flex items-center space-x-3">

              {/* Bildirimler */}
              <NotificationDropdown />

              {/* Kullanıcı Profil Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg transition-smooth"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || userProfile?.name || userProfile?.email || 'Kullanıcı'}
                    </p>
                  </div>
                  <Icon name="User" size={18} className="text-green-600" />
                  <Icon name="ChevronDown" size={14} className="text-gray-600 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border border-gray-200 py-2 z-dropdown"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.full_name || userProfile?.name || userProfile?.email || 'Kullanıcı'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userProfile?.email || 'demo@kirilmazlar.com'}
                      </p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 transition-smooth"
                    >
                      <Icon name="User" size={16} />
                      <span>Profil Ayarları</span>
                    </button>



                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 transition-smooth"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ALT KISIM: Navigation Menü (Sadece Desktop) */}
        <div className="hidden lg:block bg-slate-200 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-8 py-3">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-smooth ${isActive(item.path)
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-green-600'
                    }`}
                >
                  <Icon name={item.icon} size={16} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {/* Aktif sayfa için alt çizgi */}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" style={{ bottom: '-12px' }}></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default SaticiHeader;
