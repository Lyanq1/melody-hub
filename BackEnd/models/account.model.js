import pool from '../config/db.js'
import bcrypt from 'bcrypt'

// Hàm tạo tài khoản mới
export const createAccount = async (username, password, email, displayName, avatarURL, role = 'Customer') => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      `INSERT INTO Account (Username, Password, Email, DisplayName, AvatarURL, Role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email, displayName, avatarURL || null, role]
    )
    return result.insertId
  } catch (error) {
    throw new Error('Error creating account: ' + error.message)
  }
}

// Hàm tìm tài khoản theo username
export const findAccountByUsername = async (username) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Account WHERE Username = ?`, [username])
    return rows[0]
  } catch (error) {
    throw new Error('Error finding account: ' + error.message)
  }
}

// Hàm tìm tài khoản theo email
export const findAccountByEmail = async (email) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Account WHERE Email = ?`, [email])
    return rows[0]
  } catch (error) {
    throw new Error('Error finding account by email: ' + error.message)
  }
}
