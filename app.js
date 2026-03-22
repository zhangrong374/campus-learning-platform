const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 使用 PostgreSQL 配置
const { testConnection } = require('./backend/src/config/database-pg');
const errorHandler = require('./backend/src/middleware/errorHandler');

// 导入路由
const indexRoutes = require('./backend/src/routes/index');
const authRoutes = require('./backend/src/routes/auth');
const studentRoutes = require('./backend/src/routes/student');
const courseRoutes = require('./backend/src/routes/course');
const clubRoutes = require('./backend/src/routes/club');
const activityRoutes = require('./backend/src/routes/activity');
const recommendationRoutes = require('./backend/src/routes/recommendation');
const postRoutes = require('./backend/src/routes/post');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/posts', postRoutes);

// 静态文件服务 - 前端构建文件
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// 前端路由 - 所有非 API 请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ 数据库连接失败，请检查数据库配置');
    }

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📱 前端地址: http://localhost:${PORT}`);
      console.log(`🔧 API地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ 启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
