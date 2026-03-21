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
    logger.error('登录错误:', error);
    res.status(500).json(responseUtil.error('服务器错误', 500));
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

// 获取课程详情
app.get('/api/courses/:id', async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [req.params.id]
    );
    
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: '课程不存在' });
    }
    
    res.json({ success: true, data: courses[0] });
  } catch (error) {
    console.error('获取课程详情错误:', error);
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

// 参加社团
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
      'SELECT id FROM club_members WHERE club_id = ? AND user_id = ?',
      [clubId, decoded.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '已加入该社团' });
    }

    await pool.query(
      'INSERT INTO club_members (club_id, user_id) VALUES (?, ?)',
      [clubId, decoded.userId]
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
      'DELETE FROM club_members WHERE club_id = ? AND user_id = ?',
      [clubId, decoded.userId]
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
    const { search, category } = req.query;
    let query = 'SELECT * FROM activities';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR description LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE category = ?';
      params.push(category);
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

    await pool.query(
      'INSERT INTO activity_participants (activity_id, user_id) VALUES (?, ?)',
      [activityId, decoded.userId]
    );

    res.json({ success: true, message: '报名成功' });
  } catch (error) {
    console.error('报名活动错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取课表
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
      [decoded.userId, course_id, day, time_slot, location || '']
    );

    res.json({ success: true, message: '添加成功' });
  } catch (error) {
    console.error('添加课程错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除课表
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

// 生成推荐
app.get('/api/recommendations/generate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

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

    const [clubs] = await pool.query(
      `SELECT * FROM clubs WHERE category LIKE ? LIMIT 5`,
      [`%${profile.interests || '学术'}%`]
    );
    recommendations.clubs = clubs;

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

// 获取社区帖子
app.get('/api/posts', async (req, res) => {
  try {
    const [posts] = await pool.query(
      'SELECT p.*, u.username, u.avatar FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 20'
    );
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('获取帖子错误:', error);
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
    const { title, content } = req.body;

    await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [decoded.userId, title, content]
    );

    res.json({ success: true, message: '发布成功' });
  } catch (error) {
    console.error('发布帖子错误:', error);
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

// 更新个人资料
app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { interests, goal_type, bio } = req.body;

    await pool.query(
      'UPDATE student_profiles SET interests = ?, goal_type = ?, bio = ? WHERE user_id = ?',
      [interests, goal_type, bio, decoded.userId]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [leaders] = await pool.query(
      'SELECT u.username, u.avatar, COUNT(p.id) as post_count FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id ORDER BY post_count DESC LIMIT 10'
    );
    res.json({ success: true, data: leaders });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// Vercel Serverless Function export
module.exports = (req, res) => {
  app(req, res);
};

// 本地开发
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ 后端服务器已启动: http://localhost:${PORT}`);
    console.log(`✅ 数据库: ${process.env.DB_NAME}`);
  });
}
