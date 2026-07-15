import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import controllers & middleware
import * as authController from './controllers/authController';
import * as restaurantController from './controllers/restaurantController';
import * as orderController from './controllers/orderController';
import * as profileController from './controllers/profileController';
import * as adminController from './controllers/adminController';
import { authenticateJWT, requireAdmin } from './middleware/auth';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: '*', // For demo purposes allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Give order controller access to Socket.io to trigger real-time updates
orderController.setIO(io);

// Socket connections handler
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Join order room
  socket.on('join_order', (orderId: string) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room order_${orderId}`);
  });

  // Handle chat messages between user and rider
  socket.on('send_message', (data: { orderId: string; sender: 'user' | 'rider'; text: string }) => {
    const { orderId, sender, text } = data;
    const message = {
      id: Math.random().toString(36).substring(7),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    // Broadcast back to all clients in the order room
    io.to(`order_${orderId}`).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// API Routes

// 1. Authentication
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/otp/request', authController.requestOTP);
app.post('/api/auth/otp/verify', authController.verifyOTP);
app.post('/api/auth/google', authController.googleLogin);
app.get('/api/auth/me', authenticateJWT as any, authController.getCurrentUser);

// 2. Restaurants & Wishlist
app.get('/api/restaurants', restaurantController.getRestaurants);
app.get('/api/restaurants/:id', restaurantController.getRestaurantById);
app.post('/api/restaurants/favorite', authenticateJWT as any, restaurantController.toggleFavorite);

// 3. Profiles & Addresses
app.put('/api/profile', authenticateJWT as any, profileController.updateProfile);
app.post('/api/profile/address', authenticateJWT as any, profileController.addAddress);
app.delete('/api/profile/address/:id', authenticateJWT as any, profileController.deleteAddress);
app.post('/api/profile/payment-method', authenticateJWT as any, profileController.addPaymentMethod);

// 4. Orders
app.post('/api/orders', authenticateJWT as any, orderController.createOrder);
app.get('/api/orders', authenticateJWT as any, orderController.getOrders);
app.get('/api/orders/:id', authenticateJWT as any, orderController.getOrderById);
app.patch('/api/orders/:id/status', authenticateJWT as any, requireAdmin as any, orderController.updateOrderStatus);

// 5. Admin
app.get('/api/admin/stats', authenticateJWT as any, requireAdmin as any, adminController.getDashboardStats);
app.post('/api/admin/restaurants', authenticateJWT as any, requireAdmin as any, adminController.addRestaurant);
app.post('/api/admin/restaurants/:restaurantId/menu', authenticateJWT as any, requireAdmin as any, adminController.addMenuItem);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the FoodExpress API Server!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[FoodExpress Backend] Running on http://localhost:${PORT}`);
});

export default app;
