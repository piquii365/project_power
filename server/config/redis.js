import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis', // Default to service name in Docker
    port: parseInt(process.env.REDIS_PORT || '6379'), // Ensure port is number
  },
  password: process.env.REDIS_PASSWORD || undefined,
  pingInterval: 10000, // Send pings every 10 seconds
});

// Enhanced error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
  if (err.code === 'ECONNREFUSED') {
    console.error('Connection refused - verify Redis is running and host/port are correct');
  }
});

redisClient.on('connect', () => {
  console.log('🔌 Attempting Redis connection...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis connected successfully');
  console.log(`Connected to Redis at ${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`);
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Connect immediately when imported
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis initial connection failed:', err);
  }
})();

export default redisClient;