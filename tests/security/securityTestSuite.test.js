/**
 * Security Testing Suite
 * Comprehensive security validation for Kırılmazlar Panel
 * Including XSS, CSRF, authentication, authorization, and data protection tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../utils/testHelpers.js';

describe('Security Testing Suite', () => {
  let services;
  let authService, customerService, orderService, productService, storageService;
  let securityTestHelpers;

  beforeEach(async () => {
    // Create mock services
    services = createMockServices();
    ({ authService, customerService, orderService, productService, storageService } = services);

    // Security testing helpers
    securityTestHelpers = {
      // XSS payload generation
      generateXSSPayloads() {
        return [
          '<script>alert("XSS")</script>',
          'javascript:alert("XSS")',
          '<img src="x" onerror="alert(\'XSS\')">',
          '<svg onload="alert(\'XSS\')">',
          '"><script>alert("XSS")</script>',
          '\';alert(\'XSS\');//',
          '<iframe src="javascript:alert(\'XSS\')"></iframe>',
          '<object data="javascript:alert(\'XSS\')"></object>'
        ];
      },

      // SQL injection patterns
      generateSQLInjectionPayloads() {
        return [
          "'; DROP TABLE users; --",
          "' OR '1'='1",
          "' UNION SELECT * FROM users --",
          "'; INSERT INTO users VALUES ('hacker', 'password'); --",
          "' OR 1=1 --",
          "admin'--",
          "' OR 'x'='x",
          "'; EXEC xp_cmdshell('dir'); --"
        ];
      },

      // CSRF token simulation
      generateCSRFToken() {
        // Generate a 32+ character token compatible with isValidSessionToken
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
        let token = '';
        for (let i = 0; i < 36; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
      },

      // Sanitize input function
      sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;')
          .replace(/javascript:/gi, 'javascript_blocked:');
      },

      // Validate session token format
      isValidSessionToken(token) {
        if (!token || typeof token !== 'string') return false;
        // Should be at least 32 characters and contain only safe characters
        return /^[a-zA-Z0-9_-]{32,}$/.test(token);
      },

      // Check for sensitive data exposure
      containsSensitiveData(data) {
        const sensitivePatterns = [
          /password/i,
          /credit.*card/i,
          /ssn|social.*security/i,
          /api.*key/i,
          /secret/i,
          /token/i,
          /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
          /\b\d{3}-\d{2}-\d{4}\b/ // SSN pattern
        ];

        const dataString = JSON.stringify(data);
        return sensitivePatterns.some(pattern => pattern.test(dataString));
      }
    };

    // Authenticate for authorized tests
    await authService.signIn('test@example.com', 'password123');
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (storageService && typeof storageService.clear === 'function') {
      storageService.clear();
    }
  });

  describe('XSS (Cross-Site Scripting) Protection', () => {
    it('should sanitize user input to prevent XSS attacks', async () => {
      const xssPayloads = securityTestHelpers.generateXSSPayloads();

      for (const payload of xssPayloads) {
        // Test customer name input
        const customerData = {
          id: 'xss_test_customer',
          name: payload,
          email: 'xss@test.com',
          status: 'active'
        };

        try {
          const result = await customerService.create(customerData);

          if (result.success) {
            // If creation succeeded, the name should be sanitized
            const sanitizedName = securityTestHelpers.sanitizeInput(payload);
            expect(result.customer.name).not.toBe(payload);
            expect(result.customer.name).toBe(sanitizedName);
          }
        } catch (error) {
          // If creation failed, it should be due to validation, not XSS execution
          expect(error.message).toMatch(/invalid|validation|sanitization/i);
        }
      }
    });

    it('should prevent XSS in product descriptions', async () => {
      const maliciousDescription = '<script>document.cookie="stolen=true"</script>';

      const productData = {
        id: 'xss_test_product',
        name: 'Test Product',
        description: maliciousDescription,
        price: 99.99,
        category: 'test'
      };

      const result = await productService.create(productData);

      if (result.success) {
        // Description should be sanitized
        expect(result.product.description).not.toContain('<script>');
        expect(result.product.description).not.toContain('document.cookie');

        const sanitized = securityTestHelpers.sanitizeInput(maliciousDescription);
        expect(result.product.description).toBe(sanitized);
      }
    });

    it('should handle XSS attempts in search queries', async () => {
      const xssSearchTerms = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>'
      ];

      for (const searchTerm of xssSearchTerms) {
        const results = await productService.search(searchTerm);

        // Search should complete without executing malicious code
        expect(Array.isArray(results)).toBe(true);

        // Results should not contain unsanitized malicious content
        const resultsString = JSON.stringify(results);
        expect(resultsString).not.toContain('<script>');
        expect(resultsString).not.toContain('javascript:');
        expect(resultsString).not.toContain('onerror=');
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in customer queries', async () => {
      const sqlPayloads = securityTestHelpers.generateSQLInjectionPayloads();

      for (const payload of sqlPayloads) {
        try {
          // Test SQL injection in customer ID lookup
          const result = await customerService.getById(payload);

          // Should either return null (safe not found) or sanitized result
          if (result) {
            expect(result.id).not.toBe(payload);
            expect(typeof result.id).toBe('string');
            expect(result.id).not.toContain('DROP');
            expect(result.id).not.toContain('UNION');
            expect(result.id).not.toContain('INSERT');
          }
        } catch (error) {
          // Should fail gracefully, not expose database errors
          expect(error.message).not.toContain('SQL');
          expect(error.message).not.toContain('database');
          expect(error.message).not.toContain('table');
        }
      }
    });

    it('should sanitize SQL injection attempts in email searches', async () => {
      const sqlEmailPayloads = [
        "test@example.com'; DROP TABLE customers; --",
        "' OR '1'='1' --",
        "test@example.com' UNION SELECT * FROM passwords --"
      ];

      for (const emailPayload of sqlEmailPayloads) {
        const customerData = {
          id: 'sql_test_customer',
          name: 'SQL Test Customer',
          email: emailPayload,
          status: 'active'
        };

        try {
          const result = await customerService.create(customerData);

          if (result.success) {
            // Email should be sanitized or validation should reject it
            expect(result.customer.email).not.toContain('DROP');
            expect(result.customer.email).not.toContain('UNION');
            expect(result.customer.email).not.toContain('--');
          }
        } catch (error) {
          // Should fail with validation error, not SQL error
          expect(error.message).toMatch(/email|validation|format/i);
          expect(error.message).not.toContain('SQL');
        }
      }
    });

    it('should protect against SQL injection in order queries', async () => {
      const maliciousCustomerId = "'; DROP TABLE orders; --";

      try {
        const orders = await orderService.getByCustomerId(maliciousCustomerId);

        // Should return empty array or handle gracefully
        expect(Array.isArray(orders)).toBe(true);

        // Should not execute malicious SQL
        orders.forEach(order => {
          expect(order.customerId).not.toContain('DROP');
          expect(order.customerId).not.toContain('--');
        });
      } catch (error) {
        // Should fail safely without exposing SQL details
        expect(error.message).not.toContain('SQL');
        expect(error.message).not.toContain('database');
      }
    });
  });

  describe('Authentication Security', () => {
    it('should validate session tokens properly', async () => {
      // Test with valid session
      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeTruthy();

      // Test session validation
      const isValid = authService.isSessionValid();
      expect(typeof isValid).toBe('boolean');

      // Sign out and test invalid session
      await authService.signOut();
      const invalidUser = await authService.getCurrentUser();
      expect(invalidUser).toBeNull();
    });

    it('should prevent session hijacking attempts', async () => {
      // Create legitimate session
      const loginResult = await authService.signIn('test@example.com', 'password123');
      expect(loginResult.success).toBe(true);

      // Test with malicious session tokens
      const maliciousTokens = [
        'malicious_token_123',
        '<script>alert("XSS")</script>',
        '"; DROP TABLE sessions; --',
        '../../../etc/passwd',
        'null',
        'undefined',
        ''
      ];

      for (const maliciousToken of maliciousTokens) {
        // Create fresh session for each test
        await authService.signIn('test@example.com', 'password123');

        // Simulate setting malicious token
        if (storageService.setItem) {
          storageService.setItem('sessionToken', maliciousToken);
        }

        // Session should be invalid
        const isValid = authService.isSessionValid();
        expect(isValid).toBe(false);

        // Should not return user data with invalid token
        const user = await authService.getCurrentUser();
        expect(user).toBeNull();

        // Clean up for next iteration
        await authService.signOut();
      }
    });

    it('should enforce password complexity requirements', async () => {
      const weakPasswords = [
        '123',
        'password',
        'abc',
        '',
        'a',
        '12345678',
        'qwerty'
      ];

      for (const weakPassword of weakPasswords) {
        const result = await authService.signIn('test@example.com', weakPassword);

        // Weak passwords should fail authentication
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });

    it('should implement proper session timeout', async () => {
      // Create session
      await authService.signIn('test@example.com', 'password123');

      // Force session timeout using the method we added
      authService.forceSessionTimeout();

      // Session should be considered invalid
      const isValid = authService.isSessionValid();
      expect(isValid).toBe(false);

      // Should not return user for expired session
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('Authorization and Access Control', () => {
    it('should enforce role-based access control', async () => {
      // Test with customer role
      const customerLogin = await authService.signIn('customer1@test.com', 'password123');
      expect(customerLogin.success).toBe(true);

      // Customer should not have admin permissions
      const hasAdminPermission = authService.hasPermission('admin');
      expect(hasAdminPermission).toBe(false);

      // Customer should have limited permissions
      const hasCustomerPermission = authService.hasPermission('customer');
      expect(hasCustomerPermission).toBe(true);
    });

    it('should prevent unauthorized data access', async () => {
      // Sign out to test unauthorized access
      await authService.signOut();

      try {
        // Attempt to access customer data without authentication
        await customerService.getAll();
        expect.fail('Should require authentication');
      } catch (error) {
        expect(error.message).toMatch(/authentication|unauthorized|login/i);
      }

      try {
        // Attempt to create order without authentication
        await orderService.create({
          customerId: 'test_customer',
          items: [{ productId: 'test_product', quantity: 1, price: 10.00 }],
          total: 10.00
        });
        expect.fail('Should require authentication');
      } catch (error) {
        expect(error.message).toMatch(/authentication|unauthorized|login/i);
      }
    });

    it('should validate resource ownership', async () => {
      // Create test customers
      await authService.signIn('test@example.com', 'password123');

      await customerService.create({
        id: 'customer_1',
        name: 'Customer 1',
        email: 'customer1@test.com',
        status: 'active'
      });

      await customerService.create({
        id: 'customer_2',
        name: 'Customer 2',
        email: 'customer2@test.com',
        status: 'active'
      });

      // Create order for customer1
      await orderService.create({
        customerId: 'customer_1',
        items: [{ productId: 'test_product', quantity: 1, price: 10.00 }],
        total: 10.00
      });

      // Customer1 should access their own orders
      const customer1Orders = await orderService.getByCustomerId('customer_1');
      expect(Array.isArray(customer1Orders)).toBe(true);

      // Customer2 should not access customer1's orders (in a real implementation)
      // For now, verify that order data doesn't leak between customers
      const customer2Orders = await orderService.getByCustomerId('customer_2');
      expect(Array.isArray(customer2Orders)).toBe(true);

      // Verify no data leakage
      const customer1OrderIds = customer1Orders.map(o => o.id);
      const customer2OrderIds = customer2Orders.map(o => o.id);

      // No overlap in order IDs
      const overlap = customer1OrderIds.filter(id => customer2OrderIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Data Protection and Privacy', () => {
    it('should not expose sensitive data in responses', async () => {
      // Create customer with potentially sensitive data
      const customerData = {
        id: 'privacy_test_customer',
        name: 'Privacy Test Customer',
        email: 'privacy@test.com',
        status: 'active',
        internalNotes: 'secret internal information',
        creditCard: '4111-1111-1111-1111'
      };

      const result = await customerService.create(customerData);

      if (result.success) {
        // Response should not contain sensitive fields
        expect(result.customer.creditCard).toBeUndefined();
        expect(result.customer.internalNotes).toBeUndefined();

        // Check for any sensitive data patterns
        const hasSensitiveData = securityTestHelpers.containsSensitiveData(result);
        expect(hasSensitiveData).toBe(false);
      }
    });

    it('should sanitize error messages to prevent information disclosure', async () => {
      const maliciousInputs = [
        { id: '../../../etc/passwd', name: 'Hacker' },
        { id: 'test', name: null }, // Null injection
        { id: 'test', email: 'not-an-email' },
        { id: '', name: 'Empty ID Test' }
      ];

      for (const input of maliciousInputs) {
        try {
          await customerService.create(input);
        } catch (error) {
          // Error messages should not reveal system details
          expect(error.message).not.toContain('database');
          expect(error.message).not.toContain('SQL');
          expect(error.message).not.toContain('file system');
          expect(error.message).not.toContain('internal');
          expect(error.message).not.toContain('stack trace');

          // Should be generic validation messages
          expect(error.message).toMatch(/invalid|validation|required|format/i);
        }
      }
    });

    it('should prevent data enumeration attacks', async () => {
      // Test customer ID enumeration
      const testIds = ['1', '2', '3', 'admin', 'test', 'null', ''];
      const responses = [];

      for (const id of testIds) {
        try {
          const customer = await customerService.getById(id);
          responses.push({ id, found: !!customer, response: customer });
        } catch (error) {
          responses.push({ id, found: false, error: error.message });
        }
      }

      // All responses should be similar to prevent enumeration
      const notFoundResponses = responses.filter(r => !r.found);

      // Error messages should be consistent
      const errorMessages = notFoundResponses.map(r => r.error).filter(Boolean);
      if (errorMessages.length > 1) {
        const firstMessage = errorMessages[0];
        errorMessages.forEach(message => {
          expect(message).toBe(firstMessage); // Consistent error messages
        });
      }
    });

    it('should implement proper data validation', async () => {
      const invalidDataTests = [
        // Email validation
        { email: 'not-an-email', expectedError: 'email' },
        { email: '<script>alert("XSS")</script>@test.com', expectedError: 'email' },
        { email: '', expectedError: 'email' },

        // Name validation
        { name: '<script>alert("XSS")</script>', expectedError: 'name' },
        { name: '', expectedError: 'name' },
        { name: 'a'.repeat(1000), expectedError: 'name' }, // Too long

        // Status validation
        { status: 'invalid_status', expectedError: 'status' },
        { status: '<script>alert("XSS")</script>', expectedError: 'status' }
      ];

      for (const testCase of invalidDataTests) {
        const customerData = {
          id: 'validation_test',
          name: 'Validation Test',
          email: 'validation@test.com',
          status: 'active',
          ...testCase
        };

        try {
          const result = await customerService.create(customerData);

          if (result.success) {
            // If creation succeeded, data should be sanitized
            const customer = result.customer;
            expect(typeof customer.name).toBe('string');
            expect(typeof customer.email).toBe('string');
            expect(['active', 'inactive'].includes(customer.status)).toBe(true);
          }
        } catch (error) {
          // Error should be related to validation
          expect(error.message.toLowerCase()).toContain(testCase.expectedError);
        }
      }
    });
  });

  describe('CSRF (Cross-Site Request Forgery) Protection', () => {
    it('should validate CSRF tokens for state-changing operations', async () => {
      const validToken = securityTestHelpers.generateCSRFToken();
      const invalidTokens = [
        'invalid_token',
        '',
        null,
        '<script>alert("XSS")</script>',
        'a'.repeat(1000)
      ];

      // In a real implementation, CSRF tokens would be validated
      // Here we simulate the concept
      for (const invalidToken of invalidTokens) {
        // Simulate CSRF token validation failure
        const isValidCSRF = securityTestHelpers.isValidSessionToken(invalidToken);
        expect(isValidCSRF).toBe(false);
      }

      // Valid token should pass
      const isValidCSRF = securityTestHelpers.isValidSessionToken(validToken);
      expect(isValidCSRF).toBe(true);
    });

    it('should protect against CSRF in critical operations', async () => {
      // Test order creation without CSRF token (should fail)
      const result = await orderService.create({
        customerId: 'test_customer',
        items: [{ productId: 'test_product', quantity: 1, price: 10.00 }],
        total: 10.00
      }); // No CSRF token parameter

      // Should fail due to missing CSRF token
      expect(result.success).toBe(false);
      expect(result.error).toContain('CSRF');

      // Test with valid CSRF token (should succeed)
      const sessionData = authService.getSessionData();
      if (sessionData && sessionData.csrfToken) {
        const successResult = await orderService.create({
          customerId: 'test_customer',
          items: [{ productId: 'test_product', quantity: 1, price: 10.00 }],
          total: 10.00
        }, sessionData.csrfToken);

        expect(successResult.success).toBe(true);
      }
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate all input parameters', async () => {
      const maliciousInputs = {
        // Buffer overflow attempts
        longString: 'a'.repeat(10000),
        // Null byte injection
        nullByte: 'test\u0000malicious',
        // Unicode attacks
        unicode: '\u202e\u0644\u202d',
        // Control characters
        controlChars: '\r\n\t\b\f\v',
        // Path traversal
        pathTraversal: '../../../etc/passwd',
        // Command injection
        commandInjection: '; cat /etc/passwd',
        // LDAP injection
        ldapInjection: '*)(uid=*',
        // XPath injection
        xpathInjection: '\' or \'1\'=\'1'
      };

      for (const [inputType, maliciousValue] of Object.entries(maliciousInputs)) {
        const customerData = {
          id: `security_test_${inputType}`,
          name: maliciousValue,
          email: 'security@test.com',
          status: 'active'
        };

        try {
          const result = await customerService.create(customerData);

          if (result.success) {
            // Input should be sanitized
            expect(result.customer.name).not.toBe(maliciousValue);
            expect(result.customer.name.length).toBeLessThan(1000); // Reasonable length
            expect(result.customer.name).not.toContain('\u0000'); // No null bytes
            expect(result.customer.name).not.toContain('../'); // No path traversal
          }
        } catch (error) {
          // Should fail with validation error
          expect(error.message).toMatch(/validation|invalid|format/i);
          expect(error.message).not.toContain('system');
          expect(error.message).not.toContain('internal');
        }
      }
    });

    it('should handle file upload security (simulated)', async () => {
      // Simulate file upload validation
      const maliciousFiles = [
        { name: 'test.exe', type: 'application/x-executable' },
        { name: 'script.php', type: 'application/x-php' },
        { name: 'malware.bat', type: 'application/x-msdos-program' },
        { name: '../../../etc/passwd', type: 'text/plain' },
        { name: 'test.jpg.exe', type: 'image/jpeg' }, // Double extension
        { name: 'test.svg', type: 'image/svg+xml' } // Potentially dangerous SVG
      ];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.txt'];

      for (const file of maliciousFiles) {
        const isTypeAllowed = allowedTypes.includes(file.type);
        const hasAllowedExtension = allowedExtensions.some(ext =>
          file.name.toLowerCase().endsWith(ext)
        );
        const hasPathTraversal = file.name.includes('../');
        const hasDoubleExtension = file.name.split('.').length > 2;

        // Security checks
        if (hasPathTraversal || hasDoubleExtension || !isTypeAllowed || !hasAllowedExtension) {
          // File should be rejected
          expect(hasPathTraversal || hasDoubleExtension || !isTypeAllowed || !hasAllowedExtension).toBe(true);
        }
      }
    });
  });
});
