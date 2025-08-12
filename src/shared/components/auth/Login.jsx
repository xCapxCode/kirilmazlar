import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import storage from '../../../core/storage';
import { logger } from '../../../utils/productionLogger.js';
import Icon from '../AppIcon';

// Test kullanıcıları kaldırıldı - Mevcut kullanıcı sistemi kullanılıyor

const Login = ({ onClose, isMobile = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Test kullanıcı yükleme kaldırıldı - Mevcut kullanıcı sistemi kullanılıyor

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Debug: Kullanıcıları kontrol et
      const users = JSON.parse(localStorage.getItem('kirilmazlar_users') || '[]');
      console.log('🔍 Mevcut kullanıcılar (kirilmazlar_users):', users);
      console.log('🔍 Giriş denemesi:', { username, password });

      // Alternatif storage key'leri de kontrol et
      const usersAlt = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('🔍 Alternatif users:', usersAlt);

      // Storage service'i kullanarak kontrol et
      console.log('🔍 Storage service users:', storage?.get ? storage.get('users', []) : 'storage not available');

      const result = await signIn(username, password);
      console.log('🔍 SignIn sonucu:', result);

      if (result.success && result.data && result.data.user) {
        const role = result.data.user.role;
        logger.debug('🔄 Kullanıcı rolü:', role);
        if (role === 'admin' || role === 'seller' || role === 'owner') {
          logger.debug('🏃‍♂️ Seller dashboard\'a yönlendiriliyor...');
          navigate(isMobile ? '/ms/dashboard' : '/seller/dashboard');
        } else if (role === 'customer') {
          logger.debug('🏃‍♂️ Customer catalog\'a yönlendiriliyor...');
          navigate(isMobile ? '/m/catalog' : '/customer/catalog');
        } else {
          logger.debug('🏃‍♂️ Ana sayfaya yönlendiriliyor...');
          navigate('/');
        }
        if (onClose) onClose();
      } else {
        setError(result.error || 'Giriş başarısız oldu.');
      }
    } catch (err) {
      console.error('🔍 Login hatası:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Test hesapları kaldırıldı - Gerçek kullanıcı oluşturma sistemi kullanılıyor

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Mobile Header with Kırılmazlar Logo */}
        <div className="flex-shrink-0 pt-safe">
          <div className="px-6 pt-16 pb-8">
            <div className="text-center">
              {/* Kırılmazlar Logo */}
              <div className="flex items-center justify-center mx-auto mb-6">
                <img
                  src="/assets/images/logo/KirilmazlarLogo.png"
                  alt="Kırılmazlar"
                  className="h-20 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center hidden">
                  <span className="text-2xl font-bold text-green-600">K</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kırılmazlar</h1>
              <p className="text-gray-500 text-base">Taze gıda, hızlı teslimat</p>
            </div>
          </div>
        </div>

        {/* Mobile Login Form */}
        <div className="flex-1 px-6 py-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kullanıcı Adı veya Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="User" size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@test.com"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="Lock" size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-12 pr-12 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <Icon name="ArrowRight" size={20} />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>






        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Kırılmazlar Mobile v1.0.0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md text-white border border-gray-700">
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/assets/images/logo/KirilmazlarLogo.png"
                alt="Kırılmazlar"
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center hidden">
                <span className="text-2xl font-bold text-green-600">K</span>
              </div>
            </div>
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Giriş Yap</h2>
              <p className="text-gray-400 text-sm">Hesabınızla giriş yapın</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors ml-4">
            <Icon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Kullanıcı Adı veya Email
            </label>
            <div className="relative">
              <Icon name="User" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adı veya email adresinizi girin"
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                style={{ boxShadow: 'inset 0 0 0 1000px rgba(31, 41, 55, 0.8)', color: 'white !important' }}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Icon name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-600 rounded-lg py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                style={{ boxShadow: 'inset 0 0 0 1000px rgba(31, 41, 55, 0.8)', color: 'white !important' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Beni hatırla
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Icon name="ArrowRight" className="mr-2" size={20} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-900 bg-opacity-50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center">
            <Icon name="AlertCircle" className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg p-4 flex items-start space-x-3">
          <Icon name="Info" className="text-gray-400 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-gray-200">Bilgi:</h4>
            <p className="text-sm text-gray-400">
              Hesap oluşturmak için lütfen yönetici ile iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
