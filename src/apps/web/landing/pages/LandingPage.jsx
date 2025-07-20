import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';
import Login from '../../../../shared/components/auth/Login';
import LandingHeader from '../components/LandingHeader';
import Footer from '../components/Footer'; // Footer bileşenini import et

const LandingPage = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'KIRILMAZLAR',
    logo: null,
    slogan: 'Taze ve Kaliteli Ürünler'
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [popularProducts, setPopularProducts] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-50 landing-page">
      <LandingHeader 
        onLoginClick={() => setShowLoginModal(true)}
        showLoginButton={true}
      />
      <main className="w-full">
        <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '90vh', minHeight: '700px' }}>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{
              backgroundImage: `url('/assets/images/landing/anasayfa.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60"></div>
          <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col justify-center items-center px-4 sm:px-8">
            <div className="flex-grow flex items-center justify-center text-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                  Taze Meyve ve Sebzelerin
                  <span 
                    className="block text-6xl sm:text-7xl md:text-8xl mt-2.5 text-green-400"
                    style={{ 
                      textShadow: '0 0 25px rgba(52, 211, 153, 0.5), 0 0 10px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    En Güvenilir Adresi
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
                  Günlük taze ürünler, hızlı teslimat ve uygun fiyatlarla ailenizin sağlıklı beslenme ihtiyaçlarını karşılıyoruz.
                </p>
              </div>
            </div>
            {/* Özellikler Bölümü */}
            <div className="w-full pb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
                  <div className="flex items-center space-x-4">
                    <Icon name="ShoppingBag" size={40} className="text-green-300" />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">1. Ürünleri Seç</h3>
                      <p className="text-xs sm:text-sm text-white/80">İstediğiniz ürünleri keşfedin.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Icon name="ShoppingCart" size={40} className="text-green-300" />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">2. Sepete Ekle</h3>
                      <p className="text-xs sm:text-sm text-white/80">Alışveriş sepetinizi oluşturun.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Icon name="CreditCard" size={40} className="text-green-300" />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">3. Güvenle Öde</h3>
                      <p className="text-xs sm:text-sm text-white/80">Siparişi güvenle tamamlayın.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Icon name="Truck" size={40} className="text-green-300" />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">4. Kapına Gelsin</h3>
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
          <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 text-white">
            <div className="text-left">
              <h2 className="text-5xl font-serif text-white mb-6 drop-shadow-md">
                Toprağın ve Emeğin Öyküsü
              </h2>
              <div className="w-24 h-1 bg-green-400 mb-10"></div>
              <div className="space-y-6 text-lg text-white/90 leading-relaxed max-w-full text-justify">
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
    </div>
  );
};

export default LandingPage;
