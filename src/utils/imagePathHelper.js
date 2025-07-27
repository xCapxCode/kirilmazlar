/**
 * IMAGE PATH HELPER
 * URL encoding sorunlarını çözer ve güvenli image path'leri oluşturur
 */

// Ürün ismi → URL-safe filename mapping
const PRODUCT_FILENAME_MAP = {
  'Darı Mısır': 'DarıMısır',
  'Kırmızı Biber': 'Kırmızı Biber',
  'Yeşil Elma': 'Yeşil Elma',
  'Tere Otu': 'TereOtu',
  'Soğan Çuval': 'sogan-cuval'
};

/**
 * Ürün ismine göre güvenli image path oluşturur
 * @param {string} productName - Ürün adı
 * @returns {string} - Güvenli image path
 */
export const getProductImagePath = (productName) => {
  if (!productName) return '/assets/images/products/Elma.png';

  // Mapping'de var mı kontrol et
  const filename = PRODUCT_FILENAME_MAP[productName] || productName;

  // URL encoding sorunlarını önlemek için direct filename kullan
  return `/assets/images/products/${filename}.png`;
};

/**
 * Ürün için fallback image path'i
 * @returns {string} - Fallback image path
 */
export const getFallbackImagePath = () => {
  return '/assets/images/products/Elma.png';
};

/**
 * Image path'in varlığını kontrol eder (browser ortamında)
 * @param {string} imagePath - Kontrol edilecek image path
 * @returns {Promise<boolean>} - Image'in var olup olmadığı
 */
export const checkImageExists = (imagePath) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

export default { getProductImagePath, getFallbackImagePath, checkImageExists };
