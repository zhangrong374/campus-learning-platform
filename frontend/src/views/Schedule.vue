<template>
  <div class="schedule-page">
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <span>我的课表</span>
          <el-button type="primary" @click="showAddCourseDialog = true">
            <el-icon><Plus /></el-icon>
            添加课程
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeSemester" @tab-change="handleTabChange">
        <el-tab-pane label="2024春季" name="2024-1" />
        <el-tab-pane label="2024秋季" name="2024-2" />
      </el-tabs>

      <el-row :gutter="20" v-loading="loading">
        <el-col :span="4" v-for="day in weekDays" :key="day.value">
          <div class="day-column">
            <div class="day-header">{{ day.label }}</div>
            <div class="day-courses">
              <el-card
                v-for="course in getCoursesByDay(day.value)"
                :key="course.id"
                class="course-item"
                shadow="hover"
              >
                <div class="course-info">
                  <div class="course-header">
                    <div class="course-name">{{ course.course_name }}</div>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deleteCourse(course.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="course-location">
                    <el-icon><Location /></el-icon>
                    {{ course.location }}
                  </div>
                </div>
              </el-card>
              <el-empty v-if="!getCoursesByDay(day.value).length" :image-size="60" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 添加课程对话框 -->
    <el-dialog v-model="showAddCourseDialog" title="添加课程" width="500px">
      <el-form :model="courseForm" label-width="100px">
        <el-form-item label="选择学期">
          <el-select v-model="courseForm.semester">
            <el-option label="2024春季" value="2024-1" />
            <el-option label="2024秋季" value="2024-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="courseForm.course_id" filterable placeholder="选择课程">
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="`${course.course_name} (${course.course_code})`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="星期">
          <el-select v-model="courseForm.day">
            <el-option v-for="day in weekDays" :key="day.value" :label="day.label" :value="day.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间段">
          <el-select v-model="courseForm.time_slot" placeholder="选择时间段">
            <el-option label="第1节 (08:00-09:40)" value="1" />
            <el-option label="第2节 (10:00-11:40)" value="2" />
            <el-option label="第3节 (14:00-15:40)" value="3" />
            <el-option label="第4节 (16:00-17:40)" value="4" />
            <el-option label="第5节 (19:00-20:40)" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="courseForm.location" placeholder="例如：教学楼A101" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="addCourse">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Plus, Location, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const schedule = ref<any[]>([])
const activeSemester = ref('2024-1')
const showAddCourseDialog = ref(false)
const availableCourses = ref<any[]>([])

const weekDays = [
  { label: '周一', value: '周一' },
  { label: '周二', value: '周二' },
  { label: '周三', value: '周三' },
  { label: '周四', value: '周四' },
  { label: '周五', value: '周五' },
  { label: '周六', value: '周六' },
  { label: '周日', value: '周日' }
]

const courseForm = reactive({
  semester: '2024-1',
  course_id: null as number | null,
  day: '周一',
  time_slot: '1',
  location: ''
})

const fetchSchedule = async () => {
  loading.value = true
  try {
    const response = await request.get('/schedule', {
      params: { semester: activeSemester.value }
    })
    schedule.value = response.data.data
  } catch (error) {
    console.error('获取课表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchAvailableCourses = async () => {
  try {
    const response = await request.get('/courses')
    availableCourses.value = response.data.data
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

const getCoursesByDay = (day: string) => {
  return schedule.value.filter(course => course.day === day)
}

const formatTime = (time: string) => {
  return time ? time.substring(0, 5) : ''
}

const handleTabChange = () => {
  fetchSchedule()
}

const addCourse = async () => {
  if (!courseForm.course_id) {
    ElMessage.warning('请选择课程')
    return
  }

  try {
    await request.post('/schedule', courseForm)
    ElMessage.success('课程添加成功')
    showAddCourseDialog.value = false
    fetchSchedule()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '添加课程失败')
  }
}

const deleteCourse = async (courseId: number) => {
  try {
    await request.delete(`/schedule/${courseId}`)
    ElMessage.success('课程删除成功')
    fetchSchedule()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '删除课程失败')
  }
}

onMounted(() => {
  fetchSchedule()
  fetchAvailableCourses()
})
</script>

<style scoped>
.schedule-page {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-column {
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  padding: 10px;
  font-weight: bold;
}

.day-courses {
  padding: 10px;
  min-height: 400px;
}

.course-item {
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.course-item:hover {
  transform: scale(1.02);
}

.course-info {
  padding: 5px;
}

.course-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
  font-size: 14px;
}

.course-time {
  color: #67c23a;
  font-size: 12px;
  margin-bottom: 5px;
}

.course-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
