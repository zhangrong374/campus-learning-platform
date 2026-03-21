# 校园学习规划平台

一个功能完整的校园学习规划平台，支持课程学习、活动推荐、社团管理、考研就业规划等功能。

## 项目简介

本平台旨在帮助大学生进行学习规划和管理，提供以下核心功能：

1. **用户初始化流程** - 用户注册登录、填写个人信息、建立课表、系统初始化推荐
2. **课程学习流程** - 查看课表、上课提醒、学习课程内容、记录学习进度、闯关答题
3. **活动与社团参与流程** - 自动收集活动/社团信息、分析能力匹配度、推荐给用户
4. **考研/就业规划流程** - 设定目标、推荐院校/岗位、提供社区支持与AI导师辅助

## 技术栈

### 前端
- **框架**: Vue 3.5.13
- **语言**: TypeScript 5.6.2
- **构建工具**: Vite 6.0.5
- **状态管理**: Pinia 2.3.0
- **路由**: Vue Router 4.4.5
- **UI组件库**: Element Plus 2.8.4
- **数据可视化**: ECharts 5.5.1
- **HTTP请求**: Axios 1.7.9

### 后端
- **框架**: Express.js (Node.js)
- **数据库**: MySQL 8.0
- **驱动**: MySQL2 3.6.5
- **身份验证**: JWT
- **密码加密**: bcryptjs
- **跨域处理**: CORS
- **请求解析**: express.json

## 项目结构

```
route1/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   └── database.js # 数据库配置
│   │   ├── controllers/    # 控制器
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── courseController.js
│   │   │   ├── clubController.js
│   │   │   ├── activityController.js
│   │   │   ├── recommendationController.js
│   │   │   └── postController.js
│   │   ├── middleware/     # 中间件
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes/         # 路由
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── student.js
│   │   │   ├── course.js
│   │   │   ├── club.js
│   │   │   ├── activity.js
│   │   │   ├── recommendation.js
│   │   │   └── post.js
│   │   ├── database/       # 数据库初始化
│   │   │   ├── init.js
│   │   │   └── init.sql
│   │   └── server.js       # 服务器入口
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # 组件
│   │   ├── layouts/        # 布局
│   │   │   └── MainLayout.vue
│   │   ├── router/         # 路由
│   │   │   └── index.ts
│   │   ├── stores/         # 状态管理
│   │   │   └── user.ts
│   │   ├── utils/          # 工具
│   │   │   └── request.ts
│   │   ├── views/          # 页面
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── Courses.vue
│   │   │   ├── CourseDetail.vue
│   │   │   ├── Schedule.vue
│   │   │   ├── Activities.vue
│   │   │   ├── Clubs.vue
│   │   │   ├── Community.vue
│   │   │   └── Profile.vue
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .env.example            # 环境变量示例
├── .gitignore
├── package.json            # 根package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 环境配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库和服务器信息：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_learning_platform
SERVER_PORT=3000
CLIENT_PORT=5173
JWT_SECRET=your_jwt_secret_key_change_in_production
CORS_ORIGIN=http://localhost:5173
```

### 数据库初始化

1. 确保MySQL服务已启动
2. 初始化数据库和表结构：
```bash
cd backend
npm install
npm run init-db
```

这将创建数据库、所有表以及插入测试数据。

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd frontend && npm install
```

### 启动项目

#### 方式一：同时启动前后端（开发模式）

在项目根目录运行：
```bash
npm run dev
```

这将同时启动：
- 后端服务: http://localhost:3000
- 前端服务: http://localhost:5173

#### 方式二：分别启动

**启动后端：**
```bash
cd backend
npm run dev
```

**启动前端：**
```bash
cd frontend
npm run dev
```

### 测试账号

系统初始化时会创建以下测试账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin  | 123456 | 管理员 |
| student1 | 123456 | 学生 |

## 功能说明

### 1. 用户认证
- 用户注册
- 用户登录
- JWT认证
- 角色权限控制（学生、管理员、学校管理员）

### 2. 个人中心
- 填写个人资料（专业、年级、兴趣）
- 设定学习目标（考研/就业/两者兼顾）
- 设置目标院校/岗位
- 查看学习统计数据

### 3. 课表管理
- 查看周课表
- 添加课程到课表
- 按学期切换课表
- 课程时间地点管理

### 4. 课程学习
- 浏览所有课程
- 搜索和筛选课程
- 查看课程详情
- 学习课程内容
- 记录学习进度
- 闯关答题
- 学习排行榜

### 5. 活动管理
- 浏览所有活动
- 搜索和筛选活动
- 查看活动详情
- 报名参加活动
- 取消报名
- 查看我的活动

### 6. 社团管理
- 浏览所有社团
- 搜索和筛选社团
- 查看社团详情
- 加入社团
- 退出社团
- 查看我的社团

### 7. 智能推荐
- 根据用户兴趣推荐课程
- 根据用户兴趣推荐社团
- 根据目标推荐活动和内容
- 动态调整推荐内容

### 8. 社区交流
- 发布帖子
- 浏览帖子列表
- 按分类筛选帖子
- 查看帖子详情
- 添加评论
- 学习排行榜

## API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 学生接口
- `PUT /api/student/profile` - 更新个人资料
- `POST /api/student/courses` - 添加课程到课表
- `GET /api/student/schedule` - 获取课表
- `PUT /api/student/progress` - 更新学习进度
- `GET /api/student/progress` - 获取学习进度
- `POST /api/student/quiz` - 提交闯关答题
- `GET /api/student/leaderboard` - 获取排行榜

### 课程接口
- `GET /api/courses` - 获取所有课程
- `GET /api/courses/:id` - 获取课程详情
- `POST /api/courses` - 创建课程（管理员）
- `POST /api/courses/:id/content` - 添加课程内容（管理员）

### 社团接口
- `GET /api/clubs` - 获取所有社团
- `POST /api/clubs/:club_id/join` - 加入社团
- `DELETE /api/clubs/:club_id/leave` - 退出社团
- `GET /api/clubs/my` - 获取我的社团
- `POST /api/clubs` - 创建社团（管理员）

### 活动接口
- `GET /api/activities` - 获取所有活动
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities/:id/join` - 参加活动
- `DELETE /api/activities/:id/cancel` - 取消参加
- `GET /api/activities/my` - 获取我的活动
- `POST /api/activities` - 创建活动（管理员）

### 推荐接口
- `POST /api/recommendations/generate` - 生成推荐
- `GET /api/recommendations` - 获取推荐记录

### 社区接口
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 创建帖子
- `POST /api/posts/:id/comments` - 添加评论

## 部署指南

### 生产环境配置

1. 修改 `.env` 文件中的生产环境配置：
```env
NODE_ENV=production
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

2. 构建前端：
```bash
cd frontend
npm run build
```

3. 将 `frontend/dist` 目录部署到静态文件服务器（如 Nginx）

4. 启动后端服务：
```bash
cd backend
npm start
```

### 使用PM2管理进程（推荐）

1. 安装PM2：
```bash
npm install -g pm2
```

2. 创建PM2配置文件 `ecosystem.config.json`：
```json
{
  "apps": [
    {
      "name": "backend",
      "script": "./backend/src/server.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      }
    }
  ]
}
```

3. 启动服务：
```bash
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 开发说明

### 代码规范

- 前端使用 TypeScript，确保类型安全
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 最佳实践

### 数据库设计

- 所有表使用 UTF-8 编码
- 使用 InnoDB 存储引擎
- 合理设置索引以优化查询性能

### 安全建议

1. 生产环境务必修改JWT_SECRET
2. 使用HTTPS加密传输
3. 定期更新依赖包
4. 实施SQL注入防护
5. 限制文件上传大小和类型

## 常见问题

### 数据库连接失败
- 检查MySQL服务是否启动
- 确认 `.env` 文件中的数据库配置正确
- 确保数据库用户有足够的权限

### 前端无法连接后端
- 检查后端服务是否正常运行
- 确认 CORS 配置正确
- 查看浏览器控制台的错误信息

### 推荐功能不工作
- 确保用户已填写个人资料（专业、兴趣等）
- 手动调用推荐生成接口

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请提交 Issue。
