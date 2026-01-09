/**
 * 开发项目配置
 */
export interface DevProjectConfig {
  frontFramework: string
  backFramework: string
  database: string
  dailyHours: number
  codeRepo: string
}

/**
 * 打卡项目配置
 */
export interface CheckinProjectConfig {
  cycle: string
  timeWindow: string[]
  recheckinCount: number
  dimensionCount: string
  dimensions: { name: string; requirement: string }[]
}

/**
 * 写作项目配置
 */
export interface WriteProjectConfig {
  type: string
  targetWords: number
  dailyWords: number
  expectedDays: number
  publishPlatforms: string[]
}

/**
 * 视频项目配置
 */
export interface VideoProjectConfig {
  type: string
  duration: number
  count: number
  equipmentType: string
  editingSoftware: string
  publishPlatforms: string[]
}

/**
 * 设计项目配置
 */
export interface DesignProjectConfig {
  type: string
  software: string
  deliverableCount: number
  spec: string
}

/**
 * 学习项目配置
 */
export interface LearningProjectConfig {
  field: string
  method: string
  targetCertificate: string
  dailyHours: number
  expectedMonths: number
  resources: string[]
}

/**
 * 项目类型定义
 */
export interface Project {
  id: number
  name: string
  code: string
  type: string
  status: string
  progress: number
  startDate: string
  endDate: string
  budget: number
  createTime: string
  description: string
  coreTarget: string
  acceptanceCriteria: string[]
  customAcceptance?: string
  dev?: DevProjectConfig
  checkin?: CheckinProjectConfig
  write?: WriteProjectConfig
  video?: VideoProjectConfig
  design?: DesignProjectConfig
  learning?: LearningProjectConfig
  nodes?: ProjectNode[]
}

/**
 * 项目任务定义
 */
export interface ProjectTask {
  id: number
  name: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

/**
 * 项目节点定义
 */
export interface ProjectNode {
  id: number
  title: string
  description: string
  date: string
  status: 'completed' | 'in_progress' | 'pending' | 'delayed'
  priority: 'high' | 'medium' | 'low'
  assignedTo: string
  estimatedHours: number
  actualHours?: number
  completionRate?: number
  progress?: number
  notes?: string
  tasks?: ProjectTask[]
}

/**
 * 项目详情定义
 */
export interface ProjectDetail extends Project {
  nodes?: ProjectNode[]
}

/**
 * 项目列表项定义
 */
export type ProjectListItem = Project

/**
 * 创建项目的数据结构
 */
export interface ProjectCreateData {
  name: string
  code: string
  type: string
  status: string
  progress: number
  startDate: string
  endDate: string
  budget: number
  description: string
  coreTarget: string
  acceptanceCriteria: string[]
  customAcceptance?: string
  nodes?: ProjectNode[]
  dev?: DevProjectConfig
  checkin?: CheckinProjectConfig
  write?: WriteProjectConfig
  video?: VideoProjectConfig
  design?: DesignProjectConfig
  learning?: LearningProjectConfig
}

/**
 * 更新项目的数据结构
 */
export interface ProjectUpdateData {
  name?: string
  code?: string
  type?: string
  status?: string
  progress?: number
  startDate?: string
  endDate?: string
  budget?: number
  description?: string
  coreTarget?: string
  acceptanceCriteria?: string[]
  customAcceptance?: string
  nodes?: ProjectNode[]
  dev?: DevProjectConfig
  checkin?: CheckinProjectConfig
  write?: WriteProjectConfig
  video?: VideoProjectConfig
  design?: DesignProjectConfig
  learning?: LearningProjectConfig
}

/**
 * 项目列表查询参数
 */
export interface ProjectListQuery {
  page?: number
  pageSize?: number
  type?: string
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

/**
 * 项目列表响应
 */
export interface ProjectListResponse {
  list: ProjectListItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 更新任务状态的参数
 */
export interface UpdateTaskStatusParams {
  nodeId: number
  taskId: number
  completed: boolean
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending'
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PENDING = 'pending',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

/**
 * 项目类型枚举
 */
export enum ProjectType {
  SELF = 'self',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  WRITING = 'writing',
  COPY = 'copy',
  VIDEO = 'video'
}

/**
 * 项目模板定义
 */
export interface ProjectTemplate {
  id: number
  name: string
  type: string
  description?: string
  creatorId: number
  creatorName: string
  createTime: string
  projectData: Omit<Project, 'id' | 'createTime'>
}

/**
 * 创建模板的数据结构
 */
export interface TemplateCreateData {
  name: string
  description?: string
  type: string
  projectData: Omit<Project, 'id' | 'createTime'>
}

/**
 * 模板列表查询参数
 */
export interface TemplateListQuery {
  page?: number
  pageSize?: number
  projectType?: string
  keyword?: string
}

/**
 * 模板列表响应
 */
export interface TemplateListResponse {
  list: ProjectTemplate[]
  total: number
  page: number
  pageSize: number
}
