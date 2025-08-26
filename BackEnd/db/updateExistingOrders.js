import mongoose from 'mongoose';
import Order from '../models/order/order.model.js';
import Shipper from '../models/shipping/shipper.model.js';

// Kết nối database
mongoose.connect('mongodb://localhost:27017/melody-hub');

async function updateExistingOrders() {
  try {
    // 1. Lấy danh sách tất cả shippers
    const shippers = await Shipper.find();
    if (shippers.length === 0) {
      console.log('Không tìm thấy shipper nào trong database');
      return;
    }

    // 2. Lấy tất cả orders có shipperId là null
    const orders = await Order.find({ shipperId: null });
    console.log(`Tìm thấy ${orders.length} đơn hàng cần cập nhật`);

    // 3. Cập nhật từng order
    for (const order of orders) {
      // Chọn random một shipper
      const randomShipper = shippers[Math.floor(Math.random() * shippers.length)];
      
      // Cập nhật order
      await Order.findByIdAndUpdate(order._id, {
        shipperId: randomShipper._id
      });
    }

    console.log('Đã cập nhật xong tất cả đơn hàng');

  } catch (error) {
    console.error('Lỗi khi cập nhật orders:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
  }
}

// Chạy script
updateExistingOrders();



