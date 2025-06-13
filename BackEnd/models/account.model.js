import db from '../config/db.js'

const Account = {
  // Đăng ký tài khoản
  create: async (data) => {
    const sql = `
      INSERT INTO Account (username, password, email, displayName, avatarURL)
      VALUES (?, ?, ?, ?, ?)
    `
    return new Promise((resolve, reject) => {
      db.query(sql, [data.username, data.password, data.email, data.displayName, data.avatarURL], (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  },

  // Tìm theo username
  findByUsername: async (username) => {
    const sql = `SELECT * FROM Account WHERE username = ?`
    return new Promise((resolve, reject) => {
      db.query(sql, [username], (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  },

  // Thêm: Tìm theo email (để dùng cho reset mật khẩu sau này)
  findByEmail: async (email) => {
    const sql = `SELECT * FROM Account WHERE email = ?`
    return new Promise((resolve, reject) => {
      db.query(sql, [email], (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  },

  // Thêm: Cập nhật mật khẩu
  updatePassword: async (accountId, newHashedPassword) => {
    const sql = `UPDATE Account SET password = ? WHERE AccountID = ?`
    return new Promise((resolve, reject) => {
      db.query(sql, [newHashedPassword, accountId], (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  }
}

export default Account
