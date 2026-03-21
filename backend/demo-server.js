const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// 模拟数据
const mockCourses = [
  { id: 1, course_code: 'CS101', course_name: '计算机科学导论', instructor: '张教授', credits: 3.0, category: '计算机', description: '计算机科学基础课程' },
  { id: 2, course_code: 'CS201', course_name: '数据结构与算法', instructor: '李教授', credits: 4.0, category: '计算机', description: '学习基本数据结构和算法设计' },
  { id: 3, course_code: 'CS301', course_name: '操作系统', instructor: '王教授', credits: 4.0, category: '计算机', description: '操作系统原理与实践' },
  { id: 4, course_code: 'MATH101', course_name: '高等数学', instructor: '赵教授', credits: 5.0, category: '数学', description: '微积分基础' },
  { id: 5, course_code: 'ENG101', course_name: '大学英语', instructor: '刘教授', credits: 3.0, category: '外语', description: '英语听说读写综合能力训练' }
];

const mockClubs = [
  { id: 1, name: '编程协会', category: '科技类', member_count: 120, description: '热爱编程的同学聚集地' },
  { id: 2, name: '篮球社', category: '体育类', member_count: 85, description: '篮球爱好者的家园' },
  { id: 3, name: '摄影协会', category: '文艺类', member_count: 60, description: '用镜头记录美好瞬间' },
  { id: 4, name: '志愿者协会', category: '志愿类', member_count: 150, description: '奉献爱心，服务社会' },
  { id: 5, name: '辩论社', category: '学术类', member_count: 45, description: '锻炼口才，提升思辨能力' }
];

const mockActivities = [
  { id: 1, title: '编程大赛', description: '年度编程竞赛，丰厚奖品等你来拿', type: '竞赛活动', organizer: '计算机学院', location: '图书馆报告厅', start_time: '2024-04-15 14:00', end_time: '2024-04-15 18:00', max_participants: 100, current_participants: 78 },
  { id: 2, title: '考研经验分享会', description: '成功上岸学长学姐经验分享', type: '学术讲座', organizer: '学习部', location: '教学楼A101', start_time: '2024-04-20 19:00', end_time: '2024-04-20 21:00', max_participants: 200, current_participants: 156 },
  { id: 3, title: '春季运动会', description: '全校春季运动会，展现青春风采', type: '文体活动', organizer: '体育部', location: '体育场', start_time: '2024-04-25 08:00', end_time: '2024-04-25 17:00', max_participants: 500, current_participants: 320 }
];

const mockPosts = [
  { id: 1, username: 'student1', avatar: '', category: '考研', title: '考研数学复习经验分享', content: '分享一下我的数学复习经验...', created_at: new Date().toISOString(), views: 156, likes: 23, comment_count: 8 },
  { id: 2, username: 'student2', avatar: '', category: '就业', title: '前端面试经验总结', content: '记录一下我的前端面试经历...', created_at: new Date(Date.now() - 86400000).toISOString(), views: 89, likes: 15, comment_count: 5 },
  { id: 3, username: 'student3', avatar: '', category: '学习', title: 'Vue3学习笔记', content: 'Vue3 Composition API学习心得...', created_at: new Date(Date.now() - 172800000).toISOString(), views: 234, likes: 45, comment_count: 12 }
];

// 健康检查
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// 认证接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const token = jwt.sign({ id: 1, username, role: 'student' }, 'demo-secret-key', { expiresIn: '7d' });
  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: { id: 1, username, email: username + '@demo.com', role: 'student', avatar: '' },
      token
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  const token = jwt.sign({ id: Date.now(), username, role: 'student' }, 'demo-secret-key', { expiresIn: '7d' });
  res.json({
    success: true,
    message: '注册成功',
    data: {
      user: { id: Date.now(), username, email, role: 'student', avatar: '' },
      token
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: { id: 1, username: 'demo', email: 'demo@test.com', role: 'student', avatar: '' },
      profile: { major: '计算机', grade: '2021级', interests: '编程,算法', goal_type: 'exam' }
    }
  });
});

// 课程接口
app.get('/api/courses', (req, res) => {
  res.json({ success: true, data: mockCourses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockCourses.find(c => c.id == req.params.id);
  if (course) {
    res.json({ success: true, data: { course, contents: [] } });
  } else {
    res.status(404).json({ success: false, message: '课程不存在' });
  }
});

// 社团接口
app.get('/api/clubs', (req, res) => {
  res.json({ success: true, data: mockClubs });
});

app.get('/api/clubs/my', (req, res) => {
  res.json({ success: true, data: mockClubs.slice(0, 2) });
});

// 活动接口
app.get('/api/activities', (req, res) => {
  res.json({ success: true, data: mockActivities });
});

app.get('/api/activities/my', (req, res) => {
  res.json({ success: true, data: mockActivities.slice(0, 1) });
});

// 社区接口
app.get('/api/posts', (req, res) => {
  res.json({ success: true, data: mockPosts });
});

// 推荐接口
app.post('/api/recommendations/generate', (req, res) => {
  res.json({
    success: true,
    data: {
      courses: mockCourses.slice(0, 3),
      clubs: mockClubs.slice(0, 3),
      activities: mockActivities.slice(0, 2)
    }
  });
});

app.get('/api/recommendations', (req, res) => {
  res.json({ success: true, data: [] });
});

// 学生接口
app.get('/api/student/schedule', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/student/progress', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/student/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, username: '学霸一号', avatar: '', total_score: 980, quiz_count: 25 },
      { id: 2, username: '学霸二号', avatar: '', total_score: 945, quiz_count: 22 },
      { id: 3, username: '学霸三号', avatar: '', total_score: 920, quiz_count: 20 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 演示服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API地址: http://localhost:${PORT}/api`);
  console.log(`💡 这是演示模式，使用模拟数据`);
});
