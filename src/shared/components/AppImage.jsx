import { optimizeImageFormat } from '@utils/imageOptimization';
import { lazyImageObserver } from '@utils/lazyImageObserver';
import logger from '@utils/productionLogger';
import { useEffect, useRef, useState } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  lazy = true, // Enable lazy loading by default
  placeholder = null, // Custom placeholder
  ...props
}) {
  const [imageState, setImageState] = useState(lazy ? 'lazy' : 'loading');
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [actualSrc, setActualSrc] = useState(lazy ? null : src);
  const imgRef = useRef(null);

  // Lazy loading effect
  useEffect(() => {
    if (!lazy || !imgRef.current || actualSrc) return;

    const loadImage = () => {
      setImageState('loading');
      setActualSrc(src);
    };

    // Lazy loading ile intersection observer kullan
    lazyImageObserver.observe(imgRef.current, loadImage);

    return () => {
      if (imgRef.current) {
        lazyImageObserver.unobserve(imgRef.current);
      }
    };
  }, [lazy, src, actualSrc]);

  // Generate a simple placeholder SVG based on the alt text
  const generatePlaceholder = (text, width = 200, height = 200) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    const color = colors[text.length % colors.length];
    const initials = text.substring(0, 2).toUpperCase();

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="45%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${Math.floor(width / 10)}" fill="white" font-weight="bold">
          ${initials}
        </text>
        <text x="50%" y="75%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${Math.floor(width / 20)}" fill="white">
          ${text.length > 10 ? text.substring(0, 10) + '...' : text}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Default fallback SVG
  const getDefaultSvg = () => {
    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
        <path d="M150 70L120 100L90 70L50 110V150H150V70Z" fill="#9CA3AF"/>
        <circle cx="80" cy="80" r="15" fill="#9CA3AF"/>
        <text x="100" y="175" text-anchor="middle" font-family="Arial" font-size="12" fill="#6B7280">No Image</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // VS Code Simple Browser uyumluluğu için absolute path kontrolü
  const getImageSrc = (imageSrc) => {
    if (!imageSrc) return "/assets/images/no_image.svg";

    // Base64 string ise olduğu gibi döndür
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }

    // Relative path ise, absolute path'e çevir ve format optimize et
    let optimizedSrc = imageSrc;
    if (imageSrc.startsWith('/')) {
      optimizedSrc = optimizeImageFormat(imageSrc);
      return optimizedSrc;
    }

    // External URL ise olduğu gibi bırak
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }

    // Diğer durumlar için başına / ekle ve optimize et
    const fullPath = `/${imageSrc}`;
    return optimizeImageFormat(fullPath);
  };

  const getCurrentSrc = () => {
    // Lazy loading durumunda placeholder göster
    if (imageState === 'lazy') {
      return placeholder || generatePlaceholder(alt);
    }

    if (!actualSrc) {
      return placeholder || generatePlaceholder(alt);
    }

    if (imageState === 'error') {
      if (!fallbackAttempted) {
        return getDefaultSvg();
      } else {
        return placeholder || generatePlaceholder(alt);
      }
    }

    return getImageSrc(actualSrc);
  };

  const handleImageError = () => {
    logger.debug('Image error for:', actualSrc);

    if (!fallbackAttempted) {
      logger.debug('Trying fallback SVG');
      setFallbackAttempted(true);
      setImageState('error');
    } else {
      logger.debug('Using generated placeholder');
      setImageState('placeholder');
    }
  };

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  // Loading state className for better UX
  const getImageClassName = () => {
    let classes = className;

    if (imageState === 'lazy' || imageState === 'loading') {
      classes += ' opacity-70 transition-opacity duration-300';
    } else if (imageState === 'loaded') {
      classes += ' opacity-100 transition-opacity duration-300';
    }

    return classes;
  };

  return (
    <img
      ref={imgRef}
      src={getCurrentSrc()}
      alt={alt}
      className={getImageClassName()}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading={lazy ? "lazy" : "eager"} // Native lazy loading fallback
      {...props}
    />
  );
}

export default Image;
