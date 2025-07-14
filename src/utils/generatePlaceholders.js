// Placeholder product images using CSS and simple colored backgrounds
// This file can be used to generate placeholder images for missing products

const productImages = [
  'Ananas', 'Armut', 'Avokado', 'Çilek', 'Ayva', 'DanMısır', 'Domates', 'Elma',
  'Greyfurt', 'İncir', 'Kavun', 'Kayısı', 'Kereviz', 'Kırmızı Biber', 'Kıvırcık',
  'Kiraz', 'Kivi', 'Lime', 'Limon', 'Mandalina', 'Mantar', 'Muz', 'Nar',
  'Portakal', 'Roka', 'Sarımsak', 'Salatalık', 'Şeftali', 'TereOtu', 'Üzüm',
  'Yeşil Elma', 'salmon.jpg', 'milk.jpg', 'water.jpg', 'chicken.jpg'
];

const generatePlaceholderSVG = (productName, width = 200, height = 200) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];
  
  const color = colors[productName.length % colors.length];
  const initials = productName.substring(0, 2).toUpperCase();
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${width/8}" fill="white" font-weight="bold">
        ${initials}
      </text>
      <text x="50%" y="80%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${width/15}" fill="white">
        ${productName}
      </text>
    </svg>
  `;
};

// Generate all placeholder images
productImages.forEach(product => {
  console.log(`Generating placeholder for: ${product}`);
});

export { productImages, generatePlaceholderSVG };
