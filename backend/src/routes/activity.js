const express = require('express');
const router = express.Router();
const {
  getAllActivities,
  getActivityDetail,
  joinActivity,
  cancelActivity,
  getMyActivities,
  createActivity
} = require('../controllers/activityController');
const { auth, adminAuth } = require('../middleware/auth');

// 公开路由
router.get('/', getAllActivities);
router.get('/:id', getActivityDetail);

// 需要认证的路由
router.post('/:id/join', auth, joinActivity);
router.delete('/:id/cancel', auth, cancelActivity);
router.get('/my', auth, getMyActivities);

// 管理员路由
router.post('/', auth, adminAuth, createActivity);

module.exports = router;
