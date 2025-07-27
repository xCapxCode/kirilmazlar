import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock scrollTo for jsdom environment
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

// Mock localStorage for testing environment
const localStorageMock = {
  getItem: vi.fn((key) => {
    return localStorageMock.store[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = String(value);
    // Mock storage event without actual StorageEvent constructor issues
    return true;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
  store: {}
};

// Mock BroadcastChannel for test environment
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }

  postMessage(data) {
    // Mock broadcast without actual cross-tab communication
    if (this.onmessage) {
      setTimeout(() => {
        this.onmessage({ data, type: 'message' });
      }, 0);
    }
  }

  close() {
    // Mock close
  }

  addEventListener(type, listener) {
    if (type === 'message') {
      this.onmessage = listener;
    }
  }
}

Object.defineProperty(window, 'BroadcastChannel', {
  value: MockBroadcastChannel,
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn()
  },
  writable: true
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  localStorageMock.store = {};
});
