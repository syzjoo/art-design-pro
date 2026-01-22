/**
 * 本地存储服务
 *
 * 提供数据持久化存储功能，使用localStorage实现
 */

import type { ProjectItem, TaskItem, ExpenseItem } from '@/types/api/project'

// 存储键名
const STORAGE_KEYS = {
  PROJECTS: 'project_management_projects',
  TASKS: 'project_management_tasks',
  EXPENSES: 'project_management_expenses',
  SETTINGS: 'project_management_settings'
}

/**
 * 项目存储服务
 */
export const projectStorage = {
  /**
   * 获取所有项目
   */
  getProjects: (): ProjectItem[] => {
    try {
      const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      return projects ? JSON.parse(projects) : []
    } catch (error) {
      console.error('获取项目数据失败:', error)
      return []
    }
  },

  /**
   * 保存项目列表
   */
  saveProjects: (projects: ProjectItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    } catch (error) {
      console.error('保存项目数据失败:', error)
    }
  },

  /**
   * 清除项目数据
   */
  clearProjects: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS)
    } catch (error) {
      console.error('清除项目数据失败:', error)
    }
  }
}

/**
 * 任务存储服务
 */
export const taskStorage = {
  /**
   * 获取所有任务
   */
  getTasks: (): TaskItem[] => {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS)
      return tasks ? JSON.parse(tasks) : []
    } catch (error) {
      console.error('获取任务数据失败:', error)
      return []
    }
  },

  /**
   * 保存任务列表
   */
  saveTasks: (tasks: TaskItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (error) {
      console.error('保存任务数据失败:', error)
    }
  },

  /**
   * 清除任务数据
   */
  clearTasks: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS)
    } catch (error) {
      console.error('清除任务数据失败:', error)
    }
  }
}

/**
 * 费用存储服务
 */
export const expenseStorage = {
  /**
   * 获取所有费用
   */
  getExpenses: (): ExpenseItem[] => {
    try {
      const expenses = localStorage.getItem(STORAGE_KEYS.EXPENSES)
      return expenses ? JSON.parse(expenses) : []
    } catch (error) {
      console.error('获取费用数据失败:', error)
      return []
    }
  },

  /**
   * 保存费用列表
   */
  saveExpenses: (expenses: ExpenseItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
    } catch (error) {
      console.error('保存费用数据失败:', error)
    }
  },

  /**
   * 清除费用数据
   */
  clearExpenses: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.EXPENSES)
    } catch (error) {
      console.error('清除费用数据失败:', error)
    }
  }
}

/**
 * 清空所有存储数据
 */
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('清空存储数据失败:', error)
  }
}

/**
 * 导出存储服务
 */
export default {
  projectStorage,
  taskStorage,
  expenseStorage,
  clearAllStorage
}
