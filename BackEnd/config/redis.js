import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing Redis connection...');
console.log('Redis URL:', process.env.REDIS_URL ? 'URL is set in env' : 'URL is not set in env');

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis-15707.c273.us-east-1-2.ec2.redns.redis-cloud.com:15707',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Max reconnection attempts reached');
                return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
    console.error('Error Details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
    });
});

redisClient.on('connect', () => {
    console.log('🔄 Redis Client connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis Client Ready');
    console.log('Connected to Redis Cloud successfully');
});

redisClient.on('end', () => {
    console.log('❌ Redis Client connection ended');
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis Client reconnecting...');
});

// Connect to Redis
try {
    await redisClient.connect();
} catch (error) {
    console.error('Failed to connect to Redis:', error);
}

export default redisClient; 