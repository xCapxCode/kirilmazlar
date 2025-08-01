/**
 * ⚠️ DEVRE DIŞI - HARDCODED TEST DATA KULLANILMIYOR
 * Bu dosya gerçek üretim ortamında kullanılmaz
 * Gerçek ürün verileri satıcı panelinden gelir
 */

import { logger } from '@utils/productionLogger';

// PRODUCTION'DA KULLANILMAZ - GERÇEK VERİ SATICI PANELİNDEN GELİR
logger.warn('⚠️ productLoader.js - Bu dosya production için devre dışı');

export const ALL_PRODUCTS_DATA = []; // BOŞ - KULLANILMAZ

export async function loadAllProducts() {
  logger.warn('🚫 loadAllProducts() çağrısı görmezden gelindi - Production modunda hardcoded data yüklenmez');
  return [];
}

export function migrateCategoryIds() {
  logger.warn('🚫 migrateCategoryIds() çağrısı görmezden gelindi - Production modunda migration yapılmaz');
  return;
}

export default {
  ALL_PRODUCTS_DATA,
  loadAllProducts,
  migrateCategoryIds
};
