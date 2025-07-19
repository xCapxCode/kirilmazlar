import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useModal } from '../../../../../contexts/ModalContext';
import { useNotification } from '../../../../../contexts/NotificationContext';
import SaticiHeader from '../../../../../shared/components/ui/SaticiHeader';
import Icon from '../../../../../shared/components/AppIcon';
import storage from '../../../../../core/storage/index.js';
import customerService from '../../../../../services/customerService';
import CustomerDetailModal from './components/CustomerDetailModal';
import CustomerStatusModal from './components/CustomerStatusModal';

// Basit Müşteri Ekleme Formu
const NewCustomerForm = ({ onSave, onCancel, showWarning }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    companyName: '',
    companyTitle: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    accountType: 'personal',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basit validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showWarning('Ad, email ve telefon alanları zorunludur!');
      return;
    }
    
    if (!formData.username.trim() || !formData.password.trim()) {
      showWarning('Kullanıcı adı ve şifre alanları zorunludur!');
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Temel Bilgiler</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Ahmet Yılmaz"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: ahmet@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: 0532 123 4567"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: ahmet123"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Müşteri şifresi"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
            <select
              value={formData.accountType}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="personal">Bireysel</option>
              <option value="business">Kurumsal</option>
            </select>
          </div>
        </div>

        {/* Adres ve Şirket Bilgileri */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Adres & Şirket Bilgileri</h4>
          
          {formData.accountType === 'business' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: ABC Ltd. Şti."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ünvan</label>
                <input
                  type="text"
                  value={formData.companyTitle}
                  onChange={(e) => handleChange('companyTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Müdür, CEO"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Örn: Atatürk Cad. No:123"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İstanbul"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kadıköy"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="34000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Müşteri hakkında notlar..."
            />
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Müşteri Ekle
        </button>
      </div>
    </form>
  );
};

// Müşteri düzenleme formu component'i
const EditCustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    username: customer.username || '',
    companyName: customer.companyName || '',
    companyTitle: customer.companyTitle || '',
    address: customer.address || '',
    city: customer.city || '',
    district: customer.district || '',
    postalCode: customer.postalCode || '',
    accountType: customer.accountType || 'personal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        ...customer,
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kullanıcı Adı *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hesap Türü
          </label>
          <select
            value={formData.accountType}
            onChange={(e) => handleChange('accountType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personal">Bireysel</option>
            <option value="business">Kurumsal</option>
          </select>
        </div>

        {formData.accountType === 'business' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ünvan
              </label>
              <input
                type="text"
                value={formData.companyTitle}
                onChange={(e) => handleChange('companyTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            İlçe
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
      </div>
    </form>
  );
};

const MusteriYonetimi = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { showConfirm } = useModal();
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'name'
  });

  // Veri yükleme
  useEffect(() => {
    loadData();
    
    // Real-time subscriptions
    const unsubscribeCustomers = storage.subscribe('customers', (newCustomers) => {
      setCustomers(newCustomers || []);
    });
    
    const unsubscribeOrders = storage.subscribe('customer_orders', (newOrders) => {
      setOrders(newOrders || []);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeOrders();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Müşterileri yükle
      let storedCustomers = await customerService.getAll();
      if (storedCustomers.length === 0) {
        console.log('🆕 Demo müşteriler oluşturuluyor...');
        storedCustomers = createDemoCustomers();
        
        // Demo müşterileri kaydet
        for (const customer of storedCustomers) {
          await customerService.create(customer);
        }
        
        // Müşterileri yeniden yükle
        storedCustomers = await customerService.getAll();
      }
      
      // Siparişleri yükle
      const storedOrders = await storage.get('customer_orders', []);
      
      setCustomers(storedCustomers);
      setOrders(storedOrders);
      console.log('✅ Müşteri yönetimi verileri yüklendi');
      
    } catch (error) {
      console.error('❌ Müşteri yönetimi veri yükleme hatası:', error);
      showError('Müşteri verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Demo müşteriler oluştur (sadece 10 tane)
  const createDemoCustomers = () => {
    const demoCustomers = [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@email.com',
        phone: '0532 123 4567',
        username: 'ahmet123',
        status: 'active',
        registeredAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2025-07-15T14:20:00Z',
        companyName: 'Yılmaz Market',
        companyTitle: 'Müdür',
        address: 'Atatürk Cad. No:45',
        city: 'İstanbul',
        district: 'Kadıköy',
        postalCode: '34710',
        accountType: 'business',
        avatar: null,
        notes: 'Düzenli müşteri, hızlı ödeme yapar'
      },
      {
        id: 2,
        name: 'Fatma Demir',
        email: 'fatma@email.com',
        phone: '0545 987 6543',
        username: 'fatma456',
        status: 'active',
        registeredAt: '2024-02-20T09:15:00Z',
        lastLoginAt: '2025-07-14T11:45:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Cumhuriyet Mah. 123. Sk. No:78',
        city: 'Ankara',
        district: 'Çankaya',
        postalCode: '06690',
        accountType: 'personal',
        avatar: null,
        notes: 'Organik ürünleri tercih ediyor'
      },
      {
        id: 3,
        name: 'Mehmet Kaya',
        email: 'mehmet@email.com',
        phone: '0533 456 7890',
        username: 'mehmet789',
        status: 'active',
        registeredAt: '2024-03-10T16:45:00Z',
        lastLoginAt: '2025-07-16T08:30:00Z',
        companyName: 'Kaya Gıda Ltd.',
        companyTitle: 'Satın Alma Müdürü',
        address: 'Sanayi Sitesi 4. Blok No:12',
        city: 'İzmir',
        district: 'Bornova',
        postalCode: '35040',
        accountType: 'business',
        avatar: null,
        notes: 'Toplu sipariş veriyor, indirim bekliyor'
      },
      {
        id: 4,
        name: 'Ayşe Özkan',
        email: 'ayse@email.com',
        phone: '0542 111 2233',
        username: 'ayse321',
        status: 'active',
        registeredAt: '2024-04-05T12:20:00Z',
        lastLoginAt: '2025-07-13T19:15:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Yeni Mah. 567. Cd. No:89',
        city: 'Bursa',
        district: 'Nilüfer',
        postalCode: '16110',
        accountType: 'personal',
        avatar: null,
        notes: 'Hafta sonları sipariş veriyor'
      },
      {
        id: 5,
        name: 'Emre Şahin',
        email: 'emre@email.com',
        phone: '0534 444 5566',
        username: 'emre555',
        status: 'inactive',
        registeredAt: '2024-05-12T14:10:00Z',
        lastLoginAt: '2025-06-20T10:00:00Z',
        companyName: 'Şahin Restaurant',
        companyTitle: 'Chef',
        address: 'Merkez Mah. Restaurant Sok. No:34',
        city: 'Antalya',
        district: 'Muratpaşa',
        postalCode: '07100',
        accountType: 'business',
        avatar: null,
        notes: 'Uzun süredir pasif'
      },
      {
        id: 6,
        name: 'Zeynep Kara',
        email: 'zeynep@email.com',
        phone: '0546 777 8899',
        username: 'zeynep99',
        status: 'active',
        registeredAt: '2024-06-01T13:25:00Z',
        lastLoginAt: '2025-07-15T16:40:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Barbaros Bulv. No:156',
        city: 'İstanbul',
        district: 'Beşiktaş',
        postalCode: '34349',
        accountType: 'personal',
        avatar: null,
        notes: 'Hızlı teslimat istiyor'
      },
      {
        id: 7,
        name: 'Murat Özdemir',
        email: 'murat@email.com',
        phone: '0535 333 4455',
        username: 'murat77',
        status: 'active',
        registeredAt: '2024-06-15T11:10:00Z',
        lastLoginAt: '2025-07-16T09:20:00Z',
        companyName: 'Özdemir Ticaret',
        companyTitle: 'Genel Müdür',
        address: 'İnönü Cad. No:67',
        city: 'Ankara',
        district: 'Kızılay',
        postalCode: '06420',
        accountType: 'business',
        avatar: null,
        notes: 'Aylık düzenli sipariş veriyor'
      },
      {
        id: 8,
        name: 'Elif Yıldız',
        email: 'elif@email.com',
        phone: '0543 666 7788',
        username: 'elif123',
        status: 'active',
        registeredAt: '2024-07-01T14:35:00Z',
        lastLoginAt: '2025-07-14T18:50:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Alsancak Mah. 456. Sk. No:23',
        city: 'İzmir',
        district: 'Konak',
        postalCode: '35220',
        accountType: 'personal',
        avatar: null,
        notes: 'Yeni müşteri, ilk siparişini verdi'
      },
      {
        id: 9,
        name: 'Okan Demir',
        email: 'okan@email.com',
        phone: '0537 999 1122',
        username: 'okan456',
        status: 'active',
        registeredAt: '2024-07-10T10:15:00Z',
        lastLoginAt: '2025-07-15T12:30:00Z',
        companyName: 'Demir Pazarlama',
        companyTitle: 'Pazarlama Müdürü',
        address: 'Atatürk Bulv. No:789',
        city: 'Bursa',
        district: 'Osmangazi',
        postalCode: '16200',
        accountType: 'business',
        avatar: null,
        notes: 'Büyük siparişler veriyor'
      },
      {
        id: 10,
        name: 'Selin Kaya',
        email: 'selin@email.com',
        phone: '0544 555 6677',
        username: 'selin789',
        status: 'active',
        registeredAt: '2024-07-15T16:20:00Z',
        lastLoginAt: '2025-07-16T14:45:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Yenişehir Mah. 123. Cd. No:45',
        city: 'Antalya',
        district: 'Aksu',
        postalCode: '07100',
        accountType: 'personal',
        avatar: null,
        notes: 'En yeni müşterimiz'
      },
      {
        id: 11,
        name: 'İbrahim Koç',
        email: 'ibrahim@email.com',
        phone: '0542 890 1234',
        username: 'ibrahim567',
        status: 'active',
        registeredAt: '2024-01-25T08:40:00Z',
        lastLoginAt: '2025-07-16T07:20:00Z',
        companyName: 'Koç Turizm Otel',
        companyTitle: 'İşletme Müdürü',
        address: 'Turizm Bölgesi 5. Etap',
        city: 'Muğla',
        district: 'Marmaris',
        postalCode: '48700',
        accountType: 'business',
        avatar: null,
        notes: 'Otel için toplu gıda tedariki'
      },
      {
        id: 12,
        name: 'Meryem Aydın',
        email: 'meryem@email.com',
        phone: '0543 901 2345',
        username: 'meryem890',
        status: 'active',
        registeredAt: '2024-03-15T13:55:00Z',
        lastLoginAt: '2025-07-12T16:40:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Yeşil Vadi Sitesi B/24',
        city: 'Denizli',
        district: 'Pamukkale',
        postalCode: '20160',
        accountType: 'personal',
        avatar: null,
        notes: 'Sağlıklı beslenme odaklı'
      },
      {
        id: 13,
        name: 'Ömer Başkan',
        email: 'omer@email.com',
        phone: '0544 012 3456',
        username: 'omer123',
        status: 'inactive',
        registeredAt: '2024-04-01T09:30:00Z',
        lastLoginAt: '2025-06-20T12:00:00Z',
        companyName: 'Başkan Lokantası',
        companyTitle: 'Şef',
        address: 'Eski Çarşı No:45',
        city: 'Gaziantep',
        district: 'Şehitkamil',
        postalCode: '27010',
        accountType: 'business',
        avatar: null,
        notes: 'Geçici olarak pasif, yeniden aktif olabilir'
      },
      {
        id: 14,
        name: 'Elif Turan',
        email: 'elif@email.com',
        phone: '0545 123 4567',
        username: 'elif456',
        status: 'active',
        registeredAt: '2024-02-05T17:15:00Z',
        lastLoginAt: '2025-07-15T13:25:00Z',
        companyName: '',
        companyTitle: '',
        address: 'Çamlık Mah. 156/7',
        city: 'Mersin',
        district: 'Akdeniz',
        postalCode: '33100',
        accountType: 'personal',
        avatar: null,
        notes: 'Akdeniz bölgesi, mevsimlik tercih'
      },
      {
        id: 15,
        name: 'Recep Erdem',
        email: 'recep@email.com',
        phone: '0546 234 5678',
        username: 'recep789',
        status: 'pending',
        registeredAt: '2024-04-15T19:45:00Z',
        lastLoginAt: null,
        companyName: 'Erdem Toptan Gıda',
        companyTitle: 'Müdür',
        address: 'Hal Kompleksi 12. Ada',
        city: 'Konya',
        district: 'Selçuklu',
        postalCode: '42250',
        accountType: 'business',
        avatar: null,
        notes: 'Onay bekleyen hesap, büyük potansiyel'
      }
    ];

    return demoCustomers;
  };

  // Müşteri durumu güncelleme
  const handleUpdateCustomerStatus = async (customerId, status, reason = '') => {
    try {
      const updatedCustomer = await customerService.updateStatus(customerId, status);
      
      if (!updatedCustomer) {
        throw new Error('Müşteri bulunamadı');
      }
      
      // Eğer engelleme nedeni varsa, müşteri notlarına ekle
      if (status === 'blocked' && reason) {
        await customerService.update(customerId, {
          notes: `${updatedCustomer.notes ? updatedCustomer.notes + '\n\n' : ''}Engelleme Nedeni (${new Date().toLocaleDateString('tr-TR')}): ${reason}`
        });
      }
      
      // Müşterileri yeniden yükle
      await loadData();
      
      showSuccess(`Müşteri durumu başarıyla güncellendi: ${getStatusLabel(status)}`);
      return true;
    } catch (error) {
      console.error('Müşteri durumu güncellenirken hata:', error);
      showError('Müşteri durumu güncellenirken bir hata oluştu');
      return false;
    }
  };
  
  // Durum etiketi getir
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'blocked':
        return 'Engelli';
      case 'pending':
        return 'Onay Bekliyor';
      default:
        return 'Bilinmiyor';
    }
  };

  // Müşteri istatistikleri
  const customerStats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const business = customers.filter(c => c.accountType === 'business').length;
    const personal = customers.filter(c => c.accountType === 'personal').length;
    const blocked = customers.filter(c => c.status === 'blocked').length;
    const pending = customers.filter(c => c.status === 'pending').length;

    return { total, active, inactive, business, personal, blocked, pending };
  }, [customers]);

  // Müşteri sipariş istatistikleri
  const enhancedCustomers = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt || null,
        lastOrderStatus: lastOrder?.status || 'Henüz sipariş yok',
        lastOrderAmount: lastOrder?.total || 0,
        averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
      };
    });
  }, [customers, orders]);

  // Filtreleme
  const filteredCustomers = useMemo(() => {
    let filtered = enhancedCustomers;

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search) ||
        customer.username.toLowerCase().includes(searchLower) ||
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.city.toLowerCase().includes(searchLower)
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr');
        case 'orders':
          return b.orderCount - a.orderCount;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'date':
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedCustomers, filters]);

  // Sayfalama
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Para formatı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmiyor';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Excel export
  const handleExportToExcel = () => {
    const data = filteredCustomers.map(customer => ({
      'Müşteri Adı': customer.name,
      'E-posta': customer.email,
      'Telefon': customer.phone,
      'Şehir': customer.city,
      'Hesap Türü': customer.accountType === 'business' ? 'Kurumsal' : 'Bireysel',
      'Durum': customer.status === 'active' ? 'Aktif' : 'Pasif',
      'Kayıt Tarihi': formatDate(customer.registeredAt),
      'Sipariş Sayısı': customer.orderCount,
      'Toplam Harcama': customer.totalSpent,
      'Son Sipariş': formatDate(customer.lastOrderDate)
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `musteriler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Yeni müşteri ekleme
  const handleAddCustomer = async (customerData) => {
    try {
      const newCustomer = await customerService.create({
        ...customerData,
        status: 'active',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        avatar: null
      });
      
      // Müşterileri yeniden yükle
      await loadData();
      setShowNewCustomerModal(false);
      
      console.log('✅ Yeni müşteri eklendi:', newCustomer.name);
      showSuccess(`${newCustomer.name} başarıyla eklendi!`);
    } catch (error) {
      console.error('❌ Müşteri ekleme hatası:', error);
      showError('Müşteri eklenirken bir hata oluştu');
    }
  };

  // Müşteri düzenleme
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowEditCustomerModal(true);
  };

  // Müşteri silme
  const handleDeleteCustomer = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    const customerName = customer ? customer.name : 'Bu müşteri';
    
    const confirmed = await showConfirm(
      `${customerName} adlı müşteriyi silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      {
        title: 'Müşteri Silme',
        confirmText: 'Evet, Sil',
        cancelText: 'İptal',
        type: 'danger'
      }
    );
    
    if (confirmed) {
      try {
        const deleted = await customerService.delete(customerId);
        
        if (!deleted) {
          throw new Error('Müşteri bulunamadı');
        }
        
        // Müşterileri yeniden yükle
        await loadData();
        
        console.log('✅ Müşteri silindi:', customerName);
        showSuccess(`${customerName} başarıyla silindi.`);
      } catch (error) {
        console.error('❌ Müşteri silme hatası:', error);
        showError('Müşteri silinirken bir hata oluştu');
      }
    }
  };

  // Müşteri güncelleme
  const handleUpdateCustomer = async (customerData) => {
    try {
      const updatedCustomer = await customerService.update(editingCustomer.id, customerData);
      
      if (!updatedCustomer) {
        throw new Error('Müşteri bulunamadı');
      }
      
      // Müşterileri yeniden yükle
      await loadData();
      setShowEditCustomerModal(false);
      setEditingCustomer(null);
      
      console.log('✅ Müşteri güncellendi:', customerData.name);
      showSuccess(`${customerData.name} bilgileri başarıyla güncellendi!`);
    } catch (error) {
      console.error('❌ Müşteri güncelleme hatası:', error);
      showError('Müşteri güncellenirken bir hata oluştu');
    }
  };

  // Müşteri sipariş detay takibi
  const handleViewOrders = async (customer) => {
    try {
      // Müşterinin siparişlerini servis üzerinden al
      const customerOrders = await customerService.getCustomerOrders(customer.id);
      
      if (customerOrders.length === 0) {
        showWarning(`${customer.name} adlı müşterinin henüz siparişi bulunmuyor.`);
        return;
      }
      
      // Müşteri detay modalını aç
      setSelectedCustomer(customer);
      setShowDetailModal(true);
      
      console.log('Müşteri siparişleri:', customerOrders);
      showSuccess(`${customer.name} - ${customerOrders.length} sipariş bulundu.`);
    } catch (error) {
      console.error('Müşteri siparişleri yüklenirken hata:', error);
      showError('Müşteri siparişleri yüklenirken bir hata oluştu');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Müşteri yönetimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu panele erişmek için satıcı yetkilerine sahip olmanız gerekir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <SaticiHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Eylemler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name="Users" size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Müşteri Yönetimi</h1>
                <p className="text-gray-600 mt-1">
                  Toplam {customerStats.total} müşteri • {currentCustomers.length} görüntüleniyor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNewCustomerModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Yeni Müşteri</span>
              </button>
              <button
                onClick={handleExportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Excel İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="XCircle" size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pasif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Building" size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kurumsal</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.business}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="User" size={24} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bireysel</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.personal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Müşteri ara (ad, email, telefon, şehir...)"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">İsme Göre</option>
                <option value="orders">Sipariş Sayısına Göre</option>
                <option value="spent">Harcamaya Göre</option>
                <option value="date">Kayıt Tarihine Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Müşteri Kartları */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {currentCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {currentCustomers.map(customer => (
                  <div key={customer.id} className="bg-slate-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{customer.email}</p>
                        <p className="text-xs text-gray-600">{customer.phone}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Müşteriyi düzenle"
                        >
                          <Icon name="Edit" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Müşteriyi sil"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Hesap:</span>
                        <span className={`px-2 py-1 rounded-full ${
                          customer.accountType === 'business' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {customer.accountType === 'business' ? 'Kurumsal' : 'Bireysel'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Sipariş:</span>
                        <span className="font-medium">{customer.orderCount} adet</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Harcama:</span>
                        <span className="font-medium text-green-600">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Şehir:</span>
                        <span className="font-medium">{customer.city}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-transparent border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-600/10 transition-colors font-medium"
                      >
                        <Icon name="User" size={12} />
                        <span>Detay</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowStatusModal(true);
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-transparent border border-purple-600 text-purple-600 text-xs rounded hover:bg-purple-600/10 transition-colors font-medium"
                        title="Müşteri durumunu güncelle"
                      >
                        <Icon name="UserCheck" size={12} />
                        <span>Durum</span>
                      </button>
                      <button
                        onClick={() => handleViewOrders(customer)}
                        className="flex items-center justify-center px-3 py-2 bg-transparent border border-green-600 text-green-600 text-xs rounded hover:bg-green-600/10 transition-colors font-medium"
                        title="Sipariş geçmişini görüntüle"
                      >
                        <Icon name="ShoppingBag" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Sayfa {currentPage} / {totalPages} ({filteredCustomers.length} müşteri)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-white/80 border border-gray-300 rounded hover:bg-gray-50/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Yeni Müşteri Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Müşteri Ekle</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <NewCustomerForm 
              onSave={handleAddCustomer}
              onCancel={() => setShowNewCustomerModal(false)}
              showWarning={showWarning}
            />
          </div>
        </div>
      )}

      {/* Müşteri Detay Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-0 max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon name="User" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-blue-100 text-sm">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Sütun - Temel Bilgiler */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Durum Kartı */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Icon name="Info" size={16} className="mr-2 text-blue-600" />
                      Durum Bilgileri
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hesap Durumu:</span>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          selectedCustomer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedCustomer.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hesap Türü:</span>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          selectedCustomer.accountType === 'business' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {selectedCustomer.accountType === 'business' ? 'Kurumsal' : 'Bireysel'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Kayıt Tarihi:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedCustomer.registeredAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Son Giriş:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedCustomer.lastLoginAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* İletişim Kartı */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Icon name="Phone" size={16} className="mr-2 text-green-600" />
                      İletişim Bilgileri
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">Telefon:</span>
                        <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">E-posta:</span>
                        <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Kullanıcı Adı:</span>
                        <p className="font-medium text-gray-900">{selectedCustomer.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sipariş İstatistikleri Kartı */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Icon name="ShoppingBag" size={16} className="mr-2 text-green-600" />
                      Sipariş İstatistikleri
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">{selectedCustomer.orderCount}</p>
                        <p className="text-xs text-green-600">Toplam Sipariş</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedCustomer.totalSpent)}</p>
                        <p className="text-xs text-green-600">Toplam Harcama</p>
                      </div>
                      <div className="text-center col-span-2">
                        <p className="text-lg font-bold text-green-700">{formatCurrency(selectedCustomer.averageOrderValue)}</p>
                        <p className="text-xs text-green-600">Ortalama Sipariş Değeri</p>
                      </div>
                      <div className="text-center col-span-2">
                        <p className="text-sm font-medium text-green-700">{formatDate(selectedCustomer.lastOrderDate)}</p>
                        <p className="text-xs text-green-600">Son Sipariş Tarihi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Sütun - Adres ve Şirket Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Adres Bilgileri */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="MapPin" size={16} className="mr-2 text-red-600" />
                      Adres Bilgileri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 text-sm">Adres:</span>
                        <p className="font-medium text-gray-900 mt-1">{selectedCustomer.address || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Şehir:</span>
                        <p className="font-medium text-gray-900 mt-1">{selectedCustomer.city || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">İlçe:</span>
                        <p className="font-medium text-gray-900 mt-1">{selectedCustomer.district || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Posta Kodu:</span>
                        <p className="font-medium text-gray-900 mt-1">{selectedCustomer.postalCode || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Şirket Bilgileri (Kurumsal hesaplar için) */}
                  {selectedCustomer.accountType === 'business' && (
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                        <Icon name="Building" size={16} className="mr-2 text-purple-600" />
                        Şirket Bilgileri
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-purple-700 text-sm">Şirket Adı:</span>
                          <p className="font-medium text-purple-900 mt-1">{selectedCustomer.companyName || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <span className="text-purple-700 text-sm">Ünvan:</span>
                          <p className="font-medium text-purple-900 mt-1">{selectedCustomer.companyTitle || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notlar */}
                  {selectedCustomer.notes && (
                    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                        <Icon name="FileText" size={16} className="mr-2 text-yellow-600" />
                        Notlar
                      </h4>
                      <p className="text-yellow-800 leading-relaxed">{selectedCustomer.notes}</p>
                    </div>
                  )}

                  {/* İşlem Butonları */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEditCustomer(selectedCustomer);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                    >
                      <Icon name="Edit" size={18} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={() => handleViewOrders(selectedCustomer)}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                    >
                      <Icon name="ShoppingBag" size={18} />
                      <span>Siparişleri Görüntüle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Müşteri Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Müşteri Ekle</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Müşteri adı soyadı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerName"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  placeholder="Müşteri e-postası"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerEmail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="text"
                  placeholder="Müşteri telefonu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerPhone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Müşteri kullanıcı adı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerUsername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  placeholder="Müşteri şifresi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerPassword"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  placeholder="Müşteri adresi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerAddress"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input
                  type="text"
                  placeholder="Müşteri şehri"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerCity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                <input
                  type="text"
                  placeholder="Müşteri ilçesi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerDistrict"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                <input
                  type="text"
                  placeholder="Müşteri posta kodu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="newCustomerPostalCode"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-300/80 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    const customerData = {
                      name: document.getElementById('newCustomerName').value,
                      email: document.getElementById('newCustomerEmail').value,
                      phone: document.getElementById('newCustomerPhone').value,
                      username: document.getElementById('newCustomerUsername').value,
                      password: document.getElementById('newCustomerPassword').value,
                      address: document.getElementById('newCustomerAddress').value,
                      city: document.getElementById('newCustomerCity').value,
                      district: document.getElementById('newCustomerDistrict').value,
                      postalCode: document.getElementById('newCustomerPostalCode').value,
                    };

                    // Müşteri verilerini doğrula
                    if (!customerData.name || !customerData.email || !customerData.phone) {
                      showWarning('Ad, e-posta ve telefon alanları zorunludur.');
                      return;
                    }

                    // Yeni müşteri ekle
                    handleAddCustomer(customerData);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Müşteri Düzenleme Modal */}
      {showEditCustomerModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Düzenle</h3>
              <button
                onClick={() => {
                  setShowEditCustomerModal(false);
                  setEditingCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <EditCustomerForm 
              customer={editingCustomer}
              onSave={handleUpdateCustomer}
              onCancel={() => {
                setShowEditCustomerModal(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Müşteri Detay Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Müşteri Durum Güncelleme Modal */}
      {showStatusModal && selectedCustomer && (
        <CustomerStatusModal
          customer={selectedCustomer}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
          onUpdateStatus={handleUpdateCustomerStatus}
        />
      )}
    </div>
  );
};

export default MusteriYonetimi;
