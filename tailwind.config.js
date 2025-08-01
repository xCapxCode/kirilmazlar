/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      // Pixel-perfect mobile breakpoints
      'xs': '320px',      // iPhone SE, small phones
      'sm': '375px',      // iPhone 12/13/14 standard
      'md': '414px',      // iPhone Plus, large phones
      'lg': '768px',      // iPad mini
      'xl': '1024px',     // iPad, small tablets
      '2xl': '1536px',    // Desktop

      // High-precision device targeting
      'iphone-se': '320px',
      'iphone-12': '375px',
      'iphone-plus': '414px',
      'tablet-sm': '768px',
      'tablet': '1024px',
      'desktop': '1280px'
    },
    extend: {
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',   // 72px - Perfect for mobile touch targets
        '22': '5.5rem',   // 88px - Extra large touch targets
      },

      // High-DPI optimized colors
      colors: {
        white: '#FFFFFF',
        surface: 'var(--color-surface, #FFFFFF)',

        // Mobile-first green palette (high contrast)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Main brand green
          600: '#16a34a',  // Touch target green
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6b35',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        }
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',   // 72px - Perfect for mobile touch targets
        '22': '5.5rem',   // 88px - Extra large touch targets
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px'
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px'
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.3' }],
        'sm': ['14px', { lineHeight: '1.4' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['18px', { lineHeight: '1.4' }],
        'xl': ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'pill': '999px'
      },
      boxShadow: {
        'mobile-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'mobile-md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'mobile-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'mobile-xl': '0 20px 25px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('autofill', '&:-webkit-autofill');
    },
    function ({ addUtilities }) {
      addUtilities({
        '.touch-manipulation': {
          'touch-action': 'manipulation'
        },
        '.safe-area-inset': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)'
        },
        '.text-no-zoom': {
          'font-size': '16px' // Prevents iOS zoom on input focus
        }
      })
    }
  ],
}
