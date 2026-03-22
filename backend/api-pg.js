const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const { responseUtil, logger, stringUtil, dateUtil } = require('./src/utils/helpers.js');

const app = express();
const PORT = process.env.SERVER_PORT || 3006;

const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_learning_platform'
  });
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  logger.info('健康检查请求');
  res.json({ status: 'ok', message: 'Server is running', timestamp: dateUtil.format(new Date()) });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json(responseUtil.error('用户名长度必须在2-20个字符之间', 400));
    }

    if (!password) {
      return res.status(400).json(responseUtil.error('请输入密码', 400));
    }

    logger.info(`用户登录尝试: ${username}`);

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      logger.warn(`登录失败: 用户 ${username} 不存在`);
      return res.status(401).json(responseUtil.error('用户名或密码错误', 401));
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn(`登录失败: 用户 ${username} 密码错误`);
      return res.status(401).json(responseUtil.error('用户名或密码错误', 401));
    }

    const profileResult = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
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
      profile: profileResult.rows[0] || null
    }, '登录成功'));
  } catch (error) {
    logger.error('登录错误:', error);
    res.status(500).json(responseUtil.error('服务器错误', 500));
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await pool.query(
      'SELECT id, username, email, role, avatar FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const profileResult = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [decoded.userId]
    );

    res.json({
      success: true,
      data: {
        user: result.rows[0],
        profile: profileResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ success: false, message: '无效的token' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM courses';
    const params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR course_code ILIKE $2 OR description ILIKE $3';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '课程不存在' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/clubs', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM clubs';
    const params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR description ILIKE $2';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取社团列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/clubs/my', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const result = await pool.query(
      'SELECT c.*, cm.joined_at FROM clubs c JOIN club_members cm ON c.id = cm.club_id WHERE cm.user_id = $1',
      [decoded.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取我的社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/clubs/:clubId/join', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clubId = req.params.clubId;

    const existing = await pool.query(
      'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, decoded.userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: '已加入该社团' });
    }

    await pool.query(
      'INSERT INTO club_members (club_id, user_id) VALUES ($1, $2)',
      [clubId, decoded.userId]
    );

    res.json({ success: true, message: '加入成功' });
  } catch (error) {
    console.error('加入社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.delete('/api/clubs/:clubId/leave', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clubId = req.params.clubId;

    await pool.query(
      'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, decoded.userId]
    );

    res.json({ success: true, message: '退出成功' });
  } catch (error) {
    console.error('退出社团错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM activities';
    const params = [];

    if (search) {
      query += ' WHERE title ILIKE $1 OR description ILIKE $2';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    } else if (category) {
      query += ' WHERE type = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/activities/my', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const result = await pool.query(
      'SELECT a.*, am.joined_at FROM activities a JOIN activity_participants am ON a.id = am.activity_id WHERE am.user_id = $1',
      [decoded.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取我的活动错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/activities/:activityId/join', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const activityId = req.params.activityId;

    await pool.query(
      'INSERT INTO activity_participants (activity_id, user_id) VALUES ($1, $2)',
      [activityId, decoded.userId]
    );

    res.json({ success: true, message: '报名成功' });
  } catch (error) {
    console.error('报名活动错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const result = await pool.query(
      'SELECT s.*, c.name as course_name FROM schedule s LEFT JOIN courses c ON s.course_id = c.id WHERE s.user_id = $1 ORDER BY s.day, s.time_slot',
      [decoded.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取课表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/schedule', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { course_id, day, time_slot, location } = req.body;

    await pool.query(
      'INSERT INTO schedule (user_id, course_id, day, time_slot, location) VALUES ($1, $2, $3, $4, $5)',
      [decoded.userId, course_id, day, time_slot, location || '']
    );

    res.json({ success: true, message: '添加成功' });
  } catch (error) {
    console.error('添加课程错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.delete('/api/schedule/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    await pool.query('DELETE FROM schedule WHERE id = $1 AND user_id = $2', [req.params.id, decoded.userId]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/recommendations/generate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const profileResult = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [decoded.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
    }

    const profile = profileResult.rows[0];
    const recommendations = {
      courses: [],
      clubs: [],
      activities: []
    };

    if (profile.interests) {
      const interests = profile.interests.split(',');
      for (const interest of interests) {
        const result = await pool.query(
          `SELECT * FROM courses WHERE category ILIKE $1 LIMIT 3`,
          [`%${interest}%`]
        );
        recommendations.courses.push(...result.rows);
      }
    }

    const clubsResult = await pool.query(
      `SELECT * FROM clubs WHERE category ILIKE $1 LIMIT 5`,
      [`%${profile.interests || '学术'}%`]
    );
    recommendations.clubs = clubsResult.rows;

    const activitiesResult = await pool.query(
      `SELECT * FROM activities WHERE status = 'published' AND type ILIKE $1 LIMIT 5`,
      [`%${profile.goal_type || '学习'}%`]
    );
    recommendations.activities = activitiesResult.rows;

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('生成推荐错误:', error);
    res.json({ success: true, data: { courses: [], clubs: [], activities: [] } });
  }
});

app.get('/api/student/progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await pool.query(
      `SELECT * FROM course_progress WHERE user_id = $1`,
      [decoded.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.username, u.avatar FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 20'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取帖子错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { title, content } = req.body;

    await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)',
      [decoded.userId, title, content]
    );

    res.json({ success: true, message: '发布成功' });
  } catch (error) {
    console.error('发布帖子错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json({ success: false, message: '用户名长度必须在2-20个字符之间' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '请输入有效的邮箱地址' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度至少为6个字符' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, 'student']
    );

    await pool.query(
      'INSERT INTO student_profiles (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id, role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: result.rows[0].id,
          username,
          email,
          role: 'student'
        },
        token,
        profile: { user_id: result.rows[0].id }
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { interests, goal_type, bio } = req.body;

    await pool.query(
      'UPDATE student_profiles SET interests = $1, goal_type = $2, bio = $3 WHERE user_id = $4',
      [interests, goal_type, bio, decoded.userId]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.username, u.avatar, COUNT(p.id) as post_count FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id, u.username, u.avatar ORDER BY post_count DESC LIMIT 10'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

module.exports = (req, res) => {
  app(req, res);
};

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ 后端服务器已启动 (PostgreSQL): http://localhost:${PORT}`);
  });
}
