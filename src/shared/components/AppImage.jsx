import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
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

  // VS Code Simple Browser uyumluluğu için absolute path kontrolü
  const getImageSrc = (imageSrc) => {
    if (!imageSrc) return "/assets/images/no_image.png";
    
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

  return (
    <img
      src={getImageSrc(src)}
      alt={alt}
      className={className}
      onError={(e) => {
        // console.warn(`Image load failed: ${e.target.src}`);
        // First try the no_image.png fallback
        if (!e.target.src.includes('no_image.png')) {
          e.target.src = "/assets/images/no_image.png";
        } else {
          // If even no_image.png fails, generate a placeholder
          e.target.src = generatePlaceholder(alt);
        }
      }}
      {...props}
    />
  );
}

export default Image;
