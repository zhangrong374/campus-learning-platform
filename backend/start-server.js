// 简化的启动脚本，跳过数据库连接
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./src/middleware/errorHandler');

// 导入路由
const indexRoutes = require('./src/routes/index');
const authRoutes = require('./src/routes/auth');
const studentRoutes = require('./src/routes/student');
const courseRoutes = require('./src/routes/course');
const clubRoutes = require('./src/routes/club');
const activityRoutes = require('./src/routes/activity');
const recommendationRoutes = require('./src/routes/recommendation');
const postRoutes = require('./src/routes/post');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/posts', postRoutes);

// 错误处理
app.use(errorHandler);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API地址: http://localhost:${PORT}/api`);
  console.log(`⚠️  注意: 数据库未连接，部分功能可能不可用`);
});
