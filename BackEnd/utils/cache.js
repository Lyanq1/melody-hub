import redisClient from '../config/redis.js';

// Default cache duration is 1 hour
const DEFAULT_EXPIRATION = 3600;

export const getOrSetCache = async (key, cb, expiration = DEFAULT_EXPIRATION) => {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            return JSON.parse(data);
        }

        const freshData = await cb();
        await redisClient.setEx(key, expiration, JSON.stringify(freshData));
        return freshData;
    } catch (error) {
        console.error('Cache Error:', error);
        return await cb();
    }
};

export const clearCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Clear Cache Error:', error);
    }
};

export const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
    return async (req, res, next) => {
        const key = `__express__${req.originalUrl || req.url}`;
        try {
            const cachedResponse = await redisClient.get(key);
            if (cachedResponse) {
                const data = JSON.parse(cachedResponse);
                return res.json(data);
            }
            res.originalJson = res.json;
            res.json = async (body) => {
                await redisClient.setEx(key, duration, JSON.stringify(body));
                res.originalJson(body);
            };
            next();
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            next();
        }
    };
}; 