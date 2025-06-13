import mysql from 'mysql2'
import { env } from './environment.js'

const pool = mysql
  .createPool({
    host: env.MYSQL_HOST,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE
  })
  .promise()

export default pool
