import Cart from '../models/order/cart.model.js';
import Disc from '../models/product/disc.model.js';

// Get cart by user ID
export const getCartByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, discId, quantity } = req.body;
    
    // Validate disc exists
    const disc = await Disc.findById(discId);
    if (!disc) {
      return res.status(404).json({ message: 'Disc not found' });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create new cart if not exists
      cart = new Cart({
        userId,
        items: [{ discId, quantity }],
        total: disc.price * quantity
      });
    } else {
      // Check if item already exists in cart
      const itemIndex = cart.items.findIndex(item => item.discId.toString() === discId);
      
      if (itemIndex > -1) {
        // Update quantity if item exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ discId, quantity });
      }
      
      // Recalculate total
      cart.total = await calculateCartTotal(cart);
    }
    
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { userId, discId, quantity } = req.body;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.discId.toString() === discId);
    
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
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, discId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.discId.toString() === discId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Recalculate total
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
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