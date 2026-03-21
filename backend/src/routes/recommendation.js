const express = require('express');
const router = express.Router();
const {
  generateRecommendations,
  getRecommendations
} = require('../controllers/recommendationController');
const { auth } = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

router.post('/generate', generateRecommendations);
router.get('/', getRecommendations);

module.exports = router;
