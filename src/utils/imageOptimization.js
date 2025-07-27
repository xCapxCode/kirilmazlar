/**
 * Image Optimization Utilities
 * P2.2.3 Performance Optimization
 * 
 * Provides WebP support, responsive images, and format optimization
 */

import logger from './productionLogger';

/**
 * WebP format desteğini kontrol eder
 */
export const supportsWebP = (() => {
  let cached = null;

  return () => {
    if (cached !== null) return cached;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const supported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      cached = supported;
      return supported;
    } catch (error) {
      logger.warn('WebP support check failed:', error);
      cached = false;
      return false;
    }
  };
})();

/**
 * Image formatını optimize eder (WebP desteğine göre)
 */
export const optimizeImageFormat = (imageSrc) => {
  if (!imageSrc || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) {
    return imageSrc;
  }


  return imageSrc;
};

/**
 * Responsive image srcSet oluşturur
 */
export const generateSrcSet = (baseSrc, sizes = ['1x', '2x', '3x']) => {
  if (!baseSrc || baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return null;
  }

  try {
    const srcSet = sizes.map(size => {
      const multiplier = size.replace('x', '');
      const extension = baseSrc.split('.').pop();
      const nameWithoutExt = baseSrc.replace(`.${extension}`, '');
      return `${nameWithoutExt}@${multiplier}x.${extension} ${size}`;
    }).join(', ');

    return srcSet;
  } catch (error) {
    logger.warn('SrcSet generation failed:', error);
    return null;
  }
};

/**
 * Image preloading için utility
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      logger.debug('Image preloaded:', src);
      resolve(img);
    };

    img.onerror = (error) => {
      logger.warn('Image preload failed:', src, error);
      reject(error);
    };

    img.src = src;
  });
};

/**
 * Multiple image format sources oluşturur
 */
export const generateImageSources = (baseSrc) => {
  if (!baseSrc || baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return [{ src: baseSrc, type: null }];
  }

  const sources = [];
  const extension = baseSrc.split('.').pop()?.toLowerCase();
  const nameWithoutExt = baseSrc.replace(/\.[^/.]+$/, '');

  // WebP support varsa WebP kaynağı ekle
  if (supportsWebP()) {
    sources.push({
      src: `${nameWithoutExt}.webp`,
      type: 'image/webp'
    });
  }

  // AVIF support (future)
  // sources.push({
  //   src: `${nameWithoutExt}.avif`,
  //   type: 'image/avif'
  // });

  // Fallback: Original format
  sources.push({
    src: baseSrc,
    type: extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
      extension === 'png' ? 'image/png' :
        extension === 'webp' ? 'image/webp' : null
  });

  return sources;
};

/**
 * Image boyut kategorilerine göre optimize eder
 */
export const categorizeImageSize = (width, height) => {
  const area = (width || 200) * (height || 200);

  if (area <= 10000) return 'small'; // 100x100 ve altı
  if (area <= 40000) return 'medium'; // 200x200 ve altı
  if (area <= 160000) return 'large'; // 400x400 ve altı
  return 'xlarge'; // 400x400 üzeri
};

export default {
  supportsWebP,
  optimizeImageFormat,
  generateSrcSet,
  preloadImage,
  generateImageSources,
  categorizeImageSize
};
