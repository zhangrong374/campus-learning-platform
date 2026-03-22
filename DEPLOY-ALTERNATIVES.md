# 不使用 Railway 的快速部署方案

## 📋 替代方案列表

### 方案 1: 内存数据模式（最快，无需数据库）
### 方案 2: Supabase（免费，支持中国）
### 方案 3: 国内云服务（稳定，适合生产）
### 方案 4: Vercel Postgres（官方集成）

---

## 🚀 方案 1: 内存数据模式（最快）

**优势**：
- ✅ 无需配置数据库
- ✅ 部署速度最快
- ✅ 适合演示和测试
- ✅ 零成本

**配置步骤**：

### 步骤 1: 修改 backend/api.js

1. 打开 `backend/api.js` 文件
2. 在文件开头添加内存数据：

```javascript
// 内存数据存储
const memoryData = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // 密码: 123456
      role: 'admin',
      avatar: null
    },
    {
      id: 2,
      username: 'student1',
      email: 'student1@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // 密码: 123456
      role: 'student',
      avatar: null
    }
  ],
  student_profiles: [
    { id: 1, user_id: 1, interests: '编程,数学', goal_type: 'exam', bio: '管理员账号' },
    { id: 2, user_id: 2, interests: '编程,英语', goal_type: 'job', bio: '学生账号' }
  ],
  courses: [
    { id: 1, name: '计算机科学导论', course_code: 'CS101', description: '计算机科学基础课程', category: '计算机', created_at: new Date() },
    { id: 2, name: '高等数学', course_code: 'MATH101', description: '微积分基础', category: '数学', created_at: new Date() },
    { id: 3, name: '大学英语', course_code: 'ENG101', description: '英语综合能力', category: '外语', created_at: new Date() },
    { id: 4, name: '数据结构', course_code: 'CS201', description: '数据结构与算法', category: '计算机', created_at: new Date() },
    { id: 5, name: '操作系统', course_code: 'CS301', description: '操作系统原理', category: '计算机', created_at: new Date() }
  ],
  clubs: [
    { id: 1, name: '编程俱乐部', description: '学习编程技术，参加竞赛', category: '技术', created_at: new Date() },
    { id: 2, name: '英语俱乐部', description: '提高英语水平，交流文化', category: '语言', created_at: new Date() },
    { id: 3, name: '数学建模协会', description: '数学建模竞赛培训', category: '学术', created_at: new Date() },
    { id: 4, name: '摄影协会', description: '记录校园生活，提高摄影技巧', category: '艺术', created_at: new Date() }
  ],
  activities: [
    { id: 1, title: '编程竞赛培训', description: 'ACM 编程竞赛技巧讲解', type: '竞赛', status: 'published', created_at: new Date() },
    { id: 2, title: '英语角活动', description: '每周英语交流，提高口语', type: '语言', status: 'published', created_at: new Date() },
    { id: 3, title: '数学讲座', description: '微积分学习方法分享', type: '学术', status: 'published', created_at: new Date() },
    { id: 4, title: '摄影展', description: '校园摄影作品展示', type: '艺术', status: 'published', created_at: new Date() }
  ],
  club_members: [],
  activity_participants: [],
  schedule: [],
  course_progress: [],
  posts: [
    {
      id: 1,
      user_id: 1,
      title: '欢迎使用校园学习平台',
      content: '这是一个测试帖子，欢迎大家使用校园学习平台！',
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 2,
      title: '编程俱乐部招新',
      content: '编程俱乐部开始招新了，欢迎对编程感兴趣的同学加入！',
      created_at: new Date()
    }
  ],
  nextId: {
    users: 3,
    courses: 6,
    clubs: 5,
    activities: 5,
    posts: 3
  }
};

// 模拟数据库查询函数
function query(sql, params) {
  // 简化的查询处理
  if (sql.includes('SELECT * FROM users WHERE username = ?')) {
    const username = params[0];
    const user = memoryData.users.find(u => u.username === username);
    return Promise.resolve([user ? [user] : []]);
  }
  
  if (sql.includes('SELECT * FROM courses')) {
    return Promise.resolve([memoryData.courses]);
  }
  
  if (sql.includes('SELECT * FROM clubs')) {
    return Promise.resolve([memoryData.clubs]);
  }
  
  if (sql.includes('SELECT * FROM activities')) {
    return Promise.resolve([memoryData.activities]);
  }
  
  if (sql.includes('SELECT * FROM posts')) {
    return Promise.resolve([memoryData.posts]);
  }
  
  if (sql.includes('SELECT * FROM student_profiles WHERE user_id = ?')) {
    const userId = params[0];
    const profile = memoryData.student_profiles.find(p => p.user_id === userId);
    return Promise.resolve([profile ? [profile] : []]);
  }
  
  return Promise.resolve([[]]);
}

// 替换 pool.query 为模拟函数
const pool = {
  query: query
};
```

3. 注释掉真实的数据库连接代码：

```javascript
// 注释掉以下代码
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'campus_learning_platform',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
```

4. 保存文件

### 步骤 2: 推送代码到 GitHub

```bash
# 进入项目目录
cd c:\Users\DELL\CodeBuddy\route1

# 初始化 Git（如果未初始化）
git init

# 添加文件
git add .

# 提交
git commit -m "使用内存数据模式"

# 推送到 GitHub
git push origin main
```

### 步骤 3: Vercel 部署

1. 登录 Vercel
2. 导入 GitHub 仓库
3. 配置项目：
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
4. 添加环境变量：
   - `JWT_SECRET`: your-secret-key-2024
   - `NODE_ENV`: production
5. 点击 "Deploy"

**优点**：部署速度极快，无需配置数据库
**缺点**：数据会在每次部署时重置

---

## 🚀 方案 2: Supabase（免费，支持中国）

**优势**：
- ✅ 免费套餐（500MB 存储）
- ✅ 支持中国地区访问
- ✅ 官方支持，稳定可靠
- ✅ 提供 PostgreSQL 数据库

**配置步骤**：

### 步骤 1: 注册 Supabase

1. 访问 [supabase.com](https://supabase.com/)
2. 使用 GitHub 或邮箱注册
3. 登录后点击 "New Project"

### 步骤 2: 创建数据库

1. 填写项目信息：
   - **Project Name**: campus-learning-platform
   - **Database Password**: 设置密码
   - **Region**: 选择离你最近的区域
2. 点击 "Create Project"

### 步骤 3: 初始化数据库

1. 进入项目详情页
2. 点击 "SQL Editor"
3. 复制以下 SQL 脚本并执行：

```sql
-- 创建表结构
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  interests TEXT,
  goal_type VARCHAR(20),
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) UNIQUE,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE club_members (
  id SERIAL PRIMARY KEY,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (club_id, user_id)
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_participants (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (activity_id, user_id)
);

CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  day VARCHAR(10),
  time_slot VARCHAR(20),
  location VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE course_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入测试数据
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('student1', 'student1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student');

INSERT INTO student_profiles (user_id, interests, goal_type, bio) VALUES
(1, '编程,管理', 'both', '管理员账号'),
(2, '编程,英语', 'job', '学生账号');

INSERT INTO courses (name, course_code, description, category) VALUES
('计算机科学导论', 'CS101', '计算机科学基础课程', '计算机'),
('高等数学', 'MATH101', '微积分基础', '数学'),
('大学英语', 'ENG101', '英语综合能力', '外语');

INSERT INTO clubs (name, description, category) VALUES
('编程俱乐部', '学习编程技术', '技术'),
('英语俱乐部', '提高英语水平', '语言'),
('数学建模协会', '数学建模竞赛', '学术');

INSERT INTO activities (title, description, type, status) VALUES
('编程竞赛', 'ACM 编程竞赛培训', '竞赛', 'published'),
('英语角', '每周英语交流活动', '语言', 'published'),
('数学讲座', '教授数学前沿知识', '学术', 'published');

INSERT INTO posts (user_id, title, content) VALUES
(1, '欢迎使用校园学习平台', '这是一个测试帖子，欢迎大家使用校园学习平台！'),
(2, '编程俱乐部招新', '编程俱乐部开始招新了，欢迎对编程感兴趣的同学加入！');
```

### 步骤 4: 获取连接字符串

1. 进入项目设置
2. 点击 "Database"
3. 找到 "Connection String"，选择 "Node.js"
4. 复制连接字符串

### 步骤 5: 修改数据库配置

1. 打开 `backend/api.js`
2. 修改数据库连接代码：

```javascript
// 修改为 Supabase 连接
const pool = mysql.createPool({
  host: 'db.xxx.supabase.co', // 从连接字符串提取
  port: 5432,
  user: 'postgres',
  password: 'your-password',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: true
  }
});
```

### 步骤 6: Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 部署
3. 添加环境变量：
   - `DATABASE_URL`: Supabase 连接字符串
   - `JWT_SECRET`: your-secret-key-2024
   - `NODE_ENV`: production

**优点**：免费，支持中国，数据持久化
**缺点**：需要修改代码适配 PostgreSQL

---

## 🚀 方案 3: 国内云服务（稳定）

### 3.1 腾讯云数据库

**优势**：
- ✅ 国内服务，访问速度快
- ✅ 有免费额度
- ✅ 支持 MySQL

**配置步骤**：

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索 "云数据库 MySQL"
3. 点击 "立即购买"
4. 选择 "免费额度" 或 "按量付费"
5. 配置数据库：
   - **地域**: 选择离你最近的
   - **数据库版本**: 5.7 或 8.0
   - **用户名**: root
   - **密码**: 设置密码
6. 购买后，在 "数据库管理" 中获取连接信息
7. 在 Vercel 环境变量中设置：
   - `DB_HOST`: 腾讯云数据库地址
   - `DB_PORT`: 3306
   - `DB_USER`: root
   - `DB_PASSWORD`: 你的密码
   - `DB_NAME`: 数据库名
   - `JWT_SECRET`: your-secret-key-2024

### 3.2 阿里云 RDS

**优势**：
- ✅ 国内服务，稳定可靠
- ✅ 技术成熟
- ✅ 支持 MySQL

**配置步骤**：

1. 登录 [阿里云控制台](https://console.aliyun.com/)
2. 搜索 "云数据库 RDS"
3. 点击 "创建实例"
4. 选择 "MySQL"
5. 配置实例：
   - **地域**: 选择离你最近的
   - **规格**: 选择适合的配置
   - **密码**: 设置密码
6. 购买后，在 "连接管理" 中获取连接信息
7. 在 Vercel 环境变量中设置相应的数据库连接参数

**优点**：稳定可靠，国内访问速度快
**缺点**：可能需要付费

---

## 🚀 方案 4: Vercel Postgres（官方集成）

**优势**：
- ✅ Vercel 官方集成
- ✅ 部署简单
- ✅ 自动配置环境变量

**配置步骤**：

1. 登录 Vercel
2. 进入项目设置
3. 点击 "Storage"
4. 点击 "Connect Database"
5. 选择 "Postgres"
6. 填写数据库名称，点击 "Create"
7. Vercel 会自动配置 `POSTGRES_URL` 环境变量
8. 修改 `backend/api.js` 适配 PostgreSQL

**优点**：官方集成，部署简单
**缺点**：需要修改代码适配 PostgreSQL，可能有使用限制

---

## 🔍 方案对比

| 方案 | 速度 | 成本 | 数据持久化 | 适合场景 |
|------|------|------|------------|----------|
| 内存数据模式 | ⚡ 最快 | 🆓 免费 | ❌ 临时 | 演示、测试 |
| Supabase | ⚡ 快 | 🆓 免费 | ✅ 持久 | 开发、小型应用 |
| 腾讯云数据库 | ⚡ 快 | 🆓 免费额度 | ✅ 持久 | 国内用户、生产环境 |
| 阿里云 RDS | ⚡ 快 | 💰 付费 | ✅ 持久 | 企业级应用 |
| Vercel Postgres | ⚡ 快 | 🆓 免费 | ✅ 持久 | Vercel 生态 |

---

## 🎯 推荐方案

### 快速演示：内存数据模式
- **适合**：快速部署、功能演示
- **特点**：无需配置数据库，部署即生效

### 长期使用：Supabase
- **适合**：开发环境、小型应用
- **特点**：免费、支持中国、数据持久化

### 国内生产：腾讯云数据库
- **适合**：国内用户、生产环境
- **特点**：稳定可靠、访问速度快

---

## 📞 技术支持

遇到问题请参考：
- [Supabase 文档](https://supabase.com/docs)
- [腾讯云文档](https://cloud.tencent.com/document/product/236)
- [阿里云文档](https://help.aliyun.com/product/26090.html)
- [Vercel 文档](https://vercel.com/docs)

---

**选择适合你的方案，开始部署吧！**
