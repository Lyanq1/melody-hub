import express from 'express';
import { 
  getCartByUserId, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cart.controller.js';

const router = express.Router();

// Get cart by user ID
router.get('/:userId', getCartByUserId);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/:userId/item/:discId', removeFromCart);

// Clear cart
router.delete('/:userId', clearCart);

export default router; 