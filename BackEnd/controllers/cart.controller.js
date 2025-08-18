import Cart from '../models/order/cart.model.js';
import Disc from '../models/product/disc.model.js';
import redisClient from '../config/redis.js';
import mongoose from 'mongoose';
const CART_CACHE_EXPIRATION = 1800; // 30 phút cho cart

// Helper function to update cart cache with fresh data
const updateCartCacheHelper = async (userId) => {
  try {
    const cacheKey = `melody_hub:cart:${userId}`;
    
    // Get fresh data from database
    const freshCart = await Cart.findOne({ userId });
    
    if (freshCart) {
      // Update cache with fresh data
      await redisClient.setEx(cacheKey, CART_CACHE_EXPIRATION, JSON.stringify(freshCart));
      console.log(`✅ Cart cache updated for user ${userId} with fresh data`);
    } else {
      // If no cart exists, remove from cache
      await redisClient.del(cacheKey);
      console.log(`🗑️ Cart cache removed for user ${userId} (no cart exists)`);
    }
  } catch (error) {
    console.error('Error updating cart cache:', error);
  }
};


// Get cart by user ID
export const getCartByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cacheKey = `melody_hub:cart:${userId}`;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Try to get data from cache first
    const cachedCart = await redisClient.get(cacheKey);
    if (cachedCart) {
      console.log(`Fetching cart for user ${userId} from Redis cache`);
      res.set('X-Cache-Status', 'HIT');
      return res.json(JSON.parse(cachedCart));
    }

    // If not in cache, get from database
    console.log(`Fetching cart for user from Database`);
    console.log(`Fetching cart for user ${userId} from Database`);
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      // .populate({
      //   path: 'items.discId',
      //   select: 'title price imageUrl artist' // Select the fields you need
      // });


    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    // Store in cache for next request
    await redisClient.setEx(cacheKey, CART_CACHE_EXPIRATION, JSON.stringify(cart));

    res.set('X-Cache-Status', 'MISS');
    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, discId, quantity } = req.body;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(discId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Validate disc exists
    const disc = await Disc.findById(discId);
    if (!disc) {
      return res.status(404).json({ message: 'Disc not found' });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!cart) {
      // Create new cart if not exists
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        items: [{ discId: new mongoose.Types.ObjectId(discId), quantity }],
        total:  (Number(disc.price) || 0) * (Number(quantity) || 0)
      });
    } else {
      // Check if item already exists in cart
      const itemIndex = cart.items.findIndex(item => 
        item.discId.toString() === discId.toString()
      );
      
      if (itemIndex > -1) {
        // Update quantity if item exists
        cart.items[itemIndex].quantity += Number(quantity) || 0;
      } else {
        // Add new item
        cart.items.push({ 
          discId: new mongoose.Types.ObjectId(discId), 
          quantity: Number(quantity) || 0
        });
      }
      
      // Calculate total amount
      let total = 0;
      for (const item of cart.items) {
        const product = await Disc.findById(item.discId);
        if (!product) continue;

        let price = 0;
        if (typeof product.price === 'string') {
          price = parseInt(product.price.replace(/[^\d]/g, ''), 10) || 0;
        } else if (typeof product.price === 'number') {
          price = product.price;
        }
        total += price * (Number(item.quantity) || 0);
      }
      cart.total = total;
    }
    
    await cart.save();
    
    // Update cache with fresh data after modification
    await updateCartCacheHelper(userId);

    // Populate the cart before sending response
    await cart.populate({
      path: 'items.discId',
      select: 'title price imageUrl artist'
    });
    
    res.status(201).json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body; // userId is already string
    const { userId, discId } = req.params;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(discId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.discId.toString() === discId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = Number(quantity) || 0;
    }
    
    // Recalculate total manually to avoid NaN
    let total = 0;
    for (const item of cart.items) {
      const product = await Disc.findById(item.discId);
      if (!product) continue;

      let price = 0;
      if (typeof product.price === 'string') {
        price = parseInt(product.price.replace(/[^\d]/g, ''), 10) || 0;
      } else if (typeof product.price === 'number') {
        price = product.price;
      }
      total += price * (Number(item.quantity) || 0);
    }
    cart.total = total;
    
    await cart.save();

    // Update cache with fresh data after modification
    await updateCartCacheHelper(userId);

    // Populate the cart before sending response
    await cart.populate({
      path: 'items.discId',
      select: 'title price imageUrl artist'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, discId } = req.params;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(discId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.discId.toString() === discId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Lấy thông tin sản phẩm để tính lại total
    const populatedCart = await cart.populate("items.discId"); 
    const parsedCart = populatedCart.items.map(item => ({
      price: String(item.discId?.price || "0"),  
      quantity: Number(item.quantity)            
    }));


    // Calculate total amount
    const total = parsedCart.reduce((sum, item) => {
      let price = 0;
      if (typeof item.price === 'string') {
        price = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
      } else if (typeof item.price === 'number') {
        price = item.price;
      }
      return sum + price * item.quantity;
    }, 0);

    cart.total = total;
    
    await cart.save();
    
    // Update cache with fresh data after modification
    await updateCartCacheHelper(userId);

    // Populate the cart before sending response
    await cart.populate({
      path: 'items.discId',
      select: 'title price imageUrl artist'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    // Update cache with fresh data after modification
    await updateCartCacheHelper(userId);
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Helper function to calculate cart total
const calculateCartTotal = async (cart) => {
  let total = 0;
  
  for (const item of cart.items) {
    const disc = await Disc.findById(item.discId);
    if (disc) {
      total += disc.price * item.quantity;
    }
  }
  
  return total;
};