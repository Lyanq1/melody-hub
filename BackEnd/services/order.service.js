import Order from '../models/order/order.model.js';
import { ShipperService } from './shipper.service.js';
import { GeocodingService } from './geocoding.service.js';

const shipperService = new ShipperService();
const geocodingService = new GeocodingService();

export class OrderService {
  async createOrder(orderData) {
    try {
      // Lấy random một shipper
      const shipper = await shipperService.getRandomShipper();
      if (!shipper) {
        throw new Error('Không tìm thấy shipper');
      }

      // Xử lý địa chỉ giao hàng và tính toán thời gian
      const { address, district } = orderData.customerInfo;
      const deliveryInfo = await geocodingService.processDeliveryAddress(address, district);

      // Tạo đơn hàng với thông tin đã xử lý
      const orderWithDeliveryInfo = {
        ...orderData,
        shipperId: shipper._id,
        shippingAddress: deliveryInfo.shippingAddress,
        deliveryInfo: {
          shipperId: shipper._id,
          estimatedDeliveryTime: deliveryInfo.estimatedDeliveryTime,
          startLocation: {
            address: geocodingService.STORE_ADDRESS,
            coordinates: geocodingService.STORE_COORDINATES
          },
          distance: deliveryInfo.distance,
          deliverySpeed: geocodingService.DELIVERY_SPEED
        },
        status: 'Confirmed',
        statusHistory: [{
          status: 'Confirmed',
          timestamp: new Date(),
          description: 'Đơn hàng đã được xác nhận'
        }]
      };

      // Tạo và lưu đơn hàng
      const order = new Order(orderWithDeliveryInfo);
      await order.save();

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      return await Order.findById(orderId)
        .populate('shipperId', 'name phone')
        .exec();
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Các methods khác...
}