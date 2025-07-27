/**
 * Mobile Responsiveness Audit & Enhancement
 * P2.3.5: UI/UX Enhancement - Mobile responsiveness final touches
 * 
 * @description Comprehensive mobile responsiveness improvements
 * @author KırılmazlarPanel Development Team  
 * @date July 24, 2025
 */

import { useEffect } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * Responsive Container Component
 */
export const ResponsiveContainer = ({
  children,
  className = '',
  mobileClass = '',
  tabletClass = '',
  desktopClass = ''
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getResponsiveClass = () => {
    if (isMobile && mobileClass) return mobileClass;
    if (isTablet && tabletClass) return tabletClass;
    if (isDesktop && desktopClass) return desktopClass;
    return '';
  };

  return (
    <div className={`${className} ${getResponsiveClass()}`.trim()}>
      {children}
    </div>
  );
};

/**
 * Responsive Grid Component
 */
export const ResponsiveGrid = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = ''
}) => {
  const gridClass = `
    grid gap-${gap}
    grid-cols-${cols.mobile} 
    md:grid-cols-${cols.tablet} 
    lg:grid-cols-${cols.desktop}
    ${className}
  `.trim();

  return (
    <div className={gridClass}>
      {children}
    </div>
  );
};

/**
 * Mobile Navigation Component
 */
export const MobileNav = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile menu */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive Table Component
 */
export const ResponsiveTable = ({
  headers,
  data,
  renderRow,
  mobileCardRender,
  className = ''
}) => {
  const { isMobile } = useBreakpoint();

  if (isMobile && mobileCardRender) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item, index) => mobileCardRender(item, index))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Touch-Friendly Button Component
 */
export const TouchButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const baseClass = `
    inline-flex items-center justify-center
    font-medium rounded-lg transition-colors
    touch-manipulation select-none
    active:scale-95 transform transition-transform
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[52px]'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClass}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
};

/**
 * Responsive Modal Component
 */
export const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium'
}) => {
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    small: isMobile ? 'max-w-sm' : 'max-w-md',
    medium: isMobile ? 'max-w-full mx-4' : 'max-w-lg',
    large: isMobile ? 'max-w-full mx-4' : 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`
          relative bg-white rounded-lg shadow-xl w-full
          ${sizes[size]}
          ${isMobile ? 'min-h-[50vh]' : ''}
        `.trim()}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className={`p-4 ${isMobile ? 'pb-6' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive Image Component
 */
export const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = {
    mobile: 'w-full h-48',
    tablet: 'w-full h-64',
    desktop: 'w-full h-80'
  }
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getSizeClass = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.desktop;
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`
        object-cover rounded-lg
        ${getSizeClass()}
        ${className}
      `.trim()}
      loading="lazy"
    />
  );
};

/**
 * Responsive Spacing Component
 */
export const ResponsiveSpacing = ({
  mobile = 4,
  tablet = 6,
  desktop = 8,
  children
}) => {
  return (
    <div className={`
      space-y-${mobile}
      md:space-y-${tablet}
      lg:space-y-${desktop}
    `.trim()}>
      {children}
    </div>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  MobileNav,
  ResponsiveTable,
  TouchButton,
  ResponsiveModal,
  ResponsiveImage,
  ResponsiveSpacing
};
