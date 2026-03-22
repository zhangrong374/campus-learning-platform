-- Supabase 数据库初始化脚本 (PostgreSQL)
-- 校园学习平台数据库结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'school')),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学生详细信息表
CREATE TABLE IF NOT EXISTS student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  interests TEXT,
  goal_type VARCHAR(20) CHECK (goal_type IN ('exam', 'job', 'both')),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) UNIQUE,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社团表
CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社团成员表
CREATE TABLE IF NOT EXISTS club_members (
  id SERIAL PRIMARY KEY,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (club_id, user_id)
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 活动参与表
CREATE TABLE IF NOT EXISTS activity_participants (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (activity_id, user_id)
);

-- 课表表
CREATE TABLE IF NOT EXISTS schedule (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  day VARCHAR(10),
  time_slot VARCHAR(20),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 课程进度表
CREATE TABLE IF NOT EXISTS course_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (user_id, course_id)
);

-- 社区帖子表
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入测试用户（密码都是 123456）
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('student1', 'student1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student');

-- 插入学生资料
INSERT INTO student_profiles (user_id, interests, goal_type, bio) VALUES
(1, '编程,管理', 'both', '管理员账号'),
(2, '编程,英语', 'job', '学生账号');

-- 插入示例课程
INSERT INTO courses (name, course_code, description, category) VALUES
('计算机科学导论', 'CS101', '计算机科学基础课程', '计算机'),
('高等数学', 'MATH101', '微积分基础', '数学'),
('大学英语', 'ENG101', '英语综合能力', '外语'),
('数据结构', 'CS201', '数据结构与算法', '计算机'),
('操作系统', 'CS301', '操作系统原理', '计算机');

-- 插入示例社团
INSERT INTO clubs (name, description, category) VALUES
('编程俱乐部', '学习编程技术，参加竞赛', '技术'),
('英语俱乐部', '提高英语水平，交流文化', '语言'),
('数学建模协会', '数学建模竞赛培训', '学术'),
('摄影协会', '记录校园生活，提高摄影技巧', '艺术');

-- 插入示例活动
INSERT INTO activities (title, description, type, status) VALUES
('编程竞赛培训', 'ACM 编程竞赛技巧讲解', '竞赛', 'published'),
('英语角活动', '每周英语交流，提高口语', '语言', 'published'),
('数学讲座', '微积分学习方法分享', '学术', 'published'),
('摄影展', '校园摄影作品展示', '艺术', 'published');

-- 插入示例帖子
INSERT INTO posts (user_id, title, content) VALUES
(1, '欢迎使用校园学习平台', '这是一个测试帖子，欢迎大家使用校园学习平台！'),
(2, '编程俱乐部招新', '编程俱乐部开始招新了，欢迎对编程感兴趣的同学加入！');
