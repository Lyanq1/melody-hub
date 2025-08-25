const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface OrderItem {
  discId: string;
  name: string;
  price: number; // Changed from string to number
  quantity: number;
}

export interface ShippingAddress {
  addressLine: string;
  city?: string;
  country?: string;
  postalCode?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: number;
}

export interface CreateOrderRequest {
  userId: string;
  customerInfo: CustomerInfo;
  paymentMethod: 'Stripe' | 'MoMo' | 'Cash on Delivery'; // Removed 'Unknown'
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  paymentMethod: string;
  paymentStatus: string;
  createdDate: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order?: Order;
  error?: string;
}

export interface GetUserOrdersResponse {
  success: boolean;
  orders: Order[];
  error?: string;
}

/**
 * Create a new order after successful payment
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/create/${orderData.userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: orderData.customerInfo.address,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    return data as CreateOrderResponse;
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
};

/**
 * Get all orders for a specific user
 */
export const getUserOrders = async (userId: string): Promise<GetUserOrdersResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user orders');
    }

    return data as GetUserOrdersResponse;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to fetch user orders',
    };
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};