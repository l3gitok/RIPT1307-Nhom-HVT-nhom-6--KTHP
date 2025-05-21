const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId); // người dùng join vào room riêng
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;
