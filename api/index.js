const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 使用 MySQL 配置
const { testConnection } = require('../backend/src/config/database');
const errorHandler = require('../backend/src/middleware/errorHandler');

// 导入路由
const indexRoutes = require('../backend/src/routes/index');
const authRoutes = require('../backend/src/routes/auth');
const studentRoutes = require('../backend/src/routes/student');
const courseRoutes = require('../backend/src/routes/course');
const clubRoutes = require('../backend/src/routes/club');
const activityRoutes = require('../backend/src/routes/activity');
const recommendationRoutes = require('../backend/src/routes/recommendation');
const postRoutes = require('../backend/src/routes/post');

const app = express();

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

// 错误处理
app.use(errorHandler);

// 测试数据库连接
testConnection().then(connected => {
  if (connected) {
    console.log('✅ 数据库连接成功');
  } else {
    console.warn('⚠️ 数据库连接失败');
  }
});

module.exports = app;
