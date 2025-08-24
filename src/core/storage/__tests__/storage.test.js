import { describe, it, expect, beforeEach, vi } from 'vitest';
import storage from '../index.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('get', () => {
    it('should retrieve and parse JSON data', () => {
      const testData = { name: 'test', value: 123 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = storage.get('testKey');

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should return default value when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storage.get('nonExistentKey', 'defaultValue');

      expect(result).toBe('defaultValue');
    });

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = storage.get('invalidKey', 'fallback');

      expect(result).toBe('fallback');
    });

    it('should return null when no default value provided and key missing', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storage.get('missingKey');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should stringify and store data', () => {
      const testData = { name: 'test', value: 123 };

      storage.set('testKey', testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify(testData)
      );
    });

    it('should handle primitive values', () => {
      storage.set('stringKey', 'test string');
      storage.set('numberKey', 42);
      storage.set('booleanKey', true);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('stringKey', '"test string"');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('numberKey', '42');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('booleanKey', 'true');
    });

    it('should handle null and undefined values', () => {
      storage.set('nullKey', null);
      storage.set('undefinedKey', undefined);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nullKey', 'null');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('undefinedKey', 'null');
    });
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      storage.remove('testKey');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      storage.clear();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should return true when key exists', () => {
      mockLocalStorage.getItem.mockReturnValue('some-value');

      const result = storage.has('existingKey');

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('existingKey');
    });

    it('should return false when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storage.has('nonExistentKey');

      expect(result).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all storage keys', () => {
      mockLocalStorage.length = 3;
      mockLocalStorage.key.mockImplementation((index) => {
        const keys = ['key1', 'key2', 'key3'];
        return keys[index] || null;
      });

      const result = storage.keys();

      expect(result).toEqual(['key1', 'key2', 'key3']);
    });

    it('should return empty array when no keys exist', () => {
      mockLocalStorage.length = 0;

      const result = storage.keys();

      expect(result).toEqual([]);
    });
  });

  describe('size', () => {
    it('should return storage size', () => {
      mockLocalStorage.length = 5;

      const result = storage.size();

      expect(result).toBe(5);
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json{');

      const result = storage.get('test-key', 'default');

      // Storage service returns the raw value when JSON parse fails
      expect(result).toBe('invalid-json{');
    });

    it('should return default value when storage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storage.get('test-key', 'default');

      expect(result).toBe('default');
    });

    it('should handle storage quota errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = storage.set('test-key', 'test-value');
      
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});