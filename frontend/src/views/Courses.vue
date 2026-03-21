<template>
  <div class="courses-page">
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索课程名称或编号"
            :prefix-icon="Search"
            clearable
            @clear="fetchCourses"
            @keyup.enter="fetchCourses"
            @input="onSearchInput"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchCourses" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="fetchCourses">
            <el-option label="计算机" value="计算机" />
            <el-option label="数学" value="数学" />
            <el-option label="外语" value="外语" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="generateRecommendations">
            <el-icon><MagicStick /></el-icon>
            智能推荐
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" v-loading="loading">
      <el-col
        v-for="course in courses"
        :key="course.id"
        :span="8"
        style="margin-bottom: 20px"
      >
        <el-card class="course-card" shadow="hover" @click="viewCourse(course.id)">
          <div class="course-header">
            <el-tag>{{ course.category }}</el-tag>
            <span class="course-code">{{ course.course_code }}</span>
          </div>
          <h3 class="course-title">{{ course.course_name }}</h3>
          <p class="course-desc">{{ course.description || '暂无描述' }}</p>
          <div class="course-meta">
            <span><el-icon><User /></el-icon> {{ course.instructor }}</span>
            <span><el-icon><Document /></el-icon> {{ course.credits }}学分</span>
          </div>
          <div class="course-footer">
            <el-button type="primary" text>查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !courses.length" description="暂无课程数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Search, MagicStick, User, Document } from '@element-plus/icons-vue'
// 导入JavaScript工具函数
import { debounce, objectToQueryString } from '@/utils/helpers.js'

const router = useRouter()

const loading = ref(false)
const courses = ref<any[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')

const fetchCourses = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value

    // 使用JavaScript工具函数构建查询字符串
    const queryString = objectToQueryString(params)
    const response = await request.get(`/courses?${queryString}`)
    courses.value = response.data.data
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 使用JavaScript防抖函数优化搜索
const debouncedSearch = debounce(fetchCourses, 500)

// 监听搜索输入
const onSearchInput = () => {
  debouncedSearch()
}

const generateRecommendations = async () => {
  try {
    await request.post('/recommendations/generate')
    ElMessage.success('推荐已生成')
    fetchCourses()
  } catch (error) {
    ElMessage.error('生成推荐失败')
  }
}

const viewCourse = (id: number) => {
  router.push(`/courses/${id}`)
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.courses-page {
  padding: 20px 0;
}

.filter-card {
  margin-bottom: 20px;
}

.course-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
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

.course-title {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
}

.course-desc {
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

.course-meta {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  text-align: right;
}
</style>
