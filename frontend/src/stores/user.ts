import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export interface User {
  id: number
  username: string
  email: string
  role: string
  avatar?: string
}

export interface StudentProfile {
  id?: number
  user_id: number
  major?: string
  grade?: string
  interests?: string
  goal_type?: 'exam' | 'job' | 'both'
  target_school?: string
  target_position?: string
  description?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const profile = ref<StudentProfile | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  // 设置用户信息
  const setUser = (userData: User, userToken: string) => {
    user.value = userData
    token.value = userToken
    localStorage.setItem('token', userToken)
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    profile.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await request.get('/auth/me')
      if (response.data.success) {
        user.value = response.data.data.user
        profile.value = response.data.data.profile
        return response.data
      }
      throw new Error('获取用户信息失败')
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await request.post('/auth/login', { username, password })
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data
        setUser(userData, userToken)
        return response.data
      }
      throw new Error(response.data.message || '登录失败')
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 注册
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await request.post('/auth/register', {
        username,
        email,
        password
      })
      if (response.data.success) {
        // 注册成功后自动登录
        const loginResponse = await request.post('/auth/login', { username, password })
        if (loginResponse.data.success) {
          const { user: userData, token: userToken } = loginResponse.data.data
          setUser(userData, userToken)
          return response.data
        }
      }
      throw new Error(response.data.message || '注册失败')
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    clearUser()
  }

  return {
    user,
    profile,
    token,
    isLoggedIn,
    setUser,
    clearUser,
    fetchCurrentUser,
    login,
    register,
    logout
  }
})
