# Supabase + Vercel 部署详细指南

## 📋 部署概览

本指南将帮助你使用 Supabase 作为数据库，将校园学习平台部署到 Vercel，实现前后端一体化。

---

## 🚀 部署步骤

### 步骤 1: 注册并创建 Supabase 项目

#### 1.1 注册 Supabase

1. 访问 [supabase.com](https://supabase.com/)
2. 点击 "Start your project"
3. 使用 GitHub 或邮箱注册
4. 完成邮箱验证

#### 1.2 创建数据库项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Project Name**: `campus-learning-platform`
   - **Database Password**: 设置一个强密码（记住这个密码）
   - **Region**: 选择离你最近的区域（推荐：Singapore 或 Tokyo）
3. 点击 "Create new project"
4. 等待数据库创建完成（约 2-3 分钟）

---

### 步骤 2: 初始化数据库

#### 2.1 打开 SQL 编辑器

1. 进入项目详情页
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "New query"

#### 2.2 执行初始化脚本

1. 打开项目文件 `backend/src/database/supabase-init.sql`
2. 复制所有 SQL 代码
3. 粘贴到 Supabase SQL Editor
4. 点击 "Run" 执行

**验证**：执行成功后，你应该看到 "Success" 消息，并且左侧 "Table Editor" 中可以看到创建的表。

---

### 步骤 3: 获取数据库连接信息

#### 3.1 获取连接字符串

1. 在项目详情页，点击左侧菜单的 "Settings"
2. 点击 "Database"
3. 向下滚动到 "Connection string" 部分
4. 选择 "URI" 标签
5. 复制连接字符串，格式如下：

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**注意**：
- 将 `[YOUR-PASSWORD]` 替换为你在步骤 1.2 中设置的数据库密码
- 保存这个连接字符串，后面会用到

---

### 步骤 4: 本地测试（可选）

#### 4.1 安装 PostgreSQL 客户端

```bash
cd backend
npm install pg
```

#### 4.2 创建本地 .env 文件

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-secret-key-2024
NODE_ENV=development
```

**注意**：将 `[YOUR-PASSWORD]` 和 `[PROJECT-REF]` 替换为实际值。

#### 4.3 启动本地服务器

```bash
cd backend
npm run start:pg
```

#### 4.4 测试 API

访问 `http://localhost:3006/api/health`，应该返回：

```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-01 12:00:00"
}
```

---

### 步骤 5: 推送代码到 GitHub

#### 5.1 初始化 Git 仓库（如果未初始化）

```bash
cd c:\Users\DELL\CodeBuddy\route1

# 初始化 Git
git init

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/你的用户名/campus-learning-platform.git
```

#### 5.2 提交并推送代码

```bash
# 添加所有文件
git add .

# 提交代码
git commit -m "配置 Supabase 数据库支持"

# 推送到 GitHub
git push -u origin main
```

**注意**：如果推送失败，可能需要先在 GitHub 创建仓库。

---

### 步骤 6: Vercel 部署

#### 6.1 登录 Vercel

1. 访问 [vercel.com](https://vercel.com/)
2. 使用 GitHub 账户登录

#### 6.2 导入项目

1. 点击 "Add New Project"
2. 在 "Import Git Repository" 部分，搜索并选择你的 GitHub 仓库
3. 点击 "Import"

#### 6.3 配置项目

在 "Configure Project" 页面：

- **Framework Preset**: 选择 "Other"
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

#### 6.4 添加环境变量

在 "Environment Variables" 部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 你的 Supabase 连接字符串 | 从步骤 3.1 复制 |
| `JWT_SECRET` | your-secret-key-2024 | JWT 签名密钥 |
| `NODE_ENV` | production | 环境标识 |

**重要**：
- `DATABASE_URL` 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- 将 `[YOUR-PASSWORD]` 替换为实际密码
- 将 `[PROJECT-REF]` 替换为实际项目引用

#### 6.5 部署项目

点击 "Deploy" 按钮，等待部署完成（约 2-3 分钟）。

---

### 步骤 7: 验证部署

#### 7.1 访问部署域名

部署成功后，Vercel 会提供一个域名，例如：
```
https://campus-learning-platform.vercel.app
```

#### 7.2 测试 API 健康检查

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

#### 7.3 测试前端页面

访问部署域名，应该能看到前端登录页面。

#### 7.4 测试登录功能

1. 打开登录页面
2. 使用测试账号登录：
   - **用户名**: `student1`
   - **密码**: `123456`

登录成功后，应该能看到仪表板页面。

---

## 🔍 故障排查

### 问题 1: Supabase 数据库连接失败

**错误信息**：
```
❌ 数据库连接失败: password authentication failed
```

**解决方案**：
1. 检查 `DATABASE_URL` 中的密码是否正确
2. 确认密码中没有特殊字符需要转义
3. 重新生成连接字符串

### 问题 2: Vercel 部署失败

**错误信息**：
```
Build failed with exit code 1
```

**解决方案**：
1. 检查 Vercel 构建日志
2. 确认 `package.json` 中的依赖是否正确
3. 确认 `vercel.json` 配置是否正确

### 问题 3: API 返回 404

**错误信息**：
```json
{
  "success": false,
  "message": "接口不存在"
}
```

**解决方案**：
1. 检查 `vercel.json` 中的路由配置
2. 确认 `backend/api-pg.js` 文件存在
3. 检查 Vercel 函数日志

### 问题 4: 前端白屏

**错误信息**：浏览器控制台显示错误

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签中的错误信息
3. 检查 API 请求是否正常
4. 确认 `frontend/dist` 目录生成正确

---

## 📊 数据库表结构

| 表名 | 说明 | 字段数 |
|------|------|--------|
| `users` | 用户表 | 6 |
| `student_profiles` | 学生资料表 | 5 |
| `courses` | 课程表 | 5 |
| `clubs` | 社团表 | 4 |
| `club_members` | 社团成员表 | 4 |
| `activities` | 活动表 | 6 |
| `activity_participants` | 活动参与表 | 4 |
| `schedule` | 课表表 | 6 |
| `course_progress` | 课程进度表 | 5 |
| `posts` | 帖子表 | 5 |

---

## 🎯 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| `admin` | `123456` | 管理员 | 管理员账号 |
| `student1` | `123456` | 学生 | 测试学生账号 |

---

## 📁 项目文件说明

| 文件 | 说明 | 用途 |
|------|------|------|
| `backend/api-pg.js` | PostgreSQL 版本后端 | Vercel Serverless 入口 |
| `backend/src/database/supabase-init.sql` | Supabase 初始化脚本 | 创建数据库表和测试数据 |
| `vercel.json` | Vercel 部署配置 | 部署配置 |
| `package.json` | 根目录依赖 | 构建脚本 |

---

## 🚀 本地开发

### 使用 Supabase 数据库

在本地 `.env` 文件中添加：

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-secret-key-2024
NODE_ENV=development
```

启动服务：

```bash
# 后端
cd backend
npm run start:pg

# 前端
cd frontend
npm run dev
```

### 使用本地 PostgreSQL 数据库

在本地 `.env` 文件中添加：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=campus_learning_platform
JWT_SECRET=your-secret-key-2024
NODE_ENV=development
```

---

## 📞 技术支持

遇到问题请参考：

- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

## 🎉 部署完成

恭喜！你已经成功将项目部署到 Vercel，使用 Supabase 作为数据库。

现在你可以：

1. **访问应用**：通过 Vercel 提供的域名访问
2. **分享链接**：将链接分享给他人使用
3. **持续开发**：本地修改后推送到 GitHub，Vercel 会自动重新部署
4. **管理数据**：通过 Supabase 控制台管理数据库

---

## 💡 最佳实践

1. **定期备份数据库**：Supabase 自动备份，但建议定期导出
2. **监控部署状态**：关注 Vercel 部署日志
3. **优化性能**：定期优化数据库查询
4. **安全更新**：定期更新依赖包
5. **错误监控**：设置错误监控机制

---

**部署成功后，你将拥有一个完整的校园学习规划平台，包含前端页面和后端 API，通过一个域名即可访问所有功能！**
