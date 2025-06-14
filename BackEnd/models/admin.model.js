import pool from '../config/db.js'

export const createAdmin = async (accountID, phone, address) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO Admin (AccountID, Phone, Address)
       VALUES (?, ?, ?)`,
      [accountID, phone || null, address || null]
    )
    return result.insertId
  } catch (error) {
    throw new Error('Error creating admin: ' + error.message)
  }
}
