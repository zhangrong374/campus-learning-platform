const mysql = require('mysql2/promise');

async function createMissingTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'campus_learning_platform'
    });

    console.log('✅ 数据库连接成功\n');

    // 创建schedule表
    console.log('📅 创建schedule表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT,
        day VARCHAR(20) NOT NULL,
        time_slot VARCHAR(20) NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
        INDEX idx_user_day (user_id, day)
      )
    `);
    console.log('✅ schedule表创建成功');

    // 创建posts表
    console.log('\n💬 创建posts表...');
    const [postsCheck] = await connection.query('SHOW TABLES LIKE "posts"');
    if (postsCheck.length === 0) {
      await connection.query(`
        CREATE TABLE posts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          content TEXT,
          category VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_category (category)
        )
      `);
      console.log('✅ posts表创建成功');
    } else {
      console.log('✅ posts表已存在');
    }

    // 创建clubs表
    console.log('\n🎯 创建clubs表...');
    const [clubsCheck] = await connection.query('SHOW TABLES LIKE "clubs"');
    if (clubsCheck.length === 0) {
      await connection.query(`
        CREATE TABLE clubs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50),
          description TEXT,
          member_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_category (category)
        )
      `);
      console.log('✅ clubs表创建成功');
    } else {
      console.log('✅ clubs表已存在');
    }

    // 创建activities表
    console.log('\n🎉 创建activities表...');
    const [activitiesCheck] = await connection.query('SHOW TABLES LIKE "activities"');
    if (activitiesCheck.length === 0) {
      await connection.query(`
        CREATE TABLE activities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(200) NOT NULL,
          type VARCHAR(50),
          location VARCHAR(200),
          start_time DATETIME,
          end_time DATETIME,
          max_participants INT,
          current_participants INT DEFAULT 0,
          status VARCHAR(20) DEFAULT 'published',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_type (type)
        )
      `);
      console.log('✅ activities表创建成功');
    } else {
      console.log('✅ activities表已存在');
    }

    // 创建activity_participants表
    console.log('\n👥 创建activity_participants表...');
    const [apCheck] = await connection.query('SHOW TABLES LIKE "activity_participants"');
    if (apCheck.length === 0) {
      await connection.query(`
        CREATE TABLE activity_participants (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          activity_id INT NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
          UNIQUE KEY uk_user_activity (user_id, activity_id)
        )
      `);
      console.log('✅ activity_participants表创建成功');
    } else {
      console.log('✅ activity_participants表已存在');
    }

    // 创建club_members表
    console.log('\n👤 创建club_members表...');
    const [cmCheck] = await connection.query('SHOW TABLES LIKE "club_members"');
    if (cmCheck.length === 0) {
      await connection.query(`
        CREATE TABLE club_members (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          club_id INT NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
          UNIQUE KEY uk_user_club (user_id, club_id)
        )
      `);
      console.log('✅ club_members表创建成功');
    } else {
      console.log('✅ club_members表已存在');
    }

    // 创建recommendations表
    console.log('\n⭐ 创建recommendations表...');
    const [recCheck] = await connection.query('SHOW TABLES LIKE "recommendations"');
    if (recCheck.length === 0) {
      await connection.query(`
        CREATE TABLE recommendations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          type VARCHAR(20) NOT NULL,
          item_id INT NOT NULL,
          score DECIMAL(5, 2),
          reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_type (user_id, type),
          INDEX idx_score (score DESC)
        )
      `);
      console.log('✅ recommendations表创建成功');
    } else {
      console.log('✅ recommendations表已存在');
    }

    await connection.end();
    console.log('\n✅ 所有表创建完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

createMissingTables();
