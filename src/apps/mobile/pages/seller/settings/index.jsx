import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useCart } from '../../../../../contexts/CartContext';
import Icon from '../../../../../shared/components/AppIcon';

const MobileSellerSettings = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { clearCart } = useCart();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = () => {
    clearCart();
    signOut();
    navigate('/login');
  };

  const settingsGroups = [
    {
      title: 'İşletme',
      items: [
        {
          id: 'business-info',
          label: 'İşletme Bilgileri',
          icon: 'Store',
          color: 'bg-blue-100 text-blue-600',
          action: () => { }
        },
        {
          id: 'business-hours',
          label: 'Çalışma Saatleri',
          icon: 'Clock',
          color: 'bg-green-100 text-green-600',
          action: () => { }
        },
        {
          id: 'delivery-settings',
          label: 'Teslimat Ayarları',
          icon: 'Truck',
          color: 'bg-orange-100 text-orange-600',
          action: () => { }
        }
      ]
    },
    {
      title: 'Satış',
      items: [
        {
          id: 'payment-methods',
          label: 'Ödeme Yöntemleri',
          icon: 'CreditCard',
          color: 'bg-purple-100 text-purple-600',
          action: () => { }
        },
        {
          id: 'tax-settings',
          label: 'Vergi Ayarları',
          icon: 'Calculator',
          color: 'bg-yellow-100 text-yellow-600',
          action: () => { }
        },
        {
          id: 'discounts',
          label: 'İndirimler',
          icon: 'Percent',
          color: 'bg-red-100 text-red-600',
          action: () => { }
        }
      ]
    },
    {
      title: 'Hesap',
      items: [
        {
          id: 'profile',
          label: 'Profil Bilgileri',
          icon: 'User',
          color: 'bg-gray-100 text-gray-600',
          action: () => { }
        },
        {
          id: 'notifications',
          label: 'Bildirimler',
          icon: 'Bell',
          color: 'bg-indigo-100 text-indigo-600',
          action: () => { }
        },
        {
          id: 'security',
          label: 'Güvenlik',
          icon: 'Shield',
          color: 'bg-emerald-100 text-emerald-600',
          action: () => { }
        }
      ]
    },
    {
      title: 'Destek',
      items: [
        {
          id: 'help',
          label: 'Yardım Merkezi',
          icon: 'HelpCircle',
          color: 'bg-teal-100 text-teal-600',
          action: () => { }
        },
        {
          id: 'contact',
          label: 'İletişim',
          icon: 'MessageCircle',
          color: 'bg-pink-100 text-pink-600',
          action: () => { }
        },
        {
          id: 'about',
          label: 'Hakkında',
          icon: 'Info',
          color: 'bg-cyan-100 text-cyan-600',
          action: () => { }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative px-6 py-8 text-white">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
              <Icon name="Settings" size={24} className="text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-white mb-2">Ayarlarım</h1>
            <p className="text-white/80 text-sm">
              Hesap ve işletme ayarları
            </p>

            {/* User Info */}
            <div className="mt-6">
              <div className="text-xl font-medium text-white">
                {userProfile?.name || 'Satıcı'}
              </div>
              <div className="text-white/70 text-xs">
                {userProfile?.email || 'Email'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-24 relative z-20 space-y-6">
        {/* Profil Kartı */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {userProfile?.name || 'Satıcı'}
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                {userProfile?.email || 'satici@demo.com'}
              </p>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {userProfile?.role === 'admin' ? 'Admin' :
                    userProfile?.role === 'owner' ? 'Sahip' : 'Satıcı'}
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Aktif</span>
              </div>
            </div>

            {/* Düzenle Butonu */}
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Icon name="Edit" size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon name="ShoppingBag" size={20} className="text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">156</p>
            <p className="text-xs text-gray-500">Sipariş</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon name="Package" size={20} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">89</p>
            <p className="text-xs text-gray-500">Ürün</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon name="Users" size={20} className="text-purple-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">42</p>
            <p className="text-xs text-gray-500">Müşteri</p>
          </div>
        </div>

        {/* Ayar Grupları */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
            </div>
            <div>
              {group.items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors ${index !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-900">{item.label}</span>
                  <Icon name="ChevronRight" size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Çıkış Yap Butonu */}
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2"
        >
          <Icon name="LogOut" size={20} />
          <span>Çıkış Yap</span>
        </button>

        {/* Uygulama Bilgisi */}
        <div className="text-center mt-8 space-y-2">
          <img
            src="/assets/images/logo/KirilmazlarLogo.png"
            alt="Kırılmazlar"
            className="h-8 w-auto mx-auto opacity-50"
          />
          <p className="text-sm text-gray-400">Kırılmazlar Satıcı v1.0.0</p>
        </div>
      </div>

      {/* Çıkış Onay Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="LogOut" size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Çıkış Yap</h3>
              <p className="text-gray-500">Satıcı hesabınızdan çıkış yapmak istediğinizden emin misiniz?</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSellerSettings;