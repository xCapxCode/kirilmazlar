/**
 * Component Memoization Utilities
 * P2.2.4 Performance Optimization
 * 
 * Provides React.memo, useMemo, and useCallback optimization helpers
 */

import { useCallback, useMemo } from 'react';
import logger from './productionLogger';

/**
 * Performance monitoring için component render sayacı
 */
const renderCounts = new Map();

export const trackRender = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    const count = renderCounts.get(componentName) || 0;
    renderCounts.set(componentName, count + 1);

    if (count > 0 && count % 10 === 0) {
      logger.debug(`🔄 ${componentName} rendered ${count} times`);
    }
  }
};

/**
 * React.memo için optimized comparison functions
 */
export const memoComparisonHelpers = {
  /**
   * Product card comparison - only essential props
   */
  productCard: (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.product.isAvailable === nextProps.product.isAvailable &&
      prevProps.product.discount === nextProps.product.discount &&
      prevProps.layout === nextProps.layout &&
      prevProps.onQuickAdd === nextProps.onQuickAdd &&
      prevProps.onProductClick === nextProps.onProductClick
    );
  },

  /**
   * Filter panel comparison - essential filtering props
   */
  filterPanel: (prevProps, nextProps) => {
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.sortBy === nextProps.sortBy &&
      prevProps.priceRange[0] === nextProps.priceRange[0] &&
      prevProps.priceRange[1] === nextProps.priceRange[1] &&
      prevProps.showAvailableOnly === nextProps.showAvailableOnly &&
      prevProps.selectedCategory === nextProps.selectedCategory &&
      prevProps.categories.length === nextProps.categories.length &&
      prevProps.onClose === nextProps.onClose &&
      prevProps.onSortChange === nextProps.onSortChange &&
      prevProps.onPriceRangeChange === nextProps.onPriceRangeChange &&
      prevProps.onAvailableOnlyChange === nextProps.onAvailableOnlyChange &&
      prevProps.onCategorySelect === nextProps.onCategorySelect
    );
  },

  /**
   * Order card comparison
   */
  orderCard: (prevProps, nextProps) => {
    return (
      prevProps.order.id === nextProps.order.id &&
      prevProps.order.status === nextProps.order.status &&
      prevProps.order.total === nextProps.order.total &&
      prevProps.order.itemCount === nextProps.order.itemCount &&
      prevProps.order.date === nextProps.order.date &&
      prevProps.onOrderSelect === nextProps.onOrderSelect &&
      prevProps.onOrderAction === nextProps.onOrderAction &&
      prevProps.getStatusColor === nextProps.getStatusColor &&
      prevProps.getStatusText === nextProps.getStatusText &&
      prevProps.formatDate === nextProps.formatDate &&
      prevProps.formatCurrency === nextProps.formatCurrency
    );
  },

  /**
   * Modal comparison - basic props only
   */
  modal: (prevProps, nextProps) => {
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.title === nextProps.title &&
      prevProps.onClose === nextProps.onClose
    );
  },

};

/**
 * Optimized useMemo hooks for common calculations
 */
export const useMemoizedCalculations = {
  /**
   * Product filtering and sorting
   */
  useFilteredProducts: (products, filters, dependencies = []) => {
    return useMemo(() => {
      logger.debug('🔄 Filtering products memoization triggered');

      let filtered = [...products];
      const { selectedCategory, sortBy, priceRange, showAvailableOnly, searchQuery } = filters;

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'organic') {
          filtered = filtered.filter(product => product.isOrganic);
        } else {
          filtered = filtered.filter(product =>
            product.category === selectedCategory ||
            product.categoryId === selectedCategory
          );
        }
      }

      // Price range filter
      if (priceRange && priceRange.length === 2) {
        filtered = filtered.filter(product =>
          product.price >= priceRange[0] && product.price <= priceRange[1]
        );
      }

      // Availability filter
      if (showAvailableOnly) {
        filtered = filtered.filter(product => product.isAvailable && product.stock > 0);
      }

      // Sort products
      switch (sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        default:
          // relevance - keep original order
          break;
      }

      return filtered;
    }, [products, ...dependencies]);
  },

  /**
   * Order statistics calculation
   */
  useOrderStats: (orders) => {
    return useMemo(() => {
      logger.debug('🔄 Order stats memoization triggered');

      const stats = {
        total: orders.length,
        pending: 0,
        confirmed: 0,
        delivered: 0,
        totalAmount: 0,
        averageAmount: 0
      };

      orders.forEach(order => {
        stats.totalAmount += parseFloat(order.total || 0);

        switch (order.status?.toLowerCase()) {
          case 'pending':
            stats.pending++;
            break;
          case 'confirmed':
          case 'preparing':
            stats.confirmed++;
            break;
          case 'delivered':
            stats.delivered++;
            break;
        }
      });

      stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

      return stats;
    }, [orders]);
  },

  /**
   * Customer statistics calculation
   */
  useCustomerStats: (customers) => {
    return useMemo(() => {
      logger.debug('🔄 Customer stats memoization triggered');

      const stats = {
        total: customers.length,
        active: 0,
        inactive: 0,
        vip: 0,
        totalOrders: 0,
        totalRevenue: 0
      };

      customers.forEach(customer => {
        if (customer.status === 'active') stats.active++;
        else if (customer.status === 'inactive') stats.inactive++;
        else if (customer.status === 'vip') stats.vip++;

        stats.totalOrders += customer.orderCount || 0;
        stats.totalRevenue += parseFloat(customer.totalSpent || 0);
      });

      return stats;
    }, [customers]);
  }
};

/**
 * Optimized useCallback hooks for common event handlers
 */
export const useMemoizedCallbacks = {
  /**
   * Product interaction callbacks - Modern object destructuring approach
   */
  useProductCallbacks: ({
    setSelectedCategory,
    setSearchParams,
    addToCart,
    showSuccess,
    setQuickAddProduct,
    setSelectedProduct
  }) => {
    const handleCategorySelect = useCallback((categoryId) => {
      logger.debug('Category selected:', categoryId);
      setSelectedCategory(categoryId);
      setSearchParams(prev => {
        if (categoryId === 'all') {
          prev.delete('category');
        } else {
          prev.set('category', categoryId);
        }
        return prev;
      });
    }, [setSelectedCategory, setSearchParams]);

    const handleQuickAdd = useCallback((product) => {
      logger.debug('Quick add modal opening for product:', product.id);
      setQuickAddProduct(product);
    }, [setQuickAddProduct]);

    const handleAddToCart = useCallback((product, quantity = 1, unit = product?.unit || 'adet') => {
      logger.debug('Adding to cart:', product?.id, quantity, unit);

      if (!product) {
        logger.error('Product is null or undefined');
        return;
      }

      try {
        // CartContext'teki addToCart fonksiyonunu çağır
        addToCart(product, quantity);
        showSuccess(`${product.name} sepete eklendi! (${quantity} ${unit})`);
        logger.info('✅ Product successfully added to cart:', product.name);
      } catch (error) {
        logger.error('❌ Failed to add product to cart:', error);
        showSuccess('Ürün sepete eklenirken hata oluştu!', 'error');
      }
    }, [addToCart, showSuccess]);

    const handleProductClick = useCallback((product) => {
      logger.debug('Product detail modal opening for:', product.id);
      setSelectedProduct(product);
    }, [setSelectedProduct]);

    return {
      handleCategorySelect,
      handleQuickAdd,
      handleAddToCart,
      handleProductClick
    };
  },

  /**
   * Filter update callbacks
   */
  useFilterCallbacks: (setFilters) => {
    const handleCategoryChange = useCallback((categoryId) => {
      setFilters(prev => ({ ...prev, selectedCategory: categoryId }));
    }, [setFilters]);

    const handleSortChange = useCallback((sortBy) => {
      setFilters(prev => ({ ...prev, sortBy }));
    }, [setFilters]);

    const handlePriceRangeChange = useCallback((priceRange) => {
      setFilters(prev => ({ ...prev, priceRange }));
    }, [setFilters]);

    const handleSearchChange = useCallback((searchQuery) => {
      setFilters(prev => ({ ...prev, searchQuery }));
    }, [setFilters]);

    return {
      handleCategoryChange,
      handleSortChange,
      handlePriceRangeChange,
      handleSearchChange
    };
  },

  /**
   * Form input callbacks
   */
  useFormCallbacks: (formData, setFormData, setErrors) => {
    const handleInputChange = useCallback((field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors(prev => ({ ...prev, [field]: null }));
    }, [setFormData, setErrors]);

    const handleMultipleInputChange = useCallback((updates) => {
      setFormData(prev => ({ ...prev, ...updates }));
    }, [setFormData]);

    return { handleInputChange, handleMultipleInputChange };
  },

  /**
   * Header component callbacks
   */
  useHeaderCallbacks: ({ signOut, navigate, setIsUserMenuOpen }) => {
    const handleLogout = useCallback(async () => {
      try {
        await signOut();
        setIsUserMenuOpen(false);
        navigate('/', { replace: true });
      } catch (error) {
        logger.error('Logout error:', error);
      }
    }, [signOut, navigate, setIsUserMenuOpen]);

    const handleProfileClick = useCallback(() => {
      navigate('/customer/profile');
      setIsUserMenuOpen(false);
    }, [navigate, setIsUserMenuOpen]);

    return { handleLogout, handleProfileClick };
  }
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  getRenderCounts: () => renderCounts,
  resetRenderCounts: () => { renderCounts.clear(); },
  logPerformanceStats: () => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🎯 Component Render Stats:', Object.fromEntries(renderCounts));
    }
  }
};

export default {
  trackRender,
  memoComparisonHelpers,
  useMemoizedCalculations,
  useMemoizedCallbacks,
  performanceMonitor
};
