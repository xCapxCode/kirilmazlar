import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from '../authService.js';
import storage from '../../core/storage/index.js';

// Mock storage
vi.mock('../../core/storage/index.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.get.mockReturnValue(null);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        role: 'customer',
        name: 'Test User'
      };

      storage.get.mockReturnValue([mockUser]);

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(storage.set).toHaveBeenCalledWith('currentUser', mockUser);
      expect(storage.set).toHaveBeenCalledWith('authToken', expect.any(String));
    });

    it('should fail login with invalid credentials', async () => {
      storage.get.mockReturnValue([]);

      const result = await authService.login('invalid@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should handle empty email or password', async () => {
      const result1 = await authService.login('', 'password');
      const result2 = await authService.login('test@example.com', '');

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user session on logout', () => {
      authService.logout();

      expect(storage.remove).toHaveBeenCalledWith('currentUser');
      expect(storage.remove).toHaveBeenCalledWith('authToken');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from storage', () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      storage.get.mockReturnValue(mockUser);

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(storage.get).toHaveBeenCalledWith('currentUser');
    });

    it('should return null when no user is logged in', () => {
      storage.get.mockReturnValue(null);

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      storage.get.mockReturnValue({ id: 'user1' });

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      storage.get.mockReturnValue(null);

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should validate existing token', () => {
      const mockToken = 'valid-token-123';
      storage.get.mockReturnValue(mockToken);

      const isValid = authService.validateToken();

      expect(isValid).toBe(true);
      expect(storage.get).toHaveBeenCalledWith('authToken');
    });

    it('should return false for missing token', () => {
      storage.get.mockReturnValue(null);

      const isValid = authService.validateToken();

      expect(isValid).toBe(false);
    });
  });
});