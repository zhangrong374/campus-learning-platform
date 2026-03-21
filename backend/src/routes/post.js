const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostDetail,
  addComment
} = require('../controllers/postController');
const { auth } = require('../middleware/auth');

// 公开路由
router.get('/', getPosts);
router.get('/:id', getPostDetail);

// 需要认证的路由
router.post('/', auth, createPost);
router.post('/:id/comments', auth, addComment);

module.exports = router;
