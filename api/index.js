const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('../backend/src/config/database');
const errorHandler = require('../backend/src/middleware/errorHandler');

const indexRoutes = require('../backend/src/routes/index');
const authRoutes = require('../backend/src/routes/auth');
const studentRoutes = require('../backend/src/routes/student');
const courseRoutes = require('../backend/src/routes/course');
const clubRoutes = require('../backend/src/routes/club');
const activityRoutes = require('../backend/src/routes/activity');
const recommendationRoutes = require('../backend/src/routes/recommendation');
const postRoutes = require('../backend/src/routes/post');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/posts', postRoutes);

app.use(errorHandler);

testConnection().then(connected => {
  if (connected) {
    console.log('✅ 数据库连接成功');
  } else {
    console.warn('⚠️ 数据库连接失败');
  }
});

module.exports = app;
