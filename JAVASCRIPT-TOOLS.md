# JavaScript 工具函数文档

本项目在 TypeScript 基础上引入了原生 JavaScript 工具函数，展示对 JavaScript 核心特性的掌握。

---

## 📁 前端工具函数

位置：`frontend/src/utils/helpers.js`

### 🔧 日期处理

- **formatDate(date, format)** - 日期格式化
  - 支持自定义格式模板：YYYY-MM-DD HH:mm:ss
  - 示例：`formatDate(new Date(), 'YYYY年MM月DD日')`

### ⚡ 性能优化

- **debounce(func, delay)** - 防抖函数
  - 频繁触发只执行最后一次
  - 应用于搜索输入优化

- **throttle(func, delay)** - 节流函数
  - 限制函数执行频率
  - 应用于滚动、resize事件

### 📦 数据处理

- **deepClone(obj)** - 深度拷贝对象
  - 支持对象、数组、日期等类型

- **uniqueArray(arr, key)** - 数组去重
  - 支持普通数组和对象数组

- **randomString(length)** - 生成随机字符串
  - 默认8位，包含字母和数字

### 💾 本地存储

- **storage.get(key, defaultValue)** - 获取存储
  - 自动JSON解析

- **storage.set(key, value)** - 设置存储
  - 自动JSON序列化

- **storage.remove(key)** - 删除存储
- **storage.clear()** - 清空所有存储

### 🔧 工具函数

- **formatNumber(num)** - 数字千分位格式化
- **downloadFile(url, filename)** - 下载文件
- **copyToClipboard(text)** - 复制到剪贴板
- **getUrlParam(name, url)** - 获取URL参数
- **objectToQueryString(obj)** - 对象转查询字符串
- **isMobile()** - 判断是否移动端
- **getDeviceType()** - 获取设备类型
- **scrollToElement(element, offset)** - 平滑滚动到元素
- **generateId()** - 生成唯一ID
- **clamp(num, min, max)** - 数字范围限制
- **chunk(arr, size)** - 数组分块

---

## 📁 后端工具函数

位置：`backend/src/utils/helpers.js`

### 📄 分页处理

- **paginate(data, page, pageSize)** - 分页函数
  - 返回：data, total, page, pageSize, totalPages

### 📤 响应格式化

- **responseUtil.success(data, message)** - 成功响应
- **responseUtil.error(message, code)** - 错误响应
- **responseUtil.paginate(data, pagination)** - 分页响应

### ✅ 数据验证

- **validator.isEmail(email)** - 邮箱验证
- **validator.isMobile(phone)** - 手机号验证
- **validator.isUsername(username)** - 用户名验证
- **validator.isStrongPassword(password)** - 密码强度验证
- **validator.required(value)** - 必填字段验证

### 🎯 字符串处理

- **stringUtil.random(length)** - 随机字符串
- **stringUtil.uuid()** - 唯一ID
- **stringUtil.capitalize(str)** - 首字母大写
- **stringUtil.camelToSnake(str)** - 驼峰转下划线
- **stringUtil.snakeToCamel(str)** - 下划线转驼峰
- **stringUtil.truncate(str, length, suffix)** - 文本截断

### 📊 数组处理

- **arrayUtil.unique(arr, key)** - 去重
- **arrayUtil.groupBy(arr, key)** - 分组
- **arrayUtil.sortBy(arr, key, order)** - 排序
- **arrayUtil.shuffle(arr)** - 乱序（Fisher-Yates）

### 📅 日期时间

- **dateUtil.format(date, format)** - 格式化日期
- **dateUtil.now()** - 当前时间戳
- **dateUtil.diff(date1, date2)** - 时间差
- **dateUtil.addDays(date, days)** - 添加天数
- **dateUtil.isToday(date)** - 是否今天

### 🗂️ 对象处理

- **objectUtil.deepMerge(target, ...sources)** - 深度合并
- **objectUtil.deepClone(obj)** - 深拷贝
- **objectUtil.isObject(item)** - 判断对象
- **objectUtil.get(obj, path, defaultValue)** - 获取属性

### 📝 日志工具

- **logger.info(message, ...args)** - 信息日志
- **logger.error(message, ...args)** - 错误日志
- **logger.warn(message, ...args)** - 警告日志
- **logger.debug(message, ...args)** - 调试日志

### ⏱️ 异步工具

- **asyncUtil.delay(ms)** - 延迟执行
- **asyncUtil.retry(fn, maxRetries, delayMs)** - 重试函数

---

## 🎯 使用示例

### 前端使用

```javascript
// 导入工具函数
import { formatDate, debounce, storage } from '@/utils/helpers.js'

// 日期格式化
const formatted = formatDate(new Date(), 'YYYY-MM-DD')

// 防抖搜索
const search = debounce(() => {
  fetchCourses()
}, 300)

// 本地存储
storage.set('user', { name: '张三' })
const user = storage.get('user')
```

### 后端使用

```javascript
// 导入工具函数
const { responseUtil, logger, validator } = require('./src/utils/helpers.js')

// 日志记录
logger.info('用户登录尝试:', username)

// 数据验证
if (!validator.isEmail(email)) {
  return res.status(400).json(responseUtil.error('邮箱格式错误'))
}

// 成功响应
res.json(responseUtil.success(data, '操作成功'))
```

---

## 💡 技术要点

1. **ES6+ 语法**：箭头函数、解构赋值、模板字符串、展开运算符
2. **高阶函数**：防抖、节流、柯里化
3. **数组方法**：map、filter、reduce、sort、slice
4. **对象操作**：深拷贝、深度合并、属性访问
5. **异步处理**：Promise、async/await
6. **字符串操作**：正则表达式、模板字符串
7. **日期处理**：Date API、格式化
8. **DOM操作**：document、window API

---

## 🔍 代码亮点

1. **无依赖纯JavaScript**：不依赖第三方库，展示原生编程能力
2. **完整类型支持**：在 TypeScript 环境中无缝使用
3. **模块化设计**：按功能分类，易于维护和扩展
4. **生产级质量**：边界检查、错误处理、性能优化
5. **前后端通用**：工具函数在前后端均可使用

---

## 📊 技术栈更新

**完整技术栈：Vue3、TypeScript、JavaScript、Vite、Pinia、Vue Router、Element Plus、ECharts、Axios、Node.js、Express、MySQL、JWT、Bcrypt、RESTful API**

---

## 🚀 项目中的应用

- **前端**：Dashboard.vue 使用 formatDate 工具函数
- **前端**：Courses.vue 使用 debounce 防抖搜索
- **后端**：登录接口使用 responseUtil 统一响应格式
- **后端**：健康检查使用 logger 日志记录

这些工具函数展示了扎实的 JavaScript 基础和工程化思维。
