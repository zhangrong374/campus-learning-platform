<template>
  <div class="activities-page">
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索活动"
            :prefix-icon="Search"
            clearable
            @keyup.enter="fetchActivities"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchActivities" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedType" placeholder="活动类型" clearable @change="fetchActivities">
            <el-option label="学术讲座" value="学术讲座" />
            <el-option label="文体活动" value="文体活动" />
            <el-option label="社会实践" value="社会实践" />
            <el-option label="竞赛活动" value="竞赛活动" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button-group>
            <el-button type="primary" @click="activeTab = 'all'">全部活动</el-button>
            <el-button @click="activeTab = 'my'">我的活动</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="activity in activities" :key="activity.id" style="margin-bottom: 20px">
        <el-card class="activity-card" shadow="hover">
          <div class="activity-image">
            <el-tag>{{ activity.type }}</el-tag>
          </div>
          <h3 class="activity-title">{{ activity.title }}</h3>
          <p class="activity-desc">{{ activity.description }}</p>
          <div class="activity-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDateTime(activity.start_time) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ activity.location }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ activity.current_participants }}/{{ activity.max_participants || '不限' }}</span>
            </div>
          </div>
          <div class="activity-footer">
            <el-button
              v-if="!isJoined(activity.id)"
              type="primary"
              :disabled="isFull(activity)"
              @click="joinActivity(activity.id)"
            >
              {{ isFull(activity) ? '已满员' : '立即报名' }}
            </el-button>
            <el-button v-else type="danger" @click="cancelActivity(activity.id)">
              取消报名
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !activities.length" description="暂无活动数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Search, Calendar, Location, User } from '@element-plus/icons-vue'

const loading = ref(false)
const activities = ref<any[]>([])
const myActivities = ref<any[]>([])
const searchQuery = ref('')
const selectedType = ref('')
const activeTab = ref('all')

const displayActivities = computed(() => {
  return activeTab.value === 'all' ? activities.value : myActivities.value
})

const fetchActivities = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedType.value) params.type = selectedType.value
    params.status = 'published'

    const response = await request.get('/activities', { params })
    activities.value = response.data.data
  } catch (error) {
    console.error('获取活动列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchMyActivities = async () => {
  try {
    const response = await request.get('/activities/my')
    myActivities.value = response.data.data
  } catch (error) {
    console.error('获取我的活动失败:', error)
  }
}

const isJoined = (activityId: number) => {
  return myActivities.value.some(a => a.id === activityId)
}

const isFull = (activity: any) => {
  return activity.max_participants && activity.current_participants >= activity.max_participants
}

const joinActivity = async (activityId: number) => {
  try {
    await request.post(`/activities/${activityId}/join`)
    ElMessage.success('报名成功')
    fetchActivities()
    fetchMyActivities()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '报名失败')
  }
}

const cancelActivity = async (activityId: number) => {
  try {
    await request.delete(`/activities/${activityId}/cancel`)
    ElMessage.success('取消报名成功')
    fetchActivities()
    fetchMyActivities()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取消报名失败')
  }
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchActivities()
  fetchMyActivities()
})
</script>

<style scoped>
.activities-page {
  padding: 20px 0;
}

.filter-card {
  margin-bottom: 20px;
}

.activity-card {
  cursor: pointer;
  transition: transform 0.3s;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-5px);
}

.activity-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.activity-title {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
}

.activity-desc {
  color: #606266;
  font-size: 14px;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 40px;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
}

.activity-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.activity-footer .el-button {
  width: 100%;
}
</style>
