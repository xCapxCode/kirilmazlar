import React from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

const CookiePolicyPage = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Çerez Politikası</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              <strong>Kırılmazlar Gıda San. Tic. Ltd. Şti.</strong> olarak, web sitemizde çerezler kullanarak kullanıcı deneyimini iyileştirmeyi ve hizmetlerimizi geliştirmeyi amaçlıyoruz. Bu Çerez Politikası, çerezlerin ne olduğunu, nasıl kullanıldığını ve seçeneklerinizi açıklamaktadır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Çerez Nedir?</h2>
            <p className="text-gray-700 mb-6">
              Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, siteyi tekrar ziyaret ettiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza olanak tanır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Kullandığımız Çerez Türleri</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li><strong>Zorunlu Çerezler</strong>: Web sitemizin temel işlevselliği için gereklidir (örneğin, oturum yönetimi).</li>
              <li><strong>Analitik Çerezler</strong>: Kullanıcı davranışlarını analiz ederek site performansını iyileştirmek için kullanılır.</li>
              <li><strong>Pazarlama Çerezleri</strong>: Reklam ve kişiselleştirilmiş içerik sunmak için kullanılır (yalnızca açık rızanızla).</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Çerezlerin Kullanım Amacı</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Web sitemizin işlevselliğini ve performansını artırmak.</li>
              <li>Kullanıcı tercihlerini hatırlamak.</li>
              <li>Ziyaretçi trafiğini analiz ederek hizmetlerimizi geliştirmek.</li>
              <li>KVKK ve ilgili mevzuata uygun olarak pazarlama faaliyetleri yürütmek.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Çerezleri Yönetme</h2>
            <p className="text-gray-700 mb-6">
              Tarayıcı ayarlarınızı değiştirerek çerezleri kabul etmeyi reddedebilir veya silebilirsiniz. Ancak, bu durumda web sitemizin bazı işlevleri düzgün çalışmayabilir. Çerez tercihlerinizi yönetmek için tarayıcınızın "Ayarlar" veya "Gizlilik" bölümünü kontrol edebilirsiniz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Üçüncü Taraf Çerezleri</h2>
            <p className="text-gray-700 mb-6">
              Web sitemizde Google Analytics gibi üçüncü taraf hizmetler kullanılabilir. Bu hizmetler, kendi çerez politikalarına tabidir ve bu çerezler hakkında bilgi almak için ilgili hizmetlerin gizlilik politikalarını inceleyebilirsiniz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. İletişim</h2>
            <p className="text-gray-700 mb-4">Çerez Politikası ile ilgili sorularınız için:</p>
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

export default CookiePolicyPage;
