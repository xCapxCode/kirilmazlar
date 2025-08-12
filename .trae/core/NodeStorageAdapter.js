/**
 * Node.js Storage Adapter
 * localStorage polyfill for Node.js environment
 * Provides file-based storage that mimics localStorage API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NodeStorageAdapter {
  constructor() {
    this.storageDir = path.join(__dirname, '..', 'storage');
    this.storageFile = path.join(this.storageDir, 'node-storage.json');
    this.data = {};
    this.init();
  }

  init() {
    try {
      // Create storage directory if it doesn't exist
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }

      // Load existing data
      if (fs.existsSync(this.storageFile)) {
        const fileContent = fs.readFileSync(this.storageFile, 'utf8');
        this.data = JSON.parse(fileContent);
      }
    } catch (error) {
      console.warn('NodeStorageAdapter: Failed to initialize storage:', error.message);
      this.data = {};
    }
  }

  setItem(key, value) {
    try {
      this.data[key] = String(value);
      this.persist();
    } catch (error) {
      console.warn(`NodeStorageAdapter: Failed to set item ${key}:`, error.message);
    }
  }

  getItem(key) {
    return this.data[key] || null;
  }

  removeItem(key) {
    try {
      delete this.data[key];
      this.persist();
    } catch (error) {
      console.warn(`NodeStorageAdapter: Failed to remove item ${key}:`, error.message);
    }
  }

  clear() {
    try {
      this.data = {};
      this.persist();
    } catch (error) {
      console.warn('NodeStorageAdapter: Failed to clear storage:', error.message);
    }
  }

  key(index) {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.data).length;
  }

  persist() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.warn('NodeStorageAdapter: Failed to persist data:', error.message);
    }
  }

  // Additional utility methods
  getAllKeys() {
    return Object.keys(this.data);
  }

  getAllData() {
    return { ...this.data };
  }

  getStats() {
    return {
      totalKeys: this.length,
      storageSize: JSON.stringify(this.data).length,
      storageFile: this.storageFile
    };
  }
}

// Create global localStorage polyfill for Node.js
function setupLocalStoragePolyfill() {
  if (typeof localStorage === 'undefined') {
    global.localStorage = new NodeStorageAdapter();
    console.log('✅ localStorage polyfill initialized for Node.js');
  }
}

export { NodeStorageAdapter, setupLocalStoragePolyfill };