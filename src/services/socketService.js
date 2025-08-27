import { io } from 'socket.io-client';
import authService from './authService.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = new Map();
    this.connectionPromise = null;
  }

  async connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._establishConnection();
    return this.connectionPromise;
  }

  async _establishConnection() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      
      this.socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Socket connected successfully');
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Socket connection error:', error.message);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to establish socket connection:', error);
      this.connectionPromise = null;
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('🔌 Socket connected');
      this.emit('connection:established');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 Socket disconnected:', reason);
      this.emit('connection:lost', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      console.log(`🔌 Socket reconnected after ${attemptNumber} attempts`);
      this.emit('connection:restored', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.emit('connection:failed');
      }
    });

    // Data synchronization events
    this.socket.on('customer:updated', (data) => {
      this.emit('data:customer:updated', data);
    });

    this.socket.on('product:updated', (data) => {
      this.emit('data:product:updated', data);
    });

    this.socket.on('order:updated', (data) => {
      this.emit('data:order:updated', data);
    });

    this.socket.on('inventory:updated', (data) => {
      this.emit('data:inventory:updated', data);
    });

    // Notification events
    this.socket.on('notification:received', (data) => {
      this.emit('notification:received', data);
    });

    // Typing indicators
    this.socket.on('typing:start', (data) => {
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data) => {
      this.emit('typing:stop', data);
    });
  }

  // Event emission and listening
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Socket.IO event methods
  socketEmit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    console.warn('Socket not connected, cannot emit event:', event);
    return false;
  }

  // Data synchronization methods
  syncCustomerUpdate(customerId, changes) {
    return this.socketEmit('customer:updated', {
      customerId,
      changes,
      timestamp: new Date()
    });
  }

  syncProductUpdate(productId, changes) {
    return this.socketEmit('product:updated', {
      productId,
      changes,
      timestamp: new Date()
    });
  }

  syncOrderUpdate(orderId, customerId, changes) {
    return this.socketEmit('order:updated', {
      orderId,
      customerId,
      changes,
      timestamp: new Date()
    });
  }

  syncInventoryUpdate(productId, newStock) {
    return this.socketEmit('inventory:updated', {
      productId,
      newStock,
      timestamp: new Date()
    });
  }

  // Notification methods
  sendNotification(userId, title, message, type = 'info') {
    return this.socketEmit('notification:send', {
      userId,
      title,
      message,
      type,
      timestamp: new Date()
    });
  }

  broadcastNotification(title, message, type = 'info') {
    return this.socketEmit('notification:broadcast', {
      title,
      message,
      type,
      timestamp: new Date()
    });
  }

  // Activity tracking
  trackActivity() {
    return this.socketEmit('user:activity');
  }

  startTyping(room = 'general') {
    return this.socketEmit('typing:start', { room });
  }

  stopTyping(room = 'general') {
    return this.socketEmit('typing:stop', { room });
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }

  reconnect() {
    this.disconnect();
    return this.connect();
  }

  // Status methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }

  // Auto-reconnect on auth token refresh
  onTokenRefresh() {
    if (this.socket?.connected) {
      console.log('🔄 Reconnecting socket due to token refresh');
      this.reconnect();
    }
  }

  // Heartbeat to keep connection alive
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.trackActivity();
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect when auth service is ready
if (typeof window !== 'undefined') {
  // Listen for auth changes
  authService.on?.('authStateChanged', (isAuthenticated) => {
    if (isAuthenticated) {
      socketService.connect().catch(console.error);
      socketService.startHeartbeat();
    } else {
      socketService.disconnect();
      socketService.stopHeartbeat();
    }
  });

  // Listen for token refresh
  authService.on?.('tokenRefreshed', () => {
    socketService.onTokenRefresh();
  });
}

export { socketService };
export default socketService;