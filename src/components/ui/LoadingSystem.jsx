/**
 * Global Loading Spinner System
 * P2.3.1: UI/UX Enhancement - Loading states standardization
 * 
 * @description Centralized loading state management and spinner components
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import React from 'react';
import Icon from '../../shared/components/AppIcon';

/**
 * Loading spinner variants
 */
export const LOADING_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  WHITE: 'white',
  OVERLAY: 'overlay'
};

/**
 * Loading sizes
 */
export const LOADING_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'xl'
};

/**
 * Base Loading Spinner Component
 */
export const LoadingSpinner = ({
  size = LOADING_SIZES.MEDIUM,
  variant = LOADING_VARIANTS.PRIMARY,
  className = '',
  text = null,
  ...props
}) => {
  // Size mappings
  const sizeClasses = {
    [LOADING_SIZES.SMALL]: 'w-4 h-4',
    [LOADING_SIZES.MEDIUM]: 'w-6 h-6',
    [LOADING_SIZES.LARGE]: 'w-8 h-8',
    [LOADING_SIZES.EXTRA_LARGE]: 'w-12 h-12'
  };

  // Variant color mappings
  const variantClasses = {
    [LOADING_VARIANTS.PRIMARY]: 'text-primary-600',
    [LOADING_VARIANTS.SECONDARY]: 'text-gray-600',
    [LOADING_VARIANTS.WHITE]: 'text-white',
    [LOADING_VARIANTS.OVERLAY]: 'text-primary-600'
  };

  const spinnerClasses = `
    animate-spin
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <div className="flex items-center justify-center space-x-2" {...props}>
      <div className={spinnerClasses}>
        <Icon name="Loader2" className="w-full h-full" />
      </div>
      {text && (
        <span className={`text-sm ${variantClasses[variant]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({
  isVisible = false,
  text = 'Yükleniyor...',
  variant = LOADING_VARIANTS.OVERLAY
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner
          size={LOADING_SIZES.LARGE}
          variant={variant}
          text={text}
        />
      </div>
    </div>
  );
};

/**
 * Inline loading state for components
 */
export const InlineLoading = ({
  text = 'Yükleniyor...',
  size = LOADING_SIZES.SMALL,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

/**
 * Button loading state
 */
export const ButtonLoading = ({
  isLoading = false,
  children,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        relative
        ${isLoading ? 'cursor-not-allowed opacity-75' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner
            size={LOADING_SIZES.SMALL}
            variant={LOADING_VARIANTS.WHITE}
          />
        </div>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

/**
 * Card loading placeholder
 */
export const CardLoading = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner
          size={LOADING_SIZES.MEDIUM}
          text="İçerik yükleniyor..."
        />
      </div>
    </div>
  );
};

/**
 * List loading placeholder
 */
export const ListLoading = ({
  itemCount = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: itemCount }, (_, index) => (
        <CardLoading key={index} />
      ))}
    </div>
  );
};

/**
 * Page loading wrapper
 */
export const PageLoading = ({
  isLoading = false,
  children,
  loadingText = 'Sayfa yükleniyor...'
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner
            size={LOADING_SIZES.LARGE}
            text={loadingText}
          />
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Data fetching loading states
 */
export const DataLoading = ({
  type = 'generic',
  className = ''
}) => {
  const loadingTexts = {
    products: 'Ürünler yükleniyor...',
    orders: 'Siparişler yükleniyor...',
    profile: 'Profil bilgileri yükleniyor...',
    cart: 'Sepet yükleniyor...',
    generic: 'Veriler yükleniyor...'
  };

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <LoadingSpinner
        size={LOADING_SIZES.MEDIUM}
        text={loadingTexts[type] || loadingTexts.generic}
      />
    </div>
  );
};

/**
 * Loading context for global state management
 */
export const LoadingProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = React.useState({
    isVisible: false,
    text: 'Yükleniyor...'
  });

  const showLoading = React.useCallback((text = 'Yükleniyor...') => {
    setGlobalLoading({ isVisible: true, text });
  }, []);

  const hideLoading = React.useCallback(() => {
    setGlobalLoading({ isVisible: false, text: '' });
  }, []);

  const contextValue = React.useMemo(() => ({
    showLoading,
    hideLoading,
    isLoading: globalLoading.isVisible
  }), [showLoading, hideLoading, globalLoading.isVisible]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <LoadingOverlay
        isVisible={globalLoading.isVisible}
        text={globalLoading.text}
      />
    </LoadingContext.Provider>
  );
};

/**
 * Loading context
 */
export const LoadingContext = React.createContext({
  showLoading: () => { },
  hideLoading: () => { },
  isLoading: false
});

/**
 * Hook to use global loading state
 */
export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

/**
 * HOC for automatic loading states
 */
export const withLoading = (WrappedComponent, loadingProps = {}) => {
  return function LoadingWrapper(props) {
    const { isLoading, ...restProps } = props;

    if (isLoading) {
      return <DataLoading {...loadingProps} />;
    }

    return <WrappedComponent {...restProps} />;
  };
};

export default {
  LoadingSpinner,
  LoadingOverlay,
  InlineLoading,
  ButtonLoading,
  CardLoading,
  ListLoading,
  PageLoading,
  DataLoading,
  LoadingProvider,
  useLoading,
  withLoading,
  LOADING_VARIANTS,
  LOADING_SIZES
};
