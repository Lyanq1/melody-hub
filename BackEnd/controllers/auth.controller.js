import {
  createAccount,
  findAccountByUsername,
  findAccountByEmail,
  findOrCreateFacebookAccount,
  updateAccount
} from '../models/auth/account.model.js'
import Account from '../models/auth/account.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import { createResetToken, findResetToken, markTokenAsUsed } from '../models/auth/resettoken.model.js'

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

// Hàm tạo mã xác thực ngẫu nhiên
const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
};

// Gửi mã xác thực khôi phục mật khẩu
export const requestPasswordReset = async (req, res) => {
  const { username } = req.body;

  try {
    // Tìm tài khoản theo username
    const account = await findAccountByUsername(username);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra xem tài khoản có email không
    if (!account.Email) {
      return res.status(400).json({ message: 'Tài khoản này không có email để gửi mã xác thực' });
    }

    // Kiểm tra format email (optional - nếu muốn validation chặt chẽ hơn)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account.Email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Tạo mã xác thực
    const resetToken = generateResetToken();

    // Lưu token vào database
    await createResetToken(account.Username, account.Email, resetToken, 15); // 15 phút

    // Gửi email chứa mã xác thực
    await sendPasswordResetEmail(account.Email, account.DisplayName, resetToken);

    res.status(200).json({ 
      message: 'Mã xác thực đã được gửi đến email của bạn',
      email: account.Email // Trả về email để frontend có thể hiển thị
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Lỗi khi gửi mã xác thực', error: error.message });
  }
};

// Xác thực mã reset password
export const verifyResetCode = async (req, res) => {
  const { username, token } = req.body;

  try {
    console.log('Verifying reset code for username:', username, 'token:', token);

    // Tìm tài khoản
    const account = await findAccountByUsername(username);
    if (!account) {
      console.log('Account not found for username:', username);
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    console.log('Account found:', account.Username);

    // Tìm và xác thực token
    const resetToken = await findResetToken(token);
    if (!resetToken) {
      console.log('Reset token not found or expired for token:', token);
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }

    console.log('Reset token found:', {
      username: resetToken.username,
      token: resetToken.token,
      isUsed: resetToken.isUsed,
      expiresAt: resetToken.expiresAt
    });

    // Kiểm tra xem token có đúng cho username này không
    if (resetToken.username !== username) {
      console.log('Token username mismatch:', resetToken.username, 'vs', username);
      return res.status(400).json({ message: 'Mã xác thực không đúng cho tài khoản này' });
    }

    console.log('Token verification successful');
    res.status(200).json({ message: 'Mã xác thực hợp lệ' });
  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ message: 'Lỗi khi xác thực mã', error: error.message });
  }
};

// Xác thực mã và đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { username, token, newPassword } = req.body;

  try {
    // Tìm tài khoản
    const account = await findAccountByUsername(username);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // Tìm và xác thực token
    const resetToken = await findResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra xem token có đúng cho username này không
    if (resetToken.username !== username) {
      return res.status(400).json({ message: 'Mã xác thực không đúng cho tài khoản này' });
    }

    // Kiểm tra xem token đã được sử dụng chưa
    if (resetToken.isUsed) {
      return res.status(400).json({ message: 'Mã xác thực đã được sử dụng' });
    }

    // Cập nhật mật khẩu mới (sẽ được hash trong pre-save middleware)
    await updateAccount(account._id, { Password: newPassword });

    // Đánh dấu token đã sử dụng
    await markTokenAsUsed(token);

    res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
};

// Upsert Google user sent from NextAuth callback
export const googleSync = async (req, res) => {
  try {
    console.log('[googleSync] incoming body:', JSON.stringify(req.body))
    const { sub, email, name, picture, role } = req.body || {}
    const finalRole = ['Customer', 'Artist', 'Admin'].includes(role) ? role : 'Customer'

    if (!email || !sub) {
      return res.status(400).json({ message: 'Missing required fields: email, sub' })
    }

    const username = `google_${sub}`

    // Try find by email first
    let account = await findAccountByEmail(email)

    if (!account) {
      // If not found, create new account
      const randomPassword = `GOOGLE_${sub}`
      const accountID = await createAccount(
        username,
        randomPassword,
        email,
        name || 'Google User',
        picture || null,
        finalRole,
        null,
        null
      )
      account = await Account.findById(accountID)
      console.log('[googleSync] created account', accountID)
    } else {
      // Update profile fields if changed; do not overwrite Username
      const update = {}
      if (name && name !== account.DisplayName) update.DisplayName = name
      if (picture && picture !== account.AvatarURL) update.AvatarURL = picture
      if (Object.keys(update).length) {
        await updateAccount(account._id, update)
      }
      account = await Account.findById(account._id)
      console.log('[googleSync] updated account', account._id.toString())
    }

    return res.status(200).json({
      success: true,
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
    console.error('googleSync error:', error)
    return res.status(500).json({ message: 'Failed to sync Google user', error: error.message })
  }
}