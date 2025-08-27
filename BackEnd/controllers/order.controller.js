import Order from '../models/order/order.model.js';
import Cart from '../models/order/cart.model.js';
import mongoose from 'mongoose';
import Disc from '../models/product/disc.model.js';
import DeliveryFee from '../models/shipping/deliveryFee.model.js';
import axios from 'axios';
import { scheduleOrderStatusUpdates } from '../services/order.service.js';

// Hàm tính khoảng cách giữa 2 điểm theo công thức Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Khoảng cách (km)
};

// Hàm lấy tọa độ từ địa chỉ
const getCoordinates = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=vn`
    );
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};
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
    const { userId } = req.params; // Lấy userId từ params
    const { 
      address, 
      paymentMethod
    } = req.body; // Body chỉ cần 3 trường này

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Address is required' 
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

    // Transform cart items to order items
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

    // Get delivery fee based on district from address
    let deliveryFee = 0;
    try {
      // Tìm quận/huyện từ địa chỉ
      const district = address.split(',')
        .map(part => part.trim())
        .find(part => 
          part.startsWith('Phường') || 
          part.startsWith('Xã') || 
          part.startsWith('Quận') || 
          part.startsWith('Huyện')
        );

      if (district) {
        console.log('Found district:', district);
        // Sử dụng model đã import
        const deliveryFeeDoc = await DeliveryFee.findOne({ toDistrict: district });
        console.log('Query:', { toDistrict: district });
        console.log('DeliveryFeeDoc:', deliveryFeeDoc);
        
        if (deliveryFeeDoc && deliveryFeeDoc.deliveryFee) {
          deliveryFee = deliveryFeeDoc.deliveryFee;
          console.log('Set delivery fee:', deliveryFee);
        } else {
          // Thử tìm tất cả delivery fees để debug
          const allFees = await DeliveryFee.find({});
          console.log('All delivery fees:', allFees);
          console.log('No delivery fee found for district:', district);
        }
      } else {
        console.log('No district found in address:', address);
      }
    } catch (error) {
      console.error('Error getting delivery fee:', error);
    }

    // Calculate total price
    const subtotal = typeof cart.total === 'string' ? parseInt(cart.total.replace(/[^\d]/g, ''), 10) || 0 : cart.total || 0;

    // Tính thời gian giao hàng dự kiến
    const storeLocation = {
      address: '227 đường Nguyễn Văn Cừ, Phường Chợ Quán, Thành phố Hồ Chí Minh',
      lat: 10.762622,
      lng: 106.682028
    };

    let estimatedDeliveryTime = null;
    try {
      // Lấy tọa độ địa chỉ giao hàng
      const deliveryCoords = await getCoordinates(address);
      if (deliveryCoords) {
        // Tính khoảng cách
        const distance = calculateDistance(
          storeLocation.lat, 
          storeLocation.lng,
          deliveryCoords.lat,
          deliveryCoords.lng
        );
        
        // Tính thời gian giao hàng (giờ) với vận tốc 40km/h
        const deliveryTimeHours = distance / 40;
        
        // Chuyển sang phút và làm tròn lên
        const deliveryTimeMinutes = Math.ceil(deliveryTimeHours * 60);
        
        // Thêm 5 phút chuẩn bị
        const totalMinutes = deliveryTimeMinutes + 5;
        
        // Tính thời điểm giao hàng dự kiến
        const now = new Date();
        const estimatedTime = new Date(now.getTime() + totalMinutes * 60000);
        
        // Format thời gian
        estimatedDeliveryTime = estimatedTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        console.log('Delivery calculation:', {
          distance,
          deliveryTimeMinutes,
          totalMinutes,
          estimatedDeliveryTime
        });
      }
    } catch (error) {
      console.error('Error calculating delivery time:', error);
    }

    const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed';
    // Create order object
    const orderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalPrice: subtotal + deliveryFee,  // Tổng tiền đã bao gồm phí giao hàng
      address: address,
      status: 'Confirmed',  // Set default status
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      deliveryFee: deliveryFee,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: estimatedDeliveryTime || '--:--' // Fallback nếu không tính được
    };

    // Create and save the order
    const order = new Order(orderData);
    await order.save();

    // Schedule status updates
    await scheduleOrderStatusUpdates(order._id, estimatedDeliveryTime);

    // Xóa giỏ hàng sau khi tạo order thành công
    await Cart.findOneAndDelete({ userId: new mongoose.Types.ObjectId(userId) });

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
    }).sort({ createdAt: -1 });

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

    const validStatuses = ['Confirmed','Shipping', 'Delivered'];
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