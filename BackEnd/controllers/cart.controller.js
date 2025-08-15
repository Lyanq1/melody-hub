import Cart from '../models/order/cart.model.js';
import Disc from '../models/product/disc.model.js';
import mongoose from 'mongoose';

// Get cart by user ID
export const getCartByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate({
        path: 'items.discId',
        select: 'title price imageUrl artist' // Select the fields you need
      });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
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
        total: disc.price * quantity
      });
    } else {
      // Check if item already exists in cart
      const itemIndex = cart.items.findIndex(item => 
        item.discId.toString() === discId.toString()
      );
      
      if (itemIndex > -1) {
        // Update quantity if item exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ 
          discId: new mongoose.Types.ObjectId(discId), 
          quantity 
        });
      }
      
      // Recalculate total
      cart.total = await calculateCartTotal(cart);
    }
    
    await cart.save();
    
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
    const { userId, discId, quantity } = req.body;
    
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
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Recalculate total
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    
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
    
    // Recalculate total
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    
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