/**
 * Auth Service Unit Tests
 * @package Kırılmazlar Panel Testing Suite
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Auth Service', () => {
  let authService;
  let mockServices;

  beforeEach(() => {
    mockServices = createMockServices();
    authService = mockServices.authService;
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.signIn(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.token).toBeDefined();
    });

    it('should handle login failure', async () => {
      const invalidCredentials = {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      };

      const result = await authService.signIn(invalidCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle successful logout', async () => {
      const result = await authService.signOut();

      expect(result.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should validate session', () => {
      const isValid = authService.isSessionValid();
      expect(typeof isValid).toBe('boolean');
    });

    it('should refresh session', async () => {
      const result = await authService.refreshSession();

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should get current user', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
    });
  });

  describe('Permission Management', () => {
    it('should check user permissions', () => {
      const hasViewPermission = authService.hasPermission('view');
      const hasAdminPermission = authService.hasPermission('admin');

      expect(typeof hasViewPermission).toBe('boolean');
      expect(typeof hasAdminPermission).toBe('boolean');
    });
  });

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await authService.updateProfile(updateData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user_123');
    });
  });
});
