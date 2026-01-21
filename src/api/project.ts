/**
 * 项目管理相关API
 *
 * 包含项目、任务、财务等相关的API接口
 */

import type {
  ProjectItem,
  ProjectListParams,
  ProjectCreateParams,
  TaskItem,
  TaskListParams,
  TaskCreateParams,
  ExpenseItem,
  ExpenseListParams,
  ExpenseCreateParams,
  FinanceStatistics,
  PaginationResponse,
  ApiResponse
} from '@/types/api/project'

// 模拟项目数据
const mockProjects: ProjectItem[] = [
  {
    id: 1,
    name: '电商平台重构',
    description: '对现有电商平台进行全面重构，提升用户体验和系统性能',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    manager: '张三',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    budget: 500000,
    actual_cost: 320000,
    created_at: '2023-12-15'
  },
  {
    id: 2,
    name: '移动应用开发',
    description: '开发公司内部移动应用，提高工作效率',
    status: 'in_progress',
    priority: 'medium',
    progress: 45,
    manager: '李四',
    start_date: '2024-02-15',
    end_date: '2024-07-31',
    budget: 350000,
    actual_cost: 180000,
    created_at: '2024-01-20'
  },
  {
    id: 3,
    name: '客户管理系统',
    description: '开发客户关系管理系统，优化客户服务流程',
    status: 'completed',
    priority: 'high',
    progress: 100,
    manager: '王五',
    start_date: '2023-09-01',
    end_date: '2024-01-31',
    budget: 280000,
    actual_cost: 265000,
    created_at: '2023-08-10'
  },
  {
    id: 4,
    name: '企业官网建设',
    description: '设计并开发新的企业官网，提升品牌形象',
    status: 'pending',
    priority: 'low',
    progress: 0,
    manager: '赵六',
    start_date: '2024-04-01',
    end_date: '2024-05-31',
    budget: 120000,
    actual_cost: 0,
    created_at: '2024-03-15'
  },
  {
    id: 5,
    name: '数据分析系统',
    description: '开发数据分析平台，提供数据可视化和业务洞察',
    status: 'on_hold',
    priority: 'critical',
    progress: 30,
    manager: '张三',
    start_date: '2024-01-15',
    end_date: '2024-08-31',
    budget: 650000,
    actual_cost: 180000,
    created_at: '2023-12-20'
  }
]

// 模拟任务数据
const mockTasks: TaskItem[] = [
  {
    id: 1,
    name: '需求分析',
    description: '分析电商平台重构的详细需求',
    status: 'completed',
    priority: 'high',
    progress: 100,
    assignee: '张三',
    project_id: 1,
    project_name: '电商平台重构',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    created_at: '2023-12-15'
  },
  {
    id: 2,
    name: 'UI设计',
    description: '设计电商平台新的用户界面',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    assignee: '李四',
    project_id: 1,
    project_name: '电商平台重构',
    start_date: '2024-01-16',
    end_date: '2024-02-15',
    created_at: '2023-12-15'
  },
  {
    id: 3,
    name: '后端开发',
    description: '开发电商平台后端API',
    status: 'in_progress',
    priority: 'high',
    progress: 70,
    assignee: '王五',
    project_id: 1,
    project_name: '电商平台重构',
    start_date: '2024-02-01',
    end_date: '2024-04-15',
    created_at: '2023-12-15'
  },
  {
    id: 4,
    name: '前端开发',
    description: '开发电商平台前端页面',
    status: 'in_progress',
    priority: 'high',
    progress: 50,
    assignee: '赵六',
    project_id: 1,
    project_name: '电商平台重构',
    start_date: '2024-02-16',
    end_date: '2024-05-15',
    created_at: '2023-12-15'
  },
  {
    id: 5,
    name: '移动应用原型设计',
    description: '设计移动应用的交互原型',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    assignee: '李四',
    project_id: 2,
    project_name: '移动应用开发',
    start_date: '2024-02-15',
    end_date: '2024-03-15',
    created_at: '2024-01-20'
  },
  {
    id: 6,
    name: '移动应用开发',
    description: '开发iOS和Android移动应用',
    status: 'in_progress',
    priority: 'medium',
    progress: 40,
    assignee: '王五',
    project_id: 2,
    project_name: '移动应用开发',
    start_date: '2024-03-16',
    end_date: '2024-06-30',
    created_at: '2024-01-20'
  }
]

// 模拟费用数据
const mockExpenses: ExpenseItem[] = [
  {
    id: 1,
    date: '2024-02-28',
    project_name: '电商平台重构',
    type: 'expense',
    description: '2月工资发放',
    amount: -150000,
    created_by: '张三'
  },
  {
    id: 2,
    date: '2024-02-25',
    project_name: '移动应用开发',
    type: 'expense',
    description: '云服务费用',
    amount: -35000,
    created_by: '李四'
  },
  {
    id: 3,
    date: '2024-02-20',
    project_name: '客户管理系统',
    type: 'expense',
    description: '服务器采购',
    amount: -80000,
    created_by: '赵六'
  },
  {
    id: 4,
    date: '2024-02-18',
    project_name: '电商平台重构',
    type: 'expense',
    description: '项目奖金',
    amount: -50000,
    created_by: '张三'
  },
  {
    id: 5,
    date: '2024-02-15',
    project_name: '企业官网建设',
    type: 'expense',
    description: '域名和服务费',
    amount: -12000,
    created_by: '李四'
  },
  {
    id: 6,
    date: '2024-02-10',
    project_name: '电商平台重构',
    type: 'income',
    description: '项目回款',
    amount: 500000,
    created_by: '张三'
  },
  {
    id: 7,
    date: '2024-02-08',
    project_name: '移动应用开发',
    type: 'income',
    description: '预付款',
    amount: 300000,
    created_by: '李四'
  },
  {
    id: 8,
    date: '2024-02-05',
    project_name: '数据分析系统',
    type: 'expense',
    description: '迁移服务费',
    amount: -45000,
    created_by: '张三'
  }
]

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 项目相关API
 */

// 获取项目列表
export const getProjectList = async (
  params: ProjectListParams = {}
): Promise<ApiResponse<PaginationResponse<ProjectItem>>> => {
  await delay(300)

  let filteredProjects = [...mockProjects]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredProjects = filteredProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (params.status) {
    filteredProjects = filteredProjects.filter((project) => project.status === params.status)
  }

  // 优先级筛选
  if (params.priority) {
    filteredProjects = filteredProjects.filter((project) => project.priority === params.priority)
  }

  // 负责人筛选
  if (params.manager) {
    filteredProjects = filteredProjects.filter((project) => project.manager === params.manager)
  }

  // 日期筛选
  if (params.start_date) {
    filteredProjects = filteredProjects.filter(
      (project) => project.start_date >= params.start_date!
    )
  }

  if (params.end_date) {
    filteredProjects = filteredProjects.filter((project) => project.end_date <= params.end_date!)
  }

  // 分页
  const page = params.page || 1
  const page_size = params.page_size || 10
  const start = (page - 1) * page_size
  const end = start + page_size
  const paginatedProjects = filteredProjects.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: {
      data: paginatedProjects,
      total: filteredProjects.length,
      page,
      page_size,
      pages: Math.ceil(filteredProjects.length / page_size)
    }
  }
}

// 获取项目详情
export const getProjectDetail = async (id: number): Promise<ApiResponse<ProjectItem>> => {
  await delay(200)

  const project = mockProjects.find((p) => p.id === id)

  if (!project) {
    return {
      code: 404,
      message: '项目不存在',
      data: {} as ProjectItem
    }
  }

  return {
    code: 200,
    message: 'success',
    data: project
  }
}

// 创建项目
export const createProject = async (
  data: ProjectCreateParams
): Promise<ApiResponse<ProjectItem>> => {
  await delay(500)

  const newProject: ProjectItem = {
    id: mockProjects.length + 1,
    ...data,
    progress: 0,
    actual_cost: data.actual_cost || 0,
    created_at: new Date().toISOString().split('T')[0]
  }

  mockProjects.push(newProject)

  return {
    code: 200,
    message: '项目创建成功',
    data: newProject
  }
}

// 更新项目
export const updateProject = async (
  id: number,
  data: ProjectCreateParams
): Promise<ApiResponse<ProjectItem>> => {
  await delay(400)

  const index = mockProjects.findIndex((p) => p.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '项目不存在',
      data: {} as ProjectItem
    }
  }

  const updatedProject: ProjectItem = {
    ...mockProjects[index],
    ...data
  }

  mockProjects[index] = updatedProject

  return {
    code: 200,
    message: '项目更新成功',
    data: updatedProject
  }
}

// 删除项目
export const deleteProject = async (id: number): Promise<ApiResponse<boolean>> => {
  await delay(300)

  const index = mockProjects.findIndex((p) => p.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '项目不存在',
      data: false
    }
  }

  mockProjects.splice(index, 1)

  return {
    code: 200,
    message: '项目删除成功',
    data: true
  }
}

// 批量删除项目
export const batchDeleteProjects = async (ids: number[]): Promise<ApiResponse<boolean>> => {
  await delay(500)

  for (const id of ids) {
    const index = mockProjects.findIndex((p) => p.id === id)
    if (index !== -1) {
      mockProjects.splice(index, 1)
    }
  }

  return {
    code: 200,
    message: '批量删除成功',
    data: true
  }
}

// 归档项目
export const archiveProject = async (id: number): Promise<ApiResponse<boolean>> => {
  await delay(300)

  const index = mockProjects.findIndex((p) => p.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '项目不存在',
      data: false
    }
  }

  mockProjects[index].status = 'completed'

  return {
    code: 200,
    message: '项目归档成功',
    data: true
  }
}

/**
 * 任务相关API
 */

// 获取任务列表
export const getTaskList = async (
  params: TaskListParams = {}
): Promise<ApiResponse<PaginationResponse<TaskItem>>> => {
  await delay(300)

  let filteredTasks = [...mockTasks]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.name.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword)
    )
  }

  // 项目筛选
  if (params.project_id) {
    filteredTasks = filteredTasks.filter((task) => task.project_id === params.project_id)
  }

  // 状态筛选
  if (params.status) {
    filteredTasks = filteredTasks.filter((task) => task.status === params.status)
  }

  // 优先级筛选
  if (params.priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === params.priority)
  }

  // 负责人筛选
  if (params.assignee) {
    filteredTasks = filteredTasks.filter((task) => task.assignee === params.assignee)
  }

  // 日期筛选
  if (params.start_date) {
    filteredTasks = filteredTasks.filter((task) => task.start_date >= params.start_date!)
  }

  if (params.end_date) {
    filteredTasks = filteredTasks.filter((task) => task.end_date <= params.end_date!)
  }

  // 分页
  const page = params.page || 1
  const page_size = params.page_size || 10
  const start = (page - 1) * page_size
  const end = start + page_size
  const paginatedTasks = filteredTasks.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: {
      data: paginatedTasks,
      total: filteredTasks.length,
      page,
      page_size,
      pages: Math.ceil(filteredTasks.length / page_size)
    }
  }
}

// 获取任务详情
export const getTaskDetail = async (id: number): Promise<ApiResponse<TaskItem>> => {
  await delay(200)

  const task = mockTasks.find((t) => t.id === id)

  if (!task) {
    return {
      code: 404,
      message: '任务不存在',
      data: {} as TaskItem
    }
  }

  return {
    code: 200,
    message: 'success',
    data: task
  }
}

// 创建任务
export const createTask = async (data: TaskCreateParams): Promise<ApiResponse<TaskItem>> => {
  await delay(500)

  const project = mockProjects.find((p) => p.id === data.project_id)

  if (!project) {
    return {
      code: 404,
      message: '项目不存在',
      data: {} as TaskItem
    }
  }

  const newTask: TaskItem = {
    id: mockTasks.length + 1,
    ...data,
    progress: data.progress || 0,
    project_name: project.name,
    created_at: new Date().toISOString().split('T')[0]
  }

  mockTasks.push(newTask)

  return {
    code: 200,
    message: '任务创建成功',
    data: newTask
  }
}

// 更新任务
export const updateTask = async (
  id: number,
  data: TaskCreateParams
): Promise<ApiResponse<TaskItem>> => {
  await delay(400)

  const index = mockTasks.findIndex((t) => t.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '任务不存在',
      data: {} as TaskItem
    }
  }

  const project = mockProjects.find((p) => p.id === data.project_id)

  if (!project) {
    return {
      code: 404,
      message: '项目不存在',
      data: {} as TaskItem
    }
  }

  const updatedTask: TaskItem = {
    ...mockTasks[index],
    ...data,
    project_name: project.name
  }

  mockTasks[index] = updatedTask

  return {
    code: 200,
    message: '任务更新成功',
    data: updatedTask
  }
}

// 删除任务
export const deleteTask = async (id: number): Promise<ApiResponse<boolean>> => {
  await delay(300)

  const index = mockTasks.findIndex((t) => t.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '任务不存在',
      data: false
    }
  }

  mockTasks.splice(index, 1)

  return {
    code: 200,
    message: '任务删除成功',
    data: true
  }
}

// 完成任务
export const completeTask = async (id: number): Promise<ApiResponse<TaskItem>> => {
  await delay(400)

  const index = mockTasks.findIndex((t) => t.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '任务不存在',
      data: {} as TaskItem
    }
  }

  const completedTask: TaskItem = {
    ...mockTasks[index],
    status: 'completed',
    progress: 100
  }

  mockTasks[index] = completedTask

  return {
    code: 200,
    message: '任务完成成功',
    data: completedTask
  }
}

// 批量完成任务
export const batchCompleteTasks = async (ids: number[]): Promise<ApiResponse<boolean>> => {
  await delay(500)

  for (const id of ids) {
    const index = mockTasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      mockTasks[index] = {
        ...mockTasks[index],
        status: 'completed',
        progress: 100
      }
    }
  }

  return {
    code: 200,
    message: '批量完成任务成功',
    data: true
  }
}

// 批量删除任务
export const batchDeleteTasks = async (ids: number[]): Promise<ApiResponse<boolean>> => {
  await delay(500)

  for (const id of ids) {
    const index = mockTasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      mockTasks.splice(index, 1)
    }
  }

  return {
    code: 200,
    message: '批量删除任务成功',
    data: true
  }
}

/**
 * 财务相关API
 */

// 获取费用列表
export const getExpenseList = async (
  params: ExpenseListParams = {}
): Promise<ApiResponse<PaginationResponse<ExpenseItem>>> => {
  await delay(300)

  let filteredExpenses = [...mockExpenses]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredExpenses = filteredExpenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(keyword) ||
        expense.project_name.toLowerCase().includes(keyword)
    )
  }

  // 项目筛选
  if (params.project) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.project_name === params.project)
  }

  // 类型筛选
  if (params.type) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.type === params.type)
  }

  // 日期筛选
  if (params.start_date) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date >= params.start_date!)
  }

  if (params.end_date) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date <= params.end_date!)
  }

  // 分页
  const page = params.page || 1
  const page_size = params.page_size || 10
  const start = (page - 1) * page_size
  const end = start + page_size
  const paginatedExpenses = filteredExpenses.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: {
      data: paginatedExpenses,
      total: filteredExpenses.length,
      page,
      page_size,
      pages: Math.ceil(filteredExpenses.length / page_size)
    }
  }
}

// 获取费用详情
export const getExpenseDetail = async (id: number): Promise<ApiResponse<ExpenseItem>> => {
  await delay(200)

  const expense = mockExpenses.find((e) => e.id === id)

  if (!expense) {
    return {
      code: 404,
      message: '费用记录不存在',
      data: {} as ExpenseItem
    }
  }

  return {
    code: 200,
    message: 'success',
    data: expense
  }
}

// 创建费用
export const createExpense = async (
  data: ExpenseCreateParams
): Promise<ApiResponse<ExpenseItem>> => {
  await delay(500)

  // 处理金额：收入为正数，支出为负数
  const processedAmount = data.type === 'income' ? Math.abs(data.amount) : -Math.abs(data.amount)

  const newExpense: ExpenseItem = {
    id: mockExpenses.length + 1,
    ...data,
    amount: processedAmount,
    created_by: '当前用户' // 实际应该从登录状态获取
  }

  mockExpenses.push(newExpense)

  return {
    code: 200,
    message: '费用创建成功',
    data: newExpense
  }
}

// 更新费用
export const updateExpense = async (
  id: number,
  data: ExpenseCreateParams
): Promise<ApiResponse<ExpenseItem>> => {
  await delay(400)

  const index = mockExpenses.findIndex((e) => e.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '费用记录不存在',
      data: {} as ExpenseItem
    }
  }

  // 处理金额：收入为正数，支出为负数
  const processedAmount = data.type === 'income' ? Math.abs(data.amount) : -Math.abs(data.amount)

  const updatedExpense: ExpenseItem = {
    ...mockExpenses[index],
    ...data,
    amount: processedAmount
  }

  mockExpenses[index] = updatedExpense

  return {
    code: 200,
    message: '费用更新成功',
    data: updatedExpense
  }
}

// 删除费用
export const deleteExpense = async (id: number): Promise<ApiResponse<boolean>> => {
  await delay(300)

  const index = mockExpenses.findIndex((e) => e.id === id)

  if (index === -1) {
    return {
      code: 404,
      message: '费用记录不存在',
      data: false
    }
  }

  mockExpenses.splice(index, 1)

  return {
    code: 200,
    message: '费用删除成功',
    data: true
  }
}

// 获取财务统计
export const getFinanceStatistics = async (): Promise<ApiResponse<FinanceStatistics>> => {
  await delay(400)

  const totalIncome = mockExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpense = Math.abs(
    mockExpenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  )

  const netIncome = totalIncome - totalExpense

  // 按类别统计支出
  const expenseByCategory = [
    { category: '人力成本', amount: 200000, percentage: 45 },
    { category: '云服务', amount: 75000, percentage: 17 },
    { category: '硬件设备', amount: 80000, percentage: 18 },
    { category: '其他费用', amount: 85000, percentage: 20 }
  ]

  // 月度趋势
  const monthlyTrend = [
    { month: '2024-01', income: 450000, expense: 220000 },
    { month: '2024-02', income: 800000, expense: 372000 },
    { month: '2024-03', income: 0, expense: 0 },
    { month: '2024-04', income: 0, expense: 0 },
    { month: '2024-05', income: 0, expense: 0 },
    { month: '2024-06', income: 0, expense: 0 }
  ]

  return {
    code: 200,
    message: 'success',
    data: {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_income: netIncome,
      expense_by_category: expenseByCategory,
      monthly_trend: monthlyTrend
    }
  }
}
