const mysql = require('mysql2/promise');

async function fixTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'campus_learning_platform'
    });

    console.log('✅ 数据库连接成功\n');

    // 检查并修复courses表
    console.log('📚 检查courses表...');
    const [columns] = await connection.query('DESCRIBE courses');
    const hasName = columns.some(c => c.Field === 'name');
    const hasCourseName = columns.some(c => c.Field === 'course_name');

    if (!hasName && hasCourseName) {
      await connection.query('ALTER TABLE courses ADD COLUMN name VARCHAR(100) AFTER course_code');
      await connection.query('UPDATE courses SET name = course_name');
      console.log('✅ 添加name字段');
    }

    // 添加缺失的字段
    const missingFields = [];
    const existingFields = columns.map(c => c.Field);

    if (!existingFields.includes('level')) {
      await connection.query('ALTER TABLE courses ADD COLUMN level VARCHAR(20) DEFAULT "基础"');
      console.log('✅ 添加level字段');
    }

    if (!existingFields.includes('duration')) {
      await connection.query('ALTER TABLE courses ADD COLUMN duration INT DEFAULT 0');
      console.log('✅ 添加duration字段');
    }

    if (!existingFields.includes('created_at')) {
      await connection.query('ALTER TABLE courses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ 添加created_at字段');
    }

    // 检查并创建course_progress表
    console.log('\n📊 检查course_progress表...');
    const [tables] = await connection.query('SHOW TABLES LIKE "course_progress"');

    if (tables.length === 0) {
      await connection.query(`
        CREATE TABLE course_progress (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          course_id INT NOT NULL,
          progress INT DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          UNIQUE KEY uk_user_course (user_id, course_id)
        )
      `);
      console.log('✅ 创建course_progress表');
    } else {
      console.log('✅ course_progress表已存在');
    }

    // 检查并修复其他表
    console.log('\n🔍 检查其他表...');

    const requiredTables = [
      'schedule',
      'posts',
      'clubs',
      'activities',
      'activity_participants',
      'club_members',
      'recommendations'
    ];

    for (const tableName of requiredTables) {
      const [tableCheck] = await connection.query('SHOW TABLES LIKE ?', [tableName]);
      if (tableCheck.length === 0) {
        console.log(`⚠️ 表 ${tableName} 不存在，需要重新初始化数据库`);
      }
    }

    await connection.end();
    console.log('\n✅ 表结构检查完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

fixTables();
