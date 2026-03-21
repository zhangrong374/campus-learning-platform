const { pool } = require('../config/database');

// 创建帖子
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, title, content } = req.body;

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, category, title, content) VALUES (?, ?, ?, ?)',
      [userId, category, title, content]
    );

    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '创建帖子失败'
    });
  }
};

// 获取帖子列表
const getPosts = async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.*, u.username, u.avatar,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [posts] = await pool.query(query, params);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败'
    });
  }
};

// 获取帖子详情
const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 更新浏览量
    await pool.query(
      'UPDATE posts SET views = views + 1 WHERE id = ?',
      [id]
    );

    // 获取帖子详情
    const [posts] = await pool.query(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 获取评论
    const [comments] = await pool.query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        post: posts[0],
        comments
      }
    });
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败'
    });
  }
};

// 添加评论
const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;
    const { content, parent_id } = req.body;

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [post_id, userId, content, parent_id || null]
    );

    res.status(201).json({
      success: true,
      message: '评论添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({
      success: false,
      message: '添加评论失败'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostDetail,
  addComment
};
