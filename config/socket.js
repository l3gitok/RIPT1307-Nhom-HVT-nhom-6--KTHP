const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

let io;

// Khởi tạo Socket.IO
exports.initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware xác thực socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Xử lý kết nối
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username);

    // Thêm user vào room của chính họ
    socket.join(socket.user._id.toString());

    // Xử lý follow
    socket.on('follow', async (data) => {
      const { followingId } = data;
      // Gửi thông báo cho người được follow
      io.to(followingId).emit('newFollower', {
        follower: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        }
      });
    });

    // Xử lý chat
    socket.on('sendMessage', (data) => {
      const { receiverId, message } = data;
      io.to(receiverId).emit('newMessage', {
        sender: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        message,
        timestamp: new Date()
      });
    });

    // Xử lý game invite
    socket.on('gameInvite', (data) => {
      const { receiverId, gameId } = data;
      io.to(receiverId).emit('newGameInvite', {
        sender: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        gameId,
        timestamp: new Date()
      });
    });

    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.username);
    });
  });

  return io;
};

// Hàm gửi thông báo cho một user cụ thể
exports.sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }
};

// Hàm gửi thông báo cho nhiều user
exports.sendNotificationToMany = (userIds, notification) => {
  if (io) {
    userIds.forEach(userId => {
      io.to(userId.toString()).emit('notification', notification);
    });
  }
};

// Hàm gửi thông báo cho tất cả user
exports.broadcastNotification = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};

