import storage from '@core/storage';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import Icon from '../../../../../shared/components/AppIcon';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    companyName: '',
    companyTitle: '',
    accountType: 'personal'
  });

  // Modal açıldığında kullanıcı bilgilerini yükle
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        district: userProfile.district || '',
        postalCode: userProfile.postalCode || '',
        companyName: userProfile.companyName || '',
        companyTitle: userProfile.companyTitle || '',
        accountType: userProfile.accountType || 'personal'
      });
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Form validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        showError('Lütfen zorunlu alanları doldurun');
        return;
      }

      // Kullanıcı profilini güncelle
      const updatedProfile = {
        ...userProfile,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      // Auth context'i güncelle
      await updateUserProfile(updatedProfile);

      // Storage'daki customers listesini de güncelle
      const customers = await storage.get('customers', []);
      const updatedCustomers = customers.map(customer =>
        customer.id === userProfile.id ? updatedProfile : customer
      );
      await storage.set('customers', updatedCustomers);

      // Users listesini de güncelle
      const users = await storage.get('users', []);
      const updatedUsers = users.map(user =>
        user.id === userProfile.id ? updatedProfile : user
      );
      await storage.set('users', updatedUsers);

      showSuccess('Profil bilgileriniz başarıyla güncellendi');
      onClose();

    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      showError('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profil Bilgilerini Düzenle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">

            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="E-posta adresiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Telefon numaranız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hesap Türü
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="personal">Bireysel</option>
                    <option value="business">Kurumsal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kurumsal Bilgiler */}
            {formData.accountType === 'business' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kurumsal Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Şirket adınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ünvan
                    </label>
                    <input
                      type="text"
                      name="companyTitle"
                      value={formData.companyTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ünvanınız"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Adres Bilgileri */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adres Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tam adresiniz"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Şehir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="İlçe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Posta kodu"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;