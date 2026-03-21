/**
 * 工具函数集 - JavaScript实用工具
 */

/**
 * 格式化日期
 * @param {Date|String} date - 日期对象或日期字符串
 * @param {String} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
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
}

/**
 * 防抖函数 - 延迟执行，频繁触发只执行最后一次
 * @param {Function} func - 要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数 - 限制执行频率
 * @param {Function} func - 要节流的函数
 * @param {Number} delay - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let timer = null
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      func.apply(this, args)
      lastTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args)
        lastTime = Date.now()
        timer = null
      }, delay - (now - lastTime))
    }
  }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 数组去重
 * @param {Array} arr - 要去重的数组
 * @param {String} key - 对象数组时的去重键名
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr, key = null) {
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
}

/**
 * 生成随机字符串
 * @param {Number} length - 字符串长度
 * @returns {String} 随机字符串
 */
export function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 存储工具 - 封装localStorage操作
 */
export const storage = {
  get(key, defaultValue = null) {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    try {
      return JSON.parse(item)
    } catch (e) {
      return item
    }
  },
  set(key, value) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

/**
 * 数字格式化 - 添加千分位
 * @param {Number} num - 数字
 * @returns {String} 格式化后的字符串
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 下载文件
 * @param {String} url - 文件URL
 * @param {String} filename - 文件名
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制到剪贴板
 * @param {String} text - 要复制的文本
 * @returns {Promise<Boolean>} 是否成功
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 兼容旧浏览器
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      return successful
    }
  } catch (e) {
    console.error('复制失败:', e)
    return false
  }
}

/**
 * 获取URL参数
 * @param {String} name - 参数名
 * @param {String} url - URL字符串，默认当前页面URL
 * @returns {String|null} 参数值
 */
export function getUrlParam(name, url = window.location.href) {
  const reg = new RegExp('[?&]' + name + '=([^&#]*)')
  const match = url.match(reg)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 对象转URL查询字符串
 * @param {Object} obj - 对象
 * @returns {String} 查询字符串
 */
export function objectToQueryString(obj) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 判断是否为移动端
 * @returns {Boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取设备类型
 * @returns {String} 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType() {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * 滚动到指定元素
 * @param {String|HTMLElement} element - 元素选择器或DOM元素
 * @param {Number} offset - 偏移量
 */
export function scrollToElement(element, offset = 0) {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

/**
 * 生成唯一ID
 * @returns {String}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 数字范围限制
 * @param {Number} num - 数字
 * @param {Number} min - 最小值
 * @param {Number} max - 最大值
 * @returns {Number}
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

/**
 * 数组分块
 * @param {Array} arr - 数组
 * @param {Number} size - 每块大小
 * @returns {Array}
 */
export function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
