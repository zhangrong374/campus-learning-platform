<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 左侧个人信息 -->
      <el-col :span="8">
        <el-card class="user-card">
          <div class="user-header">
            <el-avatar :size="80" :src="userStore.user?.avatar || ''">
              {{ userStore.user?.username?.charAt(0) }}
            </el-avatar>
            <h3>{{ userStore.user?.username }}</h3>
            <el-tag>{{ userStore.user?.role === 'student' ? '学生' : userStore.user?.role === 'admin' ? '管理员' : '学校管理员' }}</el-tag>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.courses }}</div>
              <div class="stat-label">课程</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.activities }}</div>
              <div class="stat-label">活动</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.clubs }}</div>
              <div class="stat-label">社团</div>
            </div>
          </div>
        </el-card>

        <!-- 学习目标 -->
        <el-card class="goal-card" style="margin-top: 20px">
          <template #header>
            <span>学习目标</span>
          </template>
          <el-empty v-if="!userStore.profile" description="请先完善个人资料">
            <el-button type="primary" @click="showEditDialog = true">
              填写资料
            </el-button>
          </el-empty>
          <div v-else>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="目标类型">
                {{ userStore.profile.goal_type === 'exam' ? '考研' : userStore.profile.goal_type === 'job' ? '就业' : '两者兼顾' }}
              </el-descriptions-item>
              <el-descriptions-item label="目标院校" v-if="userStore.profile.goal_type !== 'job'">
                {{ userStore.profile.target_school || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="目标岗位" v-if="userStore.profile.goal_type !== 'exam'">
                {{ userStore.profile.target_position || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>
            <el-button type="primary" style="width: 100%; margin-top: 15px" @click="showEditDialog = true">
              修改目标
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详细信息和表单 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>个人资料</span>
          </template>
          <el-descriptions v-if="userStore.profile" :column="2" border>
            <el-descriptions-item label="学号">{{ userStore.user?.id }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.user?.email }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ userStore.profile.major || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ userStore.profile.grade || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="兴趣" :span="2">
              {{ userStore.profile.interests || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="个人描述" :span="2">
              {{ userStore.profile.description || '未填写' }}
            </el-descriptions-item>
          </el-descriptions>
          <el-empty v-else description="请完善个人资料">
            <el-button type="primary" @click="showEditDialog = true">
              立即填写
            </el-button>
          </el-empty>
        </el-card>

        <!-- 学习统计 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <span>学习统计</span>
          </template>
          <div class="charts-container">
            <div id="progressChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="600px">
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="专业">
          <el-input v-model="profileForm.major" placeholder="例如：计算机科学与技术" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="profileForm.grade" placeholder="例如：2021级" />
        </el-form-item>
        <el-form-item label="兴趣">
          <el-input v-model="profileForm.interests" placeholder="用逗号分隔，例如：编程,算法,AI" />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-radio-group v-model="profileForm.goal_type">
            <el-radio label="exam">考研</el-radio>
            <el-radio label="job">就业</el-radio>
            <el-radio label="both">两者兼顾</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标院校" v-if="profileForm.goal_type !== 'job'">
          <el-input v-model="profileForm.target_school" placeholder="例如：清华大学" />
        </el-form-item>
        <el-form-item label="目标岗位" v-if="profileForm.goal_type !== 'exam'">
          <el-input v-model="profileForm.target_position" placeholder="例如：前端工程师" />
        </el-form-item>
        <el-form-item label="个人描述">
          <el-input
            v-model="profileForm.description"
            type="textarea"
            :rows="4"
            placeholder="介绍一下自己..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const userStore = useUserStore()

const showEditDialog = ref(false)
const stats = ref({
  courses: 0,
  activities: 0,
  clubs: 0
})

const profileForm = reactive({
  major: '',
  grade: '',
  interests: '',
  goal_type: 'exam' as 'exam' | 'job' | 'both',
  target_school: '',
  target_position: '',
  description: ''
})

let progressChart: any = null

const initProfileForm = () => {
  if (userStore.profile) {
    Object.assign(profileForm, {
      major: userStore.profile.major || '',
      grade: userStore.profile.grade || '',
      interests: userStore.profile.interests || '',
      goal_type: userStore.profile.goal_type || 'exam',
      target_school: userStore.profile.target_school || '',
      target_position: userStore.profile.target_position || '',
      description: userStore.profile.description || ''
    })
  }
}

const fetchStats = async () => {
  try {
    const [scheduleRes, activitiesRes, clubsRes] = await Promise.all([
      request.get('/schedule'),
      request.get('/activities/my'),
      request.get('/clubs/my')
    ])

    stats.value = {
      courses: scheduleRes.data.data.length,
      activities: activitiesRes.data.data.length,
      clubs: clubsRes.data.data.length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const updateProfile = async () => {
  try {
    await request.put('/profile', profileForm)
    ElMessage.success('个人资料更新成功')
    showEditDialog.value = false
    await userStore.fetchCurrentUser()
    await request.post('/recommendations/generate')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新失败')
  }
}

const initChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('progressChart')
    if (!chartDom) return

    if (progressChart) {
      progressChart.dispose()
    }

    progressChart = echarts.init(chartDom)
    const option = {
      title: {
        text: '学习进度分布'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '学习进度',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: '已完成' },
            { value: 735, name: '进行中' },
            { value: 580, name: '未开始' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    progressChart.setOption(option)
  })
}

onMounted(async () => {
  await userStore.fetchCurrentUser()
  initProfileForm()
  fetchStats()
  initChart()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (progressChart) {
      progressChart.resize()
    }
  })
})
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}

.user-card {
  text-align: center;
}

.user-header {
  margin-bottom: 20px;
}

.user-header h3 {
  margin: 15px 0 10px;
  color: #303133;
}

.user-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-container {
  padding: 20px 0;
}
</style>
