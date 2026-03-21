const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/me', auth, getCurrentUser);

module.exports = router;
