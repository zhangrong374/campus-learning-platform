const express = require('express');
const cors = require('cors');
const path = require('path');

// 从项目根目录加载.env
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const { testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// 导入路由
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const courseRoutes = require('./routes/course');
const clubRoutes = require('./routes/club');
const activityRoutes = require('./routes/activity');
const recommendationRoutes = require('./routes/recommendation');
const postRoutes = require('./routes/post');

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
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📡 API地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
};

startServer();
