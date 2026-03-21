<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="24" color="#409eff">
            <School />
          </el-icon>
          <span>校园学习规划平台</span>
        </div>

        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="header-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/courses">
            <el-icon><Reading /></el-icon>
            <span>课程</span>
          </el-menu-item>
          <el-menu-item index="/schedule">
            <el-icon><Calendar /></el-icon>
            <span>课表</span>
          </el-menu-item>
          <el-menu-item index="/activities">
            <el-icon><Trophy /></el-icon>
            <span>活动</span>
          </el-menu-item>
          <el-menu-item index="/clubs">
            <el-icon><User /></el-icon>
            <span>社团</span>
          </el-menu-item>
          <el-menu-item index="/community">
            <el-icon><ChatLineSquare /></el-icon>
            <span>社区</span>
          </el-menu-item>
        </el-menu>

        <div class="user-actions">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar || ''">
                {{ userStore.user?.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主内容区域 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = ref(route.path)

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    userStore.logout()
    router.push('/login')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  if (userStore.isLoggedIn && !userStore.user) {
    userStore.fetchCurrentUser()
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin-right: 40px;
}

.header-menu {
  flex: 1;
  border: none;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
