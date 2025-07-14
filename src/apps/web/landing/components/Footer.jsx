import React, { useState } from 'react';
import PolicyModal from './PolicyModal';
import { PrivacyPolicyContent, TermsOfServiceContent, CookiePolicyContent } from './PolicyContent';

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-green-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-green-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-green-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.528L.057 24zM7.327 21.188l.431.26.904.536c1.521.906 3.212 1.381 4.956 1.382 5.461.002 9.908-4.445 9.91-9.908.002-2.64-1.023-5.123-2.848-6.948-1.825-1.825-4.306-2.847-6.946-2.847-5.462 0-9.909 4.446-9.911 9.909 0 1.802.494 3.558 1.428 5.095l.348.566-.924 3.385 3.515-2.071z" />
    </svg>
);

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
<footer className="relative text-white w-full overflow-hidden h-[500px]">
      {/* Arka Plan Görseli ve Kaplama */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("/assets/images/landing/en-alt-kisim.jpg")`,
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* İçerik */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8 h-full flex flex-col justify-center">
        {/* Üst Kısım */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          
          {/* Sol Taraf: Logo */}
          <div className="flex items-center justify-center md:justify-start">
            <img 
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png" 
              alt="Kırılmazlar Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Orta Taraf: Firma Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Firma Bilgileri</h3>
            <p className="text-gray-300 mb-2 text-sm">KIRILMAZLAR Gıda.San.Tic.Ltd.Şti.</p>
            <p className="text-gray-300 text-sm">Karşıyaka Mahallesi Ömer Seyfettin Caddesi No: 8 Hal içi 59-60 ELAZIĞ</p>
          </div>

          {/* Sağ Taraf: İletişim */}
          <div className="ml-8">
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:kirilmazlar_23@hotmail.com" className="flex items-center group text-gray-300 hover:text-white">
                  <MailIcon />
                  <span>kirilmazlar_23@hotmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+904242240800" className="flex items-center group text-gray-300 hover:text-white">
                  <PhoneIcon />
                  <span>+90 424 224 08 00</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/905327307920" target="_blank" rel="noopener noreferrer" className="flex items-center group text-gray-300 hover:text-white">
                  <WhatsAppIcon />
                  <span>+90 532 730 79 20</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
          
      </div>
      
      {/* Alt Bant - Tam sayfa genişliğinde ve en altta */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 relative z-30">
          <p className="text-center md:text-left mb-2 md:mb-0">
            © 2025 KIRILMAZLAR - Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-4">
            <span>Tasarım: OfisNetBilgisayar</span>
            <button 
              onClick={() => openModal('privacy')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Gizlilik Politikası
            </button>
            <button 
              onClick={() => openModal('terms')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kullanım Koşulları
            </button>
            <button 
              onClick={() => openModal('cookie')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Çerez Politikası
            </button>
          </div>
        </div>
      </div>
    </footer>

    {/* Policy Modals */}
    <PolicyModal
      isOpen={activeModal === 'privacy'}
      onClose={closeModal}
      title="Gizlilik Politikası"
      content={<PrivacyPolicyContent />}
    />
    
    <PolicyModal
      isOpen={activeModal === 'terms'}
      onClose={closeModal}
      title="Kullanım Koşulları"
      content={<TermsOfServiceContent />}
    />
    
    <PolicyModal
      isOpen={activeModal === 'cookie'}
      onClose={closeModal}
      title="Çerez Politikası"
      content={<CookiePolicyContent />}
    />
    </>
  );
};

export default Footer;
