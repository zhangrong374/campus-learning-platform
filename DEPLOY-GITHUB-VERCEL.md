# GitHub + Vercel 部署指南

本项目已配置为前后端一体化部署，使用 GitHub 代码仓库 + Vercel 云平台，实现单域名同时访问前后端。

---

## 📋 前置准备

### 1. 创建 GitHub 仓库
1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 仓库名称：`campus-learning-platform`
4. 设置为 Public 或 Private（推荐 Private）
5. 点击 `Create repository`

### 2. 安装 Vercel CLI（可选）
```bash
npm install -g vercel
```

---

## 🚀 部署步骤

### 方式一：通过 Vercel 网页部署（推荐）

#### 第一步：连接 GitHub
1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 `Add New...` → `Project`

#### 第二步：导入项目
1. 选择 `Import Git Repository`
2. 找到刚才创建的 `campus-learning-platform` 仓库
3. 点击 `Import`

#### 第三步：配置项目
Vercel 会自动识别项目配置，保持以下设置：

**Project Settings:**
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

**Environment Variables**（重要！）:
在 Environment Variables 中添加以下变量：

| Name | Value | Environment |
|------|--------|-------------|
| `DB_HOST` | 你的数据库地址 | Production, Preview, Development |
| `DB_PORT` | 3306 | Production, Preview, Development |
| `DB_USER` | 数据库用户名 | Production, Preview, Development |
| `DB_PASSWORD` | 数据库密码 | Production, Preview, Development |
| `DB_NAME` | campus_learning_platform | Production, Preview, Development |
| `JWT_SECRET` | 随机生成的密钥 | Production, Preview, Development |
| `NODE_ENV` | production | Production |

**注意**：
- 推荐使用云数据库（如 PlanetScale、Supabase MySQL、阿里云 RDS）
- 本地 MySQL 无法在 Vercel Serverless 环境中使用

#### 第四步：部署
1. 点击 `Deploy` 按钮
2. 等待 1-3 分钟
3. 部署成功后会获得一个 `vercel.app` 域名

#### 第五步：配置自定义域名（可选）
1. 在 Project Settings → Domains
2. 添加你的域名（如 `yourdomain.com`）
3. 按照提示配置 DNS

---

### 方式二：使用 Vercel CLI 部署

```bash
# 进入项目目录
cd c:/Users/DELL/CodeBuddy/route1

# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/campus-learning-platform.git

# 推送到 GitHub
git branch -M main
git push -u origin main

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

按照提示完成配置，项目将自动部署。

---

## 🔧 本地开发

安装依赖并启动：

```bash
# 安装依赖
npm install

# 启动后端（需要本地 MySQL）
cd backend
node api.js

# 启动前端（新终端）
cd frontend
npm run dev
```

访问：http://localhost:5173

---

## 📦 部署结构说明

```
your-project/
├── backend/
│   └── api.js              # Vercel Serverless Function
├── frontend/
│   ├── dist/               # 构建产物（静态文件）
│   └── package.json
├── vercel.json            # Vercel 配置文件
└── .env                  # 环境变量（不上传到 Git）
```

### vercel.json 配置说明

```json
{
  "routes": [
    {
      "src": "/api/(.*)",      // API 请求
      "dest": "/backend/api.js" // 路由到后端
    },
    {
      "src": "/(.*)",            // 其他请求
      "dest": "/frontend/dist/$1" // 路由到前端静态文件
    }
  ]
}
```

---

## 🌐 访问地址

部署成功后，你可以通过以下地址访问：

- **Vercel 默认域名**: `https://campus-learning-platform-xxx.vercel.app`
- **自定义域名**: `https://yourdomain.com`（如果配置）

### 前端访问
- `https://your-domain.com/` 或 `https://your-domain.com/dashboard`

### 后端 API 访问
- `https://your-domain.com/api/health`
- `https://your-domain.com/api/auth/login`

前后端使用同一个域名，无需跨域配置！

---

## 🗄️ 数据库配置

由于 Vercel 是 Serverless 环境，无法使用传统 MySQL，推荐以下云数据库方案：

### 方案一：PlanetScale（推荐）
1. 访问 [PlanetScale](https://planetscale.com)
2. 创建免费数据库（5GB 存储）
3. 获取连接信息：
   - Host: `aws.connect.psdb.cloud`
   - Username: 数据库用户名
   - Password: 数据库密码
   - Database: 数据库名
4. 在 Vercel 环境变量中配置

### 方案二：Supabase MySQL
1. 访问 [Supabase](https://supabase.com)
2. 创建项目，启用 PostgreSQL（或使用兼容 MySQL 的服务）
3. 获取连接信息

### 方案三：阿里云 / 腾讯云 RDS
1. 购买云数据库实例
2. 配置白名单（允许 Vercel IP 访问）
3. 获取连接信息

---

## 🔒 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

### 必须配置
```
DB_HOST=your-db-host.com
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=campus_learning_platform
JWT_SECRET=your-random-secret-key-min-32-chars
NODE_ENV=production
```

### 可选配置
```
SERVER_PORT=3006
CORS_ORIGIN=https://your-domain.com
```

---

## 📊 数据库初始化

首次部署后，需要在数据库中创建表结构。可以：

### 方式一：使用初始化脚本
```bash
cd backend
node create-missing-tables.js
node init-data.js
```

### 方式二：导入 SQL 文件
在数据库管理工具中导入 `backend/init-data.js` 中的 SQL 语句。

---

## 🔄 自动部署

配置完成后，每次 push 代码到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update code"
git push
```

Vercel 会自动：
1. 拉取最新代码
2. 运行构建命令
3. 部署到生产环境

---

## 🐛 常见问题

### 1. 数据库连接失败
**原因**：数据库未配置或白名单未设置
**解决**：检查环境变量，确保 Vercel 可以访问数据库

### 2. API 请求 404
**原因**：路由配置错误
**解决**：检查 `vercel.json` 的 routes 配置

### 3. 构建失败
**原因**：依赖问题或构建命令错误
**解决**：查看 Vercel 构建日志，检查 `frontend/package.json`

### 4. 前端页面空白
**原因**：静态资源路径错误
**解决**：确保 `vite.config.ts` 中 `base` 配置正确

---

## 📝 总结

### 部署架构
- **前端**: Vue3 + Vite 构建为静态文件
- **后端**: Node.js Express 作为 Vercel Serverless Function
- **数据库**: 云数据库（PlanetScale/Supabase 等）
- **域名**: 单域名统一访问前后端

### 优势
✅ 单域名访问，无需跨域
✅ 自动部署，Git push 即可
✅ 全球 CDN 加速
✅ 免费 SSL 证书
✅ Serverless 按需计费

### 访问示例
```
前端页面: https://your-domain.com
API 接口: https://your-domain.com/api/health
```

---

祝部署顺利！如遇问题，请查看 Vercel 部署日志。
