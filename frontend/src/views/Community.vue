<template>
  <div class="community-page">
    <el-row :gutter="20">
      <!-- 左侧帖子列表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-tabs v-model="activeCategory" @tab-change="fetchPosts">
                <el-tab-pane label="全部" name="" />
                <el-tab-pane label="考研交流" name="考研" />
                <el-tab-pane label="就业分享" name="就业" />
                <el-tab-pane label="学习讨论" name="学习" />
                <el-tab-pane label="生活闲聊" name="生活" />
              </el-tabs>
              <el-button type="primary" @click="showCreateDialog = true">
                <el-icon><EditPen /></el-icon>
                发布帖子
              </el-button>
            </div>
          </template>

          <div v-loading="loading">
            <el-card
              v-for="post in posts"
              :key="post.id"
              class="post-card"
              shadow="hover"
              @click="viewPost(post.id)"
            >
              <div class="post-header">
                <el-avatar :size="40" :src="post.avatar">
                  {{ post.username?.charAt(0) }}
                </el-avatar>
                <div class="post-meta">
                  <div class="username">{{ post.username }}</div>
                  <div class="time">{{ formatTime(post.created_at) }}</div>
                </div>
                <el-tag>{{ post.category }}</el-tag>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-footer">
                <span><el-icon><View /></el-icon> {{ post.views }}</span>
                <span><el-icon><ChatLineSquare /></el-icon> {{ post.comment_count }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likes }}</span>
              </div>
            </el-card>

            <el-empty v-if="!loading && !posts.length" description="暂无帖子" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧排行榜 -->
      <el-col :span="8">
        <el-card class="rank-card">
          <template #header>
            <span>学习排行榜</span>
          </template>
          <div class="rank-list" v-loading="rankLoading">
            <div
              v-for="(item, index) in leaderboard"
              :key="item.id"
              class="rank-item"
              :class="{ 'top-three': index < 3 }"
            >
              <div class="rank-number">{{ index + 1 }}</div>
              <el-avatar :size="32" :src="item.avatar">
                {{ item.username?.charAt(0) }}
              </el-avatar>
              <div class="rank-info">
                <div class="username">{{ item.username }}</div>
                <div class="score">{{ item.total_score }} 分</div>
              </div>
            </div>
            <el-empty v-if="!rankLoading && !leaderboard.length" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建帖子对话框 -->
    <el-dialog v-model="showCreateDialog" title="发布帖子" width="600px">
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="postForm.category">
            <el-option label="考研交流" value="考研" />
            <el-option label="就业分享" value="就业" />
            <el-option label="学习讨论" value="学习" />
            <el-option label="生活闲聊" value="生活" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="postForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createPost">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { EditPen, View, ChatLineSquare, Star } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const rankLoading = ref(false)
const posts = ref<any[]>([])
const leaderboard = ref<any[]>([])
const activeCategory = ref('')
const showCreateDialog = ref(false)

const postForm = reactive({
  category: '学习',
  title: '',
  content: ''
})

const fetchPosts = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (activeCategory.value) params.category = activeCategory.value

    const response = await request.get('/posts', { params })
    posts.value = response.data.data
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchLeaderboard = async () => {
  rankLoading.value = true
  try {
    const response = await request.get('/leaderboard', {
      params: { limit: 10 }
    })
    leaderboard.value = response.data.data
  } catch (error) {
    console.error('获取排行榜失败:', error)
  } finally {
    rankLoading.value = false
  }
}

const viewPost = (postId: number) => {
  // 跳转到帖子详情
  ElMessage.info('帖子详情页面开发中...')
}

const createPost = async () => {
  if (!postForm.title || !postForm.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  try {
    await request.post('/posts', postForm)
    ElMessage.success('发布成功')
    showCreateDialog.value = false
    Object.assign(postForm, {
      category: '学习',
      title: '',
      content: ''
    })
    fetchPosts()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '发布失败')
  }
}

const formatTime = (date: string) => {
  const now = new Date()
  const time = new Date(date)
  const diff = now.getTime() - time.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return time.toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchPosts()
  fetchLeaderboard()
})
</script>

<style scoped>
.community-page {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateX(5px);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-meta {
  flex: 1;
}

.username {
  font-weight: bold;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.post-title {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
}

.post-content {
  color: #606266;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-footer {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.post-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rank-card {
  position: sticky;
  top: 20px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.rank-item:hover {
  background-color: #f5f7fa;
}

.rank-item.top-three .rank-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #909399;
}

.rank-info {
  flex: 1;
}

.rank-info .username {
  font-size: 14px;
  color: #303133;
  margin-bottom: 2px;
}

.score {
  font-size: 12px;
  color: #67c23a;
  font-weight: bold;
}
</style>
