const { pool } = require('../config/database');

// 获取所有社团
const getAllClubs = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM clubs';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY member_count DESC';

    const [clubs] = await pool.query(query, params);

    res.json({
      success: true,
      data: clubs
    });
  } catch (error) {
    console.error('获取社团列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取社团列表失败'
    });
  }
};

// 加入社团
const joinClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const { club_id } = req.params;

    // 检查是否已加入
    const [existing] = await pool.query(
      'SELECT id FROM club_members WHERE club_id = ? AND user_id = ?',
      [club_id, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经是该社团成员'
      });
    }

    // 加入社团
    await pool.query(
      'INSERT INTO club_members (club_id, user_id) VALUES (?, ?)',
      [club_id, userId]
    );

    // 更新成员数量
    await pool.query(
      'UPDATE clubs SET member_count = member_count + 1 WHERE id = ?',
      [club_id]
    );

    res.json({
      success: true,
      message: '加入社团成功'
    });
  } catch (error) {
    console.error('加入社团错误:', error);
    res.status(500).json({
      success: false,
      message: '加入社团失败'
    });
  }
};

// 退出社团
const leaveClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const { club_id } = req.params;

    // 退出社团
    await pool.query(
      'DELETE FROM club_members WHERE club_id = ? AND user_id = ?',
      [club_id, userId]
    );

    // 更新成员数量
    await pool.query(
      'UPDATE clubs SET member_count = member_count - 1 WHERE id = ?',
      [club_id]
    );

    res.json({
      success: true,
      message: '退出社团成功'
    });
  } catch (error) {
    console.error('退出社团错误:', error);
    res.status(500).json({
      success: false,
      message: '退出社团失败'
    });
  }
};

// 获取我的社团
const getMyClubs = async (req, res) => {
  try {
    const userId = req.user.id;

    const [clubs] = await pool.query(
      `SELECT c.*, cm.role, cm.joined_at
       FROM clubs c
       JOIN club_members cm ON c.id = cm.club_id
       WHERE cm.user_id = ?
       ORDER BY cm.joined_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: clubs
    });
  } catch (error) {
    console.error('获取我的社团错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的社团失败'
    });
  }
};

// 创建社团（管理员）
const createClub = async (req, res) => {
  try {
    const { name, category, description, image_url, requirements } = req.body;

    const [result] = await pool.query(
      `INSERT INTO clubs (name, category, description, image_url, requirements)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, description, image_url, requirements]
    );

    res.status(201).json({
      success: true,
      message: '社团创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建社团错误:', error);
    res.status(500).json({
      success: false,
      message: '创建社团失败'
    });
  }
};

module.exports = {
  getAllClubs,
  joinClub,
  leaveClub,
  getMyClubs,
  createClub
};
