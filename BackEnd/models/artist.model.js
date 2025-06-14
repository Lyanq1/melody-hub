import pool from '../config/db.js'

export const createArtist = async (accountID, phone, address) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO Artist (AccountID, Phone, Address)
       VALUES (?, ?, ?)`,
      [accountID, phone || null, address || null]
    )
    return result.insertId
  } catch (error) {
    throw new Error('Error creating admin: ' + error.message)
  }
}

export const getArtists = async () => {
  try {
    const [result] = await pool.query(`SELECT * FROM Artist`)
  } catch (error) {
    throw new Error('Error getArtists: ' + error.message)
  }
}
