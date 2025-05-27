const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST , // Địa chỉ Redis server
  port: process.env.REDIS_PORT      // Port Redis server
  // password: process.env.REDIS_PASSWORD || 'your_redis_password', // Nếu Redis có mật khẩu
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

module.exports = redisClient;
