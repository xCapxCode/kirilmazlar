import { useEffect, useState } from 'react';
import Icon from '../../../../shared/components/AppIcon';
import Login from '../../../../shared/components/auth/Login';
import Footer from '../components/Footer'; // Footer bileşenini import et
import LandingHeader from '../components/LandingHeader';

const LandingPage = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'KIRILMAZLAR',
    logo: null,
    slogan: 'Taze ve Kaliteli Ürünler'
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [popularProducts, setPopularProducts] = useState([]);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const staticPopularProducts = [
    { id: 1, name: 'Domates', image_url: '/assets/images/placeholders/product-placeholder.png', price: '20.00', unit: 'kg', rating: 4 },
    { id: 2, name: 'Karnabahar', image_url: '/assets/images/placeholders/product-placeholder.png', price: '15.00', unit: 'adet', rating: 5 },
    { id: 3, name: 'Mısır', image_url: '/assets/images/placeholders/product-placeholder.png', price: '10.00', unit: 'adet', rating: 3 },
    { id: 4, name: 'Lahana', image_url: '/assets/images/placeholders/product-placeholder.png', price: '12.00', unit: 'adet', rating: 5 },
    { id: 5, name: 'Limon', image_url: '/assets/images/placeholders/product-placeholder.png', price: '18.00', unit: 'kg', rating: 4 },
    { id: 6, name: 'Salatalık', image_url: '/assets/images/placeholders/product-placeholder.png', price: '14.00', unit: 'kg', rating: 5 },
    { id: 7, name: 'Pancar', image_url: '/assets/images/placeholders/product-placeholder.png', price: '22.00', unit: 'kg', rating: 4 },
    { id: 8, name: 'Patates', image_url: '/assets/images/placeholders/product-placeholder.png', price: '8.00', unit: 'kg', rating: 5 },
  ];

  useEffect(() => {
    const loadBusinessInfo = async () => {
      try {
        const savedBusinessInfo = localStorage.getItem('businessInfo');
        if (savedBusinessInfo) {
          const parsed = JSON.parse(savedBusinessInfo);
          setBusinessInfo({
            name: parsed.name || 'KIRILMAZLAR',
            logo: parsed.logo || null,
            slogan: parsed.slogan || 'Taze ve Kaliteli Ürünler'
          });
        }
      } catch (error) {
        console.error('Business info loading error:', error);
        setBusinessInfo({
          name: 'KIRILMAZLAR',
          logo: null,
          slogan: 'Taze ve Kaliteli Ürünler'
        });
      }
    };

    const loadPopularProducts = async () => {
      try {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          let activeProducts = products
            .filter(product => product.status === 'active' && product.stock > 0)
            .sort((a, b) => {
              const categoryOrder = { 'Meyveler': 1, 'Sebzeler': 2 };
              const aOrder = categoryOrder[a.category] || 999;
              const bOrder = categoryOrder[b.category] || 999;
              if (aOrder === bOrder) {
                return a.name.localeCompare(b.name, 'tr-TR');
              }
              return aOrder - bOrder;
            })
            .slice(0, 8);
          setPopularProducts(activeProducts || []);
        } else {
          setPopularProducts([]);
        }
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        setPopularProducts([]);
      }
    };

    loadBusinessInfo();
    loadPopularProducts();

    // Cookie consent kontrolü
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }

    const handleProductsUpdate = () => {
      loadPopularProducts();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'products') {
        loadPopularProducts();
      }
      if (e.key === 'businessInfo') {
        loadBusinessInfo();
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 landing-page">
      <LandingHeader
        onLoginClick={() => setShowLoginModal(true)}
        showLoginButton={true}
      />
      <main className="pt-28">
        {/* Hero Section */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url('/assets/images/landing/anasayfa.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60"></div>
          <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col justify-center items-center px-4 sm:px-8">
            <div className="flex-grow flex items-center justify-center text-center">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg leading-tight px-4">
                  Taze Meyve ve Sebzelerin
                  <span
                    className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2.5 text-green-400"
                    style={{
                      textShadow: '0 0 25px rgba(52, 211, 153, 0.5), 0 0 10px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    En Güvenilir Adresi
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md leading-relaxed px-4">
                  Günlük taze ürünler, hızlı teslimat ve uygun fiyatlarla ailenizin sağlıklı beslenme ihtiyaçlarını karşılıyoruz.
                </p>

                {/* Glass Giriş Butonu */}
                <div className="mb-12">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Icon name="LogIn" size={24} className="text-green-300" />
                      <span>Giriş Yap</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {/* Özellikler Bölümü */}
            <div className="w-full pb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-white">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Icon name="ShoppingBag" size={32} className="text-green-300 sm:w-10 sm:h-10" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg">1. Ürünleri Seç</h3>
                      <p className="text-xs sm:text-sm text-white/80">İstediğiniz ürünleri keşfedin.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Icon name="ShoppingCart" size={32} className="text-green-300 sm:w-10 sm:h-10" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg">2. Sepete Ekle</h3>
                      <p className="text-xs sm:text-sm text-white/80">Alışveriş sepetinizi oluşturun.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Icon name="CreditCard" size={32} className="text-green-300 sm:w-10 sm:h-10" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg">3. Güvenle Öde</h3>
                      <p className="text-xs sm:text-sm text-white/80">Siparişi güvenle tamamlayın.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Icon name="Truck" size={32} className="text-green-300 sm:w-10 sm:h-10" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg">4. Kapına Gelsin</h3>
                      <p className="text-xs sm:text-sm text-white/80">Taze ürünlerinizi teslim alın.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[600px]">
              {/* Sol Taraf: Metin İçeriği */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl lg:text-6xl font-light text-gray-600 mb-2">
                    Taze & Sağlıklı
                  </h2>
                  <h3 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                    Meyve ve Sebzeler
                  </h3>
                </div>

                <p className="text-gray-600 text-xl leading-relaxed mb-8">
                  Mağazamız size yıl boyunca her zaman taze meyve ve sebzeler sunar. Geniş bir yelpazede yüksek kaliteli taze ürünlerden satın alın.
                </p>

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-md font-semibold text-xl transition-colors duration-300 shadow-lg"
                >
                  GİRİŞ İÇİN TIKLA
                </button>
              </div>

              {/* Sağ Taraf: Resim */}
              <div className="relative">
                <img
                  src="/assets/images/landing/Trend.png"
                  alt="Taze Meyve ve Sebzeler"
                  className="w-full h-auto object-contain transform scale-110"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="relative bg-cover bg-center flex items-center"
          style={{
            backgroundImage: `url('/assets/images/landing/hakkimizda_bg.png')`,
            minHeight: '850px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-black/70 to-green-900/80"></div>
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 drop-shadow-md">
                Toprağın ve Emeğin Öyküsü
              </h2>
              <div className="w-24 h-1 bg-green-400 mb-8"></div>
              <div className="space-y-5 text-base sm:text-lg text-white/90 leading-relaxed text-left max-w-4xl">
                <p>
                  Kırılmazlar, toprağın bereketinden doğan ve nesilden nesile aktarılan bir aile geleneğinin mirasıdır. Hikayemiz, 1955'li yıllarda rahmetli dedemiz Hacı İbrahim Halil Kırılmaz'ın gametçilikle başlayan tutku dolu yolculuğuyla başladı. Toprağın sunduğu nimetleri sofralara ulaştırma aşkıyla atılan bu adımlar, 1960'lı yıllarda hallerin kurulmasıyla babamız Abdulbaki Kırılmaz ve amcamız Muhittin Kırılmaz’ın liderliğinde yeni bir döneme taşındı.
                </p>
                <p>
                  Babamızın vefatından sonra, bu değerli mirası daha da ileriye taşımak için Kırılmazlar Şirketi’ni kurduk. Bugün, Resul Kırılmaz ve Suat Kırılmaz kardeşler olarak, dedelerimizden devraldığımız dürüstlük, kalite ve güven ilkeleriyle yolumuza devam ediyoruz. Toprağın emeğiyle yetişen sebze ve meyveleri, aynı özenle müşterilerimizin sofralarına ulaştırıyoruz.
                </p>
                <p>
                  Kırılmazlar olarak, geçmişten gelen tecrübemizi modern yaklaşımlarla harmanlayarak, en taze ve kaliteli ürünleri sunma misyonunu sürdürüyoruz. Bizim için her bir müşteri, ailemizin bir parçasıdır ve bu anlayışla, toprağın öyküsünü sofralarınıza taşımaya devam ediyoruz.
                </p>
                <p>
                  Toprağa ve emeğe saygı duyarak, en kaliteli sebze ve meyveleri dürüstlükle sunmayı sürdürüyoruz. Çevremize ve toplumumuza duyarlı bir şekilde, sürdürülebilir bir gelecek için çalışıyoruz.
                </p>
                <p>
                  Gelecekte, yenilikçi yaklaşımlarımızla sektörde öncü bir konuma ulaşmayı ve toprağın bereketini global ölçekte paylaşan bir marka olmayı hedefliyoruz. Geleneklerimizden aldığımız güçle, her zaman daha iyiye ulaşmak için durmaksızın çalışacağız.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popüler Ürünler Bölümü */}
        <div className="py-12 sm:py-16 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Popüler Ürünlerimiz
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                En çok tercih edilen taze ürünlerimizi keşfedin
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {popularProducts.map((product, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <Icon name={product.icon} size={48} className="text-green-600 sm:w-16 sm:h-16" />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-green-600">{product.price}</span>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors">
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neden Bizi Tercih Etmelisiniz? */}
        <section className="py-20 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Neden Bizi Tercih Etmelisiniz?
                </h2>
                <p className="text-gray-600 mb-8">
                  Size en iyi hizmeti sunmak için özenle çalışıyoruz. İşte bizi tercih etmeniz için birkaç neden:
                </p>
                <div className="w-16 h-1 bg-green-500 mb-10"></div>

                <div className="space-y-8">
                  {/* Feature 1 */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">%100 Güvenli Ödeme</h3>
                      <p className="text-gray-600">
                        Ödemelerinizi güvenle yapabilirsiniz. Tüm işlemleriniz en yüksek güvenlik standartlarıyla korunmaktadır.
                      </p>
                    </div>
                  </div>
                  {/* Feature 2 */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Hızlı Teslimat</h3>
                      <p className="text-gray-600">
                        Siparişleriniz en kısa sürede özenle hazırlanır ve kapınıza kadar ulaştırılır.
                      </p>
                    </div>
                  </div>
                  {/* Feature 3 */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">%100 Taze ve Organik Ürünler</h3>
                      <p className="text-gray-600">
                        Sofranıza gelen her ürünün tazeliği ve doğallığı bizim için en önemli önceliktir.
                      </p>
                    </div>
                  </div>
                  {/* Feature 4 */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">İstediğiniz Zaman İptal Edin</h3>
                      <p className="text-gray-600">
                        Herhangi bir taahhüt olmadan, siparişlerinizi dilediğiniz zaman kolayca iptal edebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative flex items-center justify-center h-96 md:h-full">
                <img
                  src="/assets/images/landing/neden-bizi-tercih-etmelisiniz.png"
                  alt="Neden Bizi Tercih Etmelisiniz?"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      {showLoginModal && <Login onClose={() => setShowLoginModal(false)} />}

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-6 left-6 right-6 z-[9996] max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-2">
                  Çerez Kullanımı
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  Size daha iyi hizmet verebilmek için çerezleri kullanıyoruz. Devam ederek kabul etmiş olursunuz.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={acceptCookies}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={rejectCookies}
                    className="text-white/70 hover:text-white/90 font-medium transition-colors text-sm underline underline-offset-2"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default LandingPage;
