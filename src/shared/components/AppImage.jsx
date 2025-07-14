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
    if (!imageSrc) return "/assets/images/no_image.svg";
    
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
        // Prevent infinite loop - only try fallback once
        if (!e.target.dataset.fallbackTried) {
          e.target.dataset.fallbackTried = 'true';
          e.target.src = "/assets/images/no_image.svg";
        } else {
          // If SVG also fails, use data URL placeholder
          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
        }
      }}
      {...props}
    />
  );
}

export default Image;
