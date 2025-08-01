/**
 * KIRILMAZLAR Panel - Veri Şeması Tanımlamaları
 * 
 * Bu dosya, uygulamada kullanılan veri yapılarının şemalarını tanımlar.
 * Veri yapısı değişikliklerinde bu şemalar güncellenmeli ve migration stratejisi uygulanmalıdır.
 */

// Ürün şeması
export const productSchema = {
  version: '1.0',
  required: ['id', 'name', 'price', 'unit'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    unit: { type: 'string' },
    category: { type: 'string', default: 'Genel' },
    subcategory: { type: 'string', default: '' },
    description: { type: 'string', default: '' },
    image: { type: 'string', default: '' },
    stock: { type: 'number', default: 0 },
    isActive: { type: 'boolean', default: true },
    status: { type: 'string', enum: ['active', 'inactive', 'available', 'unavailable'], default: 'active' },
    isAvailable: { type: 'boolean', default: true },
    isOrganic: { type: 'boolean', default: false },
    discount: { type: 'number', default: 0 },
    rating: { type: 'number', default: 5 },
    seller_id: { type: 'string' },
    gallery: { type: 'array', items: { type: 'string' }, default: [] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// Sipariş şeması
export const orderSchema = {
  version: '1.0',
  required: ['id', 'date', 'status', 'items'],
  properties: {
    id: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    status: { 
      type: 'string', 
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending'
    },
    total: { type: 'number', minimum: 0 },
    itemCount: { type: 'number', minimum: 0 },
    deliveryAddress: { type: 'string' },
    estimatedDelivery: { type: 'string', format: 'date-time' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'quantity', 'price'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          quantity: { type: 'number', minimum: 1 },
          unit: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          total: { type: 'number', minimum: 0 },
          image: { type: 'string' }
        }
      }
    },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          time: { type: 'string', format: 'date-time' },
          completed: { type: 'boolean', default: false }
        }
      }
    },
    canCancel: { type: 'boolean', default: true },
    canReorder: { type: 'boolean', default: true },
    notes: { type: 'string', default: '' },
    isDemo: { type: 'boolean', default: false },
    customerId: { type: 'string' },
    sellerId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// Müşteri şeması
export const customerSchema = {
  version: '1.0',
  required: ['id', 'name'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    full_name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    address: { type: 'string' },
    role: { type: 'string', default: 'customer' },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// Kullanıcı şeması
export const userSchema = {
  version: '1.0',
  required: ['id', 'username', 'role'],
  properties: {
    id: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
    email: { type: 'string', format: 'email' },
    full_name: { type: 'string' },
    role: { 
      type: 'string', 
      enum: ['admin', 'seller', 'customer'],
      default: 'customer'
    },
    permissions: { type: 'array', items: { type: 'string' }, default: [] },
    active: { type: 'boolean', default: true },
    lastLogin: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// İşletme bilgileri şeması
export const businessSchema = {
  version: '1.0',
  properties: {
    companyName: { type: 'string', default: 'KIRILMAZLAR Gıda' },
    companyTitle: { type: 'string', default: 'Gıda Tedarik ve Dağıtım' },
    address: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    logo: { type: 'string' }
  }
};

// Şema versiyonları
export const schemaVersions = {
  product: '1.0',
  order: '1.0',
  customer: '1.0',
  user: '1.0',
  business: '1.0'
};

// Tüm şemalar
export const schemas = {
  product: productSchema,
  order: orderSchema,
  customer: customerSchema,
  user: userSchema,
  business: businessSchema
};

export default schemas;
