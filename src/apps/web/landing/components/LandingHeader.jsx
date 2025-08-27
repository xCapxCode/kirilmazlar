import Icon from '../../../../shared/components/AppIcon';

const LandingHeader = ({ onLoginClick, showLoginButton = true }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9995] bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">

          {/* Logo - Sol taraf */}
          <div className="flex items-center">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="KIRILMAZLAR"
              className="h-16 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Navigasyon ve Giriş - Sağ taraf */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#about"
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                Hakkımızda
              </a>
              <a
                href="#footer"
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                İletişim
              </a>
              <a
                href="https://wa.me/905327307920"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-white/90 hover:text-green-400 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.528L.057 24zM7.327 21.188l.431.26.904.536c1.521.906 3.212 1.381 4.956 1.382 5.461.002 9.908-4.445 9.91-9.908.002-2.64-1.023-5.123-2.848-6.948-1.825-1.825-4.306-2.847-6.946-2.847-5.462 0-9.909 4.446-9.911 9.909 0 1.802.494 3.558 1.428 5.095l.348.566-.924 3.385 3.515-2.071z" />
                </svg>
                +90 532 730 79 20
              </a>
            </nav>



            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <Icon
                name="Menu"
                size={24}
                className="text-white"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
