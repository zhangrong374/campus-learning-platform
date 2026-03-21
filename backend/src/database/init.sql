-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_learning_platform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE campus_learning_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'school') DEFAULT 'student',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 学生详细信息表
CREATE TABLE IF NOT EXISTS student_profiles (
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
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  instructor VARCHAR(100),
  credits DECIMAL(3, 1),
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学生课程表
CREATE TABLE IF NOT EXISTS student_courses (
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
);

-- 课程内容表
CREATE TABLE IF NOT EXISTS course_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  video_url VARCHAR(500),
  order_num INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_order (course_id, order_num)
);

-- 学习进度表
CREATE TABLE IF NOT EXISTS learning_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score DECIMAL(5, 2),
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES course_content(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_content (user_id, content_id)
);

-- 闯关答题记录表
CREATE TABLE IF NOT EXISTS quiz_records (
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
);

-- 社团表
CREATE TABLE IF NOT EXISTS clubs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  member_count INT DEFAULT 0,
  image_url VARCHAR(500),
  requirements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社团成员表
CREATE TABLE IF NOT EXISTS club_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('member', 'leader') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_club_user (club_id, user_id)
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
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
);

-- 活动参与表
CREATE TABLE IF NOT EXISTS activity_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_activity_user (activity_id, user_id)
);

-- 推荐记录表
CREATE TABLE IF NOT EXISTS recommendations (
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
);

-- 提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('class', 'activity', 'deadline', 'custom') NOT NULL,
  title VARCHAR(200),
  description TEXT,
  remind_time DATETIME,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_time (user_id, remind_time)
);

-- 社区帖子表
CREATE TABLE IF NOT EXISTS posts (
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
);

-- 帖子评论表
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id)
);

-- 插入测试数据
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@campus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('student1', 'student1@campus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student');

-- 插入示例课程
INSERT INTO courses (course_code, course_name, instructor, credits, category, description) VALUES
('CS101', '计算机科学导论', '张教授', 3.0, '计算机', '计算机科学基础课程，涵盖计算机系统概论'),
('CS201', '数据结构与算法', '李教授', 4.0, '计算机', '学习基本数据结构和算法设计'),
('CS301', '操作系统', '王教授', 4.0, '计算机', '操作系统原理与实践'),
('MATH101', '高等数学', '赵教授', 5.0, '数学', '微积分基础'),
('ENG101', '大学英语', '刘教授', 3.0, '外语', '英语听说读写综合能力训练');
