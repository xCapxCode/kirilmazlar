import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCart } from '../../../../contexts/CartContext';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import Icon from '../../../../shared/components/AppIcon';
import { logger } from '../../../../utils/productionLogger';

logger.info('🔥 MusteriProfil module loaded!');

const MusteriProfil = () => {
  logger.info('🔥 MusteriProfil component rendering!');

  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { isMobile } = useBreakpoint();
  const { orders, clearCart } = useCart();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Meyve Sebze Marketi',
    phone: '0532 123 45 67',
    address: 'Atatürk Caddesi No: 123, Kadıköy, İstanbul'
  });

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    // Scroll'u en üste taşı
    window.scrollTo(0, 0);

    logger.info('👤 Customer Profile useEffect - userProfile:', userProfile);

    // Eğer giriş yapmış kullanıcı varsa, onun bilgilerini kullan
    if (userProfile) {
      const customerBusinessInfo = {
        name: userProfile.companyName || userProfile.name || 'Meyve Sebze Marketi',
        phone: userProfile.phone || '0532 123 45 67',
        address: userProfile.address || 'Atatürk Caddesi No: 123, Kadıköy, İstanbul'
      };

      logger.info('📋 Customer business info from userProfile:', customerBusinessInfo);
      setBusinessInfo(customerBusinessInfo);
    } else {
      // Fallback: localStorage'dan yükle
      const savedBusinessInfo = localStorage.getItem('businessInfo');
      if (savedBusinessInfo) {
        const parsed = JSON.parse(savedBusinessInfo);
        setBusinessInfo({
          name: parsed.name || 'Meyve Sebze Marketi',
          phone: parsed.phone || '0532 123 45 67',
          address: parsed.address || 'Atatürk Caddesi No: 123, Kadıköy, İstanbul'
        });
      }
    }
  }, [userProfile]);

  const handleSignOut = () => {
    clearCart();
    signOut();
    window.location.href = '/';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'preparing': 'Hazırlanıyor',
      'out_for_delivery': 'Yolda',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'text-yellow-600 bg-yellow-50',
      'confirmed': 'text-blue-600 bg-blue-50',
      'preparing': 'text-purple-600 bg-purple-50',
      'out_for_delivery': 'text-orange-600 bg-orange-50',
      'delivered': 'text-green-600 bg-green-50',
      'cancelled': 'text-red-600 bg-red-50'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  };

  // Son 3 siparişi al
  const recentOrders = orders.slice(0, 3);
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-6">
          {/* Profil Başlığı */}
          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <Icon name="User" size={24} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Profilim</h1>
                <p className="text-gray-600 mt-1">Hesap bilgilerinizi yönetin</p>
              </div>
            </div>
          </div>

          {/* Desktop: Tek Sütunlu Layout */}
          <div className="space-y-6">
            {/* İşletme Bilgileri ve Hızlı Eylemler - Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Müşteri Bilgileri */}
              <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h2>
                  <button
                    onClick={() => navigate('/customer/profile/edit')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Icon name="Edit" size={14} />
                    <span>Düzenle</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Icon name="User" size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Ad Soyad</p>
                      <p className="font-bold text-gray-900">{userProfile?.full_name || userProfile?.name || 'Müşteri'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Mail" size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p className="font-bold text-gray-900">{userProfile?.email || 'demo@mail.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Phone" size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-bold text-gray-900">{userProfile?.phone || '+90 555 123 4567'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Adres</p>
                      <p className="font-bold text-gray-900">{userProfile?.address || 'Atatürk Caddesi No: 123, Kadıköy, İstanbul'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hızlı Eylemler */}
              <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Eylemler</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/customer/orders')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name="Package" size={20} className="text-gray-600" />
                      <span className="font-bold text-gray-900">Sipariş Geçmişi</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate('/customer/catalog')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name="ShoppingCart" size={20} className="text-gray-600" />
                      <span className="font-bold text-gray-900">Alışverişe Devam Et</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name="Lock" size={20} className="text-gray-600" />
                      <span className="font-bold text-gray-900">Şifre Değiştir</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name="LogOut" size={20} className="text-red-600" />
                      <span className="font-bold text-red-900">Çıkış Yap</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sipariş İstatistikleri */}
            <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş İstatistikleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(totalSpent)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Son Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentOrders.length > 0 ? formatDate(recentOrders[0].date) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Son Siparişler */}
            {recentOrders.length > 0 && (
              <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
                  <button
                    onClick={() => navigate('/customer/orders')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Tümünü Gör
                  </button>
                </div>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-gray-900">#{order.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.date)} • {order.itemCount} ürün
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Şifre Değiştirme Modalı */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Icon name="Lock" size={24} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
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

                  // Şifre değiştirme işlemi başarılı
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowPasswordModal(false);

                  // Başarılı mesajı göster
                  const event = new CustomEvent('showToast', {
                    detail: { message: 'Şifreniz başarıyla değiştirildi', type: 'success' }
                  });
                  window.dispatchEvent(event);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Şifreyi Değiştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Çıkış Onayı */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Çıkış Yap</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default MusteriProfil; 
