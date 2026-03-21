require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function checkTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await pool.query('DESCRIBE student_profiles');
    console.log('student_profiles表结构:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
