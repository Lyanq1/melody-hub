import pool from '../config/db.js'

export async function getArtists() {
  const [rows] = await pool.query('SELECT * FROM Artist')
  return rows
}
