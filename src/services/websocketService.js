import { io } from 'socket.io-client';
import authService from './authService';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const token = authService.getToken();
        if (!token) {
          reject(new Error('No authentication token available'));
          return;
        }

        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        this.socket = io(serverUrl, {
          auth: {
            token
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
          
          this.handleReconnect();
        });

        this.socket.on('auth_error', (error) => {
          console.error('WebSocket authentication error:', error);
          this.disconnect();
          // Redirect to login or refresh token
          authService.logout();
        });

        // Set up event listeners
        this.setupEventListeners();

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Order events
    this.socket.on('order-created', (data) => {
      this.emit('order-created', data);
    });

    this.socket.on('order-updated', (data) => {
      this.emit('order-updated', data);
    });

    this.socket.on('order-status-updated', (data) => {
      this.emit('order-status-updated', data);
    });

    // Product events
    this.socket.on('product-created', (data) => {
      this.emit('product-created', data);
    });

    this.socket.on('product-updated', (data) => {
      this.emit('product-updated', data);
    });

    this.socket.on('product-deleted', (data) => {
      this.emit('product-deleted', data);
    });

    this.socket.on('inventory-updated', (data) => {
      this.emit('inventory-updated', data);
    });

    // General notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    // System events
    this.socket.on('system-maintenance', (data) => {
      this.emit('system-maintenance', data);
    });
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send message to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Join a room
  joinRoom(room) {
    this.send('join-room', { room });
  }

  // Leave a room
  leaveRoom(room) {
    this.send('leave-room', { room });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Auto-connect when user is authenticated
if (authService.isAuthenticated()) {
  websocketService.connect().catch(error => {
    console.error('Failed to auto-connect WebSocket:', error);
  });
}

export { websocketService };
export default websocketService;