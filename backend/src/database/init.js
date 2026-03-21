const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 从项目根目录加载.env
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

async function initDatabase() {
  console.log('🚀 开始初始化数据库...');
  console.log('数据库配置:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD ? '***' : '空'
  });

  try {
    // 连接MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ 已连接到MySQL服务器');

    // 创建数据库
    const dbName = process.env.DB_NAME || 'campus_learning_platform';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 数据库已创建/已存在');

    // 使用数据库
    await connection.query(`USE \`${dbName}\``);
    console.log('✅ 已选择数据库');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句并逐个执行
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.includes('CREATE DATABASE') && !s.includes('USE'));

    console.log(`📝 准备执行 ${statements.length} 条SQL语句`);

    // 执行表创建语句
    let successCount = 0;
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          await connection.query(statement);
          successCount++;
        } catch (err) {
          console.error('执行SQL语句失败:', err.message);
        }
      }
    }

    console.log(`✅ 成功执行 ${successCount} 条SQL语句`);

    await connection.end();
    console.log('✅ 数据库初始化完成！');
    console.log('📊 数据库名称:', dbName);
    console.log('👤 测试账号:');
    console.log('   管理员: admin / 123456');
    console.log('   学生: student1 / 123456');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行初始化
initDatabase();
