import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../AppIcon';

const Signup = ({ onClose, onSwitchToLogin }) => {
  const { signUp, authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'All fields are required';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    
    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        role: formData.role
      });
      
      if (result?.success) {
        alert('Account created successfully! Please check your email to verify your account.');
        onClose?.();
      }
    } catch (error) {
      logger.info('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl border border-border shadow-soft max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Create Account</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-smooth"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {authError && (
            <div className="mb-4 bg-error/10 border border-error/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <p className="text-sm text-error">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'role', value: 'customer' } })}
                  className={`p-3 border rounded-lg text-left transition-smooth ${
                    formData.role === 'customer' ?'border-primary bg-primary/5 text-primary' :'border-border text-text-secondary hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="ShoppingBag" size={18} />
                    <span className="font-medium">Customer</span>
                  </div>
                  <p className="text-xs mt-1">Browse and buy products</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'role', value: 'seller' } })}
                  className={`p-3 border rounded-lg text-left transition-smooth ${
                    formData.role === 'seller' ?'border-primary bg-primary/5 text-primary' :'border-border text-text-secondary hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Store" size={18} />
                    <span className="font-medium">Seller</span>
                  </div>
                  <p className="text-xs mt-1">Sell your products</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                required
                className="mt-0.5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <button type="button" className="text-primary hover:text-primary/80">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary hover:text-primary/80">
                  Privacy Policy
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-text-secondary text-center">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>

          {formData.role === 'seller' && (
            <div className="mt-4 bg-accent/5 border border-accent/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent mb-1">Seller Benefits</h4>
                  <ul className="text-sm text-accent/80 space-y-1">
                    <li>• Free trial with 100 credits</li>
                    <li>• Advanced analytics dashboard</li>
                    <li>• Priority customer support</li>
                    <li>• Custom branding options</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
