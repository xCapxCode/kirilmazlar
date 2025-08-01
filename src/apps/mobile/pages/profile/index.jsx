import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../shared/components/AppIcon';

const MobileProfile = () => {
  const { userProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Bülent Üner',
    email: 'admin@demo.com',
    phone: '+90 555 123 4567',
    address: 'Demo Adres, İstanbul'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Profil kaydetme işlemi
    logger.info('Profil kaydedildi:', profileData);
  };

  const handleSignOut = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      signOut();
    }
  };

  const menuItems = [
    {
      icon: 'ShoppingBag',
      title: 'Siparişlerim',
      subtitle: 'Geçmiş siparişlerinizi görüntüleyin',
      action: () => window.location.href = '/m/orders'
    },
    {
      icon: 'Heart',
      title: 'Favorilerim',
      subtitle: 'Beğendiğiniz ürünler',
      action: () => logger.info('Favoriler')
    },
    {
      icon: 'MapPin',
      title: 'Adreslerim',
      subtitle: 'Teslimat adreslerinizi yönetin',
      action: () => logger.info('Adresler')
    },
    {
      icon: 'CreditCard',
      title: 'Ödeme Yöntemlerim',
      subtitle: 'Kayıtlı kartlarınız',
      action: () => logger.info('Ödeme yöntemleri')
    },
    {
      icon: 'Bell',
      title: 'Bildirimler',
      subtitle: 'Bildirim ayarlarınız',
      action: () => logger.info('Bildirimler')
    },
    {
      icon: 'HelpCircle',
      title: 'Yardım & Destek',
      subtitle: 'Sıkça sorulan sorular',
      action: () => logger.info('Yardım')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-3 py-1 text-lg font-semibold w-full"
              />
            ) : (
              <h2 className="text-xl font-semibold">{profileData.name}</h2>
            )}
            <p className="text-green-100 text-sm">{profileData.email}</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="bg-white/20 p-2 rounded-lg"
          >
            <Icon name={isEditing ? "Check" : "Edit2"} size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info Cards */}
      {isEditing && (
        <div className="p-4 space-y-3">
          <div className="bg-white rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="bg-white rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {!isEditing && (
        <div className="p-4">
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-xs text-gray-600">Toplam Sipariş</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₺1,248</p>
                <p className="text-xs text-gray-600">Toplam Harcama</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">5</p>
                <p className="text-xs text-gray-600">Favori Ürün</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {!isEditing && (
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full bg-white rounded-xl p-4 flex items-center space-x-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name={item.icon} size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.subtitle}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Sign Out Button */}
      {!isEditing && (
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
          >
            <Icon name="LogOut" size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}

      {/* Version Info */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">
          Kırılmazlar Mobile v1.0.0
        </p>
      </div>
    </div>
  );
};

export default MobileProfile;
