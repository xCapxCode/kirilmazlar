import storage from '../../core/storage/index.js';

const demoProducts = [
  { id: 1, name: 'Domates', image_url: '/assets/images/products/tomatoes.png', price: '20.00', unit: 'kg', rating: 4, status: 'active', stock: 100, category: 'Sebzeler' },
  { id: 2, name: 'Karnabahar', image_url: '/assets/images/products/cauliflower.png', price: '15.00', unit: 'adet', rating: 5, status: 'active', stock: 50, category: 'Sebzeler' },
  { id: 3, name: 'Mısır', image_url: '/assets/images/products/corn.png', price: '10.00', unit: 'adet', rating: 3, status: 'active', stock: 80, category: 'Sebzeler' },
  { id: 4, name: 'Lahana', image_url: '/assets/images/products/cabbage.png', price: '12.00', unit: 'adet', rating: 5, status: 'active', stock: 60, category: 'Sebzeler' },
  { id: 5, name: 'Limon', image_url: '/assets/images/products/lemons.png', price: '18.00', unit: 'kg', rating: 4, status: 'active', stock: 70, category: 'Meyveler' },
  { id: 6, name: 'Salatalık', image_url: '/assets/images/products/cucumbers.png', price: '14.00', unit: 'kg', rating: 5, status: 'active', stock: 90, category: 'Sebzeler' },
  { id: 7, name: 'Pancar', image_url: '/assets/images/products/beetroot.png', price: '22.00', unit: 'kg', rating: 4, status: 'active', stock: 40, category: 'Sebzeler' },
  { id: 8, name: 'Patates', image_url: '/assets/images/products/potatoes.png', price: '8.00', unit: 'kg', rating: 5, status: 'active', stock: 100, category: 'Sebzeler' },
];

const productsService = {
  getAll: async () => {
    const products = storage.get('products', []);
    return { success: true, data: products };
  },
  create: async (productData) => {
    const products = storage.get('products', []);
    const newProduct = {
      ...productData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.push(newProduct);
    storage.set('products', products);
    return { success: true, data: newProduct };
  },
  update: async (id, updates) => {
    const products = storage.get('products', []);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() };
      storage.set('products', products);
      return { success: true, data: products[index] };
    }
    return { success: false, error: 'Ürün bulunamadı.' };
  },
  delete: async (id) => {
    const products = storage.get('products', []);
    const filteredProducts = products.filter(p => p.id !== id);
    storage.set('products', filteredProducts);
    return { success: true };
  },
  initializeDemoProducts: () => {
    const existingProducts = storage.get('products', []);
    if (existingProducts.length === 0) {
      storage.set('products', demoProducts);
      console.log('Demo ürünler yüklendi.');
    }
  }
};

const ordersService = {
  getAll: async () => {
    const orders = storage.get('orders', []);
    return { success: true, data: orders };
  },
  create: async (orderData) => {
    const orders = storage.get('orders', []);
    const newOrder = {
      ...orderData,
      id: Date.now(),
      order_number: `SIP-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    orders.push(newOrder);
    storage.set('orders', orders);
    return { success: true, data: newOrder };
  },
  updateStatus: async (id, status) => {
    const orders = storage.get('orders', []);
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], status, updated_at: new Date().toISOString() };
      storage.set('orders', orders);
      return { success: true, data: orders[index] };
    }
    return { success: false, error: 'Sipariş bulunamadı.' };
  }
};

const categoriesService = {
  getAll: async () => {
    const categories = [
      { id: 1, name: 'sebzeler', display_name: 'Sebzeler', is_active: true },
      { id: 2, name: 'meyveler', display_name: 'Meyveler', is_active: true },
      { id: 3, name: 'kuruyemis', display_name: 'Kuruyemiş', is_active: true }
    ];
    return { success: true, data: categories };
  },
  create: async () => {
    return { success: false, error: 'Demo modda kategori ekleme desteklenmiyor.' };
  }
};

const unitsService = {
  getAll: async () => {
    const units = [
      { id: 1, name: 'kg', display_name: 'Kilogram', is_active: true },
      { id: 2, name: 'adet', display_name: 'Adet', is_active: true },
      { id: 3, name: 'kasa', display_name: 'Kasa', is_active: true },
      { id: 4, name: 'cuval', display_name: 'Çuval', is_active: true },
      { id: 5, name: 'demet', display_name: 'Demet', is_active: true },
      { id: 6, name: 'paket', display_name: 'Paket', is_active: true },
      { id: 7, name: 'gram', display_name: 'Gram', is_active: true }
    ];
    return { success: true, data: units };
  },
  create: async () => {
    return { success: false, error: 'Demo modda birim ekleme desteklenmiyor.' };
  },
  update: async () => {
    return { success: true };
  },
  delete: async () => {
    return { success: true };
  }
};

const settingsService = {
  get: async (key) => {
    const settings = JSON.parse(localStorage.getItem(`settings_${key}`) || '{}');
    return { success: true, data: settings };
  },
  set: async (key, value) => {
    localStorage.setItem(`settings_${key}`, JSON.stringify(value));
    return { success: true };
  }
};

export default {
  productsService,
  ordersService,
  categoriesService,
  unitsService,
  settingsService
};
