import React from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader showLoginButton={false} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Sayfaya Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Kullanım Koşulları</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              <strong>Kırılmazlar Gıda San. Tic. Ltd. Şti.</strong> web sitesini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. Lütfen bu koşulları dikkatlice okuyunuz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Genel Hükümler</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitemiz, Kırılmazlar Gıda San. Tic. Ltd. Şti.'nin ürün ve hizmetlerini tanıtmak amacıyla kullanılmaktadır.</li>
              <li>Web sitesini kullanırken Türkiye Cumhuriyeti mevzuatına ve genel ahlak kurallarına uymayı kabul edersiniz.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Fikri Mülkiyet</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitesindeki tüm içerik (metinler, görseller, logolar, tasarımlar) Kırılmazlar Gıda San. Tic. Ltd. Şti.'ye aittir ve 5846 sayılı Fikri ve Sanat Eserleri Kanunu ile korunmaktadır.</li>
              <li>İçerikler, yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz veya dağıtılamaz.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Kullanıcı Yükümlülükleri</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitesini yasa dışı amaçlarla kullanmamayı taahhüt edersiniz.</li>
              <li>Siteye zarar verebilecek veya işlevselliğini bozabilecek eylemlerden (örneğin, kötü amaçlı yazılım yükleme) kaçınırsınız.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Sorumluluğun Sınırlandırılması</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitemizdeki bilgilerin doğruluğunu sağlamak için çaba göstersek de, bilgilerde hatalar veya eksiklikler olabilir. Bu bilgiler "olduğu gibi" sunulur ve bunlara dayanılarak yapılan işlemlerden sorumluluk kabul edilmez.</li>
              <li>Web sitesinin kesintisiz veya hatasız çalışacağı garanti edilmez.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Bağlantılar</h2>
            <p className="text-gray-700 mb-6">
              Web sitemizde üçüncü taraf web sitelerine bağlantılar bulunabilir. Bu sitelerin içeriğinden veya gizlilik uygulamalarından Kırılmazlar Gıda San. Tic. Ltd. Şti. sorumlu değildir.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Değişiklikler</h2>
            <p className="text-gray-700 mb-6">
              Bu Kullanım Koşulları, önceden bildirim yapılmaksızın güncellenebilir. Güncellemeleri takip etmek kullanıcının sorumluluğundadır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. İletişim</h2>
            <p className="text-gray-700 mb-4">Kullanım Koşulları ile ilgili sorularınız için:</p>
            <ul className="list-none mb-6 text-gray-700">
              <li><strong>Adres</strong>: Karşıyaka Mahallesi Ömer Seyfettin Caddesi No: 8 Hal içi 59-60 ELAZIĞ</li>
              <li><strong>E-posta</strong>: <a href="mailto:kirilmazlar_23@hotmail.com" className="text-green-600 hover:text-green-700">kirilmazlar_23@hotmail.com</a></li>
              <li><strong>Telefon</strong>: <a href="tel:+904242240800" className="text-green-600 hover:text-green-700">+90 424 224 08 00</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
