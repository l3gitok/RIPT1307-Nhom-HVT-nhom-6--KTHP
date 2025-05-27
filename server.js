const dotenv = require('dotenv');
dotenv.config(); // ✅ Nạp .env TRƯỚC KHI require bất kỳ file nào

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');
const reviewRoutes = require('./routes/review.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const userReportRoutes = require('./routes/user-report.routes');
const followerRoutes = require('./routes/follow.routes');
const userBanRoutes = require('./routes/user-ban.routes');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const http = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./config/socket');
const passport = require('./config/passport');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn tối đa 100 yêu cầu trong 15 phút
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 1000, // Giới hạn tối đa 1000 yêu cầu trong 1 giờ
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.'
});

// Connect DB
connectDB();

// Init app
const app = express();

// Security Middleware
app.use(helmet()); // Bảo vệ các HTTP headers
app.use(mongoSanitize()); // Ngăn chặn NoSQL injection
app.use(xss()); // Ngăn chặn XSS attacks
app.use(hpp()); // Ngăn chặn HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// CORS configuration
const allowedOrigins = ['http://localhost:8000', 'https://gamehubvip.netlify.app'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'gamehub',
  resave: false, 
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 giờ
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: '10kb' })); // Giới hạn kích thước body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Rate limiting với Redis
app.use(redisRateLimit(100, 60)); // 100 requests per minute

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/login', loginLimiter);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user-reports', userReportRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/user-bans', userBanRoutes);
// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000, // 60 giây
  pingInterval: 25000, // 25 giây
  transports: ['websocket', 'polling']
});

// Setup Socket.IO
const socketIO = initSocket(server);
app.set('io', socketIO);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Start server
    const PORT = config.port;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle Redis connection
redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  // Close Redis connection
  redisClient.quit();
  
  // Close MongoDB connection
  mongoose.connection.close();
  
  process.exit(0);
});

module.exports = app;
