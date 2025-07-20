import storage from '@core/storage';

/**
 * Rol ve yetki yönetimi servisi
 */
class AuthorizationService {
  constructor() {
    this.roles = [
      {
        id: 'admin',
        name: 'Ana Yönetici',
        description: 'Tam yetkili sistem yöneticisi',
        permissions: ['*'] // Tüm yetkiler
      },
      {
        id: 'manager',
        name: 'Yönetici',
        description: 'Sınırlı yetkili yönetici',
        permissions: [
          'dashboard:view',
          'products:view', 'products:create', 'products:edit', 'products:delete',
          'orders:view', 'orders:edit', 'orders:process',
          'customers:view', 'customers:edit',
          'settings:view', 'settings:edit'
        ]
      },
      {
        id: 'seller',
        name: 'Satıcı',
        description: 'Satış personeli',
        permissions: [
          'dashboard:view',
          'products:view', 'products:create', 'products:edit',
          'orders:view', 'orders:process',
          'customers:view'
        ]
      },
      {
        id: 'customer',
        name: 'Müşteri',
        description: 'Müşteri hesabı',
        permissions: [
          'customer:dashboard:view',
          'customer:products:view',
          'customer:orders:view', 'customer:orders:create', 'customer:orders:cancel',
          'customer:profile:view', 'customer:profile:edit'
        ]
      },
      {
        id: 'demo_seller',
        name: 'Demo Satıcı',
        description: 'Demo satıcı hesabı',
        permissions: [
          'dashboard:view',
          'products:view',
          'orders:view',
          'customers:view'
        ]
      },
      {
        id: 'demo_customer',
        name: 'Demo Müşteri',
        description: 'Demo müşteri hesabı',
        permissions: [
          'customer:dashboard:view',
          'customer:products:view',
          'customer:orders:view'
        ]
      }
    ];
  }

  /**
   * Tüm rolleri getirir
   * @returns {Array} - Roller listesi
   */
  getRoles() {
    const savedRoles = storage.get('roles');
    return savedRoles || this.roles;
  }

  /**
   * Belirli bir rolü getirir
   * @param {string} roleId - Rol ID'si
   * @returns {Object|null} - Rol nesnesi veya null
   */
  getRole(roleId) {
    const roles = this.getRoles();
    return roles.find(role => role.id === roleId) || null;
  }

  /**
   * Kullanıcının rolünü getirir
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {Object|null} - Rol nesnesi veya null
   */
  getUserRole(user) {
    if (!user) return null;
    
    // Rol ID'sini belirle
    let roleId;
    
    if (typeof user.role === 'string') {
      // Rol doğrudan string olarak verilmiş
      roleId = user.role.toLowerCase().replace(' ', '_');
    } else if (user.roleId) {
      // Rol ID'si doğrudan verilmiş
      roleId = user.roleId;
    } else {
      // Varsayılan rol
      roleId = 'customer';
    }
    
    // Rol nesnesini getir
    return this.getRole(roleId);
  }

  /**
   * Kullanıcının yetkilerini getirir
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {Array} - Yetkiler listesi
   */
  getUserPermissions(user) {
    if (!user) return [];
    
    const role = this.getUserRole(user);
    if (!role) return [];
    
    return role.permissions;
  }

  /**
   * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @param {string} permission - Kontrol edilecek yetki
   * @returns {boolean} - Yetki varsa true, yoksa false
   */
  hasPermission(user, permission) {
    if (!user) return false;
    
    const permissions = this.getUserPermissions(user);
    
    // Tüm yetkiler kontrolü
    if (permissions.includes('*')) return true;
    
    // Doğrudan yetki kontrolü
    if (permissions.includes(permission)) return true;
    
    // Yetki grubu kontrolü (örn: products:* tüm ürün yetkilerini kapsar)
    const permissionGroup = permission.split(':')[0] + ':*';
    if (permissions.includes(permissionGroup)) return true;
    
    return false;
  }

  /**
   * Kullanıcının belirli bir rol olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @param {string} roleId - Kontrol edilecek rol ID'si
   * @returns {boolean} - Rol eşleşiyorsa true, yoksa false
   */
  hasRole(user, roleId) {
    if (!user) return false;
    
    const role = this.getUserRole(user);
    if (!role) return false;
    
    return role.id === roleId;
  }

  /**
   * Kullanıcının yönetici olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {boolean} - Yönetici ise true, değilse false
   */
  isAdmin(user) {
    return this.hasRole(user, 'admin') || this.hasRole(user, 'manager');
  }

  /**
   * Kullanıcının satıcı olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {boolean} - Satıcı ise true, değilse false
   */
  isSeller(user) {
    return this.hasRole(user, 'seller') || this.hasRole(user, 'demo_seller') || this.isAdmin(user);
  }

  /**
   * Kullanıcının müşteri olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {boolean} - Müşteri ise true, değilse false
   */
  isCustomer(user) {
    return this.hasRole(user, 'customer') || this.hasRole(user, 'demo_customer');
  }

  /**
   * Kullanıcının demo hesap olup olmadığını kontrol eder
   * @param {Object} user - Kullanıcı nesnesi
   * @returns {boolean} - Demo hesap ise true, değilse false
   */
  isDemo(user) {
    return this.hasRole(user, 'demo_seller') || this.hasRole(user, 'demo_customer');
  }

  /**
   * Yeni bir rol oluşturur
   * @param {Object} roleData - Rol verileri
   * @returns {Object} - Oluşturulan rol
   */
  createRole(roleData) {
    const roles = this.getRoles();
    
    // ID oluştur
    const roleId = roleData.id || roleData.name.toLowerCase().replace(/\s+/g, '_');
    
    // Yeni rol
    const newRole = {
      id: roleId,
      name: roleData.name,
      description: roleData.description || '',
      permissions: roleData.permissions || []
    };
    
    // Rollere ekle
    const updatedRoles = [...roles, newRole];
    storage.set('roles', updatedRoles);
    
    return newRole;
  }

  /**
   * Bir rolü günceller
   * @param {string} roleId - Güncellenecek rol ID'si
   * @param {Object} roleData - Güncellenecek rol verileri
   * @returns {Object|null} - Güncellenen rol veya null
   */
  updateRole(roleId, roleData) {
    const roles = this.getRoles();
    const roleIndex = roles.findIndex(role => role.id === roleId);
    
    if (roleIndex === -1) return null;
    
    // Rolü güncelle
    const updatedRole = {
      ...roles[roleIndex],
      ...roleData,
      id: roleId // ID değiştirilemez
    };
    
    // Rolleri güncelle
    const updatedRoles = [
      ...roles.slice(0, roleIndex),
      updatedRole,
      ...roles.slice(roleIndex + 1)
    ];
    storage.set('roles', updatedRoles);
    
    return updatedRole;
  }

  /**
   * Bir rolü siler
   * @param {string} roleId - Silinecek rol ID'si
   * @returns {boolean} - Başarılı ise true, değilse false
   */
  deleteRole(roleId) {
    // Temel rolleri silmeye izin verme
    if (['admin', 'manager', 'seller', 'customer', 'demo_seller', 'demo_customer'].includes(roleId)) {
      return false;
    }
    
    const roles = this.getRoles();
    const updatedRoles = roles.filter(role => role.id !== roleId);
    
    if (updatedRoles.length === roles.length) {
      return false; // Rol bulunamadı
    }
    
    storage.set('roles', updatedRoles);
    return true;
  }
}

export default new AuthorizationService();
