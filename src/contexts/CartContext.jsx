import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderSyncUtils } from '../shared/utils/orderSyncUtils';
import storage from '@core/storage';

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

  // Load cart from unified storage on mount
  useEffect(() => {
    try {
      const savedCart = storage.get('cart', []);
      console.log('Loading cart from unified storage:', savedCart);
      
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
      
      console.log('Validated cart:', validatedCart);
      setCartItems(validatedCart);
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      setCartItems([]);
    }
  }, []);

  // Load orders from unified storage on mount
  useEffect(() => {
    try {
      const savedOrders = storage.get('customer_orders', []);
      console.log('Loading orders from unified storage:', savedOrders);
      
      const ordersWithDates = savedOrders.map(order => ({
        ...order,
        date: new Date(order.date || order.createdAt),
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
        timeline: order.timeline ? order.timeline.map(t => ({
          ...t,
          time: t.time ? new Date(t.time) : null
        })) : []
      }));
      setOrders(ordersWithDates);
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      setOrders([]);
    }
  }, []);

  // Save cart to unified storage whenever it changes
  useEffect(() => {
    storage.set('cart', cartItems);
  }, [cartItems]);

  // Save orders to unified storage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      const realOrders = orders.filter(order => !order.isDemo);
      if (realOrders.length > 0) {
        storage.set('customerOrders', realOrders);
      } else {
        storage.remove('customerOrders');
      }
    }
  }, [orders]);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    
    // Veri doğrulama
    if (!product || !product.id) {
      console.error('Invalid product data:', product);
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
      
      console.log('New cart item:', newItem);
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
    console.log('Updating quantity for product:', productId, 'to:', validQuantity);
    
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
    console.log('Cart cleared from unified storage');
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
  const addNewOrder = (orderData) => {
    // orderSyncUtils kullanarak sipariş ekle
    const orderId = orderSyncUtils.addOrder(orderData);
    
    // Local state'i güncelle
    const newOrder = {
      id: orderId,
      date: new Date(),
      status: 'pending',
      total: orderData.total,
      itemCount: orderData.items.length,
      deliveryAddress: orderData.deliveryAddress || "Atatürk Caddesi No: 123, Kadıköy, İstanbul",
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      items: orderData.items,
      timeline: [
        { status: "confirmed", time: null, completed: false },
        { status: "preparing", time: null, completed: false },
        { status: "out_for_delivery", time: null, completed: false },
        { status: "delivered", time: null, completed: false }
      ],
      canCancel: true,
      canReorder: true,
      notes: orderData.notes || "",
      isDemo: false
    };

    setOrders(prev => [newOrder, ...prev]);
    
    console.log('Yeni sipariş eklendi ve senkronize edildi:', orderId);
    return orderId;
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
    
    console.log(`Ürün ${productId} stoku güncellendi: ${newStock}`);
  };

  const reduceStock = (productId, quantity) => {
    const products = storage.get('products', []);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      updateProductStock(productId, newStock);
      
      // Stok biterse toast göster
      if (newStock === 0) {
        const event = new CustomEvent('showToast', {
          detail: { 
            message: `${product.name} ürününün stoku bitti!`, 
            type: 'warning' 
          }
        });
        window.dispatchEvent(event);
      } else if (newStock <= 10) {
        const event = new CustomEvent('showToast', {
          detail: { 
            message: `${product.name} ürününde az stok kaldı! (${newStock} ${product.unit})`, 
            type: 'info' 
          }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const value = {
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