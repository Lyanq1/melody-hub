import { createAccount, findAccountByUsername, findAccountByEmail } from '../models/account.model.js'
import { createCustomer } from '../models/customer.model.js'
import { createArtist } from '../models/artist.model.js'
import { createAdmin } from '../models/admin.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Đăng ký
export const register = async (req, res) => {
  console.log('register hit')
  const { username, password, email, displayName, phone, address, role } = req.body

  // Kiểm tra vai trò hợp lệ
  const validRoles = ['Customer', 'Artist', 'Admin']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  try {
    // Kiểm tra username hoặc email đã tồn tại
    const existingUser = await findAccountByUsername(username)
    const existingEmail = await findAccountByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Tạo tài khoản
    const accountID = await createAccount(username, password, email, displayName, null, role)

    // Tạo thông tin theo vai trò
    if (role === 'Customer') {
      await createCustomer(accountID, phone, address)
    } else if (role === 'Artist') {
      await createArtist(accountID, phone, address)
    } else if (role === 'Admin') {
      await createAdmin(accountID, phone, address)
    }

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
    // Tìm tài khoản
    const account = await findAccountByUsername(username)
    if (!account) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, account.Password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' })
    }

    // Tạo JWT token
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
