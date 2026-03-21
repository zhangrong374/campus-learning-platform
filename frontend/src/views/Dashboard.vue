<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 欢迎卡片 -->
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h2>欢迎，{{ userStore.user?.username }}！</h2>
            <p>今天是学习的美好一天，开始您的学习之旅吧</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24">
        <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <el-button type="primary" @click="fetchDashboardData" :loading="loading">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </el-col>

      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409eff">
              <Reading />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.courses }}</div>
              <div class="stat-label">课程数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67c23a">
              <Trophy />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activities }}</div>
              <div class="stat-label">活动数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#e6a23c">
              <User />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.clubs }}</div>
              <div class="stat-label">社团数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#f56c6c">
              <TrendCharts />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.progress }}%</div>
              <div class="stat-label">学习进度</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 推荐课程 -->
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>推荐课程</span>
              <el-button text type="primary" @click="router.push('/courses')">
                查看更多
              </el-button>
            </div>
          </template>
          <el-skeleton v-if="loading" :rows="3" animated />
          <div v-else>
            <div
              v-for="course in recommendations.courses"
              :key="course.id"
              class="course-item"
            >
              <div class="course-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="course-info">
                <div class="course-name">{{ course.course_name }}</div>
                <div class="course-meta">
                  <span>{{ course.instructor }}</span>
                  <span>{{ course.credits }}学分</span>
                </div>
              </div>
              <el-button type="primary" text @click="viewCourse(course.id)">
                查看
              </el-button>
            </div>
            <el-empty v-if="!recommendations.courses.length" description="暂无推荐" />
          </div>
        </el-card>
      </el-col>

      <!-- 推荐社团 -->
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>推荐社团</span>
              <el-button text type="primary" @click="router.push('/clubs')">
                查看更多
              </el-button>
            </div>
          </template>
          <el-skeleton v-if="loading" :rows="3" animated />
          <div v-else>
            <div
              v-for="club in recommendations.clubs"
              :key="club.id"
              class="club-item"
            >
              <div class="club-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="club-info">
                <div class="club-name">{{ club.name }}</div>
                <div class="club-meta">
                  <span>{{ club.category }}</span>
                  <span>{{ club.member_count }}成员</span>
                </div>
              </div>
              <el-button type="primary" text @click="viewClub(club.id)">
                查看
              </el-button>
            </div>
            <el-empty v-if="!recommendations.clubs.length" description="暂无推荐" />
          </div>
        </el-card>
      </el-col>

      <!-- 推荐活动 -->
      <el-col :span="24">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>推荐活动</span>
              <el-button text type="primary" @click="router.push('/activities')">
                查看更多
              </el-button>
            </div>
          </template>
          <el-skeleton v-if="loading" :rows="3" animated />
          <div v-else>
            <el-row :gutter="20">
              <el-col
                v-for="activity in recommendations.activities"
                :key="activity.id"
                :span="6"
              >
                <el-card class="activity-card" shadow="hover">
                  <div class="activity-type">{{ activity.type }}</div>
                  <h4>{{ activity.title }}</h4>
                  <p class="activity-desc">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ formatDate(activity.start_time) }}</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty v-if="!recommendations.activities.length" description="暂无推荐" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
// 导入JavaScript工具函数
import { formatDate as formatDateHelper } from '@/utils/helpers.js'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const stats = ref({
  courses: 0,
  activities: 0,
  clubs: 0,
  progress: 0
})

const recommendations = ref({
  courses: [] as any[],
  clubs: [] as any[],
  activities: [] as any[]
})

const fetchDashboardData = async () => {
  try {
    // 获取推荐
    const recommendRes = await request.get('/recommendations/generate')
    recommendations.value = recommendRes.data.data

    // 获取用户实际数据统计
    const [scheduleRes, activitiesRes, clubsRes, progressRes] = await Promise.all([
      request.get('/schedule'),
      request.get('/activities/my'),
      request.get('/clubs/my'),
      request.get('/student/progress')
    ])

    const schedule = scheduleRes.data.data || []
    const myActivities = activitiesRes.data.data || []
    const myClubs = clubsRes.data.data || []
    const progress = progressRes.data.data || []

    stats.value = {
      courses: schedule.length, // 课表中实际添加的课程数
      activities: myActivities.length, // 实际参加的活动数
      clubs: myClubs.length, // 实际加入的社团数
      progress: progress.length > 0 ? Math.round(progress.filter((p: any) => p.completed).length / progress.length * 100) : 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const viewCourse = (id: number) => {
  router.push(`/courses/${id}`)
}

const viewClub = (id: number) => {
  router.push('/clubs')
}

const formatDate = (date: string) => {
  // 使用JavaScript工具函数格式化日期
  return formatDateHelper(date, 'YYYY年MM月DD日')
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 20px;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-content {
  color: white;
  text-align: center;
}

.welcome-content h2 {
  margin: 10px 0;
  font-size: 28px;
}

.welcome-content p {
  margin: 0;
  opacity: 0.9;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-item,
.club-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.course-item:last-child,
.club-item:last-child {
  border-bottom: none;
}

.course-icon,
.club-icon {
  width: 40px;
  height: 40px;
  background-color: #ecf5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  margin-right: 12px;
}

.club-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.course-info,
.club-info {
  flex: 1;
}

.course-name,
.club-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.course-meta,
.club-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
}

.activity-card {
  margin-bottom: 0;
}

.activity-type {
  display: inline-block;
  padding: 2px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.activity-card h4 {
  margin: 10px 0;
  font-size: 16px;
  color: #303133;
}

.activity-desc {
  color: #606266;
  font-size: 14px;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
