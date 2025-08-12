import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../shared/components/AppIcon';

const MobileLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Eğer giriş yapmışsa catalog'a yönlendir
  useEffect(() => {
    if (user) {
      navigate('/m/catalog', { replace: true });
    }
  }, [user, navigate]);

  // Auto-slide for hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      title: "Taze Meyve ve Sebzelerin",
      subtitle: "En Güvenilir Adresi",
      description: "Günlük taze ürünler, hızlı teslimat ve uygun fiyatlarla",
      gradient: "from-green-600 via-emerald-500 to-teal-500"
    },
    {
      title: "Taze Ürünlerle",
      subtitle: "Sağlıklı Yaşam",
      description: "Doğal ve taze ürünlerle ailenizin sağlığını koruyun",
      gradient: "from-emerald-600 via-green-500 to-lime-500"
    },
    {
      title: "Hızlı Teslimatla",
      subtitle: "Kapınızda Tazelik",
      description: "Siparişiniz 30 dakikada kapınızda, taze ve güvenli",
      gradient: "from-teal-600 via-cyan-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Hero Section with Carousel */}
      <section className="relative min-h-screen flex flex-col justify-start overflow-hidden pt-4 sm:pt-8">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} transition-all duration-1000`}></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-8 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-6 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 right-12 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 text-center text-white w-full max-w-sm mx-auto">
          {/* Logo */}
          <img
            src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
            alt="Kırılmazlar"
            className="w-72 sm:w-80 md:w-96 h-auto mx-auto mb-4 sm:mb-6 drop-shadow-2xl max-w-full"
          />

          {/* Dynamic Hero Text */}
          <div className="mb-6 sm:mb-8 transition-all duration-500">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 drop-shadow-lg leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 text-white drop-shadow-xl">
              {heroSlides[currentSlide].subtitle}
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed px-2">
              {heroSlides[currentSlide].description}
            </p>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>

          {/* Modern Action Buttons */}
          <div className="space-y-3 mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/m/login')}
              className="w-full bg-white text-green-600 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-2xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
            >
              <Icon name="LogIn" size={20} />
              <span>Giriş Yap</span>
            </button>

            <button
              onClick={() => navigate('/m/catalog')}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base border border-white/30 flex items-center justify-center space-x-3 hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Icon name="ShoppingBag" size={20} />
              <span>Ürünleri İncele</span>
            </button>
          </div>

          {/* Quick Features Grid */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Zap" size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-xs text-white">Hızlı Teslimat</h3>
                <p className="text-xs text-white/70">30 dakikada</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Shield" size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-xs text-white">Güvenli Ödeme</h3>
                <p className="text-xs text-white/70">%100 güvenli</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Leaf" size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-xs text-white">Doğal Ürünler</h3>
                <p className="text-xs text-white/70">%100 taze</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Heart" size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-xs text-white">Taze Kalite</h3>
                <p className="text-xs text-white/70">Günlük taze</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center items-start pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Modern Product Showcase */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 px-4 py-2 rounded-full mb-4">
              <Icon name="Leaf" size={16} className="text-green-600 mr-2" />
              <span className="text-green-600 font-medium text-sm">Taze & Doğal</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Doğanın En Taze
              <span className="block text-green-600">Ürünleri</span>
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
              Günlük hasat edilen taze meyve ve sebzeler, doğrudan sofranızda
            </p>
          </div>

          {/* Product Categories Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <img
                  src="/assets/images/products/vegetables.jpg"
                  alt="Sebzeler"
                  className="w-10 h-10 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="text-xl hidden">🥬</span>
              </div>
              <h3 className="font-bold text-gray-900 text-center text-sm mb-1">Taze Sebzeler</h3>
              <p className="text-gray-600 text-xs text-center">Günlük hasat</p>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <img
                  src="/assets/images/products/fruits.jpg"
                  alt="Meyveler"
                  className="w-10 h-10 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="text-xl hidden">🍎</span>
              </div>
              <h3 className="font-bold text-gray-900 text-center text-sm mb-1">Taze Meyveler</h3>
              <p className="text-gray-600 text-xs text-center">Doğal tatlar</p>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <img
                  src="/assets/images/products/bulk.jpg"
                  alt="Kasalı Ürünler"
                  className="w-10 h-10 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="text-xl hidden">📦</span>
              </div>
              <h3 className="font-bold text-gray-900 text-center text-sm mb-1">Kasalı Ürünler</h3>
              <p className="text-gray-600 text-xs text-center">Toptan fiyatlar</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">500+</div>
                <div className="text-xs text-gray-600">Çeşit Ürün</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">30dk</div>
                <div className="text-xs text-gray-600">Hızlı Teslimat</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">%100</div>
                <div className="text-xs text-gray-600">Taze Garanti</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/m/catalog')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center space-x-3 mx-auto hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Icon name="ShoppingBag" size={20} />
              <span>Ürünleri Keşfet</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modern Story Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative px-6 text-white">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Icon name="Heart" size={16} className="text-white mr-2" />
              <span className="text-white font-medium text-sm">Hikayemiz</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Toprağın ve Emeğin
              <span className="block">Öyküsü</span>
            </h2>
          </div>

          {/* Story Content */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 mb-8 shadow-2xl">
            <div className="space-y-4 text-sm text-white leading-relaxed">
              <p className="text-center font-medium text-white/95 mb-4">
                Kırılmazlar, toprağın bereketinden doğan ve nesilden nesile aktarılan bir aile geleneğinin mirasıdır.
              </p>

              <div className="space-y-3 text-white/90">
                <p>
                  <span className="font-semibold text-green-300">1955'li yıllarda</span> rahmetli dedemiz Hacı İbrahim Halil Kırılmaz'ın gametçilikle başlayan tutku dolu yolculuğuyla başladı. Toprağın sunduğu nimetleri sofralara ulaştırma aşkıyla atılan bu adımlar, 1960'lı yıllarda hallerin kurulmasıyla babamız Abdulbaki Kırılmaz ve amcamız Muhittin Kırılmaz'ın liderliğinde yeni bir döneme taşındı.
                </p>

                <p>
                  Babamızın vefatından sonra, bu değerli mirası daha da ileriye taşımak için <span className="font-semibold text-green-300">Kırılmazlar Şirketi'ni kurduk</span>. Bugün, Resul Kırılmaz ve Suat Kırılmaz kardeşler olarak, dedelerimizden devraldığımız dürüstlük, kalite ve güven ilkeleriyle yolumuza devam ediyoruz.
                </p>

                <p>
                  Kırılmazlar olarak, geçmişten gelen tecrübemizi modern yaklaşımlarla harmanlayarak, <span className="font-semibold text-green-300">en taze ve kaliteli ürünleri sunma</span> misyonunu sürdürüyoruz. Bizim için her bir müşteri, ailemizin bir parçasıdır ve bu anlayışla, toprağın öyküsünü sofralarınıza taşımaya devam ediyoruz.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <h3 className="font-bold text-white text-center mb-4">Değerlerimiz</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Shield" size={20} className="text-white" />
                </div>
                <span className="text-white/90 text-xs font-medium">Güven</span>
              </div>
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Star" size={20} className="text-white" />
                </div>
                <span className="text-white/90 text-xs font-medium">Kalite</span>
              </div>
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Heart" size={20} className="text-white" />
                </div>
                <span className="text-white/90 text-xs font-medium">Aile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 px-4 py-2 rounded-full mb-4">
              <Icon name="Star" size={16} className="text-green-600 mr-2" />
              <span className="text-green-600 font-medium text-sm">Neden Kırılmazlar?</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Farkımızı
              <span className="block text-green-600">Keşfedin</span>
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
              Size en iyi hizmeti sunmak için özenle çalışıyoruz
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-4 mb-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Shield" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Güvenli Ödeme</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Tüm ödemeleriniz SSL şifreleme ile korunur. Kredi kartı bilgileriniz güvende.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Zap" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Hızlı Teslimat</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Siparişiniz 30 dakikada hazırlanır, 1 saat içinde kapınızda.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Leaf" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Doğal Ürünler</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Pestisitsiz, doğal yöntemlerle yetiştirilmiş taze ürünler.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="RotateCcw" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kolay İptal</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Siparişinizi dilediğiniz zaman kolayca iptal edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900 mb-2">Müşteri Memnuniyeti</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">4.9</div>
                <div className="flex justify-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" size={12} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-gray-600">Müşteri Puanı</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">10K+</div>
                <div className="text-xs text-gray-600">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">99%</div>
                <div className="text-xs text-gray-600">Memnuniyet</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/m/login')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center space-x-3 mx-auto hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Icon name="LogIn" size={20} />
              <span>Hemen Başla</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-8">
        <div className="px-6">
          {/* Logo and Company */}
          <div className="text-center mb-6">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="w-40 h-auto mx-auto mb-3 drop-shadow-lg"
            />
            <h3 className="text-xl font-bold text-white mb-1">Kırılmazlar</h3>
            <p className="text-green-400 text-sm font-medium mb-2">Taze gıda, mutlu yaşam</p>
            <p className="text-gray-300 text-xs">KIRILMAZLAR Gıda.San.Tic.Ltd.Şti.</p>
            <p className="text-gray-400 text-xs">Elazığ Hal İçi Meyve Sebze Komisyoncusu</p>
          </div>

          {/* Contact Grid */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-5 mb-6 border border-white/10">
            <h4 className="font-bold text-white mb-4 text-center text-sm">İletişim Bilgileri</h4>
            <div className="space-y-3">
              <a href="tel:+904242240800" className="flex items-center justify-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                  <Icon name="Phone" size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Telefon</div>
                  <div className="text-gray-300 text-xs">+90 424 224 08 00</div>
                </div>
              </a>

              <a href="https://wa.me/905327307920" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                  <Icon name="MessageCircle" size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">WhatsApp</div>
                  <div className="text-gray-300 text-xs">+90 532 730 79 20</div>
                </div>
              </a>

              <a href="mailto:kirilmazlar_23@hotmail.com" className="flex items-center justify-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                  <Icon name="Mail" size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">E-posta</div>
                  <div className="text-gray-300 text-xs">kirilmazlar_23@hotmail.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-5 mb-6 border border-white/10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center mt-1">
                <Icon name="MapPin" size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1">Adres</div>
                <div className="text-gray-300 text-xs leading-relaxed">
                  Karşıyaka Mahallesi Ömer Seyfettin Caddesi No: 8<br />
                  Hal içi 59-60 ELAZIĞ
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => navigate('/m/login')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
            >
              <Icon name="LogIn" size={16} />
              <span>Giriş Yap</span>
            </button>
            <button
              onClick={() => navigate('/m/catalog')}
              className="bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-2xl font-semibold text-sm border border-white/20 flex items-center justify-center space-x-2 hover:bg-white/20 transition-all"
            >
              <Icon name="ShoppingBag" size={16} />
              <span>Ürünler</span>
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs mb-1">
              © 2025 Kırılmazlar Gıda. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-500 text-xs">
              Mobil uygulama ile taze alışveriş deneyimi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MobileLanding;