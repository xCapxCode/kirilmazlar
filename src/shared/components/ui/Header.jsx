import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../AppIcon';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [businessLogo, setBusinessLogo] = useState('/assets/images/logo/KirilmazlarLogo.png');
  const [businessName, setBusinessName] = useState('KIRILMAZLAR');

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

  // Müşteri için menü öğeleri
  const menuItems = [
    { id: 'catalog', label: 'Ürünler', path: '/customer/catalog', icon: 'Package' },
    { id: 'cart', label: 'Sepetim', path: '/customer/cart', icon: 'ShoppingCart' },
    { id: 'orders', label: 'Siparişlerim', path: '/customer/orders', icon: 'Clock' },
    { id: 'profile', label: 'Profilim', path: '/customer/profile', icon: 'User' }
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
    navigate('/customer/profile');
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
            <Link to="/customer/catalog" className="flex items-center space-x-3 hover:opacity-80 transition-smooth">
              <div className="flex items-center justify-center">
                <img
                  src={businessLogo}
                  alt={businessName}
                  className="w-auto object-contain"
                  style={{ height: '60px' }}
                />
              </div>
            </Link>

            {/* Sağ Taraf - Bildirimler + Kullanıcı */}
            <div className="flex items-center space-x-3">

              {/* Bildirimler */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-smooth">
                <Icon name="Bell" size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
              </button>

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
                  <div className="h-9 w-9 rounded-full flex items-center justify-center">
                    <Icon name="User" size={18} className="text-green-600" />
                  </div>
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
                        {userProfile?.email || 'demo@mail.com'}
                      </p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 transition-smooth"
                    >
                      <Icon name="User" size={16} />
                      <span>Profil Ayarları</span>
                    </button>

                    <Link
                      to="/customer/catalog"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 transition-smooth"
                    >
                      <Icon name="Package" size={16} />
                      <span>Ürün Kataloğu</span>
                    </Link>

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
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                    }`}
                >
                  <Icon name={item.icon} size={16} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {/* Aktif sayfa için alt çizgi */}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" style={{ bottom: '-12px' }}></div>
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

export default Header;
