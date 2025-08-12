import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../shared/components/AppIcon';
import { logger } from '../../../../utils/productionLogger';

const MobileLogin = () => {
  const navigate = useNavigate();
  const { signIn, authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(formData.email, formData.password);
      if (result.success) {
        navigate('/m/catalog');
      }
    } catch (error) {
      logger.error('Mobile login error:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pt-safe">
        <div className="px-6 pt-12 pb-8">
          <div className="text-center">
            <img
              src="/assets/images/logo/KirilmazlarLogoLandingpage.png"
              alt="Kırılmazlar"
              className="w-64 h-auto mx-auto mb-6 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h2>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800">
              E-posta veya Kullanıcı Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="User" size={20} className="text-green-500" />
              </div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-posta adresinizi girin"
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="Lock" size={20} className="text-green-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin"
                className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <Icon
                  name={showPassword ? 'EyeOff' : 'Eye'}
                  size={20}
                  className="text-green-500 hover:text-green-600"
                />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-500" />
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 mt-8"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} />
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>




      </div>
    </div>
  );
};

export default MobileLogin;
