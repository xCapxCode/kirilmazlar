import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, User, Lock, Info, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const Login = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn(username, password);
      if (result.success && result.data && result.data.user) {
        const role = result.data.user.role;
        if (role === 'admin' || role === 'seller') {
          navigate('/seller/dashboard');
        } else if (role === 'customer') {
          navigate('/customer/catalog');
        } else {
          navigate('/');
        }
        if (onClose) onClose();
      } else {
        setError(result.error || 'Giriş başarısız oldu.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md text-white border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Giriş Yap</h2>
            <p className="text-gray-400">Hesabınızla giriş yapın</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="satici@test.com veya musteri@test.com"
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                style={{ boxShadow: 'inset 0 0 0 1000px rgba(31, 41, 55, 0.8)', color: 'white !important' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                <ArrowRight className="mr-2" size={20} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-900 bg-opacity-50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg p-4 flex items-start space-x-3">
          <Info className="text-gray-400 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-gray-200">Test Hesapları:</h4>
            <p className="text-sm text-gray-400">
              <strong>Satıcı:</strong> satici@test.com / 1234<br/>
              <strong>Müşteri:</strong> musteri@test.com / 1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
