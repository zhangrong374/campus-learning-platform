<template>
  <div class="course-detail-page" v-loading="loading">
    <el-page-header @back="router.back()" :content="course.course_name" />

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 课程信息 -->
      <el-col :span="8">
        <el-card class="course-info-card">
          <div class="course-header">
            <el-tag size="large">{{ course.category }}</el-tag>
            <span class="course-code">{{ course.course_code }}</span>
          </div>
          <el-divider />
          <div class="course-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>教师：{{ course.instructor }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>学分：{{ course.credits }}</span>
            </div>
          </div>
          <el-divider />
          <p class="course-desc">{{ course.description }}</p>
          <el-button type="primary" style="width: 100%" @click="startQuiz">
            <el-icon><Trophy /></el-icon>
            开始闯关答题
          </el-button>
        </el-card>
      </el-col>

      <!-- 课程内容 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>课程内容</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(content, index) in courseContents"
              :key="content.id"
              :timestamp="`第 ${index + 1} 节`"
              placement="top"
            >
              <el-card class="content-item" shadow="hover">
                <h4>{{ content.title }}</h4>
                <p>{{ content.content }}</p>
                <div class="content-actions">
                  <el-button type="primary" text @click="viewContent(content)">
                    查看详情
                  </el-button>
                  <el-tag v-if="getProgress(content.id)" type="success">
                    已完成
                  </el-tag>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="!courseContents.length" description="暂无课程内容" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { User, Document, Trophy } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const course = ref<any>({})
const courseContents = ref<any[]>([])
const progress = ref<any[]>([])

const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await request.get(`/courses/${route.params.id}`)
    course.value = response.data.data.course
    courseContents.value = response.data.data.contents
  } catch (error) {
    console.error('获取课程详情失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchProgress = async () => {
  try {
    const response = await request.get('/student/progress', {
      params: { course_id: route.params.id }
    })
    progress.value = response.data.data
  } catch (error) {
    console.error('获取学习进度失败:', error)
  }
}

const getProgress = (contentId: number) => {
  return progress.value.find(p => p.content_id === contentId && p.completed)
}

const viewContent = (content: any) => {
  ElMessage.info('课程内容展示功能开发中...')
}

const startQuiz = () => {
  ElMessage.info('闯关答题功能开发中...')
}

onMounted(() => {
  fetchCourseDetail()
  fetchProgress()
})
</script>

<style scoped>
.course-detail-page {
  padding: 20px 0;
}

.course-info-card {
  position: sticky;
  top: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-code {
  color: #909399;
  font-size: 14px;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.course-desc {
  color: #606266;
  line-height: 1.6;
}

.content-item {
  margin-bottom: 15px;
}

.content-item h4 {
  margin: 0 0 10px;
  color: #303133;
}

.content-item p {
  color: #606266;
  margin: 0 0 10px;
  line-height: 1.6;
}

.content-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
