const { pool } = require('../config/database');

// 更新学生个人资料
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { major, grade, interests, goal_type, target_school, target_position, description } = req.body;

    // 检查是否已有档案
    const [existing] = await pool.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    let result;
    if (existing.length > 0) {
      // 更新
      [result] = await pool.query(
        `UPDATE student_profiles
         SET major = ?, grade = ?, interests = ?, goal_type = ?,
             target_school = ?, target_position = ?, description = ?
         WHERE user_id = ?`,
        [major, grade, interests, goal_type, target_school, target_position, description, userId]
      );
    } else {
      // 创建
      [result] = await pool.query(
        `INSERT INTO student_profiles
         (user_id, major, grade, interests, goal_type, target_school, target_position, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, major, grade, interests, goal_type, target_school, target_position, description]
      );
    }

    res.json({
      success: true,
      message: '个人资料更新成功',
      data: { id: result.insertId || existing[0].id }
    });
  } catch (error) {
    console.error('更新个人资料错误:', error);
    res.status(500).json({
      success: false,
      message: '更新个人资料失败'
    });
  }
};

// 添加课程到课表
const addCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id, semester, day_of_week, start_time, end_time, location } = req.body;

    // 检查课程是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM student_courses WHERE user_id = ? AND course_id = ? AND semester = ?',
      [userId, course_id, semester]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该课程已在课表中'
      });
    }

    // 添加课程
    const [result] = await pool.query(
      `INSERT INTO student_courses
       (user_id, course_id, semester, day_of_week, start_time, end_time, location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, course_id, semester, day_of_week, start_time, end_time, location]
    );

    res.json({
      success: true,
      message: '课程添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加课程错误:', error);
    res.status(500).json({
      success: false,
      message: '添加课程失败'
    });
  }
};

// 获取课表
const getSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;

    let query = `
      SELECT sc.*, c.course_code, c.course_name, c.instructor, c.credits, c.category
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.id
      WHERE sc.user_id = ?
    `;
    const params = [userId];

    if (semester) {
      query += ' AND sc.semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY sc.day_of_week, sc.start_time';

    const [schedule] = await pool.query(query, params);

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('获取课表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课表失败'
    });
  }
};

// 更新学习进度
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content_id, completed, score } = req.body;

    // 检查是否已有进度记录
    const [existing] = await pool.query(
      'SELECT id FROM learning_progress WHERE user_id = ? AND content_id = ?',
      [userId, content_id]
    );

    if (existing.length > 0) {
      // 更新
      await pool.query(
        `UPDATE learning_progress
         SET completed = ?, score = ?, completed_at = NOW()
         WHERE id = ?`,
        [completed, score, existing[0].id]
      );
    } else {
      // 创建
      await pool.query(
        `INSERT INTO learning_progress (user_id, content_id, completed, score, completed_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, content_id, completed, score]
      );
    }

    res.json({
      success: true,
      message: '学习进度更新成功'
    });
  } catch (error) {
    console.error('更新学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '更新学习进度失败'
    });
  }
};

// 获取学习进度
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.query;

    let query = `
      SELECT lp.*, cc.title, cc.course_id, cc.order_num
      FROM learning_progress lp
      JOIN course_content cc ON lp.content_id = cc.id
      WHERE lp.user_id = ?
    `;
    const params = [userId];

    if (course_id) {
      query += ' AND cc.course_id = ?';
      params.push(course_id);
    }

    query += ' ORDER BY cc.course_id, cc.order_num';

    const [progress] = await pool.query(query, params);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败'
    });
  }
};

// 提交闯关答题
const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id, score, total_questions, correct_answers, time_spent } = req.body;

    const [result] = await pool.query(
      `INSERT INTO quiz_records
       (user_id, course_id, score, total_questions, correct_answers, time_spent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, course_id, score, total_questions, correct_answers, time_spent]
    );

    res.json({
      success: true,
      message: '答题记录保存成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('提交答题错误:', error);
    res.status(500).json({
      success: false,
      message: '提交答题失败'
    });
  }
};

// 获取排行榜
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [leaderboard] = await pool.query(
      `SELECT u.id, u.username, u.avatar,
              SUM(qr.score) as total_score,
              COUNT(qr.id) as quiz_count
       FROM quiz_records qr
       JOIN users u ON qr.user_id = u.id
       GROUP BY u.id, u.username, u.avatar
       ORDER BY total_score DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '获取排行榜失败'
    });
  }
};

module.exports = {
  updateProfile,
  addCourse,
  getSchedule,
  updateProgress,
  getProgress,
  submitQuiz,
  getLeaderboard
};
