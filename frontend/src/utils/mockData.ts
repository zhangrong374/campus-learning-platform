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
  },
  {
    id: 5, 
    course_name: '大学英语', 
    course_code: 'ENG101', 
    category: '外语',
    credits: 3, 
    teacher: '陈教授', 
    description: '英语听说读写能力培养'
  },
  {
    id: 6, 
    course_name: '大学物理', 
    course_code: 'PHY101', 
    category: '物理',
    credits: 4, 
    teacher: '赵教授', 
    description: '力学、电磁学基础'
  }
];

export const mockClubs = [
  { id: 1, name: '编程社团', description: '学习编程技术，参与项目开发', category: '科技类', members: 50 },
  { id: 2, name: '音乐社团', description: '音乐爱好者聚集地，定期举办音乐会', category: '文艺类', members: 30 },
  { id: 3, name: '篮球社团', description: '篮球运动爱好者，每周组织比赛', category: '体育类', members: 40 },
  { id: 4, name: '数学建模协会', description: '参加数学建模竞赛，提升数学能力', category: '学术类', members: 25 },
  { id: 5, name: '志愿者协会', description: '参与公益活动，服务社会', category: '志愿类', members: 60 }
];

export const mockActivities = [
  { 
    id: 1, 
    title: '编程马拉松', 
    description: '24小时编程挑战，组队开发创新项目', 
    date: '2024-04-15', 
    start_time: '2024-04-15 09:00:00',
    location: '图书馆一楼', 
    type: '竞赛活动',
    current_participants: 15,
    max_participants: 50
  },
  { 
    id: 2, 
    title: '春季音乐会', 
    description: '校园音乐表演，展示才艺', 
    date: '2024-04-20', 
    start_time: '2024-04-20 19:00:00',
    location: '大礼堂', 
    type: '文体活动',
    current_participants: 30,
    max_participants: 200
  },
  { 
    id: 3, 
    title: 'AI技术讲座', 
    description: '邀请业界专家分享人工智能最新进展', 
    date: '2024-04-25', 
    start_time: '2024-04-25 14:00:00',
    location: '教学楼A101', 
    type: '学术讲座',
    current_participants: 45,
    max_participants: 100
  },
  { 
    id: 4, 
    title: '社区志愿服务', 
    description: '走进社区，帮助老人使用智能手机', 
    date: '2024-04-28', 
    start_time: '2024-04-28 08:00:00',
    location: '阳光社区', 
    type: '社会实践',
    current_participants: 20,
    max_participants: 30
  }
];

export const mockPosts = [
  {
    id: 1, 
    title: '如何学好数据结构？', 
    content: '分享一下学习心得，数据结构是计算机科学的基础，掌握好链表、树、图等数据结构对编程能力提升很大。', 
    author: '张三', 
    date: '2024-03-20', 
    likes: 15,
    category: '学习讨论'
  },
  {
    id: 2, 
    title: '寻找项目队友', 
    content: '想做一个校园APP，找志同道合的朋友一起参与，有兴趣的可以联系我！', 
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
