import { useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService.js';
import authService from '../services/authService.js';

/**
 * Real-time data synchronization hook
 * Automatically syncs data changes across all connected clients
 */
export const useRealTimeSync = ({
  onCustomerUpdate,
  onProductUpdate,
  onOrderUpdate,
  onInventoryUpdate,
  onNotification,
  autoConnect = true,
  syncOnMount = true
} = {}) => {
  const isConnectedRef = useRef(false);
  const listenersRef = useRef(new Set());

  // Connection management
  const connect = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        console.warn('Cannot connect to real-time sync: User not authenticated');
        return false;
      }

      await socketService.connect();
      isConnectedRef.current = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to real-time sync:', error);
      isConnectedRef.current = false;
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    isConnectedRef.current = false;
  }, []);

  // Data sync methods
  const syncCustomerUpdate = useCallback((customerId, changes) => {
    if (!isConnectedRef.current) {
      console.warn('Cannot sync customer update: Not connected');
      return false;
    }
    return socketService.syncCustomerUpdate(customerId, changes);
  }, []);

  const syncProductUpdate = useCallback((productId, changes) => {
    if (!isConnectedRef.current) {
      console.warn('Cannot sync product update: Not connected');
      return false;
    }
    return socketService.syncProductUpdate(productId, changes);
  }, []);

  const syncOrderUpdate = useCallback((orderId, customerId, changes) => {
    if (!isConnectedRef.current) {
      console.warn('Cannot sync order update: Not connected');
      return false;
    }
    return socketService.syncOrderUpdate(orderId, customerId, changes);
  }, []);

  const syncInventoryUpdate = useCallback((productId, newStock) => {
    if (!isConnectedRef.current) {
      console.warn('Cannot sync inventory update: Not connected');
      return false;
    }
    return socketService.syncInventoryUpdate(productId, newStock);
  }, []);

  // Notification methods
  const sendNotification = useCallback((userId, title, message, type = 'info') => {
    if (!isConnectedRef.current) {
      console.warn('Cannot send notification: Not connected');
      return false;
    }
    return socketService.sendNotification(userId, title, message, type);
  }, []);

  const broadcastNotification = useCallback((title, message, type = 'info') => {
    if (!isConnectedRef.current) {
      console.warn('Cannot broadcast notification: Not connected');
      return false;
    }
    return socketService.broadcastNotification(title, message, type);
  }, []);

  // Activity tracking
  const trackActivity = useCallback(() => {
    if (isConnectedRef.current) {
      socketService.trackActivity();
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    const setupListeners = () => {
      // Customer updates
      if (onCustomerUpdate) {
        const unsubscribe = socketService.on('data:customer:updated', onCustomerUpdate);
        listenersRef.current.add(unsubscribe);
      }

      // Product updates
      if (onProductUpdate) {
        const unsubscribe = socketService.on('data:product:updated', onProductUpdate);
        listenersRef.current.add(unsubscribe);
      }

      // Order updates
      if (onOrderUpdate) {
        const unsubscribe = socketService.on('data:order:updated', onOrderUpdate);
        listenersRef.current.add(unsubscribe);
      }

      // Inventory updates
      if (onInventoryUpdate) {
        const unsubscribe = socketService.on('data:inventory:updated', onInventoryUpdate);
        listenersRef.current.add(unsubscribe);
      }

      // Notifications
      if (onNotification) {
        const unsubscribe = socketService.on('notification:received', onNotification);
        listenersRef.current.add(unsubscribe);
      }
    };

    // Auto-connect and setup listeners
    if (autoConnect && syncOnMount) {
      connect().then((connected) => {
        if (connected) {
          setupListeners();
        }
      });
    } else if (syncOnMount) {
      setupListeners();
    }

    // Cleanup listeners on unmount
    return () => {
      listenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      listenersRef.current.clear();
    };
  }, [autoConnect, syncOnMount, onCustomerUpdate, onProductUpdate, onOrderUpdate, onInventoryUpdate, onNotification, connect]);

  // Track user activity on interactions
  useEffect(() => {
    const handleUserActivity = () => trackActivity();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [trackActivity]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return socketService.getConnectionStatus();
  }, []);

  return {
    // Connection methods
    connect,
    disconnect,
    isConnected: isConnectedRef.current,
    getConnectionStatus,
    
    // Data sync methods
    syncCustomerUpdate,
    syncProductUpdate,
    syncOrderUpdate,
    syncInventoryUpdate,
    
    // Notification methods
    sendNotification,
    broadcastNotification,
    
    // Activity tracking
    trackActivity
  };
};

/**
 * Hook for customer data real-time sync
 */
export const useCustomerSync = (onUpdate) => {
  return useRealTimeSync({
    onCustomerUpdate: onUpdate,
    autoConnect: true
  });
};

/**
 * Hook for product data real-time sync
 */
export const useProductSync = (onUpdate) => {
  return useRealTimeSync({
    onProductUpdate: onUpdate,
    autoConnect: true
  });
};

/**
 * Hook for order data real-time sync
 */
export const useOrderSync = (onUpdate) => {
  return useRealTimeSync({
    onOrderUpdate: onUpdate,
    autoConnect: true
  });
};

/**
 * Hook for inventory real-time sync
 */
export const useInventorySync = (onUpdate) => {
  return useRealTimeSync({
    onInventoryUpdate: onUpdate,
    autoConnect: true
  });
};

/**
 * Hook for notifications only
 */
export const useNotifications = (onNotification) => {
  return useRealTimeSync({
    onNotification,
    autoConnect: true
  });
};

/**
 * Hook for typing indicators
 */
export const useTypingIndicator = (room = 'general') => {
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      socketService.startTyping(room);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [room]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      socketService.stopTyping(room);
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  return {
    startTyping,
    stopTyping,
    isTyping: isTypingRef.current
  };
};

export default useRealTimeSync;