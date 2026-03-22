# GitHub + Vercel 前后端一体化部署详细指南

## 📋 部署概览

通过以下步骤，你可以将项目部署到 Vercel，实现前后端一体化，生成一个单链接同时提供前端页面和后端 API 服务。

## 🔧 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Express + MySQL + Serverless
- **部署平台**: Vercel
- **数据库**: PlanetScale (免费 MySQL 云数据库)

---

## 📁 项目结构

```
route1/
├── backend/             # 后端代码
│   ├── api.js           # Vercel Serverless 入口
│   ├── src/             # 后端源码
│   └── package.json     # 后端依赖
├── frontend/            # 前端代码
│   ├── src/             # 前端源码
│   ├── vite.config.ts   # Vite 配置
│   └── package.json     # 前端依赖
├── vercel.json          # Vercel 部署配置
├── package.json         # 根目录构建配置
└── .env                 # 环境变量
```

---

## 🚀 部署步骤

### 步骤 1: 准备工作

#### 1.1 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)
2. 点击 "New repository"
3. 填写仓库信息：
   - **Repository name**: `campus-learning-platform`
   - **Description**: 校园学习规划平台
   - **Visibility**: Public 或 Private
4. 点击 "Create repository"

#### 1.2 安装 Git（如果未安装）

- **Windows**: 下载并安装 [Git for Windows](https://git-scm.com/download/win)
- **Mac**: 安装 Xcode Command Line Tools 或 [Homebrew](https://brew.sh/) 安装
- **Linux**: `sudo apt install git` (Ubuntu/Debian)

#### 1.3 配置 Git

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

---

### 步骤 2: 配置 PlanetScale 数据库（推荐）

PlanetScale 是一个免费的 MySQL 云数据库，非常适合 Vercel 部署。

#### 2.1 注册 PlanetScale

1. 访问 [planetscale.com](https://planetscale.com/)
2. 使用 GitHub 或邮箱注册
3. 完成邮箱验证

#### 2.2 创建数据库

1. 登录后，点击 "Create a database"
2. 填写信息：
   - **Database name**: `campus-learning-platform`
   - **Region**: 选择离你最近的区域（如 AWS Tokyo）
3. 点击 "Create database"

#### 2.3 初始化数据库表

1. 进入数据库详情页
2. 点击 "Console" 标签
3. 复制以下 SQL 脚本并执行：

```sql
-- 创建表结构
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'school') DEFAULT 'student',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  interests TEXT,
  goal_type VARCHAR(20),
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) UNIQUE,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clubs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS club_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_club_user (club_id, user_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_activity_user (activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  day VARCHAR(10),
  time_slot VARCHAR(20),
  location VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入示例数据
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('student1', 'student1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student');

INSERT INTO courses (name, course_code, description, category) VALUES
('计算机科学导论', 'CS101', '计算机科学基础课程', '计算机'),
('高等数学', 'MATH101', '微积分基础', '数学'),
('大学英语', 'ENG101', '英语综合能力', '外语');

INSERT INTO clubs (name, description, category) VALUES
('编程俱乐部', '学习编程技术', '技术'),
('英语俱乐部', '提高英语水平', '语言'),
('数学建模协会', '数学建模竞赛', '学术');

INSERT INTO activities (title, description, type) VALUES
('编程竞赛', 'ACM 编程竞赛培训', '竞赛'),
('英语角', '每周英语交流活动', '语言'),
('数学讲座', '教授数学前沿知识', '学术');
```

#### 2.4 获取连接字符串

1. 在数据库详情页，点击 "Connect" 按钮
2. 选择 "Node.js" 或 "General"
3. 复制连接字符串，格式如下：
   ```
   mysql://xxx:pscale_pw_xxx@aws.connect.psdb.cloud/campus-learning-platform?sslaccept=strict
   ```

---

### 步骤 3: 配置本地项目

#### 3.1 初始化 Git 仓库

```bash
# 进入项目目录
cd c:\Users\DELL\CodeBuddy\route1

# 初始化 Git
git init

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/你的用户名/campus-learning-platform.git
```

#### 3.2 创建 .env 文件

创建 `.env` 文件，添加以下内容：

```env
# 数据库连接
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=campus_learning_platform

# JWT 密钥
JWT_SECRET=your-secret-key-2024

# 服务器配置
SERVER_PORT=3006
```

#### 3.3 验证项目配置

检查 `vercel.json` 文件是否存在且配置正确：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/api.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

---

### 步骤 4: 推送代码到 GitHub

#### 4.1 添加和提交代码

```bash
# 添加所有文件
git add .

# 提交代码
git commit -m "初始提交 - 校园学习规划平台"

# 推送代码到 GitHub
git push -u origin main
```

#### 4.2 验证推送成功

访问你的 GitHub 仓库，确认代码已成功推送。

---

### 步骤 5: Vercel 部署

#### 5.1 登录 Vercel

1. 访问 [vercel.com](https://vercel.com/)
2. 使用 GitHub 账户登录

#### 5.2 导入项目

1. 点击 "Add New Project"
2. 在 "Import Git Repository" 部分，搜索并选择你的 GitHub 仓库
3. 点击 "Import"

#### 5.3 配置项目

在 "Configure Project" 页面：

- **Framework Preset**: 选择 "Other"
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

#### 5.4 添加环境变量

在 "Environment Variables" 部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 你的 PlanetScale 连接字符串 | 从步骤 2.4 复制 |
| `JWT_SECRET` | your-secret-key-2024 | JWT 签名密钥 |
| `NODE_ENV` | production | 环境标识 |

**重要**：`DATABASE_URL` 格式示例：
```
mysql://xxx:pscale_pw_xxx@aws.connect.psdb.cloud/campus-learning-platform?sslaccept=strict
```

#### 5.5 部署项目

点击 "Deploy" 按钮，等待部署完成。

---

### 步骤 6: 验证部署

#### 6.1 访问部署域名

部署成功后，Vercel 会提供一个域名，例如：
```
https://campus-learning-platform.vercel.app
```

#### 6.2 测试 API 健康检查

访问：
```
https://campus-learning-platform.vercel.app/api/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-01 12:00:00"
}
```

#### 6.3 测试前端页面

访问部署域名，应该能看到前端页面。

#### 6.4 测试登录功能

1. 打开前端登录页面
2. 使用测试账号登录：
   - **用户名**: `student1`
   - **密码**: `123456`

---

## 🎯 部署成功标志

- ✅ 前端页面可访问
- ✅ API 接口响应正常
- ✅ 数据库连接成功
- ✅ 登录功能正常
- ✅ 所有功能模块可使用

---

## 🔍 常见问题排查

### 问题 1: 接口返回 404

**原因**：
- `vercel.json` 路由配置错误
- 后端文件路径不正确
- API 函数未正确导出

**解决方案**：
- 检查 `vercel.json` 中的 `src` 和 `dest` 配置
- 确认 `backend/api.js` 存在且导出正确
- 检查 Vercel 构建日志

### 问题 2: 数据库连接失败

**原因**：
- `DATABASE_URL` 环境变量未设置
- 连接字符串格式错误
- PlanetScale 数据库未初始化

**解决方案**：
- 确认 `DATABASE_URL` 环境变量已正确设置
- 检查连接字符串是否包含 `?sslaccept=strict`
- 验证 PlanetScale 数据库已执行初始化脚本

### 问题 3: 前端白屏

**原因**：
- 前端构建失败
- API 请求错误
- 环境变量配置错误

**解决方案**：
- 查看浏览器控制台错误
- 检查 Vercel 构建日志
- 验证 API 接口是否正常

### 问题 4: 登录失败

**原因**：
- 数据库表结构不正确
- 测试数据未插入
- JWT 密钥不匹配

**解决方案**：
- 确认数据库表已创建
- 验证测试数据已插入
- 检查 `JWT_SECRET` 环境变量

---

## 📡 本地开发

### 使用 PlanetScale 数据库

在本地 `.env` 文件中添加：

```env
DATABASE_URL=mysql://xxx:pscale_pw_xxx@aws.connect.psdb.cloud/campus-learning-platform?sslaccept=strict
JWT_SECRET=your-secret-key-2024
NODE_ENV=development
```

启动服务：

```bash
# 后端
cd backend
npm start

# 前端
cd frontend
npm run dev
```

### 使用本地 MySQL 数据库

在本地 `.env` 文件中添加：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=campus_learning_platform
JWT_SECRET=your-secret-key-2024
NODE_ENV=development
```

---

## 📄 技术文档

### 项目结构说明

| 文件/目录 | 说明 | 用途 |
|-----------|------|------|
| `backend/api.js` | Vercel Serverless 入口 | 处理所有 API 请求 |
| `backend/src/` | 后端源码 | 业务逻辑实现 |
| `frontend/src/` | 前端源码 | 页面和组件 |
| `vercel.json` | Vercel 配置 | 部署配置 |
| `package.json` | 根目录配置 | 构建脚本 |

### API 接口列表

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/courses` | GET | 获取课程列表 |
| `/api/courses/:id` | GET | 获取课程详情 |
| `/api/clubs` | GET | 获取社团列表 |
| `/api/clubs/my` | GET | 获取我的社团 |
| `/api/activities` | GET | 获取活动列表 |
| `/api/activities/my` | GET | 获取我的活动 |
| `/api/schedule` | GET | 获取课表 |
| `/api/schedule` | POST | 添加课程到课表 |
| `/api/schedule/:id` | DELETE | 删除课表 |
| `/api/recommendations/generate` | GET | 生成推荐 |
| `/api/student/progress` | GET | 获取学习进度 |
| `/api/posts` | GET | 获取社区帖子 |
| `/api/posts` | POST | 创建帖子 |
| `/api/profile` | PUT | 更新个人资料 |
| `/api/leaderboard` | GET | 获取排行榜 |

---

## 🎉 部署完成

恭喜！你已经成功将项目部署到 Vercel，实现了前后端一体化。现在你可以：

1. **访问应用**：通过 Vercel 提供的域名访问
2. **分享链接**：将链接分享给他人使用
3. **持续开发**：本地修改后推送到 GitHub，Vercel 会自动重新部署

---

## 🔗 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [PlanetScale 文档](https://docs.planetscale.com/)
- [GitHub 文档](https://docs.github.com/)
- [Vue 3 文档](https://v3.vuejs.org/)
- [Express 文档](https://expressjs.com/)

---

## 💡 最佳实践

1. **定期备份**：定期备份数据库
2. **监控部署**：关注 Vercel 部署状态
3. **安全更新**：定期更新依赖包
4. **性能优化**：优化 API 响应速度
5. **错误监控**：设置错误监控机制

---

## 📞 技术支持

如果遇到部署问题：
- 查看 Vercel 部署日志
- 检查 PlanetScale 数据库状态
- 参考本文档的问题排查部分
- 访问 Vercel 和 PlanetScale 官方文档

---

**部署成功后，你将拥有一个完整的校园学习规划平台，包含前端页面和后端 API，通过一个域名即可访问所有功能！**
