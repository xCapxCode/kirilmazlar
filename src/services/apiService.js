/**
 * API Service - Backend API ile iletişim için merkezi servis
 * localStorage yerine gerçek API çağrıları yapar
 */

import logger from '../utils/productionLogger.js';

class APIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.token = this.getStoredToken();
    this.isOnline = navigator.onLine;
    
    // Network status listener
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('🌐 Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('🌐 Network connection lost');
    });
  }

  /**
   * Get stored authentication token
   */
  getStoredToken() {
    return localStorage.getItem('kirilmazlar_auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('kirilmazlar_auth_token', token);
    } else {
      localStorage.removeItem('kirilmazlar_auth_token');
    }
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      logger.debug(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth_token_expired'));
          throw new Error('Authentication required');
        }
        
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      logger.debug(`✅ API Response: ${url}`, data);
      return data;
    } catch (error) {
      logger.error(`❌ API Error: ${url}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Authentication API calls
  async login(username, password, rememberMe = false) {
    const response = await this.post('/auth/login', {
      username,
      password,
      rememberMe
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async validateToken() {
    return this.post('/auth/validate');
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      logger.warn('Logout API call failed:', error);
    } finally {
      this.setToken(null);
    }
  }

  async refreshToken() {
    const response = await this.post('/auth/refresh');
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // Users API calls
  async getUsers(params = {}) {
    return this.get('/users', params);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async changePassword(id, passwordData) {
    return this.put(`/users/${id}/password`, passwordData);
  }

  async getUserStats() {
    return this.get('/users/stats/overview');
  }

  // Customers API calls
  async getCustomers(params = {}) {
    return this.get('/customers', params);
  }

  async getCustomer(id) {
    return this.get(`/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.post('/customers', customerData);
  }

  async updateCustomer(id, customerData) {
    return this.put(`/customers/${id}`, customerData);
  }

  async deleteCustomer(id) {
    return this.delete(`/customers/${id}`);
  }

  async updateCustomerLoyalty(id, loyaltyData) {
    return this.put(`/customers/${id}/loyalty`, loyaltyData);
  }

  async getCustomerStats() {
    return this.get('/customers/stats/overview');
  }

  // Products API calls
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  async updateProductStock(id, stockData) {
    return this.put(`/products/${id}/stock`, stockData);
  }

  async getProductStats() {
    return this.get('/products/stats/overview');
  }

  async getCategories() {
    return this.get('/products/categories/list');
  }

  // Orders API calls
  async getOrders(params = {}) {
    return this.get('/orders', params);
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async updateOrderStatus(id, statusData) {
    return this.put(`/orders/${id}/status`, statusData);
  }

  async updateOrderPayment(id, paymentData) {
    return this.put(`/orders/${id}/payment`, paymentData);
  }

  async getOrderStats() {
    return this.get('/orders/stats/overview');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;