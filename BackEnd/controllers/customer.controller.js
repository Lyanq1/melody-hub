import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Account from '../models/account.model.js'

const saltRounds = 10

const register = async (req, res) => {
  console.log('Register hitt')
  try {
    const { username, password, email, displayName, avatarURL } = req.body
    const hashed = await bcrypt.hash(password, saltRounds)

    const result = await Account.create({
      username,
      password: hashed,
      email,
      displayName,
      avatarURL
    })

    return res.status(201).json({ message: 'Tạo tài khoản thành công', user: result })
  } catch (error) {
    console.error('Error in register:', error)
    return res.status(500).json({ message: 'Lỗi máy chủ', error })
  }
}

const login = async (req, res) => {
  console.log('Login hitt')

  try {
    const { username, password } = req.body

    const results = await Account.findByUsername(username)
    if (!results || results.length === 0) {
      return res.status(401).json({ message: 'Sai thông tin đăng nhập' })
    }

    const user = results[0]
    const match = await bcrypt.compare(password, user.Password)
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' })

    const token = jwt.sign({ accountId: user.AccountID, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    })

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.AccountID,
        username: user.username,
        displayName: user.DisplayName,
        avatarURL: user.AvatarURL,
        email: user.Email
      }
    })
  } catch (err) {
    console.error('Error in login:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err })
  }
}

export default {
  register,
  login
}
