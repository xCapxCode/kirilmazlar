import React, { useState } from 'react';

function AppImage({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const [imageState, setImageState] = useState('loading');
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

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
        <text x="50%" y="45%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${Math.floor(width/10)}" fill="white" font-weight="bold">
          ${initials}
        </text>
        <text x="50%" y="75%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${Math.floor(width/20)}" fill="white">
          ${text.length > 10 ? text.substring(0, 10) + '...' : text}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
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
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // VS Code Simple Browser uyumluluğu için absolute path kontrolü
  const getImageSrc = (imageSrc) => {
    if (!imageSrc) return getDefaultSvg();
    
    // Base64 string ise olduğu gibi döndür
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }
    
    // Eğer relative path ise, absolute path'e çevir
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
    
    // External URL ise olduğu gibi bırak
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // Diğer durumlar için başına / ekle
    return `/${imageSrc}`;
  };

  const getCurrentSrc = () => {
    if (!src) {
      return generatePlaceholder(alt);
    }
    
    if (imageState === 'error') {
      if (!fallbackAttempted) {
        return getDefaultSvg();
      } else {
        return generatePlaceholder(alt);
      }
    }
    
    return getImageSrc(src);
  };

  const handleImageError = () => {
    console.log('AppImage error for:', src);
    
    if (!fallbackAttempted) {
      console.log('Trying fallback SVG');
      setFallbackAttempted(true);
      setImageState('error');
    } else {
      console.log('Using generated placeholder');
      setImageState('placeholder');
    }
  };

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  return (
    <img
      src={getCurrentSrc()}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
}

export default AppImage;
