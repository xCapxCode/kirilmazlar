import storage from '@core/storage';
import { createContext, useContext, useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import orderService from '../services/orderService';
import { logger } from '../utils/productionLogger.js';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const { userProfile } = useAuth();

  // Load cart from unified storage on mount
  useEffect(() => {
    try {
      const savedCart = storage.get('cart', []);
      logger.debug('Loading cart from unified storage:', savedCart);

      // Veri doğrulama
      const validatedCart = savedCart.map(item => ({
        id: item.id,
        name: item.name || 'Bilinmeyen Ürün',
        price: Number(item.price) || 0,
        unit: item.unit || 'adet',
        quantity: Number(item.quantity) || 1,
        image: item.image || '',
        total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 1)
      }));

      logger.debug('Validated cart:', validatedCart);
      setCartItems(validatedCart);
    } catch (error) {
      logger.error('Error loading cart from storage:', error);
      setCartItems([]);
    }
  }, []);

  // Load customer-specific orders when user profile changes
  useEffect(() => {
    const loadCustomerOrders = async () => {
      if (!userProfile?.id) {
        logger.debug('🛒 CartContext - No user profile, clearing orders');
        setOrders([]);
        return;
      }

      try {
        logger.debug('🛒 CartContext - Loading orders for customer:', userProfile.id);
        const customerOrders = await orderService.getByCustomerId(userProfile.id);

        const ordersWithDates = customerOrders.map(order => ({
          ...order,
          date: new Date(order.orderDate || order.createdAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
          timeline: order.timeline ? order.timeline.map(t => ({
            ...t,
            time: t.time ? new Date(t.time) : null
          })) : []
        }));

        logger.info('🛒 CartContext - Customer orders loaded:', ordersWithDates.length);
        setOrders(ordersWithDates);
      } catch (error) {
        logger.error('🛒 CartContext - Error loading customer orders:', error);
        setOrders([]);
      }
    };

    loadCustomerOrders();
  }, [userProfile?.id]);

  // Save cart to unified storage whenever it changes
  useEffect(() => {
    storage.set('cart', cartItems);
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    logger.debug('Adding to cart:', product, 'quantity:', quantity);

    // Veri doğrulama
    if (!product || !product.id) {
      logger.error('Invalid product data:', product);
      return;
    }

    const validQuantity = Number(quantity) || 1;
    const validPrice = Number(product.price) || 0;

    // Stok kontrolü
    if (product.stock !== undefined && product.stock < validQuantity) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: `Yetersiz stok! Mevcut stok: ${product.stock} ${product.unit}`,
          type: 'error'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    // Sepete ekleme işlemi
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = Number(existingItem.quantity) + validQuantity;

        // Toplam miktar stok kontrolü
        if (newQuantity > product.stock) {
          const event = new CustomEvent('showToast', {
            detail: {
              message: `Maksimum stok miktarına ulaştınız! Mevcut stok: ${product.stock} ${product.unit}`,
              type: 'error'
            }
          });
          window.dispatchEvent(event);
          return prev;
        }

        return prev.map(item =>
          item.id === product.id
            ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * Number(item.price)
            }
            : item
        );
      }

      const newItem = {
        id: product.id,
        name: product.name || 'Bilinmeyen Ürün',
        price: validPrice,
        unit: product.unit || 'adet',
        quantity: validQuantity,
        image: product.image || '',
        total: validPrice * validQuantity
      };

      logger.debug('New cart item:', newItem);
      return [...prev, newItem];
    });

    // Stoktan düş - sadece yeni eklenen miktar kadar
    reduceStock(product.id, validQuantity);
  };

  const removeFromCart = (productId) => {
    // Silinen ürünün miktarını al ve stoka geri ekle
    const removedItem = cartItems.find(item => item.id === productId);
    if (removedItem) {
      // Stoka geri ekle (negatif miktar ile stok artır)
      const products = storage.get('products', []);
      const product = products.find(p => p.id === productId);
      if (product) {
        updateProductStock(productId, product.stock + removedItem.quantity);
      }
    }

    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const validQuantity = Number(quantity) || 0;
    logger.debug('Updating quantity for product:', productId, 'to:', validQuantity);

    if (validQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Mevcut sepetteki miktar ile karşılaştır
    const currentItem = cartItems.find(item => item.id === productId);
    if (currentItem) {
      const difference = validQuantity - currentItem.quantity;

      if (difference > 0) {
        // Miktar artıyor - stok kontrolü yap
        const products = storage.get('products', []);
        const product = products.find(p => p.id === productId);

        if (product && product.stock < difference) {
          const event = new CustomEvent('showToast', {
            detail: {
              message: `Yetersiz stok! Mevcut stok: ${product.stock} ${product.unit}`,
              type: 'error'
            }
          });
          window.dispatchEvent(event);
          return;
        }

        // Stoktan düş
        reduceStock(productId, difference);
      } else if (difference < 0) {
        // Miktar azalıyor - stoka geri ekle
        const products = storage.get('products', []);
        const product = products.find(p => p.id === productId);
        if (product) {
          updateProductStock(productId, product.stock + Math.abs(difference));
        }
      }
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? {
            ...item,
            quantity: validQuantity,
            total: validQuantity * Number(item.price)
          }
          : item
      )
    );
  };

  const clearCart = (restoreStock = false) => {
    if (restoreStock) {
      // Sepetteki tüm ürünleri stoka geri ekle
      cartItems.forEach(item => {
        const products = storage.get('products', []);
        const product = products.find(p => p.id === item.id);
        if (product) {
          updateProductStock(item.id, product.stock + item.quantity);
        }
      });
    }

    setCartItems([]);
    storage.remove('cart');
    logger.info('Cart cleared from unified storage');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Unique ID generator
  const generateUniqueOrderId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const uniqueId = `SIP-${timestamp}-${randomNum}`;

    // Mevcut siparişlerde bu ID var mı kontrol et
    const existingOrders = storage.get('customerOrders', []);
    const sellerOrders = storage.get('sellerOrders', []);
    const allOrders = [...existingOrders, ...sellerOrders];

    // Eğer aynı ID varsa yeniden generate et
    if (allOrders.some(order => order.id === uniqueId)) {
      return generateUniqueOrderId();
    }

    return uniqueId;
  };

  // Yeni sipariş ekleme fonksiyonu
  const addNewOrder = async (orderData) => {
    try {
      logger.info('🛒 CartContext - OrderService ile sipariş oluşturuluyor:', orderData);

      // OrderService kullanarak sipariş oluştur
      const newOrder = await orderService.create(orderData);

      logger.info('✅ CartContext - Sipariş başarıyla oluşturuldu:', newOrder);

      // Local state'i güncelle
      const stateOrder = {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        date: new Date(newOrder.createdAt),
        status: newOrder.status,
        total: newOrder.total,
        itemCount: newOrder.items?.length || 0,
        deliveryAddress: newOrder.deliveryAddress,
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: newOrder.items || [],
        timeline: [
          { status: "confirmed", time: null, completed: false },
          { status: "preparing", time: null, completed: false },
          { status: "out_for_delivery", time: null, completed: false },
          { status: "delivered", time: null, completed: false }
        ],
        canCancel: true,
        canReorder: true,
        notes: newOrder.notes || "",
        customerId: newOrder.customerId,
        isDemo: false
      };

      setOrders(prev => [stateOrder, ...prev]);

      // Bildirim sistemi - Yeni sipariş bildirimi
      try {
        notificationService.notifyNewOrder({
          id: newOrder.orderNumber,
          customerName: orderData.customerName || orderData.customerId || 'Müşteri'
        });
      } catch (notifError) {
        logger.warn('Sipariş bildirimi gönderilemedi:', notifError);
      }

      logger.info('Yeni sipariş eklendi ve senkronize edildi:', newOrder.orderNumber);
      return newOrder.orderNumber; // Order number'ı döndür
    } catch (error) {
      logger.error('❌ CartContext - Sipariş oluşturma hatası:', error);
      throw error;
    }
  };

  // Stok yönetimi fonksiyonları
  const updateProductStock = (productId, newStock) => {
    // Mevcut ürünleri al
    const products = storage.get('products', []);

    // Ürünü bul ve stokunu güncelle
    const updatedProducts = products.map(product =>
      product.id === productId
        ? { ...product, stock: Math.max(0, newStock), isAvailable: newStock > 0 }
        : product
    );

    // Güncellenmiş ürünleri kaydet
    storage.set('products', updatedProducts);

    logger.info(`Ürün ${productId} stoku güncellendi: ${newStock}`);
  };

  const reduceStock = (productId, quantity) => {
    const products = storage.get('products', []);
    const product = products.find(p => p.id === productId);

    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      updateProductStock(productId, newStock);

      // Stok biterse toast göster
      if (newStock === 0) {
        // Stok tükendi bildirimi
        try {
          notificationService.notifySystem(
            'Stok Tükendi',
            `${product.name} ürününün stoku bitti!`,
            'warning'
          );
        } catch (error) {
          logger.warn('Stok tükenme bildirimi gönderilemedi:', error);
        }
      } else if (newStock <= 10) {
        // Düşük stok uyarısı
        try {
          notificationService.notifyLowStock({
            id: productId,
            name: product.name,
            stock: newStock
          });
        } catch (error) {
          logger.warn('Düşük stok bildirimi gönderilemedi:', error);
        }
      }
    }
  };

  const value = {
    items: cartItems, // Mobil uyumluluk için items alias'ı
    cartItems,
    orders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    addNewOrder,
    updateProductStock,
    reduceStock
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
