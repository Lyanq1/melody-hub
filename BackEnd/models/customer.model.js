import pool from '../config/db.js'

export const createCustomer = async (accountID, phone, address) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO Customer (AccountID, Phone, Address)
       VALUES (?, ?, ?)`,
      [accountID, phone || null, address || null]
    )
    return result.insertId
  } catch (error) {
    throw new Error('Error creating customer: ' + error.message)
  }
}
