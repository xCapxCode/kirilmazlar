import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/config.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.userSessions = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.FRONTEND_URL] 
          : ['http://localhost:5000', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.auth.jwtSecret);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    this.setupEventHandlers();
    
    console.log('✅ Socket.IO server initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User ${socket.userId} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        role: socket.userRole,
        connectedAt: new Date(),
        lastActivity: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join role-based rooms
      if (socket.userRole === 'admin') {
        socket.join('admin_room');
      } else if (socket.userRole === 'customer') {
        socket.join('customer_room');
      }

      // Handle data synchronization events
      this.setupDataSyncHandlers(socket);
      
      // Handle real-time notifications
      this.setupNotificationHandlers(socket);
      
      // Handle user activity tracking
      this.setupActivityHandlers(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  setupDataSyncHandlers(socket) {
    // Customer data sync
    socket.on('customer:updated', (data) => {
      this.broadcastToAdmins('customer:updated', {
        customerId: data.customerId,
        updatedBy: socket.userId,
        timestamp: new Date(),
        changes: data.changes
      });
    });

    // Product data sync
    socket.on('product:updated', (data) => {
      this.io.emit('product:updated', {
        productId: data.productId,
        updatedBy: socket.userId,
        timestamp: new Date(),
        changes: data.changes
      });
    });

    // Order data sync
    socket.on('order:updated', (data) => {
      // Notify admins
      this.broadcastToAdmins('order:updated', {
        orderId: data.orderId,
        customerId: data.customerId,
        updatedBy: socket.userId,
        timestamp: new Date(),
        changes: data.changes
      });

      // Notify specific customer if order belongs to them
      if (data.customerId) {
        this.notifyUser(data.customerId, 'order:updated', {
          orderId: data.orderId,
          timestamp: new Date(),
          changes: data.changes
        });
      }
    });

    // Inventory sync
    socket.on('inventory:updated', (data) => {
      this.io.emit('inventory:updated', {
        productId: data.productId,
        newStock: data.newStock,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });
  }

  setupNotificationHandlers(socket) {
    // Send notification to specific user
    socket.on('notification:send', (data) => {
      if (socket.userRole === 'admin') {
        this.notifyUser(data.userId, 'notification:received', {
          id: Date.now(),
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          timestamp: new Date(),
          from: socket.userId
        });
      }
    });

    // Broadcast notification to all users
    socket.on('notification:broadcast', (data) => {
      if (socket.userRole === 'admin') {
        this.io.emit('notification:received', {
          id: Date.now(),
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          timestamp: new Date(),
          from: socket.userId,
          broadcast: true
        });
      }
    });
  }

  setupActivityHandlers(socket) {
    // Track user activity
    socket.on('user:activity', () => {
      const userConnection = this.connectedUsers.get(socket.userId);
      if (userConnection) {
        userConnection.lastActivity = new Date();
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(data.room || 'general').emit('typing:start', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.room || 'general').emit('typing:stop', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  // Utility methods
  broadcastToAdmins(event, data) {
    this.io.to('admin_room').emit(event, data);
  }

  broadcastToCustomers(event, data) {
    this.io.to('customer_room').emit(event, data);
  }

  notifyUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, connection]) => ({
      userId,
      ...connection
    }));
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getUserConnection(userId) {
    return this.connectedUsers.get(userId);
  }

  // Force disconnect user
  disconnectUser(userId) {
    const connection = this.connectedUsers.get(userId);
    if (connection) {
      const socket = this.io.sockets.sockets.get(connection.socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }
  }

  // Send system message
  sendSystemMessage(message, targetUsers = null) {
    const systemMessage = {
      id: Date.now(),
      title: 'System Notification',
      message,
      type: 'system',
      timestamp: new Date(),
      from: 'system'
    };

    if (targetUsers) {
      targetUsers.forEach(userId => {
        this.notifyUser(userId, 'notification:received', systemMessage);
      });
    } else {
      this.io.emit('notification:received', systemMessage);
    }
  }
}

export default new SocketManager();