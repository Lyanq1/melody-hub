import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { findAccountByEmail } from '../models/auth/account.model.js'

export const verifyToken = async (req, res, next) => {
  try {
    // Kiểm tra JWT token truyền thống trước
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      console.log('🔑 JWT Token found:', token.substring(0, 20) + '...')
      console.log('🔑 Using JWT secret:', config.jwt.secret.substring(0, 10) + '...')

      try {
        const decoded = jwt.verify(token, config.jwt.secret)
        console.log('✅ JWT verification successful:', decoded)
        req.user = decoded
        return next()
      } catch (jwtError) {
        console.log('❌ JWT verification failed:', jwtError.message)
      }
    }

    // Kiểm tra session authentication (cho Google Auth)
    const sessionUser = req.headers['x-session-user']
    if (sessionUser) {
      try {
        const userData = JSON.parse(sessionUser)
        console.log('🔍 Session auth data:', userData)

        // Tìm user trong database để xác thực
        let account = null
        if (userData.accountID) {
          // Import Account model để tìm theo ID
          const accountModel = await import('../models/auth/account.model.js')
          const Account = accountModel.default
          account = await Account.findById(userData.accountID)
        } else if (userData.email) {
          account = await findAccountByEmail(userData.email)
        }

        if (account) {
          req.user = {
            accountID: account._id,
            username: account.Username,
            role: account.Role,
            email: account.Email
          }
          console.log('✅ Session auth successful:', req.user)
          return next()
        } else {
          console.log('❌ User not found in database')
        }
      } catch (sessionError) {
        console.log('Session parsing failed:', sessionError.message)
      }
    }

    return res.status(401).json({
      message: 'Authentication required. Please provide a valid token or session.'
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' })
  }
}

export const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'Customer') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Customer privileges required.' })
  }
}

export const isArtist = (req, res, next) => {
  if (req.user && req.user.role === 'Artist') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Artist privileges required.' })
  }
}

// Middleware kiểm tra quyền truy cập dashboard
export const canAccessDashboard = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Artist')) {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Dashboard access requires Admin or Artist privileges.' })
  }
}

// Middleware kiểm tra quyền quản lý hệ thống
export const canManageSystem = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. System management requires Admin privileges.' })
  }
}
