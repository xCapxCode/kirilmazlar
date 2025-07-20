import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import storage from '@core/storage';

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, color = 'green' }) => {
  const baseClasses = "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all";
  const colorClasses = {
    green: "peer-focus:ring-green-300 peer-checked:bg-green-600",
    blue: "peer-focus:ring-blue-300 peer-checked:bg-blue-600"
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={`${baseClasses} ${colorClasses[color]}`}></div>
    </label>
  );
};

const GenelAyarlar = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showPrompt, showConfirm } = useModal();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('business');
  const [isSaving, setIsSaving] = useState(false);

  // Ayar state'leri
  const [businessInfo, setBusinessInfo] = useState({
    companyName: 'Kırılmazlar Gıda',
    companyTitle: 'Gıda Tedarik ve Dağıtım',
    address: 'Merkez Mah. Atatürk Cad. No:123',
    phone: '+90 542 123 4567',
    email: 'info@kirilmazlar.com',
    logo: null
  });

  const [priceSettings, setPriceSettings] = useState({
    showPrices: true,
    showPricesOnlyToMembers: false,
    minOrderAmount: 50,
    currency: 'TRY'
  });

  const [orderSettings, setOrderSettings] = useState({
    autoConfirmOrders: false,
    orderPrefix: 'SIP',
    orderNumberStart: 1,
    enableOrderNotes: true,
    maxOrderItems: 50
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderStatusUpdates: true,
    lowStockAlerts: true,
    newCustomerAlerts: true,
    systemAlerts: true,
    paymentAlerts: true
  });

  const [customUnits, setCustomUnits] = useState([
    { id: 1, name: 'kg', display: 'Kilogram', active: true },
    { id: 2, name: 'adet', display: 'Adet', active: true },
    { id: 3, name: 'kasa', display: 'Kasa', active: true },
    { id: 4, name: 'çuval', display: 'Çuval', active: true },
    { id: 5, name: 'demet', display: 'Demet', active: true }
  ]);

  const [newUnit, setNewUnit] = useState({
    name: '',
    display: ''
  });

  const [editingUnits, setEditingUnits] = useState({});
  const [unitEditData, setUnitEditData] = useState({});

  const [adminAccounts, setAdminAccounts] = useState([
    {
      id: 1,
      name: 'Ana Yönetici',
      email: 'admin@kirilmazlar.com',
      username: 'admin',
      password: 'admin123',
      role: 'owner',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Test Yöneticisi',
      email: 'test@kirilmazlar.com',
      username: 'test_admin',
      password: 'test123',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      name: 'Demo Satıcı',
      email: 'demo@kirilmazlar.com',
      username: 'demo_seller',
      password: 'demo123',
      role: 'seller',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'admin'
  });

  const [editingAdmins, setEditingAdmins] = useState({});
  const [editData, setEditData] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  // Veri yükleme
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Storage'dan ayarları yükle
      const savedBusinessInfo = await storage.get('business_info', {});
      const savedPriceSettings = await storage.get('price_settings', {});
      const savedOrderSettings = await storage.get('order_settings', {});
      const savedNotificationSettings = await storage.get('notification_settings', {});
      const savedCustomUnits = await storage.get('custom_units', []);
      const savedAdminAccounts = await storage.get('admin_accounts', []);
      
      if (Object.keys(savedBusinessInfo).length > 0) {
        setBusinessInfo(prev => ({ ...prev, ...savedBusinessInfo }));
      }

      if (Object.keys(savedPriceSettings).length > 0) {
        setPriceSettings(prev => ({ ...prev, ...savedPriceSettings }));
      }

      if (Object.keys(savedOrderSettings).length > 0) {
        setOrderSettings(prev => ({ ...prev, ...savedOrderSettings }));
      }

      if (Object.keys(savedNotificationSettings).length > 0) {
        setNotificationSettings(prev => ({ ...prev, ...savedNotificationSettings }));
      }

      if (savedCustomUnits.length > 0) {
        setCustomUnits(savedCustomUnits);
      }

      if (savedAdminAccounts.length > 0) {
        setAdminAccounts(savedAdminAccounts);
      }

    } catch (error) {
      console.error('❌ Ayarlar yüklenirken hata:', error);
      showError?.('Hata', 'Ayarlar yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType, data) => {
    try {
      setIsSaving(true);
      await storage.set(settingsType, data);
      
      // İşletme bilgileri için özel localStorage sync (bildirim olmadan)
      if (settingsType === 'business_info') {
        localStorage.setItem('businessInfo', JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('businessInfoUpdated'));
        console.log('✅ Business info updated without duplicate notification');
      }
      
      showSuccess('Kaydedildi', 'Ayarlarınız başarıyla kaydedildi');
    } catch (error) {
      console.error('❌ Ayar kaydetme hatası:', error);
      showError('Hata', 'Ayarlar kaydedilirken bir sorun oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // İşletme bilgileri kaydetme
  const handleSaveBusinessInfo = () => {
    saveSettings('business_info', businessInfo);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'business', name: 'İşletme Bilgileri', icon: 'Building' },
    { id: 'admins', name: 'Yönetici Hesapları', icon: 'Users' },
    { id: 'pricing', name: 'Fiyat Ayarları', icon: 'DollarSign' },
    { id: 'orders', name: 'Sipariş Ayarları', icon: 'ShoppingCart' },
    { id: 'notifications', name: 'Bildirimler', icon: 'Bell' },
    { id: 'units', name: 'Birim Yönetimi', icon: 'Package' }
  ];

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader 
        user={user}
        userProfile={userProfile}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Açıklama */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Icon name="Settings" size={24} className="text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-green-600">Genel Ayarlar</h1>
              <p className="text-gray-600 mt-1">İşletme ve sistem ayarlarınızı buradan yönetebilirsiniz</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-slate-100 rounded-b-lg">
            {/* İşletme Bilgileri Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İşletme Bilgileri</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      value={businessInfo.companyName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      minLength={3}
                      maxLength={50}
                      placeholder="Şirket adınızı girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ünvan
                    </label>
                    <input
                      type="text"
                      value={businessInfo.companyTitle}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      maxLength={100}
                      placeholder="Şirket ünvanınızı girin"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      maxLength={200}
                      placeholder="İşletme adresinizi girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      pattern="[0-9+\s\-()]+"
                      placeholder="Telefon numaranızı girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="E-posta adresinizi girin"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveBusinessInfo}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Yönetici Hesapları Tab */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Yönetici Hesapları</h3>
                  <div className="text-sm text-gray-600">
                    Toplam {adminAccounts.length} hesap • {adminAccounts.filter(a => a.active).length} aktif
                  </div>
                </div>

                {/* Yeni Yönetici Ekleme Formu */}
                <div className="bg-slate-100 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Yeni Yönetici Hesabı Ekle</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="admin@kirilmazlar.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="admin_kullanici"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                      <div className="relative">
                        <input
                          type={showNewAdminPassword ? "text" : "password"}
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Güvenli şifre"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          <Icon name={showNewAdminPassword ? "EyeOff" : "Eye"} size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="admin">Yönetici</option>
                        <option value="seller">Satıcı</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (!newAdmin.name || !newAdmin.email || !newAdmin.username || !newAdmin.password) {
                          alert('Lütfen tüm alanları doldurun');
                          return;
                        }
                        
                        const newAccount = {
                          id: Math.max(...adminAccounts.map(a => a.id)) + 1,
                          ...newAdmin,
                          active: true,
                          createdAt: new Date().toISOString(),
                          lastLogin: new Date().toISOString()
                        };
                        
                        setAdminAccounts([...adminAccounts, newAccount]);
                        setNewAdmin({ name: '', email: '', username: '', password: '', role: 'admin' });
                        showSuccess('Başarılı', 'Yeni yönetici hesabı eklendi');
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Hesap Ekle
                    </button>
                  </div>
                </div>

                {/* Yönetici Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminAccounts.map(admin => {
                    const isEditing = editingAdmins[admin.id] || false;
                    const currentEditData = editData[admin.id] || admin;

                    return (
                      <div key={admin.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={currentEditData.name}
                                  onChange={(e) => setEditData(prev => ({ 
                                    ...prev, 
                                    [admin.id]: { ...currentEditData, name: e.target.value } 
                                  }))}
                                  className="w-full text-sm font-semibold px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Ad Soyad"
                                />
                                <input
                                  type="text"
                                  value={currentEditData.username}
                                  onChange={(e) => setEditData(prev => ({ 
                                    ...prev, 
                                    [admin.id]: { ...currentEditData, username: e.target.value } 
                                  }))}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="kullanici_adi"
                                />
                                <input
                                  type="email"
                                  value={currentEditData.email}
                                  onChange={(e) => setEditData(prev => ({ 
                                    ...prev, 
                                    [admin.id]: { ...currentEditData, email: e.target.value } 
                                  }))}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="email@domain.com"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-gray-900 text-sm">{admin.name}</h3>
                                  {admin.role === 'owner' && (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Ana Yönetici
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 truncate">@{admin.username}</p>
                                <p className="text-xs text-gray-600 truncate">{admin.email}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.active ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Rol:</span>
                            {isEditing ? (
                              <select
                                value={currentEditData.role}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  [admin.id]: { ...currentEditData, role: e.target.value } 
                                }))}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={admin.role === 'owner'}
                              >
                                <option value="owner">Sahip</option>
                                <option value="admin">Yönetici</option>
                                <option value="seller">Satıcı</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                admin.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                                admin.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {admin.role === 'owner' ? 'Sahip' : 
                                 admin.role === 'admin' ? 'Yönetici' : 'Satıcı'}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Şifre:</span>
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  type={showPasswords[admin.id] ? "text" : "password"}
                                  value={currentEditData.password}
                                  onChange={(e) => setEditData(prev => ({ 
                                    ...prev, 
                                    [admin.id]: { ...currentEditData, password: e.target.value } 
                                  }))}
                                  className="text-xs px-2 py-1 pr-6 border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Yeni şifre"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, [admin.id]: !prev[admin.id] }))}
                                  className="absolute inset-y-0 right-0 flex items-center pr-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Icon name={showPasswords[admin.id] ? "EyeOff" : "Eye"} size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                  {showPasswords[admin.id] ? admin.password : '•'.repeat(admin.password.length)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, [admin.id]: !prev[admin.id] }))}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title={showPasswords[admin.id] ? "Şifreyi Gizle" : "Şifreyi Göster"}
                                >
                                  <Icon name={showPasswords[admin.id] ? "EyeOff" : "Eye"} size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Son Giriş:</span>
                            <span className="font-medium">
                              {new Date(admin.lastLogin).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (!currentEditData.name || !currentEditData.email || !currentEditData.username || !currentEditData.password) {
                                    showError('Eksik Bilgi', 'Lütfen tüm alanları doldurun');
                                    return;
                                  }
                                  
                                  setAdminAccounts(adminAccounts.map(a => 
                                    a.id === admin.id ? { ...a, ...currentEditData } : a
                                  ));
                                  setEditingAdmins(prev => ({ ...prev, [admin.id]: false }));
                                  showSuccess('Başarılı', 'Hesap bilgileri güncellendi');
                                }}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors font-medium"
                              >
                                <Icon name="Check" size={12} />
                                <span>Kaydet</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditData(prev => ({ ...prev, [admin.id]: admin }));
                                  setEditingAdmins(prev => ({ ...prev, [admin.id]: false }));
                                }}
                                className="flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                title="İptal"
                              >
                                <Icon name="X" size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditData(prev => ({ ...prev, [admin.id]: admin }));
                                  setEditingAdmins(prev => ({ ...prev, [admin.id]: true }));
                                }}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-transparent border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-600/10 transition-colors font-medium"
                              >
                                <Icon name="Edit" size={12} />
                                <span>Düzenle</span>
                              </button>
                              
                              <button
                                onClick={() => setAdminAccounts(adminAccounts.map(a => 
                                  a.id === admin.id ? { ...a, active: !a.active } : a
                                ))}
                                className={`flex items-center justify-center px-3 py-2 text-xs rounded font-medium transition-colors ${
                                  admin.active 
                                    ? 'bg-transparent border border-orange-600 text-orange-600 hover:bg-orange-600/10'
                                    : 'bg-transparent border border-green-600 text-green-600 hover:bg-green-600/10'
                                }`}
                                title={admin.active ? 'Devre Dışı Bırak' : 'Aktif Et'}
                              >
                                <Icon name={admin.active ? "UserX" : "UserCheck"} size={12} />
                              </button>
                              
                              {admin.role !== 'owner' && (
                                <button
                                  onClick={() => {
                                    showConfirm(
                                      'Hesabı Sil',
                                      `${admin.name} hesabını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
                                      () => {
                                        setAdminAccounts(adminAccounts.filter(a => a.id !== admin.id));
                                        showSuccess('Başarılı', 'Hesap başarıyla silindi');
                                      }
                                    );
                                  }}
                                  className="flex items-center justify-center px-3 py-2 bg-transparent border border-red-600 text-red-600 text-xs rounded hover:bg-red-600/10 transition-colors font-medium"
                                  title="Hesabı Sil"
                                >
                                  <Icon name="Trash2" size={12} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('admin_accounts', adminAccounts)}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Yönetici Hesaplarını Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Fiyat Ayarları Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Fiyat Ayarları</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Fiyatları Göster</h4>
                      <p className="text-sm text-gray-500">Müşterilere ürün fiyatlarını göster</p>
                    </div>
                    <ToggleSwitch
                      checked={priceSettings.showPrices}
                      onChange={(checked) => setPriceSettings(prev => ({ ...prev, showPrices: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Sadece Üyelere Fiyat Göster</h4>
                      <p className="text-sm text-gray-500">Fiyatları sadece kayıtlı müşterilere göster</p>
                    </div>
                    <ToggleSwitch
                      checked={priceSettings.showPricesOnlyToMembers}
                      onChange={(checked) => setPriceSettings(prev => ({ ...prev, showPricesOnlyToMembers: checked }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Sipariş Tutarı (₺)
                    </label>
                    <input
                      type="number"
                      value={priceSettings.minOrderAmount}
                      onChange={(e) => setPriceSettings(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('price_settings', priceSettings)}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Sipariş Ayarları Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Sipariş Ayarları</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Otomatik Sipariş Onayı</h4>
                      <p className="text-sm text-gray-500">Yeni siparişleri otomatik olarak onayla</p>
                    </div>
                    <ToggleSwitch
                      checked={orderSettings.autoConfirmOrders}
                      onChange={(checked) => setOrderSettings(prev => ({ ...prev, autoConfirmOrders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Sipariş Notlarını Etkinleştir</h4>
                      <p className="text-sm text-gray-500">Müşterilerin sipariş notu eklemesine izin ver</p>
                    </div>
                    <ToggleSwitch
                      checked={orderSettings.enableOrderNotes}
                      onChange={(checked) => setOrderSettings(prev => ({ ...prev, enableOrderNotes: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sipariş Öneki
                      </label>
                      <input
                        type="text"
                        value={orderSettings.orderPrefix}
                        onChange={(e) => setOrderSettings(prev => ({ ...prev, orderPrefix: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="SIP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimum Ürün Sayısı
                      </label>
                      <input
                        type="number"
                        value={orderSettings.maxOrderItems}
                        onChange={(e) => setOrderSettings(prev => ({ ...prev, maxOrderItems: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('order_settings', orderSettings)}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Bildirim Ayarları Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Bildirim Ayarları</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Sipariş Durum Güncellemeleri</h4>
                      <p className="text-sm text-gray-500">Sipariş durumu değiştiğinde bildirim al</p>
                    </div>
                    <ToggleSwitch
                      checked={notificationSettings.orderStatusUpdates}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderStatusUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Düşük Stok Uyarıları</h4>
                      <p className="text-sm text-gray-500">Ürün stoğu azaldığında bildirim al</p>
                    </div>
                    <ToggleSwitch
                      checked={notificationSettings.lowStockAlerts}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Yeni Müşteri Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Yeni müşteri kaydolduğunda bildirim al</p>
                    </div>
                    <ToggleSwitch
                      checked={notificationSettings.newCustomerAlerts}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, newCustomerAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Sistem Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Sistem güncellemeleri ve bakım bildirimleri</p>
                    </div>
                    <ToggleSwitch
                      checked={notificationSettings.systemAlerts}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Ödeme Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Ödeme alındığında bildirim al</p>
                    </div>
                    <ToggleSwitch
                      checked={notificationSettings.paymentAlerts}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentAlerts: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('notification_settings', notificationSettings)}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Birim Yönetimi Tab */}
            {activeTab === 'units' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Birim Yönetimi</h3>
                  <div className="text-sm text-gray-600">
                    Toplam {customUnits.length} birim • {customUnits.filter(u => u.active).length} aktif
                  </div>
                </div>

                {/* Yeni Birim Ekleme Formu */}
                <div className="bg-slate-100 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Yeni Birim Ekle</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birim Kodu</label>
                      <input
                        type="text"
                        value={newUnit.name}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Örn: kg, adet, lt"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birim Adı</label>
                      <input
                        type="text"
                        value={newUnit.display}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, display: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Örn: Kilogram, Adet, Litre"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!newUnit.name.trim() || !newUnit.display.trim()) {
                            showError('Eksik Bilgi', 'Lütfen birim kodu ve adını girin');
                            return;
                          }
                          
                          const newUnitData = {
                            id: Math.max(...customUnits.map(u => u.id)) + 1,
                            name: newUnit.name.toLowerCase().trim(),
                            display: newUnit.display.trim(),
                            active: true
                          };
                          
                          setCustomUnits([...customUnits, newUnitData]);
                          setNewUnit({ name: '', display: '' });
                          showSuccess('Başarılı', 'Yeni birim eklendi');
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Birim Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Birim Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customUnits.map((unit) => {
                    const isEditing = editingUnits[unit.id] || false;
                    const currentEditData = unitEditData[unit.id] || unit;

                    return (
                      <div key={unit.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={currentEditData.display}
                                  onChange={(e) => setUnitEditData(prev => ({ 
                                    ...prev, 
                                    [unit.id]: { ...currentEditData, display: e.target.value } 
                                  }))}
                                  className="w-full text-sm font-semibold px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Birim adı"
                                />
                                <input
                                  type="text"
                                  value={currentEditData.name}
                                  onChange={(e) => setUnitEditData(prev => ({ 
                                    ...prev, 
                                    [unit.id]: { ...currentEditData, name: e.target.value } 
                                  }))}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Birim kodu"
                                />
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">{unit.display}</h4>
                                <p className="text-xs text-gray-600">Kod: {unit.name}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              unit.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {unit.active ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (!currentEditData.name.trim() || !currentEditData.display.trim()) {
                                    showError('Eksik Bilgi', 'Lütfen tüm alanları doldurun');
                                    return;
                                  }
                                  
                                  setCustomUnits(customUnits.map(u => 
                                    u.id === unit.id ? { ...u, ...currentEditData } : u
                                  ));
                                  setEditingUnits(prev => ({ ...prev, [unit.id]: false }));
                                  showSuccess('Başarılı', 'Birim güncellendi');
                                }}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors font-medium"
                              >
                                <Icon name="Check" size={12} />
                                <span>Kaydet</span>
                              </button>
                              <button
                                onClick={() => {
                                  setUnitEditData(prev => ({ ...prev, [unit.id]: unit }));
                                  setEditingUnits(prev => ({ ...prev, [unit.id]: false }));
                                }}
                                className="flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                title="İptal"
                              >
                                <Icon name="X" size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setUnitEditData(prev => ({ ...prev, [unit.id]: unit }));
                                  setEditingUnits(prev => ({ ...prev, [unit.id]: true }));
                                }}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-transparent border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-600/10 transition-colors font-medium"
                              >
                                <Icon name="Edit" size={12} />
                                <span>Düzenle</span>
                              </button>
                              
                              <button
                                onClick={() => setCustomUnits(customUnits.map(u => 
                                  u.id === unit.id ? { ...u, active: !u.active } : u
                                ))}
                                className={`flex items-center justify-center px-3 py-2 text-xs rounded font-medium transition-colors ${
                                  unit.active 
                                    ? 'bg-transparent border border-orange-600 text-orange-600 hover:bg-orange-600/10'
                                    : 'bg-transparent border border-green-600 text-green-600 hover:bg-green-600/10'
                                }`}
                                title={unit.active ? 'Devre Dışı Bırak' : 'Aktif Et'}
                              >
                                <Icon name={unit.active ? "ToggleLeft" : "ToggleRight"} size={12} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  showConfirm(
                                    'Birimi Sil',
                                    `${unit.display} birimini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
                                    () => {
                                      setCustomUnits(customUnits.filter(u => u.id !== unit.id));
                                      showSuccess('Başarılı', 'Birim silindi');
                                    }
                                  );
                                }}
                                className="flex items-center justify-center px-3 py-2 bg-transparent border border-red-600 text-red-600 text-xs rounded hover:bg-red-600/10 transition-colors font-medium"
                                title="Birimi Sil"
                              >
                                <Icon name="Trash2" size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('custom_units', customUnits)}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Birimleri Kaydet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenelAyarlar;
