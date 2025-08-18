import Account from '../models/auth/account.model.js';
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