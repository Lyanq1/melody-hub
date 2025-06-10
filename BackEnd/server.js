// server.js
import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import dotenv from 'dotenv'
import { getArtist } from './database.js'

dotenv.config()
const app = express()
// Middleware
app.use(express.json())
app.use(cors()) // Đảm bảo frontend có thể gọi API từ server

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST, // '127.0.0.1'
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

db.connect((err) => {
  if (err) throw err
  console.log('Connected to MySQL database!')
})

// Lắng nghe port
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})
