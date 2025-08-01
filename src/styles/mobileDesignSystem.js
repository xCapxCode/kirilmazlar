/**
 * Mobile Design System - Kırılmazlar Panel
 * 
 * CRITICAL MOBILE REQUIREMENTS:
 * - High image quality on all devices
 * - No layout shifting or misalignment
 * - Perfect adaptation to all screen shapes
 * - Touch-friendly interactions
 * - Performance optimized
 */

export const MOBILE_BREAKPOINTS = {
  // Standard mobile breakpoints
  xs: '320px',    // iPhone SE, older Android
  sm: '375px',    // iPhone 6/7/8/X
  md: '414px',    // iPhone Plus models
  lg: '768px',    // iPad portrait
  xl: '1024px',   // iPad landscape

  // Custom breakpoints for specific devices
  iphone_se: '320px',
  iphone_standard: '375px',
  iphone_plus: '414px',
  android_small: '360px',
  android_standard: '412px'
};

export const MOBILE_DESIGN_TOKENS = {
  // Spacing system (8px grid)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  // Typography scales
  typography: {
    h1: { size: '24px', weight: '700', lineHeight: '1.2' },
    h2: { size: '20px', weight: '600', lineHeight: '1.3' },
    h3: { size: '18px', weight: '600', lineHeight: '1.4' },
    body: { size: '16px', weight: '400', lineHeight: '1.5' },
    caption: { size: '14px', weight: '400', lineHeight: '1.4' },
    small: { size: '12px', weight: '400', lineHeight: '1.3' }
  },

  // Touch targets (Apple HIG & Material Design)
  touchTargets: {
    minimum: '44px',    // iOS minimum
    recommended: '48px', // Material Design
    comfortable: '56px'  // Larger for better UX
  },

  // Border radius system
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px'
  },

  // Shadow system
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
  },

  // Color system (based on grocery app designs)
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',  // Main green
      600: '#16a34a',
      700: '#15803d'
    },
    secondary: {
      500: '#ff6b35',  // Orange accent
      600: '#ea580c'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      500: '#737373',
      700: '#404040',
      900: '#171717'
    }
  }
};

export const MOBILE_COMPONENT_SPECS = {
  // Product Card Mobile Specs
  productCard: {
    minHeight: '120px',
    maxHeight: '140px',
    imageSize: '80px',
    borderRadius: '12px',
    padding: '12px',
    gap: '8px'
  },

  // Navigation specs
  bottomNav: {
    height: '64px',
    itemSize: '44px',
    iconSize: '24px',
    fontSize: '12px'
  },

  // Button specs
  buttons: {
    primary: {
      height: '48px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600'
    },
    secondary: {
      height: '44px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    icon: {
      size: '44px',
      iconSize: '20px',
      borderRadius: '8px'
    }
  },

  // Input specs
  inputs: {
    height: '48px',
    borderRadius: '8px',
    fontSize: '16px', // Prevents zoom on iOS
    padding: '12px 16px'
  }
};

// Device-specific optimizations
export const DEVICE_OPTIMIZATIONS = {
  ios: {
    // iOS safe areas
    safeAreaTop: 'env(safe-area-inset-top)',
    safeAreaBottom: 'env(safe-area-inset-bottom)',
    // Prevent zoom on input focus
    inputFontSize: '16px',
    // iOS-specific touch behavior
    touchAction: 'manipulation'
  },

  android: {
    // Android navigation bar
    navigationBarHeight: '48px',
    // Material Design elevation
    elevation: 'box-shadow',
    // Android-specific touch feedback
    rippleEffect: true
  }
};

export default {
  MOBILE_BREAKPOINTS,
  MOBILE_DESIGN_TOKENS,
  MOBILE_COMPONENT_SPECS,
  DEVICE_OPTIMIZATIONS
};
