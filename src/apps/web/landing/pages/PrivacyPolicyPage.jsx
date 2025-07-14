import React from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

const PrivacyPolicyPage = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gizlilik Politikası</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              <strong>Kırılmazlar Gıda San. Tic. Ltd. Şti.</strong> olarak, kişisel verilerinizin güvenliği ve gizliliğiniz bizim için önemlidir. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat uyarınca, web sitemizi ziyaret eden kullanıcıların kişisel verilerinin nasıl işlendiğini, saklandığını ve korunduğunu açıklamaktadır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Toplanan Veriler</h2>
            <p className="text-gray-700 mb-4">Web sitemizi ziyaret ettiğinizde, aşağıdaki kişisel verileriniz işlenebilir:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li><strong>Kimlik Bilgileri</strong>: Ad, soyad, e-posta adresi, telefon numarası (örneğin, iletişim formu aracılığıyla sağladığınız bilgiler).</li>
              <li><strong>Teknik Veriler</strong>: IP adresi, tarayıcı türü, cihaz bilgileri, ziyaret saati ve süresi, gezinti geçmişi.</li>
              <li><strong>İletişim Bilgileri</strong>: Bize sağladığınız diğer bilgiler (örneğin, talepleriniz veya yorumlarınız).</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Verilerin Toplanma Amacı</h2>
            <p className="text-gray-700 mb-4">Kişisel verileriniz aşağıdaki amaçlarla işlenir:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitemizin işlevselliğini ve kullanıcı deneyimini iyileştirmek.</li>
              <li>Taleplerinize yanıt vermek ve hizmetlerimizi sunmak.</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek.</li>
              <li>Pazarlama ve iletişim faaliyetleri (yalnızca açık rızanızla).</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Verilerin İşlenmesi ve Paylaşımı</h2>
            <p className="text-gray-700 mb-4">
              Kişisel verileriniz, KVKK'ya uygun olarak yalnızca belirtilen amaçlarla işlenir ve üçüncü taraflarla paylaşılmaz, ancak aşağıdaki durumlarda paylaşılabilir:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Yasal yükümlülükler gereği resmi makamlarla.</li>
              <li>Hizmet sağlayıcılarımızla (örneğin, hosting veya bulut servisleri), yalnızca işleme amacı doğrultusunda ve gizlilik sözleşmeleri çerçevesinde.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Veri Güvenliği</h2>
            <p className="text-gray-700 mb-4">Kişisel verilerinizin güvenliğini sağlamak için teknik ve idari önlemler almaktayız:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>SSL şifreleme teknolojisi kullanımı.</li>
              <li>Yetkisiz erişimlere karşı koruma sistemleri.</li>
              <li>Verilere erişimi yalnızca yetkili personelle sınırlama.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Haklarınız</h2>
            <p className="text-gray-700 mb-4">KVKK uyarınca, kişisel verilerinizle ilgili şu haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Verilerinizin işlenip işlenmediğini öğrenme.</li>
              <li>İşlenen veriler hakkında bilgi talep etme.</li>
              <li>Verilerin işlenme amacını ve uygun kullanılıp kullanılmadığını öğrenme.</li>
              <li>Verilerin düzeltilmesini, silinmesini veya yok edilmesini talep etme.</li>
              <li>İşlemeye itiraz etme.</li>
            </ul>
            <p className="text-gray-700 mb-6">
              Haklarınızı kullanmak için bizimle <a href="mailto:kirilmazlar_23@hotmail.com" className="text-green-600 hover:text-green-700">kirilmazlar_23@hotmail.com</a> adresinden iletişime geçebilirsiniz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. İletişim</h2>
            <p className="text-gray-700 mb-4">Gizlilik Politikası ile ilgili sorularınız için:</p>
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

export default PrivacyPolicyPage;
