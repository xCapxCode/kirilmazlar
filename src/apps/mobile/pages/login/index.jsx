import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../shared/components/AppIcon';

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

  const handleTestLogin = (email, password) => {
    setFormData({ email, password });
    // Auto submit after a brief delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => { } });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pt-safe">
        <div className="px-6 pt-8 pb-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Store" size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Kırılmazlar Mobile</h1>
            <p className="text-green-100 text-sm">Hesabınızla giriş yapın</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 bg-white rounded-t-3xl mt-8 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="uner@test.com"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full pl-12 pr-12 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
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
                  className="text-gray-400"
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

        {/* Test Accounts */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-4">Test Hesapları:</p>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleTestLogin('uner@test.com', '1234')}
              className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Satıcı</p>
                  <p className="text-xs text-blue-600">uner@test.com / 1234</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTestLogin('musteri@test.com', '1234')}
              className="bg-green-50 border border-green-200 rounded-xl p-3 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Icon name="ShoppingBag" size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Müşteri</p>
                  <p className="text-xs text-green-600">musteri@test.com / 1234</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Kırılmazlar Mobile v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
