import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: '/courses',
        name: 'Courses',
        component: () => import('@/views/Courses.vue'),
        meta: { title: '课程学习', requiresAuth: true }
      },
      {
        path: '/courses/:id',
        name: 'CourseDetail',
        component: () => import('@/views/CourseDetail.vue'),
        meta: { title: '课程详情', requiresAuth: true }
      },
      {
        path: '/schedule',
        name: 'Schedule',
        component: () => import('@/views/Schedule.vue'),
        meta: { title: '我的课表', requiresAuth: true }
      },
      {
        path: '/activities',
        name: 'Activities',
        component: () => import('@/views/Activities.vue'),
        meta: { title: '活动中心', requiresAuth: true }
      },
      {
        path: '/clubs',
        name: 'Clubs',
        component: () => import('@/views/Clubs.vue'),
        meta: { title: '社团中心', requiresAuth: true }
      },
      {
        path: '/community',
        name: 'Community',
        component: () => import('@/views/Community.vue'),
        meta: { title: '社区交流', requiresAuth: true }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '校园平台'} - 校园平台`

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
