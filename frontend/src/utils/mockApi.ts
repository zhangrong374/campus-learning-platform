import { ElMessage } from 'element-plus';
import { mockUsers, mockCourses, mockClubs, mockActivities, mockPosts } from './mockData';

// 模拟请求延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据存储（可修改）
let mySchedule: any[] = [];
let myActivities: any[] = [];
let myClubs: any[] = [];
let myProgress: any[] = [
  { id: 1, task: '完成高等数学作业', completed: true },
  { id: 2, task: '复习数据结构', completed: true },
  { id: 3, task: '准备编程马拉松', completed: false },
  { id: 4, task: '学习计算机网络', completed: false }
];

// 社区帖子存储
let communityPosts: any[] = [
  {
    id: 1,
    title: '如何学好数据结构？',
    content: '分享一下学习心得，数据结构是计算机科学的基础，掌握好链表、树、图等数据结构对编程能力提升很大。',
    username: '张三',
    avatar: '',
    category: '学习',
    views: 156,
    likes: 15,
    comment_count: 5,
    created_at: '2024-03-20 10:30:00'
  },
  {
    id: 2,
    title: '寻找项目队友',
    content: '想做一个校园APP，找志同道合的朋友一起参与，有兴趣的可以联系我！',
    username: '李四',
    avatar: '',
    category: '就业',
    views: 89,
    likes: 8,
    comment_count: 3,
    created_at: '2024-03-21 14:20:00'
  }
];

// 帖子评论存储
let postComments: any[] = [
  { id: 1, post_id: 1, username: '王五', content: '数据结构确实很重要，推荐看《算法导论》', created_at: '2024-03-20 11:00:00' },
  { id: 2, post_id: 1, username: '赵六', content: '刷题是关键，LeetCode每天坚持做几道', created_at: '2024-03-20 12:30:00' }
];

// 用户资料存储
let userProfile: any = {
  user_id: 2,
  major: '计算机科学',
  grade: '2021级',
  interests: '编程, 音乐',
  goal_type: 'job',
  target_school: '',
  target_position: '前端开发工程师',
  description: '热爱编程，喜欢学习新技术'
};

// 排行榜数据
const leaderboardData = [
  { id: 1, username: '张三', avatar: '', total_score: 980 },
  { id: 2, username: '李四', avatar: '', total_score: 875 },
  { id: 3, username: '王五', avatar: '', total_score: 760 },
  { id: 4, username: '赵六', avatar: '', total_score: 650 },
  { id: 5, username: '钱七', avatar: '', total_score: 540 }
];

// 模拟登录
const mockLogin = (username: string, password: string) => {
  const user = mockUsers.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      data: {
        token: 'mock-token-' + Date.now(),
        user: userWithoutPassword
      }
    };
  }
  return { success: false, message: '用户名或密码错误' };
};

// 模拟注册
const mockRegister = (userData: any) => {
  const exists = mockUsers.find(u => u.username === userData.username);
  if (exists) {
    return { success: false, message: '用户名已存在' };
  }
  const newUser = {
    id: mockUsers.length + 1,
    username: userData.username,
    password: userData.password,
    email: userData.email,
    role: 'student',
    name: userData.username
  };
  mockUsers.push(newUser);
  return { success: true, message: '注册成功' };
};

// 模拟请求对象
const mockRequest = {
  async post(url: string, data?: any) {
    await delay(500);

    try {
      let result;

      // 登录
      if (url === '/auth/login') {
        result = mockLogin(data.username, data.password);
        if (result.success) {
          ElMessage.success('登录成功');
        }
        return { data: result };
      }

      // 注册
      if (url === '/auth/register') {
        result = mockRegister(data);
        if (result.success) {
          ElMessage.success('注册成功，请登录');
        }
        return { data: result };
      }

      // 推荐生成
      if (url === '/recommendations/generate') {
        result = {
          success: true,
          data: {
            courses: mockCourses.slice(0, 3),
            clubs: mockClubs.slice(0, 2),
            activities: mockActivities.slice(0, 2)
          }
        };
        return { data: result };
      }

      // 添加课程到课表
      if (url === '/schedule') {
        const course = mockCourses.find(c => c.id === data.course_id);
        if (course) {
          const newCourse = {
            id: Date.now(),
            course_id: data.course_id,
            semester: data.semester,
            day: data.day,
            time_slot: data.time_slot,
            location: data.location,
            ...course
          };
          mySchedule.push(newCourse);
          result = { success: true, message: '课程添加成功' };
        } else {
          result = { success: false, message: '课程不存在' };
        }
        if (result.success) ElMessage.success(result.message);
        return { data: result };
      }

      // 加入活动
      if (url.match(/\/activities\/\d+\/join/)) {
        const activityId = parseInt(url.split('/')[2]);
        if (!myActivities.find(a => a.id === activityId)) {
          const activity = mockActivities.find(a => a.id === activityId);
          if (activity) {
            myActivities.push({ ...activity, current_participants: (activity.current_participants || 0) + 1 });
            result = { success: true, message: '报名成功' };
          } else {
            result = { success: false, message: '活动不存在' };
          }
        } else {
          result = { success: false, message: '已报名该活动' };
        }
        if (result.success) ElMessage.success(result.message);
        return { data: result };
      }

      // 加入社团
      if (url.match(/\/clubs\/\d+\/join/)) {
        const clubId = parseInt(url.split('/')[2]);
        if (!myClubs.find(c => c.id === clubId)) {
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            myClubs.push({ ...club, member_count: (club.member_count || club.members || 0) + 1 });
            result = { success: true, message: '加入社团成功' };
          } else {
            result = { success: false, message: '社团不存在' };
          }
        } else {
          result = { success: false, message: '已加入该社团' };
        }
        if (result.success) ElMessage.success(result.message);
        return { data: result };
      }

      // 发布帖子
      if (url === '/posts') {
        const newPost = {
          id: Date.now(),
          title: data.title,
          content: data.content,
          username: 'student1',
          avatar: '',
          category: data.category,
          views: 0,
          likes: 0,
          comment_count: 0,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        communityPosts.unshift(newPost);
        result = { success: true, message: '发布成功', data: newPost };
        ElMessage.success('发布成功');
        return { data: result };
      }

      // 添加评论
      if (url.match(/\/posts\/\d+\/comments/)) {
        const postId = parseInt(url.split('/')[2]);
        const newComment = {
          id: Date.now(),
          post_id: postId,
          username: 'student1',
          content: data.content,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        postComments.push(newComment);
        const post = communityPosts.find(p => p.id === postId);
        if (post) post.comment_count++;
        result = { success: true, message: '评论成功', data: newComment };
        ElMessage.success('评论成功');
        return { data: result };
      }

      // 更新个人资料
      if (url === '/student/profile') {
        userProfile = { ...userProfile, ...data };
        result = { success: true, message: '保存成功', data: userProfile };
        ElMessage.success('保存成功');
        return { data: result };
      }

      result = { success: false, message: '接口不存在' };
      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  },

  async get(url: string, config?: any) {
    await delay(300);

    try {
      let result;
      const cleanUrl = url.split('?')[0];
      const params = config?.params || {};

      // 课程列表（支持搜索和分类）
      if (cleanUrl === '/courses') {
        let courses = [...mockCourses];
        if (params.search) {
          const search = params.search.toLowerCase();
          courses = courses.filter(c =>
            c.course_name.toLowerCase().includes(search) ||
            c.course_code.toLowerCase().includes(search)
          );
        }
        if (params.category) {
          courses = courses.filter(c => c.category === params.category);
        }
        result = { success: true, data: courses };
        return { data: result };
      }

      // 社团列表（支持搜索和分类）
      if (cleanUrl === '/clubs') {
        let clubs = mockClubs.map(c => ({
          ...c,
          member_count: c.members || c.member_count || 0
        }));
        if (params.search) {
          const search = params.search.toLowerCase();
          clubs = clubs.filter(c => c.name.toLowerCase().includes(search));
        }
        if (params.category) {
          clubs = clubs.filter(c => c.category === params.category);
        }
        result = { success: true, data: clubs };
        return { data: result };
      }

      // 活动列表（支持搜索和类型）
      if (cleanUrl === '/activities') {
        let activities = mockActivities.map(a => ({
          ...a,
          start_time: a.date || a.start_time,
          current_participants: a.current_participants || Math.floor(Math.random() * 20) + 5,
          max_participants: a.max_participants || 50
        }));
        if (params.search) {
          const search = params.search.toLowerCase();
          activities = activities.filter(a => a.title.toLowerCase().includes(search));
        }
        if (params.type) {
          activities = activities.filter(a => a.type === params.type);
        }
        result = { success: true, data: activities };
        return { data: result };
      }

      // 帖子列表（支持分类）
      if (cleanUrl === '/posts') {
        let posts = [...communityPosts];
        if (params.category) {
          posts = posts.filter(p => p.category === params.category);
        }
        result = { success: true, data: posts };
        return { data: result };
      }

      // 帖子详情
      if (cleanUrl.match(/\/posts\/\d+$/)) {
        const postId = parseInt(cleanUrl.split('/')[2]);
        const post = communityPosts.find(p => p.id === postId);
        if (post) {
          post.views++;
          const comments = postComments.filter(c => c.post_id === postId);
          result = { success: true, data: { ...post, comments } };
        } else {
          result = { success: false, message: '帖子不存在' };
        }
        return { data: result };
      }

      // 排行榜
      if (cleanUrl === '/leaderboard') {
        result = { success: true, data: leaderboardData.slice(0, params.limit || 10) };
        return { data: result };
      }

      // 用户信息
      if (cleanUrl === '/student/info') {
        const user = mockUsers.find(u => u.id === 2);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          result = { success: true, data: { ...userWithoutPassword, ...userProfile } };
        } else {
          result = { success: false, message: '用户不存在' };
        }
        return { data: result };
      }

      // 仪表盘数据
      if (cleanUrl === '/dashboard') {
        result = {
          success: true,
          data: {
            courses: mySchedule.length,
            activities: myActivities.length,
            clubs: myClubs.length,
            progress: Math.round((myProgress.filter(p => p.completed).length / myProgress.length) * 100)
          }
        };
        return { data: result };
      }

      // 当前用户
      if (cleanUrl === '/auth/me') {
        const currentUser = mockUsers[1];
        const { password, ...currentUserWithoutPassword } = currentUser;
        result = {
          success: true,
          data: {
            user: currentUserWithoutPassword,
            profile: userProfile
          }
        };
        return { data: result };
      }

      // 课表
      if (cleanUrl === '/schedule') {
        result = { success: true, data: mySchedule };
        return { data: result };
      }

      // 我的活动
      if (cleanUrl === '/activities/my') {
        result = { success: true, data: myActivities };
        return { data: result };
      }

      // 我的社团
      if (cleanUrl === '/clubs/my') {
        result = { success: true, data: myClubs };
        return { data: result };
      }

      // 学习进度
      if (cleanUrl === '/student/progress') {
        result = { success: true, data: myProgress };
        return { data: result };
      }

      // 个人资料
      if (cleanUrl === '/student/profile') {
        result = { success: true, data: userProfile };
        return { data: result };
      }

      // 推荐
      if (cleanUrl === '/recommendations/generate') {
        result = {
          success: true,
          data: {
            courses: mockCourses.slice(0, 3),
            clubs: mockClubs.slice(0, 2),
            activities: mockActivities.slice(0, 2)
          }
        };
        return { data: result };
      }

      result = { success: false, message: '接口不存在' };
      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  },

  async delete(url: string) {
    await delay(500);

    try {
      let result;

      // 删除课程
      if (url.match(/\/schedule\/\d+$/)) {
        const id = parseInt(url.split('/')[2]);
        mySchedule = mySchedule.filter(c => c.id !== id);
        result = { success: true, message: '课程删除成功' };
        ElMessage.success(result.message);
        return { data: result };
      }

      // 退出活动
      if (url.match(/\/activities\/\d+\/leave/)) {
        const id = parseInt(url.split('/')[2]);
        myActivities = myActivities.filter(a => a.id !== id);
        result = { success: true, message: '退出活动成功' };
        ElMessage.success(result.message);
        return { data: result };
      }

      // 退出社团
      if (url.match(/\/clubs\/\d+\/leave/)) {
        const id = parseInt(url.split('/')[2]);
        myClubs = myClubs.filter(c => c.id !== id);
        result = { success: true, message: '退出社团成功' };
        ElMessage.success(result.message);
        return { data: result };
      }

      result = { success: false, message: '接口不存在' };
      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  },

  async put(url: string, data?: any) {
    await delay(500);

    try {
      let result;

      // 更新个人资料
      if (url === '/profile') {
        userProfile = { ...userProfile, ...data };
        result = { success: true, message: '个人资料更新成功', data: userProfile };
        ElMessage.success('个人资料更新成功');
        return { data: result };
      }

      result = { success: false, message: '接口不存在' };
      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  }
};

export default mockRequest;
