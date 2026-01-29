<template>
  <div class="project-detail-page">
    <div v-if="loading" class="flex justify-center items-center h-96">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else-if="error" class="flex justify-center items-center h-96">
      <el-empty description="获取项目详情失败" />
    </div>
    <div v-else>
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
                <div class="text-xl font-medium text-success">{{
                  projectData.completed_tasks
                }}</div>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { User, Calendar, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { ProjectDetailResponse, ProjectStatus, ProjectPriority } from '@/types/api/project'
  import { getProjectDetail } from '@/api/project'

  defineOptions({ name: 'ProjectDetail' })

  const route = useRoute()
  const projectId = computed(() => route.params.id)
  const loading = ref(true)
  const error = ref(false)
  const projectData = ref<ProjectDetailResponse>({
    id: 0,
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    manager: '',
    start_date: '',
    end_date: '',
    budget: 0,
    actual_cost: 0,
    created_at: '',
    member_count: 0,
    total_tasks: 0,
    completed_tasks: 0,
    active_tasks: 0,
    overdue_tasks: 0
  })

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

  const projectTeam = ref<TeamMember[]>([])
  const projectMilestones = ref<Milestone[]>([])
  const projectFiles = ref<any[]>([])

  const getStatusType = (status: ProjectStatus) => {
    const statusMap: Record<string, 'info' | 'primary' | 'success' | 'warning' | 'danger'> = {
      pending: 'info',
      in_progress: 'primary',
      completed: 'success',
      on_hold: 'warning',
      cancelled: 'danger'
    }
    return statusMap[status] || 'info'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '未开始',
      in_progress: '进行中',
      completed: '已完成',
      on_hold: '已暂停',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getPriorityType = (priority: ProjectPriority) => {
    const priorityMap: Record<ProjectPriority, 'danger' | 'warning' | 'primary' | 'success'> = {
      critical: 'danger',
      high: 'warning',
      medium: 'primary',
      low: 'success'
    }
    return priorityMap[priority] || 'info'
  }

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      critical: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    }
    return priorityMap[priority] || priority
  }

  const getManagerName = (manager: string) => {
    const managerMap: Record<string, string> = {
      张三: '张三',
      李四: '李四',
      王五: '王五',
      赵六: '赵六'
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

  const formatNumber = (num: any) => {
    // 确保输入是数字类型
    let numberValue = num
    if (typeof num === 'string') {
      // 处理可能的字符串拼接问题
      if (num.includes('.')) {
        // 只保留第一个小数点
        const parts = num.split('.')
        numberValue = parseFloat(`${parts[0]}.${parts.slice(1).join('')}`)
      } else {
        numberValue = parseFloat(num)
      }
    }
    // 检查是否是有效数字
    if (isNaN(numberValue)) {
      return '0'
    }
    return numberValue.toLocaleString('zh-CN')
  }

  const handleFilePreview = (file: any) => {
    console.log('预览文件:', file)
  }

  const handleFileRemove = (file: any) => {
    console.log('删除文件:', file)
  }

  const loadProjectDetail = async () => {
    if (projectId.value !== 'new') {
      try {
        loading.value = true
        error.value = false
        const id = Number(projectId.value)
        const response = await getProjectDetail(id)
        projectData.value = response
      } catch (err) {
        console.error('获取项目详情失败:', err)
        ElMessage.error('获取项目详情失败，请稍后重试')
        error.value = true
      } finally {
        loading.value = false
      }
    }
  }

  onMounted(() => {
    loadProjectDetail()
  })
</script>
