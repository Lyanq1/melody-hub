import mysql from 'mysql2'
import dotenv from 'dotenv'

import mongoose from 'mongoose';

dotenv.config()

export const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST, // '127.0.0.1'
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
  .promise()

// test thử các console log bằng cách gõ node database.js

mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log('MongoDB Atlas connected!'))
.catch((err) => console.error('MongoDB connection error:', err));


export default mongoose