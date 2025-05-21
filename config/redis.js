const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1', // Địa chỉ Redis server
  port: process.env.REDIS_PORT || 6379,       // Port Redis server
  // password: process.env.REDIS_PASSWORD || 'your_redis_password', // Nếu Redis có mật khẩu
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;