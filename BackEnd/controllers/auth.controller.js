import {
  createAccount,
  findAccountByUsername,
  findAccountByEmail,
  findOrCreateFacebookAccount
} from '../models/account.model.js'
import { createCustomer } from '../models/customer.model.js'
import { createArtist } from '../models/artist.model.js'
import { createAdmin } from '../models/admin.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import sendVerificationEmail from '../utils/email.js'

// Đăng ký
export const register = async (req, res) => {
  console.log('register hit')
  const { username, password, email, displayName, phone, address, role } = req.body

  const validRoles = ['Customer', 'Artist', 'Admin']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  try {
    const existingUser = await findAccountByUsername(username)
    const existingEmail = await findAccountByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const accountID = await createAccount(username, password, email, displayName, null, role)

    if (role === 'Customer') {
      await createCustomer(accountID, phone, address)
    } else if (role === 'Artist') {
      await createArtist(accountID, phone, address)
    } else if (role === 'Admin') {
      await createAdmin(accountID, phone, address)
    }

    await sendVerificationEmail(email, displayName) // Gửi email xác nhận

    res.status(201).json({ message: 'Registration successful', accountID })
  } catch (error) {
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

    const isMatch = await bcrypt.compare(password, account.Password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    const token = jwt.sign(
      { accountID: account.AccountID, username: account.Username, role: account.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        accountID: account.AccountID,
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
