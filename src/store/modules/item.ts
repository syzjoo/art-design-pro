/**
 * 项目管理状态管理模块
 *
 * 提供完整的项目管理状态管理
 *
 * ## 主要功能
 *
 * - 项目列表管理
 * - 项目详情存储
 * - 项目节点管理
 * - 项目创建和更新
 * - 项目删除和恢复
 * - 数据持久化
 *
 * ## 使用场景
 *
 * - 项目列表页面数据管理
 * - 项目详情页面数据管理
 * - 项目创建和编辑流程
 * - 项目节点和任务管理
 *
 * ## 持久化
 *
 * - 使用 localStorage 存储
 * - 存储键：sys-v{version}-item
 * - 支持跨版本数据迁移
 *
 * @module store/modules/item
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ProjectType, ProjectStatus, NodeStatus } from '@/enums/itemEnum'
import type {
  Project,
  ProjectDetail,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectTemplate,
  TemplateCreateData,
  ProjectListResponse,
  ProjectListQuery
} from '@/types/api/item'
import { projectApi } from '@/api/item'

/**
 * 项目管理状态管理
 * 管理应用的项目列表、项目详情、项目节点等状态
 */
export const useItemStore = defineStore(
  'itemStore',
  () => {
    // 项目列表
    const projectList = ref<Project[]>([])
    // 项目模板列表
    const templateList = ref<ProjectTemplate[]>([])
    // 当前项目详情
    const currentProject = ref<ProjectDetail | null>(null)
    // 加载状态
    const isLoading = ref(false)
    // 错误信息
    const error = ref<string | null>(null)

    /**
     * 获取项目列表
     */
    const getProjectList = async (params?: ProjectListQuery): Promise<ProjectListResponse> => {
      isLoading.value = true
      try {
        const response = await projectApi.getProjectList(params)
        projectList.value = response.list
        return response
      } catch (err) {
        error.value = (err as Error).message
        return { list: [], total: 0, page: 1, pageSize: 10 }
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 获取项目详情
     */
    const getProjectDetail = async (id: number) => {
      isLoading.value = true
      try {
        const response = await projectApi.getProjectDetail(id)
        currentProject.value = response
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 创建项目
     */
    const createProject = async (data: ProjectCreateData) => {
      isLoading.value = true
      try {
        const response = await projectApi.createProject(data)
        // 更新项目列表
        await getProjectList()
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 更新项目
     */
    const updateProject = async (id: number, data: ProjectUpdateData) => {
      isLoading.value = true
      try {
        const response = await projectApi.updateProject(id, data)
        // 更新项目列表
        await getProjectList()
        // 更新当前项目详情
        if (currentProject.value && currentProject.value.id === id) {
          await getProjectDetail(id)
        }
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 删除项目
     */
    const deleteProject = async (id: number) => {
      isLoading.value = true
      try {
        const response = await projectApi.deleteProject(id)
        // 更新项目列表
        await getProjectList()
        // 清除当前项目详情如果是被删除的项目
        if (currentProject.value && currentProject.value.id === id) {
          currentProject.value = null
        }
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 更新项目节点状态
     */
    const updateNodeStatus = async (projectId: number, nodeId: number, status: NodeStatus) => {
      isLoading.value = true
      try {
        const response = await projectApi.updateNode(nodeId, { status })
        // 更新当前项目详情
        if (currentProject.value && currentProject.value.id === projectId) {
          await getProjectDetail(projectId)
        }
        // 更新项目列表（进度可能变化）
        await getProjectList()
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 更新任务状态
     */
    const updateTaskStatus = async (params: any) => {
      isLoading.value = true
      try {
        const response = await projectApi.updateTaskStatus(params)
        // 更新当前项目详情
        if (currentProject.value) {
          await getProjectDetail(currentProject.value.id)
        }
        // 更新项目列表（进度可能变化）
        await getProjectList()
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 计算属性：按状态分组的项目数量
     */
    const projectCountByStatus = computed(() => {
      const counts: Record<string, number> = {} as Record<string, number>

      // 初始化所有状态的计数为0
      Object.values(ProjectStatus).forEach((status) => {
        counts[status] = 0
      })

      // 统计每个状态的项目数量
      projectList.value.forEach((project) => {
        counts[project.status]++
      })

      return counts
    })

    /**
     * 计算属性：按类型分组的项目数量
     */
    const projectCountByType = computed(() => {
      const counts: Record<string, number> = {} as Record<string, number>

      // 初始化所有类型的计数为0
      Object.values(ProjectType).forEach((type) => {
        counts[type] = 0
      })

      // 统计每个类型的项目数量
      projectList.value.forEach((project) => {
        counts[project.type]++
      })

      return counts
    })

    /**
     * 计算属性：总项目数
     */
    const totalProjects = computed(() => projectList.value.length)

    /**
     * 计算属性：进行中的项目数
     */
    const inProgressProjects = computed(
      () => projectList.value.filter((project) => project.status === ProjectStatus.PROGRESS).length
    )

    /**
     * 计算属性：已完成的项目数
     */
    const completedProjects = computed(
      () => projectList.value.filter((project) => project.status === ProjectStatus.COMPLETED).length
    )

    /**
     * 获取项目模板列表
     */
    const getTemplateList = async (params?: any) => {
      isLoading.value = true
      try {
        const response = await projectApi.getTemplateList(params)
        templateList.value = response.list
        return response
      } catch (err) {
        error.value = (err as Error).message
        return { items: [], total: 0 }
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 创建项目模板
     */
    const createTemplate = async (data: TemplateCreateData) => {
      isLoading.value = true
      try {
        const response = await projectApi.createTemplate(data)
        // 更新模板列表
        await getTemplateList()
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 使用模板创建项目
     */
    const createProjectFromTemplate = async (
      templateId: number,
      data: Partial<ProjectCreateData>
    ) => {
      isLoading.value = true
      try {
        const response = await projectApi.createProjectFromTemplate(templateId, data)
        // 更新项目列表
        await getProjectList()
        return response
      } catch (err) {
        error.value = (err as Error).message
        return null
      } finally {
        isLoading.value = false
      }
    }

    return {
      // 状态
      projectList,
      templateList,
      currentProject,
      isLoading,
      error,

      // 计算属性
      projectCountByStatus,
      projectCountByType,
      totalProjects,
      inProgressProjects,
      completedProjects,

      // 方法
      getProjectList,
      getProjectDetail,
      createProject,
      updateProject,
      deleteProject,
      updateNodeStatus,
      updateTaskStatus,
      getTemplateList,
      createTemplate,
      createProjectFromTemplate
    }
  },
  {
    persist: {
      key: 'item',
      storage: localStorage
    }
  }
)
