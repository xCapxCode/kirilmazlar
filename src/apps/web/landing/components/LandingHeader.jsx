import React from 'react';
import Icon from '../../../../shared/components/AppIcon';

const LandingHeader = ({ onLoginClick, showLoginButton = true }) => {
  return (
<header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
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
            <nav className="hidden md:flex space-x-6">
              <a 
                href="#features" 
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                Özellikler
              </a>
              <a 
                href="#about" 
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                Hakkımızda
              </a>
              <a 
                href="#contact" 
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                İletişim
              </a>
            </nav>
            
            {showLoginButton && (
              <button
                onClick={onLoginClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Giriş Yap
              </button>
            )}

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
