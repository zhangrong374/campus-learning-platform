const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  joinClub,
  leaveClub,
  getMyClubs,
  createClub
} = require('../controllers/clubController');
const { auth, adminAuth } = require('../middleware/auth');

// 公开路由
router.get('/', getAllClubs);

// 需要认证的路由
router.post('/:club_id/join', auth, joinClub);
router.delete('/:club_id/leave', auth, leaveClub);
router.get('/my', auth, getMyClubs);

// 管理员路由
router.post('/', auth, adminAuth, createClub);

module.exports = router;
