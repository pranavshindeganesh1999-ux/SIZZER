const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'salon_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Root@12345',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Database connection error:', err.message);
  });

module.exports = {
  query: async (text, params) => {
    try {
      const [rows] = await pool.query(text, params || []);
      return { rows };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  },
  pool
};
