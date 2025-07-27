/**
 * P1.2.2: Customer-User Mapping Consistency Service
 * Customer ve User tabloları arası mapping tutarlılığını sağlar
 */

import storage from '@core/storage';

class CustomerUserMappingService {
  constructor() {
    this.isRepairing = false;
  }

  /**
   * Customer-User mapping tutarlılığını kontrol eder ve onarır
   * @returns {Promise<Object>} - Repair report
   */
  async repairAllMappings() {
    if (this.isRepairing) {
      console.log('⚠️ Mapping repair zaten çalışıyor...');
      return { success: false, message: 'Repair already in progress' };
    }

    this.isRepairing = true;
    console.log('🔧 P1.2.2: Customer-User mapping repair başlatılıyor...');

    try {
      const customers = await storage.get('customers', []);
      const users = await storage.get('users', []);

      const repairReport = {
        customersProcessed: customers.length,
        usersProcessed: users.filter(u => u.role === 'customer').length,
        orphanedUsersFixed: 0,
        missingCustomerIdsFixed: 0,
        missingUsersCreated: 0,
        dataInconsistenciesFixed: 0,
        errors: []
      };

      // 1. Orphaned user accounts düzeltme
      await this._fixOrphanedUsers(users, customers, repairReport);

      // 2. Missing customerId fields düzeltme
      await this._fixMissingCustomerIds(users, customers, repairReport);

      // 3. Missing user accounts oluşturma
      await this._createMissingUserAccounts(customers, users, repairReport);

      // 4. Data inconsistencies düzeltme
      await this._fixDataInconsistencies(users, customers, repairReport);

      console.log('✅ P1.2.2: Customer-User mapping repair tamamlandı');
      console.log('📊 Repair Summary:', repairReport);

      return { success: true, report: repairReport };
    } catch (error) {
      console.error('❌ P1.2.2: Mapping repair failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isRepairing = false;
    }
  }

  /**
   * Orphaned user accounts'ları düzeltir
   */
  async _fixOrphanedUsers(users, customers, report) {
    console.log('🔍 P1.2.2: Orphaned users kontrolü...');

    const customerUsers = users.filter(u => u.role === 'customer');
    const orphanedUsers = [];

    for (const user of customerUsers) {
      if (user.customerId) {
        const matchingCustomer = customers.find(c => c.id === user.customerId);
        if (!matchingCustomer) {
          orphanedUsers.push(user);
        }
      }
    }

    for (const orphanedUser of orphanedUsers) {
      try {
        // Email veya username ile matching customer ara
        const potentialCustomer = customers.find(c =>
          c.email === orphanedUser.email ||
          c.username === orphanedUser.username
        );

        if (potentialCustomer) {
          // CustomerId'yi düzelt
          const userIndex = users.findIndex(u => u.id === orphanedUser.id);
          users[userIndex].customerId = potentialCustomer.id;
          console.log(`✅ Orphaned user fixed: ${orphanedUser.email} -> ${potentialCustomer.id}`);
          report.orphanedUsersFixed++;
        } else {
          console.log(`⚠️ Orphaned user could not be matched: ${orphanedUser.email}`);
          report.errors.push(`Orphaned user: ${orphanedUser.email}`);
        }
      } catch (error) {
        console.error(`❌ Error fixing orphaned user ${orphanedUser.email}:`, error);
        report.errors.push(`Orphaned user error: ${orphanedUser.email}`);
      }
    }

    if (orphanedUsers.length > 0) {
      await storage.set('users', users);
    }
  }

  /**
   * Missing customerId fields'ları düzeltir
   */
  async _fixMissingCustomerIds(users, customers, report) {
    console.log('🔍 P1.2.2: Missing customerId kontrolü...');

    const customerUsers = users.filter(u => u.role === 'customer' && !u.customerId);

    for (const user of customerUsers) {
      try {
        // Email veya username ile customer ara
        const matchingCustomer = customers.find(c =>
          c.email === user.email ||
          c.username === user.username
        );

        if (matchingCustomer) {
          const userIndex = users.findIndex(u => u.id === user.id);
          users[userIndex].customerId = matchingCustomer.id;
          console.log(`✅ Missing customerId fixed: ${user.email} -> ${matchingCustomer.id}`);
          report.missingCustomerIdsFixed++;
        } else {
          console.log(`⚠️ No matching customer for user: ${user.email}`);
          report.errors.push(`No customer match: ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error fixing customerId for ${user.email}:`, error);
        report.errors.push(`CustomerId fix error: ${user.email}`);
      }
    }

    if (customerUsers.length > 0) {
      await storage.set('users', users);
    }
  }

  /**
   * Missing user accounts oluşturur
   */
  async _createMissingUserAccounts(customers, users, report) {
    console.log('🔍 P1.2.2: Missing user accounts kontrolü...');

    for (const customer of customers) {
      try {
        const existingUser = users.find(u =>
          u.customerId === customer.id ||
          u.email === customer.email ||
          u.username === customer.username
        );

        if (!existingUser && customer.username && customer.password) {
          const newUser = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            username: customer.username,
            email: customer.email,
            password: customer.password,
            name: customer.name,
            phone: customer.phone,
            role: 'customer',
            customerId: customer.id,
            createdAt: new Date().toISOString(),
            isActive: true,
            _autoCreated: true // Flag for tracking
          };

          users.push(newUser);
          console.log(`✅ Missing user account created: ${customer.email}`);
          report.missingUsersCreated++;
        }
      } catch (error) {
        console.error(`❌ Error creating user for ${customer.email}:`, error);
        report.errors.push(`User creation error: ${customer.email}`);
      }
    }

    if (report.missingUsersCreated > 0) {
      await storage.set('users', users);
    }
  }

  /**
   * Data inconsistencies'leri düzeltir
   */
  async _fixDataInconsistencies(users, customers, report) {
    console.log('🔍 P1.2.2: Data inconsistencies kontrolü...');

    const customerUsers = users.filter(u => u.role === 'customer' && u.customerId);

    for (const user of customerUsers) {
      try {
        const customer = customers.find(c => c.id === user.customerId);
        if (!customer) continue;

        let hasChanges = false;
        const userIndex = users.findIndex(u => u.id === user.id);

        // Phone number sync
        if (customer.phone !== user.phone && customer.phone) {
          users[userIndex].phone = customer.phone;
          hasChanges = true;
          console.log(`🔄 Phone synced for ${user.email}: ${user.phone} -> ${customer.phone}`);
        }

        // Name sync 
        if (customer.name !== user.name && customer.name) {
          users[userIndex].name = customer.name;
          hasChanges = true;
          console.log(`🔄 Name synced for ${user.email}: ${user.name} -> ${customer.name}`);
        }

        // Address sync (user'da yoksa customer'dan al)
        if (!user.address && customer.address) {
          users[userIndex].address = customer.address;
          users[userIndex].city = customer.city;
          users[userIndex].district = customer.district;
          hasChanges = true;
          console.log(`🔄 Address synced for ${user.email}`);
        }

        if (hasChanges) {
          report.dataInconsistenciesFixed++;
        }
      } catch (error) {
        console.error(`❌ Error fixing inconsistencies for ${user.email}:`, error);
        report.errors.push(`Data sync error: ${user.email}`);
      }
    }

    if (report.dataInconsistenciesFixed > 0) {
      await storage.set('users', users);
    }
  }

  /**
   * Mapping health check - tutarlılık kontrolü
   * @returns {Promise<Object>} - Health report
   */
  async healthCheck() {
    console.log('🔍 P1.2.2: Customer-User mapping health check...');

    try {
      const customers = await storage.get('customers', []);
      const users = await storage.get('users', []);
      const customerUsers = users.filter(u => u.role === 'customer');

      const healthReport = {
        totalCustomers: customers.length,
        totalCustomerUsers: customerUsers.length,
        healthyMappings: 0,
        orphanedUsers: 0,
        missingCustomerIds: 0,
        missingUsers: 0,
        dataInconsistencies: 0,
        overallHealth: 'good' // good, warning, critical
      };

      // Check each customer
      for (const customer of customers) {
        const matchingUser = customerUsers.find(u =>
          u.customerId === customer.id ||
          u.email === customer.email ||
          u.username === customer.username
        );

        if (!matchingUser) {
          healthReport.missingUsers++;
        } else {
          if (!matchingUser.customerId) {
            healthReport.missingCustomerIds++;
          }

          if (matchingUser.phone !== customer.phone ||
            matchingUser.name !== customer.name) {
            healthReport.dataInconsistencies++;
          }

          if (matchingUser.customerId === customer.id) {
            healthReport.healthyMappings++;
          }
        }
      }

      // Check orphaned users
      for (const user of customerUsers) {
        if (user.customerId) {
          const matchingCustomer = customers.find(c => c.id === user.customerId);
          if (!matchingCustomer) {
            healthReport.orphanedUsers++;
          }
        }
      }

      // Determine overall health
      const totalIssues = healthReport.orphanedUsers +
        healthReport.missingCustomerIds +
        healthReport.missingUsers +
        healthReport.dataInconsistencies;

      if (totalIssues === 0) {
        healthReport.overallHealth = 'good';
      } else if (totalIssues <= 3) {
        healthReport.overallHealth = 'warning';
      } else {
        healthReport.overallHealth = 'critical';
      }

      console.log('📊 Mapping Health Report:', healthReport);
      return { success: true, health: healthReport };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-repair kuru çalıştırır
   * @returns {Promise<boolean>} - Repair needed?
   */
  async isRepairNeeded() {
    const health = await this.healthCheck();
    if (!health.success) return false;

    const totalIssues = health.health.orphanedUsers +
      health.health.missingCustomerIds +
      health.health.missingUsers +
      health.health.dataInconsistencies;

    return totalIssues > 0;
  }
}

export default new CustomerUserMappingService();
