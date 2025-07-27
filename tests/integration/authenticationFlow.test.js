/**
 * Integration Tests - Authentication Flow
 * @package Kırılmazlar Panel Testing Suite
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Authentication Flow Integration', () => {
  let testUser;
  let authService, customerService, storageService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Use mock services instead of real ones
    const mockServices = createMockServices();
    authService = mockServices.authService;
    customerService = mockServices.customerService;
    storageService = mockServices.storageService;

    testUser = {
      id: 'auth_test_user',
      email: 'auth.test@integration.com',
      password: 'SecurePass123',
      name: 'Auth Test User',
      phone: '0555 123 4567'
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Login-Logout Cycle', () => {
    it('should handle complete authentication cycle', async () => {
      // 1. Initial state verification
      const initialSession = authService.getCurrentUser();
      expect(initialSession).toBeNull();

      // 2. Login process
      const loginResult = await authService.signIn(testUser.email, testUser.password);
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.email).toBe(testUser.email);

      // 3. Session verification
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser.email).toBe(testUser.email);

      // 4. Storage integration check
      const storedData = storageService.getItem('currentUser');
      expect(storedData).toBeTruthy();
      expect(storedData.email).toBe(testUser.email);

      // 5. Logout process
      const logoutResult = await authService.signOut();
      expect(logoutResult.success).toBe(true);

      // 6. Post-logout verification
      const afterLogoutUser = authService.getCurrentUser();
      expect(afterLogoutUser).toBeNull();

      const afterLogoutStorage = storageService.getItem('currentUser');
      expect(afterLogoutStorage).toBeNull();
    });

    it('should maintain session consistency across services', async () => {
      // Login
      await authService.signIn(testUser.email, testUser.password);

      // Verify customer service recognizes authenticated user
      const customerProfile = await customerService.getById(testUser.id);
      expect(customerProfile).toBeTruthy();

      // Verify storage service has session data
      const sessionData = storageService.getItem('userSession');
      expect(sessionData).toBeTruthy();
      expect(sessionData.userId).toBe(testUser.id);

      // Logout and verify cleanup
      await authService.signOut();

      const postLogoutProfile = await customerService.getCurrentCustomer();
      expect(postLogoutProfile).toBeNull();

      const postLogoutSession = storageService.getItem('userSession');
      expect(postLogoutSession).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should handle session timeout and renewal', async () => {
      // Login
      const loginResult = await authService.signIn(testUser.email, testUser.password);
      expect(loginResult.success).toBe(true);

      // Simulate session timeout
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 3600000); // +1 hour

      // Verify session expiration
      const isValid = authService.isSessionValid();
      expect(isValid).toBe(false);

      // Attempt to refresh session
      const refreshResult = await authService.refreshSession();
      if (refreshResult.success) {
        expect(authService.isSessionValid()).toBe(true);
      } else {
        // Should redirect to login
        const currentUser = authService.getCurrentUser();
        expect(currentUser).toBeNull();
      }
    });

    it('should handle concurrent session management', async () => {
      // Login from first context
      const firstLogin = await authService.signIn(testUser.email, testUser.password);
      expect(firstLogin.success).toBe(true);

      // Simulate second browser tab login
      const secondLogin = await authService.signIn(testUser.email, testUser.password);
      expect(secondLogin.success).toBe(true);

      // Both sessions should be valid
      expect(authService.getCurrentUser()).toBeTruthy();

      // Logout from one context
      await authService.signOut();

      // Session should be properly cleaned up
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from storage corruption', async () => {
      // Login successfully
      await authService.signIn(testUser.email, testUser.password);
      expect(authService.getCurrentUser()).toBeTruthy();

      // Corrupt storage data
      storageService.setItem('currentUser', 'invalid_json_data');

      // Service should handle corruption gracefully
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeNull();

      // Should be able to login again
      const recoveryLogin = await authService.signIn(testUser.email, testUser.password);
      expect(recoveryLogin.success).toBe(true);
    });

    it('should handle network failures during authentication', async () => {
      // Mock network failure
      vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'));

      const loginResult = await authService.signIn(testUser.email, testUser.password);
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Network');

      // Should not create invalid session
      expect(authService.getCurrentUser()).toBeNull();

      // Restore network and retry
      vi.restoreAllMocks();
      const retryLogin = await authService.signIn(testUser.email, testUser.password);
      expect(retryLogin.success).toBe(true);
    });
  });

  describe('Permission Integration', () => {
    it('should enforce permissions across services', async () => {
      // Login as regular customer
      await authService.signIn(testUser.email, testUser.password);

      // Verify customer permissions
      const hasCustomerAccess = authService.hasPermission('customer');
      expect(hasCustomerAccess).toBe(true);

      const hasAdminAccess = authService.hasPermission('admin');
      expect(hasAdminAccess).toBe(false);

      // Try admin operation - should fail
      const adminResult = await customerService.getAllCustomers();
      expect(adminResult.success).toBe(false);
      expect(adminResult.error).toContain('permission');
    });
  });
});
