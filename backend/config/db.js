const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true,
    // Đọc trực tiếp file ca.pem nằm ở thư mục gốc /backend
    ca: fs.readFileSync(path.resolve(process.cwd(), 'ca.pem')), 
  },
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Aiven MySQL connection established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to Aiven MySQL:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
};