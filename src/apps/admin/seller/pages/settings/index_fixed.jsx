import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import storage from '@core/storage';

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

  // Veri yükleme
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Storage'dan ayarları yükle
      const savedBusinessInfo = await storage.get('business_info', {});
      
      if (Object.keys(savedBusinessInfo).length > 0) {
        setBusinessInfo(prev => ({ ...prev, ...savedBusinessInfo }));
      }

    } catch (error) {
      logger.error('❌ Ayarlar yüklenirken hata:', error);
      showError?.('Hata', 'Ayarlar yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType, data) => {
    try {
      setIsSaving(true);
      await storage.set(settingsType, data);
      showSuccess?.('Kaydedildi', 'Ayarlarınız başarıyla kaydedildi');
    } catch (error) {
      logger.error('❌ Ayar kaydetme hatası:', error);
      showError?.('Hata', 'Ayarlar kaydedilirken bir sorun oluştu');
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
    { id: 'business', name: 'İşletme Bilgileri', icon: 'Building' }
  ];

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader 
        user={user}
        userProfile={userProfile}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Genel Ayarlar</h1>
          <p className="text-gray-600">Sistem ayarlarınızı buradan yönetebilirsiniz</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenelAyarlar;
