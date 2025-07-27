/**
 * Responsive Breakpoint Hook
 * P2.3.5: UI/UX Enhancement - Mobile responsiveness utilities
 * 
 * @description Custom hook for responsive breakpoint detection
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */

import { useEffect, useState } from 'react';
import logger from '../utils/productionLogger';

/**
 * Breakpoint definitions (matching Tailwind CSS)
 */
export const BREAKPOINTS = {
  sm: 640,   // mobile-large/tablet-small
  md: 768,   // tablet
  lg: 1024,  // desktop
  xl: 1280,  // desktop-large
  '2xl': 1536 // desktop-extra-large
};

/**
 * Custom hook for responsive breakpoint detection
 */
export const useBreakpoint = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      setWindowSize(newSize);

      logger.debug('📱 Viewport Changed:', {
        width: newSize.width,
        height: newSize.height,
        breakpoint: getCurrentBreakpoint(newSize.width)
      });
    }

    // Debounce resize events
    let timeoutId;
    function debouncedHandleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    }

    window.addEventListener('resize', debouncedHandleResize);

    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const getCurrentBreakpoint = (width = windowSize.width) => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  const breakpoint = getCurrentBreakpoint();

  return {
    // Viewport dimensions
    width: windowSize.width,
    height: windowSize.height,

    // Current breakpoint
    breakpoint,

    // Boolean helpers
    isMobile: windowSize.width < BREAKPOINTS.md,
    isTablet: windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg,
    isDesktop: windowSize.width >= BREAKPOINTS.lg,
    isLargeDesktop: windowSize.width >= BREAKPOINTS.xl,

    // Specific breakpoint checks
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',

    // Utility functions
    isBreakpoint: (bp) => breakpoint === bp,
    isAbove: (bp) => windowSize.width >= BREAKPOINTS[bp],
    isBelow: (bp) => windowSize.width < BREAKPOINTS[bp],
    isBetween: (minBp, maxBp) =>
      windowSize.width >= BREAKPOINTS[minBp] && windowSize.width < BREAKPOINTS[maxBp]
  };
};

/**
 * Hook for detecting device orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleOrientationChange() {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);

      logger.debug('🔄 Orientation Changed:', newOrientation);
    }

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};

/**
 * Hook for detecting touch devices
 */
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // More comprehensive touch detection
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      (window.DocumentTouch && document instanceof window.DocumentTouch);

    setIsTouch(isTouchDevice);

    logger.debug('👆 Touch Device Detection:', isTouchDevice);
  }, []);

  return {
    isTouch,
    isMouse: !isTouch
  };
};

/**
 * Hook for responsive values based on breakpoints
 */
export const useResponsiveValue = (values) => {
  const { breakpoint } = useBreakpoint();

  // Define fallback order (largest to smallest)
  const fallbackOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

  // Find the appropriate value for current breakpoint
  let selectedValue = values[breakpoint];

  // If no value for current breakpoint, use fallback
  if (selectedValue === undefined) {
    const currentIndex = fallbackOrder.indexOf(breakpoint);

    // Look for smaller breakpoints first
    for (let i = currentIndex; i < fallbackOrder.length; i++) {
      if (values[fallbackOrder[i]] !== undefined) {
        selectedValue = values[fallbackOrder[i]];
        break;
      }
    }

    // If still no value, look for larger breakpoints
    if (selectedValue === undefined) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (values[fallbackOrder[i]] !== undefined) {
          selectedValue = values[fallbackOrder[i]];
          break;
        }
      }
    }
  }

  return selectedValue;
};

/**
 * Hook for media query matching
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => setMatches(e.matches);

    mediaQuery.addListener(handleChange);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
};

export default {
  useBreakpoint,
  useOrientation,
  useTouch,
  useResponsiveValue,
  useMediaQuery,
  BREAKPOINTS
};
