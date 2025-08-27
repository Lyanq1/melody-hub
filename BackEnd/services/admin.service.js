import Account from '../models/auth/account.model.js';
import Order from '../models/order/order.model.js';

class AdminService {
  // Tính toán thống kê đơn hàng cho một khách hàng
  async calculateOrderSummary(userId) {
    try {
      const orders = await Order.find({ userId });
      
      let summary = {
        totalOrders: 0,
        totalSpent: 0,
        productTypes: {
          CD: 0,
          Vinyl: 0,
          Cassette: 0
        }
      };

      for (const order of orders) {
        if (order.paymentStatus === 'Completed') {
          summary.totalOrders++;
          summary.totalSpent += order.totalPrice;

          // Đếm số lượng từng loại sản phẩm
          for (const item of order.items) {
            if (item.type === 'CD') {
              summary.productTypes.CD += item.quantity;
            } else if (item.type === 'Vinyl') {
              summary.productTypes.Vinyl += item.quantity;
            } else if (item.type === 'Cassette') {
              summary.productTypes.Cassette += item.quantity;
            }
          }
        }
      }

      return summary;
    } catch (error) {
      console.error('Error calculating order summary:', error);
      throw error;
    }
  }

  // Lấy danh sách người dùng kèm thông tin đơn hàng có phân trang
  async getUsersWithOrders(page = 1, limit = 10, searchQuery = '', roleFilter = 'all') {
    try {
      // Xây dựng query
      let query = {};
      
      // Thêm điều kiện tìm kiếm
      if (searchQuery) {
        query.$or = [
          { DisplayName: { $regex: searchQuery, $options: 'i' } },
          { Username: { $regex: searchQuery, $options: 'i' } },
          { Email: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Thêm điều kiện lọc theo role
      if (roleFilter !== 'all') {
        query.Role = roleFilter;
      }

      // Tính toán số lượng bản ghi bỏ qua
      const skip = (page - 1) * limit;

      // Lấy tổng số người dùng thỏa điều kiện
      const totalUsers = await Account.countDocuments(query);

      // Lấy danh sách người dùng theo trang
      const users = await Account.find(query)
        .select('-Password')
        .sort({ CreatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Tính toán thống kê đơn hàng cho mỗi người dùng
      const usersWithOrders = await Promise.all(
        users.map(async (user) => {
          const orderSummary = await this.calculateOrderSummary(user._id);
          return {
            ...user.toObject(),
            orderSummary
          };
        })
      );

      return {
        users: usersWithOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          usersPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error getting users with orders:', error);
      throw error;
    }
  }

  // Lấy thông tin chi tiết đơn hàng của một khách hàng
  async getUserOrderDetails(userId) {
    try {
      const orders = await Order.find({ userId })
        .populate('items.discId', 'name type price')
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      console.error('Error getting user order details:', error);
      throw error;
    }
  }
}

export default new AdminService();