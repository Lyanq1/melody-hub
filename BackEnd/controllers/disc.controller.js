import Disc from '../models/disc.model.js'
import redisClient from '../config/redis.js'

const CACHE_EXPIRATION = 500; // Cache for 1 hour
const ALL_DISCS_CACHE_KEY = 'melody_hub:products:all'; // Đổi tên key để dễ quản lý hơn

export const getAllDiscs = async (req, res) => {
  try {
    // Try to get data from cache first
    const cachedDiscs = await redisClient.get(ALL_DISCS_CACHE_KEY);
    if (cachedDiscs) {
      console.log('Fetching discs from Redis cache');
      res.set('X-Cache-Status', 'HIT');
      return res.json(JSON.parse(cachedDiscs));
    }

    // If not in cache, get from database
    console.log('Fetching discs from Database');
    const discs = await Disc.find({});
    
    if (discs.length === 0) {
      return res.status(404).json({ message: 'No discs found' });
    }

    // Store in cache for next request
    await redisClient.setEx(ALL_DISCS_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(discs));
    
    res.set('X-Cache-Status', 'MISS');
    res.json(discs);
  } catch (error) {
    console.error('Error fetching discs:', error);
    res.status(500).json({ message: 'Error fetching discs', error: error.message });
  }
}

export const getDiscById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `melody_hub:products:${id}`; // Đổi tên key cho chi tiết sản phẩm

    // Try to get from cache first
    const cachedDisc = await redisClient.get(cacheKey);
    if (cachedDisc) {
      console.log(`Fetching disc ${id} from Redis cache`);
      res.set('X-Cache-Status', 'HIT');
      return res.json(JSON.parse(cachedDisc));
    }

    // If not in cache, get from database
    console.log(`Fetching disc ${id} from Database`);
    const disc = await Disc.findById(id);
    
    if (!disc) {
      return res.status(404).json({ message: 'Disc not found' });
    }

    // Store in cache for next request
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(disc));
    
    res.set('X-Cache-Status', 'MISS');
    res.json(disc);
  } catch (error) {
    console.error('Error fetching disc by ID:', error);
    res.status(500).json({ message: 'Error fetching disc', error: error.message });
  }
}

// Function to clear cache when data is updated
export const clearDiscCache = async (discId = null) => {
  try {
    if (discId) {
      // Clear specific disc cache
      await redisClient.del(`melody_hub:products:${discId}`);
    }
    // Clear all discs cache
    await redisClient.del(ALL_DISCS_CACHE_KEY);
    console.log('Disc cache cleared successfully');
  } catch (error) {
    console.error('Error clearing disc cache:', error);
  }
}

export const clearCache = async (req, res) => {
  try {
    console.log('🔄 Clearing all disc cache...');
    await clearDiscCache();
    res.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Error clearing cache', error: error.message });
  }
}
