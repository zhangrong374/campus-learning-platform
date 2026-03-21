const { pool } = require('../config/database');

// 获取所有活动
const getAllActivities = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    let query = 'SELECT * FROM activities';
    const params = [];
    const conditions = [];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY start_time DESC';

    const [activities] = await pool.query(query, params);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取活动列表失败'
    });
  }
};

// 获取活动详情
const getActivityDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    res.json({
      success: true,
      data: activities[0]
    });
  } catch (error) {
    console.error('获取活动详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取活动详情失败'
    });
  }
};

// 参加活动
const joinActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 检查活动是否存在且未满员
    const [activities] = await pool.query(
      'SELECT max_participants, current_participants, start_time FROM activities WHERE id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    const activity = activities[0];

    // 检查是否已参与
    const [existing] = await pool.query(
      'SELECT id FROM activity_participants WHERE activity_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已参加该活动'
      });
    }

    // 检查是否满员
    if (activity.max_participants && activity.current_participants >= activity.max_participants) {
      return res.status(400).json({
        success: false,
        message: '活动已满员'
      });
    }

    // 参加活动
    await pool.query(
      'INSERT INTO activity_participants (activity_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    // 更新参与人数
    await pool.query(
      'UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: '报名成功'
    });
  } catch (error) {
    console.error('参加活动错误:', error);
    res.status(500).json({
      success: false,
      message: '报名失败'
    });
  }
};

// 取消参加活动
const cancelActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 取消参加
    await pool.query(
      'DELETE FROM activity_participants WHERE activity_id = ? AND user_id = ?',
      [id, userId]
    );

    // 更新参与人数
    await pool.query(
      'UPDATE activities SET current_participants = current_participants - 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: '取消报名成功'
    });
  } catch (error) {
    console.error('取消活动错误:', error);
    res.status(500).json({
      success: false,
      message: '取消报名失败'
    });
  }
};

// 获取我的活动
const getMyActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    const [activities] = await pool.query(
      `SELECT a.*, ap.joined_at
       FROM activities a
       JOIN activity_participants ap ON a.id = ap.activity_id
       WHERE ap.user_id = ?
       ORDER BY a.start_time DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('获取我的活动错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的活动失败'
    });
  }
};

// 创建活动（管理员）
const createActivity = async (req, res) => {
  try {
    const { title, description, type, organizer, location, start_time, end_time, max_participants, image_url } = req.body;

    const [result] = await pool.query(
      `INSERT INTO activities (title, description, type, organizer, location, start_time, end_time, max_participants, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [title, description, type, organizer, location, start_time, end_time, max_participants, image_url]
    );

    res.status(201).json({
      success: true,
      message: '活动创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建活动错误:', error);
    res.status(500).json({
      success: false,
      message: '创建活动失败'
    });
  }
};

module.exports = {
  getAllActivities,
  getActivityDetail,
  joinActivity,
  cancelActivity,
  getMyActivities,
  createActivity
};
