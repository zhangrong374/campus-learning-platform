# API接口修复记录

## 修复时间
2026-03-21

## 修复的接口路径不匹配问题

### 1. 推荐接口
- **前端调用**: `/api/recommendations/generate` (GET)
- **后端定义**: `/api/recommendations/generate` (POST only)
- **修复**: 添加GET方法支持，同时支持POST和GET

### 2. 课表接口
- **前端调用**: `/api/student/schedule`
- **后端定义**: `/api/schedule`
- **修复**: 前端改为`/api/schedule`
- **文件**: `frontend/src/views/Schedule.vue`, `frontend/src/views/Profile.vue`

### 3. 排行榜接口
- **前端调用**: `/api/student/leaderboard`
- **后端定义**: `/api/leaderboard`
- **修复**: 前端改为`/api/leaderboard`，并简化后端SQL查询
- **文件**: `frontend/src/views/Community.vue`, `backend/simple-server.js`

### 4. 个人资料接口
- **前端调用**: `/api/student/profile`
- **后端定义**: `/api/profile`
- **修复**: 前端改为`/api/profile`
- **文件**: `frontend/src/views/Profile.vue`

### 5. 添加课程到课表接口
- **前端调用**: `/api/student/courses` (POST)
- **后端定义**: `/api/schedule` (POST)
- **修复**: 前端改为`/api/schedule`
- **文件**: `frontend/src/views/Schedule.vue`

## 接口完整列表

### 已测试通过的接口
✅ `/api/health` - 健康检查
✅ `/api/auth/login` - 登录
✅ `/api/auth/register` - 注册
✅ `/api/auth/me` - 获取当前用户
✅ `/api/courses` - 课程列表
✅ `/api/courses/:id` - 课程详情
✅ `/api/clubs` - 社团列表
✅ `/api/clubs/my` - 我的社团
✅ `/api/clubs/:clubId/join` - 加入社团
✅ `/api/clubs/:clubId/leave` - 退出社团
✅ `/api/activities` - 活动列表
✅ `/api/activities/my` - 我的活动
✅ `/api/activities/:activityId/join` - 参加活动
✅ `/api/activities/:activityId/cancel` - 取消活动报名
✅ `/api/recommendations` - 获取推荐
✅ `/api/recommendations/generate` - 生成推荐 (GET/POST)
✅ `/api/leaderboard` - 学习排行榜
✅ `/api/schedule` - 获取/添加课表
✅ `/api/posts` - 帖子列表
✅ `/api/profile` - 更新个人资料
✅ `/api/student/progress` - 学生学习进度
✅ `/api/course-progress` - 更新课程进度

## 测试账号
- 学生: student1 / 123456
- 管理员: admin / 123456

## 服务地址
- 前端: http://localhost:5173
- 后端: http://localhost:3006
- API测试页: http://localhost:5173/test-api.html
