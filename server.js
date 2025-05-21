const dotenv = require('dotenv');
dotenv.config(); // ✅ Nạp .env TRƯỚC KHI require bất kỳ file nào

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');
const reviewRoutes = require('./routes/review.routes');
const commentRoutes = require('./routes/comment.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./config/socket');
const passport = require('./config/passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn tối đa 100 yêu cầu trong 15 phút
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.'
});
const cors = require('cors');





// Load env
dotenv.config();

// Connect DB
connectDB();

// Init app
const app = express();

app.use(session({ secret: 'gamehub', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/auth/login', loginLimiter); // Giới hạn tốc độ cho đăng nhập
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn gốc
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'] // Các tiêu đề được phép
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
setupSocket(io);

app.set('io', io);
// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] 🚀 Running on port ${PORT}`);
});
