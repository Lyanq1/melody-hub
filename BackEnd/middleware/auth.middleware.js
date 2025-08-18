import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'Customer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Customer privileges required.' });
  }
};

export const isArtist = (req, res, next) => {
  if (req.user && req.user.role === 'Artist') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Artist privileges required.' });
  }
};

// Middleware kiểm tra quyền truy cập dashboard
export const canAccessDashboard = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Artist')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Dashboard access requires Admin or Artist privileges.' });
  }
};

// Middleware kiểm tra quyền quản lý hệ thống
export const canManageSystem = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. System management requires Admin privileges.' });
  }
};