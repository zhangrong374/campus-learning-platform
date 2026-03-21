const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseDetail,
  createCourse,
  addCourseContent
} = require('../controllers/courseController');
const { auth, adminAuth } = require('../middleware/auth');

// 公开路由
router.get('/', getAllCourses);
router.get('/:id', getCourseDetail);

// 管理员路由
router.post('/', auth, adminAuth, createCourse);
router.post('/:id/content', auth, adminAuth, addCourseContent);

module.exports = router;
