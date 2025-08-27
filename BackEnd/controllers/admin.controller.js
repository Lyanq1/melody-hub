import Account from '../models/auth/account.model.js';
import Disc from '../models/product/disc.model.js';
import Category from '../models/product/category.model.js';
import Order from '../models/order/order.model.js';
import { verifyToken, canManageSystem } from '../middleware/auth.middleware.js';
import AdminService from '../services/admin.service.js';

// Lấy danh sách tất cả người dùng (chỉ admin)
export const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { withOrders, page = 1, limit = 10, search = '', role = 'all' } = req.query;

    if (withOrders === 'true') {
      const result = await AdminService.getUsersWithOrders(
        parseInt(page),
        parseInt(limit),
        search,
        role
      );
      return res.status(200).json(result);
    }

    const users = await Account.find().select('-Password').sort({ CreatedAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// Lấy thông tin một người dùng cụ thể (chỉ admin)
export const getUserById = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const { withOrders } = req.query;

    const user = await Account.findById(userId).select('-Password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (withOrders === 'true') {
      const orderSummary = await AdminService.calculateOrderSummary(userId);
      const orderDetails = await AdminService.getUserOrderDetails(userId);
      return res.status(200).json({
        ...user.toObject(),
        orderSummary,
        orderDetails
      });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

// Cập nhật thông tin người dùng (chỉ admin)
export const updateUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const updateData = req.body;
    
    // Không cho phép cập nhật password qua API này
    delete updateData.Password;
    
    const user = await Account.findByIdAndUpdate(
      userId,
      { ...updateData, UpdatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-Password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Xóa người dùng (chỉ admin)
export const deleteUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    
    // Không cho phép admin xóa chính mình
    if (userId === req.user.accountID) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await Account.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Thay đổi role của người dùng (chỉ admin)
export const changeUserRole = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const { newRole } = req.body;
    
    // Kiểm tra role hợp lệ
    const validRoles = ['Customer', 'Artist', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be Customer, Artist, or Admin' });
    }
    
    // Không cho phép admin thay đổi role của chính mình
    if (userId === req.user.accountID) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    const user = await Account.findByIdAndUpdate(
      userId,
      { Role: newRole, UpdatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-Password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User role changed successfully', user });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Error changing user role', error: error.message });
  }
};

// Lấy thống kê hệ thống (chỉ admin)
export const getSystemStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const totalUsers = await Account.countDocuments();
    const adminUsers = await Account.countDocuments({ Role: 'Admin' });
    const artistUsers = await Account.countDocuments({ Role: 'Artist' });
    const customerUsers = await Account.countDocuments({ Role: 'Customer' });
    
    // Người dùng mới trong 24h qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newUsers24h = await Account.countDocuments({ CreatedAt: { $gte: yesterday } });
    
    // Người dùng mới trong 7 ngày qua
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersWeek = await Account.countDocuments({ CreatedAt: { $gte: weekAgo } });
    
    const stats = {
      totalUsers,
      adminUsers,
      artistUsers,
      customerUsers,
      newUsers24h,
      newUsersWeek,
      timestamp: new Date()
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ message: 'Error retrieving system statistics', error: error.message });
  }
};

// Tìm kiếm người dùng (chỉ admin)
export const searchUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { query, role, page = 1, limit = 10 } = req.query;
    
    let searchCriteria = {};
    
    // Tìm kiếm theo tên, username hoặc email
    if (query) {
      searchCriteria.$or = [
        { DisplayName: { $regex: query, $options: 'i' } },
        { Username: { $regex: query, $options: 'i' } },
        { Email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Lọc theo role
    if (role && role !== 'all') {
      searchCriteria.Role = role;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await Account.find(searchCriteria)
      .select('-Password')
      .sort({ CreatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Account.countDocuments(searchCriteria);
    
    res.status(200).json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// Lấy danh sách tất cả sản phẩm (chỉ admin)
export const getAllProducts = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 10, search, category, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let searchCriteria = {};
    
    // Tìm kiếm theo tên hoặc nghệ sĩ
    if (search) {
      searchCriteria.$or = [
        { name: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Lọc theo danh mục
    if (category && category !== 'all') {
      searchCriteria.categoryId = category;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Disc.find(searchCriteria)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Fetch all categories to map category names
    const categories = await Category.find({}, '_id name');
    
    // Map category names to products
    const productsWithCategories = products.map(product => {
      const category = categories.find(cat => cat._id.toString() === product.categoryId?.toString());
      return {
        ...product.toObject(),
        categoryId: category ? { _id: category._id, name: category.name } : null
      };
    });
    
    const total = await Disc.countDocuments(searchCriteria);
    
    res.status(200).json({
      products: productsWithCategories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

// Lấy thông tin một sản phẩm cụ thể (chỉ admin)
export const getProductById = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { productId } = req.params;
    const product = await Disc.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Fetch category name for this product
    if (product.categoryId) {
      const category = await Category.findById(product.categoryId, '_id name');
      if (category) {
        product.categoryId = { _id: category._id, name: category.name };
      }
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
};

// Tạo sản phẩm mới (chỉ admin)
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.artist) {
      return res.status(400).json({ message: 'Name, price, and artist are required' });
    }
    
    const newProduct = new Disc(productData);
    const savedProduct = await newProduct.save();
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: savedProduct 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Cập nhật sản phẩm (chỉ admin)
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { productId } = req.params;
    const updateData = req.body;
    
    const product = await Disc.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ 
      message: 'Product updated successfully', 
      product 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Xóa sản phẩm (chỉ admin)
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { productId } = req.params;
    
    const product = await Disc.findByIdAndDelete(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Xóa nhiều sản phẩm (chỉ admin)
export const deleteMultipleProducts = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }
    
    const result = await Disc.deleteMany({ _id: { $in: productIds } });
    
    res.status(200).json({ 
      message: `${result.deletedCount} products deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting multiple products:', error);
    res.status(500).json({ message: 'Error deleting products', error: error.message });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

// Lấy danh sách tất cả danh mục (chỉ admin)
export const getAllCategories = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 10, search, parentCategory } = req.query;
    
    let searchCriteria = {};
    
    // Tìm kiếm theo tên
    if (search) {
      searchCriteria.name = { $regex: search, $options: 'i' };
    }
    
    // Lọc theo danh mục cha
    if (parentCategory && parentCategory !== 'all') {
      if (parentCategory === 'none') {
        searchCriteria.parentCategory = null;
      } else {
        searchCriteria.parentCategory = parentCategory;
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await Category.find(searchCriteria)
      .populate('parentCategory', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Category.countDocuments(searchCriteria);
    
    res.status(200).json({
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCategories: total,
        categoriesPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all categories:', error);
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
};

// Lấy thông tin một danh mục cụ thể (chỉ admin)
export const getCategoryById = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate('parentCategory', 'name');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error('Error getting category by ID:', error);
    res.status(500).json({ message: 'Error retrieving category', error: error.message });
  }
};

// Tạo danh mục mới (chỉ admin)
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const categoryData = req.body;
    
    // Validate required fields
    if (!categoryData.name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: categoryData.name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();
    
    res.status(201).json({ 
      message: 'Category created successfully', 
      category: savedCategory 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Cập nhật danh mục (chỉ admin)
export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { categoryId } = req.params;
    const updateData = req.body;
    
    // Check if updating name and if it conflicts with existing
    if (updateData.name) {
      const existingCategory = await Category.findOne({ 
        name: updateData.name, 
        _id: { $ne: categoryId } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ 
      message: 'Category updated successfully', 
      category 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Xóa danh mục (chỉ admin)
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { categoryId } = req.params;
    
    // Check if category has products
    const productCount = await Disc.countDocuments({ categoryId });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productCount} products. Please remove or reassign products first.` 
      });
    }
    
    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: categoryId });
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${subcategoryCount} subcategories. Please remove or reassign subcategories first.` 
      });
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Lấy thống kê sản phẩm và danh mục (chỉ admin)
export const getProductStats = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const totalProducts = await Disc.countDocuments();
    const totalCategories = await Category.countDocuments();
    const lowStockProducts = await Disc.countDocuments({ stock: { $lt: 10 } });
    const outOfStockProducts = await Disc.countDocuments({ stock: 0 });
    
    // Sản phẩm theo danh mục
    const productsByCategory = await Disc.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: '$category.name' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const stats = {
      totalProducts,
      totalCategories,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory,
      timestamp: new Date()
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting product stats:', error);
    res.status(500).json({ message: 'Error retrieving product statistics', error: error.message });
  }
};

// ==================== ORDER MANAGEMENT ====================

// Lấy danh sách tất cả đơn hàng (chỉ admin)
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 10, status, paymentStatus, startDate, endDate } = req.query;
    
    let searchCriteria = {};
    
    // Lọc theo trạng thái đơn hàng
    if (status && status !== 'all') {
      searchCriteria.status = status;
    }
    
    // Lọc theo trạng thái thanh toán
    if (paymentStatus && paymentStatus !== 'all') {
      searchCriteria.paymentStatus = paymentStatus;
    }
    
    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      searchCriteria.createdAt = {};
      if (startDate) searchCriteria.createdAt.$gte = new Date(startDate);
      if (endDate) searchCriteria.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get all orders with filters (no search)
    const orders = await Order.find(searchCriteria)
      .populate('userId', 'DisplayName Email Username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(searchCriteria);
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        ordersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

// Lấy thông tin một đơn hàng cụ thể (chỉ admin)
export const getOrderById = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('userId', 'DisplayName Email Username Phone')
      .populate('shipperId', 'name phone vehicle');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ message: 'Error retrieving order', error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (chỉ admin)
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['Confirmed', 'PickingUp', 'Preparing', 'Delivering', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: status,
        $push: {
          statusHistory: {
            status: status,
            timestamp: new Date(),
            description: note || `Status updated to ${status}`
          }
        }
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ 
      message: 'Order status updated successfully', 
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Cập nhật trạng thái thanh toán (chỉ admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    
    const validPaymentStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status value' });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: paymentStatus },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ 
      message: 'Payment status updated successfully', 
      order 
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};

// Xóa đơn hàng (chỉ admin)
export const deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { orderId } = req.params;
    
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

// ==================== COMPREHENSIVE STATISTICS ====================

// Lấy thống kê tổng quan hệ thống (chỉ admin)
export const getComprehensiveStats = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { period = 'month' } = req.query;
    
    // Tính toán khoảng thời gian
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Thống kê đơn hàng
    const totalOrders = await Order.countDocuments();
    const periodOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate }
    });
    const pendingOrders = await Order.countDocuments({ status: 'Confirmed' });
    const deliveringOrders = await Order.countDocuments({ status: 'Delivering' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    // Thống kê thanh toán
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const periodRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'Completed',
          createdAt: { $gte: startDate, $lt: endDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Thống kê sản phẩm
    const totalProducts = await Disc.countDocuments();
    const lowStockProducts = await Disc.countDocuments({ stock: { $lt: 10 } });
    const outOfStockProducts = await Disc.countDocuments({ stock: 0 });

    // Thống kê danh mục
    const totalCategories = await Category.countDocuments();

    // Thống kê khách hàng
    const totalCustomers = await Account.countDocuments({ Role: 'Customer' });
    const newCustomers = await Account.countDocuments({
      Role: 'Customer',
      CreatedAt: { $gte: startDate, $lt: endDate }
    });

    // Thống kê đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Thống kê doanh thu theo ngày trong tháng
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Completed',
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Thống kê sản phẩm bán chạy
    const topProducts = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.discId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'discs',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productName: '$product.name',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      period: {
        start: startDate,
        end: endDate,
        type: period
      },
      orders: {
        total: totalOrders,
        period: periodOrders,
        pending: pendingOrders,
        delivering: deliveringOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        byStatus: ordersByStatus
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        period: periodRevenue[0]?.total || 0,
        daily: dailyRevenue
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        topSelling: topProducts
      },
      categories: {
        total: totalCategories
      },
      customers: {
        total: totalCustomers,
        new: newCustomers
      },
      timestamp: new Date()
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting comprehensive stats:', error);
    res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
  }
};

// Lấy thống kê doanh thu theo thời gian (chỉ admin)
export const getRevenueStats = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { type = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupFormat, matchCriteria;
    
    switch (type) {
      case 'daily':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        matchCriteria = {
          paymentStatus: 'Completed',
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        };
        break;
      case 'monthly':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        matchCriteria = {
          paymentStatus: 'Completed',
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        };
        break;
      case 'quarterly':
        groupFormat = {
          $concat: [
            { $toString: { $year: '$createdAt' } },
            '-Q',
            { $toString: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } } }
          ]
        };
        matchCriteria = {
          paymentStatus: 'Completed',
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        };
        break;
      case 'yearly':
        groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        matchCriteria = { paymentStatus: 'Completed' };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        matchCriteria = {
          paymentStatus: 'Completed',
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        };
    }

    const revenueStats = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      type,
      year: parseInt(year),
      data: revenueStats
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    res.status(500).json({ message: 'Error retrieving revenue statistics', error: error.message });
  }
};

// Lấy thống kê khách hàng (chỉ admin)
export const getCustomerStats = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Thống kê khách hàng mới
    const newCustomers = await Account.countDocuments({
      Role: 'Customer',
      CreatedAt: { $gte: startDate }
    });

    // Thống kê khách hàng theo hoạt động
    const activeCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      {
        $group: {
          _id: null,
          uniqueCustomers: { $sum: 1 },
          totalOrders: { $sum: '$orderCount' },
          totalRevenue: { $sum: '$totalSpent' },
          averageOrdersPerCustomer: { $avg: '$orderCount' },
          averageSpentPerCustomer: { $avg: '$totalSpent' }
        }
      }
    ]);

    // Top khách hàng chi tiêu cao nhất
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customerName: '$customer.DisplayName',
          email: '$customer.Email',
          totalSpent: 1,
          orderCount: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      period: {
        start: startDate,
        end: now,
        type: period
      },
      newCustomers,
      activeCustomers: activeCustomers[0] || {
        uniqueCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrdersPerCustomer: 0,
        averageSpentPerCustomer: 0
      },
      topCustomers,
      timestamp: new Date()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting customer stats:', error);
    res.status(500).json({ message: 'Error retrieving customer statistics', error: error.message });
  }
};