import {
  createAccount,
  findAccountByUsername,
  findAccountByEmail,
  findOrCreateFacebookAccount
} from '../models/auth/account.model.js'
import Account from '../models/auth/account.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import sendVerificationEmail from '../utils/email.js'

// Đăng ký
export const register = async (req, res) => {

  console.log('Register endpoint hit with data:', JSON.stringify(req.body, null, 2))
  const { username, password, email, displayName, phone, address, role } = req.body

  const validRoles = ['Customer', 'Artist', 'Admin']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  try {
    console.log('Checking for existing user with username:', username)
    const existingUser = await findAccountByUsername(username)
    console.log('Existing user check result:', existingUser)
    
    console.log('Checking for existing email:', email)
    const existingEmail = await findAccountByEmail(email)
    console.log('Existing email check result:', existingEmail)
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Create account with MongoDB
    console.log('Creating account with MongoDB...')
    const accountID = await createAccount(username, password, email, displayName, null, role, phone, address)
    console.log('Account created with ID:', accountID)

    // With MongoDB, we don't need separate tables for different roles
    // The role and additional fields are already stored in the Account document

    // await sendVerificationEmail(email, displayName) // Gửi email xác nhận

    console.log('Registration successful, returning response')
    res.status(201).json({ message: 'Registration successful', accountID })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Error registering user', error: error.message })
  }
}

// Đăng nhập
export const login = async (req, res) => {
  console.log('login hit')
  const { username, password } = req.body

  try {
    const account = await findAccountByUsername(username)
    if (!account) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    // For MongoDB, we use the comparePassword method
    const isMatch = await account.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    const token = jwt.sign(
      { accountID: account._id, username: account.Username, role: account.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        accountID: account._id,
        username: account.Username,
        email: account.Email,
        displayName: account.DisplayName,
        avatarURL: account.AvatarURL,
        role: account.Role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message })
  }
}

// Đăng nhập qua Facebook
export const facebookLogin = async (req, res) => {
  const { accessToken, role } = req.body

  const validRoles = ['Customer', 'Artist', 'Admin']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  try {
    // Xác minh access token với Facebook
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,email,name,picture&access_token=${accessToken}`
    )
    const { id: facebookId, email, name, picture } = response.data

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and display name are required from Facebook' })
    }

    // Tìm hoặc tạo tài khoản Facebook
    const accountID = await findOrCreateFacebookAccount(facebookId, email, name, picture?.data?.url, role)

    // Lấy thông tin tài khoản để kiểm tra và trả về
    const account = await findAccountByEmail(email)

    // Tạo JWT token
    const token = jwt.sign(
      { accountID, username: `fb_${facebookId}`, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    )

    res.status(200).json({
      message: 'Facebook login successful',
      token,
      user: {
        accountID,
        username: `fb_${facebookId}`,
        email,
        displayName: name,
        avatarURL: picture?.data?.url,
        role
      }
    })
  } catch (error) {
    console.error('Facebook login error:', error.response?.data || error.message)
    res.status(500).json({ message: 'Error logging in with Facebook', error: error.message })
  }
}

export const getUserInfo = async (req, res) => {
  const { username } = req.params
  try {
    const account = await Account.findOne({ Username: username }).select('-Password')
    if (!account) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(account)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Kiểm tra quyền truy cập dashboard
export const checkDashboardAccess = async (req, res) => {
  try {
    // Token đã được verify bởi middleware
    const { accountID, username, role } = req.user;
    
    // Kiểm tra quyền truy cập dashboard
    const canAccess = role === 'Admin' || role === 'Artist';
    
    if (!canAccess) {
      return res.status(403).json({ 
        message: 'Access denied. Dashboard access requires Admin or Artist privileges.',
        canAccess: false
      });
    }
    
    // Lấy thông tin user từ database
    const account = await Account.findById(accountID).select('-Password');
    if (!account) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Access granted',
      canAccess: true,
      user: {
        accountID: account._id,
        username: account.Username,
        email: account.Email,
        displayName: account.DisplayName,
        avatarURL: account.AvatarURL,
        role: account.Role
      }
    });
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    res.status(500).json({ message: 'Error checking access', error: error.message });
  }
};

// Lấy thông tin user hiện tại từ token
export const getCurrentUser = async (req, res) => {
  try {
    // Token đã được verify bởi middleware
    const { accountID, username, role } = req.user;
    
    // Lấy thông tin user từ database
    const account = await Account.findById(accountID).select('-Password');
    if (!account) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        accountID: account._id,
        username: account.Username,
        email: account.Email,
        displayName: account.DisplayName,
        avatarURL: account.AvatarURL,
        role: account.Role,
        phone: account.Phone,
        address: account.Address
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error getting user info', error: error.message });
  }
};

// PUT /api/user/:username
export const updateUserInfo = async (req, res) => {
  const { username } = req.params
  const updatedData = req.body

  try {
    const account = await Account.findOneAndUpdate(
      { Username: username },
      { ...updatedData, UpdatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-Password')

    if (!account) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: 'User updated successfully', user: account })
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message })
  }
}

