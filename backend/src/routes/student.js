const express = require('express');
const router = express.Router();
const {
  updateProfile,
  addCourse,
  getSchedule,
  updateProgress,
  getProgress,
  submitQuiz,
  getLeaderboard
} = require('../controllers/studentController');
const { auth } = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 个人资料
router.put('/profile', updateProfile);

// 课表管理
router.post('/courses', addCourse);
router.get('/schedule', getSchedule);

// 学习进度
router.put('/progress', updateProgress);
router.get('/progress', getProgress);

// 闯关答题
router.post('/quiz', submitQuiz);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
