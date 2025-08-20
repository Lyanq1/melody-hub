import Order from '../models/order/order.model.js';
import Cart from '../models/order/cart.model.js';
import Disc from '../models/product/disc.model.js';
import mongoose from 'mongoose';

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, customerInfo, paymentMethod, paymentStatus, sessionId } = req.body;

    if (!userId || !customerInfo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId and customerInfo' 
      });
    }

    // Validate payment method
    const validPaymentMethods = ['Stripe', 'MoMo', 'Cash on Delivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    // Get user's cart to create order items
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty or not found' 
      });
    }

    // Transform cart items to order items with proper product data
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        // Fetch product details from Disc model
        const product = await Disc.findById(item.discId);
        
        return {
          discId: item.discId,
          name: product?.title || product?.name || 'Product',
          price: typeof product?.price === 'string' ? parseInt(product.price.replace(/[^\d]/g, ''), 10) || 0 : (product?.price || 0),
          quantity: item.quantity
        };
      })
    );

    // Create order object
    const orderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalPrice: typeof cart.total === 'string' ? parseInt(cart.total.replace(/[^\d]/g, ''), 10) || 0 : cart.total || 0,
      shippingAddress: {
        addressLine: customerInfo.address,
        city: customerInfo.city || 'Ho Chi Minh',
        country: customerInfo.country || 'Vietnam',
        postalCode: customerInfo.postalCode || 700000
      },
      status: 'Confirmed',
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus || 'Pending',
      createdDate: new Date()
    };

    // Create and save the order
    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order', 
      error: error.message 
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const orders = await Order.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdDate: -1 });

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user orders', 
      error: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format' 
      });
    }

    const validStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order status', 
      error: error.message 
    });
  }
};
