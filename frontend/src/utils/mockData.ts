// 模拟数据
export const mockUsers = [
  { id: 1, username: 'admin', password: '123456', role: 'admin', name: '管理员', email: 'admin@example.com' },
  { id: 2, username: 'student1', password: '123456', role: 'student', name: '张三', studentId: '2021001', major: '计算机科学', email: 'student1@example.com' },
  { id: 3, username: 'student2', password: '123456', role: 'student', name: '李四', studentId: '2021002', major: '软件工程', email: 'student2@example.com' }
];

export const mockCourses = [
  {
    id: 1,
    course_name: '高等数学',
    course_code: 'MATH101',
    category: '数学',
    credits: 4,
    teacher: '王教授',
    description: '微积分、线性代数等数学基础'
  },
  {
    id: 2,
    course_name: '程序设计基础',
    course_code: 'CS101',
    category: '计算机',
    credits: 3,
    teacher: '李教授',
    description: 'C语言程序设计入门'
  },
  {
    id: 3,
    course_name: '数据结构',
    course_code: 'CS102',
    category: '计算机',
    credits: 4,
    teacher: '张教授',
    description: '链表、树、图等数据结构'
  },
  {
    id: 4,
    course_name: '计算机网络',
    course_code: 'CS201',
    category: '计算机',
    credits: 3,
    teacher: '刘教授',
    description: '网络协议、TCP/IP等'
  }
];

export const mockClubs = [
  { id: 1, name: '编程社团', description: '学习编程技术，参与项目开发', category: '技术', members: 50 },
  { id: 2, name: '音乐社团', description: '音乐爱好者聚集地', category: '文艺', members: 30 },
  { id: 3, name: '篮球社团', description: '篮球运动爱好者', category: '体育', members: 40 }
];

export const mockActivities = [
  { id: 1, title: '编程马拉松', description: '24小时编程挑战', date: '2024-04-15', location: '图书馆', type: '竞赛' },
  { id: 2, title: '春季音乐会', description: '校园音乐表演', date: '2024-04-20', location: '大礼堂', type: '文艺' }
];

export const mockPosts = [
  {
    id: 1,
    title: '如何学好数据结构？',
    content: '分享一下学习心得...',
    author: '张三',
    date: '2024-03-20',
    likes: 15,
    category: '学习讨论'
  },
  {
    id: 2,
    title: '寻找项目队友',
    content: '想做一个校园APP，找志同道合的朋友...',
    author: '李四',
    date: '2024-03-21',
    likes: 8,
    category: '就业分享'
  }
];

// 仪表盘数据
export const mockDashboardData = {
  courses: 4,
  activities: 2,
  clubs: 3,
  progress: 65
};
