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
  return { success: true, message: '注册成功' };
};

// 模拟请求对象
const mockRequest = {
  async post(url: string, data?: any) {
    await delay(500);

    try {
      let result;

      switch (url) {
        case '/auth/login':
          result = mockLogin(data.username, data.password);
          break;
        case '/auth/register':
          result = mockRegister(data);
          break;
        case '/recommendations/generate':
          result = {
            success: true,
            data: {
              courses: mockCourses.slice(0, 3),
              clubs: mockClubs.slice(0, 2),
              activities: mockActivities.slice(0, 2)
            }
          };
          break;
        case '/schedule':
          // 添加课程到课表
          const newCourse = {
            id: Date.now(),
            course_id: data.course_id,
            semester: data.semester,
            day: data.day,
            time_slot: data.time_slot,
            location: data.location,
            ...mockCourses.find(c => c.id === data.course_id)
          };
          mySchedule.push(newCourse);
          result = { success: true, message: '课程添加成功' };
          break;
        case '/activities/join':
          // 加入活动
          if (!myActivities.find(a => a.id === data.activity_id)) {
            const activity = mockActivities.find(a => a.id === data.activity_id);
            if (activity) {
              myActivities.push(activity);
              result = { success: true, message: '加入活动成功' };
            } else {
              result = { success: false, message: '活动不存在' };
            }
          } else {
            result = { success: false, message: '已加入该活动' };
          }
          break;
        case '/clubs/join':
          // 加入社团
          if (!myClubs.find(c => c.id === data.club_id)) {
            const club = mockClubs.find(c => c.id === data.club_id);
            if (club) {
              myClubs.push(club);
              result = { success: true, message: '加入社团成功' };
            } else {
              result = { success: false, message: '社团不存在' };
            }
          } else {
            result = { success: false, message: '已加入该社团' };
          }
          break;
        default:
          result = { success: false, message: '接口不存在' };
      }

      if (!result.success) {
        ElMessage.error(result.message);
      } else if (result.message) {
        ElMessage.success(result.message);
      }

      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  },

  async get(url: string) {
    await delay(300);

    try {
      let result;

      // 处理带查询参数的 URL
      const cleanUrl = url.split('?')[0];

      switch (cleanUrl) {
        case '/courses':
          result = { success: true, data: mockCourses };
          break;
        case '/clubs':
          result = { success: true, data: mockClubs };
          break;
        case '/activities':
          result = { success: true, data: mockActivities };
          break;
        case '/posts':
          result = { success: true, data: mockPosts };
          break;
        case '/student/info':
          const userId = 2;
          const user = mockUsers.find(u => u.id === userId);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            result = { success: true, data: userWithoutPassword };
          } else {
            result = { success: false, message: '用户不存在' };
          }
          break;
        case '/dashboard':
          result = {
            success: true,
            data: {
              courses: mySchedule.length,
              activities: myActivities.length,
              clubs: myClubs.length,
              progress: Math.round((myProgress.filter(p => p.completed).length / myProgress.length) * 100)
            }
          };
          break;
        case '/auth/me':
          const currentUser = mockUsers[1]; // student1
          const { password, ...currentUserWithoutPassword } = currentUser;
          result = {
            success: true,
            data: {
              user: currentUserWithoutPassword,
              profile: {
                user_id: currentUser.id,
                major: currentUser.major,
                grade: '2021级',
                interests: '编程, 音乐',
                goal_type: 'job',
                target_position: '前端开发工程师'
              }
            }
          };
          break;
        case '/schedule':
          result = { success: true, data: mySchedule };
          break;
        case '/activities/my':
          result = { success: true, data: myActivities };
          break;
        case '/clubs/my':
          result = { success: true, data: myClubs };
          break;
        case '/student/progress':
          result = { success: true, data: myProgress };
          break;
        case '/recommendations/generate':
          result = {
            success: true,
            data: {
              courses: mockCourses.slice(0, 3),
              clubs: mockClubs.slice(0, 2),
              activities: mockActivities.slice(0, 2)
            }
          };
          break;
        default:
          result = { success: false, message: '接口不存在' };
      }

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

      // 处理删除请求
      if (url.startsWith('/schedule/')) {
        const id = parseInt(url.split('/').pop() || '0');
        mySchedule = mySchedule.filter(c => c.id !== id);
        result = { success: true, message: '课程删除成功' };
      } else if (url.startsWith('/activities/leave/')) {
        const id = parseInt(url.split('/').pop() || '0');
        myActivities = myActivities.filter(a => a.id !== id);
        result = { success: true, message: '退出活动成功' };
      } else if (url.startsWith('/clubs/leave/')) {
        const id = parseInt(url.split('/').pop() || '0');
        myClubs = myClubs.filter(c => c.id !== id);
        result = { success: true, message: '退出社团成功' };
      } else {
        result = { success: false, message: '接口不存在' };
      }

      if (!result.success) {
        ElMessage.error(result.message);
      } else {
        ElMessage.success(result.message);
      }

      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  }
};

export default mockRequest;
