import Account from '../models/auth/account.model.js';
import Disc from '../models/product/disc.model.js';
import Category from '../models/product/category.model.js';
import { verifyToken, canManageSystem } from '../middleware/auth.middleware.js';

// Lấy danh sách tất cả người dùng (chỉ admin)
export const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
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
    const user = await Account.findById(userId).select('-Password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
      .populate('categoryId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Disc.countDocuments(searchCriteria);
    
    res.status(200).json({
      products,
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
    const product = await Disc.findById(productId).populate('categoryId', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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