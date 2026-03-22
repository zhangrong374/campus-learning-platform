import { ElMessage } from 'element-plus';
import { mockUsers, mockCourses, mockClubs, mockActivities, mockPosts } from './mockData';

// 模拟请求延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        default:
          result = { success: false, message: '接口不存在' };
      }

      if (!result.success) {
        ElMessage.error(result.message);
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

      switch (url) {
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
        default:
          result = { success: false, message: '接口不存在' };
      }

      return { data: result };
    } catch (error) {
      ElMessage.error('请求失败');
      throw error;
    }
  }
};

export default mockRequest;
