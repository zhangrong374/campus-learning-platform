# GitHub + Vercel 部署替代方案（中国地区）

## 🚨 问题说明

PlanetScale 在中国地区不可用，显示：
> "We have detected your current region is China. PlanetScale is not available in this location."

## 📋 替代方案

### 方案 1: Railway.app（推荐）

**优势**：
- ✅ 支持中国地区访问
- ✅ 免费套餐（500MB 存储）
- ✅ 完全兼容 MySQL
- ✅ 部署简单

**配置步骤**：

1. 访问 [railway.app](https://railway.app/)
2. 注册账号（使用 GitHub 登录）
3. 点击 "New Project" → "Provision MySQL"
4. 进入数据库详情页，点击 "Connect" 获取连接字符串
5. 在 Vercel 环境变量中设置 `DATABASE_URL`

**连接字符串格式**：
```
mysql://root:password@containers-us-west-14.railway.app:3306/railway
```

### 方案 2: Supabase

**优势**：
- ✅ 支持中国地区访问
- ✅ 免费套餐（500MB 存储）
- ✅ 提供 PostgreSQL 数据库
- ✅ 有中国节点

**注意**：需要修改代码适配 PostgreSQL

### 方案 3: 阿里云 RDS

**优势**：
- ✅ 国内服务，访问速度快
- ✅ 稳定可靠
- ✅ 支持 MySQL

**注意**：需要付费，适合生产环境

### 方案 4: 腾讯云数据库

**优势**：
- ✅ 国内服务，访问速度快
- ✅ 有免费额度
- ✅ 支持 MySQL

### 方案 5: 无需数据库的演示模式

如果只是想展示项目，可使用内存数据模式：

**步骤**：
1. 修改 `backend/api.js` 使用内存数据
2. 无需配置数据库
3. 部署到 Vercel

---

## 🚀 快速部署方案（使用 Railway）

### 步骤 1: 创建 Railway 数据库

1. 访问 [railway.app](https://railway.app/)
2. 登录后点击 "New Project"
3. 选择 "Provision MySQL"
4. 等待数据库创建完成

### 步骤 2: 初始化数据库

1. 进入数据库详情页
2. 点击 "Connect" → "MySQL CLI"
3. 复制命令并在终端执行
4. 粘贴初始化 SQL 脚本执行

### 步骤 3: 获取连接字符串

1. 在数据库详情页，点击 "Connect"
2. 复制 "DATABASE_URL" 连接字符串

### 步骤 4: Vercel 部署

1. 登录 Vercel
2. 导入 GitHub 仓库
3. 添加环境变量：
   - `DATABASE_URL`: Railway 连接字符串
   - `JWT_SECRET`: your-secret-key-2024
   - `NODE_ENV`: production
4. 点击 "Deploy"

---

## 📁 内存数据模式配置

**适合快速演示，无需数据库**

### 修改 backend/api.js

```javascript
// 添加内存数据
const memoryData = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      role: 'admin'
    },
    {
      id: 2,
      username: 'student1',
      email: 'student1@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      role: 'student'
    }
  ],
  courses: [
    { id: 1, name: '计算机科学导论', course_code: 'CS101', description: '计算机科学基础课程', category: '计算机' },
    { id: 2, name: '高等数学', course_code: 'MATH101', description: '微积分基础', category: '数学' },
    { id: 3, name: '大学英语', course_code: 'ENG101', description: '英语综合能力', category: '外语' }
  ],
  clubs: [
    { id: 1, name: '编程俱乐部', description: '学习编程技术', category: '技术' },
    { id: 2, name: '英语俱乐部', description: '提高英语水平', category: '语言' },
    { id: 3, name: '数学建模协会', description: '数学建模竞赛', category: '学术' }
  ],
  activities: [
    { id: 1, title: '编程竞赛', description: 'ACM 编程竞赛培训', type: '竞赛', status: 'published' },
    { id: 2, title: '英语角', description: '每周英语交流活动', type: '语言', status: 'published' },
    { id: 3, title: '数学讲座', description: '教授数学前沿知识', type: '学术', status: 'published' }
  ],
  clubMembers: [],
  activityParticipants: [],
  schedule: [],
  posts: []
};

// 修改数据库操作函数
// 例如：获取课程列表
app.get('/api/courses', (req, res) => {
  const { search, category } = req.query;
  let courses = memoryData.courses;
  
  if (search) {
    const searchTerm = search.toLowerCase();
    courses = courses.filter(course => 
      course.name.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm)
    );
  } else if (category) {
    courses = courses.filter(course => course.category === category);
  }
  
  res.json({ success: true, data: courses });
});

// 其他接口类似修改...
```

### 部署到 Vercel

1. 推送修改到 GitHub
2. 在 Vercel 部署
3. 无需配置数据库环境变量

---

## 🔍 中国地区部署注意事项

### 1. 网络访问

- **Vercel**：中国地区可访问，但可能较慢
- **Railway**：中国地区可访问
- **GitHub**：可能需要科学上网

### 2. 数据库选择

- **推荐**：Railway.app（免费，支持中国）
- **备选**：Supabase（免费，有中国节点）
- **企业**：阿里云 RDS（稳定，付费）

### 3. 部署优化

- **使用国内 CDN**：加速静态资源
- **优化 API 响应**：减少数据库查询
- **缓存策略**：使用 Redis 缓存

---

## 🎯 部署成功标志

- ✅ 前端页面可访问
- ✅ API 接口响应正常
- ✅ 登录功能正常
- ✅ 所有功能模块可使用

---

## 📞 技术支持

遇到问题请参考：
- [Railway 文档](https://docs.railway.app/)
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)

---

**选择适合你的方案，开始部署吧！**
