import { useRef, useCallback } from 'react';
import { websocketService } from '../services/websocketService';

export const useWebSocket = () => {
  const listenersRef = useRef(new Map());

  // Manual connection control - no automatic auth dependency
  const connect = useCallback(() => {
    return websocketService.connect().catch(error => {
      console.error('WebSocket connection failed:', error);
    });
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    // Clean up listeners when disconnecting
    listenersRef.current.forEach((callback, event) => {
      websocketService.off(event, callback);
    });
    listenersRef.current.clear();
  }, []);

  // Subscribe to events
  const subscribe = useCallback((event, callback) => {
    // Remove existing listener if any
    if (listenersRef.current.has(event)) {
      websocketService.off(event, listenersRef.current.get(event));
    }

    // Add new listener
    websocketService.on(event, callback);
    listenersRef.current.set(event, callback);

    // Return unsubscribe function
    return () => {
      websocketService.off(event, callback);
      listenersRef.current.delete(event);
    };
  }, []);

  // Unsubscribe from events
  const unsubscribe = useCallback((event) => {
    if (listenersRef.current.has(event)) {
      websocketService.off(event, listenersRef.current.get(event));
      listenersRef.current.delete(event);
    }
  }, []);

  // Send message
  const send = useCallback((event, data) => {
    websocketService.send(event, data);
  }, []);

  // Join room
  const joinRoom = useCallback((room) => {
    websocketService.joinRoom(room);
  }, []);

  // Leave room
  const leaveRoom = useCallback((room) => {
    websocketService.leaveRoom(room);
  }, []);

  // Get connection status
  const getStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    joinRoom,
    leaveRoom,
    getStatus,
    isConnected: websocketService.isConnected
  };
};

// Specialized hooks for different types of events
export const useOrderEvents = () => {
  const { subscribe, unsubscribe } = useWebSocket();

  const onOrderCreated = useCallback((callback) => {
    return subscribe('order-created', callback);
  }, [subscribe]);

  const onOrderUpdated = useCallback((callback) => {
    return subscribe('order-updated', callback);
  }, [subscribe]);

  const onOrderStatusUpdated = useCallback((callback) => {
    return subscribe('order-status-updated', callback);
  }, [subscribe]);

  return {
    onOrderCreated,
    onOrderUpdated,
    onOrderStatusUpdated,
    unsubscribe
  };
};

export const useProductEvents = () => {
  const { subscribe, unsubscribe } = useWebSocket();

  const onProductCreated = useCallback((callback) => {
    return subscribe('product-created', callback);
  }, [subscribe]);

  const onProductUpdated = useCallback((callback) => {
    return subscribe('product-updated', callback);
  }, [subscribe]);

  const onProductDeleted = useCallback((callback) => {
    return subscribe('product-deleted', callback);
  }, [subscribe]);

  const onInventoryUpdated = useCallback((callback) => {
    return subscribe('inventory-updated', callback);
  }, [subscribe]);

  return {
    onProductCreated,
    onProductUpdated,
    onProductDeleted,
    onInventoryUpdated,
    unsubscribe
  };
};

export const useNotifications = () => {
  const listenersRef = useRef(new Map());

  // Subscribe to events without auth dependency
  const subscribe = useCallback((event, callback) => {
    // Remove existing listener if any
    if (listenersRef.current.has(event)) {
      websocketService.off(event, listenersRef.current.get(event));
    }

    // Add new listener
    websocketService.on(event, callback);
    listenersRef.current.set(event, callback);

    // Return unsubscribe function
    return () => {
      websocketService.off(event, callback);
      listenersRef.current.delete(event);
    };
  }, []);

  const unsubscribe = useCallback((event) => {
    if (listenersRef.current.has(event)) {
      websocketService.off(event, listenersRef.current.get(event));
      listenersRef.current.delete(event);
    }
  }, []);

  const onNotification = useCallback((callback) => {
    return subscribe('notification', callback);
  }, [subscribe]);

  const onSystemMaintenance = useCallback((callback) => {
    return subscribe('system-maintenance', callback);
  }, [subscribe]);

  return {
    onNotification,
    onSystemMaintenance,
    unsubscribe
  };
};

export default useWebSocket;