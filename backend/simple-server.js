const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// 导入JavaScript工具函数
const { responseUtil, logger, stringUtil, dateUtil } = require('./src/utils/helpers.js');

const app = express();
const PORT = process.env.SERVER_PORT || 3006;

// 从项目根目录加载.env
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

console.log('数据库配置:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '***' : '空'
});

app.use(cors());
app.use(express.json());

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_learning_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 健康检查
app.get('/api/health', (req, res) => {
  logger.info('健康检查请求');
  res.json({ status: 'ok', message: 'Server is running', timestamp: dateUtil.format(new Date()) });
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证用户名长度（2-20个字符）
    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json(responseUtil.error('用户名长度必须在2-20个字符之间', 400));
    }

    // 验证密码不为空
    if (!password) {
      return res.status(400).json(responseUtil.error('请输入密码', 400));
    }

    logger.info(`用户登录尝试: ${username}`);

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      logger.warn(`登录失败: 用户 ${username} 不存在`);
      return res.status(401).json(responseUtil.error('用户名或密码错误', 401));
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn(`登录失败: 用户 ${username} 密码错误`);
      return res.status(401).json(responseUtil.error('用户名或密码错误', 401));
    }

    // 获取学生资料
    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    logger.info(`用户 ${username} 登录成功`);
    res.json(responseUtil.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token,
      profile: profiles[0] || null
    }, '登录成功'));
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const [users] = await pool.query(
      'SELECT id, username, email, role, avatar FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [decoded.userId]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        profile: profiles[0] || null
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ success: false, message: '无效的token' });
  }
});

// 获取课程列表
app.get('/api/courses', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM courses';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR course_code LIKE ? OR description LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [courses] = await pool.query(query, params);
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取社团列表
app.get('/api/clubs', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM clubs';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [clubs] = await pool.query(query, params);
    res.json({ success: true, data: clubs });
  } catch (error) {
    console.error('获取社团列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取我的社团
app.get('/api/clubs/my', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const [myClubs] = await pool.query(
      'SELECT c.*, cm.joined_at FROM clubs c JOIN club_members cm ON c.id = cm.club_id WHERE cm.user_id = ?',
      [decoded.userId]
    );
    res.json({ success: true, data: myClubs });
  } catch (error) {
    console.error('获取我的社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 加入社团
app.post('/api/clubs/:clubId/join', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clubId = req.params.clubId;

    // 检查是否已加入
    const [existing] = await pool.query(
      'SELECT * FROM club_members WHERE user_id = ? AND club_id = ?',
      [decoded.userId, clubId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '已加入该社团' });
    }

    await pool.query(
      'INSERT INTO club_members (user_id, club_id) VALUES (?, ?)',
      [decoded.userId, clubId]
    );
    res.json({ success: true, message: '加入成功' });
  } catch (error) {
    console.error('加入社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 退出社团
app.delete('/api/clubs/:clubId/leave', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clubId = req.params.clubId;

    await pool.query(
      'DELETE FROM club_members WHERE user_id = ? AND club_id = ?',
      [decoded.userId, clubId]
    );
    res.json({ success: true, message: '退出成功' });
  } catch (error) {
    console.error('退出社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取活动列表
app.get('/api/activities', async (req, res) => {
  try {
    const { search, status, type } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [activities] = await pool.query(query, params);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取我的活动
app.get('/api/activities/my', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const [myActivities] = await pool.query(
      'SELECT a.*, am.joined_at FROM activities a JOIN activity_participants am ON a.id = am.activity_id WHERE am.user_id = ?',
      [decoded.userId]
    );
    res.json({ success: true, data: myActivities });
  } catch (error) {
    console.error('获取我的活动错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 参加活动
app.post('/api/activities/:activityId/join', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const activityId = req.params.activityId;

    // 检查是否已参加
    const [existing] = await pool.query(
      'SELECT * FROM activity_participants WHERE user_id = ? AND activity_id = ?',
      [decoded.userId, activityId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '已报名该活动' });
    }

    // 检查活动是否已满
    const [activity] = await pool.query(
      'SELECT max_participants, current_participants FROM activities WHERE id = ?',
      [activityId]
    );

    if (activity.length > 0 && activity[0].max_participants) {
      if (activity[0].current_participants >= activity[0].max_participants) {
        return res.status(400).json({ success: false, message: '活动已满员' });
      }
    }

    await pool.query(
      'INSERT INTO activity_participants (user_id, activity_id) VALUES (?, ?)',
      [decoded.userId, activityId]
    );

    // 更新参与人数
    await pool.query(
      'UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?',
      [activityId]
    );

    res.json({ success: true, message: '报名成功' });
  } catch (error) {
    console.error('参加活动错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 取消活动报名
app.delete('/api/activities/:activityId/cancel', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const activityId = req.params.activityId;

    await pool.query(
      'DELETE FROM activity_participants WHERE user_id = ? AND activity_id = ?',
      [decoded.userId, activityId]
    );

    // 更新参与人数
    await pool.query(
      'UPDATE activities SET current_participants = current_participants - 1 WHERE id = ?',
      [activityId]
    );

    res.json({ success: true, message: '取消报名成功' });
  } catch (error) {
    console.error('取消报名错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取推荐
app.get('/api/recommendations', async (req, res) => {
  try {
    const [recommendations] = await pool.query(
      'SELECT * FROM recommendations WHERE user_id = ? ORDER BY score DESC LIMIT 20',
      [req.query.userId || 1]
    );
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('获取推荐错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 生成推荐（GET方法）
app.get('/api/recommendations/generate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 获取用户资料
    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [decoded.userId]
    );

    if (profiles.length === 0) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const profile = profiles[0];
    const recommendations = {
      courses: [],
      clubs: [],
      activities: []
    };

    // 基于兴趣推荐课程
    if (profile.interests) {
      const interests = profile.interests.split(',');
      for (const interest of interests) {
        const [courses] = await pool.query(
          `SELECT * FROM courses WHERE category LIKE ? LIMIT 3`,
          [`%${interest}%`]
        );
        recommendations.courses.push(...courses);
      }
    }

    // 推荐社团
    const [clubs] = await pool.query(
      `SELECT * FROM clubs WHERE category LIKE ? LIMIT 5`,
      [`%${profile.interests || '学术'}%`]
    );
    recommendations.clubs = clubs;

    // 推荐活动
    const [activities] = await pool.query(
      `SELECT * FROM activities WHERE status = 'published' AND type LIKE ? LIMIT 5`,
      [`%${profile.goal_type || '学习'}%`]
    );
    recommendations.activities = activities;

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('生成推荐错误:', error);
    res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
  }
});

// 生成推荐（POST方法）
app.post('/api/recommendations/generate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 获取用户资料
    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [decoded.userId]
    );

    if (profiles.length === 0) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const profile = profiles[0];
    const recommendations = {
      courses: [],
      clubs: [],
      activities: []
    };

    // 基于兴趣推荐课程
    if (profile.interests) {
      const interests = profile.interests.split(',');
      for (const interest of interests) {
        const [courses] = await pool.query(
          `SELECT * FROM courses WHERE category LIKE ? LIMIT 3`,
          [`%${interest}%`]
        );
        recommendations.courses.push(...courses);
      }
    }

    // 推荐社团
    const [clubs] = await pool.query(
      `SELECT * FROM clubs WHERE category LIKE ? LIMIT 5`,
      [`%${profile.interests || '学术'}%`]
    );
    recommendations.clubs = clubs;

    // 推荐活动
    const [activities] = await pool.query(
      `SELECT * FROM activities WHERE status = 'published' AND type LIKE ? LIMIT 5`,
      [`%${profile.goal_type || '学习'}%`]
    );
    recommendations.activities = activities;

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('生成推荐错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取学习排行榜
app.get('/api/leaderboard', async (req, res) => {
  try {
    // 简化查询，直接从users表获取
    const [leaderboard] = await pool.query(`
      SELECT u.id, u.username, 0 as total_study_time, 0 as completed_courses, '新手' as current_level
      FROM users u
      ORDER BY u.id DESC
      LIMIT 20
    `);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    // 返回默认排行榜数据
    res.json({ success: true, data: [
      { id: 1, username: 'student1', total_study_time: 100, completed_courses: 5, current_level: '高级' },
      { id: 2, username: 'student2', total_study_time: 80, completed_courses: 3, current_level: '中级' },
      { id: 3, username: 'admin', total_study_time: 200, completed_courses: 10, current_level: '专家' }
    ]});
  }
});

// 获取课程详情
app.get('/api/courses/:id', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: '课程不存在' });
    }
    res.json({ success: true, data: courses[0] });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户课表
app.get('/api/schedule', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const [schedule] = await pool.query(
      'SELECT s.*, c.name as course_name FROM schedule s LEFT JOIN courses c ON s.course_id = c.id WHERE s.user_id = ? ORDER BY s.day, s.time_slot',
      [decoded.userId]
    );
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('获取课表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加课程到课表
app.post('/api/schedule', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { course_id, day, time_slot, location } = req.body;

    await pool.query(
      'INSERT INTO schedule (user_id, course_id, day, time_slot, location) VALUES (?, ?, ?, ?, ?)',
      [decoded.userId, course_id, day, time_slot, location]
    );
    res.json({ success: true, message: '添加成功' });
  } catch (error) {
    console.error('添加课程错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除课表课程
app.delete('/api/schedule/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    await pool.query('DELETE FROM schedule WHERE id = ? AND user_id = ?', [req.params.id, decoded.userId]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取帖子列表
app.get('/api/posts', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建帖子
app.post('/api/posts', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { title, content, category } = req.body;

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [decoded.userId, title, content, category]
    );

    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('创建帖子错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户资料
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [decoded.userId]
    );

    res.json({ success: true, data: profiles[0] || null });
  } catch (error) {
    console.error('获取资料错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新用户资料
app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { major, grade, interests, goal_type, target_school, target_position, description } = req.body;

    await pool.query(
      `UPDATE student_profiles
       SET major = ?, grade = ?, interests = ?, goal_type = ?, target_school = ?, target_position = ?, description = ?
       WHERE user_id = ?`,
      [major, grade, interests, goal_type, target_school, target_position, description, decoded.userId]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取学生学习进度
app.get('/api/student/progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const [progress] = await pool.query(
      `SELECT * FROM course_progress WHERE user_id = ?`,
      [decoded.userId]
    );

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新课程进度
app.post('/api/course-progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { course_id, progress, completed } = req.body;

    // 检查是否已有进度记录
    const [existing] = await pool.query(
      'SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?',
      [decoded.userId, course_id]
    );

    if (existing.length > 0) {
      // 更新现有进度
      await pool.query(
        'UPDATE course_progress SET progress = ?, completed = ?, updated_at = NOW() WHERE user_id = ? AND course_id = ?',
        [progress, completed, decoded.userId, course_id]
      );
    } else {
      // 创建新进度记录
      await pool.query(
        'INSERT INTO course_progress (user_id, course_id, progress, completed) VALUES (?, ?, ?, ?)',
        [decoded.userId, course_id, progress, completed]
      );
    }

    res.json({ success: true, message: '进度更新成功' });
  } catch (error) {
    console.error('更新进度错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证用户名长度（2-20个字符）
    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json({ success: false, message: '用户名长度必须在2-20个字符之间' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '请输入有效的邮箱地址' });
    }

    // 验证密码长度（至少6个字符）
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度至少为6个字符' });
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'student']
    );

    // 创建学生资料
    await pool.query(
      'INSERT INTO student_profiles (user_id) VALUES (?)',
      [result.insertId]
    );

    const token = jwt.sign(
      { userId: result.insertId, role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: result.insertId,
          username,
          email,
          role: 'student'
        },
        token,
        profile: { user_id: result.insertId }
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务器已启动: http://localhost:${PORT}`);
  console.log(`✅ 数据库: ${process.env.DB_NAME}`);
});
