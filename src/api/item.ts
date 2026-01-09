import { ProjectType, ProjectStatus, NodeStatus } from '../enums/itemEnum'
import type {
  Project,
  ProjectDetail,
  ProjectNode,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectListQuery,
  ProjectListResponse,
  UpdateTaskStatusParams,
  ProjectTemplate,
  TemplateCreateData,
  TemplateListResponse
} from '../types/api/item'
import type { BaseResponse } from '@/types/common/response'

// 模拟项目数据
const mockProjects: Project[] = [
  {
    id: 1,
    name: '每日学习自律打卡',
    code: 'PROJ-001',
    type: ProjectType.SELF,
    status: ProjectStatus.PROGRESS,
    progress: 68,
    startDate: '2025-12-01',
    endDate: '2026-01-01',
    budget: 50000,
    createTime: '2025-11-15',
    description: '每日完成前端知识点学习、刷题、笔记整理，坚持30天养成良好学习习惯。',
    coreTarget: '养成每日学习习惯，掌握前端核心知识点',
    acceptanceCriteria: ['每日完成学习任务', '通过学习测试', '整理学习笔记']
  },
  {
    id: 2,
    name: '企业官网前端重构',
    code: 'PROJ-002',
    type: ProjectType.FRONTEND,
    status: ProjectStatus.PROGRESS,
    progress: 45,
    startDate: '2025-11-15',
    endDate: '2026-01-15',
    budget: 150000,
    createTime: '2025-11-01',
    description: '使用Vue3 + Vite重构企业官网，优化页面加载速度，实现响应式布局和交互效果。',
    coreTarget: '提升官网性能，优化用户体验',
    acceptanceCriteria: ['页面加载速度提升50%', '适配移动端设备', '实现新的交互效果']
  },
  {
    id: 3,
    name: '用户管理系统后端搭建',
    code: 'PROJ-003',
    type: ProjectType.BACKEND,
    status: ProjectStatus.PENDING,
    progress: 0,
    startDate: '2026-01-05',
    endDate: '2026-02-05',
    budget: 80000,
    createTime: '2025-12-20',
    description:
      '使用Spring Boot + MyBatis-Plus搭建用户管理系统，实现用户注册、登录、权限控制等功能。',
    coreTarget: '搭建完整的用户管理系统后端',
    acceptanceCriteria: ['实现用户注册登录', '完成权限控制', '提供RESTful API接口']
  },
  {
    id: 4,
    name: '技术博客撰写计划',
    code: 'PROJ-004',
    type: ProjectType.WRITING,
    status: ProjectStatus.PROGRESS,
    progress: 32,
    startDate: '2025-11-01',
    endDate: '2026-02-01',
    budget: 30000,
    createTime: '2025-10-25',
    description:
      '每周撰写1篇前端技术博客，内容涵盖Vue3、Tailwind CSS、前端工程化等知识点，发布至掘金平台。',
    coreTarget: '每周发布一篇高质量技术博客',
    acceptanceCriteria: ['每周完成一篇博客', '文章质量符合要求', '发布至指定平台']
  },
  {
    id: 5,
    name: '产品推广文案策划',
    code: 'PROJ-005',
    type: ProjectType.COPY,
    status: ProjectStatus.COMPLETED,
    progress: 100,
    startDate: '2025-10-10',
    endDate: '2025-11-01',
    budget: 25000,
    createTime: '2025-09-28',
    description: '为新产品撰写推广文案，包括公众号推文、朋友圈文案、小红书笔记等，提升产品曝光度。',
    coreTarget: '完成新产品推广文案',
    acceptanceCriteria: ['完成所有推广文案', '符合品牌调性', '提升产品曝光度']
  },
  {
    id: 6,
    name: '前端教程视频制作',
    code: 'PROJ-006',
    type: ProjectType.VIDEO,
    status: ProjectStatus.PAUSED,
    progress: 15,
    startDate: '2025-12-15',
    endDate: '2026-03-15',
    budget: 120000,
    createTime: '2025-12-01',
    description: '制作Vue3基础教程视频，包括环境搭建、组件开发、路由配置等内容，适合初学者学习。',
    coreTarget: '制作Vue3基础教程视频系列',
    acceptanceCriteria: ['完成所有视频录制', '视频内容完整', '适合初学者学习']
  }
]

// 模拟项目节点数据
const mockProjectNodes: Record<number, ProjectNode[]> = {
  1: [
    {
      id: 1,
      title: '项目启动',
      description: '项目启动会议，确定项目目标、范围和关键干系人',
      date: '2025-12-01',
      status: NodeStatus.COMPLETED,
      priority: 'high',
      assignedTo: '项目经理',
      estimatedHours: 8,
      actualHours: 6,
      completionRate: 100,
      notes: '项目启动会议成功召开，所有关键决策已确定',
      tasks: [
        { id: 1, name: '确定项目目标', completed: true, priority: 'high' },
        { id: 2, name: '制定项目章程', completed: true, priority: 'high' },
        { id: 3, name: '组建项目团队', completed: true, priority: 'medium' }
      ]
    },
    {
      id: 2,
      title: '需求分析',
      description: '深入了解用户需求，编写需求规格说明书',
      date: '2025-12-05',
      status: NodeStatus.COMPLETED,
      priority: 'high',
      assignedTo: '产品经理',
      estimatedHours: 24,
      actualHours: 28,
      completionRate: 100,
      notes: '需求分析完成，用户反馈良好',
      tasks: [
        { id: 1, name: '用户访谈', completed: true, priority: 'high' },
        { id: 2, name: '需求收集', completed: true, priority: 'high' },
        { id: 3, name: '需求分析', completed: true, priority: 'high' },
        { id: 4, name: '编写需求文档', completed: true, priority: 'medium' }
      ]
    },
    {
      id: 3,
      title: '系统设计',
      description: '架构设计、数据库设计、接口设计',
      date: '2025-12-10',
      status: NodeStatus.COMPLETED,
      priority: 'high',
      assignedTo: '架构师',
      estimatedHours: 32,
      actualHours: 30,
      completionRate: 100,
      notes: '系统设计评审通过，技术方案确认',
      tasks: [
        { id: 1, name: '架构设计', completed: true, priority: 'high' },
        { id: 2, name: '数据库设计', completed: true, priority: 'high' },
        { id: 3, name: '接口设计', completed: true, priority: 'medium' },
        { id: 4, name: '技术选型', completed: true, priority: 'medium' }
      ]
    },
    {
      id: 4,
      title: '前端开发',
      description: '用户界面开发，组件库搭建，页面实现',
      date: '2025-12-15',
      status: NodeStatus.IN_PROGRESS,
      priority: 'high',
      assignedTo: '前端团队',
      estimatedHours: 80,
      actualHours: 45,
      progress: 56,
      notes: 'UI界面开发进展顺利，组件库基本完成',
      tasks: [
        { id: 1, name: '搭建开发环境', completed: true, priority: 'high' },
        { id: 2, name: '组件库开发', completed: true, priority: 'high' },
        { id: 3, name: '页面布局开发', completed: true, priority: 'medium' },
        { id: 4, name: '交互功能实现', completed: false, priority: 'high' },
        { id: 5, name: '响应式适配', completed: false, priority: 'medium' },
        { id: 6, name: '性能优化', completed: false, priority: 'low' }
      ]
    },
    {
      id: 5,
      title: '后端开发',
      description: 'API接口开发，业务逻辑实现，数据库实现',
      date: '2025-12-18',
      status: NodeStatus.IN_PROGRESS,
      priority: 'high',
      assignedTo: '后端团队',
      estimatedHours: 96,
      actualHours: 38,
      progress: 40,
      notes: '核心API开发中，数据库结构已建立',
      tasks: [
        { id: 1, name: '数据库建模', completed: true, priority: 'high' },
        { id: 2, name: '基础框架搭建', completed: true, priority: 'high' },
        { id: 3, name: '用户管理模块', completed: true, priority: 'high' },
        { id: 4, name: '业务逻辑开发', completed: false, priority: 'high' },
        { id: 5, name: 'API接口开发', completed: false, priority: 'medium' },
        { id: 6, name: '安全性实现', completed: false, priority: 'medium' }
      ]
    },
    {
      id: 6,
      title: '系统测试',
      description: '功能测试、性能测试、安全测试',
      date: '2025-12-25',
      status: NodeStatus.PENDING,
      priority: 'medium',
      assignedTo: '测试团队',
      estimatedHours: 48,
      tasks: [
        { id: 1, name: '功能测试', completed: false, priority: 'high' },
        { id: 2, name: '性能测试', completed: false, priority: 'medium' },
        { id: 3, name: '安全测试', completed: false, priority: 'high' },
        { id: 4, name: '兼容性测试', completed: false, priority: 'low' }
      ]
    },
    {
      id: 7,
      title: '部署上线',
      description: '生产环境部署，系统上线，用户培训',
      date: '2026-01-01',
      status: NodeStatus.PENDING,
      priority: 'high',
      assignedTo: '运维团队',
      estimatedHours: 16,
      tasks: [
        { id: 1, name: '生产环境准备', completed: false, priority: 'high' },
        { id: 2, name: '系统部署', completed: false, priority: 'high' },
        { id: 3, name: '数据迁移', completed: false, priority: 'high' },
        { id: 4, name: '用户培训', completed: false, priority: 'medium' }
      ]
    }
  ]
}

/**
 * 项目管理API接口
 */
export const projectApi = {
  /**
   * 获取项目列表
   * @param params 查询参数
   */
  getProjectList: (params?: ProjectListQuery): Promise<ProjectListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProjects = [...mockProjects]

        // 应用筛选条件
        if (params?.type) {
          filteredProjects = filteredProjects.filter((project) => project.type === params.type)
        }

        if (params?.status) {
          filteredProjects = filteredProjects.filter((project) => project.status === params.status)
        }

        if (params?.keyword) {
          const keyword = params.keyword.toLowerCase()
          filteredProjects = filteredProjects.filter(
            (project) =>
              project.name.toLowerCase().includes(keyword) ||
              project.description.toLowerCase().includes(keyword)
          )
        }

        // 应用分页
        const page = params?.page || 1
        const pageSize = params?.pageSize || 10
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedProjects = filteredProjects.slice(start, end)

        resolve({
          list: paginatedProjects,
          total: filteredProjects.length,
          page,
          pageSize
        })
      }, 500)
    })
  },

  /**
   * 获取项目详情
   * @param id 项目ID
   */
  getProjectDetail: (id: number): Promise<ProjectDetail> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const project = mockProjects.find((p) => p.id === id)
        if (project) {
          const nodes = mockProjectNodes[id] || []
          resolve({
            ...project,
            nodes
          })
        } else {
          reject(new Error('项目不存在'))
        }
      }, 800)
    })
  },

  /**
   * 创建项目
   * @param data 项目数据
   */
  createProject: (data: ProjectCreateData): Promise<BaseResponse<Project>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProject: Project = {
          id: mockProjects.length + 1,
          name: data.name,
          code: data.code || `PROJ-${String(mockProjects.length + 1).padStart(3, '0')}`,
          type: data.type,
          status: data.status || ProjectStatus.PENDING,
          progress: data.progress || 0,
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          createTime: new Date().toISOString().split('T')[0],
          description: data.description || '',
          coreTarget: data.coreTarget || '',
          acceptanceCriteria: data.acceptanceCriteria || []
        }

        mockProjects.push(newProject)

        if (data.nodes) {
          mockProjectNodes[newProject.id] = data.nodes
        }

        resolve({
          code: 200,
          msg: '创建成功',
          data: newProject
        })
      }, 800)
    })
  },

  /**
   * 更新项目
   * @param id 项目ID
   * @param data 项目数据
   */
  updateProject: (id: number, data: ProjectUpdateData): Promise<BaseResponse<Project>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProjects.findIndex((p) => p.id === id)
        if (index !== -1) {
          const updatedProject = {
            ...mockProjects[index],
            ...data
          }

          mockProjects[index] = updatedProject

          if (data.nodes) {
            mockProjectNodes[id] = data.nodes
          }

          resolve({
            code: 200,
            msg: '更新成功',
            data: updatedProject
          })
        } else {
          reject(new Error('项目不存在'))
        }
      }, 800)
    })
  },

  /**
   * 删除项目
   * @param id 项目ID
   */
  deleteProject: (id: number): Promise<BaseResponse<any>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProjects.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockProjects.splice(index, 1)
          delete mockProjectNodes[id]

          resolve({
            code: 200,
            msg: '删除成功',
            data: {}
          })
        } else {
          reject(new Error('项目不存在'))
        }
      }, 500)
    })
  },

  /**
   * 批量删除项目
   * @param ids 项目ID数组
   */
  batchDeleteProjects: (ids: number[]): Promise<BaseResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        ids.forEach((id) => {
          const index = mockProjects.findIndex((p) => p.id === id)
          if (index !== -1) {
            mockProjects.splice(index, 1)
            delete mockProjectNodes[id]
          }
        })

        resolve({
          code: 200,
          msg: '批量删除成功',
          data: {}
        })
      }, 500)
    })
  },

  /**
   * 更新任务状态
   * @param params 更新参数
   */
  updateTaskStatus: (params: UpdateTaskStatusParams): Promise<BaseResponse<ProjectNode>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const projectId = 1 // 假设当前只有一个项目
        const nodes = mockProjectNodes[projectId]

        if (nodes) {
          const node = nodes.find((n) => n.id === params.nodeId)
          if (node && node.tasks) {
            const task = node.tasks.find((t) => t.id === params.taskId)
            if (task) {
              task.completed = params.completed

              // 更新节点进度
              const completedTasks = node.tasks.filter((t) => t.completed).length
              const totalTasks = node.tasks.length
              node.progress = Math.round((completedTasks / totalTasks) * 100)

              // 更新项目进度
              const project = mockProjects.find((p) => p.id === projectId)
              if (project) {
                const totalNodes = nodes.length

                let totalProgress = 0
                nodes.forEach((n) => {
                  if (n.status === NodeStatus.COMPLETED) {
                    totalProgress += 100
                  } else if (n.status === NodeStatus.IN_PROGRESS) {
                    totalProgress += n.progress || 0
                  }
                })

                project.progress = Math.round(totalProgress / totalNodes)
              }

              resolve({
                code: 200,
                msg: '任务状态更新成功',
                data: node
              })
            } else {
              reject(new Error('任务不存在'))
            }
          } else {
            reject(new Error('节点不存在'))
          }
        } else {
          reject(new Error('项目不存在'))
        }
      }, 300)
    })
  },

  /**
   * 导出项目报告
   */
  exportProjectReport: (): Promise<BaseResponse<{ url: string }>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          msg: '导出成功',
          data: {
            url: 'https://example.com/report.pdf' // 模拟导出URL
          }
        })
      }, 1000)
    })
  },

  /**
   * 创建项目节点
   * @param data 节点数据
   */
  createNode: (data: any): Promise<BaseResponse<ProjectNode>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projectId = data.projectId
        if (!mockProjectNodes[projectId]) {
          mockProjectNodes[projectId] = []
        }

        const newNode: ProjectNode = {
          id: Date.now(), // 临时ID
          title: data.title,
          description: data.description,
          date: data.date,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo || '',
          estimatedHours: 0,
          actualHours: 0,
          progress: data.progress,
          notes: '',
          tasks: data.nodeTask
            ? data.nodeTask.map((task: string, index: number) => ({
                id: index + 1,
                name: task,
                description: task,
                completed: false
              }))
            : []
        }

        mockProjectNodes[projectId].push(newNode)

        resolve({
          code: 200,
          msg: '节点创建成功',
          data: newNode
        })
      }, 500)
    })
  },

  /**
   * 更新项目节点
   * @param id 节点ID
   * @param data 节点数据
   */
  updateNode: (id: number, data: any): Promise<BaseResponse<ProjectNode>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 遍历所有项目的节点查找匹配ID
        let updatedNode: ProjectNode | undefined

        for (const projectId in mockProjectNodes) {
          const nodes = mockProjectNodes[projectId]
          const index = nodes.findIndex((node) => node.id === id)

          if (index !== -1) {
            // 更新节点数据
            updatedNode = {
              ...nodes[index],
              ...data,
              tasks: data.tasks.map((task: any, index: number) => ({
                id: task.id || index + 1,
                name: task.name,
                description: task.description,
                completed: task.completed || false
              }))
            }

            nodes[index] = updatedNode as ProjectNode
            break
          }
        }

        if (updatedNode) {
          resolve({
            code: 200,
            msg: '节点更新成功',
            data: updatedNode
          })
        } else {
          reject(new Error('节点不存在'))
        }
      }, 500)
    })
  },

  /**
   * 获取项目模板列表
   * @param params 查询参数
   */
  getTemplateList: (params?: any): Promise<TemplateListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTemplates = [...mockTemplates]

        // 应用筛选条件
        if (params?.type) {
          filteredTemplates = filteredTemplates.filter((template) => template.type === params.type)
        }

        if (params?.keyword) {
          const keyword = params.keyword.toLowerCase()
          filteredTemplates = filteredTemplates.filter(
            (template) =>
              template.name.toLowerCase().includes(keyword) ||
              (template.description && template.description.toLowerCase().includes(keyword))
          )
        }

        // 应用分页
        const page = params?.page || 1
        const pageSize = params?.pageSize || 10
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedTemplates = filteredTemplates.slice(start, end)

        resolve({
          list: paginatedTemplates,
          total: filteredTemplates.length,
          page,
          pageSize
        })
      }, 500)
    })
  },

  /**
   * 创建项目模板
   * @param data 模板数据
   */
  createTemplate: (data: TemplateCreateData): Promise<BaseResponse<ProjectTemplate>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate: ProjectTemplate = {
          id: mockTemplates.length + 1,
          name: data.name,
          type: data.type,
          description: data.description || '',
          creatorId: 1, // 模拟创建者ID
          creatorName: '当前用户', // 模拟创建者名称
          createTime: new Date().toISOString().split('T')[0],
          projectData: data.projectData
        }

        mockTemplates.push(newTemplate)

        resolve({
          code: 200,
          msg: '模板创建成功',
          data: newTemplate
        })
      }, 800)
    })
  },

  /**
   * 使用模板创建项目
   * @param templateId 模板ID
   * @param data 项目数据
   */
  createProjectFromTemplate: (
    templateId: number,
    data: Partial<ProjectCreateData>
  ): Promise<BaseResponse<Project>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = mockTemplates.find((t) => t.id === templateId)
        if (!template) {
          reject(new Error('模板不存在'))
          return
        }

        // 基于模板数据创建新项目
        const newProject: Project = {
          id: mockProjects.length + 1,
          name: data.name || template.projectData.name,
          code: data.code || `PROJ-${String(mockProjects.length + 1).padStart(3, '0')}`,
          type: data.type || template.type,
          status: data.status || ProjectStatus.PENDING,
          progress: data.progress || 0,
          startDate: data.startDate || template.projectData.startDate,
          endDate: data.endDate || template.projectData.endDate,
          budget: data.budget || template.projectData.budget || 0,
          createTime: new Date().toISOString().split('T')[0],
          description: data.description || template.projectData.description,
          coreTarget: data.coreTarget || template.projectData.coreTarget,
          acceptanceCriteria:
            data.acceptanceCriteria || template.projectData.acceptanceCriteria || []
        }

        mockProjects.push(newProject)

        // 如果模板包含节点数据，复制到新项目
        if (template.projectData.nodes) {
          mockProjectNodes[newProject.id] = template.projectData.nodes.map((node, index) => ({
            ...node,
            id: index + 1,
            date: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : ''
          }))
        }

        resolve({
          code: 200,
          msg: '项目创建成功',
          data: newProject
        })
      }, 800)
    })
  },

  /**
   * 提交任务成果
   * @param taskId 任务ID
   * @param data 成果数据
   */
  submitTaskResult: (
    taskId: number,
    data: { content: string; files?: File[] }
  ): Promise<BaseResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟提交任务成果的逻辑
        console.log('提交任务成果:', taskId, data)

        // 这里可以添加更新项目节点进度的逻辑
        resolve({
          code: 200,
          msg: '任务成果提交成功',
          data: {}
        })
      }, 800)
    })
  }
}

// 模拟项目模板数据
const mockTemplates: ProjectTemplate[] = [
  {
    id: 1,
    name: '前端开发项目模板',
    type: ProjectType.FRONTEND,
    description: '前端开发项目的标准模板，包含常用的项目节点和任务结构',
    creatorId: 1,
    creatorName: '管理员',
    createTime: '2025-11-20',
    projectData: {
      name: '',
      code: '',
      type: ProjectType.FRONTEND,
      status: ProjectStatus.PENDING,
      progress: 0,
      startDate: '',
      endDate: '',
      budget: 0,
      description: '',
      coreTarget: '完成前端开发任务',
      acceptanceCriteria: ['功能完整实现', '符合设计要求', '通过测试验收'],
      nodes: [
        {
          id: 1,
          title: '需求分析',
          description: '分析项目需求，确定开发范围',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'high',
          assignedTo: '',
          estimatedHours: 24,
          tasks: [
            { id: 1, name: '需求收集', completed: false, priority: 'high' },
            { id: 2, name: '需求分析', completed: false, priority: 'high' },
            { id: 3, name: '编写需求文档', completed: false, priority: 'medium' }
          ]
        },
        {
          id: 2,
          title: '设计与开发',
          description: 'UI设计和前端开发',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'high',
          assignedTo: '',
          estimatedHours: 80,
          tasks: [
            { id: 1, name: 'UI设计', completed: false, priority: 'high' },
            { id: 2, name: '前端开发', completed: false, priority: 'high' },
            { id: 3, name: '接口联调', completed: false, priority: 'medium' }
          ]
        },
        {
          id: 3,
          title: '测试与上线',
          description: '系统测试和上线部署',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'high',
          assignedTo: '',
          estimatedHours: 40,
          tasks: [
            { id: 1, name: '功能测试', completed: false, priority: 'high' },
            { id: 2, name: '性能测试', completed: false, priority: 'medium' },
            { id: 3, name: '上线部署', completed: false, priority: 'high' }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    name: '学习计划模板',
    type: ProjectType.SELF,
    description: '个人学习计划的标准模板，包含学习阶段和任务安排',
    creatorId: 2,
    creatorName: '张三',
    createTime: '2025-11-25',
    projectData: {
      name: '',
      code: '',
      type: ProjectType.SELF,
      status: ProjectStatus.PENDING,
      progress: 0,
      startDate: '',
      endDate: '',
      budget: 0,
      description: '',
      coreTarget: '完成学习计划，掌握相关知识',
      acceptanceCriteria: ['完成所有学习任务', '通过学习测试', '整理学习笔记'],
      nodes: [
        {
          id: 1,
          title: '预习阶段',
          description: '预习相关知识点',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'medium',
          assignedTo: '',
          estimatedHours: 16,
          tasks: [
            { id: 1, name: '阅读教材', completed: false, priority: 'medium' },
            { id: 2, name: '观看视频教程', completed: false, priority: 'medium' },
            { id: 3, name: '整理知识点', completed: false, priority: 'low' }
          ]
        },
        {
          id: 2,
          title: '学习阶段',
          description: '深入学习核心知识点',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'high',
          assignedTo: '',
          estimatedHours: 40,
          tasks: [
            { id: 1, name: '完成练习', completed: false, priority: 'high' },
            { id: 2, name: '参与讨论', completed: false, priority: 'medium' },
            { id: 3, name: '解决问题', completed: false, priority: 'high' }
          ]
        },
        {
          id: 3,
          title: '复习与总结',
          description: '复习和总结学习内容',
          date: '',
          status: NodeStatus.PENDING,
          priority: 'medium',
          assignedTo: '',
          estimatedHours: 24,
          tasks: [
            { id: 1, name: '复习知识点', completed: false, priority: 'medium' },
            { id: 2, name: '完成测试', completed: false, priority: 'high' },
            { id: 3, name: '撰写总结', completed: false, priority: 'medium' }
          ]
        }
      ]
    }
  }
]
