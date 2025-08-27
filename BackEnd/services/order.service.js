import Order from '../models/order/order.model.js';

const updateOrderToShipping = async (orderId) => {
  try {
    // Lấy thông tin order để check createdAt
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    // Tính thời điểm nên chuyển sang shipping (5 phút sau khi tạo)
    const createdTime = new Date(order.createdAt).getTime();
    const shippingTime = createdTime + (5 * 60 * 1000); // 5 phút sau createdAt
    const now = new Date().getTime();

    // Nếu đã đủ 5 phút kể từ lúc tạo order
    if (now >= shippingTime) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: 'Shipping' },
        { new: true }
      );
      return updatedOrder;
    } else {
      // Nếu chưa đủ 5 phút, schedule lại cho đúng thời điểm
      const timeToWait = shippingTime - now;
      setTimeout(async () => {
        await Order.findByIdAndUpdate(
          orderId,
          { status: 'Shipping' },
          { new: true }
        );
      }, timeToWait);
      return order;
    }
  } catch (error) {
    console.error('Error updating order to shipping:', error);
    throw error;
  }
};

const updateOrderToDelivered = async (orderId) => {
  try {
    // Lấy thông tin order để check estimatedDeliveryTime
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    // Parse estimatedDeliveryTime từ string "HH:mm" sang Date object
    const [hours, minutes] = order.estimatedDeliveryTime.split(':');
    const deliveryTime = new Date();
    deliveryTime.setHours(parseInt(hours), parseInt(minutes), 0);

    // Nếu thời gian giao hàng dự kiến là quá khứ, set sang ngày mai
    const now = new Date();
    if (deliveryTime < now) {
      deliveryTime.setDate(deliveryTime.getDate() + 1);
    }

    const timeUntilDelivery = deliveryTime.getTime() - now.getTime();

    // Schedule update status
    setTimeout(async () => {
      const updateData = { status: 'Delivered' };
      
      // Nếu là COD, update paymentStatus thành Completed khi delivered
      if (order.paymentMethod === 'Cash on Delivery') {
        updateData.paymentStatus = 'Completed';
      }
      await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      );
    }, timeUntilDelivery);

    return order;
  } catch (error) {
    console.error('Error updating order to delivered:', error);
    throw error;
  }
};

export const scheduleOrderStatusUpdates = async (orderId, estimatedDeliveryTime) => {
  try {
    // Schedule shipping update first
    const shippingOrder = await updateOrderToShipping(orderId);
    if (shippingOrder) {
      // Then schedule delivery update
      await updateOrderToDelivered(orderId);
    }
  } catch (error) {
    console.error('Error scheduling order updates:', error);
    throw error;
  }
};