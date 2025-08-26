/**
 * WebSocket Manager for Real-time Synchronization
 * Handles real-time updates for orders, products, and inventory
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket mapping
    this.rooms = {
      admin: 'admin-room',
      sellers: 'sellers-room',
      customers: 'customers-room'
    };
  }

  // Initialize WebSocket server
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kirilmazlar-secret-key');
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.username = decoded.username;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('✅ WebSocket server initialized');
    return this.io;
  }

  // Handle new socket connection
  handleConnection(socket) {
    const { userId, userRole, username } = socket;
    
    console.log(`🔌 User connected: ${username} (${userRole}) - Socket: ${socket.id}`);
    
    // Store user connection
    this.connectedUsers.set(userId, {
      socket,
      role: userRole,
      username,
      connectedAt: new Date()
    });

    // Join role-based rooms
    this.joinRoleBasedRooms(socket, userRole);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to real-time updates',
      userId,
      role: userRole,
      timestamp: new Date().toISOString()
    });

    // Handle custom events
    this.setupEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${username} - Socket: ${socket.id}`);
      this.connectedUsers.delete(userId);
    });
  }

  // Join role-based rooms
  joinRoleBasedRooms(socket, role) {
    switch (role) {
      case 'admin':
        socket.join(this.rooms.admin);
        socket.join(this.rooms.sellers); // Admins can see seller updates
        break;
      case 'seller':
        socket.join(this.rooms.sellers);
        break;
      case 'customer':
        socket.join(this.rooms.customers);
        break;
    }
  }

  // Setup event handlers
  setupEventHandlers(socket) {
    // Order status updates
    socket.on('subscribe-order-updates', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`📦 ${socket.username} subscribed to order ${orderId} updates`);
    });

    socket.on('unsubscribe-order-updates', (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`📦 ${socket.username} unsubscribed from order ${orderId} updates`);
    });

    // Product inventory updates
    socket.on('subscribe-product-updates', (productId) => {
      socket.join(`product-${productId}`);
      console.log(`📦 ${socket.username} subscribed to product ${productId} updates`);
    });

    socket.on('unsubscribe-product-updates', (productId) => {
      socket.leave(`product-${productId}`);
      console.log(`📦 ${socket.username} unsubscribed from product ${productId} updates`);
    });

    // General dashboard updates
    socket.on('subscribe-dashboard', () => {
      socket.join('dashboard-updates');
      console.log(`📊 ${socket.username} subscribed to dashboard updates`);
    });

    // Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  // Broadcast order updates
  broadcastOrderUpdate(orderData, eventType = 'order-updated') {
    if (!this.io) return;

    const { id: orderId, customer_id, status } = orderData;

    // Broadcast to specific order subscribers
    this.io.to(`order-${orderId}`).emit(eventType, {
      order: orderData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    // Broadcast to admin and sellers
    this.io.to(this.rooms.admin).emit(eventType, {
      order: orderData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    this.io.to(this.rooms.sellers).emit(eventType, {
      order: orderData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    // Notify specific customer if they're connected
    if (customer_id) {
      const customerConnection = this.getConnectionByUserId(customer_id);
      if (customerConnection) {
        customerConnection.socket.emit(eventType, {
          order: orderData,
          timestamp: new Date().toISOString(),
          type: eventType
        });
      }
    }

    console.log(`📡 Broadcasted ${eventType} for order ${orderId}`);
  }

  // Broadcast product updates
  broadcastProductUpdate(productData, eventType = 'product-updated') {
    if (!this.io) return;

    const { id: productId } = productData;

    // Broadcast to specific product subscribers
    this.io.to(`product-${productId}`).emit(eventType, {
      product: productData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    // Broadcast to admin and sellers
    this.io.to(this.rooms.admin).emit(eventType, {
      product: productData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    this.io.to(this.rooms.sellers).emit(eventType, {
      product: productData,
      timestamp: new Date().toISOString(),
      type: eventType
    });

    console.log(`📡 Broadcasted ${eventType} for product ${productId}`);
  }

  // Broadcast inventory updates
  broadcastInventoryUpdate(inventoryData) {
    if (!this.io) return;

    // Broadcast to admin and sellers only
    this.io.to(this.rooms.admin).emit('inventory-updated', {
      inventory: inventoryData,
      timestamp: new Date().toISOString(),
      type: 'inventory-updated'
    });

    this.io.to(this.rooms.sellers).emit('inventory-updated', {
      inventory: inventoryData,
      timestamp: new Date().toISOString(),
      type: 'inventory-updated'
    });

    console.log(`📡 Broadcasted inventory update`);
  }

  // Broadcast dashboard statistics
  broadcastDashboardUpdate(statsData) {
    if (!this.io) return;

    this.io.to('dashboard-updates').emit('dashboard-updated', {
      stats: statsData,
      timestamp: new Date().toISOString(),
      type: 'dashboard-updated'
    });

    console.log(`📡 Broadcasted dashboard update`);
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    const connection = this.getConnectionByUserId(userId);
    if (connection) {
      connection.socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 Sent notification to user ${userId}`);
      return true;
    }
    return false;
  }

  // Send notification to role
  sendNotificationToRole(role, notification) {
    if (!this.io) return;

    const room = this.rooms[role + 's'] || this.rooms[role];
    if (room) {
      this.io.to(room).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 Sent notification to ${role} role`);
    }
  }

  // Get connection by user ID
  getConnectionByUserId(userId) {
    return this.connectedUsers.get(userId);
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      username: data.username,
      role: data.role,
      connectedAt: data.connectedAt
    }));
  }

  // Get connected users count by role
  getConnectedUsersByRole() {
    const stats = { admin: 0, seller: 0, customer: 0, total: 0 };
    
    this.connectedUsers.forEach((data) => {
      stats[data.role] = (stats[data.role] || 0) + 1;
      stats.total++;
    });

    return stats;
  }

  // Cleanup expired connections
  cleanupConnections() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    this.connectedUsers.forEach((data, userId) => {
      if (now - data.connectedAt > maxAge) {
        data.socket.disconnect();
        this.connectedUsers.delete(userId);
        console.log(`🧹 Cleaned up expired connection for user ${userId}`);
      }
    });
  }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager;