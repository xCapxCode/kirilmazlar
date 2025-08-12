/**
 * Memory Manager Service
 * Hafıza yönetimi ve senkronizasyon
 */

export class MemoryManager {
  constructor() {
    this.memoryCache = new Map();
    this.lastSync = Date.now();
  }

  async syncMemory() {
    try {
      // Sync all cached memory
      for (const [key, value] of this.memoryCache) {
        localStorage.setItem(key, JSON.stringify(value));
      }

      this.lastSync = Date.now();
      return { success: true };
    } catch (error) {
      console.error('Memory sync error:', error);
      return { success: false, error: error.message };
    }
  }

  get(key) {
    // Try cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Try localStorage
    const value = localStorage.getItem(key);
    if (value) {
      const parsed = JSON.parse(value);
      this.memoryCache.set(key, parsed);
      return parsed;
    }

    return null;
  }

  set(key, value) {
    // Update cache
    this.memoryCache.set(key, value);

    // Auto sync if more than 5 seconds passed
    if (Date.now() - this.lastSync > 5000) {
      this.syncMemory();
    }
  }

  clear() {
    this.memoryCache.clear();
    localStorage.clear();
  }
}
