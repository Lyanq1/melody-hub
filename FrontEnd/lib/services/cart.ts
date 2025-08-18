import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface CartItem {
  discId: string;
  quantity: number;
}

export interface Cart {
  userId: string; // Changed from number to string (MongoDB ObjectId)
  items: CartItem[];
  total: number;
  _cacheInfo?: {
    status: string;
    source: string;
    timestamp: string;
    message: string;
  };
}

export const cartService = {
  async getCartByUserId(userId: string): Promise<Cart | null> { // Changed from number to string
    try {
      console.log(`🛒 Fetching cart for user ${userId}`);
      const response = await axios.get(`${API_URL}/cart/${userId}`);
      console.log(`✅ Cart fetched successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  },

  async addToCart(userId: string, discId: string, quantity: number): Promise<Cart | null> { // Changed from number to string
    try {
      console.log(`🛒 Adding to cart: userId=${userId}, discId=${discId}, quantity=${quantity}`);
      const response = await axios.post(`${API_URL}/cart/add`, {
        userId,
        discId,
        quantity
      });
      console.log(`✅ Item added to cart successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  },

  async updateCartItem(userId: string, discId: string, quantity: number): Promise<Cart | null> { // Changed from number to string
    try {
      console.log(`📝 Updating cart item: userId=${userId}, discId=${discId}, quantity=${quantity}`);
      // Backend route: PUT /cart/:userId/item/:discId  with body { quantity }
      const response = await axios.put(`${API_URL}/cart/${userId}/item/${discId}`, {
        quantity
      });
      console.log(`✅ Cart item updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  },

  async removeFromCart(userId: string, discId: string): Promise<Cart | null> { // Changed from number to string
    try {
      console.log(`🗑️ Removing from cart: userId=${userId}, discId=${discId}`);
      // Backend route: DELETE /cart/:userId/item/:discId
      const response = await axios.delete(`${API_URL}/cart/${userId}/item/${discId}`);
      console.log(`✅ Item removed from cart successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  },

  async clearCart(userId: string): Promise<boolean> { // Changed from number to string
    try {
      console.log(`🧹 Clearing cart for user ${userId}`);
      // Backend route: DELETE /cart/:userId
      await axios.delete(`${API_URL}/cart/${userId}`);
      console.log(`✅ Cart cleared successfully`);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }
};