const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

// 从项目根目录加载.env
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

console.log('数据库配置:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '***' : '空'
});

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campus_learning_platform'
    });

    console.log('✅ 数据库连接成功\n');

    // 检查用户表
    const [users] = await connection.query('SELECT id, username, email, role FROM users');
    console.log(`📋 用户表 (${users.length} 条记录):`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}`);
    });

    // 检查是否有测试账号，没有则创建
    const adminUser = users.find(u => u.username === 'admin');
    const studentUser = users.find(u => u.username === 'student1');

    if (!adminUser) {
      console.log('\n➕ 创建管理员账号...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@school.edu', hashedPassword, 'admin']
      );
      console.log('✅ 管理员账号创建成功: admin / 123456');
    }

    if (!studentUser) {
      console.log('\n➕ 创建学生账号...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['student1', 'student1@school.edu', hashedPassword, 'student']
      );
      const userId = result.insertId;

      // 创建学生资料
      await connection.query(
        'INSERT INTO student_profiles (user_id, major, grade, goal_type) VALUES (?, ?, ?, ?)',
        [userId, '计算机科学', '2024', 'job']
      );
      console.log('✅ 学生账号创建成功: student1 / 123456');
    }

    // 检查其他表
    const [courses] = await connection.query('SELECT COUNT(*) as count FROM courses');
    console.log(`\n📚 课程表: ${courses[0].count} 条记录`);

    const [clubs] = await connection.query('SELECT COUNT(*) as count FROM clubs');
    console.log(`🎯 社团表: ${clubs[0].count} 条记录`);

    const [activities] = await connection.query('SELECT COUNT(*) as count FROM activities');
    console.log(`🎉 活动表: ${activities[0].count} 条记录`);

    await connection.end();
    console.log('\n✅ 数据库检查完成！');
  } catch (error) {
    console.error('❌ 数据库错误:', error.message);
    process.exit(1);
  }
}

checkDatabase();
