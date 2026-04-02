const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

// Create uploads directories
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Connect to MongoDB with better error handling
connectDB().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  // Don't exit - let server start anyway for health checks
});

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive for now, tighten later
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Campus Soko API is running' });
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    
    await User.findByIdAndUpdate(userId, { isOnline: true });
    
    io.emit('user_online', { userId });
    console.log(`User ${userId} joined room and is online`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, listingId, message } = data;

      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        listing: listingId,
        message
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .populate('listing', 'title images');

      io.to(receiverId).emit('receive_message', populatedMessage);
      
      io.to(senderId).emit('message_sent', populatedMessage);
      
      console.log(`Message from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('user_typing', { senderId });
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('user_stop_typing', { senderId });
  });

  socket.on('mark_read', async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, isRead: false },
        { isRead: true }
      );
      io.to(senderId).emit('messages_read', { readerId: receiverId });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  socket.on('video_call', ({ from, to, type, offer, answer, candidate }) => {
    io.to(to).emit('video_call', { from, type, offer, answer, candidate });
  });

  socket.on('disconnect', async () => {
    let disconnectedUserId = null;
    
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      await User.findByIdAndUpdate(disconnectedUserId, {
        isOnline: false,
        lastSeen: new Date()
      });
      io.emit('user_offline', { userId: disconnectedUserId });
      console.log(`User ${disconnectedUserId} disconnected and is offline`);
    }
    
    console.log('User disconnected:', socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for connections`);
});

module.exports = { app, server, io };
