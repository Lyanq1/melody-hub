// account.model.js
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

// Hàm tìm hoặc tạo tài khoản Facebook
export const findOrCreateFacebookAccount = async (facebookId, email, displayName, avatarURL, role) => {
  try {
    const username = `fb_${facebookId}` // Sử dụng định dạng fb_<facebookId> làm username duy nhất
    let account = await findAccountByUsername(username)

    if (!account) {
      // Tạo tài khoản mới nếu chưa tồn tại
      // Với tài khoản Facebook, không cần password (sử dụng null hoặc giá trị mặc định)
      const [result] = await pool.query(
        `INSERT INTO Account (Username, Password, Email, DisplayName, AvatarURL, Role, CreatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [username, null, email || null, displayName, avatarURL || null, role]
      )
      const accountId = result.insertId

      // Tạo bản ghi trong bảng tương ứng (Customer, Artist, Admin) dựa trên role
      if (role === 'Customer') {
        await pool.query(`INSERT INTO Customer (AccountID, Phone, Address) VALUES (?, ?, ?)`, [accountId, null, null])
      } else if (role === 'Artist') {
        await pool.query(`INSERT INTO Artist (AccountID, Phone, Address) VALUES (?, ?, ?)`, [accountId, null, null])
      } else if (role === 'Admin') {
        await pool.query(`INSERT INTO Admin (AccountID, Phone, Address) VALUES (?, ?, ?)`, [accountId, null, null])
      }

      account = await findAccountByUsername(username) // Lấy lại thông tin tài khoản
    }

    return account.AccountID
  } catch (error) {
    console.error('Error in findOrCreateFacebookAccount:', error.message)
    throw new Error('Error finding or creating Facebook account: ' + error.message)
  }
}
