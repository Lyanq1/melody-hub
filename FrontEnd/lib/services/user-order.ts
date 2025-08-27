import { API_BASE_URL } from '../config';

export type UserOrder = {
  _id: string;
  createdAt: string;
  paymentMethod: 'Stripe' | 'MoMo' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  status: 'Confirmed' | 'Shipping' | 'Delivered';
  totalPrice: number;
}

export const userOrderService = {
  getUserOrders: async (userId: string): Promise<UserOrder[]> => {
    try {
      // Sửa lại URL để match với BE route (/api/orders/user/:userId)
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if response has the correct structure
      if (!data.success || !Array.isArray(data.orders)) {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      // Format the data according to our needs
      return data.orders.map((order: any) => ({
        _id: order._id,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        totalPrice: order.totalPrice,
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
};