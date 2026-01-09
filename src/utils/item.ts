/**
 * 项目管理相关工具函数
 * @module utils/item
 */

/**
 * 获取项目类型名称
 * @param type 项目类型
 */
export const getTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    // 通用类型
    dev: '软件开发',
    checkin: '自律打卡',
    write: '写作创作',
    video: '视频创作',
    design: '设计创作',
    learning: '学习培训',
    // detail/index.vue 中使用的类型
    self: '自律打卡',
    frontend: '前端开发',
    backend: '后端开发',
    writing: '写作创作',
    copy: '文案策划'
  }
  return typeMap[type] || type
}

/**
 * 获取项目状态名称
 * @param status 项目状态
 */
export const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    progress: '进行中', // 兼容旧状态名
    'in-progress': '进行中', // 兼容旧状态名
    completed: '已完成',
    paused: '已暂停',
    suspended: '已暂停',
    canceled: '已取消'
  }
  return statusMap[status] || status
}

/**
 * 获取项目类型对应的颜色
 * @param type 项目类型
 */
export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    // 通用类型
    dev: '#165DFF', // primary - 软件开发
    checkin: '#00B42A', // success - 自律打卡
    write: '#F53F3F', // danger - 写作创作
    video: '#FF7D00', // warning - 视频创作
    design: '#722ED1', // purple - 设计创作
    learning: '#6BB8FF', // blue - 学习培训
    // detail/index.vue 中使用的类型
    self: '#165DFF',
    frontend: '#00B42A',
    backend: '#FF7D00',
    writing: '#F53F3F',
    copy: '#722ED1'
  }
  return colorMap[type] || '#86909C'
}

/**
 * 获取项目优先级名称
 * @param priority 项目优先级
 */
export const getPriorityName = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return priorityMap[priority] || '中'
}

/**
 * 获取项目优先级对应的颜色
 * @param priority 项目优先级
 */
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: '#f5222d',
    medium: '#faad14',
    low: '#52c41a'
  }
  return colorMap[priority] || '#faad14'
}

/**
 * 获取项目类型样式
 * @param type 项目类型
 */
export const getTypeStyle = (type: string): string => {
  const colorMap: Record<string, string> = {
    dev: 'background-color: rgba(22, 93, 255, 0.1); color: #165DFF;',
    checkin: 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;',
    write: 'background-color: rgba(245, 63, 63, 0.1); color: #F53F3F;',
    video: 'background-color: rgba(255, 125, 0, 0.1); color: #FF7D00;',
    design: 'background-color: rgba(114, 46, 209, 0.1); color: #722ED1;',
    learning: 'background-color: rgba(107, 184, 255, 0.1); color: #6BB8FF;',
    self: 'background-color: rgba(22, 93, 255, 0.1); color: #165DFF;',
    frontend: 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;',
    backend: 'background-color: rgba(255, 125, 0, 0.1); color: #FF7D00;',
    writing: 'background-color: rgba(245, 63, 63, 0.1); color: #F53F3F;',
    copy: 'background-color: rgba(114, 46, 209, 0.1); color: #722ED1;'
  }
  return colorMap[type] || 'background-color: rgba(134, 144, 156, 0.1); color: #86909C;'
}

/**
 * 获取项目状态样式
 * @param status 项目状态
 */
export const getStatusStyle = (status: string): string => {
  const styleMap: Record<string, string> = {
    pending: 'background-color: rgba(255, 125, 0, 0.1); color: #FF7D00;',
    in_progress: 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;',
    progress: 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;', // 兼容旧状态名
    'in-progress': 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;', // 兼容旧状态名
    completed: 'background-color: rgba(0, 180, 42, 0.1); color: #00B42A;',
    paused: 'background-color: rgba(134, 144, 156, 0.1); color: #86909C;'
  }
  return styleMap[status] || 'background-color: rgba(134, 144, 156, 0.1); color: #86909C;'
}

/**
 * 获取进度条样式
 * @param progress 进度值 (0-100)
 */
export const getProgressStyle = (progress: number): string => {
  const progressColor = progress >= 80 ? '#00B42A' : progress >= 50 ? '#FF7D00' : '#86909C'
  return `width: ${progress || 0}%; background-color: ${progressColor};`
}

/**
 * 获取进度条样式（详细页专用）
 * @param progress 进度值 (0-100)
 */
export const getProgressBarStyle = (progress: number): string => {
  const progressColor = progress >= 80 ? '#00B42A' : progress >= 50 ? '#FF7D00' : '#165DFF'
  return `width: ${progress || 0}%; background-color: ${progressColor};`
}

/**
 * 获取进度文本样式类
 * @param progress 进度值 (0-100)
 */
export const getProgressTextClass = (progress: number): string => {
  if (progress >= 80) return 'text-success'
  if (progress >= 50) return 'text-warning'
  return 'text-gray-500'
}
