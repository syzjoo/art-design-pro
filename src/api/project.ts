/**
 * 项目管理相关API
 *
 * 包含项目、任务、财务等相关的API接口
 */

import type {
  ProjectItem,
  ProjectDetailResponse,
  ProjectListParams,
  ProjectCreateParams,
  TaskItem,
  TaskListParams,
  TaskCreateParams,
  ExpenseItem,
  ExpenseListParams,
  ExpenseCreateParams,
  FinanceStatistics,
  PaginationResponse
} from '@/types/api/project'
import api from '@/utils/http'

/**
 * 项目相关API
 */

// 获取项目列表
export const getProjectList = async (
  params: ProjectListParams = {}
): Promise<PaginationResponse<ProjectItem>> => {
  const response = await api.get({
    url: '/api/project/projects',
    params
  })
  return response as PaginationResponse<ProjectItem>
}

// 获取项目详情
export const getProjectDetail = async (id: number): Promise<ProjectDetailResponse> => {
  const response = await api.get({
    url: `/api/project/projects/${id}`
  })
  return response as ProjectDetailResponse
}

// 创建项目
export const createProject = async (data: ProjectCreateParams): Promise<ProjectItem> => {
  const response = await api.post({
    url: '/api/project/projects',
    data
  })
  return response as ProjectItem
}

// 更新项目
export const updateProject = async (
  id: number,
  data: ProjectCreateParams
): Promise<ProjectItem> => {
  const response = await api.put({
    url: `/api/project/projects/${id}`,
    data
  })
  return response as ProjectItem
}

// 删除项目
export const deleteProject = async (id: number): Promise<boolean> => {
  const response = await api.del({
    url: `/api/project/projects/${id}`,
    showErrorMessage: false
  })
  return response as boolean
}

// 批量删除项目
export const batchDeleteProjects = async (ids: number[]): Promise<boolean> => {
  const response = await api.post({
    url: '/api/project/projects/batch-delete',
    data: { ids }
  })
  return response as boolean
}

// 归档项目
export const archiveProject = async (id: number): Promise<boolean> => {
  const response = await api.put({
    url: `/api/project/projects/${id}/archive`
  })
  return response as boolean
}

/**
 * 任务相关API
 */

// 获取任务列表
export const getTaskList = async (
  params: TaskListParams = {}
): Promise<PaginationResponse<TaskItem>> => {
  const response = await api.get({
    url: '/api/project/tasks',
    params
  })
  return response as PaginationResponse<TaskItem>
}

// 获取任务详情
export const getTaskDetail = async (id: number): Promise<TaskItem> => {
  const response = await api.get({
    url: `/api/project/tasks/${id}`
  })
  return response as TaskItem
}

// 创建任务
export const createTask = async (data: TaskCreateParams): Promise<TaskItem> => {
  const response = await api.post({
    url: '/api/project/tasks',
    data
  })
  return response as TaskItem
}

// 更新任务
export const updateTask = async (id: number, data: TaskCreateParams): Promise<TaskItem> => {
  const response = await api.put({
    url: `/api/project/tasks/${id}`,
    data
  })
  return response as TaskItem
}

// 删除任务
export const deleteTask = async (id: number): Promise<boolean> => {
  const response = await api.del({
    url: `/api/project/tasks/${id}`
  })
  return response as boolean
}

// 完成任务
export const completeTask = async (
  id: number,
  data: { achievement?: string; attachments?: any[] }
): Promise<TaskItem> => {
  const response = await api.put({
    url: `/api/project/tasks/${id}/complete`,
    data
  })
  return response as TaskItem
}

// 批量删除任务
export const batchDeleteTasks = async (ids: number[]): Promise<boolean> => {
  const response = await api.post({
    url: '/api/project/tasks/batch-delete',
    data: { ids }
  })
  return response as boolean
}

/**
 * 财务相关API
 */

// 获取费用列表
export const getExpenseList = async (
  params: ExpenseListParams = {}
): Promise<PaginationResponse<ExpenseItem>> => {
  const response = await api.get({
    url: '/api/project/expenses',
    params
  })
  return response as PaginationResponse<ExpenseItem>
}

// 获取费用详情
export const getExpenseDetail = async (id: number): Promise<ExpenseItem> => {
  const response = await api.get({
    url: `/api/project/expenses/${id}`
  })
  return response as ExpenseItem
}

// 创建费用
export const createExpense = async (data: ExpenseCreateParams): Promise<ExpenseItem> => {
  const response = await api.post({
    url: '/api/project/expenses',
    data
  })
  return response as ExpenseItem
}

// 更新费用
export const updateExpense = async (
  id: number,
  data: ExpenseCreateParams
): Promise<ExpenseItem> => {
  const response = await api.put({
    url: `/api/project/expenses/${id}`,
    data
  })
  return response as ExpenseItem
}

// 删除费用
export const deleteExpense = async (id: number): Promise<boolean> => {
  const response = await api.del({
    url: `/api/project/expenses/${id}`
  })
  return response as boolean
}

// 获取财务统计
export const getFinanceStatistics = async (): Promise<FinanceStatistics> => {
  const response = await api.get({
    url: '/api/project/finance/statistics'
  })
  return response as FinanceStatistics
}

// 获取项目统计数据
export const getProjectStatistics = async (params: any = {}): Promise<any> => {
  const response = await api.get({
    url: '/api/project/statistics',
    params
  })
  return response
}
