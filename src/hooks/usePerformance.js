/**
 * Performance Optimization Hooks
 * React hooks for performance monitoring and optimization
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PerformanceMonitor, PerformanceUtils } from '../utils/performanceOptimizer';

// Hook for debounced values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttled callbacks
export const useThrottle = (callback, delay) => {
  const throttledCallback = useMemo(
    () => PerformanceUtils.throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback;
};

// Hook for memoized expensive calculations
export const useMemoizedCalculation = (calculationFn, dependencies) => {
  const memoizedFn = useMemo(
    () => PerformanceUtils.memoize(calculationFn),
    [calculationFn]
  );

  return useMemo(() => memoizedFn(), dependencies);
};

// Hook for lazy loading images
export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef();

  const { threshold = 0.1, rootMargin = '50px' } = options;

  useEffect(() => {
    if (!imgRef.current || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, threshold, rootMargin]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
    img.src = imageSrc;
  }, [imageSrc]);

  return { imgRef, imageSrc, isLoaded, isError };
};

// Hook for virtual scrolling
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const visibleItems = useMemo(() => {
    if (!items.length) return [];

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    containerRef: setContainerRef,
    onScroll: handleScroll
  };
};

// Hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTime.current;
      
      if (lifespan < 100) {
        console.warn(`Short-lived component: ${componentName} (${lifespan.toFixed(2)}ms)`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    const renderTime = performance.now();
    renderCount.current += 1;
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = renderTime - lastRenderTime.current;
      
      if (timeSinceLastRender < 16) {
        console.warn(`Frequent re-renders: ${componentName} (${timeSinceLastRender.toFixed(2)}ms since last render)`);
      }
    }
    
    lastRenderTime.current = renderTime;
    
    if (renderCount.current > 10) {
      console.warn(`High render count: ${componentName} has rendered ${renderCount.current} times`);
    }
  });

  return {
    renderCount: renderCount.current,
    logPerformance: () => {
      console.log(`${componentName} Performance:`, {
        renderCount: renderCount.current,
        lifespan: performance.now() - mountTime.current
      });
    }
  };
};

// Hook for optimized API calls
export const useOptimizedAPI = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();
  
  const { 
    debounceMs = 300, 
    retryCount = 3, 
    retryDelay = 1000,
    skipCache = false 
  } = options;

  const debouncedDependencies = useDebounce(dependencies, debounceMs);

  const executeCall = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    let attempts = 0;
    
    while (attempts < retryCount) {
      try {
        const result = await apiCall({
          signal: abortControllerRef.current.signal,
          skipCache
        });
        
        setData(result);
        setLoading(false);
        return;
      } catch (err) {
        attempts++;
        
        if (err.name === 'AbortError') {
          return; // Request was cancelled
        }
        
        if (attempts >= retryCount) {
          setError(err);
          setLoading(false);
          return;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      }
    }
  }, [apiCall, retryCount, retryDelay, skipCache]);

  useEffect(() => {
    executeCall();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, debouncedDependencies);

  const refetch = useCallback(() => {
    executeCall();
  }, [executeCall]);

  return { data, loading, error, refetch };
};

// Hook for memory usage monitoring
export const useMemoryMonitor = (threshold = 50) => {
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [isHighUsage, setIsHighUsage] = useState(false);

  useEffect(() => {
    const checkMemory = () => {
      const usage = PerformanceMonitor.trackMemoryUsage();
      if (usage) {
        setMemoryUsage(usage);
        setIsHighUsage(usage.used > threshold);
        
        if (usage.used > threshold) {
          console.warn(`High memory usage: ${usage.used}MB (threshold: ${threshold}MB)`);
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [threshold]);

  return { memoryUsage, isHighUsage };
};

// Hook for bundle splitting and lazy loading
export const useLazyComponent = (importFn) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    importFn()
      .then((module) => {
        if (mounted) {
          setComponent(() => module.default || module);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFn]);

  return { Component, loading, error };
};

// Hook for optimized list rendering
export const useOptimizedList = (items, options = {}) => {
  const { 
    pageSize = 20, 
    searchKey = null,
    sortKey = null,
    sortDirection = 'asc'
  } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const processedItems = useMemo(() => {
    let filtered = items;

    // Search filtering
    if (debouncedSearchTerm && searchKey) {
      filtered = filtered.filter(item => 
        item[searchKey]?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [items, debouncedSearchTerm, searchKey, sortKey, sortDirection]);

  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return processedItems.slice(startIndex, startIndex + pageSize);
  }, [processedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(processedItems.length / pageSize);

  return {
    items: paginatedItems,
    totalItems: processedItems.length,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
};

export default {
  useDebounce,
  useThrottle,
  useMemoizedCalculation,
  useLazyImage,
  useVirtualScroll,
  usePerformanceMonitor,
  useOptimizedAPI,
  useMemoryMonitor,
  useLazyComponent,
  useOptimizedList
};