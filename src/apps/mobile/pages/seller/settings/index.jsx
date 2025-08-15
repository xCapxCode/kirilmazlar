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

  // Web ile aynı temel ayarlar - gereksiz özellikler kaldırıldı
  const settingsGroups = [
    {
      title: 'İşletme',
      items: [
        {
          id: 'business-info',
          label: 'İşletme Bilgileri',
          icon: 'Building',
          color: 'bg-blue-100 text-blue-600',
          action: () => { }
        },
        {
          id: 'pricing',
          label: 'Fiyat Ayarları',
          icon: 'DollarSign',
          color: 'bg-green-100 text-green-600',
          action: () => { }
        },
        {
          id: 'orders',
          label: 'Sipariş Ayarları',
          icon: 'ShoppingCart',
          color: 'bg-orange-100 text-orange-600',
          action: () => { }
        }
      ]
    },
    {
      title: 'Hesap',
      items: [
        {
          id: 'notifications',
          label: 'Bildirimler',
          icon: 'Bell',
          color: 'bg-purple-100 text-purple-600',
          action: () => { }
        },
        {
          id: 'units',
          label: 'Birim Yönetimi',
          icon: 'Package',
          color: 'bg-yellow-100 text-yellow-600',
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
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Hero - Müşteri mobil favoriler gibi */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header Content */}
        <div className="relative z-10 px-4 pt-12 pb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/ms/dashboard')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>

            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
            />

            <button
              onClick={() => navigate('/ms/dashboard')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Icon name="Settings" size={20} className="text-white" />
            </button>
          </div>

          {/* Hero Content */}
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
      <div className="px-4 -mt-4 pb-24 relative z-20">
        {/* Profil Kartı */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
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

        {/* Ayar Grupları */}
        <div className="space-y-6">
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
        </div>

        {/* Çıkış Yap Butonu */}
        <div className="mt-6">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2"
          >
            <Icon name="LogOut" size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>

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