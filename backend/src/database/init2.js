const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 从项目根目录加载.env
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

async function initDatabase() {
  console.log('🚀 开始初始化数据库...');

  try {
    const dbName = process.env.DB_NAME || 'campus_learning_platform';

    // 连接MySQL服务器
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ 已连接到MySQL服务器');

    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 数据库已创建');

    // 使用数据库
    await connection.query(`USE \`${dbName}\``);
    console.log('✅ 已选择数据库');

    // 定义所有表创建语句
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin', 'school') DEFAULT 'student',
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS student_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        major VARCHAR(100),
        grade VARCHAR(20),
        interests TEXT,
        goal_type ENUM('exam', 'job', 'both') DEFAULT 'exam',
        target_school VARCHAR(255),
        target_position VARCHAR(255),
        description TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_goal_type (goal_type)
      )`,

      `CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        instructor VARCHAR(100),
        credits DECIMAL(3, 1),
        category VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS student_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        semester VARCHAR(20),
        day_of_week VARCHAR(10),
        start_time TIME,
        end_time TIME,
        location VARCHAR(100),
        progress DECIMAL(5, 2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_user_semester (user_id, semester),
        UNIQUE KEY uk_user_course_semester (user_id, course_id, semester)
      )`,

      `CREATE TABLE IF NOT EXISTS course_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        video_url VARCHAR(500),
        order_num INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_course_order (course_id, order_num)
      )`,

      `CREATE TABLE IF NOT EXISTS learning_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content_id INT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        score DECIMAL(5, 2),
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (content_id) REFERENCES course_content(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_content (user_id, content_id)
      )`,

      `CREATE TABLE IF NOT EXISTS quiz_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        correct_answers INT NOT NULL,
        time_spent INT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_user_course (user_id, course_id),
        INDEX idx_score (score DESC)
      )`,

      `CREATE TABLE IF NOT EXISTS clubs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        description TEXT,
        member_count INT DEFAULT 0,
        image_url VARCHAR(500),
        requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS club_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        club_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('member', 'leader') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uk_club_user (club_id, user_id)
      )`,

      `CREATE TABLE IF NOT EXISTS activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        organizer VARCHAR(100),
        location VARCHAR(200),
        start_time DATETIME,
        end_time DATETIME,
        max_participants INT,
        current_participants INT DEFAULT 0,
        image_url VARCHAR(500),
        status ENUM('draft', 'published', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS activity_participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uk_activity_user (activity_id, user_id)
      )`,

      `CREATE TABLE IF NOT EXISTS recommendations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('course', 'club', 'activity', 'school', 'position') NOT NULL,
        item_id INT NOT NULL,
        score DECIMAL(5, 2),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_type (user_id, type),
        INDEX idx_score (score DESC)
      )`,

      `CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category VARCHAR(50),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_category (category),
        INDEX idx_created (created_at DESC)
      )`,

      `CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_post_id (post_id)
      )`
    ];

    console.log(`📝 创建 ${tables.length} 个表...`);

    // 执行所有表创建
    for (const tableSQL of tables) {
      try {
        await connection.query(tableSQL);
      } catch (err) {
        console.error('创建表失败:', err.message);
      }
    }

    console.log('✅ 表创建完成');

    // 插入测试数据
    console.log('📝 插入测试数据...');

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);

    await connection.query(
      `INSERT INTO users (username, email, password, role) VALUES
      ('admin', 'admin@campus.edu', ?, 'admin'),
      ('student1', 'student1@campus.edu', ?, 'student')`,
      [hashedPassword, hashedPassword]
    );

    await connection.query(
      `INSERT INTO courses (course_code, course_name, instructor, credits, category, description) VALUES
      ('CS101', '计算机科学导论', '张教授', 3.0, '计算机', '计算机科学基础课程'),
      ('CS201', '数据结构与算法', '李教授', 4.0, '计算机', '数据结构与算法设计'),
      ('CS301', '操作系统', '王教授', 4.0, '计算机', '操作系统原理与实践'),
      ('MATH101', '高等数学', '赵教授', 5.0, '数学', '微积分基础'),
      ('ENG101', '大学英语', '刘教授', 3.0, '外语', '英语听说读写训练')`
    );

    await connection.query(
      `INSERT INTO clubs (name, category, description, member_count) VALUES
      ('编程协会', '科技类', '热爱编程的同学聚集地', 120),
      ('篮球社', '体育类', '篮球爱好者的家园', 85),
      ('摄影协会', '文艺类', '用镜头记录美好瞬间', 60),
      ('志愿者协会', '志愿类', '奉献爱心，服务社会', 150),
      ('辩论社', '学术类', '锻炼口才，提升思辨能力', 45)`
    );

    await connection.query(
      `INSERT INTO activities (title, description, type, organizer, location, start_time, end_time, max_participants, current_participants, status) VALUES
      ('编程大赛', '年度编程竞赛，丰厚奖品等你来拿', '竞赛活动', '计算机学院', '图书馆报告厅', '2024-04-15 14:00:00', '2024-04-15 18:00:00', 100, 78, 'published'),
      ('考研经验分享会', '成功上岸学长学姐经验分享', '学术讲座', '学习部', '教学楼A101', '2024-04-20 19:00:00', '2024-04-20 21:00:00', 200, 156, 'published'),
      ('春季运动会', '全校春季运动会，展现青春风采', '文体活动', '体育部', '体育场', '2024-04-25 08:00:00', '2024-04-25 17:00:00', 500, 320, 'published')`
    );

    console.log('✅ 测试数据插入完成');

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
