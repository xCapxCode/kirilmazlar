import CryptoJS from 'crypto-js';
import logger from './productionLogger.js';

/**
 * Güvenli Authentication Utilities
 * JWT token ve password hashing için kullanılır
 */
class AuthUtils {
  constructor() {
    // JWT secret key - production'da environment variable'dan alınmalı
    this.JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'kirilmazlar-default-secret-2024';
    this.TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat
  }

  /**
   * Password'u güvenli şekilde hash'ler
   * @param {string} password - Ham password
   * @returns {string} - Hash'lenmiş password
   */
  hashPassword(password) {
    try {
      // Salt oluştur
      const salt = CryptoJS.lib.WordArray.random(128/8);
      
      // Password'u hash'le
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Salt ve hash'i birleştir
      const combined = salt.concat(hash);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      logger.error('Password hash hatası:', error);
      throw new Error('Password hash işlemi başarısız');
    }
  }

  /**
   * Password'u doğrular
   * @param {string} password - Ham password
   * @param {string} hashedPassword - Hash'lenmiş password
   * @returns {boolean} - Doğrulama sonucu
   */
  verifyPassword(password, hashedPassword) {
    try {
      // Hash'lenmiş password'u parse et
      const combined = CryptoJS.enc.Base64.parse(hashedPassword);
      
      // Salt'ı ayır (ilk 16 byte)
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      
      // Hash'i ayır (kalan kısım)
      const hash = CryptoJS.lib.WordArray.create(combined.words.slice(4));
      
      // Girilen password'u aynı salt ile hash'le
      const testHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Hash'leri karşılaştır
      return hash.toString() === testHash.toString();
    } catch (error) {
      logger.error('Password doğrulama hatası:', error);
      return false;
    }
  }

  /**
   * JWT token oluşturur
   * @param {Object} payload - Token içeriği
   * @returns {string} - JWT token
   */
  generateToken(payload) {
    try {
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };
      
      const now = Date.now();
      const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + this.TOKEN_EXPIRY
      };
      
      // Header ve payload'u base64 encode et
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
      
      // Signature oluştur
      const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
      
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
      logger.error('Token oluşturma hatası:', error);
      throw new Error('Token oluşturma başarısız');
    }
  }

  /**
   * JWT token'ı doğrular ve decode eder
   * @param {string} token - JWT token
   * @returns {Object|null} - Decode edilmiş payload veya null
   */
  verifyToken(token) {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Signature'ı doğrula
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
      if (signature !== expectedSignature) {
        logger.warn('Token signature doğrulaması başarısız');
        return null;
      }
      
      // Payload'u decode et
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      
      // Expiry kontrolü
      if (payload.exp && Date.now() > payload.exp) {
        logger.warn('Token süresi dolmuş');
        return null;
      }
      
      return payload;
    } catch (error) {
      logger.error('Token doğrulama hatası:', error);
      return null;
    }
  }

  /**
   * Token'ın süresini kontrol eder
   * @param {string} token - JWT token
   * @returns {boolean} - Token geçerli mi?
   */
  isTokenValid(token) {
    const payload = this.verifyToken(token);
    return payload !== null;
  }

  /**
   * Token'dan kullanıcı bilgilerini çıkarır
   * @param {string} token - JWT token
   * @returns {Object|null} - Kullanıcı bilgileri
   */
  getUserFromToken(token) {
    const payload = this.verifyToken(token);
    if (!payload) return null;
    
    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
  }

  /**
   * Base64 URL encoding
   * @param {string} str - Encode edilecek string
   * @returns {string} - Encode edilmiş string
   */
  base64UrlEncode(str) {
    const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64 URL decoding
   * @param {string} str - Decode edilecek string
   * @returns {string} - Decode edilmiş string
   */
  base64UrlDecode(str) {
    // Padding ekle
    str += '='.repeat((4 - str.length % 4) % 4);
    // URL-safe karakterleri değiştir
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
  }

  /**
   * HMAC signature oluşturur
   * @param {string} data - İmzalanacak veri
   * @returns {string} - Signature
   */
  createSignature(data) {
    const signature = CryptoJS.HmacSHA256(data, this.JWT_SECRET);
    return this.base64UrlEncode(signature.toString(CryptoJS.enc.Base64));
  }

  /**
   * Güvenli rastgele string oluşturur
   * @param {number} length - String uzunluğu
   * @returns {string} - Rastgele string
   */
  generateSecureRandom(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    
    return result;
  }

  /**
   * Session token oluşturur
   * @param {Object} user - Kullanıcı bilgileri
   * @returns {string} - Session token
   */
  createSessionToken(user) {
    return this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name,
      sessionId: this.generateSecureRandom(16)
    });
  }

  /**
   * Refresh token oluşturur
   * @param {Object} user - Kullanıcı bilgileri
   * @returns {string} - Refresh token
   */
  createRefreshToken(user) {
    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
      sessionId: this.generateSecureRandom(16)
    };
    
    // Refresh token daha uzun süre geçerli (7 gün)
    const originalExpiry = this.TOKEN_EXPIRY;
    this.TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;
    
    const token = this.generateToken(refreshPayload);
    
    // Expiry'yi eski haline getir
    this.TOKEN_EXPIRY = originalExpiry;
    
    return token;
  }
}

export default new AuthUtils();