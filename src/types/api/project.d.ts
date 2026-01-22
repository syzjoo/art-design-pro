/**
 * 项目管理相关类型定义
 *
 * 包含项目、任务、财务等相关的数据结构和类型定义
 */

// 项目状态类型
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'

// 项目优先级类型
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

// 项目基本信息
export interface ProjectItem {
  id: number
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  manager: string
  start_date: string
  end_date: string
  budget: number
  actual_cost: number
  created_at: string
}

// 项目详细信息
export interface ProjectDetailResponse extends ProjectItem {
  member_count: number
  total_tasks: number
  completed_tasks: number
  active_tasks: number
  overdue_tasks: number
}

// 项目列表查询参数
export interface ProjectListParams {
  keyword?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  manager?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 项目创建/更新参数
export interface ProjectCreateParams {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  manager: string
  start_date: string
  end_date: string
  budget: number
  actual_cost?: number
}

// 任务状态类型
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// 任务基本信息
export interface TaskItem {
  id: number
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  progress: number
  assignee: string
  project_id: number
  project_name: string
  start_date: string
  end_date: string
  created_at: string
}

// 任务列表查询参数
export interface TaskListParams {
  keyword?: string
  project_id?: number
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 任务创建/更新参数
export interface TaskCreateParams {
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  project_id: number
  start_date: string
  end_date: string
  progress?: number
  dependencies?: number[]
}

// 任务基本信息（包含依赖关系）
export interface TaskItemWithDependencies extends TaskItem {
  dependencies?: number[]
}

// 任务完成参数
export interface TaskCompleteParams {
  completion_notes?: string
  attachments?: string[]
}

// 费用类型
export type ExpenseType = 'income' | 'expense'

// 费用基本信息
export interface ExpenseItem {
  id: number
  date: string
  project_name: string
  type: ExpenseType
  description: string
  amount: number
  created_by: string
}

// 费用列表查询参数
export interface ExpenseListParams {
  keyword?: string
  project?: string
  type?: ExpenseType
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 费用创建/更新参数
export interface ExpenseCreateParams {
  date: string
  project_name: string
  type: ExpenseType
  description: string
  amount: number
}

// 财务统计数据
export interface FinanceStatistics {
  total_income: number
  total_expense: number
  net_income: number
  expense_by_category: Array<{
    category: string
    amount: number
    percentage: number
  }>
  monthly_trend: Array<{
    month: string
    income: number
    expense: number
  }>
}

// 分页响应数据
export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// 通用响应数据
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
