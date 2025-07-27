/**
 * Virtual Scrolling Utility
 * P2.2.5: Performance optimization for long lists
 * 
 * @description Virtual scrolling için optimize edilmiş React hook ve utility functions
 * @author KırılmazlarPanel Development Team  
 * @date July 24, 2025
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from './productionLogger';

/**
 * Virtual scrolling configuration
 */
const VIRTUAL_SCROLL_CONFIG = {
  ITEM_HEIGHT: 120,          // ProductCard yüksekliği (px)
  ORDER_ITEM_HEIGHT: 140,    // OrderCard yüksekliği (px)
  BUFFER_SIZE: 5,           // Görünen alan dışında render edilecek item sayısı
  THRESHOLD: 100,           // Virtual scrolling aktif olacağı minimum item sayısı
  SCROLL_DEBOUNCE: 16       // Scroll event debounce süresi (ms)
};

/**
 * Virtual scrolling hook - uzun liste performansı için
 */
export const useVirtualScrolling = ({
  items = [],
  itemHeight = VIRTUAL_SCROLL_CONFIG.ITEM_HEIGHT,
  containerHeight = 600,
  bufferSize = VIRTUAL_SCROLL_CONFIG.BUFFER_SIZE,
  threshold = VIRTUAL_SCROLL_CONFIG.THRESHOLD
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  // Virtual scrolling sadece büyük listeler için aktif
  const isVirtualScrollEnabled = items.length > threshold;

  // Görünen item range hesaplama
  const visibleRange = useMemo(() => {
    if (!isVirtualScrollEnabled) {
      return { start: 0, end: items.length };
    }

    const containerItemCount = Math.ceil(containerHeight / itemHeight);
    const scrolledItemCount = Math.floor(scrollTop / itemHeight);

    const start = Math.max(0, scrolledItemCount - bufferSize);
    const end = Math.min(
      items.length,
      scrolledItemCount + containerItemCount + bufferSize
    );

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, bufferSize, items.length, isVirtualScrollEnabled]);

  // Görünen itemlar
  const visibleItems = useMemo(() => {
    if (!isVirtualScrollEnabled) {
      return items.map((item, index) => ({ item, index }));
    }

    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange, isVirtualScrollEnabled]);

  // Scroll handler (debounced)
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Virtual container styles
  const containerStyles = useMemo(() => {
    if (!isVirtualScrollEnabled) {
      return {};
    }

    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;

    return {
      containerStyle: {
        height: containerHeight,
        overflow: 'auto'
      },
      innerStyle: {
        height: totalHeight,
        position: 'relative'
      },
      contentStyle: {
        transform: `translateY(${offsetY}px)`
      }
    };
  }, [items.length, itemHeight, containerHeight, visibleRange.start, isVirtualScrollEnabled]);

  // Performance logging
  useEffect(() => {
    if (isVirtualScrollEnabled) {
      logger.debug('📊 Virtual Scrolling Stats:', {
        totalItems: items.length,
        visibleItems: visibleItems.length,
        visibleRange,
        scrollTop,
        enabled: isVirtualScrollEnabled
      });
    }
  }, [items.length, visibleItems.length, visibleRange, scrollTop, isVirtualScrollEnabled]);

  return {
    visibleItems,
    visibleRange,
    containerStyles,
    handleScroll,
    scrollElementRef,
    isVirtualScrollEnabled,
    totalHeight: items.length * itemHeight
  };
};

/**
 * Virtual List Component wrapper
 */
export const VirtualList = ({
  items,
  renderItem,
  itemHeight = VIRTUAL_SCROLL_CONFIG.ITEM_HEIGHT,
  containerHeight = 600,
  className = '',
  ...props
}) => {
  const {
    visibleItems,
    containerStyles,
    handleScroll,
    scrollElementRef,
    isVirtualScrollEnabled
  } = useVirtualScrolling({
    items,
    itemHeight,
    containerHeight
  });

  if (!isVirtualScrollEnabled) {
    // Küçük listeler için normal render
    return (
      <div className={className} {...props}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={className}
      style={containerStyles.containerStyle}
      onScroll={handleScroll}
      {...props}
    >
      <div style={containerStyles.innerStyle}>
        <div style={containerStyles.contentStyle}>
          {visibleItems.map(({ item, index }) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};

/**
 * Product catalog için specialized virtual list
 */
export const VirtualProductList = ({ products, renderProduct, containerHeight = 600 }) => {
  return (
    <VirtualList
      items={products}
      renderItem={renderProduct}
      itemHeight={VIRTUAL_SCROLL_CONFIG.ITEM_HEIGHT}
      containerHeight={containerHeight}
      className="virtual-product-list"
    />
  );
};

/**
 * Order list için specialized virtual list
 */
export const VirtualOrderList = ({ orders, renderOrder, containerHeight = 600 }) => {
  return (
    <VirtualList
      items={orders}
      renderItem={renderOrder}
      itemHeight={VIRTUAL_SCROLL_CONFIG.ORDER_ITEM_HEIGHT}
      containerHeight={containerHeight}
      className="virtual-order-list"
    />
  );
};

/**
 * Performance monitoring utilities
 */
export const virtualScrollPerformance = {
  /**
   * List performance analizi
   */
  analyzeListPerformance: (listName, itemCount, renderTime) => {
    const shouldUseVirtual = itemCount > VIRTUAL_SCROLL_CONFIG.THRESHOLD;
    const estimatedMemory = itemCount * 0.5; // Rough estimate: 0.5KB per item

    logger.debug(`📊 List Performance Analysis - ${listName}:`, {
      itemCount,
      renderTime: `${renderTime}ms`,
      shouldUseVirtual,
      estimatedMemory: `${estimatedMemory}KB`,
      recommendation: shouldUseVirtual ? 'Use Virtual Scrolling' : 'Normal Rendering OK'
    });

    return {
      itemCount,
      renderTime,
      shouldUseVirtual,
      estimatedMemory
    };
  },

  /**
   * Scroll performance monitoring
   */
  monitorScrollPerformance: (scrollContainer) => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        logger.debug('🎥 Scroll FPS:', fps);

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }
};

export default {
  useVirtualScrolling,
  VirtualList,
  VirtualProductList,
  VirtualOrderList,
  virtualScrollPerformance,
  CONFIG: VIRTUAL_SCROLL_CONFIG
};
