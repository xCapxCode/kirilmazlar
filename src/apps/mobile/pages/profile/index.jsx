import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import Icon from '../../../../shared/components/AppIcon';

const MobileProfile = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { clearCart, orders } = useCart();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSignOut = () => {
    clearCart();
    signOut();
    navigate('/m/login');
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    // Şifre değiştirme başarılı
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);

    // Toast notification göster
    const event = new CustomEvent('showToast', {
      detail: { message: 'Şifreniz başarıyla değiştirildi', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  // Web ile aynı menü öğeleri
  const menuItems = [
    {
      id: 'orders',
      label: 'Sipariş Geçmişi',
      icon: 'Package',
      action: () => navigate('/m/orders')
    },
    {
      id: 'catalog',
      label: 'Alışverişe Devam Et',
      icon: 'ShoppingCart',
      action: () => navigate('/m/catalog')
    },
    {
      id: 'password',
      label: 'Şifre Değiştir',
      icon: 'Lock',
      action: () => setShowPasswordModal(true)
    }
  ];

  // Sipariş istatistikleri (web ile aynı)
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Modern Header with Profile Hero */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header Content */}
        <div className="relative z-10 px-4 pt-12 pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="h-14 w-auto opacity-100 drop-shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="text-2xl font-bold text-white hidden">Kırılmazlar</span>
          </div>

          {/* Profile Avatar & Info */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-green-100/80 shadow-sm hover:bg-green-150/80 hover:shadow-md rounded-2xl flex items-center justify-center transition-all">
                <span className="text-green-600 text-xl font-medium">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'M'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-100 shadow-lg">
                <Icon name="CheckCircle" size={12} className="text-white" />
              </div>
            </div>

            <h1 className="text-xl font-medium text-white mb-2">
              {userProfile?.full_name || userProfile?.name || 'Hoş Geldiniz'}
            </h1>
            <p className="text-white/80 text-sm">
              {userProfile?.email || 'demo@mail.com'}
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-medium text-white">{totalOrders}</div>
                <div className="text-white/70 text-xs">Sipariş</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">
                  ₺{Math.round(totalSpent)}
                </div>
                <div className="text-white/70 text-xs">Harcama</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-white">4.8</div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-24 relative z-20">
        {/* Personal Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                <Icon name="User" size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
            </div>
            <button className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors">
              <Icon name="Edit" size={14} className="text-gray-600 hover:text-green-600" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 py-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="User" size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ad Soyad</p>
                <p className="text-base font-medium text-gray-900">{userProfile?.full_name || userProfile?.name || 'Müşteri'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Icon name="Mail" size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-posta</p>
                <p className="text-base font-medium text-gray-900">{userProfile?.email || 'demo@mail.com'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <Icon name="Phone" size={14} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefon</p>
                <p className="text-base font-medium text-gray-900">{userProfile?.phone || '+90 555 123 4567'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adres</p>
                <p className="text-base font-medium text-gray-900 leading-relaxed">{userProfile?.address || 'Atatürk Caddesi No: 123, Kadıköy, İstanbul'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="px-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Zap" size={14} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
          </div>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.id === 'orders' ? 'bg-green-100' :
                    item.id === 'catalog' ? 'bg-emerald-100' :
                      'bg-teal-100'
                    }`}>
                    <Icon name={item.icon} size={18} className={`${item.id === 'orders' ? 'text-green-600' :
                      item.id === 'catalog' ? 'text-emerald-600' :
                        'text-teal-600'
                      }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-base font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-500">
                      {item.id === 'orders' ? `${totalOrders} sipariş geçmişi` :
                        item.id === 'catalog' ? 'Yeni ürünler keşfedin' :
                          'Güvenlik ayarları'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Icon name="ChevronRight" size={14} className="text-gray-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-all duration-200"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Icon name="LogOut" size={18} className="text-white" />
              </div>
              <span className="text-base font-medium text-red-600">Çıkış Yap</span>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center space-y-3 opacity-60">
          <img
            src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
            alt="Kırılmazlar"
            className="h-14 w-auto mx-auto opacity-100 drop-shadow-sm"
          />
          <p className="text-sm text-gray-500">Kırılmazlar Gıda v1.0.0</p>
          <p className="text-xs text-gray-400">© 2025 Tüm hakları saklıdır</p>
        </div>
      </div>

      {/* Modern Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="Lock" size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Şifre Değiştir</h3>
              <p className="text-gray-500">Güvenliğiniz için yeni bir şifre belirleyin</p>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
                {passwordError}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-300 transition-all"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-300 transition-all"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-300 transition-all"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                Değiştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Logout Confirmation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="LogOut" size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Yap</h3>
              <p className="text-gray-500">Hesabınızdan çıkış yapmak istediğinizden emin misiniz?</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
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

export default MobileProfile;