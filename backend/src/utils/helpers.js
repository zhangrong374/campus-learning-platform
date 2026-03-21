/**
 * 后端JavaScript工具函数库
 */

/**
 * 分页函数
 * @param {Array} data - 数据数组
 * @param {Number} page - 页码（从1开始）
 * @param {Number} pageSize - 每页数量
 * @returns {Object} { data: 当前页数据, total: 总数, page: 当前页, pageSize, totalPages: 总页数 }
 */
function paginate(data, page = 1, pageSize = 10) {
  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    data: data.slice(startIndex, endIndex),
    total,
    page: currentPage,
    pageSize,
    totalPages
  }
}

/**
 * 响应格式化工具
 */
const responseUtil = {
  /**
   * 成功响应
   * @param {*} data - 返回数据
   * @param {String} message - 提示信息
   */
  success(data = null, message = '操作成功') {
    return {
      success: true,
      message,
      data
    }
  },

  /**
   * 失败响应
   * @param {String} message - 错误信息
   * @param {Number} code - 错误码
   */
  error(message = '操作失败', code = 500) {
    return {
      success: false,
      message,
      code
    }
  },

  /**
   * 分页响应
   * @param {Array} data - 数据列表
   * @param {Object} pagination - 分页信息
   */
  paginate(data, pagination) {
    return {
      success: true,
      message: '查询成功',
      data,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: pagination.totalPages
      }
    }
  }
}

/**
 * 数据验证工具
 */
const validator = {
  /**
   * 验证邮箱
   */
  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  /**
   * 验证手机号（中国大陆）
   */
  isMobile(phone) {
    const regex = /^1[3-9]\d{9}$/
    return regex.test(phone)
  },

  /**
   * 验证用户名（4-20位字母数字下划线）
   */
  isUsername(username) {
    const regex = /^[a-zA-Z0-9_]{4,20}$/
    return regex.test(username)
  },

  /**
   * 验证密码强度（至少8位，包含字母和数字）
   */
  isStrongPassword(password) {
    if (password.length < 8) return false
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    return hasLetter && hasNumber
  },

  /**
   * 验证必填字段
   */
  required(value) {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }
}

/**
 * 字符串处理工具
 */
const stringUtil = {
  /**
   * 生成随机字符串
   */
  random(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  /**
   * 生成唯一ID
   */
  uuid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  /**
   * 首字母大写
   */
  capitalize(str) {
    if (!str || typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * 驼峰转下划线
   */
  camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase()
  },

  /**
   * 下划线转驼峰
   */
  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  },

  /**
   * 截断文本
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str || ''
    return str.substring(0, length) + suffix
  }
}

/**
 * 数组处理工具
 */
const arrayUtil = {
  /**
   * 数组去重
   */
  unique(arr, key = null) {
    if (!key) {
      return [...new Set(arr)]
    }
    const seen = new Set()
    return arr.filter(item => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  },

  /**
   * 数组分组
   */
  groupBy(arr, key) {
    return arr.reduce((result, item) => {
      const group = item[key]
      if (!result[group]) result[group] = []
      result[group].push(item)
      return result
    }, {})
  },

  /**
   * 数组排序
   */
  sortBy(arr, key, order = 'asc') {
    return arr.slice().sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  },

  /**
   * 数组乱序（Fisher-Yates算法）
   */
  shuffle(arr) {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

/**
 * 日期时间工具
 */
const dateUtil = {
  /**
   * 格式化日期
   */
  format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  /**
   * 获取当前时间戳
   */
  now() {
    return Date.now()
  },

  /**
   * 计算时间差（毫秒）
   */
  diff(date1, date2) {
    return new Date(date1) - new Date(date2)
  },

  /**
   * 添加天数
   */
  addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  /**
   * 判断是否为今天
   */
  isToday(date) {
    const today = new Date()
    const d = new Date(date)
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear()
  }
}

/**
 * 对象处理工具
 */
const objectUtil = {
  /**
   * 深度合并对象
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target
    const source = sources.shift()

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          this.deepMerge(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
    return this.deepMerge(target, ...sources)
  },

  /**
   * 深拷贝
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (obj instanceof Object) {
      const clonedObj = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }
  },

  /**
   * 判断是否为对象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  },

  /**
   * 获取对象属性
   */
  get(obj, path, defaultValue = null) {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }
    return result !== undefined ? result : defaultValue
  }
}

/**
 * 日志工具
 */
const logger = {
  /**
   * 信息日志
   */
  info(message, ...args) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args)
  },

  /**
   * 错误日志
   */
  error(message, ...args) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args)
  },

  /**
   * 警告日志
   */
  warn(message, ...args) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args)
  },

  /**
   * 调试日志
   */
  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args)
    }
  }
}

/**
 * 异步工具
 */
const asyncUtil = {
  /**
   * 延迟执行
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 重试函数
   */
  async retry(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await this.delay(delayMs * (i + 1))
      }
    }
  }
}

/**
 * 导出所有工具
 */
module.exports = {
  paginate,
  responseUtil,
  validator,
  stringUtil,
  arrayUtil,
  dateUtil,
  objectUtil,
  logger,
  asyncUtil
}
