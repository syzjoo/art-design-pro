<template>
  <div class="project-detail-page">
    <div class="mb-5">
      <div class="art-card p-5">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold">{{ projectData.name }}</h2>
            <p class="text-g-600 mt-2">{{ projectData.description }}</p>
          </div>
          <div class="flex gap-2">
            <el-tag :type="getStatusType(projectData.status)" class="text-lg px-4 py-2">
              {{ getStatusText(projectData.status) }}
            </el-tag>
            <el-tag :type="getPriorityType(projectData.priority)" class="text-lg px-4 py-2">
              {{ getPriorityText(projectData.priority) }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <ElRow :gutter="20" class="mt-4">
          <ElCol :span="6">
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-full bg-primary/10 flex-cc">
                <el-icon class="text-xl text-primary"><User /></el-icon>
              </div>
              <div>
                <div class="text-sm text-g-600">项目经理</div>
                <div class="font-medium">{{ getManagerName(projectData.manager) }}</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-full bg-success/10 flex-cc">
                <el-icon class="text-xl text-success"><Calendar /></el-icon>
              </div>
              <div>
                <div class="text-sm text-g-600">开始日期</div>
                <div class="font-medium">{{ projectData.start_date }}</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-full bg-warning/10 flex-cc">
                <el-icon class="text-xl text-warning"><Calendar /></el-icon>
              </div>
              <div>
                <div class="text-sm text-g-600">结束日期</div>
                <div class="font-medium">{{ projectData.end_date }}</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-full bg-info/10 flex-cc">
                <el-icon class="text-xl text-info"><User /></el-icon>
              </div>
              <div>
                <div class="text-sm text-g-600">团队成员</div>
                <div class="font-medium">{{ projectData.member_count }} 人</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :span="12">
        <div class="art-card p-5">
          <div class="text-lg font-medium mb-4">项目进度</div>
          <div class="text-center mb-4">
            <el-progress
              :percentage="projectData.progress"
              :color="getProgressColor(projectData.progress)"
              :stroke-width="24"
            />
            <div class="text-3xl font-bold mt-3">{{ projectData.progress }}%</div>
          </div>
          <div class="flex justify-between mt-4">
            <div>
              <div class="text-sm text-g-600">总任务数</div>
              <div class="text-xl font-medium">{{ projectData.total_tasks }}</div>
            </div>
            <div>
              <div class="text-sm text-g-600">已完成</div>
              <div class="text-xl font-medium text-success">{{ projectData.completed_tasks }}</div>
            </div>
            <div>
              <div class="text-sm text-g-600">进行中</div>
              <div class="text-xl font-medium text-primary">{{ projectData.active_tasks }}</div>
            </div>
            <div>
              <div class="text-sm text-g-600">逾期</div>
              <div class="text-xl font-medium text-danger">{{ projectData.overdue_tasks }}</div>
            </div>
          </div>
        </div>
      </ElCol>
      <ElCol :span="12">
        <div class="art-card p-5">
          <div class="text-lg font-medium mb-4">预算管理</div>
          <div class="flex justify-between items-center mb-4">
            <div>
              <div class="text-sm text-g-600">总预算</div>
              <div class="text-2xl font-bold">¥{{ formatNumber(projectData.budget) }}</div>
            </div>
            <div>
              <div class="text-sm text-g-600">已支出</div>
              <div class="text-2xl font-bold text-primary"
                >¥{{ formatNumber(projectData.actual_cost) }}</div
              >
            </div>
            <div>
              <div class="text-sm text-g-600">剩余预算</div>
              <div class="text-2xl font-bold text-success"
                >¥{{ formatNumber(projectData.budget - projectData.actual_cost) }}</div
              >
            </div>
          </div>
          <el-progress
            :percentage="(projectData.actual_cost / projectData.budget) * 100"
            :color="getBudgetColor(projectData.actual_cost, projectData.budget)"
            :stroke-width="24"
          />
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :span="12">
        <div class="art-card p-5">
          <div class="text-lg font-medium mb-4">项目团队</div>
          <div class="space-y-3">
            <div
              v-for="member in projectTeam"
              :key="member.id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <el-avatar :size="48" :src="member.avatar">{{ member.name.charAt(0) }}</el-avatar>
              <div class="flex-1">
                <div class="font-medium">{{ member.name }}</div>
                <div class="text-sm text-g-600">{{ member.role }}</div>
              </div>
              <el-tag type="info">{{ member.status }}</el-tag>
            </div>
          </div>
        </div>
      </ElCol>
      <ElCol :span="12">
        <div class="art-card p-5">
          <div class="text-lg font-medium mb-4">项目里程碑</div>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in projectMilestones"
              :key="milestone.id"
              :timestamp="milestone.date"
              :type="milestone.completed ? 'success' : 'primary'"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{{ milestone.name }}</div>
                  <div class="text-sm text-g-600 mt-1">{{ milestone.description }}</div>
                </div>
                <el-tag v-if="milestone.completed" type="success">已完成</el-tag>
                <el-tag v-else type="warning">未完成</el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </ElCol>
    </ElRow>

    <div class="art-card p-5">
      <div class="text-lg font-medium mb-4">项目文件</div>
      <el-upload
        action="/api/upload"
        :on-preview="handleFilePreview"
        :on-remove="handleFileRemove"
        :file-list="projectFiles"
        list-type="text"
        class="upload-demo"
      >
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          上传文件
        </el-button>
      </el-upload>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { User, Calendar, Plus } from '@element-plus/icons-vue'
  import type { ProjectDetailResponse, ProjectStatus, ProjectPriority } from '@/types/api/project'

  defineOptions({ name: 'ProjectDetail' })

  const route = useRoute()
  const projectId = computed(() => route.params.id)

  type ProjectData = ProjectDetailResponse

  interface TeamMember {
    id: number
    name: string
    role: string
    avatar: string
    status: string
  }

  interface Milestone {
    id: number
    name: string
    description: string
    date: string
    completed: boolean
  }

  const projectList = reactive<ProjectData[]>([
    {
      id: 1,
      name: '电商平台重构',
      description: '使用Vue3重构现有电商平台，提升用户体验和系统性能',
      status: 'active',
      priority: 'high',
      progress: 75,
      manager: 'zhang',
      start_date: '2024-01-15',
      end_date: '2024-06-30',
      budget: 500000,
      actual_cost: 350000,
      member_count: 8,
      total_tasks: 120,
      completed_tasks: 90,
      active_tasks: 25,
      overdue_tasks: 5,
      created_at: '2024-01-10'
    },
    {
      id: 2,
      name: '移动应用开发',
      description: '开发跨平台移动应用，支持iOS和Android系统',
      status: 'active',
      priority: 'medium',
      progress: 45,
      manager: 'li',
      start_date: '2024-02-01',
      end_date: '2024-08-15',
      budget: 800000,
      actual_cost: 200000,
      member_count: 12,
      total_tasks: 150,
      completed_tasks: 68,
      active_tasks: 75,
      overdue_tasks: 7,
      created_at: '2024-01-20'
    },
    {
      id: 3,
      name: '数据分析平台',
      description: '构建企业级数据分析和可视化平台',
      status: 'completed',
      priority: 'high',
      progress: 100,
      manager: 'wang',
      start_date: '2023-10-01',
      end_date: '2024-03-31',
      budget: 600000,
      actual_cost: 550000,
      member_count: 10,
      total_tasks: 200,
      completed_tasks: 200,
      active_tasks: 0,
      overdue_tasks: 0,
      created_at: '2023-09-15'
    },
    {
      id: 4,
      name: '客户关系管理系统',
      description: '开发CRM系统，提升客户管理效率',
      status: 'pending',
      priority: 'low',
      progress: 0,
      manager: 'zhao',
      start_date: '2024-04-01',
      end_date: '2024-12-31',
      budget: 400000,
      actual_cost: 0,
      member_count: 6,
      total_tasks: 80,
      completed_tasks: 0,
      active_tasks: 0,
      overdue_tasks: 0,
      created_at: '2024-03-10'
    },
    {
      id: 5,
      name: '云服务迁移',
      description: '将现有系统迁移至云平台，提高可用性和扩展性',
      status: 'suspended',
      priority: 'high',
      progress: 30,
      manager: 'zhang',
      start_date: '2024-01-01',
      end_date: '2024-05-31',
      budget: 300000,
      actual_cost: 150000,
      member_count: 5,
      total_tasks: 60,
      completed_tasks: 18,
      active_tasks: 0,
      overdue_tasks: 12,
      created_at: '2023-12-20'
    },
    {
      id: 6,
      name: '企业官网改版',
      description: '重新设计企业官网，提升品牌形象',
      status: 'archived',
      priority: 'medium',
      progress: 100,
      manager: 'li',
      start_date: '2023-08-01',
      end_date: '2023-12-31',
      budget: 150000,
      actual_cost: 140000,
      member_count: 4,
      total_tasks: 40,
      completed_tasks: 40,
      active_tasks: 0,
      overdue_tasks: 0,
      created_at: '2023-07-15'
    }
  ])

  const projectData = computed(() => {
    const id = Number(projectId.value)
    return projectList.find((item) => item.id === id) || projectList[0]
  })

  const projectTeam = reactive<TeamMember[]>([
    { id: 1, name: '张三', role: '项目经理', avatar: '', status: '在线' },
    { id: 2, name: '李四', role: '前端开发', avatar: '', status: '在线' },
    { id: 3, name: '王五', role: '后端开发', avatar: '', status: '离线' },
    { id: 4, name: '赵六', role: 'UI设计师', avatar: '', status: '在线' },
    { id: 5, name: '孙七', role: '测试工程师', avatar: '', status: '在线' },
    { id: 6, name: '周八', role: '产品经理', avatar: '', status: '离线' }
  ])

  const projectMilestones = reactive<Milestone[]>([
    {
      id: 1,
      name: '需求分析',
      description: '完成项目需求调研和分析',
      date: '2024-01-20',
      completed: true
    },
    {
      id: 2,
      name: '系统设计',
      description: '完成系统架构和数据库设计',
      date: '2024-02-15',
      completed: true
    },
    {
      id: 3,
      name: '前端开发',
      description: '完成前端页面开发',
      date: '2024-04-30',
      completed: true
    },
    {
      id: 4,
      name: '后端开发',
      description: '完成后端API开发',
      date: '2024-05-15',
      completed: false
    },
    {
      id: 5,
      name: '测试验收',
      description: '完成系统测试和用户验收',
      date: '2024-06-20',
      completed: false
    },
    {
      id: 6,
      name: '项目上线',
      description: '系统正式上线运行',
      date: '2024-06-30',
      completed: false
    }
  ])

  const projectFiles = reactive<any[]>([
    { name: '项目需求文档.pdf', url: '#', size: 2048, status: 'done', uid: 1 },
    { name: '系统设计方案.docx', url: '#', size: 1024, status: 'done', uid: 2 },
    { name: '数据库设计图.png', url: '#', size: 512, status: 'done', uid: 3 },
    { name: '前端原型图.sketch', url: '#', size: 4096, status: 'done', uid: 4 }
  ])

  const getStatusType = (status: ProjectStatus) => {
    const statusMap: Record<ProjectStatus, 'info' | 'primary' | 'success' | 'warning' | 'info'> = {
      pending: 'info',
      active: 'primary',
      completed: 'success',
      suspended: 'warning',
      archived: 'info'
    }
    return statusMap[status] || 'info'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '未开始',
      active: '进行中',
      completed: '已完成',
      suspended: '已暂停',
      archived: '已归档'
    }
    return statusMap[status] || status
  }

  const getPriorityType = (priority: ProjectPriority) => {
    const priorityMap: Record<ProjectPriority, 'danger' | 'warning' | 'success'> = {
      high: 'danger',
      medium: 'warning',
      low: 'success'
    }
    return priorityMap[priority] || 'info'
  }

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低'
    }
    return priorityMap[priority] || priority
  }

  const getManagerName = (manager: string) => {
    const managerMap: Record<string, string> = {
      zhang: '张三',
      li: '李四',
      wang: '王五',
      zhao: '赵六'
    }
    return managerMap[manager] || manager
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#F56C6C'
    if (progress < 70) return '#E6A23C'
    return '#67C23A'
  }

  const getBudgetColor = (actual: number, budget: number) => {
    const percentage = (actual / budget) * 100
    if (percentage > 100) return '#F56C6C'
    if (percentage > 80) return '#E6A23C'
    return '#67C23A'
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
  }

  const handleFilePreview = (file: any) => {
    console.log('预览文件:', file)
  }

  const handleFileRemove = (file: any) => {
    console.log('删除文件:', file)
  }

  onMounted(() => {
    if (projectId.value !== 'new') {
      console.log('加载项目详情:', projectId.value)
    }
  })
</script>
