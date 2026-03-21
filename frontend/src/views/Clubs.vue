<template>
  <div class="clubs-page">
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索社团"
            :prefix-icon="Search"
            clearable
            @keyup.enter="fetchClubs"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchClubs" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedCategory" placeholder="社团类别" clearable @change="fetchClubs">
            <el-option label="学术类" value="学术类" />
            <el-option label="文艺类" value="文艺类" />
            <el-option label="体育类" value="体育类" />
            <el-option label="志愿类" value="志愿类" />
            <el-option label="科技类" value="科技类" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button-group>
            <el-button type="primary" @click="activeTab = 'all'">全部社团</el-button>
            <el-button @click="activeTab = 'my'">我的社团</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="club in displayClubs" :key="club.id" style="margin-bottom: 20px">
        <el-card class="club-card" shadow="hover">
          <div class="club-header">
            <div class="club-icon">
              <el-icon :size="48"><User /></el-icon>
            </div>
            <div class="club-info">
              <el-tag size="small">{{ club.category }}</el-tag>
              <span class="club-name">{{ club.name }}</span>
            </div>
          </div>
          <p class="club-desc">{{ club.description }}</p>
          <div class="club-meta">
            <span><el-icon><User /></el-icon> {{ club.member_count }} 成员</span>
          </div>
          <div class="club-footer">
            <el-button
              v-if="!isJoined(club.id)"
              type="primary"
              style="width: 100%"
              @click="joinClub(club.id)"
            >
              加入社团
            </el-button>
            <el-button
              v-else
              type="danger"
              style="width: 100%"
              @click="leaveClub(club.id)"
            >
              退出社团
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !displayClubs.length" description="暂无社团数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Search, User } from '@element-plus/icons-vue'

const loading = ref(false)
const clubs = ref<any[]>([])
const myClubs = ref<any[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const activeTab = ref('all')

const displayClubs = computed(() => {
  return activeTab.value === 'all' ? clubs.value : myClubs.value
})

const fetchClubs = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value

    const response = await request.get('/clubs', { params })
    clubs.value = response.data.data
  } catch (error) {
    console.error('获取社团列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchMyClubs = async () => {
  try {
    const response = await request.get('/clubs/my')
    myClubs.value = response.data.data
  } catch (error) {
    console.error('获取我的社团失败:', error)
  }
}

const isJoined = (clubId: number) => {
  return myClubs.value.some(c => c.id === clubId)
}

const joinClub = async (clubId: number) => {
  try {
    await request.post(`/clubs/${clubId}/join`)
    ElMessage.success('加入社团成功')
    fetchClubs()
    fetchMyClubs()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加入社团失败')
  }
}

const leaveClub = async (clubId: number) => {
  try {
    await request.delete(`/clubs/${clubId}/leave`)
    ElMessage.success('退出社团成功')
    fetchClubs()
    fetchMyClubs()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '退出社团失败')
  }
}

onMounted(() => {
  fetchClubs()
  fetchMyClubs()
})
</script>

<style scoped>
.clubs-page {
  padding: 20px 0;
}

.filter-card {
  margin-bottom: 20px;
}

.club-card {
  cursor: pointer;
  transition: transform 0.3s;
  height: 100%;
}

.club-card:hover {
  transform: translateY(-5px);
}

.club-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.club-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.club-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.club-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.club-desc {
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

.club-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.club-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.club-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}
</style>
