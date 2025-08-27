// Database Migration Utility - localStorage to PostgreSQL
import storage from '@core/storage';
import logger from '@utils/productionLogger';
import AuthUtils from './auth.js';

class DataMigrationService {
  constructor() {
    this.migrationStatus = {
      users: { total: 0, migrated: 0, errors: 0 },
      customers: { total: 0, migrated: 0, errors: 0 },
      products: { total: 0, migrated: 0, errors: 0 },
      orders: { total: 0, migrated: 0, errors: 0 },
      totalErrors: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Main migration function - migrates all data from localStorage to PostgreSQL
   */
  async migrateAllData() {
    try {
      this.migrationStatus.startTime = new Date();
      logger.info('🚀 Starting complete data migration from localStorage to PostgreSQL...');

      // Check if API is available
      const apiAvailable = await this._checkAPIAvailability();
      if (!apiAvailable) {
        throw new Error('API is not available. Cannot proceed with migration.');
      }

      // Backup current localStorage data
      await this._backupLocalStorageData();

      // Migrate in order (users first, then customers, products, orders)
      await this._migrateUsers();
      await this._migrateCustomers();
      await this._migrateProducts();
      await this._migrateOrders();

      this.migrationStatus.endTime = new Date();
      const duration = this.migrationStatus.endTime - this.migrationStatus.startTime;

      logger.info('✅ Data migration completed successfully!');
      logger.info('📊 Migration Summary:', {
        duration: `${Math.round(duration / 1000)}s`,
        users: this.migrationStatus.users,
        customers: this.migrationStatus.customers,
        products: this.migrationStatus.products,
        orders: this.migrationStatus.orders,
        totalErrors: this.migrationStatus.totalErrors.length
      });

      return {
        success: true,
        summary: this.migrationStatus,
        duration
      };

    } catch (error) {
      logger.error('❌ Data migration failed:', error);
      this.migrationStatus.endTime = new Date();
      return {
        success: false,
        error: error.message,
        summary: this.migrationStatus
      };
    }
  }

  /**
   * Check if API is available for migration
   */
  async _checkAPIAvailability() {
    try {
      // Import APIService dynamically to avoid circular dependencies
      const { default: APIService } = await import('../services/apiService.js');
      const healthCheck = await APIService.healthCheck();
      return healthCheck.success;
    } catch (error) {
      logger.error('❌ API availability check failed:', error);
      return false;
    }
  }

  /**
   * Backup localStorage data before migration
   */
  async _backupLocalStorageData() {
    try {
      logger.info('💾 Creating backup of localStorage data...');
      
      const backupData = {
        users: storage.get('users', []),
        customers: storage.get('customers', []),
        products: storage.get('products', []),
        orders: storage.get('orders', []),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      // Save backup to a special key
      await storage.set('migration_backup', backupData);
      
      // Also save to file if possible (for extra safety)
      if (typeof window !== 'undefined' && window.localStorage) {
        const backupJson = JSON.stringify(backupData, null, 2);
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `kirilmazlar_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      logger.info('✅ Backup created successfully');
    } catch (error) {
      logger.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Migrate users data
   */
  async _migrateUsers() {
    try {
      logger.info('👥 Migrating users...');
      
      const users = storage.get('users', []);
      this.migrationStatus.users.total = users.length;

      if (users.length === 0) {
        logger.info('ℹ️ No users to migrate');
        return;
      }

      const { default: APIService } = await import('../services/apiService.js');

      for (const user of users) {
        try {
          // Prepare user data for API
          const userData = {
            username: user.username,
            email: user.email,
            password_hash: user.password, // Already hashed
            full_name: user.name,
            role: user.role || 'customer',
            active: user.isActive !== false,
            phone: user.phone,
            created_at: user.createdAt || new Date().toISOString()
          };

          // Check if user already exists
          const existingUser = await APIService.get(`/users/check/${user.email}`);
          
          if (existingUser.exists) {
            logger.debug(`⏭️ User ${user.email} already exists, skipping`);
            this.migrationStatus.users.migrated++;
            continue;
          }

          // Create user via API
          const result = await APIService.post('/users/migrate', userData);
          
          if (result.success) {
            this.migrationStatus.users.migrated++;
            logger.debug(`✅ User migrated: ${user.email}`);
          } else {
            throw new Error(result.error || 'Unknown error');
          }

        } catch (error) {
          this.migrationStatus.users.errors++;
          this.migrationStatus.totalErrors.push(`User ${user.email}: ${error.message}`);
          logger.error(`❌ Failed to migrate user ${user.email}:`, error);
        }
      }

      logger.info(`✅ Users migration completed: ${this.migrationStatus.users.migrated}/${this.migrationStatus.users.total}`);
    } catch (error) {
      logger.error('❌ Users migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate customers data
   */
  async _migrateCustomers() {
    try {
      logger.info('🏢 Migrating customers...');
      
      const customers = storage.get('customers', []);
      this.migrationStatus.customers.total = customers.length;

      if (customers.length === 0) {
        logger.info('ℹ️ No customers to migrate');
        return;
      }

      const { default: APIService } = await import('../services/apiService.js');

      for (const customer of customers) {
        try {
          // Prepare customer data for API
          const customerData = {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            district: customer.district,
            postal_code: customer.postalCode,
            status: customer.status || 'active',
            total_orders: customer.totalOrders || 0,
            total_spent: customer.totalSpent || 0,
            loyalty_points: customer.loyaltyPoints || 0,
            created_at: customer.createdAt || new Date().toISOString()
          };

          // Check if customer already exists
          const existingCustomer = await APIService.get(`/customers/check/${customer.email}`);
          
          if (existingCustomer.exists) {
            logger.debug(`⏭️ Customer ${customer.email} already exists, skipping`);
            this.migrationStatus.customers.migrated++;
            continue;
          }

          // Create customer via API
          const result = await APIService.post('/customers/migrate', customerData);
          
          if (result.success) {
            this.migrationStatus.customers.migrated++;
            logger.debug(`✅ Customer migrated: ${customer.email}`);
          } else {
            throw new Error(result.error || 'Unknown error');
          }

        } catch (error) {
          this.migrationStatus.customers.errors++;
          this.migrationStatus.totalErrors.push(`Customer ${customer.email}: ${error.message}`);
          logger.error(`❌ Failed to migrate customer ${customer.email}:`, error);
        }
      }

      logger.info(`✅ Customers migration completed: ${this.migrationStatus.customers.migrated}/${this.migrationStatus.customers.total}`);
    } catch (error) {
      logger.error('❌ Customers migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate products data
   */
  async _migrateProducts() {
    try {
      logger.info('📦 Migrating products...');
      
      const products = storage.get('products', []);
      this.migrationStatus.products.total = products.length;

      if (products.length === 0) {
        logger.info('ℹ️ No products to migrate');
        return;
      }

      const { default: APIService } = await import('../services/apiService.js');

      for (const product of products) {
        try {
          // Prepare product data for API
          const productData = {
            name: product.name,
            description: product.description,
            sku: product.sku,
            category: product.category,
            price: parseFloat(product.price) || 0,
            cost_price: parseFloat(product.costPrice) || 0,
            stock_quantity: parseInt(product.stockQuantity) || 0,
            min_stock_level: parseInt(product.minStockLevel) || 0,
            status: product.status || 'active',
            weight: parseFloat(product.weight) || 0,
            dimensions: product.dimensions || '',
            barcode: product.barcode || '',
            supplier: product.supplier || '',
            created_at: product.createdAt || new Date().toISOString()
          };

          // Check if product already exists
          const existingProduct = await APIService.get(`/products/check/${product.sku}`);
          
          if (existingProduct.exists) {
            logger.debug(`⏭️ Product ${product.sku} already exists, skipping`);
            this.migrationStatus.products.migrated++;
            continue;
          }

          // Create product via API
          const result = await APIService.post('/products/migrate', productData);
          
          if (result.success) {
            this.migrationStatus.products.migrated++;
            logger.debug(`✅ Product migrated: ${product.sku}`);
          } else {
            throw new Error(result.error || 'Unknown error');
          }

        } catch (error) {
          this.migrationStatus.products.errors++;
          this.migrationStatus.totalErrors.push(`Product ${product.sku}: ${error.message}`);
          logger.error(`❌ Failed to migrate product ${product.sku}:`, error);
        }
      }

      logger.info(`✅ Products migration completed: ${this.migrationStatus.products.migrated}/${this.migrationStatus.products.total}`);
    } catch (error) {
      logger.error('❌ Products migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate orders data
   */
  async _migrateOrders() {
    try {
      logger.info('📋 Migrating orders...');
      
      const orders = storage.get('orders', []);
      this.migrationStatus.orders.total = orders.length;

      if (orders.length === 0) {
        logger.info('ℹ️ No orders to migrate');
        return;
      }

      const { default: APIService } = await import('../services/apiService.js');

      for (const order of orders) {
        try {
          // Prepare order data for API
          const orderData = {
            order_number: order.orderNumber,
            customer_email: order.customerEmail,
            status: order.status || 'pending',
            total_amount: parseFloat(order.totalAmount) || 0,
            tax_amount: parseFloat(order.taxAmount) || 0,
            shipping_amount: parseFloat(order.shippingAmount) || 0,
            discount_amount: parseFloat(order.discountAmount) || 0,
            payment_method: order.paymentMethod || 'cash',
            payment_status: order.paymentStatus || 'pending',
            shipping_address: order.shippingAddress || '',
            billing_address: order.billingAddress || '',
            notes: order.notes || '',
            items: order.items || [],
            created_at: order.createdAt || new Date().toISOString(),
            updated_at: order.updatedAt || new Date().toISOString()
          };

          // Check if order already exists
          const existingOrder = await APIService.get(`/orders/check/${order.orderNumber}`);
          
          if (existingOrder.exists) {
            logger.debug(`⏭️ Order ${order.orderNumber} already exists, skipping`);
            this.migrationStatus.orders.migrated++;
            continue;
          }

          // Create order via API
          const result = await APIService.post('/orders/migrate', orderData);
          
          if (result.success) {
            this.migrationStatus.orders.migrated++;
            logger.debug(`✅ Order migrated: ${order.orderNumber}`);
          } else {
            throw new Error(result.error || 'Unknown error');
          }

        } catch (error) {
          this.migrationStatus.orders.errors++;
          this.migrationStatus.totalErrors.push(`Order ${order.orderNumber}: ${error.message}`);
          logger.error(`❌ Failed to migrate order ${order.orderNumber}:`, error);
        }
      }

      logger.info(`✅ Orders migration completed: ${this.migrationStatus.orders.migrated}/${this.migrationStatus.orders.total}`);
    } catch (error) {
      logger.error('❌ Orders migration failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  getMigrationStatus() {
    return this.migrationStatus;
  }

  /**
   * Reset migration status
   */
  resetMigrationStatus() {
    this.migrationStatus = {
      users: { total: 0, migrated: 0, errors: 0 },
      customers: { total: 0, migrated: 0, errors: 0 },
      products: { total: 0, migrated: 0, errors: 0 },
      orders: { total: 0, migrated: 0, errors: 0 },
      totalErrors: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup() {
    try {
      logger.info('🔄 Restoring data from backup...');
      
      const backupData = storage.get('migration_backup');
      if (!backupData) {
        throw new Error('No backup data found');
      }

      // Restore each data type
      await storage.set('users', backupData.users || []);
      await storage.set('customers', backupData.customers || []);
      await storage.set('products', backupData.products || []);
      await storage.set('orders', backupData.orders || []);

      logger.info('✅ Data restored from backup successfully');
      return { success: true };
    } catch (error) {
      logger.error('❌ Restore from backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration() {
    try {
      logger.info('🔍 Verifying migration integrity...');
      
      const { default: APIService } = await import('../services/apiService.js');
      
      // Get counts from localStorage
      const localUsers = storage.get('users', []).length;
      const localCustomers = storage.get('customers', []).length;
      const localProducts = storage.get('products', []).length;
      const localOrders = storage.get('orders', []).length;

      // Get counts from API
      const apiCounts = await APIService.get('/migration/counts');
      
      const verification = {
        users: { local: localUsers, api: apiCounts.users, match: localUsers === apiCounts.users },
        customers: { local: localCustomers, api: apiCounts.customers, match: localCustomers === apiCounts.customers },
        products: { local: localProducts, api: apiCounts.products, match: localProducts === apiCounts.products },
        orders: { local: localOrders, api: apiCounts.orders, match: localOrders === apiCounts.orders }
      };

      const allMatch = Object.values(verification).every(item => item.match);
      
      logger.info('📊 Migration verification:', verification);
      
      return {
        success: allMatch,
        verification,
        message: allMatch ? 'Migration verified successfully' : 'Migration verification failed - data mismatch detected'
      };
    } catch (error) {
      logger.error('❌ Migration verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new DataMigrationService();